const express = require('express');
const router = express.Router();
const pool = require('../database');

router.get('/:title', (req, res) => {
    const sql = `SELECT * FROM RELEASES WHERE title = $1;`;
    pool.query(sql, [req.params.title], (err, dbRes) => {
        if (dbRes.rows.length === 1) {
            res.redirect(`/release/${dbRes.rows[0].id}`);
        }
        else {
            const releases = dbRes.rows;
            res.render('master', {releases});            
        }
    });
});

module.exports = router;