import User from "../models/users.js";
import {
  addToCart,
  createCart,
  createUser,
  deleteOneAddress,
  deleteUserCart,
  findUserAddresses,
  findUserByEmail,
  getAddressess,
  getOneAddress,
  getUser,
  getUserCart,
  getUserWishlist,
  insertAddress,
  loginUser,
  mergeGuestCart,
  removeOneCartITem,
  updateOneAddress,
} from "../helpers/users.js";
import bcrypt from "bcryptjs";
import {sendOTP, sendOrderSuccessmsg,emailChangesConfirmation} from "../services/otpSender.js";
import passport from "passport";
import { getAllProduct, getNewProduct, getOneProduct, searchProduct, updateStockAvailability } from "../helpers/productHelper.js";
import { isValidObjectId } from "mongoose";
import Razorpay from "razorpay";
import {createHmac} from 'crypto'
import {
  getCartTotalQuantity,
  getTotalCartPriceDiscount,
  wishlistCount,
} from "../util.js";
import { findAllCoupons, findCouponByCouponCode } from "../helpers/couponHelpers.js";
import { createOrder, findOneOrder, getUserOrders, updateOrder } from "../helpers/orderHelper.js";
import exp from "constants";
import { findBanner } from "../helpers/bannerHelper.js";
import { error } from "console";




const instance = new Razorpay({ 
  key_id: process.env.RAZORPAY_KEY_ID,
   key_secret: process.env.RAZORPAY_KEY_SECRET
  })

export const verfiyEmail = async (req, res) => {
  if (!req.body) return res.json({error: "Required all field" })
  const { username, email, password, mobile } = req.body;
  if (!username || !email || !password || !mobile) {
    return res.json({ error: "Required all field" });
  }
  const isUser = await User.findOne({ email: email });
  console.log(isUser)
  if (isUser) {
    res.json({ error: "User alread exist" });
    return;
  }
  try {
    const otp = await sendOTP(email);
    req.session.signupInfo = { email, password, username, mobile };
    let expireTime = Date.now() + 90 * 1000;
    req.session.emailOTP = { otp, expireTime };
    res.json({ error: null });
  } catch (err) {
    console.log(err);
  }
};

export async function getSignupPage (req,res) {
  try{
    const count = await getCartTotalQuantity(req,res)
    const wishlist = 0
        var role = req.session?.role ? req.session.role : "user"
        const username = req.session.user ? req.session.user.username : ""
        res.render('pages/user/register', {count,role, username,wishlist})
  }catch(err) {
    console.log(err)
  }
}
export const userSignup = async (req, res) => {
  try {
    if (
      req.session?.emailOTP?.otp === req.body.otp &&
      req.session?.emailOTP?.expireTime > Date.now()
    ) {
      const { password } = req.session.signupInfo;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      req.session.signupInfo.password = hashedPassword;
      let response = await createUser(req.session.signupInfo);
      console.log(response);
      if (response.error) {
        res.json({ error: response.error });
        return;
      } else {
        delete req.session.signupInfo;
        if (req.session.guest) {
          const data = await mergeGuestCart(
            response.user._id,
            req.session.guest
          );
          console.log(data);
        }
        res.json({ error: null, data: "ok" });
      }
    } else {
      res.json({
        error: "OTP expired , please signup",
      });
    }
  } catch (err) {
    console.log("bag errors", err);
    // if(err.errors['password']) {
    //     res.render('pages/user/register', {error: err.errors["password"]})
    // }else if(err.errors['mobile']) {
    //     res.render('pages/user/register',{error: err.errors['mobile']})
    // }else{
    //     console.log(err)
    // }
  }
};

export const otpverify = async (req, res) => {
  try{

  const count = await getCartTotalQuantity(req,res)
    const wishlist = 0
        var role = req.session?.role ? req.session.role : "user"
        const username = req.session.user ? req.session.user.username : ""
  res.render("pages/user/verifyemail", { username: "",wishlist , role,count});
  }catch(err) {
    console.log(err)
  }
};

