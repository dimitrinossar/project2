const express = require('express')
const router = express.Router()
const pool = require('../database')
const loginCheck = require('../middlewares/login_check')

router.get('/new', loginCheck, (req, res) => {
  res.render('new_release', { releaseMessage: req.flash('listingError') })
})

router.post('/', (req, res) => {
  const checkSql = `SELECT * FROM releases WHERE catalog_number = $1;`
  pool.query(checkSql, [req.body.catalog_number], (err, checkRes) => {
    // stops duplication of releases
    if (checkRes.rows.length !== 0) {
      res.send('Release already exists')
    } else {
      const insertSql = `
                INSERT INTO releases (title, artist, genre, catalog_number)
                VALUES ($1, $2, $3, $4)
                RETURNING id;
            `
      const values = [
        req.body.title,
        req.body.artist,
        req.body.genre,
        req.body.catalog_number,
      ]
      pool.query(insertSql, values, (err, insertRes) => {
        res.redirect(`/release/${insertRes.rows[0].id}`)
      })
    }
  })
})

router.get('/:id', (req, res) => {
  const releaseSql = `SELECT * FROM releases WHERE id = $1;`
  pool.query(releaseSql, [req.params.id], (err, releaseRes) => {
    const release = releaseRes.rows[0]
    const listingsSql = `
              SELECT users.username, users.location, listings.price, listings.condition, listings.info, listings.user_id
              FROM listings INNER JOIN users
              ON listings.release_id = $1
              AND listings.user_id = users.id;
          `
    pool.query(listingsSql, [release.id], (err, listingsRes) => {
      const listings = listingsRes.rows
      res.render('release', { release, listings })
    })
  })
})

router.get('/:id/edit', loginCheck, (req, res) => {
  const sql = `SELECT * FROM releases WHERE id = $1;`
  pool.query(sql, [req.params.id], (err, dbRes) => {
    const release = dbRes.rows[0]
    res.render('edit_release', { release })
  })
})

router.put('/:id', loginCheck, (req, res) => {
  const sql = `
        UPDATE releases
        SET title = $1, artist = $2, genre = $3, catalog_number = $4
        WHERE id = $5;
    `
  const values = [
    req.body.title,
    req.body.artist,
    req.body.genre,
    req.body.catalog_number,
    req.params.id,
  ]
  pool.query(sql, values, (err, dbRes) => {
    res.redirect(`/release/${req.params.id}`)
  })
})

router.delete('/:id', loginCheck, (req, res) => {
  const sql = `DELETE FROM releases WHERE id = $1;`
  pool.query(sql, [req.params.id], (err, dbRes) => {
    res.redirect('/')
  })
})

module.exports = router
