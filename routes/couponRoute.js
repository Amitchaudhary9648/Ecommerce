const express = require('express');
const { createCoupon, updateCoupon, getAllCoupon, deleteCoupon } = require('../controller/couponController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, isAdmin, createCoupon);
router.put('/:id', authMiddleware, isAdmin, updateCoupon);
router.get('/', authMiddleware, getAllCoupon);
router.delete('/:id', authMiddleware, isAdmin, deleteCoupon);

module.exports = router; 