export const resendOTP = async (req, res) => {
  try {
    if (req.session.signupInfo) {
      const otp = await sendOTP(req.session.signupInfo.email);
      let expireTime = Date.now() + 90 * 1000;
      req.session.emailOTP = { otp, expireTime };
      res.json({ error: null, data: "otp send to your email address" });
    }
  } catch (err) {
    console.log(err);
  }
};

export async function getLoginPage(req, res) {
  
  const count = await getCartTotalQuantity(req, res);
  const wishlist = 0
  res.render("pages/user/login", {
    username: req.session.user ? req.session.username : "",
    count,
    role : "user",
    wishlist
  });
}
export const passportLogin = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.body);
  if (!req.body || !email || !password) {
    req.flash("warning_msg", "Email and password is required");
    res.redirect("/auth/login");
    return;
  }
  const response = await loginUser(req.body);
  if (response?.error) {
    req.flash("warning_msg", response.error);
    res.redirect("/auth/login");
  } else {
    const { username, email, _id } = response.user;
    if (req.session.guest) {
      await mergeGuestCart(_id, req.session.guest);
      req.session.guest = null;
      delete req.session.guest;
    }
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.set('Surrogate-Control', 'no-store');
    req.session.user = { username, email, _id };
    req.session.role = "user"
    res.redirect("/");
  }
};

export const googleCallback = (req, res, next) => {
  passport.authenticate("google", { failureRedirect: "/login" })(
    req,
    res,
    next
  );

  res.redirect("/");
};

export async function getMainLandingPage(req, res) {
  try {
    const wishlist = await wishlistCount(req,res)
    const banner = await findBanner();

    let products = await getNewProduct(6);
    console.log("req.session", req.session);
    const count = await getCartTotalQuantity(req, res);
    products = products?.length > 0 ? products : [];
    var role = "user"
    res.render("pages/user/main", {
      username: req.session.user ? req.session.user.username : "",
      products,
      count,
      role,
      wishlist: wishlist,
      banner
    });
  } catch (err) {
    console.log(err);
  }
}
export async function pageNotFound(req, res) {
  const username =req.session.user ? req.session.user.username : "";
  const count = getCartTotalQuantity(req,res)
  const wishlist = await wishlistCount(req,res)
  res.render("partials/message/pagenotfound", {wishlist, role: "user",count});
}

export async function viewProduct(req, res) {
  const { productid } = req.params;
  const role = "user"
  try {
    if (!isValidObjectId(productid)) {
      req.flash("warning_msg", "Something went wrong");
      return res.redirect(`/product/${productid}`);
    }
    
    let product = await getOneProduct(productid);
    const wishlist = await wishlistCount(req,res)
    let count = await getCartTotalQuantity(req, res);
    if (product) {
      return res.render("pages/user/viewproduct", {
        username: req.session.user ? req.session.user.username : "",
        product,
        count,
        role: role,
        wishlist
      });
    } else {
      return res.redirect("/page-not-found");
    }
  } catch (err) {
    console.log(err);
  }
}

