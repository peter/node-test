var asyncFn1 = function(callback) {
  console.log("asyncFn1 executing");
  setTimeout(callback, 500)
};

var asyncFn2 = function(callback) {
  console.log("asyncFn2 executing");
  setTimeout(callback, 500)
};

// NOTE: see https://twitter.com/hult/status/811891761127845888
// for a discussion on whether to wrap next in a setTimeout(next, 0)
var asyncSequence = function(fns, callback) {
  var index = 0;
  var next = function() {
    var fn = fns[index++]
    if (fn) {
      fn(next);
    } else {
      callback();
    }
  }
  next();
};

asyncSequence([asyncFn1, asyncFn2], function() {
  console.log("asyncSequence done");
});
