import { Server } from "socket.io";
import chatBotSocket from "./chatSocket.js";

function InitializeSocket(server) {
  const io = new Server(server);
  
  return {io}
}

export default InitializeSocket
