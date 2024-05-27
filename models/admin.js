import mongoose from "mongoose";
const {Schema} = mongoose;


const adminSchema = new Schema({
    username : {type:String},
    email: {type: String, required: true},
    password: {type: String, required: true},
    admin: {type:Boolean,default:true}
})

const Admin = mongoose.model("admin", adminSchema)
export default Admin