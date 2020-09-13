const users = []

// adduser, remove user, getUser, getUsersInroom

const adduser = ({ id, username, room }) => {
    //clean data

    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate data
    if (!username || !room) {
        return {
            error: 'username and room are required'
        }
    }

    //check for Existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate username
    if (existingUser) {
        return {
            error: 'username is in use'
        }
    }

    //Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}


const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index === -1) {
        return {
            error: 'No user found with that ID'
        }
    }
    return users.splice(index, 1)[0]
}

const getUser = (id) => {
    const user = users.find((user) => user.id === id)
    if (!user) {
        return {
            error: 'No user found with that ID'
        }
    }
    return user
}

const getUsersInroom = (room) => {

    return users.filter((user) => user.room === room)
}

module.exports = {
    adduser,
    getUser,
    getUsersInroom,
    removeUser
}