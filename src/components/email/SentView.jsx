import React, { useState, useEffect } from 'react';
import { Send, Loader2, Mail, Calendar, RefreshCw, X } from 'lucide-react';

function SentView() {
  const [sentEmails, setSentEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    loadSentEmails();
  }, []);

  const loadSentEmails = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/email/gmail/folder/sent', {
        credentials: 'include'
      });
      
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
      
      if (data.success) {
        console.log(`✅ Loaded ${data.emails?.length || 0} sent emails`);
        setSentEmails(data.emails || []);
      } else {
        setError(data.error || data.message || 'Failed to load sent emails');
      }
    } catch (err) {
      console.error('❌ Error loading sent emails:', err);
      setError(err.message || 'Failed to load sent emails. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmailDetails = async (emailId) => {
    try {
      setPreviewLoading(true);
      
      const response = await fetch(`/api/email/message/${emailId}`, {
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
    console.log('📧 Opening sent email:', email.subject);
    setSelectedEmail(email);
    loadEmailDetails(email.id);
  };

  const closePreview = () => {
    setSelectedEmail(null);
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
            <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading sent emails...</p>
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
            <Send className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-700 font-medium mb-2">Failed to load sent emails</p>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadSentEmails}
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
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Sent Emails</h2>
                <p className="text-green-100">Messages you've sent</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{sentEmails.length}</div>
              <div className="text-sm text-green-100">Total Sent</div>
            </div>
          </div>
        </div>

        {/* Emails List */}
        <div className="bg-white rounded-xl shadow-lg border">
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Your Sent Messages</h3>
            <button
              onClick={loadSentEmails}
              className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm transition-all duration-200 flex items-center space-x-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
          
          {sentEmails.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No sent emails found</h3>
              <p className="text-sm text-gray-500">
                Sent emails will appear here once you send messages from Gmail
              </p>
            </div>
          ) : (
            <div className="divide-y overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {sentEmails.map((email, index) => (
                <div 
                  key={email.id || index}
                  onClick={() => handleEmailClick(email)}
                  className="p-4 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm truncate flex-1">
                          To: {email.to || email.from || 'Unknown'}
                        </p>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                          Sent
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
                      
                      <div className="flex items-center text-xs text-gray-500 space-x-2">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(email.date)}</span>
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
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Send className="w-6 h-6" />
                <h3 className="text-xl font-bold">Sent Email Preview</h3>
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
                  <RefreshCw className="w-8 h-8 text-green-500 animate-spin mb-3" />
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
    </>
  );
}

export default SentView;