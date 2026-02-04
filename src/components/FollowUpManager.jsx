import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Bell } from 'lucide-react';

const FollowUpManager = ({ selectedEmail, onClose }) => {
  const [followUps, setFollowUps] = useState({ due: [], upcoming: [], completed: [] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Form state
  const [formData, setFormData] = useState({
    followUpDate: '',
    notes: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/followups`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch follow-ups');
      
      const data = await response.json();
      setFollowUps(data.followUps);
      setMessage({ text: '', type: '' });
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFollowUp = async () => {
    if (!formData.followUpDate) {
      setMessage({ text: 'Please select a date', type: 'error' });
      return;
    }

    if (!selectedEmail) {
      setMessage({ text: 'No email selected', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/followups/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          emailId: selectedEmail.id,
          emailSubject: selectedEmail.subject,
          emailFrom: selectedEmail.from,
          ...formData
        })
      });

      if (!response.ok) throw new Error('Failed to create follow-up');

      setMessage({ text: '✅ Follow-up scheduled!', type: 'success' });
      setFormData({ followUpDate: '', notes: '', priority: 'medium' });
      fetchFollowUps();
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/followups/${id}/complete`, {
        method: 'PATCH',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to complete follow-up');

      setMessage({ text: '✅ Marked as completed!', type: 'success' });
      fetchFollowUps();
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this follow-up?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/followups/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete follow-up');

      setMessage({ text: '✅ Follow-up deleted!', type: 'success' });
      fetchFollowUps();
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="w-6 h-6" />
                Follow-up Manager
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Schedule reminders for important emails
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Message Alert */}
          {message.text && (
            <div className={`mb-4 p-3 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* Create Follow-up Form */}
          {selectedEmail && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
              <h3 className="font-semibold text-lg mb-3 text-blue-900">
                Schedule Follow-up
              </h3>
              <div className="bg-white p-3 rounded mb-3 text-sm">
                <p className="font-medium text-gray-700">{selectedEmail.subject}</p>
                <p className="text-gray-500">From: {selectedEmail.from}</p>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.followUpDate}
                      onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any notes or reminders..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={handleCreateFollowUp}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
                >
                  {loading ? 'Scheduling...' : '📅 Schedule Follow-up'}
                </button>
              </div>
            </div>
          )}

          {/* Follow-ups List */}
          <div className="space-y-6">
            {/* Due Follow-ups */}
            {followUps.due.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 text-red-600 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Due Now ({followUps.due.length})
                </h3>
                <div className="space-y-2">
                  {followUps.due.map((followUp) => (
                    <FollowUpCard
                      key={followUp._id}
                      followUp={followUp}
                      onComplete={handleComplete}
                      onDelete={handleDelete}
                      formatDate={formatDate}
                      getPriorityColor={getPriorityColor}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Follow-ups */}
            {followUps.upcoming.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 text-blue-600 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming ({followUps.upcoming.length})
                </h3>
                <div className="space-y-2">
                  {followUps.upcoming.map((followUp) => (
                    <FollowUpCard
                      key={followUp._id}
                      followUp={followUp}
                      onComplete={handleComplete}
                      onDelete={handleDelete}
                      formatDate={formatDate}
                      getPriorityColor={getPriorityColor}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Follow-ups */}
            {followUps.completed.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 text-green-600 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Completed ({followUps.completed.length})
                </h3>
                <div className="space-y-2">
                  {followUps.completed.slice(0, 5).map((followUp) => (
                    <FollowUpCard
                      key={followUp._id}
                      followUp={followUp}
                      onComplete={handleComplete}
                      onDelete={handleDelete}
                      formatDate={formatDate}
                      getPriorityColor={getPriorityColor}
                      isCompleted
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {followUps.due.length === 0 && followUps.upcoming.length === 0 && followUps.completed.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">No follow-ups scheduled yet</p>
                <p className="text-sm">Select an email to create your first follow-up</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Follow-up Card Component
const FollowUpCard = ({ followUp, onComplete, onDelete, formatDate, getPriorityColor, isCompleted }) => {
  return (
    <div className={`border rounded-lg p-4 ${isCompleted ? 'bg-gray-50 opacity-60' : 'bg-white'} shadow-sm hover:shadow-md transition`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(followUp.priority)}`}>
              {followUp.priority.toUpperCase()}
            </span>
            {isCompleted && (
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                COMPLETED
              </span>
            )}
          </div>
          <h4 className="font-medium text-gray-900">{followUp.emailSubject}</h4>
          <p className="text-sm text-gray-600">From: {followUp.emailFrom}</p>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <Clock className="w-4 h-4" />
            {formatDate(followUp.followUpDate)}
          </div>
          {followUp.notes && (
            <p className="text-sm text-gray-600 mt-2 italic">"{followUp.notes}"</p>
          )}
        </div>
        
        <div className="flex gap-2 ml-4">
          {!isCompleted && (
            <button
              onClick={() => onComplete(followUp._id)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
              title="Mark as completed"
            >
              <CheckCircle className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => onDelete(followUp._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Delete"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FollowUpManager;