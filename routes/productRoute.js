const express = require('express');
const { createProduct, getaProduct, getallProduct, updateProduct, deleteProduct } = require('../controller/productController');
const router = express.Router();
const {isAdmin, authMiddleware} = require('../middlewares/authMiddleware')

router.post('/create', authMiddleware, isAdmin, createProduct);
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.get('/:id', getaProduct);
router.get('/', getallProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);


module.exports = router;