module.exports = function handlePost(model, data, res) {
  if (!data || typeof data == 'string')
    res.status(500).send('Missing data, please check that you have a body-parser');
  else {
    var m = new model(data);
    m.save(function (err, data) {
      if (err)
        res.status(500).send(err);
      else
        res.send(data);
    });
  }
};