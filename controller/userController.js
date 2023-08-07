const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Coupon = require("../models/couponModel");
const Order = require('../models/orderModel');
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require('jsonwebtoken');
const sendMail = require("./emailController");
const crypto = require('crypto');
const uniqid = require('uniqid'); 

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

// Login Admin
const loginAdmin = asyncHandler( async(req, res) => {
    const {email, password} = req.body;
    // Check if user exists or not
    const findAdmin = await User.findOne({email})
    if(findAdmin.role !== 'admin') throw new Error("Not Authorized");
    if(findAdmin && await findAdmin.isPasswordMatched(password)){
        const refreshToken = generateRefreshToken(findAdmin?._id);
        const updateUser = await User.findByIdAndUpdate(
            findAdmin.id,
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
            _id: findAdmin?._id,
            firstname: findAdmin?.firstname,
            lastname: findAdmin?.lastname,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?._id)
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

const forgotPassword = asyncHandler(async(req, res) => {
    const {email} = req.body
    const user = await User.findOne({email})
    if(!user) throw new Error("User not found with this email")
    try{
        const token = await user.createPasswordResetToken()
        await user.save();
        const resetURL = `Hi, Please follow this link to reset your password. This link is valid till 10 minutes from now. <a href="http://localhost:3000/api/user/reset-password/${token}">Click here </a>`
        const data = {
            to: email,
            text: "Hey User",
            subject: "Forgot Password Link",
            html: resetURL
        }
        sendMail(data)
        res.json(token)
    } catch(error){
        throw new Error(error);
    }
})

const resetPassword = asyncHandler(async(req, res) => {
    const {password} = req.body;
    const {token} = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now()}
    })
    if(!user) throw new Error("Token Expired, Please try again later")
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save()
    res.json(user)
})

const getWishlist = asyncHandler(async(req, res) => {
    const {_id} = req.user;
    console.log(_id);
    try{
        const findUser = await User.findById(_id).populate("wishlist")
        res.json(findUser);
    } catch(error){
        throw new Error(error);
    }
})

const saveAddress = asyncHandler(async(req, res, next) => {
    const {_id} = req.user;
    validateMongoDbId(_id);
    try{
        const updateUser = await User.findByIdAndUpdate(_id, {
            address: req?.body?.address
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

const userCart = asyncHandler(async(req, res) => {
    const {cart} = req.body;
    const {_id} = req.user;
    validateMongoDbId(_id);
    try{
        let products = [];
        const user = await User.findById(_id)
        // Check if user already have product in cart
        const alreadyExistCart = await Cart.findOne({ orderby: user._id})
        if(alreadyExistCart){
            alreadyExistCart.remove();
        }
        for(let i = 0; i < cart.length; i++){
            let object = {}
            object.product = cart[i]._id;
            object.count = cart[i].count;
            object.color = cart[i].color;
            let getPrice = await Product.findById(cart[i]._id).select("price").exec();
            object.price = getPrice.price;
            products.push(object);
        }
        let cartTotal = 0;
        for(let i = 0; i < products.length; i++){
            cartTotal += products[i].price * products[i].count;
        }
        let newCart = await new Cart({
            products,
            cartTotal,
            orderby: user?._id
        }).save();
        res.json(newCart);
    } catch(error) {
        throw new Error(error)
    }
})

const getUserCart = asyncHandler(async(req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try{
        const cart = await Cart.findOne({orderby: _id}).populate(
            "products.product"
        )
        res.json(cart);
    } catch(error){
        throw new Error(error);
    }
})

const emptyCart = asyncHandler(async(req, res) => {
    const {_id} = req.user;
    validateMongoDbId(_id);
    try{
        const user = await User.findOne({_id});
        const cart = await Cart.findOneAndRemove({orderby: user._id})
        res.json(cart);
    } catch(error){
        throw new Error(error);
    }
})

const applyCoupon = asyncHandler(async(req, res) => {
    const { coupon } = req.body;
    const {_id} = req.user;
    validateMongoDbId(_id);
    try{
        const validCoupon = await Coupon.findOne({name: coupon})
        if(validCoupon === null){
            throw new Error("Invalid Coupon");
        }
        const user = await User.findOne({_id});
        const {products, cartTotal} = await Cart.findOne({
            orderby: user._id
        }).populate("products.product");
        let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount)/100).toFixed(2);
        await Cart.findOneAndUpdate(
            {orderby: user._id},
            { totalAfterDiscount},
            { new: true}
        )
        res.json(totalAfterDiscount);
    } catch(error){
        throw new Error(error)
    }
})

const createOrder = asyncHandler(async(req, res) => {
    const {COD, couponApplied} = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    try{
        if(!COD) throw new Error("Create cash order failed");
        const user = await User.findById(_id);
        let userCart = await Cart.findOne({orderby: user._id})
        let finalAmount = 0;
        if(couponApplied && userCart.totalAfterDiscount){
            finalAmount = userCart.totalAfterDiscount; 
        } else {
            finalAmount = userCart.cartTotal;
        }
        let newOrder = await new Order({
            products: userCart.products,
            paymentIntent: {
                id:  uniqid(),
                method: "COD",
                amount: finalAmount,
                status: "Cash on Delivery",
                created: Date.now(),
                currency: "usd",
            },
            orderby: user._id,
            orderStatus: "Cash on Delivery"
        }).save();
        let update = userCart.products.map((item) => {
            return {
                updateOne: {
                    filter: { _id: item.product._id},
                    update: { $inc: { quantity: -item.count, sold: +item.count}}
                } 
            }
        })
        const updated = await Product.bulkWrite(update, {})
        res.json({ message: "success"})
    } catch(error){
        throw new Error(error);
    }
})

const getOrders = asyncHandler(async(req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try{
        const order = await Order.findOne({orderby: _id})
            .populate("products.product")
            .exec();
        res.json(order);
    } catch(error){
        throw new Error(error);
    }
})

const updateOrderStatus = asyncHandler(async(req, res) => {
    const {status} = req.body;
    const { id } = req.params;
    validateMongoDbId(id);
    try{
        const updateOrderStatus = await Order.findByIdAndUpdate(
            id, 
            {
                orderStatus: status,
                paymentIntent: {
                    status: status
                }
            }, {new: true}
        );
        res.json(updateOrderStatus);
    } catch(error){
        throw new Error(error);
    }

})

module.exports = { 
    createUser, 
    loginUserController, 
    loginAdmin,
    getAllUser, 
    getaUser, 
    deleteaUser, 
    updateaUser, 
    saveAddress,
    blockUser, 
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPassword,
    resetPassword,
    getWishlist,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getOrders,
    updateOrderStatus
}