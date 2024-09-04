import User from "../models/users.js";
import bcrypt from "bcryptjs";
import passport from "passport";
import Razorpay from "razorpay";
import PDFDocument from "pdfkit";
import Stripe from "stripe";
import { createHmac } from "crypto";
import { Types, isValidObjectId } from "mongoose";
import dotenv from 'dotenv';
dotenv.config()
import {
  addRating,
  addToCart,
  createCart,
  createProductReturn,
  createUser,
  deleteOneAddress,
  deleteUserCart,
  findOrderReturns,
  findUserAddresses,
  findUserByEmail,
  findUserReview,
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

import {
  sendOTP,
  sendOrderSuccessmsg,
  emailChangesConfirmation,
} from "../services/otpSender.js";

import {
  countProductDocuments,
  findPrdoctComments,
  getAllProduct,
  getNewProduct,
  getOneProduct,
  getProductAverageRating,
  getTotalCommentofProduct,
  searchProduct,
  updateStockAvailability,
} from "../helpers/productHelper.js";

import {
  getCartTotalQuantity,
  getTotalCartPriceDiscount,
  hasUserPurchasedProduct,
  wishlistCount,
} from "../utils/util.js";
import {
  findAllCoupons,
  findCouponByCouponCode,
} from "../helpers/couponHelpers.js";
import {
  createOrder,
  findAllOrder,
  findOneOrder,
  getReturnedProduct,
  getUserOrders,
  updateOrder,
} from "../helpers/orderHelper.js";
import { findBanner } from "../helpers/bannerHelper.js";
import {
  ReturnReasonEnum,
  orderStatusEnum,
  returnRefundOptionEnum,
  returnStatusEnum,
} from "../utils/enum.js";
import setcache from "../middleware/cache.js";

// Create razorpay instances
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Function to verify email during signup
export const verfiyEmail = async (req, res, next) => {
  // Check if the request body is empty
  if (!req.body) return res.json({ error: "Required all field" });
  // Destructure the fields from the request body
  const { username, email, password, mobile } = req.body;
  // Check if any field is missing
  
  if (!username.trim() || !email.trim() || !password.trim() || !mobile) {
    return res.json({ error: "Required all field" });
  }
  // Check if a user is already exist with this email
  const isUser = await User.findOne({ email: email });

  if (isUser) {
    res.json({ error: "Email already in use. Please choose another one" });
    return;
  }
  try {
    // Sending otp to the user provided email
    const otp = await sendOTP(email);
    // storing the info inside session
    req.session.signupInfo = { email, password, username, mobile };
    // Creating timeout 90 second
    let expireTime = Date.now() + 5 * 60 * 1000;
    // Store it in the session
    req.session.emailOTP = { otp, expireTime };
    res.json({ error: null });
  } catch (err) {
    next(err);
  }
};

// Get signuppage
export async function getSignupPage(req, res, next) {
  try {
    // Set cache control headers to prevent caching
    setcache(req,res)
    const count = await getCartTotalQuantity(req, res, next);
    const wishlist = 0;
    var role = req.session?.role ? req.session.role : "user";
    const username = req.session.user ? req.session.user.username : "";
    res.render("pages/user/register", { count, role, username, wishlist });
  } catch (err) {
    next(err);
  }
}
// Function to handle user signup
export const userSignup = async (req, res, next) => {
  try {
    // Check if the OTP is valid and not expired
    if (req.session?.emailOTP?.otp === req.body.otp) {
      if (req.session?.emailOTP?.expireTime < Date.now()) {
        return res.status(403).json({ error: "OTP expired. Please resend." });
      }
      if(!req.session.signupInfo) {
        return res.status(401).json({error: 'redirect', url:'/auth/signup'})
      }
      // Get the password from the session signup info
      const { password } = req.session.signupInfo;
      // Generate a salt for hashing the password
      const salt = await bcrypt.genSalt(10);
      //  Hash the password
      const hashedPassword = await bcrypt.hash(password, salt);
      // Update the password in the session signup info with the hashed password
      req.session.signupInfo.password = hashedPassword;
      // Create a new user with the signup info
      req.session.signupInfo.wallet = {balance : 0, transactions : []}
      let response = await createUser(req.session.signupInfo);

      if (response.error) {
        // Send error
        res.status(401).json({ error: response.error });
        return;
      } else {
        // Delte signupinfo
        req.session.signupInfo = null;
        delete req.session.signupInfo;
        
        // Merge guest cart if there's any
        if (req.session.guest) {
          const data = await mergeGuestCart(
            response.user._id,
            req.session.guest
          );
          
        }
        return res.status(200).json({data: "Ok", url:"/auth/login"});
      }
    } else {
      return res.status(401).json({
        error: "Wrong OTP entered",
      });
    }
  } catch (err) {
    if (err.name === "ValidationError") {
      // Handle validation errors
      // res.status(400).send({ errors: 'Validation error', details: err.errors });
      const validation_error = {};
      for (const key in err.errors) {
        validation_error[key] = err.errors[key].message;
      }
      return res.status(400).json({ error: null, validation_error: validation_error });
    } else {
      // Handle other errors
      next(err);
    }
  }
};

// Get the otp verify page
export const otpverify = async (req, res, next) => {
  try {
    setcache(req,res)
    if(!req.session.signupInfo) {
      return res.redirect('/auth/signup')
    }
    const count = await getCartTotalQuantity(req, res, next);
    const wishlist = 0;
    var role = req.session?.role ? req.session.role : "user";
    return res.render("pages/user/verifyemail", {
      username: "",
      wishlist,
      role,
      count,
    });
  } catch (err) {
    next(err);
  }
};

export const resendOTP = async (req, res, next) => {
  try {
    if (req.session.signupInfo) {
      const otp = await sendOTP(req.session.signupInfo.email);
      let expireTime = Date.now() + 90 * 1000;
      req.session.emailOTP = { otp, expireTime };
      return res.status(200).json({ error: null, data: "otp send to your email address" });
    } else {
      req.flash("warning_msg", "Please signup");
      res.redirect("/auth/signup");
    }
  } catch (err) {
    next(err);
  }
};

// Function to render the login page with appropriate cache settings
export async function getLoginPage(req, res, next) {
  // Set cache control headers to prevent caching
  setcache(req,res)
  try {
    const count = await getCartTotalQuantity(req, res, next);
    const wishlist = 0; // Initialize wishlist count

    return res.render("pages/user/login", {
      username: req.session.user ? req.session.username : "",
      count,
      role: "user",
      wishlist,
    });
  } catch (err) {
    
    next(err);
  }
}

// Function to handle user login
export const userLogin = async (req, res, next) => {
  // Destructure email and password from the request body
  const { email, password } = req.body;
  // Check if request body, email or password is missing
  if (!req.body || !email.trim() || !password.trim()) {
    res.status(400).json({message: "Required all field"})
    return;
  }
  // Attempt to login the user with provided credentials
  try {
    const response = await loginUser(req.body);
    //Error if the user is not in the database
    if (response?.error) {
      
      return res.status(400).json({message: response.error})
    } else {
      const { username, email, _id } = response.user;
      if (req.session.guest) {
        await mergeGuestCart(_id, req.session.guest);
        req.session.guest = null;
        delete req.session.guest;
      }
      
      // Store the user information in the session user after successfull login
      req.session.user = { username, email, _id };
      req.session.role = "user";
      return res.status(200).json({url : '/'})
    }
  } catch (err) {
    return res.status(500).json("Something went wrong.")
  }
};

// Function to handle Google authentication callback
export const googleCallback = (req, res, next) => {
  passport.authenticate("google", { failureRedirect: "/login" })(
    req,
    res,
    next
  );

  res.redirect("/");
};

// Function to render the main landing page
export async function getMainLandingPage(req, res, next) {
  setcache(req,res)
  try {
    const brandname = [
      { label: 'ROLEX', value: 'rolex' },
      { label: 'BOAT', value: 'boat' },
      { label: 'FOSSIL', value: 'fossil' },
      { label: 'TISSOT', value: 'tissot' },
      { label: 'ARMANI EXCHANGE', value: 'armani-exchange' },
      { label: 'GUESS', value: 'guess' },
      
  ]
    const wishlist = await wishlistCount(req, res, next); // Get wishlist count
    const banners = await findBanner({isActive:true}); // Get banner data

    let products = await getNewProduct(6); // Get new product
    const count = await getCartTotalQuantity(req, res, next);
    const wallet = await findCouponByCouponCode("WALLET");
    products = products?.length > 0 ? products : [];
    var role = "user";
    res.render("pages/user/main", {
      username: req.session.user ? req.session.user.username : "",
      products,
      count,
      role,
      wishlist,
      banners,
      wallet: wallet || "",
      brandname
    });
  } catch (err) {
    next(err);
  }
}

// Function to handle 404 (page not found)
export async function pageNotFound(req, res, next) {
  let username = "";
  if (req.session.user) {
    username = req.session.user.username;
  } else if (req.session.admin) {
    username = req.session.admin.username;
  }

  try {
    const count = await getCartTotalQuantity(req, res, next);
    const wishlist = await wishlistCount(req, res, next);
    res.render("partials/message/pagenotfound", {
      status: 404,
      error: "Requested page not found",
      wishlist,
      role: "user",
      count,
      username,
    });
  } catch (err) {
    next(err);
  }
}

// Function to view a specific product
export async function viewProduct(req, res, next) {
  const { productid } = req.params;
  const role = "user";
  try {
    if (!isValidObjectId(productid)) {
      req.flash("warning_msg", "Something went wrong");
      return res.redirect(`/product/${productid}`);
    }

    let product = await getOneProduct(productid); // Get the product
    const wishlist = await wishlistCount(req, res, next); // Get the wishlist count
    let count = await getCartTotalQuantity(req, res, next); // Get cart total product count
    const rating = await getProductAverageRating(productid);
    const totalcomments = await getTotalCommentofProduct(productid)
    
    const comments = await findPrdoctComments(productid);
    const returndays = 7;
    if (product) {
      return res.render("pages/user/viewproduct", {
        username: req.session.user ? req.session.user.username : "",
        product,
        count,
        role: role,
        wishlist,
        rating: rating[0]?.averagerating || 0,
        comments: comments || [],
        returndays,
        totalcomments
      });
    } else {
      return res.redirect("/page-not-found");
    }
  } catch (err) {
    next(err);
  }
}

// function to handle product to cart
export async function addProductToCart(req, res, next) {

  var role = req.session?.role ? req.session.role : "user";
  const { productid } = req.params;
  // Check the user loggedIn

  try {
    if (req.session?.user) {
      const { _id } = req.session.user;
      const response = await getUserCart(_id);
      // Calculate the total product
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
      // Cart length greater than 0 ,
      if (response?.cart_products?.length > 0) {
        // Add product or increment the quantity
        await addToCart(_id, productid, 1);
      } else {
        // Create new cart
        let cartitem = [{ productid, quantity: 1 }];
        await createCart(_id, cartitem);
      }
      // Get the cart price info
      const cartpriceinfo = await getTotalCartPriceDiscount(req, res, next);

      // Destructure Cart discount totalprice , actualprice(originaltotalprice)  ,
      // isAllavailable means all product stock quantity is available
      const { totalprice, totaldiscount, actualprice, isAllAvailable } =
        cartpriceinfo;
      res.json({
        error: null,
        response: {
          data: "Ok",
          count: count + 1,
          totaldiscount,
          totalprice,
          actualprice,
          isAllAvailable,
          role: role,
        },
      });
    } else {
      // Check the guest cart
      if (req.session.guest) {
        const guest = req.session.guest;
        const totalquantity = await getCartTotalQuantity(req, res, next);
        // Send response if the total cart product quantity exceeds its limit
        if (totalquantity === 6) {
          res.json({ error: "We're sorry! Only 6 unit(s) allowed each order" });
          return;
        }
        // find the product from guest cart
        const isProduct = guest.find((item) => item.productid === productid);
        if (isProduct) {
          // if product in the guest cart increment the product quantity by 1
          isProduct.quantity++;
        } else {
          // Add new product to the cart
          req.session.guest.push({ productid: productid, quantity: 1 });
        }
        // Get the cart price info
        const cartpriceinfo = await getTotalCartPriceDiscount(req, res, next);

        const {
          count,
          totalprice,
          totaldiscount,
          actualprice,
          isAllAvailable,
        } = cartpriceinfo;
        res.json({
          error: null,
          response: {
            data: "Ok",
            count: count,
            totalprice,
            totaldiscount,
            actualprice,
            isAllAvailable,
            role: role,
          },
        });
      } else {
        // If guest cart is not created, create a guest cart
        req.session.guest = [];
        req.session.guest.push({ productid: productid, quantity: 1 });
        const cartpriceinfo = await getTotalCartPriceDiscount(req, res, next);

        const {
          count,
          totalprice,
          totaldiscount,
          actualprice,
          isAllAvailable,
        } = cartpriceinfo;
        res.json({
          error: null,
          response: {
            data: "Ok",
            count: 1,
            totaldiscount,
            totalprice,
            actualprice,
            isAllAvailable,
            role: role,
          },
        });
      }
    }
  } catch (err) {
    next(err);
  }
}

// Get user cart page
export async function getUserCartPage(req, res, next) {
  setcache(req,res)
  let shipping_charge;
  var role = "user";

  // Get wishlist product total count
  try {
    const wishlist = await wishlistCount(req, res, next);

    // If cart_charge_offer not created in the session , create
    if (!req.session.cart_charge_offer) {
      req.session.cart_charge_offer = {
        shipping_charge: 200,
        coupon_discount: [],
      };
    }
    // Assign shipping charge from session cart_charge_offer
    shipping_charge = req.session.cart_charge_offer.shipping_charge;

    // check the user is in the session, get User cart details from the database
    if (req.session?.user) {
      let username = req.session.user.username;
      const cart = await getUserCart(req.session.user._id);

      const cartpriceinfo = await getTotalCartPriceDiscount(req, res, next);

      const { count, totalprice, totaldiscount, actualprice, isAllAvailable } =
        cartpriceinfo;
      res.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
      res.set("Surrogate-Control", "no-store");

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
        wishlist,
      });
    } else if (req.session.guest) {
      //  If guest user in the session
      let cartproducts = [];
      const guest = req.session.guest;
      // get product details from the database
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

      const cartpriceInfo = await getTotalCartPriceDiscount(req, res, next);
      if (cartpriceInfo) {
        const {
          count,
          totalprice,
          totaldiscount,
          actualprice,
          isAllAvailable,
        } = cartpriceInfo;
        return res.render("pages/user/cart", {
          username: "",
          products: cartproducts,
          totalprice,
          count,
          actualprice,
          totaldiscount,
          isAllAvailable,
          role: role,
          shipping_charge,
          wishlist,
        });
      }
    } else {
      // if the cart is null
      return res.render("pages/user/cart", {
        username: "",
        products: [],
        count: 0,
        role,
        wishlist,
        isAllAvailable : true
      });
    }
  } catch (err) {
    next(err);
  }
}

