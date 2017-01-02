var connect = require("connect");
var http = require("http");
var assert = require("assert");
var parseUrl = url = require("url").parse;
var parseQuery = require("querystring").parse;
var fs = require("fs");
var extname = require("path").extname;
var swagger = require("./swagger");

var app = connect();

// NOTE: Node query parser supports arrays but not foo[bar] nesting,
// see https://github.com/ljharb/qs
var queryParser = function(req, res, next) {
  var queryString = parseUrl(req.url).query;
  if (queryString) {
    var query = parseQuery(queryString);
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

var serveStatic = function(baseDir) {
  return function(req, res, next) {
    if (req.method == "GET") {
      var path = parseUrl(req.url).path,
          filePath = baseDir + path,
          // NOTE: could use https://www.npmjs.com/package/mime
          mimeTypes = {
            ".html": "text/html",
            ".jpeg": "image/jpeg",
            ".jpg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".js": "text/javascript",
            ".css": "text/css"
          };
      fs.stat(filePath, function(err, stat) {
        if (!err && stat.isFile()) {
            fs.readFile(filePath, function(err,data) {
            var mimeType = mimeTypes[extname(path)];
            res.writeHead(200, {"Content-Type": mimeType});
            res.end(data);
          });
        } else {
          next();
        }
      });
    } else {
      next();
    }
  };
};

var router = function(routes) {
  var routesMap = routes.reduce(function(map, route) {
    var _method = route.method.toLowerCase();
    map[_method] = map[_method] || [];
    map[_method].push(route);
    return map;
  }, {});
  return function(req, res, next) {
    var path = parseUrl(req.url).path;
    var route = (routesMap[req.method.toLowerCase()] || []).find(function(r) {
      return r.path === path;
    });
    if (route) {
      route.handler(req, res, next);
    } else {
      res.writeHead(404);
      res.end();
    }
  };
};

app.use(queryParser);
app.use(bodyParser);
app.use(serveStatic("resources/public"));
app.use(router(swagger.routes));

http.createServer(app).listen(3000);
