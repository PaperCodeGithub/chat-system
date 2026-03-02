const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const chats = await pool.query('SELECT * FROM chats');
        res.json(chats.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', async (req, res) => {
    const {senderName, chatText} = req.body;   
    const datetime = new Date();
    try {
        const newChat = await pool.query('INSERT INTO chats (senderName, chatText, datetime) VALUES ($1, $2, $3) RETURNING *', [senderName, chatText, datetime]);
        res.json(newChat.rows[0]);
    }catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;