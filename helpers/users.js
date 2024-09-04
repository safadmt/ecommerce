
import Cart from "../models/Cart.js";
import User from "../models/users.js";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";

import Address from "../models/Address.js";
import DeletedUser from "../models/deletedUser.js";
import Review from "../models/reviews.js";
import { response } from "express";
import Return from "../models/return.js";
import { ObjectId } from "mongodb";

// Create new user
export const createUser = async function (userInfo) {
  let data = { error: "", user: {} };
  
    
    const isUser = await User.findOne({ email: userInfo.email });
    // Checking the user already created by user email
    if (isUser) {
      data.error = "User already registered";

      return data;
    }
    // Save the user to the database
    const newUser = new User(userInfo);
    const usercreated = await newUser.save();
    const { username, email } = newUser;
    
    data.user = {username,email,_id:usercreated._id}
    
    return data;
  
};

// User login 
export const loginUser = async function (userInfo) {
  const data = { error: null, user: {} };
  
    const user = await User.findOne({ email: userInfo.email });
    // Check the user is not in the database, if not send message
    if (!user) {
      data.error = "User not found , Please register";
      return data;
    }
    // Check the user is blocked by admin 
    if(user.isBlocked === true) {
      data.error = "Sorry!. You are blocked"
      return data;
    }
    // Comparing user provided password  with database password
    const isTrue = await bcrypt.compare(userInfo.password, user.password);

    //Checking the password is true 
    if (isTrue) {
      data.user = user;
      return data;
    } else {
      data.error = "Password is incorrect";
      return data;
    }
  
};

// Get the User cart information
export async function getUserCart(userid) {
    const cart = await Cart.findOne({
      userid: new Types.ObjectId(userid)
    }).populate('cart_products.productid'); // populating product details by productid
    return cart;
}

// Add new address 
export async function insertAddress(addressInfo) {
     const response = await Address.create(addressInfo)
     return response
}

// Get all Address
export async function getAddressess() {
     const response = await Address.find()
     if(response.length > 0) {
      return response
     }else{
      return response
     }
}

// Get all user addresses
export async function getOneAddress(addressid) {
     const response = await Address.findById(addressid)
     return response
}


// Update one addresses
export async function updateOneAddress(addressid,addressInfo) {
     const response = await Address.updateOne({_id: new Types.ObjectId(addressid)},{
      $set: addressInfo
     })
     return response
}





// Removing Cart or cart product based certain conditions
export async function removeOneCartITem(userid,productid) {
    const cart = await Cart.findOne({userid: new Types.ObjectId(userid)})
    // If cart length is 1 , Delete the user cart 
    if(cart.cart_products.length === 1) {
      const response = await Cart.deleteOne({
      userid: new Types.ObjectId(userid),
    });
    return response;
    }else{
      // Else remove one product from the cart 
      const response = await Cart.updateOne({userid: new Types.ObjectId(userid)},{
        $pull: {cart_products: {productid: new Types.ObjectId(productid)}}
      })
      return response
    }
}

// Creating new cart
export async function createCart(userid, cartInfo) {
  const newcart = new Cart({
    userid: userid,
    cart_products:cartInfo,
  });
  await newcart.save()
  return newcart
} 

// Merge quest cart details when user login 
export async function mergeGuestCart (userid, cartInfo) {
  const data = {error: null, response : {}}
  const cart = await Cart.findOne({userid: new Types.ObjectId(userid)})

  // Checking user already has cart the created
  if(cart) {
    // Calculating the total cart products quatity in each loop , and if it exceeds limit 6 , 
    // return warning message
    for(const guestCartItem of cartInfo) {
      const count = cart.cart_products.reduce((accu, item)=> accu + item?.quantity,0)
      if(count === 6) {
        data.error = "Only 6  units area allowed in each order"
        return data;
      }
      // If cart total quantity not exceeds the limit , then add the guest cart product to the cart

      // checking if the cart products item and guest cart item is the same , if same
      // increment quantity of product , else , push the product and quanity into the cart
      const existingCartItem = cart.cart_products.find(item=> item.productid == guestCartItem.productid)
      if(existingCartItem) {
        existingCartItem.quantity += guestCartItem.quantity;
      }else{
        cart.cart_products.push(guestCartItem)
      }

    }
    data.response = await cart.save()
    return data
  }else{
    // If the cart is not created , create new cart
    data.response = await Cart.create({userid: userid, cart_products: cartInfo}) 
    return data
  }
}

