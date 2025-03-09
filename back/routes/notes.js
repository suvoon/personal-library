const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const auth = require('../middleware/auth');

router.get('/book/:bookId', auth, async (req, res) => {
    try {
        const notes = await Note.find({
            bookId: req.params.bookId,
            userId: req.user._id
        }).sort({ createdAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching notes', error: err.message });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const note = new Note({
            ...req.body,
            userId: req.user._id
        });
        const savedNote = await note.save();
        res.status(201).json(savedNote);
    } catch (err) {
        res.status(400).json({ message: 'Error creating note', error: err.message });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        Object.assign(note, req.body);
        const updatedNote = await note.save();
        res.json(updatedNote);
    } catch (err) {
        res.status(400).json({ message: 'Error updating note', error: err.message });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.json({ message: 'Note deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting note', error: err.message });
    }
});

module.exports = router; 