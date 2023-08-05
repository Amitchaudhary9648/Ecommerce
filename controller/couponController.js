const Coupon = require('../models/couponModel');
const validateMongodbId = require('../utils/validateMongodbId');
const asyncHandler = require('express-async-handler');

const createCoupon = asyncHandler(async(req, res) => {
    try{
        const newCoupon = await Coupon.create(req.body);
        res.json(newCoupon);
    } catch(error){
        throw new Error(error);
    }
})

const updateCoupon = asyncHandler(async(req, res) => {
    const {id} = req.params
    validateMongodbId(id);
    console.log(id)
    try{
        const updatedCoupon = await Coupon.findByIdAndUpdate({_id: id},req.body,{new: true})
        if(updatedCoupon){
            res.json(updatedCoupon)
        } else{
            res.json({
                message: "Coupon not found with the id"
            })
        }
    } catch(error){
        throw new Error(error)
    }
})

const deleteCoupon = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateMongodbId(id);
    try{
        const deletedCoupon = await Coupon.findByIdAndDelete({_id: id})
        res.json(deletedCoupon)
    } catch(error){
        throw new Error(error);
    }
}) 

const getAllCoupon = asyncHandler(async(req, res) => {
    try{
        const allCoupon = await Coupon.find();
        res.json(allCoupon);
    } catch(error) {
        throw new Error(error)
    }
})

module.exports = { createCoupon, updateCoupon, getAllCoupon, deleteCoupon }; 