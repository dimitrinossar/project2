module.exports = function viewHelpers(req, res, next) {
  res.locals.isLoggedIn = () => {
    return req.session.user
  }
  res.locals.isCurrentUserPage = () => {
    return req.session.user === Number(req.params.id)
  }
  next()
}
