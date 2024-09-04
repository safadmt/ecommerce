import { Types } from "mongoose";
import Order from "../models/order.js";
import { orderStatusEnum } from "../utils/enum.js";
import Return from "../models/return.js";

// Create new order 
export async function createOrder(orderInfo) {
    
        const response = await Order.create(orderInfo)
        return response;
    
}


// Update existing order
export async function updateOrder(orderId, orderInfo) {
    
        const response = await Order
        .findOneAndUpdate({_id: new Types.ObjectId(orderId)},
        {
            $set : orderInfo
        },{new:true})
        return response;
    
}

// Find one order by order _id
export async function findOneOrder(orderId) {
    
        const response = await Order.findById(orderId)
        .populate('products.productid')
        .populate('addressId').lean()
        return response;
    
}

// Get user orders by userid
export async function getUserOrders(userid) {
    
        const response = await Order
        .find({userId: new Types.ObjectId(userid)})
        .populate('products.productid').lean()
        
        return response;
   
}

// Get user orders , shipped, delivered, placed
export async function getUserOrdersForcheck(userid) {
    
        const response = await Order.find({
            userId: new Types.ObjectId(userid),
            orderStatus: {$in: [orderStatusEnum.SHIPPED,orderStatusEnum.DELIVERED , orderStatusEnum.PLACED]}
        });
       
        return response;
    
}
// find all order based on the filter
export async function findAllOrder(info,limit=10, skip=0) {
    
        const orders = await Order.find(info).populate('userId', {username: 1}).populate('addressId').sort({createdAt: -1})
        .skip(skip)
        .limit(limit)
        console.log(orders);
        
        return orders;
    
}
// count Total order by filter 
export async function countTotalOrdersByFilter(info) {
  const Totalorders = await Order.countDocuments(info)
  return Totalorders
}
// Get the total orders count
export async function totalOrders(info) {
    
        const totalorders = await Order.countDocuments(info)
        return totalorders;
    
}


// Get the total product sold of the current year each months
export async function getTotalProductSold(startOfYear,startOfNextYear ) {

   
        const result = await Order.aggregate([
            {
              $match: {
                orderStatus: orderStatusEnum.DELIVERED,
                
              }
            },
            {
              $project: {
                month: { $month: "$createdAt" }
              }
            },
            {
              $group: {
                _id: {
                  month: "$month"
                },
                count: { $sum: 1 }
              }
            },
            {
              $sort: {
                "_id.month": 1
              }
            },
            {
              
              $project: {
                _id: 0,
                month: "$_id.month",
                count: "$count"
              }
            }
        ])
        return result;
    
}

// Get the total Sales price by grouping each brand
export async function totalSalesByBrand(info) {
    
        const totalorders = await Order.aggregate([
            {
                $match: {orderStatus : orderStatusEnum.DELIVERED}
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.productid',
                    foreignField: '_id',
                    pipeline: [
                        {$project: {brand: 1}}
                    ],
                    as: "newproducts"
                }
            },
            {
                $unwind: "$newproducts"
            },
            {
                $group: {
                    _id: "$newproducts.brand",
                    totalprice: {$sum: {$toInt: "$totalPrice"}}
                }
            }
        ])
        return totalorders
    
}

export async function getTotalIncome () {
    
        const totalprofit = await Order.aggregate([
            {
                $match: {orderStatus: orderStatusEnum.DELIVERED}
            },
            {
                $group: {
                    _id: null,
                    totalprofit: {$sum: "$totalPrice"}
                }
            },
            {
                $project: {
                    totalprofit: {$ceil: "$totalprofit"}
                }
            }
        ])
        
        return totalprofit[0]?.totalprofit || 0
   
}

export async function updateOrderProductReturn (orderid,productId,quantity){
    
        
  const response = await Order.updateOne({_id: new Types.ObjectId(orderid),
     "products.productid": new Types.ObjectId(productId)},{
      $set: {"products.$.returned_quantity" : quantity}

  })

}

export async function getReturnedProduct (orderid,productId){
   
      const product = await Return.
      findOne({orderid: new Types.ObjectId(orderid), productid: new Types.ObjectId(productId)})
      .populate('productid')
      return product
}

export async function getTotalOrderCountByStatus () {
  const result = await Order.aggregate([
    {
      $group: {
        _id: null,
        total_orders: { $sum: 1 },
        pending_orders: { $sum: { $cond: [{ $eq: ["$orderStatus", orderStatusEnum.PENDING] }, 1, 0] } },
        success_orders: { $sum: { $cond: [{ $eq: ["$orderStatus", orderStatusEnum.DELIVERED] }, 1, 0] } },
        failed_orders: { $sum: { $cond: [{ $eq: ["$orderStatus", orderStatusEnum.FAILED] }, 1, 0] } },
      }
    }
  ]);
  return result;
}



