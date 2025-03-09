const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    isbn: {
        type: String,
        trim: true,
        unique: true,
        sparse: true
    },
    publishedYear: {
        type: Number
    },
    publisher: {
        type: String,
        trim: true
    },
    genre: {
        type: String,
        trim: true
    },
    description: {
        type: String
    },
    pageCount: {
        type: Number
    },
    coverImage: {
        type: String
    },
    addedAt: {
        type: Date,
        default: Date.now
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

BookSchema.index({
    title: 'text',
    author: 'text',
    description: 'text',
    genre: 'text'
});

module.exports = mongoose.model('Book', BookSchema); 