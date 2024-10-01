import { Server } from "socket.io";

let io;

async function initializeSocket(httpServer) {
    io = new Server(httpServer);
    
    io.on("connection", (socket) => {
        console.log("A user connected");
        socket.on("user_connected", (userid) => {
            console.log(`User connected: ${userid}`);
        });
    });

    console.log("Socket.IO initialized");
}

function getIO() {
    // if (!io) {
    //     throw new Error("Socket.IO not initialized");
    // }
    console.log(io, "io");
    
    return io;
}

export { getIO, initializeSocket };