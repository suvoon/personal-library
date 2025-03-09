const express = require('express');
const router = express.Router();
const Borrower = require('../models/Borrower');
const auth = require('../middleware/auth');

router.get('/book/:bookId', auth, async (req, res) => {
    try {
        const borrowers = await Borrower.find({
            bookId: req.params.bookId,
            userId: req.user._id
        }).sort({ createdAt: -1 });
        res.json(borrowers);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching borrowers', error: err.message });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const borrower = new Borrower({
            ...req.body,
            userId: req.user._id,
            status: 'active'
        });
        const savedBorrower = await borrower.save();
        res.status(201).json(savedBorrower);
    } catch (err) {
        res.status(400).json({ message: 'Error creating borrower record', error: err.message });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const borrower = await Borrower.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!borrower) {
            return res.status(404).json({ message: 'Borrower record not found' });
        }

        Object.assign(borrower, req.body);
        const updatedBorrower = await borrower.save();
        res.json(updatedBorrower);
    } catch (err) {
        res.status(400).json({ message: 'Error updating borrower record', error: err.message });
    }
});

router.put('/:id/return', auth, async (req, res) => {
    try {
        const borrower = await Borrower.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!borrower) {
            return res.status(404).json({ message: 'Borrower record not found' });
        }

        borrower.returnDate = new Date();
        borrower.status = 'returned';
        const updatedBorrower = await borrower.save();
        res.json(updatedBorrower);
    } catch (err) {
        res.status(400).json({ message: 'Error marking book as returned', error: err.message });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const borrower = await Borrower.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!borrower) {
            return res.status(404).json({ message: 'Borrower record not found' });
        }

        res.json({ message: 'Borrower record deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting borrower record', error: err.message });
    }
});

module.exports = router; 