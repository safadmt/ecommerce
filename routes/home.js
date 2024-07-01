import express from 'express';
import { userAuth } from '../middleware/authorization.js';
import { getMainLandingPage , pageNotFound, viewProduct,getUserCartPage,
     getnewProducts,
     getShopingPage,
     searchProducts,
     getProductCollection,
     addProductRating,
     addProductReview,
     orderSuccess,
     orderCancelled,
     stripeVerifyPayment,
     getProductByBrand
} from '../controllers/users.js';

const router = express.Router();

// Route to get main home page
router.get('/', getMainLandingPage);

// Route to get view a specific product page
router.get('/product/:productid',viewProduct );

// Route to get cart page
router.get('/cart', getUserCartPage);

// Route to 
router.get('/newproduct', getnewProducts);

// Route to get the product shoping page
router.get('/shop/:page?', getShopingPage);

router.get('/page-not-found', pageNotFound);

// Route to get Search page
router.get('/search/:page?', searchProducts);

// Route to get product collection page
router.get('/collection/:item/:page?', getProductCollection)

// Route to get product collection page
router.get('/new-products', getnewProducts)

// Route to get product by brands
router.get('/brand/:brandname', getProductByBrand)

// Route to handle product rating
router.post('/product/rating/:productid',userAuth, addProductRating )

// Route to get Order success page 
router.get('/order/confirmation/:orderid',userAuth, orderSuccess)

// Route to get order cancelled or failed page
router.get('/order/cancelled/:orderid',userAuth, orderCancelled);

// Route to handle stripe successfull payment\
router.get('/order/stripe/verify-payment/:orderid',userAuth, stripeVerifyPayment)

// Route to handle product rating
router.post('/product/review/:productid',userAuth, addProductReview )
export default router;