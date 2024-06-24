import mongoose, { Schema } from "mongoose";
import { ReturnReasonEnum, returnRefundOptionEnum, returnStatusEnum } from "../utils/enum.js";

const ReturnSchema = new Schema({
  orderid: {
    type: Schema.Types.ObjectId,
    ref: 'orders',
    required: true
  },
  userid: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
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
  returnReason: {
    type: String,
    enum: Object.values(ReturnReasonEnum),
    required: true
  },
  returnStatus: {
    type: String,
    required: 
    true,
    enum: Object.values(returnStatusEnum),
  },
  refundTo : {type: String, required: true , enum: Object.values(returnRefundOptionEnum)},
  refundAmount: {
    type: Number
  },
  
}, { timestamps: true });

const Return = mongoose.model('returns', ReturnSchema);
export default Return;