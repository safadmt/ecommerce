
import { findOneCoupon } from "../helpers/couponHelpers.js";
import { getUserOrdersForcheck } from "../helpers/orderHelper.js";
import { getOneProduct } from "../helpers/productHelper.js";
import { getUser, getUserCart } from "../helpers/users.js";

// Function to get the total quantity of items in the cart
export async function getCartTotalQuantity(req, res) {
  let count = 0;
  if (req.session?.user) {
    try {
      const cart = await getUserCart(req.session.user._id);
      if (cart) {
        // Calculate total quantity of items in the user's car
        count = cart.cart_products?.reduce(
          (accu, item) => accu + item.quantity,
          0
        );
        return count;
      }
      return count;
    } catch (err) {
      return err;
    }
  } else if (req.session.guest) {
    // Calculate total quantity of items in the guest's cart
    count = req.session.guest.reduce((accu, item) => accu + item.quantity, 0);
    return count;
  } else {
    return count;
  }
}
// Function to get the total price, discounts, and other details for the cart and checkout
export async function getTotalCartPriceDiscount(req, res, next) {
  
  let actualprice = 0;
  let totaldiscount = 0;
  let totalprice = 0;
  let isAllAvailable = true;
  let coupon_discount = 0;
  let valid_coupons = [];
  let count = 0;
  try {
    if (req.session?.user) {
      const cart = await getUserCart(req.session.user._id);
      if (cart) {
        count = cart.cart_products.reduce(
          (accu, item) => accu + item.quantity,
          0
        );
        cart.cart_products.forEach((item) => {
          if (
            isAllAvailable !== false &&
            item.productid.stock_available < item.quantity
          ) {
            isAllAvailable = false;
          }
          
          actualprice += item.productid.price * item.quantity;
          if (item.productid.discount_in_percentage !== 0) {
            console.log("useritem", item.productid.discount_in_percentage)
            totaldiscount +=
              (item.productid.price * item.productid.discount_in_percentage / 100) * item.quantity;
          }
        });
      }
      totalprice = actualprice - totaldiscount;
    } else if (req.session.guest) {
      const guest = req.session.guest;
      count = req.session.guest.reduce((accu, item) => accu + item.quantity, 0);
      for (const { productid, quantity } of guest) {
        const product = await getOneProduct(productid);
        
        if (product) {
          if (isAllAvailable !== false && product.stock_available < quantity) {
            isAllAvailable = false;
          }
          
          actualprice += product.price * quantity;
          if (product.discount_in_percentage !== 0) {
            totaldiscount += (product.price * product.discount_in_percentage / 100) * quantity;
          }
        }
      }

      totalprice = actualprice - totaldiscount;
    }

    let shipping_charge = req.session.cart_charge_offer
      ? req.session.cart_charge_offer.shipping_charge
      : 0;
    

    if (
      req.session?.cart_charge_offer?.coupon_discount &&
      req.session?.cart_charge_offer?.coupon_discount.length > 0
    ) {
      for (const { _id, discount, coupon_code } of req.session
        .cart_charge_offer.coupon_discount) {
        const coupon = await findOneCoupon(_id);
        if (coupon) {
          
          if (coupon.discount_type === "free_shipping") {
            if (totalprice > coupon.minimum_purchase_value) {
              coupon_discount += discount;
              valid_coupons.push({ _id, discount, coupon_code });
            }
          } else {
            if (
              totalprice > coupon.minimum_purchase_value &&
              totalprice < coupon.maximum_purchase_value
            ) {
              coupon_discount += discount;
              valid_coupons.push({ _id, discount, coupon_code });
            }
          }
        }
      }
    }

    if (totalprice !== 0) {
      totalprice += shipping_charge;
      totalprice -= coupon_discount;
    }
    
    if(req.session?.cart_charge_offer?.coupon_discount) {
      req.session.cart_charge_offer.coupon_discount = valid_coupons
    } 
    const obj = {
      totalprice : Math.round(totalprice),
      actualprice : Math.round(actualprice),
      totaldiscount : Math.round(totaldiscount),
      isAllAvailable,
      count,
      coupon_discount : Math.round(coupon_discount),
      shipping_charge,
    };
    
    return obj;
  } catch (err) {
    
    return err;
  }
}

// Function to get the user wishlist product count
export async function wishlistCount (req,res) {
  let count = 0
  if(req.session?.user) {
    try{
      const user = await getUser(req.session.user._id)
      if(user) {
        count = user.wishlist.length
        return count;
      }else{
        return count;
      }
    }catch(err) {
      return err;
    }
  }else {
    return count;
  }
}

// Function to check if a user has purchased a specific product
export async function hasUserPurchasedProduct (userid, productid) {
    const orders = await getUserOrdersForcheck(userid)
    for(const order of orders) {
      for(const product of order.products) {
        if(product.productid.toString() === productid.toString() ) {
          return true
        }
      }
    }
    return false;
}


export const dateFilters = {
  SELECT: { label: "Select Date", value: "" },
  LAST_24_HOURS: { label: "Last 24 Hours", value: '24_hrs' },
  LAST_WEEK: { label: "Last Week", value: 'week' },
  LAST_MONTH: { label: "Last Month", value: 'month' },
  LAST_YEAR: { label: "Last Year", value: 'year' },
  CUSTOM: { label: "Custom Date Range", value: 'custom' }
};
