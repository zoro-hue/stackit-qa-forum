const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
// app.use('/api/auth', require('./routes/auth')); // Comment out if auth.js is missing/invalid
// app.use('/api/questions', require('./routes/questions')); // Comment out if questions.js is missing/invalid
// app.use('/api/answers', require('./routes/answers')); // Comment out if answers.js is missing/invalid

app.get('/', (req, res) => {
  res.send('StackIt API is running...');
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });