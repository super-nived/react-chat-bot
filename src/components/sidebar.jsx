import React, { useState } from 'react';
import Toaster from './Toaster'; // Assuming you have the Toaster component

const Sidebar = ({ onThreadIdReceived }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false); // Loader state for upload
  const [toaster, setToaster] = useState({ message: '', type: '' }); // Toaster state

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setToaster({ message: '', type: '' }); // Clear any previous toaster messages
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      showToaster('Please select a PDF file.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true); // Start upload loader

    try {
      
      const response = await fetch('http://localhost:5000/pdf_upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        showToaster('File uploaded successfully!', 'success');
        localStorage.setItem('thread_id', data.thread_id); // Store thread_id in local storage
        onThreadIdReceived(data.thread_id); // Pass thread_id to the parent component
      } else {
        showToaster('Error uploading file: ' + data.message, 'error');
      }
    } catch (error) {
      showToaster('Error uploading file: ' + error.message, 'error');
    } finally {
      setUploading(false); // Stop upload loader
      setFile(null); // Reset file input to show "Choose File" again
    }
  };

  const showToaster = (message, type) => {
    setToaster({ message, type });

    // Clear the toaster message after 3 seconds
    setTimeout(() => {
      setToaster({ message: '', type: '' });
    }, 3000);
  };

  const clearToaster = () => {
    setToaster({ message: '', type: '' });
  };

  return (
    <div className="sidebar">
      <h2>IAPPS GPT</h2>
      <div className="form_box">
        <form onSubmit={handleSubmit} className="formbox">
          {!file ? (
            <>
              <input
                type="file"
                id="file-upload"
          
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" className="choose-file-btn">
                Choose File
              </label>
            </>
          ) : (
            <>
              <p><strong>Selected File:</strong> {file.name}</p>
              <button type="submit" disabled={uploading} className="upload-btn">
                {uploading ? (
                  <>
                    <div className="upload-loader"></div>
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </button>
            </>
          )}
        </form>
      </div>

      {toaster.message && (
        <Toaster message={toaster.message} type={toaster.type} clearToaster={clearToaster} />
      )}
    </div>
  );
};

export default Sidebar;
