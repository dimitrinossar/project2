const express = require('express')
const router = express.Router()
const pool = require('../database')
const upload = require('../middlewares/upload')
const loginCheck = require('../middlewares/login_check')

router.get('/new', loginCheck, (req, res) => {
  res.render('new_release', {
    listingMessage: req.flash('listingError'),
    releaseMessage: req.flash('releaseError'),
  })
})

router.post('/', upload.single('album_art'), (req, res) => {
  const checkSql = `SELECT * FROM releases WHERE catalog_number = $1;`
  pool.query(checkSql, [req.body.catalog_number], (err, checkRes) => {
    // stops duplication of releases
    if (checkRes.rows.length !== 0) {
      req.flash('releaseError', 'Release already exists')
      res.redirect('/release/new')
    } else {
      const insertSql = `
                INSERT INTO releases (title, artist, genre, catalog_number, album_art)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id;
            `
      const check =
        req.file.path ||
        'https://res.cloudinary.com/doznt5vd0/image/upload/v1678968543/default_album_300_g4_xaz4xp.png'
      const values = [
        req.body.title,
        req.body.artist,
        req.body.genre,
        req.body.catalog_number,
        check,
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

router.put('/:id', loginCheck, upload.single('album_art'), (req, res) => {
  const sql = `
            UPDATE releases
            SET title = $1, artist = $2, genre = $3, catalog_number = $4, album_art = $5
            WHERE id = $6;
        `
  const values = [
    req.body.title,
    req.body.artist,
    req.body.genre,
    req.body.catalog_number,
    req.path.file,
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
