import mongoose , {Schema} from "mongoose";


const couponSchema = new Schema({
    coupon_code : {type: String , required: true,uppercase:true},
    description : {type: String, required: true},
    discount_type : {type: String, enum: ["free_shipping", "percentage", "fixed_amount"]},
    discount_value : {type: Number},
    minimum_purchase_value : {type: Number , required: true, default: 0},
    maximum_purchase_value : {type: Number },
    usage_count : {type: Number},
    isActive: {type: Boolean, default: false}

},{timestamps: true})

const Coupon = mongoose.model('coupon', couponSchema)
export default Coupon