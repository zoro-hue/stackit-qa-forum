const express = require('express');
const Answer = require('../models/answer');
const Question = require('../models/question');
const Notification = require('../models/notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Create answer
router.post('/', auth, async (req, res) => {
  try {
    const { content, questionId } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = new Answer({
      content,
      author: req.user.userId,
      question: questionId
    });

    await answer.save();
    await answer.populate('author', 'username reputation');

    // Add answer to question
    question.answers.push(answer._id);
    await question.save();

    // Create notification for question author
    if (question.author.toString() !== req.user.userId) {
      const notification = new Notification({
        recipient: question.author,
        sender: req.user.userId,
        type: 'answer',
        message: `Someone answered your question: ${question.title}`,
        link: `/questions/${questionId}`
      });
      await notification.save();
    }

    res.status(201).json(answer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Vote on answer
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { vote } = req.body;
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const existingVote = answer.voters.find(
      v => v.user.toString() === req.user.userId
    );

    if (existingVote) {
      answer.votes += vote - existingVote.vote;
      existingVote.vote = vote;
    } else {
      answer.votes += vote;
      answer.voters.push({
        user: req.user.userId,
        vote
      });
    }

    await answer.save();
    res.json({ votes: answer.votes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accept answer
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const question = await Question.findById(answer.question);
    if (question.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Unaccept previous answer if exists
    if (question.acceptedAnswer) {
      await Answer.findByIdAndUpdate(
        question.acceptedAnswer,
        { isAccepted: false }
      );
    }

    // Accept new answer
    answer.isAccepted = true;
    await answer.save();

    question.acceptedAnswer = answer._id;
    await question.save();

    res.json({ message: 'Answer accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;