import mongoose from "mongoose";
const { Schema } = mongoose;

const WalletSchema = new Schema({
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  transactions: [
    {
      amount: Number,
      description: String,
      status: {
        type: String,
        enum: ["Received", "Paid"]
      },
      createdAt: {type:Date, required:true , default: new Date()}
    }
  ]
});

const usersSchema = new Schema({
  username: {
    type: String,
    required: [true, "username field is required"],
    
  },
  email: { type: String, required: [true , "Email is required"], lowercase : true},
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
  wallet : {
    type: WalletSchema,
    default: () => ({ balance: 0, transactions: [] })
  },
}, {timestamps: true});




const User = mongoose.model('users', usersSchema)
export default User;
