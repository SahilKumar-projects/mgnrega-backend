import { useState } from "react";

function GeminiChat({ summaryData, onClose }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const askAI = async () => {
    if (!question.trim()) {
      setError("Please enter a question");
      return;
    }

    setError("");

    const userMessage = { role: "user", text: question };
    const thinkingMessage = { role: "ai", text: "Thinking..." };

    setMessages((prev) => [...prev, userMessage, thinkingMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summaryData,
          question: userMessage.text,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI failed");

      // Replace "Thinking..." with actual answer
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "ai", text: data.answer },
      ]);
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-modal-overlay">
      <div className="ai-modal">
        {/* HEADER */}
        <div className="ai-header">
          <h3>🤖 Ask AI (MGNREGA Insights)</h3>
          <button className="ai-close" onClick={onClose}>✖</button>
        </div>

        {/* CHAT BODY */}
        <div className="ai-chat-body">
          {messages.length === 0 && (
            <div className="ai-placeholder">
              Ask anything about the filtered MGNREGA data
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`ai-message ${msg.role}`}>
              {msg.text}
            </div>
          ))}
        </div>

        {error && <div className="ai-error">{error}</div>}

        {/* INPUT */}
        <div className="ai-input-area">
          <input
            type="text"
            placeholder="Type your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => !loading && e.key === "Enter" && askAI()}
            disabled={loading}
          />
          <button onClick={askAI} disabled={loading}>
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GeminiChat;
