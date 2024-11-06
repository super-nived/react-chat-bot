import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Main from './components/Main';
import './App.css';

function App() {
  const [threadId, setThreadId] = useState(localStorage.getItem('thread_id') || "thread_Xfo1ZgNMzCLZyLXLt9KUY1KK" ); // Initialize with localStorage value

  return (
    <div className="app-container">
      <Sidebar onThreadIdReceived={setThreadId} />
      <Main threadId={threadId} />
    </div>
  );
}

export default App;
