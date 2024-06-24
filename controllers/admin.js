import { isValidObjectId } from "mongoose";
import voucher_code from "voucher-code-generator";
import {
  getAllProduct,
  getOneProduct,
  getProductCountByBrand,
  insertProduct,
  productAcitveorInactive,
  searchProduct,
  updateOneProduct,
  updateStockAvailability,
} from "../helpers/productHelper.js";
import { unlink } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import {
  deleteOneCoupon,
  findAllCoupons,
  findOneCoupon,
  insertCoupon,
  isCouponActive,
  updateCoupon,
} from "../helpers/couponHelpers.js";
import {
  deleteOneBanner,
  findBanner,
  findeOneBanner,
  insertOneBanner,
  isBannerActive,
  updateOneBanner,
} from "../helpers/bannerHelper.js";
import { authenticateAdmin } from "../helpers/admin.js";
import {
  findAllOrder,
  findOneOrder,
  getTotalIncome,
  getTotalProductSold,
  totalOrders,
  totalSalesByBrand,
  updateOrder,
  updateOrderProductReturn,
} from "../helpers/orderHelper.js";
import {
  countProductReturnDocuments,
  deleteUser,
  findAllProductReturns,
  findAllUsers,
  findOneReturn,
  getUser,
  getUserCount,
  isblockUser,
} from "../helpers/users.js";
import { orderStatusEnum, returnRefundOptionEnum, returnStatusEnum } from "../utils/enum.js";
import { dateFilters } from "../utils/util.js";
import Product from "../models/product.js";

const path = dirname(dirname(fileURLToPath(import.meta.url)));

// Function to render the admin login page
export const getAdminLogin = (req, res) => {

  // Set various cache-control headers to prevent caching
 // This ensures that sensitive pages like login aren't cached by browsers or proxies
 res.set(
  "Cache-Control",
  "no-store, no-cache, must-revalidate, proxy-revalidate"
);
res.set("Pragma", "no-cache");
res.set("Expires", "0");
res.set("Surrogate-Control", "no-store");


  
  // Set the role as "admin" for this page
  const role = "admin";

  // Render the admin login page, passing any existing admin username or an empty string
  res.render("pages/admin/login", {
    username: "",
    role,
  });
};

// Function to handle admin login
export const adminLogin = async (req, res, next) => {
  // Extract email and password from request body
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!req.body || !email.trim() || !password.trim()) {
    // If not, set a flash message and redirect back to login page
    res.status(400).json({message: "Email or password is required"});
    return;
  }
  try{
  // Attempt to authenticate the admin
  const data = await authenticateAdmin(req.body);

  if (data.message) {
    // If authentication fails, set a flash message and redirect back to login page
    res.status(400).json({message: data.message});
    return;
  } else {
    // If authentication succeeds, extract user details
    const { username, email, _id } = data.response;
    // Set admin session with user details
    req.session.admin = { username, email, _id };
    req.session.admin.role = "admin"
    // Redirect to admin dashboard
    res.status(200).json({url : '/admin'})
  }
}catch(err) {
 
  res.status(500).json("Something went wrong")
}
};


