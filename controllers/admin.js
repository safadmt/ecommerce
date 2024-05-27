import {isValidObjectId} from 'mongoose'
import { getAllProduct, getOneProduct, insertProduct, productAcitveorInactive, updateOneProduct } from '../helpers/productHelper.js'
import {unlink} from 'fs'
import {fileURLToPath} from 'url'
import {dirname} from 'path'
import { deleteOneCoupon, findAllCoupons, findOneCoupon, insertCoupon, isCouponActive, updateCoupon } from '../helpers/couponHelpers.js'
import { deleteOneBanner, findBanner, findeOneBanner, insertOneBanner, isBannerActive, updateOneBanner } from '../helpers/bannerHelper.js'
import passport from 'passport'
import { authenticateAdmin } from '../helpers/admin.js'
const path = dirname(dirname(fileURLToPath(import.meta.url)))

export const getAdminLogin = (req,res)=> {
    req.session.user = {}
    const role = "admin"
    res.render('pages/admin/login', {username: req.session.admin?  req.session.admin.username :"", role})
}


export const adminLogin = async (req,res,next) => {
    const {email , password} = req.body
    console.log(req.body)
    if(!req.body || !email || !password) {
      req.flash("warning_msg", "Email and password is required")
      res.redirect('/auth/admin/login')
      return
    }
    const data = await authenticateAdmin(req.body)
    if(data.message) {
      req.flash('warning_msg' , data.message)
      res.redirect('/auth/admin/login')
    }else{
      const {username, email, _id} = data.response
      req.session.admin = {username, email, _id}
      req.session.role = "admin"
      res.redirect('/admin')
    }

}


export const getHomePage = (req,res)=> {
    const role = req.session.role || "admin"
    
    res.render('pages/admin/admin', {username: req.session.admin?  req.session.admin.username : "",role})
}

export const getProductsPage = async(req,res)=> {
    const role = req.session.role || "admin"
    try{
        const data = await getAllProduct({});
        const products = data.length > 0 ? data : []
res.render('pages/admin/products', {username: req.session.admin?  req.session.admin.username : "", products,role})
    }catch(err) {
        console.log(err)
    }
    
}

export const getAddProductPage = (req,res)=> {
    const role = req.session.role || "admin"
    res.render('pages/admin/addproduct', {username: req.session.admin?  req.session.admin.username : "",role})
}

export const createNewProduct = (req,res) => {
    if(!req.body) {
        req.flash("warning_msg", "All star fields are required")
        res.redirect('/admin/products/add-product')
    }
    const {discount_in_percentage,price} = req.body
    const image = []
    req.files.forEach(file=> {
        image.push(file.filename)
    })
    if(discount_in_percentage) {
        const disco = (parseInt(price) * parseInt(discount_in_percentage)) / 100
        req.body.price_after_discount = Math.ceil(disco)
    }
    req.body.images = image
    console.log(req.body)
    insertProduct(req.body)
    .then(data=> {
        if(data) {
            res.json("Ok")
        }
        
    })
    .catch(err=> {
        console.log(err)
    })


}

//Get edit page
export const getEditPage = (req,res)=> {
    const role = req.session.role || "admin"
    if(isValidObjectId(req.params.productid)) {
        getOneProduct(req.params.productid)
    .then(response=> {
        console.log(response)
        res.render('pages/admin/editproduct', {username: req.session.admin?  req.session.admin.username : "", product:response,role})
    })
    .catch(err=> {console.error(err)})
    }
    
    
}

export const editProduct = async(req,res)=> {
    if(!req.body) {
        req.flash("warning_msg", "All star fields are required")
        res.redirect(`/admin/products/edit/${req.params.productid}`)
    }
    try{
        const {discount_in_percentage ,price} = req.body
        if(discount_in_percentage) {
            const disco = (parseInt(price) * parseInt(discount_in_percentage)) / 100
            req.body.price_after_discount = Math.ceil(disco)
        }
        if(req.files.length > 0) {
            if(isValidObjectId(req.params.productid)) {
                const product = await getOneProduct(req.params.productid)
                product.images.forEach(file=> {
                        
                        
                        unlink(`${path}/public/products/images/${file}`, (err)=> {
                            if(err) throw err;

                        })
                    
                })
                let image = []
                req.files.forEach(file=> {
                    image.push(file.filename)
                })
                req.body.images = image
                const response = await updateOneProduct(req.params.productid, req.body)
                res.status(200)
                res.json("Ok")
            }
            
        }else{
            
            const response = await updateOneProduct(req.params.productid,req.body)
            res.status(200)
            res.json("Ok")
        }
    }catch(err) {
        console.log("error ", err

        )
    }
    

}


export const productIsAcitve = async(req,res) => {
    if(!req.body) {
        return 
    }
    
    if(isValidObjectId(req.params.productid)) {
        console.log("ok")
        try{
            const response = await productAcitveorInactive(req.params.productid,req.body.isActive)
            
        res.status(200)
        res.json(response)
        }catch(err) {
            console.error(err)
        }
        
    }
    
}

export async function getCouponPage (req,res) {
    const role = req.session.role || "admin"
    try{
        const response = await findAllCoupons()
        res.render('pages/admin/coupon', {username: req.session.admin? req.session.admin.username : "", coupons: response,role})
    }catch(err) {
        console.log(err)
    }
    
}

