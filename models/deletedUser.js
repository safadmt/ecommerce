import mongoose from "mongoose";
const { Schema } = mongoose;

const deletedUser = new Schema({
  username: {
    type: String,
    required: [true, "username field is required"],
    
  },
  email: { type: String, required: [true , "Email is required"]},
  mobile: {
    type: String
    
  }
  
 
}, {timestamps: true});


const DeletedUser = mongoose.model('deletedusers', deletedUser)
export default DeletedUser;
