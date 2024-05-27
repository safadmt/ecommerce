import { Types } from "mongoose";
import Order from "../models/order.js";
import { response } from "express";


export async function createOrder(orderInfo) {
    try{
        const response = await Order.create(orderInfo)
        return response;
    }catch(err) {
        console.log(err)
    }
}

export async function updateOrder({orderId, orderInfo}) {
    try{
        const response = await Order
        .updateOne({_id: new Types.ObjectId(orderId)},
        {
            $set : orderInfo
        })
        return response;
    }catch(err) {
        console.log(err)
    }
}

export async function findOneOrder(orderId) {
    try{
        const response = await Order.findById(orderId)
        return response;
    }catch(err) {
        console.log(err)
    }
}

export async function getUserOrders(userid) {
    try{
        const response = await Order
        .find({userId: new Types.ObjectId(userid)})
        .populate('products.productid')
        .populate('addressId')
        return response;
    }catch(err) {
        console.log(err)
    }
}


export async function findAllOrder(info) {
    try{
        const orders = await Order.find(info).populate('userId', {username: 1})
        return orders;
    }catch(err) {
        console.log(err)
    }
}





