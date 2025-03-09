const mongoose = require('mongoose');

const borrowerSchema = new mongoose.Schema({
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
    borrowerName: {
        type: String,
        required: true
    },
    contactInfo: {
        type: String,
        required: true
    },
    borrowDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'overdue', 'returned'],
        default: 'active'
    },
    notes: {
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

borrowerSchema.pre('save', function (next) {
    this.updatedAt = Date.now();

    if (this.returnDate) {
        this.status = 'returned';
    } else if (this.dueDate < new Date()) {
        this.status = 'overdue';
    } else {
        this.status = 'active';
    }

    next();
});

borrowerSchema.index({ bookId: 1, status: 1 });
borrowerSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Borrower', borrowerSchema); 