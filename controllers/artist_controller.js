const express = require('express')
const router = express.Router()
const pool = require('../database')

router.get('/:artist', (req, res) => {
  const sql = `SELECT DISTINCT title FROM releases WHERE artist = $1;`
  pool.query(sql, [req.params.artist], (err, dbRes) => {
    const albums = dbRes.rows
    res.render('artist', { albums })
  })
})

module.exports = router