// Funtion to handle logout
export function logout(req, res, next) {
  
  // Set cache control headers to prevent caching
  setcache(req,res)
  req.session.user = null;
  req.session.role = null;
  res.redirect("/");
}

//Funtion to handle Remove product from cart
export async function removeProductfromCart(req, res, next) {
  const { productid } = req.params;
  var role = req.session?.role ? req.session.role : "user";
  var response;
  try {
    // Check if the user is loggedIn
    if (req.session?.user) {
      const { _id } = req.session.user;

      const cart = await getUserCart(req.session.user._id);
      // Check if user has the cart
      if (!cart) {
        return res.json({ error: "Cart not found" });
      }
      // Find product from the cart
      const product = cart.cart_products.find(
        (item) => item.productid === productid
      );
      // If the product only can't decreement
      if (product?.quantity === 1) {
        return res.json({ message: "Only one product can't decrement" });
      }
      // Decrement the product
      response = await addToCart(_id, productid, -1);
    } else if (req.session.guest) {
      // Check the guest cart in the session
      const product = req.session.guest.find(
        (item) => item.productid == productid
      );
      // Product quatity is 1 , Cannot decrement
      if (product?.quantity === 1) {
        return res.json({
          message: "Can't decrement!. Only one product in the cart",
        });
      }
      // Else decrement the product
      product.quantity--;
      response = "Ok";
    }

    if (response) {
      const priceInfo = await getTotalCartPriceDiscount(req, res, next);

      const { totalprice, totaldiscount, actualprice, isAllAvailable, count } =
        priceInfo;
      res.status(200).json({
        message: null,
        response: "Ok",
        totalprice,
        totaldiscount,
        actualprice,
        count,
        isAllAvailable,
        role: role,
      });
    }
  } catch (err) {
    next(err);
  }
}

