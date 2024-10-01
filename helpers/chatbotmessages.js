import { Types } from "mongoose"
import ChatMessage from "../models/chatbot.js"
export const chatbotHelper = {
    createChat : async function (data) {
        try{
            console.log(data);
            
            const chatresponse = await ChatMessage.create({
            userId: new Types.ObjectId(data.userId),
            question: data.question,
            answer : data.answer,
            chatSessionId: data.chatSessionId
        })
        console.log(chatresponse);
        
        return chatresponse
        }catch(err) {
            console.log(err.message);
            
        }
        
        
    },
    fetchUserChats : async function (userid) {
        try{
            const userchats = await ChatMessage.find({userId: new Types.ObjectId(userid)})
        return userchats
        }catch(err) {
            console.log(err)
        }
        
    },
    deleteUserChats : async function (userid) {
        try{
            const deleted = await ChatMessage.deleteMany({userId: Types.ObjectId(userid)})
        return deleted
        }catch(err) {
            console.log(err);
            
        }
        
    }
}