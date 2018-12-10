[
    {
        id: 'ghdhd8d8',
        name: 'shervin',
        room: 'Room A'
    },
    {
        id: '8763tgebn',
        name: 'shervin',
        room: 'Room A'
    },
    {
        id: '87ygbnm',
        name: 'shervin',
        room: 'Room A'
    }
]

class Users {
    constructor(name, age) {
        this.users = [];
    }
    addUser(id, name, room) {
        const user = { id, name, room };
        this.users.push(user);
        return user;
    }
    removeUser(id) {
        const user = this.getUser(id);
        
        if (user) {
            this.users = this.users.filter(user => user.id !== id);
        }
        
        return user;
    }
    
    getUser(id) {
        return this.users.filter(user => user.id === id)[0];

    }
    getUserList(room) {
        const users = this.users.filter(user => user.room === room);
        const namesArray = users.map(user => user.name);
        
        return namesArray;
    }
}

module.exports = { Users };