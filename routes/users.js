import express from 'express'
const router = express.Router()
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
     editUserAccount,
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
     getWishlist} from '../controllers/users.js'
import { userAuth } from '../middleware/authorization.js'

router.get('/profile', userAuth,getUserProfile)
router.get('/add-to-cart/:productid', addProductToCart)
router.get('/decrement-cart-product/:productid', removeProductfromCart)
router.get('/remove-cart-product/:productid', removeCartProduct)
router.get('/checkout',userAuth, getCheckoutPage)
router.get('/add-address', userAuth, getAddressPage)
router.post('/add-address', userAuth, addNewAddress)
router.post('/checkout/coupon', userAuth, applyCoupons)
router.post('/payment-verify', userAuth, verfiyPayment)
router.post('/place-order', userAuth, placeOrder)
router.post('/payment-failed', userAuth, paymentFailed)
router.get('/profile/edit-account', userAuth , editUserAccount)
router.patch('/profile/edit-credential', userAuth , editUserCredential)
router.patch('/profile/edit-password', userAuth , editPassword)
router.post('/profile/edit-email', userAuth , verifyEditedEMail)
router.post('/profile/change-email-verify-otp', userAuth, verifyOtpforEditedEmail)
router.get('/profile/manage-address', userAuth, getUserAddress)
router.get('/profile/manage-address/edit/:addressid',userAuth , editOneAddressPage)
router.put('/profile/manage-address/edit/:addressid',userAuth , editOneAddress)
router.delete('/manage-address/remove/:addressid', userAuth, removeOneAddress)
router.get('/orders', userAuth, getAllUserOrder)
router.get('/wishlist/add/:productid', userAuth, addToWishList)
router.get('/wishlist/remove/:productid', userAuth, removeFromwishlist)
router.get('/wishlist', userAuth, getWishlist)


export default router;