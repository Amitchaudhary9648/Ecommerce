const express = require('express');
const { createColor, updateColor, getColor, getAllColor, deleteColor } = require('../controller/colorController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, isAdmin, createColor)

router.put('/:id', authMiddleware, isAdmin, updateColor)
router.get("/:id", authMiddleware, getColor)
router.get("/", authMiddleware, getAllColor);
router.delete("/:id", authMiddleware, deleteColor);

module.exports = router;