export async function addProductToCart(req, res) {
  var cart;
  var role = req.session?.role ? req.session.role : "user"
  const { productid } = req.params;
  if (req.session?.user) {
    const { _id } = req.session.user;
    const response = await getUserCart(_id);
    console.log("response", response);
    const count =
      response?.cart_products.length > 0
        ? response?.cart_products.reduce(
            (accu, item) => accu + item.quantity,
            0
          )
        : 0;
    if (count === 6) {
      res.json({ error: "We're sorry! Only 6 unit(s) allowed each order" });
      return;
    }
    if (response?.cart_products?.length > 0) {
      await addToCart(_id, productid, 1);
    } else {
      let cartitem = [{ productid, quantity: 1 }];
       await createCart(_id, cartitem);
    }
    const cartpriceinfo = await getTotalCartPriceDiscount(req, res);
    if (cartpriceinfo.error) {
      console.log(cartpriceinfo.error);
    }
    const { totalprice, totaldiscount, actualprice ,isAllAvailable} = cartpriceinfo.data;
    res.json({
      error: null,
      response: {
        data: "Ok",
        count: count + 1,
        totaldiscount,
        totalprice,
        actualprice,
        isAllAvailable,
        role : role
      },
    });
  } else {
    if (req.session.guest) {
      const guest = req.session.guest;
      const totalquantity = await getCartTotalQuantity(req,res)
      console.log(totalquantity);
      if (totalquantity === 6) {
        res.json({ error: "We're sorry! Only 6 unit(s) allowed each order" });
        return;
      }
      const isProduct = guest.find((item) => item.productid === productid);
      if (isProduct) {
        isProduct.quantity++;
      } else {
        req.session.guest.push({ productid: productid, quantity: 1 });
      }
      const cartpriceinfo = await getTotalCartPriceDiscount(req, res);
      if (cartpriceinfo.error) {
        console.log(cartpriceinfo.error);
      }
      const {count, totalprice, totaldiscount, actualprice,isAllAvailable } = cartpriceinfo.data;
      res.json({
        error: null,
        response: {
          data: "Ok",
          count: count,
          totalprice,
          totaldiscount,
          actualprice,
          isAllAvailable,
          role : role
        },
      });
    } else {
      req.session.guest = [];
      req.session.guest.push({ productid: productid, quantity: 1 });
      const cartpriceinfo = await getTotalCartPriceDiscount(req, res);
      if (cartpriceinfo.error) {
        console.log(cartpriceinfo.error);
      }
      const {count, totalprice, totaldiscount, actualprice ,isAllAvailable} = cartpriceinfo.data;
      res.json({
        error: null,
        response: {
          data: "Ok",
          count: 1,
          totaldiscount,
          totalprice,
          actualprice,
          isAllAvailable,
          role:role
        },
      });
    }
  }
}

export async function getUserCartPage(req, res) {
  let shipping_charge
  var role = "user"
  const wishlist = await wishlistCount(req,res)
  if(!req.session.cart_charge_offer) {
  req.session.cart_charge_offer = {shipping_charge : 200,coupon_discount: []}
  
  shipping_charge = req.session.cart_charge_offer.shipping_charge
  }else {
    shipping_charge = req.session.cart_charge_offer.shipping_charge
  }
  try {
    if (req.session?.user) {
      let username = req.session.user.username;
      const cart = await getUserCart(req.session.user._id);

      const cartpriceinfo = await getTotalCartPriceDiscount(req, res);
      if (cartpriceinfo.error) {
        console.log(cartpriceinfo.error);
      }
      const {count, totalprice, totaldiscount, actualprice ,isAllAvailable} = cartpriceinfo.data;
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.set('Surrogate-Control', 'no-store');
      
      res.render("pages/user/cart", {
        username,
        products: cart?.cart_products ? cart.cart_products : [],
        count,
        totalprice,
        actualprice,
        totaldiscount,
        isAllAvailable,
        role,
        shipping_charge,
        wishlist
      });
    } else if (req.session.guest) {
      let cartproducts = [];
      const guest = req.session.guest;
      for (const { productid, quantity } of guest) {
        const product = await getOneProduct(productid);
        if (product) {
        
          let obj = {
            productid: product,
            quantity: quantity,
          };
          cartproducts.push(obj);
        }
      }

      const cartpriceInfo = await getTotalCartPriceDiscount(req, res);
      if (cartpriceInfo.error) {
        console.error(cartpriceInfo.error);
      } else {
        const {count, totalprice, totaldiscount, actualprice ,isAllAvailable} = cartpriceInfo.data;
        return res.render("pages/user/cart", {
          username: "",
          products: cartproducts,
          totalprice,
          count,
          actualprice,
          totaldiscount,
          isAllAvailable,
          role : role,
          shipping_charge,
          wishlist
        });
      }
    } else {
      return res.render("pages/user/cart", { username: "", products: [], count: 0 ,role,wishlist});
    }
  } catch (err) {
    console.log(err);
  }
}

