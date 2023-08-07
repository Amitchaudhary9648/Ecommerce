const express = require('express');
const { createEnquiry, updateEnquiry, getEnquiry, getAllEnquiry, deleteEnquiry } = require('../controller/enqController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, isAdmin, createEnquiry)

router.put('/:id', authMiddleware, isAdmin, updateEnquiry)
router.get("/:id", authMiddleware, getEnquiry)
router.get("/", authMiddleware, getAllEnquiry);
router.delete("/:id", authMiddleware, deleteEnquiry);

module.exports = router;