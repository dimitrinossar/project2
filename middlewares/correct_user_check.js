module.exports = function correctUserCheck(req, res, next) {
  if (req.session.user === req.params.id) {
    return next()
  }
  res.send('incorrect user')
}
