import mongoose from "mongoose";
const { Schema } = mongoose;

const usersSchema = new Schema({
  username: {
    type: String,
    required: [true, "username field is required"],
    
  },
  email: { type: String, required: [true , "Email is required"]},
  password: {
    type: String,
    required: [true, "Password is required"]
  },
  mobile: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v)
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    required: [true, "Mobile number is required"],
    
  },
  isBlocked: { type: Boolean, default: false },
  wishlist: [{ type: Schema.Types.ObjectId, ref: "products" }],
  address: [
    {
      name : {type: String, required: true},
      street_1: {
        type: String,
        required: true,
      },
      street_2: String,
      city: { type: String, required: true },
      mobile: {
        type: String, 
        validate: {
          validator: function(v) {
            return /\d{3}-\d{3}-\d{4}/.test(v);
          },
          message: props => `${props.value} is not a valid phone number!`
        },
        required: [true, "Mobile number is required"],
      }, 
      pin_code: {
        type: Number,
        required: true,
        min: [6, "Only 6 numbers "],
        max: [6, "Only 6 numbers"],
      },
    },
  ],
  isBlocked: {type:Boolean, default:false}
}, {timestamps: true});


const User = mongoose.model('users', usersSchema)
export default User;
