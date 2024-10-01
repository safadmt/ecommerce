import { Server } from "socket.io";
import chatBotSocket from "./chatSocket.js";

function InitializeSocket(server) {
  const io = new Server(server);
  
  let connectedUsers = [];
  io.on("connection", (socket) => {
    
    
    socket.on("user_connected", (userid) => {
      
      let isUserid = connectedUsers.some((u) => u.userid === userid);
      if (!isUserid) {
        connectedUsers.push({ userid, socketid: socket.id });
        console.log("connectedusers", connectedUsers);
      }
    });
    
    socket.on("disconnect", () => {
      connectedUsers = connectedUsers.filter(
        (user) => user.socketid !== socket.id
      );
    });
  });

  return {io, connectedUsers}
}

export default InitializeSocket
