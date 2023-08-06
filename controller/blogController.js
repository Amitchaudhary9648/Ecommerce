const Blog = require("../models/blogModel");
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbId');
const cloudinaryUploadImg = require("../utils/cloudinary");
const fs = require('fs'); 

const createBlog = asyncHandler(async(req, res) => {
    try{
        const newBlog = await Blog.create(req.body)
        res.json({
            status: "success",
            newBlog
        })
    } catch(error){
        throw new Error(error)
    }
})

const updateBlog = asyncHandler(async(req, res) => {
    try{
        const { id } = req.params;
        console.log(id);
        const updateBlog = await Blog.findOneAndUpdate({_id: id}, req.body, {new: true});
        res.json(updateBlog);  
    } catch(error){
        throw new Error(error)
    }
})

const getBlog = asyncHandler(async(req, res) => {
    try{
        const { id } = req.params;
        validateMongoDbId(id)
        console.log(id);
        const getBlog = await Blog.findById({_id: id}).populate('likes').populate('dislikes');
        await Blog.findByIdAndUpdate({_id: id}, { $inc:{numViews: 1}}, {new: true})
        res.json(getBlog);  
    } catch(error){
        throw new Error(error)
    }
})

const getAllBlogs = asyncHandler(async(req, res) => {
    try{
        const getBlogs = await Blog.find()
        res.json(getBlogs)
    } catch(error){
        throw new Error(error);
    }
})

const deleteBlog = asyncHandler(async(req, res) => {
    try{
        const { id } = req.params;
        validateMongoDbId(id)
        console.log(id);
        const deleteBlog = await Blog.findOneAndDelete({_id: id});
        res.json(deleteBlog);  
    } catch(error){
        throw new Error(error)
    }
})

const likeBlog = asyncHandler(async(req, res) => {
    const {blogId} = req.body;
    console.log(req.body)
    validateMongoDbId(blogId)
    const blog = await Blog.findById(blogId)
    const loginUserId = req?.user?._id
    const isLiked = blog?.isLiked
    //find if the user has already disliked the blog
    const alreadyDislike = blog?.dislikes?.find(
        (userId => userId.toString() === loginUserId?.toString())
    )
    if(alreadyDislike){
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { dislikes: loginUserId},
                isDisliked: false
            },
            {
                new: true
            }
        )
        res.json(blog)
    }
    if(isLiked){
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: {likes: loginUserId},
                isLiked: false
            },
            {
                new: true
            }
        )
        res.json(blog)
    } else {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push: {likes: loginUserId},
                isLiked: true
            },
            {
                new: true
            }
        )
        res.json(blog)
    }
})

const dislikeBlog = asyncHandler(async(req, res) => {
    const {blogId} = req.body;
    console.log(req.body)
    validateMongoDbId(blogId)
    const blog = await Blog.findById(blogId)
    const loginUserId = req?.user?._id
    const isDisLiked = blog?.isDisliked
    //find if the user has already disliked the blog
    const alreadyLiked = blog?.likes?.find(
        (userId => userId?.toString() === loginUserId?.toString())
    )
    if(alreadyLiked){
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { likes: loginUserId},
                isLiked: false
            },
            {
                new: true
            }
        )
        res.json(blog)
    }
    if(isDisLiked){
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: {dislikes: loginUserId},
                isDisliked: false
            },
            {
                new: true
            }
        )
        res.json(blog)
    } else {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push: {dislikes: loginUserId},
                isDisliked: true
            },
            {
                new: true
            }
        )
        res.json(blog)
    }
})

const uploadImages = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateMongoDbId(id)
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
        const findBlog = await Blog.findByIdAndUpdate(id,  {
            images: urls.map((file) => {
                return file;
            })
        }, {
            new: true
        })
        if(findBlog){
            res.json(findBlog);
        } else {
            res.json({
                message: "No blog found with the id"
            })
        }

        
    } catch(error){
        throw new Error(error);
    }
})

module.exports = {createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog, likeBlog, dislikeBlog, uploadImages};