export function adminLogout (req,res,next) {
  // Set cache control headers to prevent caching
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
  req.session.admin = null;
  res.redirect("/");
}
// Function to render the admin home page
export const getHomePage = async (req, res , next) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
  // Get the user's role from session, 
  const role = req.session.admin?.role || "admin";

  // Array of month names for chart labels
  const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Calculate the start and end dates of the current year
  // const currentYear = new Date().getFullYear();
  // const startOfYear = new Date(currentYear, 0, 1);
  // const startOfNextYear = new Date(currentYear + 1, 0, 1);

  try {
  // Fetch total products sold in the current year
  const totalproductsold = await getTotalProductSold();
  // Fetch total sales by brand
  const totalproductBybrand = await totalSalesByBrand();

  // Extract brand names and total sales for each brand (for charts)
  const brands = totalproductBybrand.map(item => item._id);
  const brandtotal = totalproductBybrand.map(item => item.totalprice);

  // Extract months and corresponding product counts (for charts)
  const monthsarr = totalproductsold.map(item => months[item.month - 1]);
  const countarr = totalproductsold.map(item => item.count);

  // Fetch total successful orders
  const totalsales = await totalOrders({orderStatus: orderStatusEnum.DELIVERED});
  // Fetch total orders
  const totalorders = await totalOrders({});
  // Get total income
  const totalincome = await getTotalIncome()
  // Fetch all users and calculate total user count
  const users = await findAllUsers({});
  const totalUser = users.length;

  // Get admin's username from session
  const username = req.session.admin.username;
  // Render the admin dashboard with all the fetched data
  res.render("pages/admin/admin", {
    username,
    role,
    totalsales,
    totalUser,
    months: monthsarr,
    counts: countarr,
    brands,
    brandtotal,
    totalorders,
    totalincome
  });
}catch(err) {
  next(err)
}
};


//Render the products details page
export const getProductsPage = async (req, res,next) => {
let data = []
// Destruring search query 
const {q} =  req.query

// Get the user's role from session, 
const role = req.session.admin?.role || "admin";  
try {
    const productcountbybarand = await getProductCountByBrand();
    if(!q) {
    // Giving arguments first one is null object , second one limit product, skip, sort
    data = await getAllProduct({},50, 0,-1);
    }else {
      
       data = await searchProduct(q, 0, 200)
    }
    const products = data.length > 0 ? data : [];
    res.render("pages/admin/products", {
      username: req.session.admin ? req.session.admin.username : "",
      products,
      role,
      productcount : productcountbybarand,
      
    });
  } catch (err) {
   
    next(err)
  }
};


//Function to render a page for adding a new product 
export const getAddProductPage = (req, res) => {
// Get the user's role from session, 
const role = req.session.admin?.role || "admin";  res.render("pages/admin/addproduct", {
    username: req.session.admin ? req.session.admin.username : "",
    role,
  });
};


//Creating new product in the database 
export const createNewProduct = (req, res ,next) => {
  if (!req.body) {
    req.flash("warning_msg", "All star fields are required");
    res.redirect("/admin/products/add-product");
  }
  
  const { discount_in_percentage, price } = req.body;
  const image = [];
  req.files.forEach((file) => {
    image.push(file.filename); // Collect filenames of uploaded images
  });
  if (discount_in_percentage) { // Calculate price after discount if discount is provided
    const disco = (parseInt(price) * parseInt(discount_in_percentage)) / 100;
    req.body.price_after_discount = Math.ceil(disco);
  }else{
    req.body.discount_in_percentage = 0
  }
  req.body.isBlocked = req.body.isBlocked === "True" ? true : false
  req.body.images = image; // Add images to the request body
  
  insertProduct(req.body) // Insert product into the database
    .then((data) => {
      if (data) {
        res.json("Ok"); // Respond with "Ok" if insertion is successful
      }
    })
    .catch((err) => {
      
      next(err)
    });
};

// Function to get the edit page for a product
export const getEditPage = (req, res, next) => {
// Get the user's role from session, 
const role = req.session.admin?.role || "admin"; 
 if (isValidObjectId(req.params.productid)) { // Check if the product ID is valid
    getOneProduct(req.params.productid) // Get product details from the database
      .then((response) => {
        
        res.render("pages/admin/editproduct", {
          username: req.session.admin ? req.session.admin.username : "",
          product: response,
          role,
        });
      })
      .catch((err) => {
        
        next(err)
      });
  }
};

