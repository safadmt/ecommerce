import { getConnectedUsers, addUser, deleteUser } from "./connectedUsers.js";

export function orderStatusSocket (io) {
    let orderstatus = io.of('/orderstatus')
    
    orderstatus.on('connection', (socket)=> {
        
        
        socket.on("user_connected", (userid) => {
            console.log("user connected");
         const users = getConnectedUsers()   
        let isUserid = users.some((u) => u.userid === userid);
        if (!isUserid) {
          addUser({ userid, socketid: socket.id });
          
        }
      });
      
      socket.on("disconnect", () => {
        deleteUser(socket.id)
      });
    })
    
    return {getConnectedUsers, orderstatus}
}