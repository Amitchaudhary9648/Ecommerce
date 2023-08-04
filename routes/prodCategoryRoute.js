const express = require('express');
const { createCategory, updateCategory, getCategory, getAllCategory, deleteCategory } = require('../controller/prodCategoryController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, isAdmin, createCategory)
router.put('/:id', authMiddleware, isAdmin, updateCategory)
router.get("/:id", authMiddleware, getCategory)
router.get("/", authMiddleware, getAllCategory);
router.delete("/:id", authMiddleware, deleteCategory);

module.exports = router;