import React, { useState, useEffect } from 'react';
import { Trash2, Loader2, RefreshCw, RotateCcw, X, Mail, AlertTriangle } from 'lucide-react';

function TrashView() {
  const [trashEmails, setTrashEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    loadTrashEmails();
  }, []);

  const loadTrashEmails = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🗑️ Fetching trash emails...');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/email/gmail/folder/trash?maxResults=100`, {
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
      console.log('✅ Trash emails loaded:', data);
      
      if (data.success) {
        setTrashEmails(data.emails || []);
      } else {
        setError(data.error || data.message || 'Failed to load trash emails');
      }
    } catch (err) {
      console.error('❌ Error loading trash emails:', err);
      setError(err.message || 'Failed to load trash emails. Please try again.');
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
    console.log('📧 Opening trash email:', email.subject);
    setSelectedEmail(email);
    loadEmailDetails(email.id);
  };

  const closePreview = () => {
    setSelectedEmail(null);
  };

  const handleRestore = async (emailId, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    if (!window.confirm('Restore this email to inbox?')) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/email/${emailId}/restore`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTrashEmails(prev => prev.filter(e => e.id !== emailId));
        if (selectedEmail?.id === emailId) {
          closePreview();
        }
        alert('Email restored to inbox');
         // ✅ ADD THIS - Reload trash to confirm
    setTimeout(() => loadTrashEmails(), 1000); // Reload after 1 second

      } else {
        alert('Failed to restore email: ' + (data.error || data.message));
      }
    } catch (error) {
      console.error('Error restoring email:', error);
      alert('Failed to restore email');
    }
  };

  const handleDeletePermanently = async (emailId, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    if (!window.confirm('Permanently delete this email? ')) return;
    
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
        setTrashEmails(prev => prev.filter(e => e.id !== emailId));
        if (selectedEmail?.id === emailId) {
          closePreview();
        }
        alert('Email permanently deleted');
        // ✅ ADD THIS - Reload trash to confirm
    setTimeout(() => loadTrashEmails(), 1000);
      } else {
        alert('Failed to delete email: ' + (data.error || data.message));
      }
    } catch (error) {
      console.error('Error deleting email:', error);
      alert('Failed to delete email');
    }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm(`Permanently delete all ${trashEmails.length} emails in trash? This cannot be undone!`)) return;
    
    try {
      const response = await fetch('${process.env.REACT_APP_API_URL}/api/email/trash/empty', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTrashEmails([]);
        closePreview();
        alert('Trash emptied successfully');
      } else {
        alert('Failed to empty trash: ' + (data.error || data.message));
      }
    } catch (error) {
      console.error('Error emptying trash:', error);
      alert('Failed to empty trash');
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
            <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading trash...</p>
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
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-700 font-medium mb-2">Failed to load trash</p>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadTrashEmails}
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
        <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Trash</h2>
                <p className="text-red-100">Deleted emails (auto-delete after 30 days)</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{trashEmails.length}</div>
              <div className="text-sm text-red-100">Items</div>
            </div>
          </div>
        </div>

        {/* Emails List */}
        <div className="bg-white rounded-xl shadow-lg border">
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Deleted Messages</h3>
            <div className="flex gap-2">
              {trashEmails.length > 0 && (
                <button
                  onClick={handleEmptyTrash}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-all duration-200 flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Empty Trash</span>
                </button>
              )}
              <button
                onClick={loadTrashEmails}
                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-all duration-200 flex items-center space-x-1"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          {trashEmails.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Trash is empty</h3>
              <p className="text-sm text-gray-500">
                Deleted emails will appear here and be permanently deleted after 30 days.
              </p>
            </div>
          ) : (
            <div className="divide-y overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {trashEmails.map((email, index) => (
                <div 
                  key={email.id || index}
                  onClick={() => handleEmailClick(email)}
                  className="p-4 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm truncate flex-1">
                          From: {email.from || 'Unknown'}
                        </p>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                          Deleted
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
                            onClick={(e) => handleRestore(email.id, e)}
                            className="p-1.5 hover:bg-green-100 rounded transition-all"
                            title="Restore to inbox"
                          >
                            <RotateCcw className="w-4 h-4 text-green-600" />
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
            <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Trash2 className="w-6 h-6" />
                <h3 className="text-xl font-bold">Deleted Email Preview</h3>
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Warning Banner */}
            <div className="bg-red-50 border-b-2 border-red-200 p-3">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <p className="text-sm font-medium">
                  This email will be permanently deleted after 30 days in trash.
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {previewLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 text-red-500 animate-spin mb-3" />
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
                  onClick={() => handleRestore(selectedEmail.id)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restore
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

export default TrashView;