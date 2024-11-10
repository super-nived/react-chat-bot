import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaSyncAlt, FaThumbsUp } from 'react-icons/fa';
import { PiSealQuestionFill } from "react-icons/pi";
import { AiOutlineCheckCircle } from "react-icons/ai"; // Example icon for "Final result"

const Main = ({ threadId: propThreadId }) => {
  const [question, setQuestion] = useState('');
  const [responseList, setResponseList] = useState(() => {
    const savedChatHistory = localStorage.getItem('chat_history');
    return savedChatHistory ? JSON.parse(savedChatHistory) : [];
  });
  const [loading, setLoading] = useState(false);
  const chatHistoryRef = useRef(null);
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const [threadId, setThreadId] = useState(propThreadId || localStorage.getItem('thread_id'));
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (propThreadId) {
      setThreadId(propThreadId);
      localStorage.setItem('thread_id', propThreadId);
    }
  }, [propThreadId]);

  useEffect(() => {
    const savedChatHistory = localStorage.getItem('chat_history');
    if (savedChatHistory) {
      setResponseList(JSON.parse(savedChatHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(responseList));
  }, [responseList]);

  const generateChatContext = () => {
    if (responseList.length === 0) return '';
    const firstEntry = responseList[responseList.length - 1];
    return `Question:\n${firstEntry.question}\nAnswer:\n${firstEntry.response || '...'}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentQuestion = question.trim() || "Final result";
    if (!threadId) {
      alert('No thread ID found.');
      return;
    }

    setResponseList(prev => [{ question: currentQuestion, response: null, liked: false }, ...prev]);
    setLoading(true);
    const formData = new FormData();
    const chatContext = generateChatContext();
    formData.append('chat_query', `${chatContext}\nQ: ${currentQuestion}`);
    formData.append('thread_id', threadId);

    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
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
      setQuestion('');
    }
  };

  const handleLike = async (index) => {
    if (sendingFeedback) {
      return; // Prevent multiple API calls if one is already in progress
    }

    setResponseList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], liked: !updated[index].liked };
      localStorage.setItem('chat_history', JSON.stringify(updated));
      return updated;
    });

    if (!responseList[index].liked) {
      setSendingFeedback(true);

      try {
        const allQuestions = responseList.map((entry) => entry.question);
        const selectedAnswer = responseList[index].response;

        const feedbackData = {
          threadId,
          questions: allQuestions,
          selectedAnswer: selectedAnswer,
        };

        const res = await fetch(`https://nr.uat.industryapps.net/approved`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedbackData),
        });

        if (res.ok) {
          console.log('Feedback sent successfully.');

          // Add "Final result" entry without a like button
          const resultResponse = await res.json();
          setResponseList(prev => [{ question: "Final result", response: resultResponse.message, isFinalResult: true }, ...prev]);
        } else {
          const data = await res.json();
          alert(`Error sending feedback: ${data.message}`);
        }
      } catch (error) {
        alert(`Error sending feedback: ${error.message}`);
      } finally {
        setSendingFeedback(false);
      }
    }
  };

  const handleClearChatHistory = () => {
    setResponseList([]);
    localStorage.removeItem('chat_history');
  };

  return (
    <div className="main-content">
      <button
        onClick={handleClearChatHistory}
        className="clear-chat-button"
        title="Clear Chat History"
      >
        <FaSyncAlt />
      </button>

      <div className="chat-history" ref={chatHistoryRef}>
        {responseList.length === 0 ? (
          <div className="chat-entry">
            <p className="chat-question">Hello, how can I help you?</p>
          </div>
        ) : (
          responseList.map((entry, index) => (
            <div key={index} className="chat-entry">
              <p className="chat-question">
                {entry.isFinalResult ? <AiOutlineCheckCircle /> : <PiSealQuestionFill />} {/* Icon for "Final result" */}
                {entry.question}
              </p>
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
              {/* Only show like button if it's not a "Final result" */}
              {entry.response && !entry.isFinalResult && (
                <button
                  className="like-button"
                  onClick={() => handleLike(index)}
                >
                  {entry.liked ? 'Unlike' : <FaThumbsUp />}
                </button>
              )}
            </div>
          ))
        )}
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
