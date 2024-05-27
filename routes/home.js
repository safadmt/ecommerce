import express from 'express';
import { userAuth } from '../middleware/authorization.js';
import { getMainLandingPage , pageNotFound, viewProduct,getUserCartPage,
     getnewProducts,
     getShopingPage,
    searchProducts} from '../controllers/users.js';

const router = express.Router();

router.get('/', getMainLandingPage)

router.get('/product/:productid',viewProduct )

router.get('/cart', getUserCartPage)
router.get('/cart/checkout', (req,res)=> {
    
    res.render('pages/user/checkout',{username: req.user? req.user.email : ""})
})
router.get('/newproduct', getnewProducts)
router.get('/shop', getShopingPage)

router.get('/page-not-found', pageNotFound)
router.get('/search', searchProducts)
export default router;