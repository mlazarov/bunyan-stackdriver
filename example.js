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