// Delete product from cart
export async function removeCartProduct(req, res, next) {
  const { productid } = req.params;

  try {
    // Check the user is loggedIn
    if (req.session.user) {
      const { _id } = req.session.user;

      // Remove one item from cart
      await removeOneCartITem(_id, productid);
    } else if (req.session.guest) {
      // Check the guest cart
      // Remove one proudct from cart
      const pro = req.session.guest.filter(
        (item) => item.productid !== productid
      );
      req.session.guest = pro;
    }
    // Get the cart price details
    const cartpriceInfo = await getTotalCartPriceDiscount(req, res, next);

    const { totalprice, totaldiscount, actualprice, isAllAvailable, count } =
      cartpriceInfo;

    res.status(200).json({
      message: null,
      response: "Ok",
      totalprice,
      totaldiscount,
      actualprice,
      count,
      isAllAvailable,
    });
  } catch (err) {
    next(err);
  }
}

// function to render the checkout page
export async function getCheckoutPage(req, res, next) {
  setcache(req,res)
  try {
    // Get the cart price details
    const cartpriceInfo = await getTotalCartPriceDiscount(req, res, next);

    if(!cartpriceInfo.isAllAvailable) {
      return res.redirect('/cart')
    }
    const cart = await getUserCart(req.session.user._id);
    if (cart === null) return res.redirect("/");
    const wishlist = await wishlistCount(req, res, next); // Get the wishlist product count
    var role = req.session?.role ? req.session.role : "user";

    if (!cart) {
      req.flash("warning_msg", "User cart not found");
      res.redirect("/user/cart");
    }
    // Get all the cart products
    const products = cart.cart_products || [];
    // Get all the isActive true coupons
    const currentDate = new Date()
    const coupons = await findAllCoupons({
      isActive: true,
      coupon_code: { $ne: "WALLET" },
      valid_till : {$gte : currentDate}
    });
    console.log(coupons);
    

    
    // Get the cart price details
    const response = await getTotalCartPriceDiscount(req, res, next);
    // Get user addresses
    const addresses = await findUserAddresses(req.session.user._id);
    const user = await getUser(req.session.user._id);
    const wallet = user.wallet.balance;
    const {
      isAllAvailable,
      totalprice,
      totaldiscount,
      actualprice,
      count,
      shipping_charge,
      coupon_discount,
    } = response;
    const username = req.session.user.username;
    res.render("pages/user/checkout", {
      role: role,
      username,
      addresses,
      isAllAvailable,
      coupons,
      count,
      products,
      totalprice,
      totaldiscount,
      actualprice,
      shipping_charge,
      coupon_discount,
      wishlist,
      wallet,
    });
  } catch (err) {
    next(err);
  }
}

// Funtion to render adding a address page
export async function getAddressPage(req, res, next) {
  setcache(req,res)
  var role = req.session?.role ? req.session.role : "user";
  const username = req.session.user.username;
  try {
    const count = await getCartTotalQuantity(req, res, next);
    const wishlist = await wishlistCount(req, res, next);
    res.render("pages/user/addressform", {
      role: role,
      username,
      count,
      wishlist,
    });
  } catch (err) {
    next(err);
  }
}

// Function to hanlde inserting address to the database
export async function addNewAddress(req, res, next) {
  setcache(req,res)
  if (!req.body) {
    return res.status(400).json({ error: "formData not found" });
  }
  req.body.userid = req.session.user._id;
  try {
    const response = await insertAddress(req.body);
    if (response) {
      return res.json({ error: null, data: response });
    }
  } catch (err) {
    res.status(500).json("Something went wrong. Please try again later");
  }
}

// Function to apply coupons to the user from the checkout page
export async function applyCoupons(req, res, next) {
  // Extract coupon code from the request body
  const { coupon_code } = req.body;
  try {
    // Find coupon details using the coupon code
    const coupon = await findCouponByCouponCode(coupon_code);
    if (!coupon) {
      // Return an error response if the coupon is not found
      return res.status(400).json({
        message: "Coupon not found. Please Type a valid coupon code!",
      });
    }

    // Check if the coupon has already been applied
    const isTrue = req.session.cart_charge_offer?.coupon_discount.some(
      (item) => item.coupon_code === coupon_code
    );
    if (isTrue) {
      // Return an error response if the coupon is already applied
      return res.status(403).json({ message: "The coupon is alread applied" });
    }
    // Get the total cart price and discount
    const response = await getTotalCartPriceDiscount(req, res, next);

    const { totalprice } = response;
    // Apply the coupon based on its discount type
    if (coupon.discount_type === "free_shipping") {
      if (totalprice >= coupon.minimum_purchase_value) {
        req.session.cart_charge_offer.shipping_charge = 0;
        req.session.cart_charge_offer.coupon_discount.push({
          _id: coupon._id,
          coupon_code,
          discount: 0,
        });
      } else {
        return res
          .status(403)
          .json({ message: "Not eligible for free shipping" });
      }
    } else if (coupon?.discount_type === "percentage") {
      if (
        totalprice >= coupon?.minimum_purchase_value &&
        (coupon.maximum_purchase_value == 0 ||
          totalprice <= coupon.maximum_purchase_value
        )
      ) {
        let value = (totalprice * coupon.discount_value) / 100;
        req.session.cart_charge_offer.coupon_discount.push({
          _id: coupon._id,
          coupon_code,
          discount: Math.round(value),
        });
      } else {
        return res
          .status(403)
          .json({ message: "Not eligible for this coupon" });
      }
    } else if (coupon.discount_type === "fixed_amount") {
      if (
        totalprice >= coupon.minimum_purchase_value &&
        (coupon.maximum_purchase_value == 0 ||
          totalprice <= coupon.maximum_purchase_value
        )
      ) {
        req.session.cart_charge_offer.coupon_discount.push({
          _id: coupon._id,
          coupon_code,
          discount: Math.round(coupon.discount_value),
        });
      } else {
        return res
          .status(403)
          .json({ message: "Not eligible for this coupon" });
      }
    }
    // Get the updated total cart price and discount information
    const priceInfo = await getTotalCartPriceDiscount(req, res, next);

    const {
      totalprice: grandtotal,
      shipping_charge,
      coupon_discount,
    } = priceInfo;
    // Return the updated cart price and discount information
    return res.status(200).json({
      message: null,
      totalprice: grandtotal,
      shipping_charge,
      coupon_discount,
    });
  } catch (err) {
    return res.status(500).json("Something went wrong. Please try again later");
  }
}

