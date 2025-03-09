const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

const userRoutes = require('./routes/users');
const bookRoutes = require('./routes/books');
const collectionRoutes = require('./routes/collections');
const notesRouter = require('./routes/notes');
const borrowersRouter = require('./routes/borrowers');

app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/notes', notesRouter);
app.use('/api/borrowers', borrowersRouter);

app.get('/', (req, res) => {
    res.send('Welcome to the Personal Library Management API');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 