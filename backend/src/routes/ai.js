const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/ask", async (req, res) => {
  try {
    const { summaryData, question } = req.body;

    if (!question || !summaryData) {
      return res.status(400).json({
        error: "Missing summaryData or question",
      });
    }

    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    });

    const prompt = `
You are a government data analyst.

Analyze the following MGNREGA data and give clear, data-driven insights.

DATA:
${JSON.stringify(summaryData, null, 2)}

QUESTION:
${question}

Rules:
- Be factual
- Use numbers when possible
- Keep response concise and professional
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.json({ answer: response });
  } catch (err) {
    console.error("Gemini Error:", err);
    res.status(500).json({
      error: "Gemini AI failed",
      details: err.message,
    });
  }
});

module.exports = router;
