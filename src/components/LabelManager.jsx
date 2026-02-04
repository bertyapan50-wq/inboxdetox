import React, { useState, useEffect } from 'react';
import './LabelManager.css';

const LabelManager = ({ isOpen, onClose }) => {
  const [labels, setLabels] = useState([]);
  const [newLabelName, setNewLabelName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch labels when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchLabels();
    }
  }, [isOpen]);

  const fetchLabels = async () => {
    try {
      setLoading(true);
      const response = await fetch('${process.env.REACT_APP_API_URL}/api/labels', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Use userLabels from backend response (only user-created labels)
      setLabels(data.userLabels || []);
      setMessage({ text: '', type: '' });
    } catch (error) {
      console.error('Error fetching labels:', error);
      setMessage({ 
        text: error.message || 'Failed to fetch labels', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLabel = async (e) => {
    e.preventDefault();
    
    if (!newLabelName.trim()) {
      setMessage({ text: 'Please enter a label name', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/labels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          name: newLabelName,
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show'
        })
      });
      
      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', await response.text());
        throw new Error('Server error - please check if you are logged in');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      setMessage({ 
        text: `✅ Label "${newLabelName}" created successfully in Gmail!`, 
        type: 'success' 
      });
      setNewLabelName('');
      // Refresh labels list
      await fetchLabels();
    } catch (error) {
      console.error('Error creating label:', error);
      setMessage({ 
        text: error.message || 'Failed to create label', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLabel = async (labelId, labelName) => {
    if (!window.confirm(`Are you sure you want to delete "${labelName}" from Gmail?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/labels/${labelId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      setMessage({ 
        text: `✅ Label "${labelName}" deleted successfully from Gmail!`, 
        type: 'success' 
      });
      // Refresh labels list
      await fetchLabels();
    } catch (error) {
      console.error('Error deleting label:', error);
      setMessage({ 
        text: error.message || 'Failed to delete label', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📁 Manage Gmail Labels</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {/* Message Alert */}
          {message.text && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}

          {/* Create New Label Form */}
          <div className="create-label-section">
            <h3>Create New Label</h3>
            <form onSubmit={handleCreateLabel} className="create-label-form">
              <input
                type="text"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="Enter label name (e.g., Work, Personal)"
                className="label-input"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Creating...' : '+ Create Label'}
              </button>
            </form>
            <p className="help-text">
              💡 This will create the label directly in your Gmail account
            </p>
          </div>

          {/* Labels List */}
          <div className="labels-list-section">
            <h3>Your Gmail Labels ({labels.length})</h3>
            
            {loading && <p className="loading-text">Loading...</p>}
            
            {!loading && labels.length === 0 && (
              <p className="empty-state">No custom labels yet. Create one above!</p>
            )}
            
            {!loading && labels.length > 0 && (
              <div className="labels-grid">
                {labels.map(label => (
                  <div key={label.id} className="label-card">
                    <div className="label-info">
                      <strong className="label-name">{label.name}</strong>
                      <span className="label-count">
                        {label.messagesTotal || 0} messages
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteLabel(label.id, label.name)}
                      className="btn btn-danger btn-sm"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelManager;