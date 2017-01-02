var dirname = require("path").dirname,
    basename = require("path").basename;

var swagger = {
  swagger: "2.0",
  info: {
    title: "Swagger based JSON REST API",
    description: "An example Node.js REST API based on a Swagger specification",
    version: "1.0"
  },
  basePath: "/v1",
  produces: [
      "application/json"
  ],
  paths: {
    "/": {
      get: {
        tags: ["api docs"],
        summary: "Swagger API Documentation HTML page",
        "x-handler": "home/index",
        "x-api-prefix": false,
        "x-auth-required": false,
        responses: {
          301: {
            description: "Redirect to HTML page with Swagger API docs"
          }
        }
      }
    },
    "/swagger.json": {
      get: {
        tags: ["api docs"],
        summary: "Swagger API JSON specification",
        "x-handler": "swagger/index",
        "x-auth-required": false,
        responses: {
          200: {
            description: "Swagger JSON API specification"
          }
        }
      }
    }
  }
};

var routes = Object.keys(swagger.paths).map(function(path) {
  var methods = swagger.paths[path];
  return Object.keys(methods).map(function(m) {
    var endpoint = methods[m],
        handlerPath = endpoint["x-handler"],
        controllerPath = ("controllers/" + dirname(handlerPath)),
        controller = require(controllerPath),
        handler = controller[basename(handlerPath)];
    return {
      path: (endpoint["x-api-prefix"] === false ? path : (swagger.basePath + path)),
      method: m,
      handler: handler,
      swagger: endpoint
    };
  });
}).reduce(function(a, b) { return a.concat(b); }, []);

module.exports = {
  swagger: swagger,
  routes: routes
};