// Function to edit an existing product
export const editProduct = async (req, res,next) => {
  if (!req.body) { // Check if the request body is empty
    req.flash("warning_msg", "All star fields are required");
    res.redirect(`/admin/products/edit/${req.params.productid}`);
  }
  try {
    const { discount_in_percentage, price } = req.body;
    if (discount_in_percentage) { // Calculate price after discount if discount is provided
      const disco = (parseInt(price) * parseInt(discount_in_percentage)) / 100;
      req.body.price_after_discount = Math.ceil(disco);
    }
    if (req.files.length > 0) { // If new images are uploaded
      if (isValidObjectId(req.params.productid)) { // Check if the product ID is valid
        const product = await getOneProduct(req.params.productid); // Get product details from the database
        product.images.forEach((file) => {
          unlink(`${path}/public/products/images/${file}`, (err) => { // Delete old images
            if (err) throw err;
          });
        });
        let image = [];
        req.files.forEach((file) => {
          image.push(file.filename); // Collect filenames of uploaded images
        });
        req.body.images = image; // Add images to the request body
        const response = await updateOneProduct(req.params.productid, req.body);
        res.status(200);
        res.json("Ok");
      }
    } else {
      const response = await updateOneProduct(req.params.productid, req.body); // Update product in the database
      res.status(200);
      res.json("Ok"); // Respond with "Ok" if update is successful
    }
  } catch (err) {
    
    next(err)
  }
};

// Function to update the active status of a product
export const productIsAcitve = async (req, res, next) => {
  if (!req.body) { // Check if the request body is empty
    return;
  }

  if (isValidObjectId(req.params.productid)) { // Check if the product ID is valid  
    
    try {
      const response = await productAcitveorInactive( // Update the active status based on request body
        req.params.productid,
        req.body.isActive
      );

      res.status(200).json(response); // Respond with the updated status
    } catch (err) {
      
      next(err)
    }
  }
};

export async function isProductReturnable (req,res,next) {
  const {productid} = req.params
 
  try{
    if (!req.body) { // Check if the request body is empty
      return res.status(400).json({message:"Req.body not found"})
    }

    const {returnable } = req.body;
    let isReturn = returnable === "true" ? false : true
    
    const response = await updateOneProduct(productid, {returnable : isReturn})
   
    return res.status(200).json(response)
  }catch (err) {
    res.status(500).json(err)
  }
}
// Function to get the coupon management page
export async function getCouponPage(req, res, next) {
  // Get the user's role from session, 
  const role = req.session.admin?.role || "admin";
  try {
    const response = await findAllCoupons(); // Get all coupons from the database
    res.render("pages/admin/coupon", {
      username: req.session.admin ? req.session.admin.username : "",
      coupons: response, // Pass the coupons to the view
      role,
    });
  } catch (err) {
    
    next(err)
  }
}

// Function to get the add coupon page
export function getAddCouponPage(req, res) {
  // Get the user's role from session, 
  const role = req.session.admin?.role || "admin";
  res.render("pages/admin/addcoupon", { role , username : req.session.admin?.username || "Admin"}); // Render the add coupon page with the role
}


// Function to get the edit coupon page
export async function getEditCouponPage(req, res,next) {
  // Get the user's role from session, 
  const role = req.session.admin?.role || "admin";
  try {
    if (isValidObjectId(req.params.couponid)) {
      const coupon = await findOneCoupon(req.params.couponid);
      res.render("pages/admin/editcoupon", 
        { 
          coupon: coupon, 
          role,username : req.session.admin?.username || "Admin" 
        });
    }
  } catch (err) {
    
    next(err)
  }
}


// Function to create a new coupon
export async function createNewCoupon(req, res,next) {
  if (!req.body) {
    req.flash("warning_msg", "All star indicated fields are required");
    res.redirect("/admin/coupons/add-product");
  }
  try {
    const response = await insertCoupon(req.body); // Insert the new coupon into the database
    res.status(201);
    res.json(response); 
  } catch (err) {
    
    next(err)
  }
}

// Function to edit an existing coupon
export async function editCoupon(req, res,next) {
  if (!req.body) { // Check if the request body is empty
    req.flash("warning_msg", "All star indicated fields are required");
    res.redirect(`/admin/coupons/edit/${req.params.couponid}`);
  }
  try {
    
    if (isValidObjectId(req.params.couponid)) { // Check if the coupon ID is valid
      const response = await updateCoupon(req.params.couponid, req.body); // Update the coupon in the database
      res.status(200);
      res.json("Ok");
    } 
  } catch (err) {
    
    next(err)
  }
}

