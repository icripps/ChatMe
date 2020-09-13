const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const path = require('path')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { adduser, removeUser, getUser, getUsersInroom } = require('./utils/users')
const app = express()
const server = http.createServer(app)

const io = socketio(server)
const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))



io.on('connection', (socket) => {


    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = adduser({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('MESSAGE', generateMessage(`${room}'s Bot`, 'Welcome soldier'))
        socket.broadcast.to(user.room).emit('MESSAGE', generateMessage(`${room}'s Bot`, `${user.username} has joined the chat `))
        io.to(room).emit('roomData', {
            room: user.room,
            users: getUsersInroom(user.room)
        })
        callback()
    })

    socket.on('INCOMING', (text, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('MESSAGE', generateMessage(user.username, text))
        callback('REceived')
    })
    socket.on('coord', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('shareLoc', generateLocationMessage(user.username, `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`))

        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('MESSAGE', generateMessage(`${user.username} has left the chat`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInroom(user.room)
            })
        }
    })

})



server.listen(port, () => {
    console.log(`listening on port ${port}`)
})