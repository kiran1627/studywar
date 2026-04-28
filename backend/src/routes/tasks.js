const express = require('express');
const Task = require('../models/Task');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/:date', authMiddleware, async (req, res) => {
  try {
    const { date } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    const task = await Task.findOne({ userId: req.user._id, date });
    if (!task) return res.json({ date, morning: false, evening: false, problems: 0 });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];
    const tasks = await Task.find({ userId: req.user._id, date: { $gte: dateStr } }).sort({ date: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { date, problems } = req.body;
    const taskDate = date || new Date().toISOString().split('T')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(taskDate))
      return res.status(400).json({ message: 'Invalid date format' });
    const problemCount = Math.max(0, parseInt(problems) || 0);
    const task = await Task.findOneAndUpdate(
      { userId: req.user._id, date: taskDate },
      { $set: { problems: problemCount } },
      { new: true, upsert: true }
    );
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
