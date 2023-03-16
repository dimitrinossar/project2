const express = require('express')
const router = express.Router()
const pool = require('../database')
const loginCheck = require('../middlewares/login_check')

router.get('/new', loginCheck, (req, res) => {
  req.flash('listingError', 'No release exists, please add it')
  res.render('new_listing')
})

router.post('/', (req, res) => {
  const checkSql = `SELECT * FROM releases WHERE catalog_number = $1;`
  pool.query(checkSql, [req.body.catalog_number], (err, checkRes) => {
    if (checkRes.rows.length === 0) {
      res.redirect('/release/new')
    } else {
      const release = checkRes.rows[0]
      const insertSql = `
                INSERT INTO listings (release_id, user_id, price, condition, info)
                VALUES ($1, $2, $3, $4, $5);
            `
      const values = [
        release.id,
        req.session.user,
        req.body.price,
        req.body.condition,
        req.body.info,
      ]
      pool.query(insertSql, values, (err, insertRes) => {
        res.redirect(`/release/${release.id}`)
      })
    }
  })
})

router.get('/:id/edit', (req, res) => {
  const sql = `SELECT id, price, condition, info FROM listings WHERE id = $1;`
  pool.query(sql, [req.params.id], (err, dbRes) => {
    const listing = dbRes.rows[0]
    res.render('edit_listing', { listing })
  })
})

router.put('/:id', (req, res) => {
  const checkSql = `SELECT user_id FROM listings WHERE id = $1;`
  pool.query(checkSql, [req.params.id], (err, checkRes) => {
    const user = checkRes.rows[0].user_id
    const insertSql = `
              UPDATE listings
              SET price = $1, condition = $2, info = $3
              WHERE id = $4    
          `
    const values = [
      req.body.price,
      req.body.condition,
      req.body.info,
      req.params.id,
    ]
    pool.query(insertSql, values, (err, insertRes) => {
      res.redirect(`/user/${user}`)
    })
  })
})

router.delete('/:id', (req, res) => {
  const checkSql = `SELECT user_id FROM listings WHERE id = $1;`
  pool.query(checkSql, [req.params.id], (err, checkRes) => {
    const user = checkRes.rows[0].user_id
    const insertSql = `DELETE FROM listings WHERE id = $1;`
    pool.query(insertSql, [req.params.id], (err, insertRes) => {
      res.redirect(`/user/${user}`)
    })
  })
})

module.exports = router
