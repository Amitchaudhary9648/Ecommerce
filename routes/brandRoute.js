const express = require('express');
const { createBrand, updateBrand, getBrand, getAllBrand, deleteBrand } = require('../controller/brandController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, isAdmin, createBrand)

router.put('/:id', authMiddleware, isAdmin, updateBrand)
router.get("/:id", authMiddleware, getBrand)
router.get("/", authMiddleware, getAllBrand);
router.delete("/:id", authMiddleware, deleteBrand);

module.exports = router;