const Job = require('../models/jobModel');
const Application = require('../models/applicationModel'); 
const User = require('../models/userModel'); 

/**
 * @desc    Post a new job vacancy (Admin & HR Shared)
 * @route   POST /api/jobs/post
 * @access  Private (Admin & HR)
 */
const postJob = async (req, res) => {
  const { role, description, minCGPA, skillsRequired, salary, location, deadline } = req.body;
  
  try {
    let finalCompanyName;
    if (req.user.role === 'admin') {
      finalCompanyName = req.body.companyName; 
    } else {
      finalCompanyName = req.user.companyName; 
    }

    if (!finalCompanyName) {
      return res.status(400).json({ 
        message: "Validation Error: Please provide a company name." 
      });
    }

    const job = await Job.create({ 
      companyName: finalCompanyName, 
      role, 
      description,
      minCGPA, 
      skillsRequired: skillsRequired || [],
      salary, 
      location,
      // Deadline Fix:
      deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      postedBy: req.user._id 
    });

    res.status(201).json({ message: "Job Posted Successfully!", job });
  } catch (error) {
    // Detailed error logging for debugging
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Fetch all available jobs
 * @route   GET /api/jobs
 * @access  Private
 */
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Submit job application with eligibility validation
 * @route   POST /api/jobs/:id/apply
 */
const applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Eligibility 1: Verification Check
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Profile not verified. Please wait for TPO approval.' });
    }

    // Eligibility 2: CGPA Check
    if (user.cgpa < job.minCGPA) {
      return res.status(403).json({ message: `Eligibility Failed: Min ${job.minCGPA} CGPA required.` });
    }

    // Duplicate Check
    const alreadyApplied = await Application.findOne({ job: job._id, student: user._id });
    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied for this role.' });
    }

    const application = await Application.create({
      job: job._id,
      student: user._id,
      status: 'Pending'
    });

    res.status(201).json({ message: 'Application Submitted Successfully! 🎓', application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Fetch all applications (Filtered properly for Admin, HR, and Student)
 * @route   GET /api/jobs/applications
 */
const getApplications = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'hr') {
      const myJobs = await Job.find({ companyName: req.user.companyName }).select('_id');
      const jobIds = myJobs.map(j => j._id);
      query = { job: { $in: jobIds } };
    } else if (req.user.role === 'admin') {
      query = {};
    } else {
      query = { student: req.user._id };
    }

    const applications = await Application.find(query)
      .populate('student', 'fullName email cgpa enrollmentNo resume') 
      .populate('job', 'companyName role salary')
      .sort({ createdAt: -1 });
      
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/**
 * @desc    Update student application status
 * @route   PUT /api/jobs/status/:id
 */
const updateApplicationStatus = async (req, res) => {
  const { status } = req.body; 
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    application.status = status;
    await application.save();
    res.json({ message: `Status updated to: ${status}`, application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { postJob, getJobs, applyToJob, getApplications, updateApplicationStatus };