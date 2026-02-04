import React, { useState, useEffect } from 'react';
import { Edit, Loader2, RefreshCw, Trash2, Send, X, Mail } from 'lucide-react';

function DraftsView() {
  const [draftEmails, setDraftEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📧 Fetching drafts from /api/email/drafts');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/email/drafts`, {
        credentials: 'include'
      });
      
      console.log('📧 Response status:', response.status);
      
      const data = await response.json();
      console.log('📧 Response data:', data);
      
      if (data.success) {
        console.log(`✅ Loaded ${data.drafts.length} drafts`);
        setDraftEmails(data.drafts || []);
      } else {
        setError(data.message || data.error || 'Failed to load drafts');
      }
    } catch (err) {
      console.error('❌ Error loading drafts:', err);
      setError('Failed to load drafts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmailDetails = async (draftId) => {
    try {
      setPreviewLoading(true);
      
      // Try different possible API endpoints for drafts
      const endpoints = [
        `/api/email/drafts/${draftId}`,
        `/api/email/message/${draftId}`,
        `/api/email/draft/${draftId}`
      ];
      
      let success = false;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Trying endpoint: ${endpoint}`);
          const response = await fetch(endpoint, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Success with endpoint: ${endpoint}`, data);
            
            if (data.success && (data.email || data.draft)) {
              setSelectedEmail(prev => ({
                ...prev,
                ...(data.email || data.draft)
              }));
              success = true;
              break;
            }
          }
        } catch (e) {
          console.log(`❌ Failed with endpoint: ${endpoint}`);
          continue;
        }
      }
      
      if (!success) {
        console.log('⚠️ All endpoints failed, using existing draft data');
      }
    } catch (err) {
      console.error('❌ Error loading draft details:', err);
      // Continue with basic draft data
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleEmailClick = (draft) => {
    console.log('📧 Opening draft:', draft.subject);
    console.log('📧 Draft ID:', draft.id);
    setSelectedEmail(draft);
    loadEmailDetails(draft.id);
  };

  const closePreview = () => {
    setSelectedEmail(null);
  };

  const handleDeleteDraft = async (draftId, event) => {
    // Prevent the click from bubbling up to the parent div
    if (event) {
      event.stopPropagation();
    }
    
    if (!window.confirm('Delete this draft?')) return;
    
    try {
      const response = await fetch(`/api/email/drafts/${draftId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDraftEmails(prev => prev.filter(d => d.id !== draftId));
        // Close preview if this draft is currently open
        if (selectedEmail?.id === draftId) {
          closePreview();
        }
        alert('Draft deleted successfully');
      } else {
        alert('Failed to delete draft: ' + (data.error || data.message));
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      alert('Failed to delete draft');
    }
  };

  const handleEditDraft = (draftId, event) => {
    // Prevent the click from bubbling up to the parent div
    if (event) {
      event.stopPropagation();
    }
    window.open(`https://mail.google.com/mail/u/0/#drafts/${draftId}`, '_blank');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading drafts...</p>
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
            <Edit className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-700 font-medium mb-2">Failed to load drafts</p>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadDrafts}
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
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <Edit className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Draft Emails</h2>
                <p className="text-orange-100">Unfinished messages</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{draftEmails.length}</div>
              <div className="text-sm text-orange-100">Drafts</div>
            </div>
          </div>
        </div>

        {/* Drafts List */}
        <div className="bg-white rounded-xl shadow-lg border">
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Your Drafts</h3>
            <button
              onClick={loadDrafts}
              className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-sm transition-all duration-200 flex items-center space-x-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
          
          {draftEmails.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No drafts found</h3>
              <p className="text-sm text-gray-500">
                Draft emails will appear here when you save unfinished messages
              </p>
            </div>
          ) : (
            <div className="divide-y overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {draftEmails.map((draft, index) => (
                <div 
                  key={draft.id || index}
                  onClick={() => handleEmailClick(draft)}
                  className="p-4 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Edit className="w-5 h-5 text-orange-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm truncate flex-1">
                          {draft.to ? `To: ${draft.to}` : 'No recipient'}
                        </p>
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                          Draft
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-800 font-medium truncate mb-1">
                        {draft.subject || '(No Subject)'}
                      </p>
                      
                      {draft.snippet && (
                        <p className="text-xs text-gray-600 truncate mb-2">
                          {draft.snippet}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatDate(draft.date)}
                        </span>
                        
                        {/* Quick Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleEditDraft(draft.id, e)}
                            className="p-1.5 hover:bg-green-100 rounded transition-all"
                            title="Edit draft"
                          >
                            <Send className="w-4 h-4 text-green-600" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteDraft(draft.id, e)}
                            className="p-1.5 hover:bg-red-100 rounded transition-all"
                            title="Delete draft"
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
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Edit className="w-6 h-6" />
                <h3 className="text-xl font-bold">Draft Preview</h3>
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
                  <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mb-3" />
                  <p className="text-gray-600">Loading draft details...</p>
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
                    {selectedEmail.from && (
                      <div className="flex items-start">
                        <span className="font-semibold text-gray-700 w-20">From:</span>
                        <span className="text-gray-900">{selectedEmail.from}</span>
                      </div>
                    )}
                    {selectedEmail.to && (
                      <div className="flex items-start">
                        <span className="font-semibold text-gray-700 w-20">To:</span>
                        <span className="text-gray-900">{selectedEmail.to}</span>
                      </div>
                    )}
                    {selectedEmail.date && (
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
                    )}
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
                  onClick={() => handleEditDraft(selectedEmail.id)}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Edit in Gmail
                </button>
                <button
                  onClick={() => {
                    handleDeleteDraft(selectedEmail.id);
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
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

export default DraftsView;