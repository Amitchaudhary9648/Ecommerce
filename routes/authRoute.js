const express = require('express');
const { createUser, loginUserController, getAllUser, getaUser, deleteaUser, updateaUser } = require('../controller/userController');
const router = express.Router();


router.post("/register", createUser);
router.post("/login", loginUserController);
router.get("/all-users", getAllUser);
router.get("/:id",getaUser)
router.delete("/:id", deleteaUser)
router.put("/:id", updateaUser) 

module.exports = router