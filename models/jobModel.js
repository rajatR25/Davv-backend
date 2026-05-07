const mongoose = require('mongoose');

const jobSchema = mongoose.Schema({
    companyName: {
        type: String,
        required: [true, 'Please add a company name']
    },
    role: { // This is your jobTitle
        type: String,
        required: [true, 'Please add a job role']
    },
    description: { // Added: Important so students know what the job is about
        type: String,
        required: [true, 'Please add a job description']
    },
    minCGPA: {
        type: Number,
        required: [true, 'Please add minimum CGPA requirement']
    },
    skillsRequired: {
        type: [String],
        default: []
    },
    salary: { // Your package field
        type: String,
        required: [true, 'Please add salary package']
    },
    location: {
        type: String,
        default: "Remote / On-site"
    },
    deadline: { // Added: So jobs automatically expire or show urgency
        type: Date,
        required: [true, 'Please add an application deadline']
    },
    postedBy: { // Added: To track which Admin/TPO posted this job
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);