const express = require('express');
const router = express.Router();
const pool = require('../database');
const loginCheck = require('../middlewares/login_check');

router.get('/new', loginCheck, (req, res) => {
    res.render('new_release');
});

router.post('/', (req, res) => {
    const checkSql = `SELECT FROM releases WHERE catalog_number = $1;`;
    pool.query(checkSql, [req.body.catalog_number], (err, checkRes) => {
        // stops duplication of releases
        if (checkRes.rows.length !== 0) {
            res.send('Release already exists');
        }
        else {
            const insertSql = `
                INSERT INTO releases (title, artist, genre, catalog_number)
                VALUES ($1, $2, $3, $4)
                RETURNING id;
            `;
            const values = [
                req.body.title,
                req.body.artist,
                req.body.genre,
                req.body.catalog_number
            ];
            pool.query(insertSql, values, (err, insertRes) => {
                res.redirect(`/release/${insertRes.rows[0].id}`);
            });
        }
    });
});

module.exports = router;