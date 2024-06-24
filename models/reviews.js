import mongoose, {Schema} from "mongoose";

const reviewSchema = new Schema({
    userid: {type: Schema.Types.ObjectId, required: true, ref: 'users'},
    productid : {type: Schema.Types.ObjectId, required: true, ref: 'products'},
    rating: {type: Number,default: 0, required:true},
    comment: {type: String,}
},{timestamps: true})

const Review = mongoose.model('reviews', reviewSchema);
export default Review;