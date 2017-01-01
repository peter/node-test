var http = require("http");

function parseBody(req, callback) {
  if (req.method == "POST" || req.method == "PUT") {
    var data = "";
    req.on("data", function(chunk) {
      data += chunk.toString();
    });
    req.on("end", function() {
      try {
        var body = JSON.parse(data);
        callback(null, body);
      } catch (e) {
        callback(e);
      }
    });
  } else {
    callback(null, null);
  }
};

var server = http.createServer(function(req, res) {
  parseBody(req, function(err, body) {
    if (!err) {
      res.writeHead(200, {"Content-Type": "application/json"});
      var body = {body: body};
      res.end(JSON.stringify(body));
    } else {
      res.writeHead(422, {"Content-Type": "application/json"});
      var body = {error: {type: "invalid_json_body"}};
      res.end(JSON.stringify(body));
    }
  });
});

server.listen(3000);
