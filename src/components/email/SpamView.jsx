import React, { useState, useEffect } from 'react';
import { AlertOctagon, Loader2, RefreshCw, Trash2, X, Mail, ShieldCheck } from 'lucide-react';

function SpamView() {
  const [spamEmails, setSpamEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    loadSpamEmails();
  }, []);

  const loadSpamEmails = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🚨 Fetching spam emails...');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/email/gmail/folder/spam?maxResults=100`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = `Server error: ${response.status}`;
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          const text = await response.text();
          console.error('Non-JSON response:', text.substring(0, 200));
        }
        
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but got:', text.substring(0, 200));
        throw new Error('Server returned invalid response format');
      }
      
      const data = await response.json();
      console.log('✅ Spam emails loaded:', data);
      
      if (data.success) {
        setSpamEmails(data.emails || []);
      } else {
        setError(data.error || data.message || 'Failed to load spam emails');
      }
    } catch (err) {
      console.error('❌ Error loading spam emails:', err);
      setError(err.message || 'Failed to load spam emails. Please try again.');
    } finally {
      setIsLoading(false);
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
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleEmailClick = (email) => {
    console.log('📧 Opening spam email:', email.subject);
    setSelectedEmail(email);
    loadEmailDetails(email.id);
  };

  const closePreview = () => {
    setSelectedEmail(null);
  };

  const handleMarkNotSpam = async (emailId, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    if (!window.confirm('Mark this email as not spam?')) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/email/${emailId}/not-spam`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSpamEmails(prev => prev.filter(e => e.id !== emailId));
        if (selectedEmail?.id === emailId) {
          closePreview();
        }
        alert('Email marked as not spam and moved to inbox');
      } else {
        alert('Failed to mark as not spam: ' + (data.error || data.message));
      }
    } catch (error) {
      console.error('Error marking as not spam:', error);
      alert('Failed to mark as not spam');
    }
  };

  const handleDeletePermanently = async (emailId, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    if (!window.confirm('Permanently delete this email? This cannot be undone!')) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/email/${emailId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSpamEmails(prev => prev.filter(e => e.id !== emailId));
        if (selectedEmail?.id === emailId) {
          closePreview();
        }
        alert('Email permanently deleted');
      } else {
        alert('Failed to delete email: ' + (data.error || data.message));
      }
    } catch (error) {
      console.error('Error deleting email:', error);
      alert('Failed to delete email');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-yellow-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading spam emails...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertOctagon className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-700 font-medium mb-2">Failed to load spam emails</p>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadSpamEmails}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 animate-in fade-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Spam Emails</h2>
                <p className="text-yellow-100">Suspicious messages</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{spamEmails.length}</div>
              <div className="text-sm text-yellow-100">Total Spam</div>
            </div>
          </div>
        </div>

        {/* Emails List */}
        <div className="bg-white rounded-xl shadow-lg border">
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Spam Messages</h3>
            <button
              onClick={loadSpamEmails}
              className="px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg text-sm transition-all duration-200 flex items-center space-x-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
          
          {spamEmails.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertOctagon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No spam emails</h3>
              <p className="text-sm text-gray-500">
                Your inbox is clean! Spam emails will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {spamEmails.map((email, index) => (
                <div 
                  key={email.id || index}
                  onClick={() => handleEmailClick(email)}
                  className="p-4 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <AlertOctagon className="w-5 h-5 text-yellow-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm truncate flex-1">
                          From: {email.from || 'Unknown'}
                        </p>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                          Spam
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-800 font-medium truncate mb-1">
                        {email.subject || '(No Subject)'}
                      </p>
                      
                      {email.snippet && (
                        <p className="text-xs text-gray-600 truncate mb-2">
                          {email.snippet}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatDate(email.date)}
                        </span>
                        
                        {/* Quick Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleMarkNotSpam(email.id, e)}
                            className="p-1.5 hover:bg-green-100 rounded transition-all"
                            title="Not spam"
                          >
                            <ShieldCheck className="w-4 h-4 text-green-600" />
                          </button>
                          <button
                            onClick={(e) => handleDeletePermanently(email.id, e)}
                            className="p-1.5 hover:bg-red-100 rounded transition-all"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Email Preview Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertOctagon className="w-6 h-6" />
                <h3 className="text-xl font-bold">Spam Email Preview</h3>
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Warning Banner */}
            <div className="bg-yellow-50 border-b-2 border-yellow-200 p-3">
              <div className="flex items-center space-x-2 text-yellow-800">
                <AlertOctagon className="w-5 h-5" />
                <p className="text-sm font-medium">
                  ⚠️ This email was identified as spam. Be careful with links and attachments.
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {previewLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 text-yellow-500 animate-spin mb-3" />
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

            {/* Footer with Actions */}
            <div className="bg-gray-50 p-4 flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => handleMarkNotSpam(selectedEmail.id)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Not Spam
                </button>
                <button
                  onClick={() => handleDeletePermanently(selectedEmail.id)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Forever
                </button>
              </div>
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
    </>
  );
}

export default SpamView;