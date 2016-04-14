# bunyan-stackdriver

**Bunyan stream for StackDriver (Google Cloud Logging API) integration**

## Installation

First install bunyan...

```bash
npm install bunyan
```

Then install bunyan-stackdriver

```bash
npm install bunyan-stackdriver
```

## Setup

1. Enable [Google Cloud Logging API](https://console.cloud.google.com/apis/api/logging.googleapis.com/overview) in your Google Developer Console.
2. [Create a new Client ID](https://console.cloud.google.com/apis/credentials) for a Service Account (JSON Key) and download it.
3. Start using `bunyan-stackdriver` to create log your messages

## Basic usage

```javascript
var bunyan  = require("bunyan"),
    BunyanStackDriver = require('bunyan-stackdriver'),
    log;

log = bunyan.createLogger({
    name: "myApp",
    stream: new BunyanStackDriver({
      authJSON: require("./your-JSON-key.json"),
      project: "your_project_id",
      log_id: "default"
    }),
    level: "error"
});

log.error("hello bunyan user");
```

You can also pass an optional error handler.

```javascript
new BunyanStackDriver({
  authJSON: require("./your-JSON-key.json"),
  project: "your_project_id",
  log_id: "default"
}, function(error){
  console.log(error);
});
```

##Custom Formatters

By default the logs are formatted like so: `[LOG_LEVEL] message`, unless you specify a `customFormatter` function.

```javascript
log = bunyan.createLogger({
  name: "myApp",
  stream: new BunyanStackDriver({
    authJSON: require("./your-JSON-key.json"),
    project: "your_project_id",
    log_id: "default"
    customFormatter: function(record, levelName){
      return {text: "[" + levelName + "] " + record.msg }
    }
  }),
  level: "error"
});
```

## Links

[Stackdriver Logging - Method entries.write](https://cloud.google.com/logging/docs/api/ref_v2beta1/rest/v2beta1/entries/write)

[Google Cloud Logging API beta nodejs client source code](https://github.com/google/google-api-nodejs-client/blob/master/apis/logging/v2beta1.js)


## License

MIT License

Copyright (C) 2016 Martin Lazarov

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
