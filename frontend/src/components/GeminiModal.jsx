import { useState } from "react";

function GeminiModal({ onClose, summaryData }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("http://localhost:5000/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summaryData,
          question,
        }),
      });

      const data = await res.json();
      setAnswer(data.answer || "No response from AI");
    } catch (err) {
      setAnswer("AI failed to respond.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-overlay">
      <div className="ai-modal">
        <div className="ai-header">
          <h3>Ask MGNREGA AI</h3>
          <button onClick={onClose}>✖</button>
        </div>

        <div className="ai-body">
          <textarea
            placeholder="Ask anything about the current MGNREGA data..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <button onClick={askAI} disabled={loading}>
            {loading ? "Analyzing..." : "Ask AI"}
          </button>

          {answer && (
            <div className="ai-response">
              <strong>AI Insight:</strong>
              <p>{answer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GeminiModal;
