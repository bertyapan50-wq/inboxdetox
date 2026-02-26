// src/utils/activityLogger.js
// ✅ Reusable Activity Logger for Frontend

/**
 * Log an activity to the backend
 * @param {string} action - The action type (must match backend enum)
 * @param {string} description - Human-readable description
 * @param {object} details - Additional metadata (optional)
 * @param {string} status - 'success', 'failed', or 'pending' (default: 'success')
 * @returns {Promise<object>} The logged activity or null if failed
 */
export const logActivity = async (action, description, details = {}, status = 'success') => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        action,
        description,
        details,
        status,
        timestamp: new Date()
      })
    });

    if (!response.ok) {
      console.warn('⚠️ Failed to log activity:', action);
      return null;
    }

    const data = await response.json();
    console.log('✅ Activity logged:', action);
    return data.activity;

  } catch (error) {
    console.error('❌ Error logging activity:', error);
    return null;
  }
};

/**
 * Fetch user's activity logs
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 50)
 * @param {string} action - Filter by action type (optional)
 * @returns {Promise<object>} Activity logs with pagination
 */
export const fetchActivities = async (page = 1, limit = 50, action = null) => {
  try {
    let url = `${process.env.REACT_APP_API_URL}/api/activity?page=${page}&limit=${limit}`;
    if (action) url += `&action=${action}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch activities');
    }

    return await response.json();

  } catch (error) {
    console.error('❌ Error fetching activities:', error);
    throw error;
  }
};

/**
 * Get activity statistics
 * @param {number} days - Number of days to analyze (default: 30)
 * @returns {Promise<object>} Activity statistics
 */
export const fetchActivityStats = async (days = 30) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/activity/stats?days=${days}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch activity stats');
    }

    return await response.json();

  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    throw error;
  }
};

/**
 * Clear old activity logs
 * @param {number} olderThan - Delete activities older than N days (default: 90)
 * @returns {Promise<object>} Result with deleted count
 */
export const clearOldActivities = async (olderThan = 90) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/activity/clear`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ olderThan })
    });

    if (!response.ok) {
      throw new Error('Failed to clear activities');
    }

    return await response.json();

  } catch (error) {
    console.error('❌ Error clearing activities:', error);
    throw error;
  }
};

// ✅ COMMON ACTIVITY TYPES - Use these for consistency
export const ACTIVITY_TYPES = {
  // Auth
  LOGIN: 'login',
  LOGOUT: 'logout',
  SIGNUP: 'signup',
  
  // Profile
  PROFILE_UPDATE: 'profile_update',
  PROFILE_PICTURE_UPLOAD: 'profile_picture_upload',
  PROFILE_PICTURE_DELETE: 'profile_picture_delete',
  
  // Settings
  SETTINGS_UPDATE: 'settings_update',
  PASSWORD_CHANGE: 'password_change',
  
  // Email Actions
  EMAIL_PROCESSED: 'email_processed',
  EMAIL_ARCHIVED: 'email_archived',
  EMAIL_DELETED: 'email_deleted',
  
  // Cleanup
  CLEANUP_PERFORMED: 'cleanup_performed',
  BULK_ACTION: 'bulk_action',
  
  // Subscription
  SUBSCRIPTION_CHANGE: 'subscription_change',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  
  // Referrals
  REFERRAL_SHARED: 'referral_shared',
  REFERRAL_SIGNUP: 'referral_signup',
  
  // OAuth
  OAUTH_CONNECTED: 'oauth_connected',
  OAUTH_DISCONNECTED: 'oauth_disconnected',
  
  // Labels & Follow-ups
  LABEL_CREATED: 'label_created',
  LABEL_UPDATED: 'label_updated',
  LABEL_DELETED: 'label_deleted',
  FOLLOWUP_CREATED: 'followup_created',
  FOLLOWUP_COMPLETED: 'followup_completed',
  FOLLOWUP_DELETED: 'followup_deleted',
  
  // Filters & AI
  FILTER_CREATED: 'filter_created',
  FILTER_UPDATED: 'filter_updated',
  AI_SUGGESTION_ACCEPTED: 'ai_suggestion_accepted',
  AI_SUGGESTION_REJECTED: 'ai_suggestion_rejected',
  
  // Activity Management
  ACTIVITY_LOGS_CLEARED: 'activity_logs_cleared',
  
  // General
  GENERAL_ACTION: 'general_action',
};

