var util = require('util');
var google = require('gcloud');
var Writable = require('stream').Writable;

const nameFromLevel = {
  10: 'trace',
  20: 'debug',
  30: 'info',
  40: 'warn',
  50: 'error',
  60: 'fatal'
};
const mapLevelToSeverity = {
  trace: 'DEBUG',
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARNING',
  error: 'ERROR',
  fatal: 'ALERT'
};

util.inherits(BunyanStackDriver, Writable);
function BunyanStackDriver(options, error) {
  Writable.call(this, {objectMode: true});

  options = options || {};

  var gopts = {};

  if (options.projectId) {
    gopts.projectId = options.projectId;
  } else if (process.env.GCLOUD_PROJECT) {
    // Noop, gcloud will pick this up.
  } else {
    throw new Error('option "projectId" or env variable GCLOUD_PROJECT required');
  }

  var logName = options.logName || 'default';

  this.error = error || function() {};

  // ms. GCP's default limit is 20 RPS.
  this.writeInterval = "writeInterval" in options ? options.writeInterval : 500;

  // object(MonitoredResource)
  // https://cloud.google.com/logging/docs/api/ref_v2beta1/rest/v2beta1/MonitoredResource
  if (options.resource) {
    if (options.resource.type) {
      options.resource.labels = options.resource.labels || {}; // required
      this.resource = options.resource;
    } else {
      throw new Error('Property "type" required when specifying a resource');
    }
  } else {
    this.resource = {
      type: 'global',
      labels: {}
    };
  }
  
  // If not provided, gcloud will attempt automatic auth.
  if (options.keyFilename) {
    gopts.keyFilename = options.authJSON;
  }

  var loggingClient = google(gopts).logging();

  this.log = loggingClient.log(logName);

  this.entryQueue = [];
}

var once = true;

BunyanStackDriver.prototype._write = function write(record, encoding, callback) {
  var timestamp;
  if (typeof record === 'string') {
    if (once) {
      once = false;
      console.warn("BunyanStackDriver: use 'streams: [ type: \"raw\", stream: new BunyanStackDriver(...) ]' for better performance.");
    }
    record = JSON.parse(record);
    timestamp = new Date(record.time);
  } else {
    timestamp = record.time;
  }

  strictJSON(record);

  var entry = this.log.entry(this.resource, record);

  // There are no public APIs for this yet:
  // https://github.com/GoogleCloudPlatform/gcloud-node/issues/1348
  entry.timestamp = timestamp;
  entry.severity = mapLevelToSeverity[nameFromLevel[record.level]] || 'DEFAULT';

  this.entryQueue.push(entry);

  if (!this.writeQueued) {
    this.writeQueued = true;
    setTimeout(this._writeToServer.bind(this), this.writeInterval);
  }

  callback();
};

/**
 * Convert JS standard objects to strings, remove undefined
 * https://github.com/GoogleCloudPlatform/gcloud-node/issues/1353
 * https://github.com/GoogleCloudPlatform/gcloud-node/issues/1352
 * Not cycle-safe.
 * https://github.com/GoogleCloudPlatform/gcloud-node/issues/1354
 */
function strictJSON(o) {
  for (var k in o) {
    var v = o[k];
    if (v instanceof Date || v instanceof Error || v instanceof RegExp) {
      o[k] = v.toJSON();
    } else if (v === undefined) {
      delete o[k];
    } else if (typeof v === "object") {
      strictJSON(v);
    }
  }
}

BunyanStackDriver.prototype._writeToServer = function () {
  var self = this;

  this.writeQueued = false;

  // Atomically get the entries to send and clear the queue
  var entries = this.entryQueue.splice(0);

  // https://github.com/GoogleCloudPlatform/gcloud-node/issues/1349
  var options = {
  //  partialSuccess: true
  };

  this.log.write(entries, options, function (err, response) {
    if (err) return self.error(err);
  });
};

module.exports = BunyanStackDriver;
