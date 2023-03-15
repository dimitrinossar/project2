module.exports = function loginCheck(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}