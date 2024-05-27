import mongoose, {Schema} from "mongoose";

const bannerSchema = new Schema({
    imageurl : {type:String, required: true},
    first_caption: {type: String, required: true},
    second_caption : {type: String},
    link: {type: String},
    isActive: {type: Boolean, default: false}
})

const Banner = mongoose.model('banner', bannerSchema);
export default Banner;