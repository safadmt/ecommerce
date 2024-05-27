
import Cart from "../models/Cart.js";
import User from "../models/users.js";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import {ObjectId} from 'mongodb'
import Address from "../models/Address.js";
export const createUser = async function (userInfo) {
  let data = { error: "", user: {} };
  try {
    const isUser = await User.findOne({ email: userInfo.email });
    if (isUser) {
      data.error = "User already registered";

      return data;
    }
    const newUser = new User(userInfo);
    const usercreated = await newUser.save();
    const { username, email } = newUser;
    
    data.user = {username,email,_id:usercreated._id}
    
    return data;
  } catch (err) {
    return err;
  }
};

export const loginUser = async function (userInfo) {
  const data = { error: null, user: {} };
  try {
    const user = await User.findOne({ email: userInfo.email });
    if (!user) {
      data.error = "User not found , Please register";
      return data;
    }

    const isTrue = await bcrypt.compare(userInfo.password, user.password);

    if (isTrue) {
      data.user = user;
      return data;
    } else {
      data.error = "Password is incorrect";
      return data;
    }
  } catch (err) {
    console.log(err);
  }
};

export async function getUserCart(userid) {
  try {
    const cart = await Cart.findOne({
      userid: new Types.ObjectId(userid)
    }).populate('cart_products.productid');
    console.log(cart);
    return cart;
  } catch (err) {
    return err;
  }
}

export async function insertAddress(addressInfo) {
  
  try{
     const response = await Address.create(addressInfo)
     return response
  }catch(err){
    console.log(err)
  }
}

export async function getAddressess() {
  
  try{
     const response = await Address.find()
     if(response.length > 0) {
      return response
     }else{
      return response
     }
     
  }catch(err){
    console.log(err)
  }
}

export async function getOneAddress(addressid) {
  
  try{
     const response = await Address.findById(addressid)
    
     return response
  }catch(err){
    console.log(err)
  }
}

export async function updateOneAddress(addressid,addressInfo) {
  
  try{
     const response = await Address.updateOne({_id: new Types.ObjectId(addressid)},{
      $set: addressInfo
     })
     return response
  }catch(err){
    console.log(err)
  }
}



export async function updateAddress(addressid,addressInfo) {
  
  try{
     const response = await Address.updateOne({_id:new ObjectId(addressid)},
    {$set:addressInfo})
     return response
  }catch(err){
    console.log(err)
  }
}

export async function removeOneCartITem(userid,productid) {
  let response = {error: null, data: {}}
  try {
    const cart = await Cart.findOne({userid: new Types.ObjectId(userid)})
    if(cart.cart_products.length === 1) {
      response.data = await Cart.deleteOne({
      userid: new Types.ObjectId(userid),
    });
    console.log(response.data)
    return response;
    }else{
      response.data = await Cart.updateOne({userid: new Types.ObjectId(userid)},{
        $pull: {cart_products: {productid: new Types.ObjectId(productid)}}
      })
      return response
    }
    
  } catch (err) {
    response.error = err
    return response;
  }
}
export async function createCart(userid, cartInfo) {
  const newcart = new Cart({
    userid: userid,
    cart_products:cartInfo,
  });
  await newcart.save()
  return newcart
} 

export async function mergeGuestCart (userid, cartInfo) {
  const data = {error: null, response : {}}
  const cart = await Cart.findOne({userid: new Types.ObjectId(userid)})

  if(cart) {
    console.log(cart) 
    for(const guestCartItem of cartInfo) {
      const count = cart.cart_products.reduce((accu, item)=> accu + item?.quantity,0)
      if(count === 6) {
        data.error = "Only 6  units area allowed in each order"
        return data;
      }
      const existingCartItem = cart.cart_products.find(item=> item.productid == guestCartItem.productid)
      console.log(existingCartItem)
      if(existingCartItem) {
        existingCartItem.quantity += guestCartItem.quantity;
      }else{
        cart.cart_products.push(guestCartItem)
      }

    }
    data.response = await cart.save()
    return data
  }else{
    data.response = await Cart.create({userid: userid, cart_products: cartInfo}) 
    return data
  }
}
export async function addToCart(userid, productid, qty) {
  try {
    const userCart = await Cart.findOne({ userid: new Types.ObjectId(userid) });
      const isProduct = userCart.cart_products.some(
        (product) => product.productid == productid
      );
      console.log(isProduct)
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
        const response = await Cart.updateOne(
          { userid: new Types.ObjectId(userid) },
          {
            $push: { cart_products: { productid: productid, quantity: 1 } },
          }
        );
        return response;
      }
      
   
  } catch (err) {
    console.log(err);
  }
}

export async function deleteUserCart (userid) {
  try{
    const response = await Cart.deleteOne({userid: new Types.ObjectId(userid)})
    return response;
  }catch(err) {
    console.log(err)
  }
}

export async function getUser (userid) {
  try{
    const response = await User.findById(userid,{password: 0})
    console.log(response)
    return response;
  }catch(err) {
    console.log(err)
  }
}

export async function findUserByEmail (email) {
  try{
    const response = await User.findOne({email: email},{password: 0})
    
    return response;
  }catch(err) {
    console.log(err)
  }
}

export async function findUserAddresses (userid) {
  try{
    const response = await Address.find({userid: new Types.ObjectId(userid),is_deleted:false})
    
    return response;
  }catch(err) {
    console.log(err)
  }
}


export async function deleteOneAddress (addressid) {
  console.log(addressid)
  try{
    const response = await Address.updateOne({_id: new Types.ObjectId(addressid)},{
      $set : {is_deleted : true}
    })
    
    return response;
  }catch(err) {
    console.log(err)
  }
}


export async function getUserWishlist (userid) {
  
  try{
    const response = await User.findOne({_id: new Types.ObjectId(userid)}).populate('wishlist')
    return response.wishlist;
  }catch(err) {
    console.log(err)
  }
}











