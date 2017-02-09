# bunyan-stackdriver

**Bunyan stream for StackDriver (Google Cloud Logging API) integration**

## Installation

Install bunyan and bunyan-stackdriver...

```bash
npm install bunyan bunyan-stackdriver
```

## Setup

1. Enable [Google Cloud Logging API](https://console.cloud.google.com/apis/api/logging.googleapis.com/overview)
in your Google Developer Console.
1. Start using `bunyan-stackdriver` to create log your messages

## Basic usage

```javascript
var bunyan  = require("bunyan"),
    BunyanStackDriver = require("bunyan-stackdriver"),
    log;

log = bunyan.createLogger({
    name: "myApp",
    streams: [{
      type: "raw", // faster; makes Bunyan send objects instead of stringifying messages
      stream: new BunyanStackDriver({
        projectId: "your_project_id"
      })
    }],
    level: "error"
});

log.error("hello bunyan user");
```

## Full options

```javascript
new BunyanStackDriver({
  // The path to your key file:
  keyFilename: "/path/to/keyfile.json",
  // Or the contents of the key file:
  credentials: require('./path/to/keyfile.json'),
  logName: "logname",
  projectId: "project-id",
  writeInterval: 500, // ms
  resource: {
    type: "resource_type",
    labels: {key1: value1}
  }
}, function errorCallback(err) { console.log(err); });
```

* If you are running on Google Cloud Platform, authentication will be taken
care of automatically. If you're running elsewhere, or wish to provide
alternative authentication, you can specify the `keyFilename` pointing to a
service account JSON key.

* logName. Must be less than 512 characters and include only alphanumeric
characters, forward-slash, underscore, hyphen and period.

* projectId. The id of the project. This can be omitted if the environment
variable "GCLOUD_PROJECT" is set.

* writeInterval. Specifies the maximum write frequency. Messages will be
batched between writes to avoid exceeding API rate limits. (The default GCP
limit is 20 RPS. The default setting for BunyanStackDriver is 500 ms.)

* resource. See https://cloud.google.com/logging/docs/api/ref_v2beta1/rest/v2beta1/MonitoredResource.

* errorCallback. Will report errors during the logging process itself.

## Stackdriver Error Reporting

When errors with stack traces are logged - `bunyan.error(new Error('message'))` - these can automatically be captured by the [Error Reporting](https://cloud.google.com/error-reporting/) interface in Google Cloud Platform. To do so some additional configuration is required as per [Stackdriver Formatting Error Messages](https://cloud.google.com/error-reporting/docs/formatting-error-messages)

When logging, a _service context_ is required. This can be added on a per log basis or configured for all logs during logger creation like so:

```
const logger = bunyan.createLogger({
    name: 'Example',
    serializers: ...
    streams: ...,
    serviceContext: {
        service: 'example',
        version: 'x.x.x'
    }
});
```

## Links

[Stackdriver Logging - Method entries.write](https://cloud.google.com/logging/docs/api/ref_v2beta1/rest/v2beta1/entries/write)

## License

MIT License

Copyright (C) 2016 Martin Lazarov

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
