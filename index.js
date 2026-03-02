require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const app = express();
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server);

const authRouter = require('./routers/auth');
const chatsRouter = require('./routers/chats');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.userId = decoded.userId;
        next();
    });
};

app.use('/chats', authMiddleware, chatsRouter);
app.use('/auth', authRouter);

io.on('connection', (socket) => {
    console.log('A user connected with ID:', socket.id);

    socket.on('chat_message', async (data) => {
        console.log('Received message:', data);
        const { username, message } = data;
        try{
            await pool.query(
                'INSERT INTO chats (senderName, chatText, datetime) VALUES ($1, $2, $3)', 
                [username, message, new Date()]
            );
            io.emit('receive_message', data);
        } catch (err) {
            console.error('Error inserting chat message:', err);
        }
        
    });

    socket.on('disconnect', () => {
        console.log('User disconnected with ID:', socket.id);
    });

});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});

