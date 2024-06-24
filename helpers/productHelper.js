import Product from '../models/product.js'
import { Types} from 'mongoose'
import Review from '../models/reviews.js'

// Create new product
export async function insertProduct(productInfo) {
        const response = await Product.create(productInfo)
        return response
}

// Get all product from the database based on the filteration , limit number of product , skip
export async function getAllProduct(info,limit = 50, skip=0, sort = 1) {
        const response = await Product.find(info)
        .skip(skip)
        .limit(limit)
        .sort({createdAt:sort})
        return response
}


//Get One Product 
export async function getOneProduct(productId) {
        const product = await Product.findById(productId)
        return product;
}

// Update the one product
export async function updateOneProduct (productId, productInfo) {
        const response = await Product.findOneAndUpdate({_id: new Types.ObjectId(productId)},{
            $set: productInfo
        },{new:true})
        return response
}

// Update product isActive or not
export async function productAcitveorInactive (productId,isactive){
        let acti = isactive.trim()
        const bool = acti == "Active" ? true : false
        const response = await Product.findOneAndUpdate({_id: new Types.ObjectId(productId)},{
            $set: {isActive: bool},
            $currentDate: {updatedAt: true}
        },{new: true})
        return response
}

//Update stock availability
export async function updateStockAvailability (productId,quantity){
        const response = await Product.updateOne({_id: new Types.ObjectId(productId)},{
            $inc: {stock_available: -quantity, product_sold: quantity}
        })
        return response
}

// Get new product from the database 
export async function getNewProduct (limit = 10){
        const response = await Product.find({isActive: true}).sort({createdAt: -1}).limit(limit)
        return response
}

// Search product from the database 
export async function searchProduct(searchtext, skip, limit) {
        const response = Product.find({$text: {$search : searchtext}}).skip(skip).limit(limit)
        return response
}



// Search product from the database 
export async function getProductCountByBrand() {
        const response = Product.aggregate([
            {
                $group: {
                    _id: "$brand",
                    totalproduct: {$count: {}}
                }
            },
            
        ])
        return response
}

// Search product from the database 
export async function findPrdoctComments(productid) {
        const response = await Review.
        find({productid: new Types.ObjectId(productid)}).populate('userid', {username: 1})
        return response
}
// Count total product documents based on the filteration
export async function countProductDocuments(info) {
        const response = Product.countDocuments(info)
        return response
}

// get averate rating of the product
export async function getProductAverageRating(productid) {
        const response = Review.aggregate([
            {
                $match : {productid: new Types.ObjectId(productid), rating: {$ne: 0}}
            },
            {
                $group: {
                    _id: null,
                    averagerating : {$avg:"$rating"}
                }
            }
        ])
        
        return response
}

// get averate rating of the product
export async function getTotalCommentofProduct(productid) {
        const response = await Review.aggregate([
            {
                $match : {productid: new Types.ObjectId(productid), comment: {$ne:null}}
            },
            {
                $group: {
                    _id: null,
                    totalcomments : {$count : {}}
                }
            }
        ])
        
        return response[0]?.totalcomments || 0
}


