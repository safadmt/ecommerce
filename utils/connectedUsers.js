let connectedUsers  = []

function addUser (info) {
    connectedUsers.push(info)
}

function deleteUser (socketid) {
    connectedUsers = connectedUsers.filter(u=> u.socketid !== socketid)

}

function getConnectedUsers () {
    return connectedUsers
}

export {addUser, deleteUser, getConnectedUsers}