// Function to place an order
export async function placeOrder(req, res, next) {
  
  const { _id } = req.session.user;
  let orderedproducts = [];
  if (!req.body) {
    // Return an error response if the request body is missing
    return res
      .status(400)
      .json({ message: "Please choose a Delivery address" });
  }

  const { payment_method, addressId } = req.body;
  if (!addressId)
    return res
      .status(400)
      .json({ message: "Please choose a valid shipping address" });
  if (!payment_method)
    return res.status(400).json({ message: "Please choose payment method" });
  try {
    // Get the total cart price and discount information
    const cartpriceinfo = await getTotalCartPriceDiscount(req, res, next);
    // Get the user's cart details
    let cart = await getUserCart(_id);
    if(!cart) {
      res.status(403).json({message: "redirect"})
    }
    const { totalprice, coupon_discount, shipping_charge } = cartpriceinfo;
    if (payment_method === "wallet") {
      const user = await getUser(_id);
      const walletmoney = user.wallet.balance;
      if (walletmoney > totalprice) {
        
        for (const { productid, quantity } of cart.cart_products) {
          const product = await getOneProduct(productid._id);
          let price = product.price;
          if (product.discount_in_percentage !== 0) {
            price = Math.round(
              product.price -
                (product.price * product.discount_in_percentage) / 100
            );
          }
          let obj = { productid: productid._id, quantity, price };
          orderedproducts.push(obj);
          await updateStockAvailability(productid, quantity);
        }

        let obj = {
          userId: _id,
          products: orderedproducts,
          totalPrice: totalprice,
          orderStatus: orderStatusEnum.PLACED,
          addressId: req.body.addressId,
          couponDiscount: coupon_discount,
          shippingCharge: shipping_charge,
          payment_method: "Wallet",
        };

        const order = await createOrder(obj);
        if (order) {
          await deleteUserCart(_id); // Delete the user cart
          const obj2 = {
            amount: totalprice,
            description: "Paid to order watches",
            status: "Paid",
            createdAt: new Date(),
          };
          user.wallet.balance -= totalprice;
          user.wallet.transactions.push(obj2);
          await user.save();
          const orders = await getUserOrders(_id);
          if (orders.length === 1) {
            const wallet = await findCouponByCouponCode("WALLET");
            if (wallet) {
              const obj = {
                amount: wallet.discount_value,
                description: "Discount on first purchase",
                status: "Received",
                createdAt: new Date(),
              };
              user.wallet.balance += wallet.discount_value;
              user.wallet.transactions.push(obj);
              await user.save();
            }
          }
          // Send order success email to the user
          const ordermail = sendOrderSuccessmsg(
            user.email,
            user.username,
            order._id
          );
          // Clear the cart charge offer session
          req.session.cart_charge_offer = {};
          delete req.session.cart_charge_offer;
          return res
            .status(200)
            .json({ order, status: order.orderStatus, orderid: order._id });
        }
      } else {
        res.status(403).json({
          message: `Not allowed to place the order. Due to insufficient fund 
        in the wallet. Please choose another paymethod method`,
        });
      }
    } else if (payment_method === "Razorpay") {
      
      for (const { productid, quantity } of cart.cart_products) {
        const product = await getOneProduct(productid._id);
        let price = product.price;
        if (product.discount_in_percentage !== 0) {
          price = Math.round(
            product.price -
              (product.price * product.discount_in_percentage) / 100
          );
        }
        let obj = { productid, quantity, price };
        orderedproducts.push(obj);
      }
      // Create the order object
      let obj = {
        userId: _id,
        products: orderedproducts,
        totalPrice: totalprice,
        orderStatus: orderStatusEnum.PENDING,
        addressId: req.body.addressId,
        couponDiscount: coupon_discount,
        shippingCharge: shipping_charge,
        payment_method: payment_method,
      };
      // Create a new order in the database
      const order = await createOrder(obj);
      if (order) {
        // Create a payment order using a payment gateway instance
        const options = {
          amount: totalprice * 100,
          currency: "INR",
          receipt: order._id,
        };
        instance.orders.create(options, (err, orderRazorpay) => {
          if (err) return res.status(401).json("Unauthorized access. Please check your credentials and try again.");

          res
            .status(200)
            .json({ order: orderRazorpay, status: order.orderStatus }); // Return the payment order details
        });
      }
    } else if(payment_method === "Stripe") {
      let quantityamt = 0
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
      for (const { productid, quantity } of cart.cart_products) {
        const product = await getOneProduct(productid._id);
        let price = product.price;
        if (product.discount_in_percentage !== 0) {
          price = Math.round(
            product.price -
              (product.price * product.discount_in_percentage) / 100
          );
        }
        quantityamt += quantity
        let obj = { productid, quantity, price };
        orderedproducts.push(obj);
      }
      // Create the order object
      let obj = {
        userId: _id,
        products: orderedproducts,
        totalPrice: totalprice,
        orderStatus: orderStatusEnum.PENDING,
        addressId: req.body.addressId,
        couponDiscount: coupon_discount,
        shippingCharge: shipping_charge,
        payment_method: payment_method,
      };
      // Create a new order in the database
      const order = await createOrder(obj);
      if(order) {
        const session = await stripe.checkout.sessions.create({
          line_items: [
            {
              
              // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
              price_data: {
                currency: "INR",
                product_data : {
                  name : "Total Order"
                },
                unit_amount : totalprice * 100
              },
              quantity : 1,
              
            },
            
          ],
          mode: 'payment',
          success_url: `${req.headers.origin}/order/stripe/verify-payment/${order._id}`,
          cancel_url: `${req.headers.origin}/order/cancelled/${order._id}`,
          shipping_address_collection : {
            allowed_countries: ['IN']
          }
        })
        return res.status(200).json({stripeurl: session.url,status: "stripe"})
      }
      
      
    }
  } catch (err) {
    return res.status(500).json("Something went wrong. Please try again later");
  }
}

// Function to handle stripe verify payment 
export async function stripeVerifyPayment (req,res,next) {
  const {orderid} = req.params
  const {email, username} = req.session.user
  try{
  const order = await findOneOrder(orderid);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      // Update stock availability for each product in the order
      for (const { productid, quantity } of order.products) {
        await updateStockAvailability(productid._id, quantity);
      }
      // Update order status to 'placed'
      await updateOrder(orderid, { orderStatus: orderStatusEnum.PLACED });

      await deleteUserCart(req.session.user._id); // Delete the user cart
      const orders = await getUserOrders(req.session.user._id);
      // If user order is 1 , adding wallet
      if (orders.length === 1) {
        let user = await getUser(req.session.user._id);
        const wallet = await findCouponByCouponCode("WALLET");

        if (wallet) {
          const obj = {
            amount: wallet.discount_value,
            description: "Discount on first purchase",
            status: "Received",
            createdAt: new Date(),
          };
          user.wallet.balance += wallet.discount_value;
          user.wallet.transactions.push(obj);
          await user.save();
        }
      }
      // Send order success email to the user
      sendOrderSuccessmsg(email, username, orderid);
      // Clear the cart charge offer session
      req.session.cart_charge_offer = {};
      delete req.session.cart_charge_offer;

      return res.redirect(`/order/confirmation/${orderid}`)
    } catch (err) {
      next(err)
    }
}
// Function to verify payment
export async function verfiyPayment(req, res, next) {
  if (!req.body)
    return res.status(400).json({ message: "Payment details not found" });
  const { response, orderid } = req.body; // Extract response and order ID from the request body
  const { email, _id, username } = req.session.user; // Get user details from the session
  // Create HMAC to verify the payment signature
  let hma = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  hma.update(
    response["razorpay_order_id"] + "|" + response["razorpay_payment_id"]
  );
  hma = hma.digest("hex");
  // Check if the generated HMAC matches the Razorpay signature
  if (hma == response["razorpay_signature"]) {
    try {
      // Find the order using the order ID
      const order = await findOneOrder(orderid);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      // Update stock availability for each product in the order
      for (const { productid, quantity } of order.products) {
        await updateStockAvailability(productid._id, quantity);
      }
      // Update order status to 'placed'
      await updateOrder(order._id, { orderStatus: orderStatusEnum.PLACED });

      await deleteUserCart(_id); // Delete the user cart
      const orders = await getUserOrders(_id);
      // If user order is 1 , adding wallet
      if (orders.length === 1) {
        let user = await getUser(req.session.user._id);
        const wallet = await findCouponByCouponCode("WALLET");

        if (wallet) {
          const obj = {
            amount: wallet.discount_value,
            description: "Discount on first purchase",
            status: "Received",
            createdAt: new Date(),
          }; 
          user.wallet.balance += wallet.discount_value;
          user.wallet.transactions.push(obj);
          await user.save();
        }
      }
      // Send order success email to the user
      sendOrderSuccessmsg(email, username, order._id);
      // Clear the cart charge offer session
      req.session.cart_charge_offer = {};
      delete req.session.cart_charge_offer;

      return res.status(200).json({
        message: null,
        response: {
          success: "Order placed successfully",
          orderid: order._id,
        },
      });
    } catch (err) {
      return res
        .status(500)
        .json("Something went wrong. Please try again later");
    }
  } else {
    return res
      .status(401)
      .json({ message: "Razorpay payment signature does not match" });
  }
}

