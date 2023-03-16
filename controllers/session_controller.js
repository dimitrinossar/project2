const express = require('express')
const router = express.Router()
const pool = require('../database')
const bcrypt = require('bcrypt')

router.post('/', (req, res) => {
  const sql = `SELECT id, pw FROM users WHERE username = $1;`
  pool.query(sql, [req.body.username], (err, dbRes) => {
    // checks for username
    if (dbRes.rows.length === 0) {
      req.flash('loginError', 'no user found')
      res.redirect('/login')
    } else {
      const user = dbRes.rows[0]
      bcrypt.compare(req.body.password, user.pw, (err, result) => {
        if (result) {
          req.session.user = user.id
          res.redirect('/')
        }
        // passwords do not match
        else {
          req.flash('loginError', 'incorrect password')
          res.redirect('/login')
        }
      })
    }
  })
})

router.delete('/', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/')
  })
})

module.exports = router
