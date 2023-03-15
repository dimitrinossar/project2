const express = require('express');
const router = express.Router();
const pool = require('../database');

router.get('/:title', (req, res) => {
    const sql = `SELECT * FROM RELEASES WHERE title = $1;`;
    pool.query(sql, [req.params.title], (err, dbRes) => {
        const releases = dbRes.rows;
        res.render('master', {releases});
    });
});

module.exports = router;