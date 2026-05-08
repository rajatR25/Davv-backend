const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createWorker } = require("tesseract.js");
const fs = require("fs");
const nodemailer = require("nodemailer");

// --- 1. AUTHENTICATION & ACCESS CONTROL ---

const registerUser = async (req, res) => {
  const { name, email, password, role, companyName } = req.body;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character." });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    if (role === "admin") {
      return res.status(403).json({ message: "Admin accounts must be created manually in the database." });
    }

    if (role === "hr" && !companyName) {
      return res.status(403).json({ message: "HR registration requires a valid invitation from TPO." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName: name, 
      email,
      password: hashedPassword,
      role: role || "student",
      companyName: role === "hr" ? companyName : null,
      isVerified: role === "hr" ? true : false 
    });

    if (user) {
      res.status(201).json({ 
        message: `${role.toUpperCase()} Registered Successfully`,
        success: true 
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );
      res.json({
        _id: user._id,
        name: user.fullName || user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        token,
        message: "Login Successful!",
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 2. PROFILE MANAGEMENT ---

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) res.json(user);
    else res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAdvancedProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let updateFields = {
      fullName: req.body.fullName || user.fullName,
      fatherName: req.body.fatherName || user.fatherName,
      motherName: req.body.motherName || user.motherName,
      dob: req.body.dob || user.dob,
      gender: req.body.gender || user.gender,
      phone: req.body.mobile || user.phone, 
      address: req.body.address || user.address,
      enrollmentNo: req.body.enrollmentNo || user.enrollmentNo,
      college: req.body.college || user.college,
      university: req.body.university || user.university,
      course: req.body.course || user.course,
      branch: req.body.branch || user.branch,
      semester: req.body.semester || user.semester,
      cgpa: req.body.cgpa || user.cgpa,
      tenthPercent: req.body.tenth || user.tenthPercent,
      twelfthPercent: req.body.twelfth || user.twelfthPercent,
      gradPercent: req.body.graduation || user.gradPercent,
      languages: req.body.languages || user.languages,
      project: req.body.project || user.project,
      internship: req.body.internship || user.internship,
      linkedin: req.body.linkedin || user.linkedin,
      github: req.body.github || user.github,
      isProfileComplete: true,
      isVerified: true
    };

    if (req.body.skills) {
      try {
        updateFields.skills = JSON.parse(req.body.skills);
      } catch (e) {
        updateFields.skills = req.body.skills.split(',').map(s => s.trim());
      }
    }

    if (req.files) {
      if (req.files.profilePic) updateFields.profilePic = `/uploads/${req.files.profilePic[0].filename}`;
      if (req.files.resume) updateFields.resume = `/uploads/${req.files.resume[0].filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true }
    );

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCgpa = async (req, res) => {
  try {
    const { cgpa, isProfileComplete } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
     { $set: { cgpa: Number(cgpa), isProfileComplete, isVerified: true } },
      { new: true }
    );
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 3. ADMIN & OCR TOOLS ---

const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyStudent = async (req, res) => {
  try {
    const { cgpa } = req.body;
    
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    
    student.isVerified = true;
    if (cgpa) {
      student.cgpa = Number(cgpa);
    }
    
    await student.save();
    res.json({ message: "Student Profile Verified & CGPA Updated Successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const extractOcr = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Marksheet image is missing" });
  const worker = await createWorker("eng");

  try {
    const { data: { text } } = await worker.recognize(req.file.path);
    const lines = text.split("\n");
    let credits = 0;
    let sgpa = 0;

    lines.forEach((line) => {
      const cleanLine = line.replace(/[|I]/g, " ").trim();
      if (/TOTAL/i.test(cleanLine)) {
        const nums = cleanLine.match(/\d+/g);
        if (nums && nums.length > 0) credits = parseInt(nums[0]);
      }
      const sgpaMatch = cleanLine.match(/(\d+\.\d+)/);
      if (sgpaMatch && parseFloat(sgpaMatch[1]) < 10.0) {
        sgpa = parseFloat(sgpaMatch[1]);
      }
    });

    res.status(200).json({ success: true, data: { sgpa, credits } });
  } catch (error) {
    res.status(500).json({ success: false, message: "OCR failed to read marksheet" });
  } finally {
    await worker.terminate();
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
  }
};

// --- 4. HR INVITATION SYSTEM ---

const inviteHR = async (req, res) => {
  const { email, companyName } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', 
      port: 587,
      secure: false,
      family: 4,              
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const safeCompanyName = encodeURIComponent(companyName);
    const inviteLink = `https://davv-portal.vercel.app/?role=hr&company=${safeCompanyName}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Invitation to Join DAVV-APExP Placement Portal",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
            <h2>Hello ${companyName} HR Team,</h2>
            <p>You have been officially invited to join the <strong>DAVV-APExP Placement Portal</strong>.</p>
            <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Register Here</a>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Invite sent successfully!" });
  } catch (error) {
    console.error("Email Error: ", error);
    res.status(500).json({ message: "Failed to send email." });
  }
};
module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getAllStudents,
  verifyStudent,
  updateCgpa,
  updateAdvancedProfile,
  extractOcr,
  inviteHR
};