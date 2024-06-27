import { Types } from "mongoose";
import Banner from "../models/banner.js";

// Create new Banner
export async function insertOneBanner (info) {
    
        const response = await Banner.create(info)
        return response
    
}

// Find all banners
export async function findBanner (info) {
    
        const response = await Banner.find(info).sort({_id: -1  })
        return response
    
}

// Find only one banner
export async function findeOneBanner (bannerid) {
    
        const response = await Banner.findById(bannerid)
        return response
    
}

// Update only one banner
export async function updateOneBanner (bannerid,bannerInfo) {
    
        const response = await Banner.updateOne({_id: new Types.ObjectId(bannerid)},{
            $set : bannerInfo
        })
        return response
    
}

// Update banner is active
export const isBannerActive = async (bannerid, isactive) => {
    
        const isact = isactive == "true" ? false : true
        
        const response = await Banner.findOneAndUpdate({_id: new Types.ObjectId(bannerid)}, {
            $set : {isActive : isact},
            $currentDate: {updatedAt: true}
        },{new: true})
        return response
    
}

// DeleteOneBanner
export const deleteOneBanner = async (bannerid) => {
    
        const response = await Banner.findOneAndDelete({_id: new Types.ObjectId(bannerid)})
        
        return response
    
}

