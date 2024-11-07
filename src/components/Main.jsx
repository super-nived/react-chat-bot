import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

const Main = ({ threadId: propThreadId }) => {
  const [question, setQuestion] = useState('');
  const [responseList, setResponseList] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatHistoryRef = useRef(null);

  // Set initial threadId from props or localStorage
  const [threadId, setThreadId] = useState(propThreadId || localStorage.getItem('thread_id'));
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Update threadId when propThreadId changes
  useEffect(() => {
    if (propThreadId) {
      setThreadId(propThreadId);
      localStorage.setItem('thread_id', propThreadId); // Update localStorage as well
    }
  }, [propThreadId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim() || !threadId) {
      alert('No thread ID found or question is empty.');
      return;
    }

    // Add user question to the response list
    setResponseList(prev => [{ question, response: null }, ...prev]);

    setLoading(true);
    const formData = new FormData();
    formData.append('query', question);
    formData.append('thread_id', threadId);

    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        // Add the API response to the question
        setResponseList(prev => {
          const updated = [...prev];
          updated[0] = { ...updated[0], response: data.message };
          return updated;
        });
      } else {
        setResponseList(prev => {
          const updated = [...prev];
          updated[0] = { ...updated[0], response: `Error: ${data.message}` };
          return updated;
        });
      }
    } catch (error) {
      setResponseList(prev => {
        const updated = [...prev];
        updated[0] = { ...updated[0], response: `Error: ${error.message}` };
        return updated;
      });
    } finally {
      setLoading(false);
      setQuestion(''); // Clear the input field after submission
    }
  };

  // Auto-scroll to bottom whenever the chat history is updated
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = 0;
    }
  }, [responseList, loading]);

  return (
    <div className="main-content">
      <div className="chat-history" ref={chatHistoryRef}>
        {responseList.map((entry, index) => (
          <div key={index} className="chat-entry">
            <p className="chat-question">{entry.question}</p>
            {entry.response ? (
              <ReactMarkdown className="chat-response">{entry.response}</ReactMarkdown>
            ) : (
              loading && index === 0 && (
                <div className="loader">
                  <div className="loader-ball"></div>
                  <div className="loader-text">Processing...</div>
                </div>
              )
            )}
          </div>
        ))}
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the PDF"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !question.trim()}>Ask</button>
      </form>
    </div>
  );
};

export default Main;
