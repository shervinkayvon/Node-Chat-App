const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const moment = require('moment');

const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const users = new Users();

app.use(express.static(publicPath));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/ChatApp', { useNewUrlParser: true }, err => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to mongodb');
    }
});

const chatSchema = mongoose.Schema({
    name: String,
    message: String,
    url: String,
    createdAt: Date
});

io.on('connection', socket => {
    // socket.emit() emits an event to a single connection 
    // while io.emit() emits an event to all the connections 
    // socket.broadcast.emit() to all other user but the one that // just signed up 

    socket.on('join', (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Name and room name are required');
        }
        
        const Chat = mongoose.model(params.room, chatSchema);
        Chat.find({}, (err, docs) => {
            if (err) throw err;
        
            // io.to(params.room).emit('oldMessages', docs);
            // socket.emit('oldLocationMessages', docs);
            socket.emit('oldMessages', docs);
        });
        
        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);
        
        io.to(params.room).emit('updateUserList', users.getUserList(params.room))
        
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to this chat room!'));
        
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined `));
        
        callback();
    });
    
    socket.on('createMessage', (message, callback) => {
        const user = users.getUser(socket.id);
        const Chat = mongoose.model(user.room, chatSchema);
        
        if (user && isRealString(message.text)) {
            const newMessage = new Chat({ name: user.name, message: message.text, createdAt: moment().valueOf() });
            
            newMessage.save(err => {
                if (err) throw err;
                
                io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
            });
        }
        
        callback();
    });
    
    socket.on('createLocationMessage', coords => {
        const user = users.getUser(socket.id);
        const Chat = mongoose.model(user.room, chatSchema);
        
        if (user && coords) {
            const newMessage = new Chat({ name: user.name, url: `https://www.google.com/maps/?q=${coords.latitude},${coords.longitude}`, createdAt: moment().valueOf() });
            
            
            newMessage.save(err => {
                if (err) throw err;
            
                io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
            });
        }
    });
    
    socket.on('disconnect', () => {
        const user = users.removeUser(socket.id)
        
        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left`));
        }
    });
});

server.listen(port, () => {
    console.log(`Started on port ${port}`);
});