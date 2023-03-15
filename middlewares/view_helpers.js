module.exports = function viewHelpers(req, res, next) {
    res.locals.isLoggedIn = () => {
        return req.session.user;
    }
    next();
}