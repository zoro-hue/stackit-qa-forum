const Question = require('../models/question');

// Get all questions
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find().populate('author', 'username');
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single question
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('author', 'username');
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a question
exports.createQuestion = async (req, res) => {
  try {
    const { title, body } = req.body;
    const question = new Question({
      title,
      body,
      author: req.user.userId
    });
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Vote on a question
exports.voteQuestion = async (req, res) => {
  try {
    const { voteType } = req.body; // 'up' or 'down'
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    question.votes += voteType === 'up' ? 1 : -1;
    await question.save();

    res.json({ message: 'Vote recorded', votes: question.votes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