export function logout(req, res) {
  req.session.user = null;
  req.session.admin = null;
  req.session.role = null;
  res.redirect("/");
}

export async function removeProductfromCart(req, res) {
  const { productid } = req.params;
  var role = req.session?.role ? req.session.role : "user"
  var response ;
try {
  if (req.session?.user) {
    const { _id } = req.session.user;
    
      const cart = await getUserCart(req.session.user._id);
      if (!cart) {
        return res.json({ error: "Cart not found" });
      }

      const product = cart.cart_products.find(
        (item) => item.productid === productid
      );
      if (product?.quantity === 1) {
        return res.json({ message: "Only one product can't decrement" });
      }
      response = await addToCart(_id, productid, -1);
      
    
  } else if (req.session.guest) {
    const product = req.session.guest.find(
      (item) => item.productid == productid
    );
    if (product?.quantity === 1) {
      return res.json({
        message: "Can't decrement!. Only one product in the cart",
      });
    }
    product.quantity--;
    response = "Ok"
      
  } 
  if(response) {
    const priceInfo = await getTotalCartPriceDiscount(req, res);
      if (priceInfo.error) {
        console.log(priceInfo.error);
      }

      const { totalprice, totaldiscount, actualprice ,isAllAvailable,count} = priceInfo.data;
      res
        .status(200)
        .json({
          message: null,
          response: "Ok",
          totalprice,
          totaldiscount,
          actualprice,
          count,
          isAllAvailable,
          role : role
        });
  }
  
    } catch (err) {
      console.log(err);
    }
}

export async function removeCartProduct(req, res) {
  const { productid } = req.params;
  
  try {
  if (req.session.user) {
    const { _id } = req.session.user;
    
  const response = await removeOneCartITem(_id, productid);
  if(!response) return res.json({message: "Something went wrong"})
  } else if (req.session.guest) {
    const pro = req.session.guest.filter(
      (item) => item.productid !== productid
    );
    req.session.guest = pro;
    
  }
  
      const cartpriceInfo = await getTotalCartPriceDiscount(req, res);
      
      if (cartpriceInfo.error) {
        console.log(cartpriceInfo.error);
      }
      const { totalprice, totaldiscount, actualprice ,isAllAvailable,count} = cartpriceInfo.data;

      res
        .status(200)
        .json({
          message: null,
          response: "Ok",
          totalprice,
          totaldiscount,
          actualprice,
          count,
          isAllAvailable
        });
    } catch (err) {
      console.log(err);
    }
}

export async function getCheckoutPage(req,res) {
  const wishlist = await wishlistCount(req,res)
  var role = req.session?.role ? req.session.role : "user"
  try{
    const cart = await getUserCart(req.session.user._id)

    if(!cart) {
      req.flash('warning_msg', 'User cart not found')
      res.redirect('/user/cart')
    }
    const products = cart.cart_products
    const coupons = await findAllCoupons({isActive: true})
    const response = await getTotalCartPriceDiscount(req,res)
    const addresses = await findUserAddresses(req.session.user._id);
    if(response.error) {
      console.log(err)
    }
    
    console.log(response)
    const {isAllAvailable, totalprice,totaldiscount, actualprice,count,shipping_charge, coupon_discount} = response.data
    const username = req.session.user.username;
    res.render('pages/user/checkout', {
      role:role,
      username,
      addresses,
      isAllAvailable,
      coupons,count,
      products ,
      totalprice,
      totaldiscount, 
      actualprice,
      shipping_charge,
      coupon_discount,
      wishlist
    })

  }catch(err) {

  }
}


export async function getAddressPage(req,res) {var role = req.session?.role ? req.session.role : "user"
  const username =req.session.user.username
  const count = await getCartTotalQuantity(req,res)
  const wishlist = await wishlistCount(req,res)
  res.render('pages/user/addressform',{role: role,username,count,wishlist})
}

