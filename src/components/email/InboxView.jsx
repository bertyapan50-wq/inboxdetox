import React, { useState } from 'react';
import { 
  Mail, 
  Search, 
  Filter, 
  RefreshCw, 
  Star, 
  Archive, 
  Trash2, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Tag,
  Calendar,
  X,
  Eye,
  Reply,
  Forward,
  Paperclip,
  Download,
  FileText,
  Maximize2,
  Minimize2
} from 'lucide-react';

export default function InboxView({ 
  emails = [], 
  onEmailAction,
  onArchive,
  onDelete,
  onEmailClick,
  onMarkAsRead,
  onMarkAsUnread,
  onAddLabel,
  onFollowUp
}) {
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadingFullContent, setLoadingFullContent] = useState(false);
  const [fullEmailBody, setFullEmailBody] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const emailsPerPage = 20;

// ✅ ADD THESE 3 LINES HERE:
const [showReplyModal, setShowReplyModal] = useState(false);
const [replyMessage, setReplyMessage] = useState('');
const [sendingReply, setSendingReply] = useState(false);


  // Filter emails
  const filteredEmails = emails.filter(email => {
    const matchesSearch = 
      email.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' ? true :
      filterType === 'unread' ? !email.opened :
      filterType === 'read' ? email.opened :
      filterType === 'starred' ? email.importance > 0.7 : true;
    
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEmails.length / emailsPerPage);
  const startIndex = (currentPage - 1) * emailsPerPage;
  const endIndex = startIndex + emailsPerPage;
  const currentEmails = filteredEmails.slice(startIndex, endIndex);

  const unreadCount = emails.filter(e => !e.opened).length;
  const selectedCount = selectedEmails.length;

  // Handlers
  const toggleSelectEmail = (emailId) => {
    setSelectedEmails(prev =>
      prev.includes(emailId)
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedEmails.length === currentEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(currentEmails.map(e => e.id));
    }
  };

  const handleBulkAction = (action) => {
    const selectedEmailObjs = emails.filter(e => selectedEmails.includes(e.id));
    
    switch(action) {
      case 'archive':
        onArchive?.(selectedEmails);
        break;
      case 'delete':
        if (window.confirm(`Delete ${selectedEmails.length} emails?`)) {
          onDelete?.(selectedEmails);
        }
        break;
      case 'mark-read':
        onMarkAsRead?.(selectedEmails);
        break;
      case 'mark-unread':
        onMarkAsUnread?.(selectedEmails);
        break;
      default:
        break;
    }
    setSelectedEmails([]);
  };

  const openEmailPreview = async (email) => {
    setSelectedEmail(email);
    setIsFullscreen(false);
    setFullEmailBody(null);
    setLoadError(null);
    
    if (!email.opened) {
      onMarkAsRead?.([email.id]);
    }
    
    // Set existing body if available
    if (email.body) {
      setFullEmailBody(email.body);
    }
    
    // Don't auto-load - let user click "Load Full Email" button manually
    // if (!email.body && email.snippet) {
    //   await loadFullEmailContent(email.id);
    // }
  };


  const loadFullEmailContent = async (emailId) => {
  setLoadingFullContent(true);
  setLoadError(null);
  
  try {
    console.log('📧 Loading full email content for:', emailId);
    
    // ✅ Call the new backend endpoint
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/email/message/${emailId}`, {
  credentials: 'include'
});
    if (!response.ok) {
      throw new Error(`Failed to fetch email (${response.status})`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to load email');
    }
    
    const body = data.email.body || data.email.snippet || 'No content available';
    
    console.log('✅ Full email loaded:', body.substring(0, 100) + '...');
    setFullEmailBody(body);
    
  } catch (error) {
    console.error('❌ Error loading full email:', error);
    setLoadError(error.message);
    
    // ✅ Fallback to snippet
    if (selectedEmail.snippet) {
      setFullEmailBody(selectedEmail.snippet);
      setLoadError('Using preview only - full content unavailable');
    }
  } finally {
    setLoadingFullContent(false);
  }
};

// ✅ ADD THIS ENTIRE FUNCTION HERE (AFTER loadFullEmailContent):
const handleReply = async () => {
  if (!replyMessage.trim()) {
    alert('Please enter a message');
    return;
  }

  setSendingReply(true);

  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/email/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        emailId: selectedEmail.id,
        message: replyMessage
      }),
      credentials: 'include'
    });

    const data = await response.json();

    if (data.success) {
      alert('✅ Reply sent successfully!');
      setShowReplyModal(false);
      setReplyMessage('');
      setSelectedEmail(null);
    } else {
      alert(`❌ Failed to send reply: ${data.error}`);
    }
  } catch (error) {
    console.error('❌ Reply error:', error);
    alert('An error occurred while sending the reply');
  } finally {
    setSendingReply(false);
  }
};


  const getCategoryColor = (category) => {
    const colors = {
      'Work': 'bg-blue-100 text-blue-700 border-blue-200',
      'Personal': 'bg-green-100 text-green-700 border-green-200',
      'Newsletters': 'bg-purple-100 text-purple-700 border-purple-200',
      'Promotions': 'bg-orange-100 text-orange-700 border-orange-200',
      'Junk': 'bg-red-100 text-red-700 border-red-200',
      'Primary': 'bg-indigo-100 text-indigo-700 border-indigo-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
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

  return (
    <div className="space-y-4 animate-in fade-in duration-300 h-full flex flex-col">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Inbox className="w-7 h-7 text-indigo-600" />
              Inbox
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount > 0 ? (
                <span className="font-semibold text-indigo-600">{unreadCount} unread</span>
              ) : (
                <span className="text-green-600">All caught up! 🎉</span>
              )}
              {' • '}
              {filteredEmails.length} total emails
            </p>
          </div>
          
          <button 
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 transition-all cursor-pointer"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="starred">Starred</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedCount > 0 && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200 animate-in slide-in-from-top duration-200">
            <span className="text-sm font-medium text-indigo-700">
              {selectedCount} selected
            </span>
            <div className="flex gap-1 ml-auto">
              <button
                onClick={() => handleBulkAction('archive')}
                className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center gap-1 transition-all"
              >
                <Archive className="w-4 h-4" />
                Archive
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-1 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={() => handleBulkAction('mark-read')}
                className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm transition-all"
              >
                Mark Read
              </button>
              <button
                onClick={() => setSelectedEmails([])}
                className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Email List */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
        {/* List Header */}
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-4">
          <input
            type="checkbox"
            checked={selectedEmails.length === currentEmails.length && currentEmails.length > 0}
            onChange={toggleSelectAll}
            className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-600 font-medium">
            {startIndex + 1}–{Math.min(endIndex, filteredEmails.length)} of {filteredEmails.length}
          </span>
        </div>

        {/* Email Items */}
        <div className="overflow-y-auto divide-y" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {currentEmails.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No emails found</h3>
              <p className="text-gray-500">
                {searchQuery ? 'Try a different search term' : 'Your inbox is empty'}
              </p>
            </div>
          ) : (
            currentEmails.map((email) => (
              <div
                key={email.id}
                className={`flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-all cursor-pointer group ${
                  !email.opened ? 'bg-blue-50/30' : ''
                } ${selectedEmails.includes(email.id) ? 'bg-indigo-50' : ''}`}
                onClick={() => openEmailPreview(email)}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedEmails.includes(email.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleSelectEmail(email.id);
                  }}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />

                {/* Star */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Star className={`w-5 h-5 ${email.importance > 0.7 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} />
                </button>

                {/* Email Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-medium truncate ${!email.opened ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                      {email.from}
                    </span>
                    {!email.opened && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryColor(email.category)}`}>
                      {email.category}
                    </span>
                    {email.attachments && email.attachments.length > 0 && (
                      <Paperclip className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <p className={`text-sm truncate ${!email.opened ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                    {email.subject}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {email.snippet || 'No preview available'}
                  </p>
                </div>

                {/* Date & Actions */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(email.date)}
                  </span>
                  
                  {/* Quick Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onArchive?.([email.id]);
                      }}
                      className="p-1.5 hover:bg-blue-100 rounded transition-all"
                      title="Archive"
                    >
                      <Archive className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.([email.id]);
                      }}
                      className="p-1.5 hover:bg-red-100 rounded transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFollowUp?.(email);
                      }}
                      className="p-1.5 hover:bg-purple-100 rounded transition-all"
                      title="Follow-up"
                    >
                      <Calendar className="w-4 h-4 text-purple-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Email Preview Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`bg-white rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300 ${
            isFullscreen 
              ? 'max-w-[95vw] max-h-[95vh]' 
              : 'max-w-4xl max-h-[90vh]'
          }`}>

{/* Reply Modal */}
      {showReplyModal && selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-in slide-in-from-bottom duration-300">
            {/* Reply Header */}
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Reply className="w-6 h-6 text-green-600" />
                  Reply to Email
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  To: {selectedEmail.from}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyMessage('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Reply Body */}
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={`Re: ${selectedEmail.subject}`}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={10}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Original Email Preview */}
              <div className="border-t pt-4">
                <p className="text-xs text-gray-500 mb-2">Original Message:</p>
                <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <p className="text-xs text-gray-600">
                    <strong>From:</strong> {selectedEmail.from}<br />
                    <strong>Date:</strong> {formatDate(selectedEmail.date)}<br />
                    <strong>Subject:</strong> {selectedEmail.subject}
                  </p>
                  <div className="mt-2 text-xs text-gray-700 border-l-2 border-gray-300 pl-3">
                    {selectedEmail.snippet}
                  </div>
                </div>
              </div>
            </div>

            {/* Reply Actions */}
            <div className="p-6 border-t bg-gray-50 flex gap-3">
              <button
                onClick={handleReply}
                disabled={sendingReply || !replyMessage.trim()}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                {sendingReply ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Reply className="w-5 h-5" />
                    Send Reply
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyMessage('');
                }}
                disabled={sendingReply}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
            {/* Modal Header */}
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Eye className="w-6 h-6 text-indigo-600" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gray-800 truncate">{selectedEmail.subject}</h2>
                  <p className="text-sm text-gray-600 truncate">{selectedEmail.from}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                  title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Maximize2 className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <p className="text-sm text-gray-500">From</p>
                    <p className="font-medium text-gray-800">{selectedEmail.from}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium text-gray-800">{formatDate(selectedEmail.date)}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Category</p>
                  <span className={`text-sm px-3 py-1 rounded-full border ${getCategoryColor(selectedEmail.category)}`}>
                    {selectedEmail.category}
                  </span>
                </div>

                {/* Email Body Content */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">Email Content</p>
                    {!selectedEmail.body && selectedEmail.snippet && !loadingFullContent && !fullEmailBody && !loadError && (
                      <button
                        onClick={() => loadFullEmailContent(selectedEmail.id)}
                        className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1 transition-all"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Load Full Email
                      </button>
                    )}
                  </div>
                  
                  {/* Loading State */}
                  {loadingFullContent && (
                    <div className="border rounded-lg p-8 bg-white text-center">
                      <RefreshCw className="w-12 h-12 text-indigo-600 mx-auto mb-3 animate-spin" />
                      <p className="text-gray-600 text-sm font-medium">
                        Loading full email content...
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Trying multiple methods to fetch complete message
                      </p>
                    </div>
                  )}
                  
                  {/* Error State */}
                  {loadError && !loadingFullContent && (
                    <div className="border-2 border-orange-200 rounded-lg p-6 bg-orange-50 text-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Eye className="w-6 h-6 text-orange-600" />
                      </div>
                      <p className="text-orange-700 text-sm font-medium mb-2">
                        Full content not available
                      </p>
                      <p className="text-xs text-orange-600 mb-4">
                        {loadError}
                      </p>
                      <p className="text-xs text-gray-600 mb-4">
                        Showing preview below. The full email body may not be available from the server.
                      </p>
                      <button
                        onClick={() => setLoadError(null)}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition-all"
                      >
                        Continue with Preview
                      </button>
                    </div>
                  )}
                  
                  {/* Display email body or snippet */}
                  {!loadingFullContent && (fullEmailBody || selectedEmail.body || selectedEmail.snippet) && (
                    <>
                      {/* Display full email body */}
                      {(fullEmailBody || selectedEmail.body) && (
                        <div className="border rounded-lg p-4 bg-white max-h-[500px] overflow-y-auto">
                          <div 
                            className="prose prose-sm max-w-none text-gray-800"
                            dangerouslySetInnerHTML={{ __html: fullEmailBody || selectedEmail.body }}
                          />
                        </div>
                      )}
                      
                      {/* Use snippet if no body available */}
                      {!fullEmailBody && !selectedEmail.body && selectedEmail.snippet && !loadError && (
                        <div className="border rounded-lg p-4 bg-white max-h-[500px] overflow-y-auto">
                          <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {selectedEmail.snippet}
                          </div>
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs text-blue-800 flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              <span>Preview only. Click "Load Full Email" above to see complete content.</span>
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {!loadingFullContent && !loadError && !fullEmailBody && !selectedEmail.body && !selectedEmail.snippet && (
                    <div className="border rounded-lg p-8 bg-gray-50 text-center">
                      <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">
                        No email content available.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        This email may contain only images or external content.
                      </p>
                    </div>
                  )}
                </div>

                {/* Attachments Section */}
                {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Paperclip className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">
                        Attachments ({selectedEmail.attachments.length})
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {selectedEmail.attachments.map((attachment, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center justify-between bg-white rounded-lg p-3 hover:bg-blue-50 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-medium text-sm text-gray-800">
                                {attachment.filename || `Attachment ${idx + 1}`}
                              </p>
                              <p className="text-xs text-gray-500">
                                {attachment.mimeType || 'Unknown type'} • {attachment.size || 'Unknown size'}
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              window.open(attachment.url, '_blank');
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-1 transition-all"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Score */}
                {selectedEmail.importance && (
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                    <p className="text-sm font-medium text-indigo-700 mb-2">🤖 AI Importance Score</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${selectedEmail.importance * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-indigo-700">
                        {Math.round(selectedEmail.importance * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>


            {/* Modal Actions */}
<div className="p-6 border-t bg-gray-50 flex gap-2 flex-wrap">
  <button
  onClick={() => {
    setShowReplyModal(true);
  }}
  className="flex-1 min-w-[140px] px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
>
  <Reply className="w-5 h-5" />
  Reply
</button>

  <button
    onClick={async () => {
      const forwardTo = prompt("Enter the email address to forward to:");
      if (!forwardTo) return;

      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/email/forward`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            emailId: selectedEmail.id,
            forwardTo
          }),
          credentials: "include"
        });

        const data = await res.json();

        if (data.success) {
          alert(`Email forwarded to ${forwardTo}`);
        } else {
          alert(`Failed to forward: ${data.error}`);
        }
      } catch (err) {
        console.error("Forward error:", err);
        alert("An error occurred while forwarding the email");
      }
    }}
    className="flex-1 min-w-[140px] px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
  >
    <Forward className="w-5 h-5" />
    Forward
  </button>

  <button
    onClick={() => {
      onArchive?.([selectedEmail.id]);
      setSelectedEmail(null);
    }}
    className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
  >
    <Archive className="w-5 h-5" />
    Archive
  </button>

  <button
    onClick={() => {
      onDelete?.([selectedEmail.id]);
      setSelectedEmail(null);
    }}
    className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
  >
    <Trash2 className="w-5 h-5" />
    Delete
  </button>

  <button
    onClick={() => {
      onFollowUp?.(selectedEmail);
      setSelectedEmail(null);
    }}
    className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
  >
    <Calendar className="w-5 h-5" />
    Follow-up
  </button>
</div>

          </div>
        </div>
      )}
    </div>
  );
}