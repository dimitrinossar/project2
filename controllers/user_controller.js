const express = require('express')
const router = express.Router()
const pool = require('../database')
const bcrypt = require('bcrypt')

router.post('/', (req, res) => {
  const checkSql = `SELECT * FROM users WHERE email = $1;`
  pool.query(checkSql, [req.body.email], (err, checkRes) => {
    // checks if there is an account with the same email
    if (checkRes.rows.length !== 0) {
      req.flash('signUpError', 'email taken')
      res.redirect('/login')
    } else {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
          const insertSql = `
                        INSERT INTO users (email, pw, username)
                        VALUES ($1, $2, $3)
                        RETURNING id;
                    `
          const values = [
            req.body.email,
            hash,
            req.body.email.slice(0, req.body.email.indexOf('@')),
          ]
          pool.query(insertSql, values, (err, insertRes) => {
            req.session.user = insertRes.rows[0].id
            res.redirect('/')
          })
        })
      })
    }
  })
})

router.get('/:id', (req, res) => {
  const userSql = `SELECT id, email, username, location, bio FROM users WHERE id = $1;`
  pool.query(userSql, [req.params.id], (err, userRes) => {
    const user = userRes.rows[0]
    const listingsSql = `
              SELECT releases.title, releases.artist, releases.catalog_number, listings.id, listings.price, listings.condition, listings.info
              FROM releases INNER JOIN listings
              ON releases.id=listings.release_id
              AND listings.user_id = $1;
          `
    pool.query(listingsSql, [user.id], (err, listingsRes) => {
      const listings = listingsRes.rows
      res.render('user', { user, listings })
    })
  })
})

router.get('/:id/edit', (req, res) => {
  const sql = `SELECT id, username, location, bio FROM users WHERE id = $1;`
  pool.query(sql, [req.params.id], (err, dbRes) => {
    const user = dbRes.rows[0]
    res.render('edit_user', { user })
  })
})

router.put('/:id', (req, res) => {
  const sql = `
        UPDATE users
        SET username = $1, location = $2, bio = $3
        WHERE id = $4;
    `
  const values = [
    req.body.username,
    req.body.location,
    req.body.bio,
    req.params.id,
  ]
  pool.query(sql, values, (err, dbRes) => {
    res.redirect(`/user/${req.params.id}`)
  })
})

router.delete('/:id', (req, res) => {
  const sql = `DELETE FROM users WHERE id = $1;`
  pool.query(sql, [req.params.id], (err, dbRes) => {
    res.redirect('/')
  })
})

module.exports = router
