// src/components/EmailList/ProfessionalEmailList.jsx
// Gmail-inspired email list with advanced interactions

import React, { useState } from 'react';
import { 
  StarIcon as StarOutline,
  ArchiveBoxIcon,
  TrashIcon,
  ClockIcon,
  PaperClipIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { Avatar } from '../ui/Button';

const EmailRow = ({ 
  email, 
  selected, 
  onSelect, 
  onToggleStar, 
  onClick,
  onArchive,
  onDelete 
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (date) => {
    const emailDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (emailDate.toDateString() === today.toDateString()) {
      return emailDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
    } else if (emailDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (emailDate.getFullYear() === today.getFullYear()) {
      return emailDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } else {
      return emailDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div
      className={`
        group relative flex items-center gap-3 px-4 py-3 border-b border-gray-100
        transition-all duration-150 cursor-pointer
        ${selected ? 'bg-blue-50' : 'hover:shadow-sm bg-white'}
        ${!email.read ? 'font-semibold' : 'font-normal'}
      `}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={(e) => {
        if (e.target.closest('.action-button')) return;
        onClick(email);
      }}
    >
      {/* Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(email.id);
          }}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 action-button"
        />
      </div>

      {/* Star */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleStar(email.id);
        }}
        className="action-button flex-shrink-0 text-gray-400 hover:text-yellow-500 transition-colors"
      >
        {email.starred ? (
          <StarSolid className="h-5 w-5 text-yellow-500" />
        ) : (
          <StarOutline className="h-5 w-5" />
        )}
      </button>

      {/* Avatar */}
      <Avatar 
        name={email.sender} 
        size="sm"
        className="flex-shrink-0"
      />

      {/* Email Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`
            text-sm truncate
            ${!email.read ? 'text-gray-900 font-semibold' : 'text-gray-700'}
          `}>
            {email.sender}
          </span>
          
          {email.labels && email.labels.map((label) => (
            <span
              key={label}
              className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700"
            >
              {label}
            </span>
          ))}

          {email.hasAttachment && (
            <PaperClipIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className={`
            text-sm truncate flex-1
            ${!email.read ? 'text-gray-900' : 'text-gray-600'}
          `}>
            {email.subject}
          </span>
          <span className="text-xs text-gray-500 mx-2">-</span>
          <span className="text-sm text-gray-500 truncate" style={{ maxWidth: '300px' }}>
            {email.preview}
          </span>
        </div>
      </div>

      {/* Actions - Show on hover */}
      <div className={`
        flex items-center gap-2 transition-opacity duration-200
        ${showActions || selected ? 'opacity-100' : 'opacity-0 md:opacity-0'}
      `}>
        {!showActions && (
          <span className="text-xs text-gray-500 mr-2">
            {formatTime(email.date)}
          </span>
        )}

        {showActions && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onArchive(email.id);
              }}
              className="action-button p-2 hover:bg-gray-100 rounded transition-colors"
              title="Archive"
            >
              <ArchiveBoxIcon className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(email.id);
              }}
              className="action-button p-2 hover:bg-gray-100 rounded transition-colors"
              title="Delete"
            >
              <TrashIcon className="h-4 w-4 text-gray-600" />
            </button>
            <button
              className="action-button p-2 hover:bg-gray-100 rounded transition-colors"
              title="Snooze"
            >
              <ClockIcon className="h-4 w-4 text-gray-600" />
            </button>
          </>
        )}
      </div>

      {/* Unread indicator */}
      {!email.read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
      )}
    </div>
  );
};

const ProfessionalEmailList = ({ 
  emails = [], 
  loading = false,
  onEmailClick,
  onBulkAction 
}) => {
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [starredEmails, setStarredEmails] = useState(new Set());

  const handleSelectAll = () => {
    if (selectedEmails.size === emails.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(emails.map(e => e.id)));
    }
  };

  const handleSelect = (id) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEmails(newSelected);
  };

  const handleToggleStar = (id) => {
    const newStarred = new Set(starredEmails);
    if (newStarred.has(id)) {
      newStarred.delete(id);
    } else {
      newStarred.add(id);
    }
    setStarredEmails(newStarred);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <CheckCircleIcon className="h-16 w-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium">All caught up!</p>
        <p className="text-sm">No emails to display</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Bulk Actions Bar */}
      {selectedEmails.size > 0 && (
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-200 flex items-center gap-4">
          <span className="text-sm font-medium text-blue-900">
            {selectedEmails.size} selected
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors">
              Archive
            </button>
            <button className="px-3 py-1.5 text-sm bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors">
              Delete
            </button>
            <button className="px-3 py-1.5 text-sm bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors">
              Mark as Read
            </button>
          </div>
        </div>
      )}

      {/* Select All Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
        <input
          type="checkbox"
          checked={selectedEmails.size === emails.length && emails.length > 0}
          onChange={handleSelectAll}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-600 font-medium">
          {selectedEmails.size > 0 
            ? `${selectedEmails.size} of ${emails.length}` 
            : 'Select all'
          }
        </span>
      </div>

      {/* Email List */}
      <div className="divide-y divide-gray-100">
        {emails.map((email) => (
          <EmailRow
            key={email.id}
            email={{ ...email, starred: starredEmails.has(email.id) }}
            selected={selectedEmails.has(email.id)}
            onSelect={handleSelect}
            onToggleStar={handleToggleStar}
            onClick={onEmailClick}
            onArchive={(id) => console.log('Archive', id)}
            onDelete={(id) => console.log('Delete', id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProfessionalEmailList;