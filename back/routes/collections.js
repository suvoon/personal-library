const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const collections = await Collection.find({ owner: req.user.id }).sort({ createdAt: -1 });
        res.json(collections);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/:id', auth, async (req, res) => {
    try {
        const collection = await Collection.findById(req.params.id).populate('books');

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        if (collection.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(collection);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Collection not found' });
        }
        res.status(500).send('Server error');
    }
});

router.post('/', auth, async (req, res) => {
    const { name, description } = req.body;

    try {
        const newCollection = new Collection({
            name,
            description,
            owner: req.user.id,
            books: []
        });

        const collection = await newCollection.save();
        res.json(collection);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.put('/:id', auth, async (req, res) => {
    const { name, description } = req.body;

    const collectionFields = {};
    if (name) collectionFields.name = name;
    if (description !== undefined) collectionFields.description = description;

    try {
        let collection = await Collection.findById(req.params.id);

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        if (collection.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        collection = await Collection.findByIdAndUpdate(
            req.params.id,
            { $set: collectionFields },
            { new: true }
        );

        res.json(collection);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Collection not found' });
        }
        res.status(500).send('Server error');
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const collection = await Collection.findById(req.params.id);

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        if (collection.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await collection.deleteOne();

        res.json({ message: 'Collection removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Collection not found' });
        }
        res.status(500).send('Server error');
    }
});

router.post('/:id/books/:bookId', auth, async (req, res) => {
    try {
        const collection = await Collection.findById(req.params.id);
        const book = await Book.findById(req.params.bookId);

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (collection.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to modify this collection' });
        }

        if (book.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to add this book' });
        }

        if (collection.books.includes(req.params.bookId)) {
            return res.status(400).json({ message: 'Book already in collection' });
        }

        collection.books.push(req.params.bookId);
        await collection.save();

        res.json(collection);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Invalid ID' });
        }
        res.status(500).send('Server error');
    }
});

router.delete('/:id/books/:bookId', auth, async (req, res) => {
    try {
        const collection = await Collection.findById(req.params.id);

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        if (collection.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (!collection.books.includes(req.params.bookId)) {
            return res.status(400).json({ message: 'Book not in collection' });
        }

        collection.books = collection.books.filter(
            book => book.toString() !== req.params.bookId
        );

        await collection.save();

        res.json(collection);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Invalid ID' });
        }
        res.status(500).send('Server error');
    }
});

module.exports = router; 