// Function to update the active status of a coupon
export async function couponIsActive(req, res,next) {
  if (!req.body) {
    return;
  }
  try {

    if (isValidObjectId(req.params.couponid)) { // Check if the coupon ID is valid
      const response = await isCouponActive(
        req.params.couponid,
        req.body.content.trim() // Update the active status based on the trimmed content
      );
      res.status(200);
      res.json(response); 
    } 
  } catch (err) {
    
    next(err)
  }
}

// Function to remove a coupon
export async function removeOneCoupon(req, res,next) {
  try {
    await deleteOneCoupon(req.params.couponid);
    res.json("Ok");
  } catch (err) {
    
    next(err)
  }
}

// Function to get the banner management page
export async function getBannerPage(req, res,next) {
  // Get the user's role from session, 
  const role = req.session.admin?.role || "admin";
  try {
    const response = await findBanner();  // Get all banners from the database
    res.render("pages/admin/banner", { 
      banners: response, 
      role,
      username : req.session.admin?.username || "Admin"
    }); // Render the banner page with the banners and role
  } catch (err) {
    
    next(err)
  }
}

// Function to get the banner edit page
export async function getBannerEditPage(req, res,next) {
  // Get the user's role from session, 
  const role = req.session.admin?.role || "admin";
  try {
    
    // Function to get the banner edit page
    if (isValidObjectId(req.params.bannerid)) { 
       // Get the banner details from the database
      const response = await findeOneBanner(req.params.bannerid);
      // Render the edit banner page with the banner details and role
      res.render("pages/admin/editbanner", { 
        banner: response, 
        role ,username : req.session.admin?.username || "Admin",
        username : req.session.admin?.username || "Admin"
      });
    }
  } catch (err) {
    
    next(err)
  }
}

// Function to get the add banner page
export async function getAddBannerPage(req, res,next) {
  // Get the user's role from session, 
  const role = req.session.admin?.role || "admin";
  try {
    res.render("pages/admin/addbanner", { 
      role,
      username : req.session.admin?.username || "Admin"
    });
  } catch (err) {
    
    next(err)
  }
}

// Function to create a new banner
export async function createNewBanner(req, res,next) {
  try {
    if (!req.body) {
      req.flash("warning_msg", "Required all star indicated fields");
      res.redirect("/admin/banners/add-banner");
    }

    // Add the uploaded image filename to the request body
    req.body.imageurl = req.file.filename;
    // Set isActive to false if it's an empty string  
    req.body.isActive = req.body.isActive === "" ? false : req.body.isActive;
    
      // Insert the new banner into the database
      const response = await insertOneBanner(req.body);
      res.status(201);
      res.json(response);
   
  } catch (err) {
    
    next(err)
  }
}


// Function to edit an existing banner
export async function editOneBanner(req, res,next) {
  
  if (!req.body) {
    // Check if the request body is empty
    req.flash("warning_msg", "Required all star indicated field");
    res.redirect(`/admin/banners/edit/${req.params.bannerid}`);
  }
  try {
    if (req.file) { // If a new image is uploaded

      // Check if the banner ID is valid
      if (!isValidObjectId(req.params.bannerid)) { 
        req.flash("error", "Something went wrong"); 
        res.redirect(`/admin/banners/edit/${req.params.bannerid}`);
      }

      // Get the banner details from the database
      const banner = await findeOneBanner(req.params.bannerid);
      // Delete the old image
      unlink(`${path}/public/banners/${banner.imageurl}`, (err) => {
        if (err) throw err;
      });

      // Add the new image filename to the request body
      req.body.imageurl = req.file.filename;
      // Update the banner in the database
      await updateOneBanner(req.params.bannerid, req.body);
      res.json("Ok");
    } else {
      const { first_caption, second_caption, link, isActive } = req.body;

      // Create an object with the updated fields
      const obj = { first_caption, second_caption, link, isActive }; 

       // Update the banner in the database
      await updateOneBanner(req.params.bannerid, obj); 
      res.json("Ok");
    }
  } catch (err) {
    
    next(err)
  }
}


