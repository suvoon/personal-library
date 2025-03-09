const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const books = await Book.find({ owner: req.user.id }).sort({ addedAt: -1 });
        res.json(books);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/:id', auth, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(book);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(500).send('Server error');
    }
});


router.post('/', auth, async (req, res) => {
    const {
        title,
        author,
        isbn,
        publishedYear,
        publisher,
        genre,
        description,
        pageCount,
        coverImage
    } = req.body;

    try {
        const newBook = new Book({
            title,
            author,
            isbn,
            publishedYear,
            publisher,
            genre,
            description,
            pageCount,
            coverImage,
            owner: req.user.id
        });

        const book = await newBook.save();
        res.json(book);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.put('/:id', auth, async (req, res) => {
    const {
        title,
        author,
        isbn,
        publishedYear,
        publisher,
        genre,
        description,
        pageCount,
        coverImage
    } = req.body;

    const bookFields = {};
    if (title) bookFields.title = title;
    if (author) bookFields.author = author;
    if (isbn) bookFields.isbn = isbn;
    if (publishedYear) bookFields.publishedYear = publishedYear;
    if (publisher) bookFields.publisher = publisher;
    if (genre) bookFields.genre = genre;
    if (description) bookFields.description = description;
    if (pageCount) bookFields.pageCount = pageCount;
    if (coverImage) bookFields.coverImage = coverImage;

    try {
        let book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        book = await Book.findByIdAndUpdate(
            req.params.id,
            { $set: bookFields },
            { new: true }
        );

        res.json(book);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(500).send('Server error');
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await book.deleteOne();

        res.json({ message: 'Book removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(500).send('Server error');
    }
});

router.get('/search/:query', auth, async (req, res) => {
    try {
        const books = await Book.find({
            $and: [
                { owner: req.user.id },
                { $text: { $search: req.params.query } }
            ]
        }).sort({ score: { $meta: 'textScore' } });

        res.json(books);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router; 