module.exports = function handleDelete(model, id, res) {
  if (id) {
    model.findOneAndRemove({_id: id}, function (err) {
      if (err)
        res.status(500).send(err);
      else
        res.send(id);
    });
  } else {
    res.status(500).send('Missing ID');
  }
};