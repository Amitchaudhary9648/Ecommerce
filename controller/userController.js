const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require('jsonwebtoken')

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
        const refreshToken = generateRefreshToken(findUser?._id);
        const updateUser = await User.findByIdAndUpdate(
            findUser.id,
            {
                refreshToken: refreshToken,
            },
            { new: true},
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        })
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
    validateMongoDbId(id);
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
    validateMongoDbId(id);
    try{
        const deletedUser = await User.findByIdAndDelete(id)
        res.json({
            deletedUser
        })
    } catch(error){
        throw new Error(error)
    }
})

// handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if(!cookie?.refreshToken) throw new Error('No Refresh token in cookies');
    const refreshToken = cookie.refreshToken
    console.log(refreshToken);
    const user = await User.findOne({refreshToken})
    if(!user) throw new Error('No refresh token matched');
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if(err || user?.id != decoded.id){
            throw new Error("There is something wrong with this token")
        } 
        const accessToken = generateRefreshToken(user?._id);
        res.json({
            accessToken
        })
    })
})

// logout functionality
const logout = asyncHandler(async(req, res) => {
    const cookie = req.cookies;
    if(!cookie?.refreshToken) throw new Error('No Refresh token in cookies');
    const refreshToken = cookie.refreshToken
    console.log(refreshToken);
    const user = await User.findOne({refreshToken})
    if(!user){
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true
        })
        return res.status(204).json({success: false, message: "User Logged out"}); // forbidden
    }
    await User.findOneAndUpdate({refreshToken}, {
        refreshToken: ''
    })
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true
    })
    return res.status(204).json({success: false, message: "User Logged out"});
})

// Update a user
const updateaUser = asyncHandler(async (req, res) => {
    const {_id} = req.user;
    validateMongoDbId(_id);
    try{
        const updateUser = await User.findByIdAndUpdate(_id, {
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

const blockUser = asyncHandler( async (req, res) => {
    const {id} = req.params
    try{
        const blockedUser = await User.findByIdAndUpdate(id,
            {
                isBlocked: true
            },
            {
                new: true
        })
        res.json({
            message: "User Blocked"
        })
    } catch(error){
        throw new Error(error)
    }
})

const unblockUser = asyncHandler( async(req, res) => {
    const {id} = req.params
    try{
        const unblockedUser = await User.findByIdAndUpdate(id,
            {
                isBlocked: false
            },
            {
                new: true
        })
        res.json({
            message: "User UnBlocked"
        })
    } catch(error){
        throw new Error(error)
    }
})

const updatePassword = asyncHandler(async(req, res) => {
    const {_id} = req.user;
    console.log(_id)
    const data = req.body;
    const password = data.password
    validateMongoDbId(_id);
    const user = await User.findById(_id);
    if(password){
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword)
    } else {
        res.json(user)
    }
})

module.exports = { 
    createUser, 
    loginUserController, 
    getAllUser, 
    getaUser, 
    deleteaUser, 
    updateaUser, 
    blockUser, 
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword 
}