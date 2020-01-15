module.exports = function handlePut(model, id, data, res) {
  if (!data || typeof data == 'string')
    res.status(500).send('Missing data, please check that you have a body-parser');
  else {
    delete data._id;
    if (id) {
      model.findOne({_id: id}, function (err, one) {
        if (err)
          res.status(500).send(err);
        else {
          for (var field in data)
            one[field] = data[field];
          one.save(function (err, data) {
            if (err)
              res.status(500).send(err);
            else
              res.send(data);
          });
        }
      });
    } else {
      res.status(500).send('Missing ID');
    }
  }
};