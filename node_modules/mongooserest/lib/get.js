module.exports = function handleGet(model, id, params, res) {
  if (id == 'count') {
    model.count(function (err, count) {
      if (err)
        res.status(500).send(err);
      else
        res.send({count: count});
    });
  } else if (id == 'schema') {
    var schema = {};
    var treeCopy = JSON.parse(JSON.stringify(model.schema.tree, function (key, value) {
      if (typeof value == 'function')
        return value.name;
      else
        return value;
    }));
    delete treeCopy.__v;
    for (var key in treeCopy) {
      if (!model.schema.paths.hasOwnProperty(key))
        delete treeCopy[key];
    }
    res.send(treeCopy);
  } else if (!id) {
    params = params || {};
    params.query = params.query ? JSON.parse(params.query) : {};
    var query = model.find(params.query);
    if (params.skip)
      query.skip(parseInt(params.skip, 10));
    if (params.limit)
      query.limit(parseInt(params.limit, 10));
    if (params.sort)
      query.sort(params.sort.replace(/,/g, ' '));
    if (params.select)
      query.select(params.select.replace(/,/g, ' '));
    else
      query.select('-__v');
    query.exec(function (err, list) {
      if (err)
        res.status(500).send(err);
      else
        res.send(list);
    });
  } else {
    model.findOne({_id: id}).select('-__v').exec(function (err, one) {
      if (err)
        res.status(500).send(err);
      else
        res.send(one);
    });
  }
};
