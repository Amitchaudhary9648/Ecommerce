const express = require('express');
const { createProduct, getaProduct, getallProduct, updateProduct, deleteProduct, addToWishList, rating, uploadImages, deleteImages } = require('../controller/productController');
const router = express.Router();
const {isAdmin, authMiddleware} = require('../middlewares/authMiddleware');
const { uploadPhoto, productImgResize } = require('../controller/uploadImages');

router.post('/create', authMiddleware, isAdmin, createProduct);
router.put('/upload', authMiddleware, isAdmin, uploadPhoto.array("images", 10), productImgResize, uploadImages)
router.put('/wishlist', authMiddleware, addToWishList)
router.put('/rating', authMiddleware, rating);
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.get('/:id', getaProduct);
router.get('/', getallProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);
router.delete('/delete-img/:id', authMiddleware, isAdmin, deleteImages);


module.exports = router;