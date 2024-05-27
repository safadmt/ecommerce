import mongoose from "mongoose";
import Product from '../models/product.js'
const connectDB = async function () {
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Database connected")
        // function edit () {
        //     Product.updateMany({category: {$ne: null}},{
        //         $set: {category : "fashio"}
        //     })
        //     .then(response=> {
        //         console.log(response)
        //     })
        //     .catch(err=> {
        //         console.log(err)
        //     })
        // }
        // edit()
    }catch(err) {
        console.error(err)

    }
    

}

export default connectDB;