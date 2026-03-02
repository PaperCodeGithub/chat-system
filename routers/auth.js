const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        
        if (user.rows.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *', [username, hashedPassword]);
        
        const token = jwt.sign(
            {userId: newUser.rows[0].id},
            process.env.JWT_SECRET,
            {expiresIn: '48h'}
        )
        
        res.json({token});
    }catch (err) {
        console.error(err);
        res.status(err.code || 500).json({ message: err.message });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        
        const token = jwt.sign(
            {userId: user.rows[0].id},
            process.env.JWT_SECRET,
            {expiresIn: '48h'}
        )
        
        res.json({token});
    }catch (err) {
        console.error(err);
        res.status(err.code || 500).json({ message: err.message });
    }
});

router.get('/me', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        try {
            const user = await pool.query('SELECT id, username FROM users WHERE id = $1', [decoded.userId]);
            if (user.rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(user.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });
});

module.exports = router;