// Function to update the active status of a banner
export async function bannerIsActive(req, res, next) {
  
  if (!req.body) { // Check if the request body is empty
    return;
  }
  try {
    if (isValidObjectId(req.params.bannerid)) { // Check if the request body is empty

      // Update the active status based on the content
      const response = await isBannerActive(
        req.params.bannerid,
        req.body.content
      );
      
      res.status(200);
      res.json(response);
    } else {
      res.status(400).json({message:"Not valid coupon id"});
    }
  } catch (err) {
    
    next(err)
  }
}


// Function to remove a banner

export async function removeOneBanner(req, res ,next) {
  const { bannerid } = req.params;
  try {

    // Delete the banner from the database
    const banner = await deleteOneBanner(bannerid);

    // Delete the banner image file
    unlink(`${path}/public/banners/${banner.imageurl}`, (err) => {
      if (err) throw err;
      res.json("Ok");
    });
  } catch (err) {
   
    next(err)
  }
}

// Function to get the orders management page
export async function getOrderPage(req, res , next) {
  try {
    const {date, start_date, end_date} = req.query
    // Get the user's role from session, 
  const role = req.session.admin?.role || "admin";
    // Date filter
    const filter = {};
    const now = new Date();
    let start = "";
    let end = now;
    if(date) {
      switch(date) {
        case dateFilters.LAST_24_HOURS.value:
          start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case dateFilters.LAST_WEEK.value:
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case dateFilters.LAST_MONTH.value : 
          start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case dateFilters.LAST_YEAR.value:
          start = new Date(now.getFullYear() - 1,now.getMonth(),now.getDate());
          break;
        case dateFilters.CUSTOM.value:
          start = new Date(start_date);
          end = new Date(end_date)  ;
          break;
        
      }
    }
    if(start && end) {
      filter.createdAt = {$gte: start, $lt: end}
    }
    // Get all orders from the database
    const orders = await findAllOrder(filter);
    // Get the total number of orders
    const totalorders = await totalOrders({});
    // Get the total number of pending orders
    const pendingorders = await totalOrders({ orderStatus: orderStatusEnum.PENDING });
    // Get the total number of successful orders
    const successorders = await totalOrders({ orderStatus: orderStatusEnum.DELIVERED });
    // Get the total number of failed orders
    const failedorders = await totalOrders({ orderStatus: orderStatusEnum.FAILED });
    delete orderStatusEnum.FAILED
    res.render("pages/admin/orders", {
      role,
      orders,
      totalorders,
      pendingorders,
      failedorders,
      successorders,
      username : req.session.admin?.username || "Admin",
      orderStatus : Object.values(orderStatusEnum),
      datefilteres : Object.values(dateFilters)
    });
  } catch (err) {
    
    next(err)
  }
}

// Function to get all users        
export async function getAllUsers(req, res , next) {
  try {
    const currentDate = new Date();
    // Calculate the date 30 days ago
    const monthago = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    // Get the number of new users created in the last 30 days
    const newusers = await getUserCount({
      createdAt: { $gt: monthago, $lt: currentDate },
    });
    // Get the total number of users
    const totalusers = await getUserCount({});

    // Get the user's role from session, 
  const role = req.session.admin?.role || "admin";
    // Get all users from the database
    const users = await findAllUsers({});

    return res.render("pages/admin/users", {
       role, 
       newusers, 
       totalusers, 
       users,
       username : req.session.admin?.username || "Admin"
      });
  } catch (err) {
    
    next(err)
  }
}