export function getAddCouponPage(req,res) {
    const role = req.session.role || "admin"
    res.render('pages/admin/addcoupon',{role})
}

export async function getEditCouponPage(req,res) {
    const role = req.session.role || "admin"
    try{
        if(isValidObjectId(req.params.couponid)) {
            const coupon = await findOneCoupon(req.params.couponid)
            res.render('pages/admin/editcoupon', {coupon: coupon,role})
        }
        
    }catch(err) {
        console.log(err)
    }
    
}

export async function createNewCoupon (req,res) {
   
    if(!req.body) {
        req.flash("warning_msg", "All star indicated fields are required")
        res.redirect('/admin/coupons/add-product')
    }
    try{
        const response = await insertCoupon(req.body)
        res.status(201)
        res.json(response)
    }catch(err) {
        console.error(err)
    }

}

export async function editCoupon (req,res) {
   
    if(!req.body) {
        req.flash("warning_msg", "All star indicated fields are required")
        res.redirect(`/admin/coupons/edit/${req.params.couponid}`)
    }
    try{
        console.log(req.params)
        if(isValidObjectId(req.params.couponid)) {
            const response = await updateCoupon(req.params.couponid,req.body)
            res.status(200)
            res.json("Ok")
        }else{
            console.log("Not valid coupon id")
        }
        
    }catch(err) {
        console.error(err)
    }

}


export async function couponIsActive (req,res) {
    if(!req.body) {
        return
    }
    try{
        console.log(req.params)
        console.log(req.body)
        if(isValidObjectId(req.params.couponid)) {
            const response = await isCouponActive(req.params.couponid,req.body.content.trim())
            res.status(200)
            res.json(response)
        }else{
            console.log("Not valid coupon id")
        }
        
    }catch(err) {
        console.error(err)
    } 
}

export async function removeOneCoupon(req,res) {
    
    try{
        const response = await deleteOneCoupon(req.params.couponid)
        res.json("Ok")
    }catch(err) {
        console.error(err)
    }
}

export async function getBannerPage(req,res) {

    const role = req.session.role || "admin"
    try{
        const response = await findBanner()
       res.render('pages/admin/banner', {banners : response,role})
    }catch(err) {
        console.error(err)
    }
}
export async function getBannerEditPage(req,res) {
    const role = req.session.role || "admin"
    try{
        console.log(req.params.bannerid)
        if(isValidObjectId(req.params.bannerid)) {
            const response = await findeOneBanner(req.params.bannerid)
            res.render('pages/admin/editbanner', {banner : response,role})
        }
        
    }catch(err) {
        console.error(err)
    }
}
export async function getAddBannerPage(req,res) {
    const role = req.session.role || "admin"
    try{
       res.render('pages/admin/addbanner', {role})
    }catch(err) {
        console.error(err)
    }
}

export async function createNewBanner(req,res) {
    try{
       if(!req.body) {
        req.flash('warning_msg', "Required all star indicated fields")
        res.redirect('/admin/banners/add-banner')
       }
       
       req.body.imageurl = req.file.filename
       req.body.isActive = req.body.isActive === "" ? false : req.body.isActive
       try{
        const response = await insertOneBanner(req.body)
        res.status(201)
        res.json(response)
     }catch(err) {
         console.error(err)
     }
       

    }catch(err) {
        console.error(err)
    }
}

export async function editOneBanner(req,res) {
    if(!req.body) {
            req.flash("warning_msg", "Required all star indicated field")
            res.redirect(`/admin/banners/edit/${req.params.bannerid}`)
        }
    try{
        
        if(req.file) {
            if(!isValidObjectId(req.params.bannerid)) {
                req.flash("error", "Something went wrong")
                res.redirect(`/admin/banners/edit/${req.params.bannerid}`)
            }
           const banner = await findeOneBanner(req.params.bannerid)
           unlink(`${path}/public/banners/${banner.imageurl}`, err=> {
            if(err) throw err;

           })

           req.body.imageurl = req.file.filename;
           await updateOneBanner(req.params.bannerid, req.body)
           res.json("Ok")
        }else{
            
            const {first_caption, second_caption, link, isActive} = req.body
            const obj = {first_caption,second_caption,link,isActive}

            await updateOneBanner(req.params.bannerid, obj)
            res.json("Ok")
        }
       
    }catch(err) {
        console.error(err)
    }
}

export async function bannerIsActive (req,res) {
    console.log(req.body)
    if(!req.body) {
        return
    }
    try{
        
        if(isValidObjectId(req.params.bannerid)) {
            const response = await isBannerActive(req.params.bannerid,req.body.content)
            console.log(response)
            res.status(200)
            res.json(response)
        }else{
            console.log("Not valid coupon id")
        }
        
    }catch(err) {
        console.error(err)
    } 
}


export async function removeOneBanner(req,res) {
    const {bannerid} = req.params;
    try{

       const banner = await deleteOneBanner(bannerid)

       unlink(`${path}/public/banners/${banner.imageurl}`, err=> {
        if(err) throw err;
        res.json("Ok")
       })

    }catch(err) {
        console.error(err)
    }
}

export async function getOrderPage (req,res) {
    try{
        
    }catch(err) {
        console.log(err)
    }
}






