const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler")

// Register a user
const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email
    const findUser = await User.findOne({email})
    if(!findUser){
        //Create a new user
        const newUser = await User.create(req.body)
        res.json(newUser)
    } else {
        throw new Error("User Already Exists");
    }
})

// Login a User
const loginUserController = asyncHandler( async(req, res) => {
    const {email, password} = req.body;
    // Check if user exists or not
    const findUser = await User.findOne({email})
    if(findUser && await findUser.isPasswordMatched(password)){
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id)
        })
    } else {
        throw new Error("Invalid Credentials")
    }
})

// Get all users
const getAllUser = asyncHandler(async(req, res) => {
    try{
        const getUsers = await User.find()
        res.json(getUsers)
    } catch(error){
        throw new Error(error)
    }
})

// Get a single user
const getaUser = asyncHandler(async (req, res) => {
    const {id} = req.params;
    try{
        const getaUser = await User.findById(id)
        res.json({
            getaUser
        })
    } catch(error){
        throw new Error(error)
    }
})

// delete a user
const deleteaUser = asyncHandler(async (req, res) => {
    const {id} = req.params;
    try{
        const deletedUser = await User.findByIdAndDelete(id)
        res.json({
            deletedUser
        })
    } catch(error){
        throw new Error(error)
    }
})

// Update a user
const updateaUser = asyncHandler(async (req, res) => {
    const {id} = req.params;
    try{
        const updateUser = await User.findByIdAndUpdate(id, {
            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname,
            email: req?.body?.email,
            mobile: req?.body?.mobile
        },
        {
            new : true
        }
        )
        res.json(updateUser)
    } catch(error){
        throw new Error(error)
    }
})

module.exports = { createUser, loginUserController, getAllUser, getaUser, deleteaUser, updateaUser }