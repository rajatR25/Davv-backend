// File: backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();

const { loginUser, inviteHR } = require("../controllers/userController");

router.post("/login", loginUser);

router.post("/invite-hr", inviteHR);

module.exports = router;