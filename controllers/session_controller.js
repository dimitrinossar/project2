const express = require('express');
const router = express.Router();
const pool = require('../database');
const bcrypt = require('bcrypt');

router.post('/', (req, res) => {
    const sql = `SELECT id, pw FROM users WHERE username = $1;`;
    pool.query(sql, [req.body.username], (err, dbRes) => {
        // checks for username
        if (dbRes.rows.length === 0) {
            res.send('no user found');
        }
        else {
            const user = dbRes.rows[0];
            bcrypt.compare(req.body.password, user.pw, (err, result) => {
                if (result) {
                    req.session.user = user.id;
                    res.redirect('/');
                }
                // passwords do not match
                else {
                    res.send('incorrect password');
                }
            });
        }
    });
});

router.delete('/', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
})

module.exports = router;