import React, { useState, useEffect } from 'react';
import { X, Calendar, Trash2, Archive, Reply, Star, Download, Loader2, AlertCircle, Send } from 'lucide-react';

const EmailViewer = ({ email, onClose }) => {
  const [fullEmail, setFullEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isStarred, setIsStarred] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (email?.id) {
      fetchFullEmail();
    } else {
      setError('No email ID provided.');
      setLoading(false);
    }
  }, [email?.id]);

  const fetchFullEmail = async () => {
    setLoading(true);
    setError(null);

    if (!email?.id) {
      setError('No email ID provided.');
      setLoading(false);
      return;
    }

    try {
      const url = `${process.env.REACT_APP_API_URL}/api/email/message/${email.id}`;
      console.log('🔍 Fetching email from:', url);
      
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        throw new Error(`Failed to fetch email: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.email) {
        throw new Error('Email data not found in response');
      }

      setFullEmail(data.email);
      
      // Check if email is starred
      const labels = data.email.labelIds || [];
      setIsStarred(labels.includes('STARRED'));
      
    } catch (err) {
      console.error('Error fetching full email:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    if (action === 'reply') {
      setShowReplyBox(true);
      return;
    }

    setActionLoading(true);
    setSuccessMessage('');
    
    try {
      let url = `${process.env.REACT_APP_API_URL}/api/email/${email.id}/${action}`;
      let body = {};
      
      if (action === 'star') {
        body = { starred: !isStarred };
      }
      
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Action failed');
      }

      console.log(`✅ ${action} successful:`, data);
      setSuccessMessage(data.message);
      
      // Update UI
      if (action === 'star') {
        setIsStarred(!isStarred);
      } else if (action === 'archive' || action === 'delete') {
        // Close viewer after archive/delete
        setTimeout(() => {
          onClose();
          window.location.reload(); // Refresh email list
        }, 1500);
      }
      
    } catch (err) {
      console.error(`Error ${action}:`, err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      alert('Please enter a reply message');
      return;
    }

    setActionLoading(true);
    setSuccessMessage('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/email/${email.id}/reply`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ replyText })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to send reply');
      }

      console.log('✅ Reply sent:', data);
      setSuccessMessage('Reply sent successfully!');
      setReplyText('');
      setShowReplyBox(false);
      
    } catch (err) {
      console.error('Error sending reply:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getEmailBody = () => {
    if (!fullEmail?.payload) return 'Email content could not be loaded.';

    const payload = fullEmail.payload;

    const findPart = (part, mimeType) => {
      if (part.mimeType === mimeType) return part.body?.data || null;
      if (part.parts) {
        for (const p of part.parts) {
          const found = findPart(p, mimeType);
          if (found) return found;
        }
      }
      return null;
    };

    let body = findPart(payload, 'text/html') || findPart(payload, 'text/plain');
    if (!body && payload.body?.data) body = payload.body.data;

    if (body) {
      try {
        return atob(body.replace(/-/g, '+').replace(/_/g, '/'));
      } catch (e) {
        return body;
      }
    }

    return 'Email content could not be loaded.';
  };

  const getHeader = (name) => {
    if (!fullEmail?.payload?.headers) return '';
    const header = fullEmail.payload.headers.find(h => h.name === name);
    return header ? header.value : '';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold mb-1 break-words">
                {email.subject || '(No Subject)'}
              </h2>
              <p className="text-indigo-100 text-sm">From: {email.from}</p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition flex-shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 bg-green-500 bg-opacity-20 border border-green-300 rounded-lg p-3">
              <p className="text-sm font-medium">✅ {successMessage}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleAction('reply')}
              disabled={actionLoading}
              className="px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm flex items-center gap-2 transition disabled:opacity-50"
            >
              <Reply className="w-4 h-4" /> Reply
            </button>
            <button
              onClick={() => handleAction('archive')}
              disabled={actionLoading}
              className="px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm flex items-center gap-2 transition disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
              Archive
            </button>
            <button
              onClick={() => handleAction('delete')}
              disabled={actionLoading}
              className="px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm flex items-center gap-2 transition disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </button>
            <button
              onClick={() => handleAction('star')}
              disabled={actionLoading}
              className="px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm flex items-center gap-2 transition disabled:opacity-50"
            >
              <Star className={`w-4 h-4 ${isStarred ? 'fill-yellow-300' : ''}`} />
              {isStarred ? 'Unstar' : 'Star'}
            </button>
          </div>
        </div>

        {/* Reply Box */}
        {showReplyBox && (
          <div className="bg-blue-50 border-b p-4">
            <h3 className="font-semibold mb-2">Reply to {email.from}</h3>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply here..."
              className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              rows="4"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSendReply}
                disabled={actionLoading || !replyText.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Reply
              </button>
              <button
                onClick={() => {
                  setShowReplyBox(false);
                  setReplyText('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Email Details */}
        {!loading && !error && fullEmail && (
          <div className="bg-gray-50 border-b px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-semibold text-gray-700">To:</span>
                <span className="ml-2 text-gray-600">{getHeader('To')}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Date:</span>
                <span className="ml-2 text-gray-600">{formatDate(getHeader('Date'))}</span>
              </div>
              {getHeader('Cc') && (
                <div>
                  <span className="font-semibold text-gray-700">Cc:</span>
                  <span className="ml-2 text-gray-600">{getHeader('Cc')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Email Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <p className="text-gray-600">Loading email...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-600 font-semibold mb-2">Failed to load email</p>
              <p className="text-gray-600 text-sm">{error}</p>
              <button
                onClick={fetchFullEmail}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && fullEmail && (
            <div className="bg-white rounded-lg">
              {email.snippet && (
                <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <p className="text-sm text-gray-700 italic">{email.snippet}</p>
                </div>
              )}

              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: getEmailBody() }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Category: <span className="font-semibold">{email.category}</span>
            {email.importance && (
              <span className="ml-4">
                Importance: <span className="font-semibold">{Math.round(email.importance * 100)}%</span>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailViewer;