import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Main from './components/Main';
import './App.css';
import { TbTableColumn } from "react-icons/tb";
import { FaTabletAlt } from "react-icons/fa";
function App() {
  const [threadId, setThreadId] = useState(localStorage.getItem('thread_id') || "thread_Xfo1ZgNMzCLZyLXLt9KUY1KK");
  const [isSidebarVisible, setSidebarVisible] = useState(true); // New state to toggle sidebar visibility

  return (
    <div className={`app-container ${isSidebarVisible ? 'sidebar-visible' : 'sidebar-hidden'}`}>
      <Sidebar onThreadIdReceived={setThreadId} isVisible={isSidebarVisible} />

      <div className={`main_container ${isSidebarVisible ? 'with-sidebar' : 'without-sidebar'}`}>
        <button
          className="toggle-sidebar-button"
          onClick={() => setSidebarVisible(!isSidebarVisible)}
        >
          {isSidebarVisible ? <FaTabletAlt /> : <TbTableColumn />}
        </button>
        <Main threadId={threadId} />
      </div>
    </div>
  );
}

export default App;
