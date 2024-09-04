import express from 'express'
const router = express.Router();
import { addProductToCart,
     removeCartProduct, 
     removeProductfromCart ,
     getCheckoutPage,
     getAddressPage,
     addNewAddress,
     applyCoupons,
     placeOrder,
     verfiyPayment,
     paymentFailed,
     getUserProfile,
     editUserCredential,
     editPassword,
     verifyOtpforEditedEmail,
     verifyEditedEMail,
     getUserAddress,
     editOneAddress,
     editOneAddressPage,
     removeOneAddress,
     getAllUserOrder,
     addToWishList,
     removeFromwishlist,
     getWishlist,
     getAddressPagefromProfile,
     getOrderdetails,
     downloadInvoice,
     pageNotFound,
     getUserWallet,
     transferAmountToWallet,
     verfiyWalletPayment,
     handleProductReturn,
     getProductReturnPage,
     getProductReturnDetailsPage} from '../controllers/users.js'
import { userAuth } from '../middleware/authorization.js'

// Route to get the user's profile page, requires user authentication
router.get('/profile', userAuth,getUserProfile);

// Route to add a product to the cart by product ID
router.get('/add-to-cart/:productid', addProductToCart);

// Route to decrement the quantity of a product in the cart by product ID
router.get('/decrement-cart-product/:productid', removeProductfromCart);

// Route to completely remove a product from the cart by product ID
router.get('/remove-cart-product/:productid', removeCartProduct);

// Route to get the checkout page, requires user authentication
router.get('/checkout',userAuth, getCheckoutPage);

// Route to get the page for adding a new address, requires user authentication
router.get('/add-address', userAuth, getAddressPage);

// Route to add a new address, requires user authentication
router.post('/add-address', userAuth, addNewAddress);

// Route to apply a coupon during checkout, requires user authentication
router.post('/checkout/coupon', userAuth, applyCoupons);

// Route to verify payment, requires user authentication
router.post('/payment-verify', userAuth, verfiyPayment);

// Route to place an order, requires user authentication
router.post('/place-order', userAuth, placeOrder);

// Route to handle payment failure, requires user authentication
router.post('/payment-failed', userAuth, paymentFailed);

// Route to get the page for editing user account details, requires user authentication
// router.get('/profile/edit-account', userAuth ,editUserAccount);

// Route to update user credentials (like username or other profile details);, requires user authentication
router.patch('/profile/edit-credential', userAuth , editUserCredential);

// Route to update user password, requires user authentication
router.patch('/profile/edit-password', userAuth , editPassword);

// Route to initiate email change and send OTP for verification, requires user authentication
router.post('/profile/edit-email', userAuth , verifyEditedEMail);

// Route to verify OTP for email change, requires user authentication
router.post('/profile/change-email-verify-otp', userAuth, verifyOtpforEditedEmail);

// Route to get the user's saved addresses, requires user authentication
router.get('/profile/manage-address', userAuth, getUserAddress);

// Route to get the page for editing a specific address by address ID, requires user authentication
router.get('/profile/manage-address/edit/:addressid',userAuth , editOneAddressPage);

// Route to update a specific address by address ID, requires user authentication
router.put('/profile/manage-address/edit/:addressid',userAuth , editOneAddress);

// Route to get the page for adding a new address from the profile section, requires user authentication
router.get('/profile/manage-address/add' , userAuth, getAddressPagefromProfile);

// Route to remove a specific address by address ID, requires user authentication
router.delete('/manage-address/remove/:addressid', userAuth, removeOneAddress);

// Route to get all orders of the user, requires user authentication
router.get('/profile/orders', userAuth, getAllUserOrder);

// Route to get details of a specific order by order ID, requires user authentication
router.get('/profile/orders/:orderid', userAuth, getOrderdetails);


// Route to get user wallets page
router.get('/profile/wallet', userAuth, getUserWallet)
// Route to download the invoice for a specific order by order ID, requires user authentication
router.get('/download-invoice/:orderid', userAuth, downloadInvoice);

// Route to add a product to the user's wishlist by product ID, requires user authentication
router.get('/wishlist/add/:productid', userAuth, addToWishList);

// Route to remove a product from the user's wishlist by product ID, requires user authentication
router.get('/wishlist/remove/:productid', userAuth, removeFromwishlist);

// Route to get the user's wishlist, requires user authentication
router.get('/wishlist', userAuth, getWishlist);

// Route to handle add money to user profile
router.post('/profile/add-cash-to-wallet', userAuth, transferAmountToWallet)

// Route to verify the wallet payment 
router.post('/profile/wallet/verify-payment', userAuth, verfiyWalletPayment);

// Route to get the product return page 
router.get('/profile/return/:orderid/:productid',userAuth, getProductReturnPage)

// Route to handle return product
router.post('/profile/return/:orderid/:productid', userAuth, handleProductReturn)

// Route to get returned product details status
router.get('/profile/return/details/:orderid/:productid', userAuth, getProductReturnDetailsPage)
export default router;