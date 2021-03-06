var connect = require('connect');
var http = require("http");

var app = connect();

var bodyParser = function(req, res, next) {
  if (req.method == "POST" || req.method == "PUT") {
    var data = "";
    req.on("data", function(chunk) {
      data += chunk.toString();
    });
    req.on("end", function() {
      try {
        var body = JSON.parse(data);
        req.params = Object.assign((req.params || {}), body);
        next();
      } catch (e) {
        res.writeHead(400, {"Content-Type": "application/json"});
        var body = {error: {type: "invalid_json_body"}};
        res.end(JSON.stringify(body));
      }
    });
  } else {
    next();
  }
};

app.use(bodyParser);

app.use(function(req, res) {
  res.writeHead(200, {"Content-Type": "application/json"});
  var body = {body: body};
  res.end(JSON.stringify(body));

});

http.createServer(app).listen(3000);
