const express = require("express");
const router = express.Router();
const axios = require("axios");

const OR_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-1.5-flash";

function headers() {
  return {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": process.env.CLIENT_URL || "https://your-app.vercel.app",
    "X-Title": "StudyWar"
  };
}

// 1) AI COACH
router.post("/coach", async (req, res) => {
  try {
    const { progress } = req.body;

    const resp = await axios.post(
      OR_URL,
      {
        model: MODEL,
        messages: [
          {
            role: "user",
            content: `Act as a strict coding mentor.

User progress:
${progress}

Give:

1. Honest feedback
2. Mistakes
3. Exact next steps
4. Short motivation`
          }
        ]
      },
      { headers: headers(), timeout: 30000 }
    );

    const reply = resp.data?.choices?.[0]?.message?.content || "";
    return res.json({ reply });
  } catch (e) {
    console.error("AI coach error:", e.response?.data || e.message);
    return res.status(500).json({ error: "AI failed" });
  }
});

// 2) AI CHAT (history supported)
router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body; // [{role, content}...]

    const resp = await axios.post(
      OR_URL,
      { model: MODEL, messages },
      { headers: headers(), timeout: 30000 }
    );

    const reply = resp.data?.choices?.[0]?.message?.content || "";
    return res.json({ reply });
  } catch (e) {
    console.error("AI chat error:", e.response?.data || e.message);
    return res.status(500).json({ error: "AI failed" });
  }
});

// 3) DAILY PLAN
router.post("/plan", async (req, res) => {
  try {
    const { streak, completed, missed } = req.body;

    const resp = await axios.post(
      OR_URL,
      {
        model: MODEL,
        messages: [
          {
            role: "user",
            content: `Create a focused daily plan (3–5 tasks).

Streak: ${streak}
Completed: ${completed}
Missed: ${missed}

Return a concise numbered list.`
          }
        ]
      },
      { headers: headers(), timeout: 30000 }
    );

    const reply = resp.data?.choices?.[0]?.message?.content || "";
    return res.json({ reply });
  } catch (e) {
    console.error("AI plan error:", e.response?.data || e.message);
    return res.status(500).json({ error: "AI failed" });
  }
});

module.exports = router;
