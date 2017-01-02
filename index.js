var connect = require('connect');
var http = require("http");
var assert = require("assert");
var parseUrl = url = require('url').parse;
var parseQuery = require('querystring').parse;

var app = connect();

// NOTE: Node query parser supports arrays but not foo[bar] nesting,
// see https://github.com/ljharb/qs
var queryParser = function(req, res, next) {
  var queryString = parseUrl(req.url).query;
  console.log("pm debug queryString", queryString);
  if (queryString) {
    var query = parseQuery(queryString);
    console.log("pm debug query", query);
    req.params = Object.assign((req.params || {}), query);
  }
  next();
};

var bodyParser = function(req, res, next) {
  if (req.method == "POST" || req.method == "PUT") {
    var data = "";
    req.on("data", function(chunk) {
      data += chunk.toString();
    });
    req.on("end", function() {
      try {
        var body = JSON.parse(data);
        assert((typeof body === "object"), "JSON body must be an object");
        req.params = Object.assign((req.params || {}), body);
        next();
      } catch (e) {
        res.writeHead(400, {"Content-Type": "application/json"});
        var body = {error: {type: "invalid_json_body", message: e.message}};
        res.end(JSON.stringify(body));
      }
    });
  } else {
    next();
  }
};

var requestHandler = function(req, res) {
  res.writeHead(200, {"Content-Type": "application/json"});
  var body = {params: req.params};
  res.end(JSON.stringify(body));
};

app.use(queryParser);
app.use(bodyParser);
app.use(requestHandler);

http.createServer(app).listen(3000);
