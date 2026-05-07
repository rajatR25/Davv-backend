// File: backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { loginUser } = require("../controllers/userController");

// Ye route Admin login handle karega
router.post("/login", loginUser);

module.exports = router;