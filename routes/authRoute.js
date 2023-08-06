const express = require('express');
const { 
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
    updatePassword,
    forgotPassword,
    resetPassword,
    loginAdmin,
    getWishlist,
    saveAddress
} = require('../controller/userController');
const router = express.Router();
const {
    authMiddleware, 
    isAdmin
 } = require('../middlewares/authMiddleware');


router.post("/register", createUser);
router.post("/login", loginUserController);
router.post("/admin-login", loginAdmin);
router.put('/password', authMiddleware, updatePassword)
router.post("/forgot-password-token", forgotPassword)
router.put('/reset-password/:token', resetPassword)
router.get("/all-users", getAllUser);
router.get("/wishlist", authMiddleware, getWishlist);
router.get("/refresh", handleRefreshToken)
router.get("/logout", logout)
router.get("/:id", authMiddleware, isAdmin, getaUser)
router.delete("/:id", deleteaUser)
router.put("/edit-user", authMiddleware, updateaUser) 
router.put('/save-address', authMiddleware, saveAddress);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser)
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser) 
 

module.exports = router