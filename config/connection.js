import mongoose from "mongoose";
process.loadEnvFile()
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