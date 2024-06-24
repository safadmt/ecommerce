import express from 'express';
import { getHomePage ,getProductsPage,getAddProductPage,createNewProduct,
    getEditPage,editProduct, productIsAcitve,getCouponPage,getAddCouponPage,
    createNewCoupon,getEditCouponPage,editCoupon , couponIsActive,
    removeOneCoupon,
    getBannerPage,
    getAddBannerPage,
    createNewBanner,
    getBannerEditPage,
    editOneBanner,
    bannerIsActive,
    removeOneBanner,
    getOrderPage,
    getAllUsers,
    blockorUnBlockUser,
    removeUser,
    handleOrderStatus,
    getReturnsListingPage,
    handleReturnStatus,
    generateCouponCode,
    isProductReturnable
} from '../controllers/admin.js';
const router = express.Router();
import {uploadFile,uploadBannerFile} from '../middleware/multer.js';
import { adminAuth } from '../middleware/authorization.js';
import { pageNotFound } from '../controllers/users.js';
const upload = uploadFile();
const uploadBanner = uploadBannerFile();

router.use(adminAuth);

// Route to get admin home page
router.get('/', getHomePage);

//Route to get the products handle page
router.get('/products/?', getProductsPage);

// Route to add product page
router.get('/products/add-product', getAddProductPage);

// Route to handle adding product 
router.post('/products/add-product',upload,createNewProduct);

// Route to get the edit product page
router.get('/products/edit/:productid', getEditPage);

// Route to handle update product
router.put('/products/edit/:productid', upload, editProduct);

// Route to handle prduct is active or not
router.post('/products/edit-product-active/:productid', productIsAcitve);

// Route to handle product is returnable or not
router.patch('/products/edit-product-returnble/:productid', isProductReturnable)
// Route to get the manage coupon page
router.get('/coupons', getCouponPage);

// Route to get the add coupon page
router.get('/coupons/add-coupon', getAddCouponPage);

// Route to handle add new coupon
router.post('/coupons/add-coupon', createNewCoupon);

// Route to get the edit coupon page
router.get('/coupons/edit/:couponid', getEditCouponPage);

// Route to handle update coupon
router.put('/coupons/edit/:couponid', editCoupon);

// Route to handle update coupon active or not
router.patch('/coupons/edit-coupon-active/:couponid', couponIsActive);

// Route to delete one coupon
router.delete('/coupons/delete/:couponid', removeOneCoupon);

// Route to get manage banners page
router.get('/banners', getBannerPage);

// Route to get add banner page 
router.get('/banners/add-banner', getAddBannerPage);

// Route to handle add new banner
router.post('/banners/add-banner',uploadBanner, createNewBanner);

// Route to get edit banner page
router.get('/banners/edit/:bannerid', getBannerEditPage);

// Route to handle update banner
router.put('/banners/edit/:bannerid',uploadBanner , editOneBanner);

// Route to handle banner active or not
router.patch('/banners/edit-banner-active/:bannerid', bannerIsActive);

// Route to delete one banner
router.delete('/banners/delete/:bannerid', removeOneBanner);

// Route to get orders page
router.get('/orders/?', getOrderPage);

// Route to handle update order status
router.put('/orders/status/:orderid', handleOrderStatus);

// Route to get users page
router.get('/users', getAllUsers);

// Route to handle update block user
router.patch('/users/block-or-unblock/:userid', blockorUnBlockUser);

// Route to delete user 
router.delete('/users/delete/:userid', removeUser);

// Route to get product returns page
router.get('/returns', getReturnsListingPage)

// Router to handle coupon code generate
router.get('/generate-coupon-code', generateCouponCode)

// Route to handle Return Status 
router.patch('/returns/status/:returnid', handleReturnStatus);

export default router;