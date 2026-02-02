import React, { useState } from 'react';
import { Mail, Archive, Trash2, Star, Eye, Clock, Check, Sparkles } from 'lucide-react';

function SuggestionCard({ suggestion, onComplete, priorityColor, priorityIcon }) {
  const [processing, setProcessing] = useState(false);

  const handleAction = async (action, emailId) => {
    try {
      setProcessing(true);
      
      let endpoint = '';
      let method = 'POST';
      let body = { emailIds: [emailId] };

      switch (action) {
        case 'archive':
          endpoint = '/api/email/archive';
          break;
        case 'delete':
          endpoint = '/api/email/delete';
          break;
        case 'star':
          endpoint = '/api/email/gmail/move';
          body = { emailIds: [emailId], toFolder: 'starred' };
          break;
        default:
          console.log('Action not implemented:', action);
          setProcessing(false);
          return;
      }

      const response = await fetch(endpoint, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        console.log(`✅ Action ${action} completed for email ${emailId}`);
        onComplete(emailId);
      } else {
        console.error('Action failed:', await response.text());
      }
    } catch (error) {
      console.error('Action error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffHours < 48) return 'Yesterday';
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border-l-4 ${priorityColor} p-6 hover:shadow-xl transition-all duration-200`}>
      {/* Priority Badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{priorityIcon}</span>
          <span className="text-xs font-bold uppercase tracking-wide text-gray-600">
            {suggestion.priority} Priority
          </span>
        </div>
        <span className="text-xs text-gray-400">{formatDate(suggestion.date)}</span>
      </div>

      {/* Email Info */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-900 mb-1 truncate">{suggestion.from}</p>
        <p className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{suggestion.subject || '(no subject)'}</p>
        <p className="text-sm text-gray-600 line-clamp-2">{suggestion.snippet}</p>
      </div>

      {/* AI Recommendation */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4 border border-purple-100">
        <div className="flex items-start space-x-2">
          <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-purple-900 text-sm">
              AI Recommendation: {suggestion.action}
            </p>
            <p className="text-purple-700 text-xs mt-1">{suggestion.reason}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => window.open(`https://mail.google.com/mail/u/0/#inbox/${suggestion.id}`, '_blank')}
          className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
          disabled={processing}
        >
          <Mail className="w-4 h-4" />
          <span>Reply</span>
        </button>

        <button
          onClick={() => handleAction('archive', suggestion.id)}
          className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50"
          disabled={processing}
        >
          <Archive className="w-4 h-4" />
          <span>Archive</span>
        </button>

        <button
          onClick={() => handleAction('star', suggestion.id)}
          className="flex items-center space-x-1 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium disabled:opacity-50"
          disabled={processing}
        >
          <Star className="w-4 h-4" />
          <span>Star</span>
        </button>

        <button
          onClick={() => handleAction('delete', suggestion.id)}
          className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
          disabled={processing}
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>

        <button
          onClick={() => onComplete(suggestion.id)}
          className="flex items-center space-x-1 px-3 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
          disabled={processing}
        >
          <Check className="w-4 h-4" />
          <span>Skip</span>
        </button>
      </div>

      {processing && (
        <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500">
          <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
}

export default SuggestionCard;