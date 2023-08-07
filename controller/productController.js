const Product = require('../models/productModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const validateMongoDbId = require('../utils/validateMongodbId');
const fs = require('fs');
const { cloudinaryUploadImg, cloudinaryDeleteImg  } = require('../utils/cloudinary');

const createProduct = asyncHandler(async (req, res) => {
    try{
        if(req.body.title){
            req.body.slug = slugify(req.body.title)
        }
        const newProduct = await Product.create(req.body)
        res.json(newProduct)
    } catch(error){
        throw new Error(error);
    }
})

const updateProduct = asyncHandler(async (req, res) => {
    try{
        const id = req.params
        console.log(id)
        const _id = id.id
        if(req.body.title){
            req.body.slug = slugify(req.body.title)
        }
        const updateProduct = await Product.findOneAndUpdate({_id} , req.body, {
            new: true,
        })
        if(updateProduct){
            res.json(updateProduct);
        }
        else {
            res.json({
                message: "Product not found with particular id, Please check once if the product exist"
            })
        }
    } catch(error){
        throw new Error(error);
    }
})

const deleteProduct = asyncHandler(async (req, res) => {
    try{
        const id = req.params
        console.log(id)
        const _id = id.id
        const deletedProduct = await Product.findOneAndDelete({_id})
        console.log(deleteProduct)
        res.json(deletedProduct);
    } catch(error){
        throw new Error(error);
    }
})

const getaProduct = asyncHandler(async (req, res) => {
    const {id} = req.params;
    try{
        const findProduct = await Product.findById(id)
        res.json(findProduct);
    } catch(error){
        throw new Error(error)
    }
})

const getallProduct = asyncHandler(async (req, res) => {
    try{
        const queryObj = { ...req.query};
        const excludeFields = ["page", "sort", "limit", "fields"];
        excludeFields.forEach((el) => delete queryObj[el])
        
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte| gt|lte|lt)\b/g, (match) => `$${match}`);
        console.log() 

        let query = Product.find(JSON.parse(queryStr))

        // Sorting
        if(req.query.sort){
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy)
        } else {
            query = query.sort("-createdAt");
        }

        // limiting the fields
        if(req.query.fields){
            const fields =  req.query.fields.split(",").join(" ")
            query = query.select(fields)
        } else {
            query = query.select('-__v')
        }

        //Pagination 
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        if(req.query.page){
            const productCount = await Product.countDocuments();
            if(skip >= productCount) throw new Error("This page doesn't exist")
        }
        const product = await query;
        res.json(product);
    } catch(error){
        throw new Error(error)
    }
})

const addToWishList = asyncHandler(async(req, res) => {
    const {_id} = req.user;
    console.log(_id)
    const { prodId } = req.body;
    try {
        const user = await User.findById(_id)
        const alreadyAdded = user.wishlist.find((id) => id.toString() === prodId)
        if(alreadyAdded){
            let user = await User.findByIdAndUpdate(_id,{
                $pull: { wishlist: prodId}
            }, {
                new: true
            })
            res.json(user)
        } else {
            let user = await User.findByIdAndUpdate(_id,{
                $push: { wishlist: prodId}
            }, {
                new: true
            })
            res.json(user)
        }
    } catch(error){
        throw new Error(error);
    }
})

const rating = asyncHandler(async(req, res ) => {
    const {_id} = req.user;
    const { rating, comment, prodId} = req.body;
    console.log(rating, prodId);
    try{
        const product = await Product.findById(prodId)
        let alreadyRated = product.ratings.find(
            (userId) => userId.postedby.toString() === _id.toString()
        )
        if(alreadyRated){
            const updateRating = await Product.updateOne(
                {
                    ratings: { $elemMatch: alreadyRated }
                },
                {
                    $set: { "ratings.$.star": rating, "ratings.$.comment": comment }
                },
                {
                    new: true
                }
            );
        } else {
            const ratedproduct = await Product.findByIdAndUpdate( prodId,{
                $push: {
                    ratings: {
                        star: rating,
                        comment: comment,
                        postedby: _id
                    }
                }
            }, { new: true}) 
        }
        const getAllRatings = await Product.findById(prodId)
        let totalRating = getAllRatings.ratings.length
        let ratingSum = getAllRatings.ratings
            .map((item) => item.star)
            .reduce((prev, curr) => prev + curr, 0)
        let actualRating = Math.round(ratingSum/totalRating);
        let finalProduct = await Product.findByIdAndUpdate(
            prodId,
            {
                totalrating : actualRating
            },
            {
                new: true
            })
        res.json(finalProduct)
    } catch(error){
        throw new Error(error)
    }
})

const uploadImages = asyncHandler(async(req, res) => {
    try{
        const uploader = (path) => cloudinaryUploadImg(path, "images");
        const urls = [];
        const files = req.files;
        console.log(files);
        for(const file of files){
            const { path } = file;
            const newPath = await uploader(path);
            urls.push(newPath);   
            fs.unlinkSync(path);
        }
        const images = urls.map((file) => {
            return file;
        })
        res.json(images)
    } catch(error){
        throw new Error(error);
    }
})

const deleteImages = asyncHandler(async(req, res) => {
    const { id } = req.params;
    try{
        const deleted = cloudinaryDeleteImg(id, "images");
        res.json({message: "Deleted"})
    } catch(error){
        throw new Error(error);
    }
})


module.exports = {
    createProduct, 
    getaProduct, 
    getallProduct, 
    updateProduct, 
    deleteProduct, 
    addToWishList, 
    rating, 
    uploadImages,
    deleteImages
};