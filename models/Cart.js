import mongoose, {Schema} from "mongoose";

const cartSchema = new Schema({
    userid : {type: Schema.Types.ObjectId, required: true},
    cart_products: [
        {productid: {type: Schema.Types.ObjectId, required:true, ref: "products"}
        , quantity: {type: Number, required: true}}
    ]
    
    
},{timestamps:true})

const Cart = mongoose.model('cart', cartSchema);
export default Cart;