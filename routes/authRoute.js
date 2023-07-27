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
    logout
} = require('../controller/userController');
const router = express.Router();
const {
    authMiddleware, 
    isAdmin
 } = require('../middlewares/authMiddleware');


router.post("/register", createUser);
router.post("/login", loginUserController);
router.get("/all-users", getAllUser);
router.get("/refresh", handleRefreshToken)
router.get("/logout", logout)
router.get("/:id", authMiddleware, isAdmin, getaUser)
router.delete("/:id", deleteaUser)
router.put("/edit-user", authMiddleware, updateaUser) 
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser)
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser) 
 

module.exports = router