// Function handle stripe order cancelled
export async function orderCancelled (req,res, next) {
  const {orderid} = req.params
  try{
    const role = "user"
    const username = req.session?.user?.username || ""
    const wishlist = await wishlistCount(req, res, next); // Get the wishlist count
    let count = await getCartTotalQuantity(req, res, next); // Get cart total product count
    await updateOrder(orderid, {orderStatus: orderStatusEnum.FAILED})
    return res.render('pages/user/paymentFailed', {
      role,
      wishlist,
      count,
      username
    })
  }catch(err) {
    next(err)
  }
}
// Function to handle failed payments
export async function paymentFailed(req, res, next) {
  if (!req.body)
    return res.status(400).json({ message: "Payment details not found" });
  const { response, orderid } = req.body;

  try {
    const order = await findOneOrder(orderid); // Find the order using the order ID
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // Update order status to 'failed'
    order.orderStatus = orderStatusEnum.FAILED;
    const update = await order.save();
    if (update) {
      res.status(200).json({ message: null, response: { data: "Ok" } });
    }
  } catch (err) {
    res.status(500).json("Something went wrong. Please try again later");
  }
}

// Function to render the order confirmation page
export async function orderSuccess(req, res, next) {
  if (!req.params.orderid) return res.redirect("/");
  try {
    const order = await findOneOrder(req.params.orderid);
    const count = await getCartTotalQuantity(req, res, next);
    const wishlist = await wishlistCount(req, res, next);
    var role = "";
    const username = req.session.user ? req.session.user.username : "";

    res.render("pages/user/orderSuccess", {
      role,
      count,
      username,
      wishlist,
      order,
    });
  } catch (err) {
    next(err);
  }
}

// Function to render the user profile page
export async function getUserProfile(req, res, next) {
  setcache(req,res)
  try {
    const count = await getCartTotalQuantity(req, res, next);
    const wishlist = await wishlistCount(req, res, next);
    var role = "profile";
    const username = req.session.user ? req.session.user.username : "";
    const user = await getUser(req.session.user._id);
    res.render("pages/user/profile", { role, count, username, wishlist, user });
  } catch (err) {
    next(err);
  }
}

// // Function to render the edit user account page
// export async function editUserAccount(req, res, next) {
//   setcache(req,res)
//   try {
//     const count = await getCartTotalQuantity(req, res, next);
//     const wishlist = await wishlistCount(req, res, next);
//     var role = "profile";
//     const username = req.session.user ? req.session.user.username : "";
//     const user = await getUser(req.session.user._id); // Get user details from the database
//     res.render("pages/user/edituserinfo", {
//       role,
//       count,
//       username,
//       user,
//       wishlist,
//     });
//   } catch (err) {
//     next(err);
//   }
// }

// Function to edit user credentials
export async function editUserCredential(req, res, next) {
  if (!req.body)
    return res
      .status(400)
      .json({ message: "Username and mobile field is required" });
  const { username, mobile } = req.body;
  try {
    const user = await getUser(req.session.user._id); // Get user details
    console.log(user);
    
    user.username = username; // Update username
    user.mobile = mobile; // Update mobile number
    
    const response = await user.save();
    if (response) {
      req.session.user.username = username; // Update session username
      res.status(200).json({ message: null, data: "Ok" });
    } else {
      res.status(304).json({ message: null });
    }
  } catch (err) {
    console.log(err);
    
    res.status(500).json("Something went wrong. Please try again later");
  }
}

// Function to edit user password
export async function editPassword(req, res, next) {
  if (!req.body) return res.status(400).json({ message: "Required all field" });
  const { current_password, new_password, confirm_new_password } = req.body;
  if (!current_password || !new_password || !confirm_new_password) {
    return res.status(400).json({ message: "Required all * indicated field" });
  }
  try {
    // Find user by Id
    const user = await User.findById(req.session.user._id);
    // Verify current password
    const isPasswordTrue = await bcrypt.compare(
      current_password,
      user.password
    );
    // Check the current password is true
    if (!isPasswordTrue)
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });
    const salt = await bcrypt.genSalt(10);
    // Hash the new password
    const hashedPassword = await bcrypt.hash(new_password, salt);
    user.password = hashedPassword;
    const response = await user.save(); // Save the updated user information
    if (response) {
      res.status(200).json({ message: null, data: "Ok" });
    } else {
      res.status(304).json({ message: null });
    }
  } catch (err) {
    res.status(500).json("Something went wrong. Please try again later");
  }
}

// Function to verify edited email address
export async function verifyEditedEMail(req, res, next) {
  if (!req.body.email)
    return res.status(400).json({ message: "Email is required" });
  try {
    // Check if the email already exists in the database
    const user = await findUserByEmail(req.body.email);
    if (user) {
      return res
        .status(409)
        .json({ message: "The new email address is already in user" });
    }
    // Send OTP to the new email address
    const otp = await sendOTP(req.body.email);
    if (otp) {
      // Set OTP expiration time (90 seconds)
      const expireTime = Date.now() + 90 * 1000;
      // Store OTP details in the session
      req.session.emailOTP = { otp, expireTime, email: req.body.email };
      return res.status(200).json({
        message: null,
        data: "OTP has been sent you email address . Please verify",
      });
    } else {
      res.status(304).json({ message: null });
    }
  } catch (err) {
    res.status(500).json("Something went wrong. Please try again later");
  }
}

// Function to verify the OTP for the edited email address
export async function verifyOtpforEditedEmail(req, res, next) {
  if (!req.body.otp)
    return res.status(400).json({ message: "OTP is required" });
  // Get OTP details from the session
  const { otp, expireTime, email } = req.session.emailOTP;
  if (Date.now() > expireTime) {
    return res.status(410).json({ message: "OTP has been expired. " });
  }
  if (otp === req.body.otp) {
    try {
      // Get user from the database
      const user = await getUser(req.session.user._id);
      if (user) {
        // Send the otp changes confirmation
        const response = await emailChangesConfirmation(
          user.email,
          email,
          user.username
        );
        if (response) {
          // Update the user's email
          user.email = email;
          await user.save();

          return res.status(200).json({ message: null, data: "Ok" });
        }
      }
    } catch (err) {
      res.status(500).json("Something went wrong. Please try again later");
    }
  } else {
    res.status(401).json({ message: "OTP do not match. please resend" });
  }
}

