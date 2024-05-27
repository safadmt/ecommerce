import Product from '../models/product.js'
import {isValidObjectId, Types} from 'mongoose'
export async function insertProduct(productInfo) {
    try{
        const response = await Product.create(productInfo)
        return response
    }catch(err) {
        console.log(err)
    }
}

export async function getAllProduct(info,limit, skip) {
    try{
        
        const response = await Product.find(info).skip(skip).limit(limit)
        
        return response
    }catch(err) {
        console.log(err)
    }
}
//Get One Product
export async function getOneProduct(productId) {
    try{
        const product = await Product.findById(productId)
        return product;
    }catch(err) {
        console.error(err)
    }
}

export async function updateOneProduct (productId, productInfo) {
    try{
        const response = await Product.updateOne({_id: new Types.ObjectId(productId)},{
            $set: productInfo
        })
        return response
    }catch(err) {
        console.error(err)
    }
}

export async function productAcitveorInactive (productId,isactive){
    try{
        let acti = isactive.trim()
        console.log(acti)
        const bool = acti == "Active" ? true : false
        const response = await Product.findOneAndUpdate({_id: new Types.ObjectId(productId)},{
            $set: {isActive: bool},
            $currentDate: {updatedAt: true}
        },{new: true})
        return response
    }catch(err) {
        console.error(err)
    }
}

export async function updateStockAvailability (productId,quantity){
    try{
        
        const response = await Product.updateOne({_id: new Types.ObjectId(productId)},{
            $inc: {stock_available: -quantity, product_sold: quantity}

        })
        return response
    }catch(err) {
        console.error(err)
    }
}

export async function getNewProduct (limit = 8){
    try{
        const currentDate = new Date();
        const weekago = new Date(currentDate.getTime() - 7 * 24 * 60 * 60  * 1000)
        const response = await Product.find({createdAt: {$gt: weekago, $lt: currentDate}}).limit(limit)
        return response
    }catch(err) {
        console.error(err)
    }
}

export async function searchProduct(searchtext) {
    try{
        const response = Product.find({$text: {$search : searchtext}}).skip(0).limit(12)
        return response
    }catch(err) {
        console.log(err)
    }
}

