var socket = io();

socket.on('connect', function () {
    console.log('Connected to server');
    
    socket.emit('createMessage', {
        to: '@kayvon',
        text: 'Hey it shervin from the browser'
    });
});

socket.on('disconnect', function () {
    console.log('Disconnected from server');
});

socket.on('newMessage', function (message) {
    console.log('New message: ', message);
});