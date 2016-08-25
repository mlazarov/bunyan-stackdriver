var bunyan  = require("bunyan"),
    BunyanStackDriver = require('bunyan-stackdriver'),
    log;

log = bunyan.createLogger({
    name: "myApp",
    streams: [{
      type: "raw",
      stream: new BunyanStackDriver({
        projectId: "your_project_id"
      })
    }],
    level: "error"
});

log.error("hello bunyan user");
