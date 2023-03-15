const express = require('express');
const router = express.Router();
const pool = require('../database');
const bcrypt = require('bcrypt');

router.post('/', (req, res) => {
    const checkSql = `SELECT * FROM users WHERE email = $1;`;
    pool.query(checkSql, [req.body.email], (err, checkRes) => {
        // checks if there is an account with the same email
        if (checkRes.rows.length !== 0) {
            res.send('email taken');
            return;
        }
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.password, salt, (err, hash) => {
                const insertSql = `
                    INSERT INTO users (email, pw, username)
                    VALUES ($1, $2, $3)
                    RETURNING id;
                `;
                const values = [
                    req.body.email,
                    hash,
                    req.body.email.slice(0, req.body.email.indexOf('@'))
                ];
                pool.query(insertSql, values, (err, insertRes) => {
                    req.session.user = insertRes.rows[0].id;
                    res.redirect('/');
                })
            });
        });
    });
});

module.exports = router;