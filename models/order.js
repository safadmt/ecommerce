import mongoose, {Schema} from "mongoose";
import { orderStatusEnum } from "../utils/enum.js";


// Order Schema
const OrderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',  
        required: true
    },
    products: [{
        productid: {
            type: Schema.Types.ObjectId,
            ref: 'products', 
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price : {
            type: Number,
            required: true
        },
        returned_quantity : {
            type: Number, 
            required: true, 
            default: 0
        }
    }],
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    orderStatus: {
        type: String,
        required: true,
        enum: Object.values(orderStatusEnum),
        default: orderStatusEnum.PENDING
    },
    deliveredAt : Date,
    addressId: {
        type: Schema.Types.ObjectId,
        ref: 'addresses',  
        required: true
    },
    shippingCharge: {
        type: Number,
        required: true,
        min: 0,
        default: 0  
    },
    payment_method : {type: String, enum: ["Razorpay", "Wallet" , "Stripe"], required: true},
    couponDiscount: {
        type: Number,
        default: 0
    },
    
}, { timestamps: true });  // Enable timestamps

OrderSchema.index({orderStatus: 1})
const Order = mongoose.model('order', OrderSchema);
export default Order;