export async function addNewAddress(req,res) {
  console.log("req.body")
  if(!req.body) {
    return res.status(400).json({error: "formData not found"})
  }
  console.log("after body")
  req.body.userid = req.session.user._id
  const response = await insertAddress(req.body)
  console.log(response)
  if(response) {
    console.log("hello")
    return res.json({error: null, data: response})
  }
}

export async function applyCoupons (req,res) {
  console.log(req.body)
  const {coupon_code} = req.body
  try{
    const coupon = await findCouponByCouponCode(coupon_code)
    if(!coupon) {
      return res.status(400).json({message: "Coupon not found. Please Type a valid coupon code!"})
    }
    const isTrue = req.session.cart_charge_offer?.coupon_discount.some(item=> item.coupon_code === coupon_code)
    if(isTrue) {
      return res.status(403).json({message:"The coupon is alread applied"})
    }
    const response = await getTotalCartPriceDiscount(req,res)
    if(response.error) {
      console.log(error)
      return
    }
    const {totalprice} = response.data
    if(coupon.discount_type === 'free_shipping') {
      if(totalprice >= coupon.minimum_purchase_value) {
        req.session.cart_charge_offer.shipping_charge = 0
        req.session.cart_charge_offer.coupon_discount.push({_id: coupon._id ,coupon_code, discount: 0})
      }else{
        return res.status(403).json({message: "Not eligible for free shipping"})
      }
    }else if(coupon.discount_type === "percentage") {
      if(totalprice >= coupon.minimum_purchase_value && totalprice <= coupon.maximum_purchase_value) {
        let value = totalprice * coupon.discount_value / 100
        req.session.cart_charge_offer.coupon_discount.push({_id: coupon._id,coupon_code, discount: value})
      }else{
        return res.status(403).json({message: "Not eligible for this coupon"})
      }
    }else if(coupon.discount_type === 'fixed_amount') {
      if(totalprice >= coupon.minimum_purchase_value && totalprice <= coupon.maximum_purchase_value) {
        req.session.cart_charge_offer.coupon_discount.push({_id: coupon._id, coupon_code, discount: coupon.discount_value})
      }else{
        return res.status(403).json({message: "Not eligible for this coupon"})
      }
    }
    const priceInfo = await getTotalCartPriceDiscount(req,res)
    if(priceInfo.error) {
      console.log(error)
    }
    const {totalprice: grandtotal, shipping_charge, coupon_discount} = priceInfo.data
    return res
    .status(200)
    .json({
      message: null, 
      totalprice:grandtotal,
      shipping_charge,
      coupon_discount
    })
  }catch(err) {
    console.log(err)
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function placeOrder (req,res) {

  const {_id} = req.session.user
 if(!req.body) {
  return res.status(400).json({message: "Please choose a Delivery address"})
 }
 console.log("REQ.BODY",req.body)
 try{
  const cart = await getUserCart(_id)
  
  const cartpriceinfo = await getTotalCartPriceDiscount(req,res)
  if(cartpriceinfo.error) {
    console.log(cartpriceinfo.error)
    return res.status(500).json("Something went wrong. Please try again later")
  }
  const {totalprice,coupon_discount,shipping_charge} = cartpriceinfo.data
  let obj = {
    userId: _id,
    products: cart.cart_products,
    totalPrice:totalprice,
    orderStatus: "pending",
    addressId: req.body.addressId,
    couponDiscount : coupon_discount,
    shippingCharge : shipping_charge
  }
  const order = await createOrder(obj)
  if(order) {
    const options = {
      amount:totalprice * 100,
      currency:"INR", 
      receipt: order._id
    }
    instance.orders.create(options, (err, order)=> {
      if(err) throw err;
      res.status(200).json(order)
    })
  }
 }catch(err) {
  console.log(err)
  return res.status(500).json("Something went wrong. Please try again later")
 }
 
}

export async function verfiyPayment (req,res) {
  if(!req.body) return res.status(400).json({message: "Payment details not found"})
  console.log(req.body)
console.log("verify")
    const {response, orderid} = req.body
    const {email, _id, username} = req.session.user
    let hma = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hma.update(response['razorpay_order_id'] + "|" + response['razorpay_payment_id']);
    hma = hma.digest("hex");

    if (hma == response['razorpay_signature']) {
      try{
        const order = await findOneOrder(orderid)
        console.log("order",order)
        if(!order) {
          return res.status(404).json({message : "Order not found"})
        }
        for(const {productid, quantity} of order.products) {
          await updateStockAvailability(productid, quantity)
        }
        
        order.orderStatus = 'success'
        await order.save()
        await deleteUserCart(_id)
        const ordermail = sendOrderSuccessmsg(email,username,order._id)
        console.log(ordermail)
        req.session.cart_charge_offer = {}
        delete req.session.cart_charge_offer

        return res.
        status(200)
        .json({
          message: null,
          response: {
            success: "Order placed successfully"
          }
        })
      }catch(err) {
        console.log(err)
      }
    }else{
      res.status(401).json({message: "Razorpay payment signature does not match"})
    }
}

export async function paymentFailed (req,res) {
  if(!req.body) return res.status(400).json({message: "Payment details not found"})
  const {response, orderid} = req.body
  console.log(response)
  try{
    const order = await findOneOrder(orderid)
    if(!order) {
      return res.status(404).json({message: "Order not found"})
    }

    const update = await updateOrder(orderid, {orderStatus: "failed"})
    if(update) {
      res.status(200).json({message: null, response: {data: "Ok"}})
    }else{
      console.log("not updated")
    }
    
  }catch(err) {
    console.log(err)
    res.status(500).json(err)
  }
}


export async function getUserProfile (req,res) {
  const count = await getCartTotalQuantity(req,res)
  const wishlist = await wishlistCount(req,res)
  var role = req.session?.role ? req.session.role : "user"
  const username = req.session.user ? req.session.user.username : ""
  res.render('pages/user/profile',{role,count,username,wishlist})
}


export async function editUserAccount (req,res) {
  try{
  const count = await getCartTotalQuantity(req,res)
  const wishlist = await wishlistCount(req,res)
  var role = req.session?.role ? req.session.role : "user"
  const username = req.session.user ? req.session.user.username : ""
  const user = await getUser(req.session.user._id)
  res.render('pages/user/edituserinfo',{role,count,username,user,wishlist})
  }catch(err) {
    console.log(err)
  }
  
}

export async function editUserCredential (req,res) {
  if(!req.body) return res.status(400).json({message:"Username and mobile field is required"})
  const {username , mobile} = req.body
try{
  const user = await getUser(req.session.user._id)
  user.username = username
  user.mobile = mobile
  const response = await user.save();
}catch(err) {
  console.log(err)
}
  if(response) {
    req.session.user.username = username
    res.status(200).json({message: null, data: "Ok"})
  }else{
    res.status(304).json({message: null})

  }
  
}

export async function editPassword (req,res) {
  if(!req.body) return res.status(400).json({message:"Required all field"})
    console.log(req.body)
  const {current_password , new_password, confirm_new_password} = req.body
  if(!current_password || !new_password || !confirm_new_password) {
    return res.status(400).json({message: "Required all * indicated field"})
  }
  try{
  const user = await User.findById(req.session.user._id)
  const isPasswordTrue = await bcrypt.compare(current_password, user.password)
  if(!isPasswordTrue) return res.status(401).json({message:"Current password is incorrect."})
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(new_password, salt);
  user.password = hashedPassword
  const response = await user.save();
  if(response) {
    
    res.status(200).json({message: null, data: "Ok"})
  }else{
    res.status(304).json({message: null})

  }
}catch(err) {
  console.log(err)
  res.status(500).json("Internal server error")
}
}

export async function verifyEditedEMail (req,res) {
  if(!req.body.email) return res.status(400).json({message:"Email is required"})
  try{

  const user = await findUserByEmail(req.body.email)
  if(user) {
    return res.status(409).json({message: "The new email address is already in user"})
  }
  const otp = await sendOTP(req.body.email)
  if(otp) {
    const expireTime = Date.now() + 90 * 1000;
    req.session.emailOTP = {otp, expireTime, email : req.body.email}
    return res.status(200).json({message: null , data: "OTP has been sent you email address . Please verify"})
  
  }else{
    res.status(304).json({message: null})

  }
}catch(err) {
  console.log(err)
  res.status(500).json("Internal server error")
}
}

export async function verifyOtpforEditedEmail (req,res) {
  if(!req.body.otp) return res.status(400).json({message:"OTP is required"})
  const {otp, expireTime , email} = req.session.emailOTP;
  if(Date.now() > expireTime) {
    return res.status(410).json({message: "OTP has been expired. "})
  }
  if(otp === req.body.otp) {
    console.log("otp success")
    try{
      const user = await getUser(req.session.user._id);
      if(user) {
        
        const response = await emailChangesConfirmation(user.email, email,user.username)
        if(response) {
        user.email = email
        await user.save()
        
        return res.status(200).json({message: null, data: "Ok"})
        }
        
      }
    }catch(err) {
      console.log(err)
      res.status(500).json("Internal server error")
    }
  }else{
    res.status(401).json({message: "OTP do not match. please resend"})

  }
  
}

export async function getUserAddress (req,res) {
  
    try{
      const addresses = await findUserAddresses(req.session.user._id);
      if(addresses) {
        const wishlist = await wishlistCount(req,res)
        
        const count = await getCartTotalQuantity(req,res)
        var role = req.session?.role ? req.session.role : "user"
        const username = req.session.user ? req.session.user.username : ""
        res.render('pages/user/useraddress', {count, role, username, addresses,wishlist})
      
      }
    }catch(err) {
      console.log(err)
      res.status(500).json("Internal server error")
    }
 
}

export async function editOneAddressPage (req,res) {
  console.log(req.params.addressid)
  try{
    const wishlist = await wishlistCount(req,res)
    const address = await getOneAddress(req.params.addressid);
    if(address) {
      const count = await getCartTotalQuantity(req,res)
      var role = req.session?.role ? req.session.role : "user"
      const username = req.session.user ? req.session.user.username : ""
      res.render('pages/user/editaddress', {count, role, username, address,wishlist})
    
    }
  }catch(err) {
    console.log(err)
    res.status(500).json("Internal server error")
  }

}


export async function editOneAddress (req,res) {
  if(!req.body) return res.status(400).json({message: "Required all field"})
  const {recipient_name,street_address_line1,street_address_line2, city, postal_code, mobile} = req.body
if(!recipient_name || !street_address_line1 || !street_address_line2 ||
  !city || !postal_code || !mobile 
) {
  return res.status(400).json({message: "Requried all field"})
}
  try{
    const address = await updateOneAddress(req.params.addressid, req.body);
    if(address) {
      
      res.status(200).json({message: null, data: "Ok"})
    
    }
  }catch(err) {
    console.log(err)
    res.status(500).json("Internal server error")
  }

}

export async function removeOneAddress (req,res) {
  console.log("remove address")
  try{
    const response = await deleteOneAddress(req.params.addressid)
    if(response) {
      return res.status(200).json({message: null , data: "Ok"})
    }
    
  }catch(err) {
    console.log(err)
    res.status(500).json("Something went wrong . Please try again later")
  }
}


export async function getAllUserOrder (req,res) {
  
  try{
    const response = await getUserOrders(req.session.user._id)
    if(response) {
      const count = await getCartTotalQuantity(req,res)
        var role = req.session?.role ? req.session.role : "user"
        const username = req.session.user ? req.session.user.username : ""
      return res.status(200).json({count, role, username, response})
    }
    
  }catch(err) {
    console.log(err)
    res.status(500).json("Something went wrong . Please try again later")
  }

}


export async function addToWishList (req,res) {
  
  try{
    const user = await getUser(req.session.user._id)
    if(user) {
      const product = user.wishlist.some(item=> item == req.params.productid)
      if(product) {
        return res.json({message: "Product already added to wishlist"})
      }
      user.wishlist.push(req.params.productid)
      await user.save();
      let wishlistcount = user.wishlist.length 
      return res.status(200).json({message: null, wishlistcount})
    }
    
  }catch(err) {
    console.log(err)
    res.status(500).json("Something went wrong . Please try again later")
  }
}

export async function getWishlist (req,res) {
  
  try{
    const user = await getUser(req.session.user._id)
    if(user) {
      const wishlist = await wishlistCount(req,res)
      const wishlistinfo = await getUserWishlist(req.session.user._id)
      console.log('wishlist info ' , wishlistinfo)
      const count = await getCartTotalQuantity(req,res)
        var role = req.session?.role ? req.session.role : "user"
        const username = req.session.user ? req.session.user.username : ""
      return res.
      render('pages/user/wishlist',
        {
          wishlistinfo,
          count,
          role,
          username,
          wishlist
        }
      )
    }
    
  }catch(err) {
    console.log(err)
    res.status(500).json("Something went wrong . Please try again later")
  }
}




export async function removeFromwishlist (req,res) {
  
  try{
    const user = await getUser(req.session.user._id)
    if(user) {
      const product = user.wishlist.some(item=> item == req.params.productid)
      if(!product) {
        req.flash("warning_msg", "Product not found in the wishlist")
        return res.redirect('/user/wishlist')
      }
      const index = user.wishlist.indexOf(req.params.productid)
      user.wishlist.splice(index, 1)
      const response = await user.save();
      
      return res.redirect('/user/wishlist')
    }
    
  }catch(err) {
    console.log(err)
    res.status(500).json("Something went wrong . Please try again later")
  }
}


export async function getnewProducts (req,res) {
  try{
    
    const response = await getNewProduct()
    console.log("new product",response.length)
    return res.json(response)
  }catch(err) {
    console.log(err)
    res.jon(err)
  }
}

export async function getShopingPage (req,res) {
  const {type, brand,skip = 1,gender,q} = req.query
  console.log(req.query)
      const limit = 12 
     
  try{
    const filter = {isActive: true};
    if(q) {
      filter.$text = {$search: q}
    }
    if(type) {
      filter.type = {$in : type}
    }

    if(brand) {
      filter.brand = {$in : brand}
    }

    if(gender) {
      filter.gender = gender
    }

    console.log(filter)

      const products = await getAllProduct(filter,limit, (skip - 1)* limit)
      let totalPages = products.length / limit
      totalPages = Math.ceil(totalPages)
      console.log(totalPages)
      const wishlist = await wishlistCount(req,res)
      const count = await getCartTotalQuantity(req,res)
        var role = req.session?.role ? req.session.role : "user"
        const username = req.session.user ? req.session.user.username : ""
    res.render('pages/user/shop',{
      username,
      role,
      count,
      wishlist,
      products,
      skip
    })
  }catch(err) {
    console.log(err)
    
  }
  
}


export async function searchProducts (req,res) {
  const limit = 12

  const skip = 0
  console.log("search query",req.query)
  const search = req.query.search

  
  try{

    const products = await searchProduct(search)
      const wishlist = await wishlistCount(req,res)
      const count = await getCartTotalQuantity(req,res)
        var role = req.session?.role ? req.session.role : "user"
        const username = req.session.user ? req.session.user.username : ""
    res.render('pages/user/shop',{
      username,
      role,
      count,
      wishlist,
      products
    })
  }catch(err) {
    console.log(err)
  }
}