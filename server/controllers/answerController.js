const Answer = require('../models/answer');

// Create an answer
exports.createAnswer = async (req, res) => {
  try {
    const { questionId, body } = req.body;
    const answer = new Answer({
      body,
      question: questionId,
      author: req.user.userId
    });
    await answer.save();
    res.status(201).json(answer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Vote on an answer
exports.voteAnswer = async (req, res) => {
  try {
    const { voteType } = req.body; // 'up' or 'down'
    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });

    answer.votes += voteType === 'up' ? 1 : -1;
    await answer.save();

    res.json({ message: 'Vote recorded', votes: answer.votes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Accept an answer
exports.acceptAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });

    answer.isAccepted = true;
    await answer.save();

    res.json({ message: 'Answer accepted', answer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
