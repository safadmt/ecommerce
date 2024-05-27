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
    removeOneBanner
} from '../controllers/admin.js';
const router = express.Router();
import {uploadFile,uploadBannerFile} from '../middleware/multer.js';
import { adminAuth } from '../middleware/authorization.js';
const upload = uploadFile();
const uploadBanner = uploadBannerFile()

router.use(adminAuth)

router.get('/', getHomePage);
router.get('/products', getProductsPage);
router.get('/products/add-product', getAddProductPage);
router.post('/products/add-product',upload,createNewProduct);
router.get('/products/edit/:productid', getEditPage);
router.put('/products/edit/:productid', upload, editProduct);
router.post('/products/edit-product-active/:productid', productIsAcitve);
router.get('/coupons', getCouponPage);
router.get('/coupons/add-coupon', getAddCouponPage);
router.post('/coupons/add-coupon', createNewCoupon);
router.get('/coupons/edit/:couponid', getEditCouponPage);
router.put('/coupons/edit/:couponid', editCoupon);
router.patch('/coupons/edit-coupon-active/:couponid', couponIsActive);
router.delete('/coupons/delete/:couponid', removeOneCoupon)
router.get('/banners', getBannerPage)
router.get('/banners/add-banner', getAddBannerPage)
router.post('/banners/add-banner',uploadBanner, createNewBanner)
router.get('/banners/edit/:bannerid', getBannerEditPage)
router.put('/banners/edit/:bannerid',uploadBanner , editOneBanner)
router.patch('/banners/edit-banner-active/:bannerid', bannerIsActive)
router.delete('/banners/delete/:bannerid', removeOneBanner)
export default router;