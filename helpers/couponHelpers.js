import { Types } from 'mongoose'
import Coupon from '../models/coupon.js'


// Create one coupon
export const insertCoupon = (data) => {
   return new Promise((resolve,reject)=> {
    Coupon.create(data)
    .then(response=> {
        resolve(response)
    })
    .catch(err=> {
        reject(err)
    })
   })
    
}



// Get all Coupon from the database
export const findAllCoupons = async(query) => {
   
        const response = await Coupon.find(query).lean()
        return response
}
// Finde coupon by coupon code
export const findCouponByCouponCode = async(coupon_code) => {
  
        const response = await Coupon.findOne({coupon_code: coupon_code,isActive:true})
        return response
    
}

// Find only one coupon by coupon _id
export const findOneCoupon = async(couponId) => {
   
        const response = await Coupon.findById(couponId)
        return response
    
}

// Update one coupon 
export const updateCoupon = async(couponId,data) => {
    
        const response = await Coupon.updateOne({_id: new Types.ObjectId(couponId)},{
            $set: data
        })
        return response
    
}

// Update coupon is active
export const isCouponActive = async (couponId, isactive) => {
    
        const isact = isactive == "true" ? false : true
        const response = await Coupon.findOneAndUpdate({_id: new Types.ObjectId(couponId)}, {
            $set : {isActive : isact},
            $currentDate: {updatedAt: true}
        },{new: true})
        return response
    
}

// Delete one coupon
export const deleteOneCoupon = async (couponId) => {
    
        const response = await Coupon.deleteOne({_id: new Types.ObjectId(couponId)})
        
        return response
    
}
