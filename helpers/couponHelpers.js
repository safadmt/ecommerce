import { Types } from 'mongoose'
import Coupon from '../models/coupon.js'

export const insertCoupon = async(data) => {
    try{
        const response = await Coupon.create(data)
        return response
    }catch(err) {
        console.error(err)
    }
    
    
}

export const findAllCoupons = async(query) => {
    try{
        const response = await Coupon.find(query)
        return response
    }catch(err) {
        console.error(err)
    }
}

export const findCouponByCouponCode = async(coupon_code) => {
    try{
        const response = await Coupon.findOne({coupon_code: coupon_code})
        return response
    }catch(err) {
        console.error(err)
    }
}

export const findOneCoupon = async(couponId) => {
    try{
        const response = await Coupon.findById(couponId)
        return response
    }catch(err) {
        console.error(err)
    }
}

export const updateCoupon = async(couponId,data) => {
    try{
        const response = await Coupon.updateOne({_id: new Types.ObjectId(couponId)},{
            $set: data
        })
        return response
    }catch(err) {
        console.error(err)
    }
}

export const isCouponActive = async (couponId, isactive) => {
    try{
        const isact = isactive == "true" ? false : true
        console.log(isactive)
        const response = await Coupon.findOneAndUpdate({_id: new Types.ObjectId(couponId)}, {
            $set : {isActive : isact},
            $currentDate: {updatedAt: true}
        },{new: true})
        console.log(response)
        return response
    }catch(err) {
        console.error(err)
    }
}

export const deleteOneCoupon = async (couponId) => {
    try{
        const response = await Coupon.deleteOne({_id: new Types.ObjectId(couponId)})
        
        return response
    }catch(err) {
        console.error(err)
    }
}