// Add product to cart
export async function addToCart(userid, productid, qty) {
    const userCart = await Cart.findOne({ userid: new Types.ObjectId(userid) });
      const isProduct = userCart.cart_products.some(
        (product) => product.productid == productid
      );
      // If the product is already exist in the cart , increment quantity by one
      if (isProduct) {
        const response = await Cart.updateOne(
          {
            userid: new Types.ObjectId(userid),
            "cart_products.productid": new Types.ObjectId(productid),
          },
          {
            $inc: { "cart_products.$.quantity": qty },
          }
        );
        return response;
      } else {
        // Push the product in the cart
        const response = await Cart.updateOne(
          { userid: new Types.ObjectId(userid) },
          {
            $push: { cart_products: { productid: productid, quantity: 1 } },
          }
        );
        return response;
      }
}

// Delete user cart
export async function deleteUserCart (userid) {
    const response = await Cart.deleteOne({userid: new Types.ObjectId(userid)})
    return response;
}

// Get one user by userid
export async function getUser (userid) {
    const response = await User.findById(userid,{password: 0})
    return response;
}

// Get user by email
export async function findUserByEmail (email) {
    const response = await User.findOne({email: email},{password: 0})
    return response;
}

// Find all user addresses
export async function findUserAddresses (userid) {
    const response = await Address.find({userid: new Types.ObjectId(userid),is_deleted:false})
    return response;
}

// Delete user address
export async function deleteOneAddress (addressid) {
    const response = await Address.findByIdAndDelete(addressid)
    return response;
}

// Get user wishlist
export async function getUserWishlist (userid) {
    const response = await User.findOne({_id: new Types.ObjectId(userid)}).populate('wishlist')
    return response.wishlist;
}

// find all user
export async function findAllUsers () {
    const response = await User.find({})
    return response;
}

// Get total users count
export async function getUserCount (info){
      const response = await User.countDocuments(info)
      return response
}

// Block User
export async function isblockUser (userid, info)  {
    const isBlock = info === "Block" ? true : false
    const response = await User.findOneAndUpdate({_id : new Types.ObjectId(userid)}, {
      $set: {isBlocked : isBlock}
    },{new : true})
    return response;
}

// Delete User
export async function deleteUser (userid)  {
    let data = {error : null, deleted: {}}
    const user = await User.findByIdAndDelete(userid)
    let obj = {
      username : user.username,
      email : user.email,
      mobile : user.mobile
    }
    const deleteuser = await DeletedUser.create(obj)
    data.deleted = deleteuser
   return data
}


export async function addRating (info) {
    const response = await Review.create(info)
    return response;
}

export async function findUserReview (userid,productid) {
    const response = await Review.
    findOne({userid:new Types.ObjectId(userid), productid: new Types.ObjectId(productid)})
    return response;
}

export async function findOrderReturns (info) {
  const response = await Return.find(info).lean()
  return response;
}

export async function createProductReturn (info) {
   const response = await Return.create(info)
   return response;
 }

 export async function findAllProductReturns (info) {
   const response = await Return.find(info).
   populate('userid', {username: 1}).
   populate('productid')
   .sort({createdAt: -1})
   return response;
 }
 

 export async function countProductReturnDocuments (info) {
  const response = await Return.countDocuments(info)
  return response;
}

export async function findOneReturn (returnid) {
  const response = await Return.findById(returnid)
  return response;
}























