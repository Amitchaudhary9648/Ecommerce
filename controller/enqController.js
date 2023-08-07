const Enquiry = require('../models/enqModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbId');

const createEnquiry = asyncHandler(async(req, res) => {
    try{
        const newEnquiry = await Enquiry.create(req.body);
        res.json(newEnquiry);
    } catch(error){
        throw new Error(error)
    }
})

const updateEnquiry = asyncHandler(async(req, res) => {
    const {id} = req.params
    validateMongoDbId(id)
    try{
        const updatedEnquiry = await Enquiry.findByIdAndUpdate({_id: id}, req.body, {new: true});
        res.json(updatedEnquiry);
    } catch(error){
        throw new Error(error)
    }
})

const deleteEnquiry = asyncHandler(async(req, res) => {
    const {id} = req.params
    validateMongoDbId(id)
    try{
        const deletedEnquiry = await Enquiry.findByIdAndDelete({_id: id});
        res.json(deletedEnquiry);
    } catch(error){
        throw new Error(error)
    }
})

const getEnquiry = asyncHandler(async(req, res) => {
    const {id} = req.params
    try{
        const enquiry = await Enquiry.findById({_id: id})
        res.json(enquiry)
    } catch(error){
        throw new Error(error)
    }
})

const getAllEnquiry = asyncHandler(async(req, res) => {
    try{
        const categories = await Enquiry.find()
        res.json(categories)
    } catch(error){
        throw new Error(error)
    }
})

module.exports = {createEnquiry, updateEnquiry, getEnquiry, getAllEnquiry, deleteEnquiry}