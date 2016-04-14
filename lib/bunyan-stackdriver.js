var util = require('util'),
google = require('googleapis');

var glogging = google.logging("v2beta1");

const loggingScopes = [
  //'https://www.googleapis.com/auth/logging.read',
  'https://www.googleapis.com/auth/logging.write',
  //'https://www.googleapis.com/auth/logging.admin',
  //'https://www.googleapis.com/auth/cloud-platform'
];

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
  fatal: 'EMERGENCY'
}

function getNow() {
    var d = new Date();
    return JSON.parse(JSON.stringify(d).replace('Z', '000Z'));
}

function BunyanStackDriver(options, error) {
  options = options || {};
  if (!options.project) {
    throw new Error('Project cannot be null');
  } else {

    this.customFormatter = options.customFormatter;
    this.project_id      = options.project;
    this.log_id          = options.log_id || 'default';
    this.error           = error               || function() {};

    // https://cloud.google.com/logging/docs/api/ref_v2beta1/rest/v2beta1/LogEntry#LogSeverity
    if (options.severity) {
      this.severity = options.severity || 'DEFAULT';
    }

    // object(MonitoredResource)
    // https://cloud.google.com/logging/docs/api/ref_v2beta1/rest/v2beta1/MonitoredResource
    this.resource = options.resource || {type: 'global'};

  }

  this.getLoggingClient = function (callback) {
    google.auth.fromJSON(options.authJSON, function (err, authClient){
      if (err) {
          return callback(err);
      }
      if (authClient.createScopedRequired && authClient.createScopedRequired()) {
          authClient = authClient.createScoped(loggingScopes);
      }
      callback(null, authClient);
    });
  }
}

BunyanStackDriver.prototype.write = function write(record, callback) {
  var self = this,
  levelName,
  message;

  if (typeof record === 'string') {
    record = JSON.parse(record);
  }

  levelName = nameFromLevel[record.level];

  try {

    if(self.customFormatter){
      message = self.customFormatter(record, levelName);
    }else if(typeof(record) == "string"){
      message = { text: util.format('[%s] %s', levelName.toUpperCase(), record.msg)}
    }else{
      message = record;
    }
  } catch(err) {
    return self.error(err);
  }

  self.getLoggingClient(function (err, authClient) {
    var params = {
      auth: authClient,
      resource: {
        //logName: "projects/" + self.project_id + "/logs/" + self.log_id,
        //resource: self.resource,
        //labels: {},
        entries: [{
          logName: "projects/" + self.project_id + "/logs/" + self.log_id,
          resource: self.resource,
          //timestamp: getNow(),
          severity: mapLevelToSeverity[levelName] || 'DEFAULT',
          //insertId,
          //httpRequest,
          //labels,
          //operation,
          [(message instanceof Object)?'jsonPayload':'textPayload']: message
        }],
        partialSuccess: true
      }
    };

    glogging.entries.write(params, function(err,data){
      if(err) return self.error(err);
    });
  });
};

module.exports = BunyanStackDriver;