// Function to get user addresses
export async function getUserAddress(req, res, next) {
  setcache(req,res)
  try {
    // Get user addresses from the database
    const addresses = await findUserAddresses(req.session.user._id);
    if (addresses) {
      const wishlist = await wishlistCount(req, res, next); // Get wishlist count
      // Get cart product total quantity
      const count = await getCartTotalQuantity(req, res, next);
      var role = "profile";
      const username = req.session.user ? req.session.user.username : "";
      res.render("pages/user/useraddress", {
        count,
        role,
        username,
        addresses,
        wishlist,
      });
    }
  } catch (err) {
    res.status(500).json("Something went wrong. Please try again later");
  }
}

// Function to render the edit address page for a specific address
export async function editOneAddressPage(req, res, next) {
  setcache(req,res)
  try {
    const wishlist = await wishlistCount(req, res, next); // Get wishlist count
    // Get address details by Id
    const address = await getOneAddress(req.params.addressid);
    if (address) {
      // Get cart product total quantity
      const count = await getCartTotalQuantity(req, res, next);
      var role = "profile";
      const username = req.session.user ? req.session.user.username : "";
      res.render("pages/user/editaddress", {
        count,
        role,
        username,
        address,
        wishlist,
      });
    }
  } catch (err) {
    res.status(500).json("Something went wrong. Please try again later");
  }
}

