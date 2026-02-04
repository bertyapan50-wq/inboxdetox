import React, { useState, useEffect } from 'react';
import { Archive, RefreshCw, X, Mail } from 'lucide-react';

function ArchiveView() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const loadArchivedEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📦 Loading archived emails...');
      
      const response = await  fetch(`${process.env.REACT_APP_API_URL}/api/email/gmail/folder/archive?maxResults=100`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('✅ Archived emails loaded:', data);
      
      if (data.success) {
        setEmails(data.emails || []);
      } else {
        throw new Error(data.error || 'Failed to load archived emails');
      }
    } catch (err) {
      console.error('❌ Error loading archived emails:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadEmailDetails = async (emailId) => {
    try {
      setPreviewLoading(true);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/email/message/${emailId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load email details`);
      }

      const data = await response.json();
      console.log('📧 Email details loaded:', data);
      
      if (data.success && data.email) {
        setSelectedEmail(prev => ({
          ...prev,
          ...data.email
        }));
      }
    } catch (err) {
      console.error('❌ Error loading email details:', err);
      // Continue with basic email data
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleEmailClick = (email) => {
    console.log('📧 Opening email:', email.subject);
    setSelectedEmail(email);
    loadEmailDetails(email.id);
  };

  const closePreview = () => {
    setSelectedEmail(null);
  };

  useEffect(() => {
    loadArchivedEmails();
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Archive className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold">Archived Emails</h2>
            <span className="text-sm text-gray-500">({emails.length})</span>
          </div>
          
          <button
            onClick={loadArchivedEmails}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500">Loading archived emails...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 font-medium">Error loading archived emails</p>
              <p className="text-red-500 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={loadArchivedEmails}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : emails.length === 0 ? (
          <div className="text-center py-12">
            <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No archived emails</p>
            <p className="text-gray-400 text-sm mt-2">
              Emails you archive from your inbox will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {emails.map(email => (
              <div 
                key={email.id} 
                onClick={() => handleEmailClick(email)}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{email.from}</p>
                    <p className="text-sm text-gray-600 truncate">{email.subject || '(no subject)'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(email.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {email.snippet && (
                      <p className="text-xs text-gray-400 mt-1 truncate">{email.snippet}</p>
                    )}
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                    Archived
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Email Preview Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="w-6 h-6" />
                <h3 className="text-xl font-bold">Email Preview</h3>
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {previewLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                  <p className="text-gray-600">Loading full email...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Subject */}
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900">
                      {selectedEmail.subject || '(no subject)'}
                    </h4>
                  </div>

                  {/* From/To/Date */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-start">
                      <span className="font-semibold text-gray-700 w-20">From:</span>
                      <span className="text-gray-900">{selectedEmail.from}</span>
                    </div>
                    {selectedEmail.to && (
                      <div className="flex items-start">
                        <span className="font-semibold text-gray-700 w-20">To:</span>
                        <span className="text-gray-900">{selectedEmail.to}</span>
                      </div>
                    )}
                    <div className="flex items-start">
                      <span className="font-semibold text-gray-700 w-20">Date:</span>
                      <span className="text-gray-900">
                        {new Date(selectedEmail.date).toLocaleString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="mt-6">
                    {selectedEmail.body ? (
                      <div 
                        className="prose max-w-none text-gray-800"
                        dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                      />
                    ) : selectedEmail.snippet ? (
                      <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                        {selectedEmail.snippet}
                      </div>
                    ) : (
                      <p className="text-gray-400 italic">No content available</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 flex justify-end">
              <button
                onClick={closePreview}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArchiveView;