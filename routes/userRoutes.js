const express = require("express");
const router = express.Router();

const { 
  registerUser, 
  loginUser, 
  getUserProfile,
  getAllStudents,
  verifyStudent,
  updateCgpa,
  updateAdvancedProfile,
  extractOcr,
  inviteHR 
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

/**
 * --- PUBLIC ROUTES ---
 */
router.post("/register", registerUser);
router.post("/login", loginUser);

/**
 * --- PROTECTED STUDENT ROUTES ---
 */

// Dashboard aur Profile setup ke liye data fetch
router.get("/profile", protect, getUserProfile);

// Marksheet OCR Scan
router.post("/ocr-extract", protect, upload.single("marksheet"), extractOcr);

// Dashboard se CGPA Sync karna
router.put("/update-cgpa", protect, updateCgpa);

// Master Placement Form & Complete Profile Logic
router.put(
  "/advanced-profile-update",
  protect,
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  updateAdvancedProfile
);

router.post("/invite-hr", inviteHR);

router.put(
  "/profile",
  protect,
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "resume", maxCount: 1 },
    { name: "marksheet10th", maxCount: 1 },
    { name: "marksheet12th", maxCount: 1 },
    // { name: "marksheetGrad", maxCount: 1 },
    { name: "marksheetPG", maxCount: 1 },
    // { name: "otherCert", maxCount: 1 },
  ]),
  updateAdvancedProfile 
);

/**
 * --- PROTECTED ADMIN ROUTES ---
 */
router.get("/all-students", protect, getAllStudents);
router.put("/verify/:id", protect, verifyStudent);

module.exports = router;