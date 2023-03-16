const express = require('express')
const router = express.Router()
const pool = require('../database')

router.get('/:artist', (req, res) => {
  const sql = `SELECT id, title, catalog_number FROM releases WHERE artist = $1;`
  pool.query(sql, [req.params.artist], (err, dbRes) => {
    const releases = dbRes.rows
    res.render('artist', { releases })
  })
})

module.exports = router
