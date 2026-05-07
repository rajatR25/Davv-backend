const mongoose = require('mongoose');

const applicationSchema = mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Job'
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Selected', 'Rejected']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);