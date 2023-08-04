const PCategory = require('../models/prodCategoryModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbId');

const createCategory = asyncHandler(async(req, res) => {
    try{
        const newCategory = await PCategory.create(req.body);
        res.json(newCategory);
    } catch(error){
        throw new Error(error)
    }
})

const updateCategory = asyncHandler(async(req, res) => {
    const {id} = req.params
    validateMongoDbId(id)
    try{
        const updatedCategory = await PCategory.findByIdAndUpdate({_id: id}, req.body, {new: true});
        res.json(updatedCategory);
    } catch(error){
        throw new Error(error)
    }
})

const deleteCategory = asyncHandler(async(req, res) => {
    const {id} = req.params
    validateMongoDbId(id)
    try{
        const deletedCategory = await PCategory.findByIdAndDelete({_id: id});
        res.json(deletedCategory);
    } catch(error){
        throw new Error(error)
    }
})

const getCategory = asyncHandler(async(req, res) => {
    const {id} = req.params
    try{
        const category = await PCategory.findById({_id: id})
        res.json(category)
    } catch(error){
        throw new Error(error)
    }
})

const getAllCategory = asyncHandler(async(req, res) => {
    try{
        const categories = await PCategory.find()
        res.json(categories)
    } catch(error){
        throw new Error(error)
    }
})

module.exports = {createCategory, updateCategory, getCategory, getAllCategory, deleteCategory}