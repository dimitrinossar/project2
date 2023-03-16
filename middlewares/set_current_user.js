const pool = require('../database')

module.exports = function setCurrentUser(req, res, next) {
  const { user } = req.session

  res.locals.currentUser = {}

  if (user) {
    const sql = `SELECT id, username FROM users WHERE id = ${user};`
    pool.query(sql, (err, dbRes) => {
      res.locals.currentUser = dbRes.rows[0]
    })
  }

  next()
}
