const pool = require('../database');

module.exports = function setCurrentUser(req, res, next) {
    const {user} = req.session;

    res.locals.user = {};

    if (user) {
        const sql = `SELECT id, username FROM users WHERE id = ${user};`;
        pool.query(sql, (err, dbRes) => {
            res.locals.user = dbRes.rows[0];
        });
    }

    next();
}