// Function to edit a specific address
export async function editOneAddress(req, res, next) {
  if (!req.body) return res.status(400).json({ message: "Required all field" });
  const {
    recipient_name,
    street_address_line1,
    street_address_line2,
    city,
    postal_code,
    mobile,
  } = req.body;
  if (
    !recipient_name ||
    !street_address_line1 ||
    !street_address_line2 ||
    !city ||
    !postal_code ||
    !mobile
  ) {
    return res.status(400).json({ message: "Requried all field" });
  }
  try {
    const address = await updateOneAddress(req.params.addressid, req.body);
    if (address) {
      res.status(200).json({ message: "", data: "Ok" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again later" });
  }
}

// Function to remove a specific address
export async function removeOneAddress(req, res, next) {
  const id = req.params.addressid;
  try {
    // Find orders associated with the address
    const orders = await findAllOrder({ addressId: new Types.ObjectId(id) });
    if (orders.length > 0) {
      return res.status(403).json({
        message:
          "Cannot be deleted. The address already included in the orders",
      });
    }
    const response = await deleteOneAddress(id); // Delete the address
    if (response) {
      return res.status(200).json({ message: null, data: "Ok" });
    }
  } catch (err) {
    res.status(500).json("Something went wrong . Please try again later");
  }
}

// Function to get all user orders
export async function getAllUserOrder(req, res, next) {
  setcache(req,res)
  const updatedOrders = [];
  try {
    // Get orders for the logged-in user
    const orders = await getUserOrders(req.session.user._id);
    if (orders) {
      const sevendays = 7 * 24 * 60 * 60 * 1000;
      for (const order of orders) {
        if (order.orderStatus === orderStatusEnum.DELIVERED) {
          const orderAfter7days = new Date(
            order.deliveredAt.getTime() + sevendays
          );
          const productid = order.products.map((p) => p.productid);
          const orderReturns = await findOrderReturns({
            orderid: new Types.ObjectId(order._id),
            productid: { $in: productid },
          });
          updatedOrders.push({
            ...order,
            isReturnable: new Date().getTime() < orderAfter7days,
            orderReturns: orderReturns || [],
          });
        } else {
          updatedOrders.push({
            ...order,
            isReturnable: false,
            orderReturns: [],
          });
        }
      }
      const wishlist = await wishlistCount(req, res, next); // Get wishlist count
      // Get cart total count
      const count = await getCartTotalQuantity(req, res, next);
      var role = "profile";
      const username = req.session.user ? req.session.user.username : "";

      return res.render("pages/user/userorders", {
        count,
        role,
        username,
        orders: updatedOrders,
        wishlist,
        return_reasons: Object.values(ReturnReasonEnum),
        return_status: Object.values(returnStatusEnum),
      });
    }
  } catch (err) {
    next(err);
  }
}

// Function to get details for a specific order
export async function getOrderdetails(req, res, next) {
  setcache(req,res)
  try {
    const order = await findOneOrder(req.params.orderid); // Get order details by ID
    if (order) {
      const wishlist = await wishlistCount(req, res, next); // Get wishlist count
      const count = await getCartTotalQuantity(req, res, next); // Get cart total quantity
      var role = "profile";
      const username = req.session.user ? req.session.user.username : "";
      res.render("pages/user/viewOrder", {
        count,
        role,
        username,
        order,
        wishlist,
      });
      return;
    }
  } catch (err) {
    next(err);
  }
}

// Function to add a product to the wishlist
export async function addToWishList(req, res, next) {
  try {
    // Get the logged-in user
    const user = await getUser(req.session.user._id);
    if (user) {
      // Check if the product is already in the wishlist
      const product = user.wishlist.some(
        (item) => item == req.params.productid
      );
     
      if (product) {
        return res.status(403).json({ message: "Product already added to wishlist" });
      }
      // Add product to the wishlist
      user.wishlist.push(req.params.productid);
      await user.save();
      let wishlistcount = user.wishlist.length;
      return res.status(200).json({ message: null, wishlistcount });
    }
  } catch (err) {
    res.status(500).json("Something went wrong . Please try again later");
  }
}

// Function to get the user's wishlist
export async function getWishlist(req, res, next) {
  setcache(req,res)
  try {
    const user = await getUser(req.session.user._id); // Get the logged-in user
    if (user) {
      const wishlist = await wishlistCount(req, res, next); // Get wishlist count
      // Get wishlist details
      const wishlistinfo = await getUserWishlist(req.session.user._id);
      // Get cart total quantity
      const count = await getCartTotalQuantity(req, res, next);
      var role = req.session?.role ? req.session.role : "user";
      const username = req.session.user ? req.session.user.username : "";
      return res.render("pages/user/wishlist", {
        wishlistinfo,
        count,
        role,
        username,
        wishlist,
      });
    }
  } catch (err) {
    next(err);
  }
}

// Function to remove a product from the wishlist
export async function removeFromwishlist(req, res, next) {
  try {
    const user = await getUser(req.session.user._id); // Get the logged-in user
    if (user) {
      // Find the index of the product
      const index = user.wishlist.indexOf(req.params.productid);
      // Remove the product from the wishlist
      user.wishlist.splice(index, 1);
      const response = await user.save();

      return res.redirect("/user/wishlist");
    }
  } catch (err) {
    res.status(500).json("Something went wrong . Please try again later");
  }
}

// Function to get new products
export async function getnewProducts(req, res, next) {
  try {
    const wishlist = await wishlistCount(req, res, next); // Get wishlist count

    const count = await getCartTotalQuantity(req, res, next); // Cart total product quantity count
    var role = req.session?.role ? req.session.role : "user";
    const username = req.session.user ? req.session.user.username : "";
    const products = await getNewProduct(10); // Get new products
    return res.render("pages/user/newproduct", {
      products: products || [],
      username,
      role,
      count,
      wishlist,
    });
  } catch (err) {
    res.status(500).json(err);
  }
}

// Function to get the shopping page with filters
export async function getShopingPage(req, res, next) {
  const { type, brand, gender } = req.query;
  const skip = req.params.page || 1;
  const limit = 10;

  try {
    const filter = { isActive: true };

    if (type) {
      filter.type = { $in: type }; // Add type filter
    }

    if (brand) {
      filter.brand = { $in: brand }; // Add brand filter
    }

    if (gender) {
      filter.gender = gender; // Add gender filter
    }
    const page = (skip - 1) * limit; // Skipp number of products

    const products = await getAllProduct(filter, limit, page); // Get filterered products

    const wishlist = await wishlistCount(req, res, next); // Get wishlist count
    const totalproduct = await countProductDocuments(filter); // Get total filtered product count
    const totalpages = Math.ceil(totalproduct / limit); // Total pages
    
    const count = await getCartTotalQuantity(req, res, next); // Cart total product quantity count
    var role = req.session?.role ? req.session.role : "user";
    const username = req.session.user ? req.session.user.username : "";
    res.render("pages/user/shop", {
      username,
      role,
      count,
      wishlist,
      products,
      totalpages,
      currentpage: skip,
      totalproduct,
    });
  } catch (err) {
    next(err);
  }
}

// Function to search for products
export async function searchProducts(req, res, next) {
  const limit = 10;

  const skip = req.params.page || 1;
  const page = (skip - 1) * limit;
  const search = req.query.q;
  let filter = { isActive: true };
  filter["$text"] = { $search: search };
  try {
    const products = await searchProduct(search, page, limit); // Search for products
    const totalproduct = await countProductDocuments(filter); // Get total filtered product count
    const totalpages = Math.ceil(totalproduct / limit); // Total pages
    const wishlist = await wishlistCount(req, res, next); // Get wishlist count
    const count = await getCartTotalQuantity(req, res, next); // Get cart total product quantity
    var role = req.session?.role ? req.session.role : "user";
    const username = req.session.user ? req.session.user.username : "";
    res.render("pages/user/productsSearch", {
      username,
      role,
      count,
      wishlist,
      products,
      currentpage: page,
      totalproduct,
      totalpages,
    });
  } catch (err) {
    next(err);
  }
}

// Function to get the add address page from profile
export async function getAddressPagefromProfile(req, res, next) {
  setcache(req,res)
  try {
    const role = "profile";
    const username = req.session.user.username;
    const count = await getCartTotalQuantity(req, res, next); // Get cart total product quantity
    const wishlist = await wishlistCount(req, res, next); // Get wishlist count
    res.render("pages/user/addaddressfromprofile", {
      role,
      username,
      count,
      wishlist,
    });
  } catch (err) {
    next(err);
  }
}

// Function to download the invoice for a specific order
export async function downloadInvoice(req, res, next) {
  try {
    const orderId = req.params.orderid;
    const order = await findOneOrder(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Create a new PDF document
    const doc = new PDFDocument();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${orderId}.pdf`);

    // Pipe the PDF directly to the response
    doc.pipe(res);

    // Add content to the PDF document
    doc.fontSize(18).text(`Invoice for Order #${order._id}`, { underline: true });
    doc.moveDown();

    // Add order details
    doc.fontSize(14).text(`Order Date: ${order.createdAt.toLocaleString()}`);
    doc.text(`Total Price: Rs. ${order.totalPrice}`);
    doc.text(`Discount: Rs. ${order.couponDiscount}`);
    doc.text(`Shipping Charge: Rs. ${order.shippingCharge}`);
    doc.text(`Order Status: ${order.orderStatus}`);
    doc.moveDown();

    // Add shipping address
    doc.fontSize(16).text("Shipping Address:", { underline: true });
    doc.fontSize(12);
    doc.text(`${order.addressId.recipient_name}`);
    doc.text(`${order.addressId.street_address_line1}`);
    doc.text(`${order.addressId.street_address_line2}`);
    doc.text(`${order.addressId.city}, ${order.addressId.postal_code}`);
    doc.text(`Mobile: ${order.addressId.mobile}`);
    doc.moveDown();

    doc.fontSize(16).text("Product Details:", { underline: true });
    order.products.forEach((product) => {
      doc.fontSize(12);
      doc.text(`${product.productid.product_name} - Quantity: ${product.quantity}`);
      doc.text(`Price: Rs. ${product.productid.price}`);
      doc.moveDown();
    });

    // End the PDF document
    doc.end();

  } catch (err) {
    next(err)
  }
}

// Function to render forgot password page
export async function getForgotPasswordPage(req, res, next) {
  setcache(req,res)
  try {
    const role = "";
    const username = "";
    const count = await getCartTotalQuantity(req, res, next); // Get cart total product quantity
    const wishlist = await wishlistCount(req, res, next); // Get wishlist count
    return res.render("pages/user/forgotpassword", {
      username,
      role,
      wishlist,
      count,
    });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    if (!req.body.email)
      return res.status(400).json({ message: "Email is required" });
    const { email } = req.body;

    const user = await findUserByEmail(email);
    if (!user)
      return res
        .status(404)
        .json({ message: "Email not registered. Please signup" });

    const otp = await sendOTP(email);
    // Creating timeout 90 second
    let expireTime = Date.now() + 90 * 1000;
    // Store it in the session
    req.session.emailOTP = { otp, expireTime, email };

    return res
      .status(200)
      .json({
        message: null,
        data: "An otp send to your email address. Please verify",
      });
  } catch (err) {
    next(err);
  }
}

export async function verifyForgotPasswordOTP(req, res, next) {
  try {
    if (!req.body.otp)
      return res.status(400).json({ message: "OTP is required" });
    const { otp } = req.body;
    const { emailOTP } = req.session; // destructuring the emailOTP from session
    // Checking if the otp is valid and not expired
    if (emailOTP?.otp === otp && emailOTP?.expireTime > Date.now()) {
      
      // req.flash("warning_msg", "OTP verified successfull. Enter new password")
      return res.json({
        message: null,
        data: { url: "/auth/reset-password" },
      });
    } else {
      return res.json({
        message: "Otp has expired",
        url: "/auth/forgot-password",
      });
    }
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    if (!req.body) {
      req.flash("warning_msg", "Require all field");
      return res.redirect("/auth/reset-password");
    }
    // Destructing password from req.body
    const { password, confirm_password } = req.body;
    // Validating password
    if (password !== confirm_password) {
      req.flash("warning_msg", "Password do not match");
      return res.redirect("/auth/reset-password");
    }
    const { emailOTP } = req.session; // destructuring the emailOTP from session
    // Checking if the otp is valid and not expired
    if (emailOTP) {
      // Checking the user is already exist
      const user = await findUserByEmail(emailOTP.email);
      if (!user) {
        req.flash("warning_msg", "User not found. Please signup");
        return res.redirect("/auth/reset-password");
      }
      // Encrypting the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
      // Updating the user
      await user.save();
      req.session.emailOTP = {};
      delete req.session.emailOTP;

      req.flash("success_msg", "Password changed successfull. Please login");
      return res.redirect("/auth/login");
    } else {
      req.flash("error_msg", "Something went wrong. Please try again");
      return res.redirect("/auth/forgot-password");
    }
  } catch (err) {
    next(err);
  }
}

export async function getResetPasswordPage(req, res, next) {
  setcache(req,res)
  try {
    if (!req.session.emailOTP) return res.redirect("/auth/login");
    const role = "";
    const username = "";
    const count = await getCartTotalQuantity(req, res, next); // Get cart total product quantity
    const wishlist = await wishlistCount(req, res, next); // Get wishlist count
    return res.render("pages/user/resetPassword", {
      username,
      role,
      wishlist,
      count,
    });
  } catch (err) {
    next(err);
  }
}

export async function getProductCollection(req, res, next) {
  const limit = 10;

  const skip = req.params.page ? req.params.page : 1;
  const page = (skip - 1) * limit;
  try {
    const role = "";
    const username = req.session?.user?.username || "";
    const count = await getCartTotalQuantity(req, res, next); // Get cart total product quantity
    const wishlist = await wishlistCount(req, res, next); // Get wishlist count
    const { item } = req.params;
    const products = await getAllProduct(
      { isActive: true, gender: item },
      limit,
      page
    );
    const totalproduct = await countProductDocuments({ gender: item }); // Get total filtered product count
    const totalpages = Math.ceil(totalproduct / limit);
    return res.render("pages/user/productsSearch", {
      username,
      role,
      wishlist,
      count,
      products,
      totalproduct,
      totalpages,
      currentpage: skip,
    });
  } catch (err) {
    next(err);
  }
}

// Function to render user wallet page
export async function getUserWallet(req, res, next) {
  setcache(req,res)
  try {
    const role = "profile";
    const username = req.session.user?.username || "";
    const count = await getCartTotalQuantity(req, res, next); // Get cart total product quantity
    const wishlist = await wishlistCount(req, res, next); // Get wishlist count
    const user = await getUser(req.session.user._id);
    return res.render("pages/user/userwallet", {
      username,
      role,
      wishlist,
      count,
      wallet: user.wallet,
    });
  } catch (err) {
    next(err);
  }
}

// Function to add rating
export async function addProductRating(req, res) {
  if (!req.body) return res.status(400).json({ message: "Rating required" });
  const { _id } = req.session.user;
  try {
    const isTrue = await hasUserPurchasedProduct(_id, req.params.productid);
    if (!isTrue)
      return res
        .status(403)
        .json({
          message:
            "You have not purchased this prodcut yet. Please purchase to review",
        });
    const userreview = await findUserReview(_id, req.params.productid);
    
    if (userreview) {
      userreview.rating = req.body.rating;
      const response = await userreview.save();
     
      if (response) {
        
        const totalrating = await getProductAverageRating(req.params.productid);
        const product = await getOneProduct(req.params.productid);
        product.total_rating = parseInt(totalrating);
        const newproduct = await product.save()
        return res.status(200).json({ message: null, data: response });
      }
    } else {
      const obj = {
        userid: _id,
        productid: req.params.productid,
        rating: req.body.rating,
      };
      const response = await addRating(obj);
      
      if (response) {
        const totalrating = await getProductAverageRating(req.params.productid);
        const product = await getOneProduct(req.params.productid);
        product.total_rating = parseInt(totalrating);
        await product.save()
        return res.status(200).json({ message: null, data: response });
      }
    }
  } catch (err) {
    res.status(500).json(err);
  }
}

// Function to handle product Review
export async function addProductReview(req, res) {
  try {
    if (!req.body) return res.status(400).json({ message: "Comment required" });
    const { _id } = req.session.user;
    const isTrue = await hasUserPurchasedProduct(_id, req.params.productid);

    if (!isTrue)
      return res
        .status(403)
        .json({
          message:
            "You have not purchased this prodcut yet. Please purchase to review",
        });
    
      const obj = {
        userid: _id,
        productid: req.params.productid,
        comment: req.body.comment,
      };
      const response = await addRating(obj);
      if (response) {
        return res.status(200).json({ message: null, data: response });
      }
    
  } catch (err) {
    res.status(500).json(err);
  }
}

export async function transferAmountToWallet(req, res, next) {
  const { _id } = req.session.user;

  if (!req.body) {
    // Return an error response if the request body is missing
    return res.status(400).json({ message: "Please enter the amount." });
  }

  const { cash_wallet } = req.body;

  // Create a payment order using a payment gateway instance
  const options = {
    amount: parseInt(cash_wallet) * 100,
    currency: "INR",
    receipt: _id,
  };
  getUser(_id)
    .then((user) => {
      instance.orders.create(options, (err, payment) => {
        if (err) return res.status(401).json("Unauthorized access. Please check your credentials and try again.")
        req.session.wallettransferamount = cash_wallet;
        res
          .status(200)
          .json({ message: null, payment, username: user.username }); // Return the payment order details
      });
    })
    .catch((err) => {
      res.status(500).json("Something went wrong. Please try again later");
    });
}

export async function verfiyWalletPayment(req, res, next) {
  const { _id } = req.session.user;

  if (!req.body) {
    // Return an error response if the request body is missing
    return res
      .status(400)
      .json({ message: "Wallet payment details not found" });
  }
  const { response } = req.body;
  // Create HMAC to verify the payment signature
  let hma = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  hma.update(
    response["razorpay_order_id"] + "|" + response["razorpay_payment_id"]
  );
  hma = hma.digest("hex");
  // Check if the generated HMAC matches the Razorpay signature
  if (hma == response["razorpay_signature"]) {
    try {
      // Find the order using the order ID
      const amount = req.session.wallettransferamount;
      const user = await getUser(_id);
      user.wallet.balance += parseInt(amount);
      user.wallet.transactions.push({
        amount: amount,
        description: "Cash deposited",
        status: "Received",
        createdAt: new Date(),
      });
      await user.save();
      return res.status(200).json({ message: null, data: "Ok" });
    } catch (err) {
      res.status(500).json(err);
    }
  }
}

export async function getProductByBrand(req,res,next) {
  const {brandname} = req.params;
  try{
    const role = "user";
    const username = req.session?.user?.username || "";
    const count = await getCartTotalQuantity(req, res, next); // Get cart total product quantity
    const wishlist = await wishlistCount(req, res, next); // Get wishlist count
    const products = await getAllProduct({isActive:true, brand:brandname},100)
    
      return res.render('pages/user/newproduct', {
        username,
        role,
        count,
        wishlist,
        products
      })
      
  }catch(err) {
    next(err)
  }
}

export async function getProductReturnPage(req, res, next) {
  setcache(req,res)
  const { orderid, productid } = req.params;
  try {
    const role = "profile";
    const username = req.session.user.username;
    const count = await getCartTotalQuantity(req, res, next); // Get cart total product quantity
    const wishlist = await wishlistCount(req, res, next); // Get wishlist count
    const order = await findOneOrder(orderid);

    if (order) {
      const product = order.products.find((item) => {
        if (
          new Types.ObjectId(item.productid._id).equals(
            new Types.ObjectId(productid)
          )
        ) {
          return item;
        }
      });
      const qty = [];
      for (let i = 1; i <= product.quantity; i++) {
        qty.push(i);
      }
      return res.render("pages/user/returnpage", {
        role,
        username,
        wishlist,
        count,
        product,
        qty,
        returnReason: Object.values(ReturnReasonEnum),
        returnRefund: Object.values(returnRefundOptionEnum),
        orderid,
      });
    }
  } catch (err) {
    res.status(500).json("Something went wrong.");
  }
}

export async function handleProductReturn(req, res, next) {
  const { orderid, productid } = req.params;
  const { return_reason, product_qty, refund_option } = req.body;
  const userid = req.session.user._id;
  if (!return_reason)
    return res
      .status(400)
      .json({ message: "Please Select a spicific reason to return" });

  const obj = {
    userid: new Types.ObjectId(userid),
    orderid: new Types.ObjectId(orderid),
    productid: new Types.ObjectId(productid),
    quantity: product_qty ? product_qty : 1,
    returnReason: return_reason,
    returnStatus: returnStatusEnum.RETURN_REQUESTED,
    refundTo: refund_option,
  };

  try {
    const response = await createProductReturn(obj);
    if (response) {
      return res.status(200).json(response);
    } else {
      return res
        .status(503)
        .json({ message: "Too much time to respond. Please try again later" });
    }
  } catch (err) {
    res.status(500).json("Something went wrong.");
  }
}


export async function getProductReturnDetailsPage (req,res,next) {
  setcache(req,res)
  const {orderid, productid} = req.params;

  try {
    const role = "profile";
    const username = req.session.user?.username || "";
    const count = await getCartTotalQuantity(req, res, next); // Get cart total product quantity
    const wishlist = await wishlistCount(req, res, next); // Get wishlist count
    const product = await getReturnedProduct(orderid, productid)
    return res.render("pages/user/returnDetails", {
      username,
      role,
      wishlist,
      count,
      returnedproduct: product
    });
  } catch (err) {
    next(err);
  }
}