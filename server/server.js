const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', socket => {
    console.log('New user connected');
    
    socket.emit('newMessage', {
        from: '@shervin',
        text: 'Hey man shervin from the server',
        createdAt: 3252
    });
    
    socket.on('createMessage', newMessage => {
        console.log('createMessage', newMessage);
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(port, () => {
    console.log(`Started on port ${port}`);
});