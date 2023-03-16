const express = require('express')
const router = express.Router()
const pool = require('../database')
const loginCheck = require('../middlewares/login_check')

router.get('/new', loginCheck, (req, res) => {
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

router.get('/:id', (req, res) => {
  const sql = `SELECT * FROM listings WHERE id = $1;`
  pool.query(sql, [req.params.id], (err, dbRes) => {
    const listing = dbRes.rows[0]
    res.render('listing', { listing })
  })
})

module.exports = router
