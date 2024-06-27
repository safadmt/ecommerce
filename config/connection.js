import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config()
const connectDB = async function () {
    return new Promise((resolve, reject)=> {
        mongoose.connect(process.env.MONGO_URL)
        .then(response=> {
            
            resolve("Database connected")
        })
        .catch(err=> {
            reject(err)
        })
        
    })
        
       
    

    
    

}

export default connectDB;