// Function to handle the status of an order
export async function handleOrderStatus(req, res,next) {
  // Check if the status is provided in the request body
  if (!req.body.status) return;
  const { status } = req.body;

  try {
    // Get the order by ID
    const order = await findOneOrder(req.params.orderid);
    // Check if the order exists
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Check if the status is the same as the current status  
    if (order.orderStatus === status) {
      return res.status(400).json({ message: "Selected same orderStatus" });
    }
    // Check if the order is already delivered or cancelled
    if (
      order.orderStatus === orderStatusEnum.DELIVERED ||
      order.orderStatus === orderStatusEnum.CANCELLED
    ) {
      return res
        .status(409)
        .json({
          message:
            "Cannot change the order status due to the order is already delivered or cancelled.",
        });
    }
    //  Check if the order is already shipped, then can't change the status to placed
    if((status === orderStatusEnum.PLACED 
      || status === orderStatusEnum.CANCELLED 
      || status === orderStatusEnum.PENDING) && 
      (order.orderStatus === orderStatusEnum.SHIPPED || order.orderStatus === orderStatusEnum.DELIVERED)) {
        return res.status(409)
        .json({message: "Cannot change the order status due to the order is already shipped.",})
    }

    // if the order is pending or failed and status is placed or shipped or delivered , 
    // change the product quanity from the order datails quantity 
    if((status === orderStatusEnum.PLACED || status === orderStatusEnum.SHIPPED || status === orderStatusEnum.DELIVERED)
         && (order.orderStatus === orderStatusEnum.PENDING || order.orderStatus === orderStatusEnum.FAILED)) {
        for(const {productid, quantity} of order.products) {
            await updateStockAvailability(productid, quantity)
        }
    }

    // if the status is cancelled , increment stockavailability in the 
    // product details and refund totalprice to the user wallet who bought the product
    if (status === orderStatusEnum.CANCELLED) {
      order.orderStatus = status;
      const user = await getUser(order.userId);

      // Update stock availability for each product in the order
      for(const item of order.products) {
        const product = await getOneProduct(item.productid)
        if(product) {
            product.stock_available += item.quantity
            product.product_sold -= item.quantity
            await product.save()
        }
        
      }
      // Refund the total price to the user wallet
      user.wallet.balance += order.totalPrice;
      // Add a transaction record
      user.wallet.transactions.push({
        amount: order.totalPrice,
        description: `Order cancelled , orderid: ${order._id}`,
        status: "Recieved"
      });

      // Save the user updates
      await user.save();
      // Save the order updates
      const neworder = await order.save();
      return res
        .status(200)
        .json({ message: null, data: { status: neworder.orderStatus } });
    }
    if(status === orderStatusEnum.DELIVERED) {
      await updateOrder(order._id, {deliveredAt : new Date()})
    }
  
    //save the order updates
    const neworder = await updateOrder(order._id, {orderStatus: status})

    if (neworder) {
      return res
        .status(200)
        .json({ message: null, data: { status: neworder.orderStatus } });
    }
  } catch (err) {
    return res.status(500).json("Something went wrong. Please try again later");
  }
}

// Function to block or unblock a user
export async function blockorUnBlockUser(req, res) {
  try {
    // Check if the request body is empty
    if (!req.body)
      return res.status(400).json({ message: "Content not found" });
   
    const response = await isblockUser(
      req.params.userid,
      req.body.content.trim()
    );
    if (response) {
      return res.status(200).json({message: "",data:response});
    }
  } catch (err) {
    
    return res.status(500).json("Something went wrong. Please try again later");
  }
}

// Function to remove a user
export async function removeUser(req, res) {
  try {
    const response = await deleteUser(req.params.userid);
    if (response.error) {
      res.status(404).json({ error: response.error });
    } else {
      const currentDate = new Date();
      const monthago = new Date(
        currentDate.getTime() - 30 * 24 * 60 * 60 * 1000
      );
      const newusers = await getUserCount({
        createdAt: { $gt: monthago, $lt: currentDate },
      });
      const totalusers = await getUserCount({});
      return res.status(200).json({ error: null, data: "Ok", newusers, totalusers });
    }
  } catch (err) {
    return res.status(500).json("Something went wrong. Please try again later");
  }
}


