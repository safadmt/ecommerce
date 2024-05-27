import mongoose, {Schema} from "mongoose";



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
        }
    }],
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
    },
    addressId: {
        type: Schema.Types.ObjectId,
        ref: 'address',  
        required: true
    },
    shippingCharge: {
        type: Number,
        required: true,
        min: 0,
        default: 0  
    },
    couponDiscount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });  // Enable timestamps

const Order = mongoose.model('order', OrderSchema);
export default Order;
