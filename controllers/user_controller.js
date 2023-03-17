const express = require('express')
const router = express.Router()
const pool = require('../database')
const upload = require('../middlewares/upload')
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
                        INSERT INTO users (email, password, username, profile_picture)
                        VALUES ($1, $2, $3, $4)
                        RETURNING id;
                    `
          const values = [
            req.body.email,
            hash,
            req.body.email.slice(0, req.body.email.indexOf('@')),
            'https://res.cloudinary.com/doznt5vd0/image/upload/v1678968474/de7834s-6515bd40-8b2c-4dc6-a843-5ac1a95a8b55.jpg_rbx0ij.jpg',
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
  const userSql = `SELECT id, email, username, profile_picture, location, bio FROM users WHERE id = $1;`
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
  const sql = `SELECT id, username, profile_picture, location, bio FROM users WHERE id = $1;`
  pool.query(sql, [req.params.id], (err, dbRes) => {
    const user = dbRes.rows[0]
    res.render('edit_user', { user })
  })
})

router.put('/:id', upload.single('profile_picture'), (req, res) => {
  let sql = ''
  let values = []
  if (req.file.path) {
    sql = `
      UPDATE users
      SET username = $1, location = $2, bio = $3, profile_picture = $4
      WHERE id = $5;
    `
    values = [
      req.body.username,
      req.body.location,
      req.body.bio,
      req.file.path,
      req.params.id,
    ]
  } else {
    sql = `
      UPDATE users
      SET username = $1, location = $2, bio = $3
      WHERE id = $4;
    `
    values = [req.body.username, req.body.location, req.body.bio, req.params.id]
  }
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
