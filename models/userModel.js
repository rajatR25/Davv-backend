const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["student", "hr", "admin"],
      default: "student",
    },

    enrollmentNo: {
      type: String,
      unique: true,
      sparse: true,
    },

    // [SECTION: HR SPECIFIC]
    companyName: {
      type: String,
      default: null,
    },

    // [SECTION: PERSONAL DETAILS]
    fatherName: { type: String, default: "" },
    motherName: { type: String, default: "" },
    dob: { type: String, default: "" },
    gender: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    aadharNumber: { type: String, default: "" },

    // [SECTION: ACADEMIC DETAILS]
    college: { type: String, default: "" },
    university: { type: String, default: "" },
    course: { type: String, default: "" },
    branch: { type: String, default: "" },
    semester: { type: String, default: "" },

    cgpa: { type: Number, default: 0 },
    tenthPercent: { type: String, default: "" },
    twelfthPercent: { type: String, default: "" },
    gradDegree: { type: String, default: "" },
    gradPercent: { type: String, default: "" },

    // [SECTION: SKILLS & SOCIAL]
    skills: { type: [String], default: [] },
    languages: { type: String, default: "" },
    project: { type: String, default: "" },
    internship: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },

    // [SECTION: DOCUMENTS]
    profilePic: { type: String, default: "" },
    resume: { type: String, default: "" },
    marksheetPG: { type: String, default: "" },

    // [SECTION: SEMESTER SYSTEM]
    semesters: [
      {
        semester: { type: Number, required: true },
        credits: { type: Number, required: true },
        sgpa: { type: Number, required: true },
        marksheetPath: { type: String },
        verified: { type: Boolean, default: false },
      },
    ],

    isProfileComplete: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
