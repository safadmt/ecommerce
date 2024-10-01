import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the message schema
const chatmessageSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to a User model
        required: true,
        ref: 'User' // Assuming you have a User model
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now // Automatically set to the current date
    },
    
    chatSessionId: {
        type: String,
        required: true // Unique identifier for the chat session (if applicable)
    }
});

// Create the model
const ChatMessage = mongoose.model('ChatMessage', chatmessageSchema);

export default ChatMessage
