
import { findOneCoupon } from "./helpers/couponHelpers.js";
import { getOneProduct } from "./helpers/productHelper.js";
import { getUser, getUserCart } from "./helpers/users.js";

export async function getCartTotalQuantity(req, res) {
  let count = 0;
  if (req.session?.user) {
    try {
      const cart = await getUserCart(req.session.user._id);
      if (cart) {
        count = cart.cart_products?.reduce(
          (accu, item) => accu + item.quantity,
          0
        );
        return count;
      }
      return count;
    } catch (err) {
      console.log(err);
    }
  } else if (req.session.guest) {
    count = req.session.guest.reduce((accu, item) => accu + item.quantity, 0);
    return count;
  } else {
    return count;
  }
}

export async function getTotalCartPriceDiscount(req, res, next) {
  const obj = { error: null, data: {} };
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
            item.productid.stock_available <= item.quantity
          ) {
            isAllAvailable = false;
          }
          actualprice += item.productid.price * item.quantity;
          if (item.productid.price_after_discount) {
            totaldiscount +=
              item.productid.price_after_discount * item.quantity;
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
          if (isAllAvailable !== false && product.stock_available <= quantity) {
            isAllAvailable = false;
          }
          actualprice += product.price * quantity;
          if (product.price_after_discount) {
            totaldiscount += product.price_after_discount * quantity;
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
        console.log("_id, discount ", _id, discount, coupon_code);
        const coupon = await findOneCoupon(_id);
        if (coupon) {
          console.log("coupon", coupon);
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
    obj.data = {
      totalprice,
      actualprice,
      totaldiscount,
      isAllAvailable,
      count,
      coupon_discount,
      shipping_charge,
    };
    return obj;
  } catch (err) {
    obj.error = err;
    return obj;
  }
}

export async function wishlistCount (req,res) {
  if(req.session.user) {
    try{
      const user = await getUser(req.session.user._id)
      if(user) {
        let count = user.wishlist.length
        return count;
      }
    }catch(err) {
      console.log(err)
    }
  }else {
    return 0;
  }
}