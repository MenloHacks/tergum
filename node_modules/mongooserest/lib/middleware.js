var handleGet = require("./get");
var handlePost = require("./post");
var handlePut = require("./put");
var handleDelete = require("./delete");

module.exports = function (mongoose, options) {
  options = options || {};
  return function (req, res, next) {
    var args = req.path.split('/');
    if (args[0] == '')
      args.splice(0, 1);
    var modelName = args[0];
    var model = mongoose.models[modelName];
    if (!model) {
      for (var name in mongoose.models) {
        if (name.toLowerCase() == modelName.toLowerCase())
          model = mongoose.models[name];
      }
    }
    if (model) {
      var id = (args.length > 1) ? args[1] : null;
      if (req.method == 'GET')
        handleGet(model, id, req.query, res);
      else if (req.method == 'POST')
        handlePost(model, req.body, res);
      else if (req.method == 'PUT')
        handlePut(model, id, req.body, res);
      else if (req.method == 'DELETE')
        handleDelete(model, id, res);
      else
        next();
    } else
      next();
  };
};