export async function getReturnsListingPage (req,res,next) {
  // Get the user's role from session, 
  const role = req.session.admin?.role || "admin";

  try{
    const returns =  await findAllProductReturns({})
    const totalreturns = await countProductReturnDocuments({returnStatus: returnStatusEnum.COMPLETED})
    if(returns) {
      return res.render('pages/admin/returns' , {
        role,
        returnStatus : Object.values(returnStatusEnum) ,
        returns,
        totalreturns,
        username : req.session.admin?.username || "Admin"
      })
    }
  }catch(err) {
    next(err)
  }

}

export async function handleReturnStatus (req,res,next) {
  // Extract return_status from the request body and returnid from the request parameters
  const {return_status} = req.body;
  const {returnid} = req.params;
  // If return_status is not provided, return a 400 error with a message
  if(!return_status) {
    return res.status(400).json({message: "Req.body not found"})
  }
     // Get all possible return statuses from the enum
const returnStatus = Object.values(returnStatusEnum);
  try{
    // Find the return record using returnid
    const productreturned = await findOneReturn(returnid)
    // Check if the current return status is the same as the new return status
    if(productreturned.returnStatus === return_status) {
      return res.status(403).json({message: "Return status is same"})
    }
    // Get the index of the current and new return status in the returnStatus array
    const currentStatusIndex = returnStatus.indexOf(productreturned.returnStatus)

    const newStatusIndex = returnStatus.indexOf(return_status)
    
    // If the new status is invalid, return a 400 error with a message
    if(newStatusIndex == -1) {
      return res.status(400).json({message: "Invalid status " + return_status })
    }
    // If the new status is not in the correct order, return a 403 error with a message
    if((newStatusIndex < currentStatusIndex) || newStatusIndex !== currentStatusIndex + 1) {
      return res.status(403).json({message: `Invalid status changes from ${productreturned.returnStatus} to ${return_status}`})
    }
    // Handle the case where the return status is REFUND_PROCESSED
    if(return_status === returnStatusEnum.REFUND_PROCESSED) {
      
      let order = await findOneOrder(productreturned.orderid)
      // Find the related order and returned product details
      const returedproduct = order.products.
      find(item=> item.productid._id.toString() === productreturned.productid.toString())
      // Calculate the price of the returned product and update the total order amount
      let productprice = returedproduct.price * productreturned.quantity
      const totalamount = order.totalPrice -= productprice
      // Update the product stock and sold quantities
      const product = await getOneProduct(productreturned.productid)
      product.stock_available += productreturned.quantity;
      product.product_sold -= productreturned.quantity;
      await updateOrderProductReturn(order._id, product._id, productreturned.quantity)
      await product.save()
      // Update the order with the new total price
      await updateOrder(order._id, {totalPrice:totalamount })
      // Update the return status
      productreturned.returnStatus = return_status;
      // If the refund is not to a bank account, update the user's wallet
      if(productreturned.refundTo !== returnRefundOptionEnum.Bank_Account) {
        
      const user = await getUser(productreturned.userid)
      user.wallet.balance += productprice
      user.wallet.transactions.push(
        {
          amount: productprice,
          description:"Refund initiated ", 
          status: "Received",
          createdAt: new Date()
        })
      await user.save()
      }
      // Save the updated return record and respond with the updated data
      const response = await productreturned.save()
      if(response) {
        res.status(200).json({message: null, data: response})
      }
      return
    }else{
      // If the return status is not REFUND_PROCESSED, just update the return status
      productreturned.returnStatus = return_status;
      const response = await productreturned.save();
      return res.status(200).json({message: null, data: response})
    }
  }catch(err) {
    // If an error occurs, respond with a 500 error and a message
    res.status(500).json("Something went wrong")
  }
  
  
  
  }


  export function generateCouponCode (req,res,next) {
    try{
      const voucher = voucher_code.generate({
      length : 8,
      count : 1
    })

    return res.status(200).json({coupon_code : voucher[0]})
    }catch(err) {
      res.status(500).json("Something went wrong.")
    }
    
    
  }

 