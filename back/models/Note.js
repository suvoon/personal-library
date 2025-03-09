const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    page: {
        type: Number
    },
    highlight: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

noteSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

noteSchema.index({ bookId: 1, userId: 1 });
noteSchema.index({ bookId: 1, page: 1 });

module.exports = mongoose.model('Note', noteSchema); 