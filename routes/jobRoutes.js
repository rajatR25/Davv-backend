const express = require("express");
const router = express.Router();
const {
  postJob,
  getJobs,
  applyToJob,
  getApplications,
  updateApplicationStatus,
} = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");

// @route   GET /api/jobs
// @desc    Retrieve all available job vacancies
router.get("/", getJobs);
// @route   POST /api/jobs/:id/apply
// @desc    Submit a job application (With eligibility checks)
router.post("/:id/apply", protect, applyToJob);

/**
 * @desc    TPO Admin & HR Shared Routes
 */

// @route   POST /api/jobs/post
// @desc    Create a new job vacancy (Accessible by Admin and HR)
// 'admin' middleware hata diya hai taaki dono role access kar sakein
router.post("/post", protect, postJob);

/**
 * @desc    Management Routes (TPO Admin / HR Decision Making)
 */

// @route   GET /api/jobs/applications
// @desc    Fetch list of applications (Filtered by HR company in controller)
router.get("/applications", protect, getApplications);

// @route   PUT /api/jobs/status/:id
// @desc    Update application status (Selected/Rejected)
router.put("/status/:id", protect, updateApplicationStatus);
module.exports = router;