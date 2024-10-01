import sharedsession from "express-socket.io-session";
import { chatbotquestions } from "./chatbotquestions.js";
import { chatbotHelper } from "../helpers/chatbotmessages.js";
import Fuse from 'fuse.js';
import { response } from "express";

function chatBotSocket(io,session) {
    const chatbot = io.of("/chatbot");
    chatbot.use(sharedsession(session))
    chatbot.on("connection", (socket) => {
      
      let userId = socket.handshake.session?.user?._id
      chatbotHelper.fetchUserChats(userId)
      .then(response=> {
        chatbot.to(socket.id).emit("chat_messages", response)
      })
      socket.on("chatmessage", (data) => {
        console.log(data, "client data");
        let answer = ""
        if(socket.handshake.session?.user?._id && data) {
          answer = "I'm sorry, I didn't understand that."
          const fuse = new Fuse(chatbotquestions, { keys: ['question'], threshold: 0.5 });

          const result = fuse.search(data);
          console.log(result);
          
          if(result.length > 0) {
            answer = result[0].item.response
          }
          
          
          const datas = {
            userId,
            question: data,
            answer: answer, 
            chatSessionId : socket.id
          }
          
          chatbotHelper.createChat(datas)
          .then(response=> {
            chatbot.emit("chatmessage", answer)
          })
        }
      });
      socket.on("disconnect", (socket)=> {
        console.log("A user is disconnected");
        
      })
    });

    
}

export default chatBotSocket;
