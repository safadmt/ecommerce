import mongoose from "mongoose";
const {Schema} = mongoose;

const productSchema = new Schema({
    product_name : {type: String, required: true},
    brand: {type: String , enum: ["ROLEX", "FOSSIL", "TISSOT","BOAT", "GUESS", "ARMANI EXCHANGE"], required:true},
    description: {type: String, required:true},
    total_rating: {type:String, default: "0"},
    type : {
        type: String, 
        enum: ["Analog", "Analog-Digital","Digital","Hybrid Smart Watch"],
        required:true
    },
    gender: {type: String,required: true, enum: ["Mens", "Womens", "All"]},
    price: {type: Number, required: true},
    stock_available: {type: Number, required: true},
    images : [
        {type: String,required: true}
    ],
    product_sold : {type: Number , default : 0},
    discount_in_percentage : {type: Number, default: 0, required:true},
    returnable : {type: Boolean, default: true, required:true},
    isActive: {type:Boolean, default: true}
},{timestamps: true})


productSchema.index({ gender:1, brand: 1, type: 1})
productSchema.index({ description: "text", product_name : "text",brand:"text"})
const Product = mongoose.model('products', productSchema);
export default Product;