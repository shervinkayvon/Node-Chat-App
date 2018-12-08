const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const { generateMessage, generateLocationMessage } = require('./utils/message');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', socket => {
    console.log('New user connected');
    // socket.emit() emits an event to a single connection 
    // while io.emit() emits an event to all the connections 
    // socket.broadcast.emit() to all other user but the one that // just signed up 
    
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to this chat room!'));
    
    socket.broadcast.emit('newMessage', generateMessage('Admin', 'A new user has joined the chat room'));
    
    socket.on('createMessage', (message, callback) => {
        console.log('createMessage', message);
        
        io.emit('newMessage', generateMessage(message.from, message.text));
        callback('This is from the server');
    });
    
    socket.on('createLocationMessage', coords => {
        io.emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude));
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(port, () => {
    console.log(`Started on port ${port}`);
});