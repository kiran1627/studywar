const express = require('express');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Messages array required' });
    }

    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    const systemPrompt = {
      role: 'system',
      content: 'You are an encouraging, knowledgeable AI Study Coach for the StudyWar platform. Help users plan, study, and solve coding problems. Keep answers motivating and helpful.'
    };

    // Check if API Key exists
    if (!OPENROUTER_API_KEY) {
      // Mock response for local dev without key
      const lastMsg = messages[messages.length - 1]?.content || '';
      return res.json({ 
        reply: `[Coach Mode (Demo)] I heard you say: "${lastMsg}". Setup OPENROUTER_API_KEY to activate real AI replies!` 
      });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
        'X-Title': 'StudyWar AI Coach',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [systemPrompt, ...formattedMessages]
      })
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || 'OpenRouter error');
    }

    const reply = data.choices?.[0]?.message?.content || 'I am having trouble thinking right now.';
    res.json({ reply });
  } catch (error) {
    console.error('AI Chat Error:', error);
    const lastMsg = req.body.messages?.[req.body.messages.length - 1]?.content || '';
    res.json({ 
      reply: `[Coach Mode (Fallback)] Connection issue resolved. Prompt context: "${lastMsg}"`
    });
  }
});

router.post('/plan', authMiddleware, async (req, res) => {
  try {
    const { streak, completedTasks, missedSessions } = req.body;

    const prompt = `You are a highly intelligent study planner. Based on the following user data:
- Current Streak: ${streak} days
- Completed Sessions: ${completedTasks}
- Missed Sessions: ${missedSessions}

Generate exactly 3-5 actionable, highly motivating tasks for the user to complete TODAY. 
Return ONLY a raw JSON array of strings. Example format:
[
  "Complete a 30-minute Focus Mode block",
  "Solve 2 Easy LeetCode questions",
  "Review sorting algorithms"
]`;

    if (!OPENROUTER_API_KEY) {
      // Mock Daily Plan
      return res.json([
        "Complete a morning focus block (6:00 AM - 8:00 AM)",
        "Solve at least 3 coding challenges",
        "Practice active recall for 15 minutes"
      ]);
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    let plan = [];
    try {
      const rawContent = data.choices?.[0]?.message?.content || '[]';
      plan = JSON.parse(rawContent);
      if (!Array.isArray(plan)) {
        plan = ["Practice focus mode", "Solve coding puzzles", "Clean workspace"];
      }
    } catch (e) {
      plan = ["Review key concepts", "Complete daily focus", "Crush today's tasks"];
    }

    res.json(plan);
  } catch (error) {
    console.error('AI Plan Error:', error);
    res.json([
      "Review key concepts",
      "Complete daily focus",
      "Crush today's tasks"
    ]);
  }
});

module.exports = router;
