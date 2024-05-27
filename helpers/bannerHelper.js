import { Types } from "mongoose";
import Banner from "../models/banner.js";

export async function insertOneBanner (info) {
    try{
        const response = await Banner.create(info)
        return response
    }catch(err) {
        console.log(err)
    }
}

export async function findBanner () {
    try{
        const response = await Banner.find()
        return response
    }catch(err) {
        console.log(err)
    }
}

export async function findeOneBanner (bannerid) {
    try{
        const response = await Banner.findById(bannerid)
        return response
    }catch(err) {
        console.log(err)
    }
}

export async function updateOneBanner (bannerid,bannerInfo) {
    try{
        const response = await Banner.updateOne({_id: new Types.ObjectId(bannerid)},{
            $set : bannerInfo
        })
        return response
    }catch(err) {
        console.log(err)
    }
}

export const isBannerActive = async (bannerid, isactive) => {
    try{
        const isact = isactive == "true" ? false : true
        
        const response = await Banner.findOneAndUpdate({_id: new Types.ObjectId(bannerid)}, {
            $set : {isActive : isact},
            $currentDate: {updatedAt: true}
        },{new: true})
        return response
    }catch(err) {
        console.error(err)
    }
}

export const deleteOneBanner = async (bannerid) => {
    try{
        const response = await Banner.findOneAndDelete({_id: new Types.ObjectId(bannerid)})
        
        return response
    }catch(err) {
        console.error(err)
    }
}