// ✅ HELPER FUNCTIONS - Pre-configured activity loggers

export const ActivityLoggers = {
  // Auth
  login: () => logActivity(ACTIVITY_TYPES.LOGIN, 'Logged in successfully'),
  logout: () => logActivity(ACTIVITY_TYPES.LOGOUT, 'Logged out'),
  signup: () => logActivity(ACTIVITY_TYPES.SIGNUP, 'Created new account'),
  
  // Profile
  profileUpdate: (changes) => logActivity(
    ACTIVITY_TYPES.PROFILE_UPDATE,
    'Updated profile information',
    { changes }
  ),
  profilePictureUpload: () => logActivity(
    ACTIVITY_TYPES.PROFILE_PICTURE_UPLOAD,
    'Uploaded new profile picture'
  ),
  
  // Email Actions
  emailArchived: (count = 1) => logActivity(
    ACTIVITY_TYPES.EMAIL_ARCHIVED,
    `Archived ${count} email${count > 1 ? 's' : ''}`,
    { count }
  ),
  emailDeleted: (count = 1) => logActivity(
    ACTIVITY_TYPES.EMAIL_DELETED,
    `Deleted ${count} email${count > 1 ? 's' : ''}`,
    { count }
  ),
  emailProcessed: (count) => logActivity(
    ACTIVITY_TYPES.EMAIL_PROCESSED,
    `Processed ${count} emails`,
    { count }
  ),
  
  // Cleanup
  cleanupPerformed: (stats) => logActivity(
    ACTIVITY_TYPES.CLEANUP_PERFORMED,
    'Performed inbox cleanup',
    stats
  ),
  bulkAction: (action, count) => logActivity(
    ACTIVITY_TYPES.BULK_ACTION,
    `${action} ${count} items`,
    { action, count }
  ),
  
  // Labels
  labelCreated: (labelName) => logActivity(
    ACTIVITY_TYPES.LABEL_CREATED,
    `Created label: ${labelName}`,
    { labelName }
  ),
  labelUpdated: (labelName) => logActivity(
    ACTIVITY_TYPES.LABEL_UPDATED,
    `Updated label: ${labelName}`,
    { labelName }
  ),
  labelDeleted: (labelName) => logActivity(
    ACTIVITY_TYPES.LABEL_DELETED,
    `Deleted label: ${labelName}`,
    { labelName }
  ),
  
  // Follow-ups
  followupCreated: (subject, date) => logActivity(
    ACTIVITY_TYPES.FOLLOWUP_CREATED,
    `Created follow-up for: ${subject}`,
    { subject, date }
  ),
  followupCompleted: (subject) => logActivity(
    ACTIVITY_TYPES.FOLLOWUP_COMPLETED,
    `Completed follow-up: ${subject}`,
    { subject }
  ),
  
  // Filters
  filterCreated: (filterName) => logActivity(
    ACTIVITY_TYPES.FILTER_CREATED,
    `Created filter: ${filterName}`,
    { filterName }
  ),
  
  // AI
  aiSuggestionAccepted: (suggestion) => logActivity(
    ACTIVITY_TYPES.AI_SUGGESTION_ACCEPTED,
    'Accepted AI suggestion',
    { suggestion }
  ),
  aiSuggestionRejected: (suggestion) => logActivity(
    ACTIVITY_TYPES.AI_SUGGESTION_REJECTED,
    'Rejected AI suggestion',
    { suggestion }
  ),
  
  // Settings
  settingsUpdate: (settings) => logActivity(
    ACTIVITY_TYPES.SETTINGS_UPDATE,
    'Updated settings',
    { settings }
  ),
  passwordChange: () => logActivity(
    ACTIVITY_TYPES.PASSWORD_CHANGE,
    'Changed password'
  ),
  
  // OAuth
  oauthConnected: (service) => logActivity(
    ACTIVITY_TYPES.OAUTH_CONNECTED,
    `Connected ${service} account`,
    { service }
  ),
  oauthDisconnected: (service) => logActivity(
    ACTIVITY_TYPES.OAUTH_DISCONNECTED,
    `Disconnected ${service} account`,
    { service }
  ),
};

// Default export
export default {
  logActivity,
  fetchActivities,
  fetchActivityStats,
  clearOldActivities,
  ACTIVITY_TYPES,
  ActivityLoggers
};