import React, { useState, useEffect } from 'react';
import { Activity, Clock, Sparkles, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';

export default function ActivityLog({ user }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    pages: 0
  });

  // ✅ Fetch activities from backend
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Fetching activities from:', `${process.env.REACT_APP_API_URL}/api/activity`);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/activity?page=${page}&limit=50`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ✅ Important for sending cookies
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch activities`);
      }

      const data = await response.json();
      console.log('✅ Activities data:', data);
      
      if (data.success) {
        // ✅ Transform backend data to display format
        const transformedActivities = data.activities.map(activity => ({
          action: formatAction(activity.action, activity.description),
          time: formatTime(activity.timestamp),
          icon: getIcon(activity.action),
          category: getCategory(activity.action),
          color: getColor(activity.action),
          details: activity.details,
          status: activity.status,
          rawAction: activity.action, // Keep original for debugging
          timestamp: activity.timestamp
        }));

        setActivities(transformedActivities);
        setPagination(data.pagination || { total: 0, page: 1, limit: 50, pages: 0 });
        setStats(data.stats || {});
        
        console.log('✅ Activities loaded:', transformedActivities.length);
      } else {
        throw new Error(data.error || 'Failed to load activities');
      }
    } catch (err) {
      console.error('❌ Error fetching activities:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Format action text with better descriptions
  const formatAction = (action, description) => {
    // Use description if provided
    if (description) return description;
    
    const actionMap = {
      // Auth
      'login': 'Logged in to your account',
      'logout': 'Logged out',
      'signup': 'Created new account',
      
      // Profile
      'profile_update': 'Updated profile information',
      'profile_picture_upload': 'Uploaded new profile picture',
      'profile_picture_delete': 'Removed profile picture',
      
      // Settings
      'settings_update': 'Updated settings',
      'password_change': 'Changed password',
      
      // Email Actions
      'email_processed': 'Processed emails',
      'email_archived': 'Archived an email',
      'email_deleted': 'Deleted an email',
      
      // Cleanup
      'cleanup_performed': 'Performed inbox cleanup',
      'bulk_action': 'Performed bulk action',
      
      // Subscription
      'subscription_change': 'Changed subscription plan',
      'payment_success': 'Payment processed successfully',
      'payment_failed': 'Payment failed',
      
      // Referrals
      'referral_shared': 'Shared referral link',
      'referral_signup': 'Referral signup completed',
      
      // OAuth
      'oauth_connected': 'Connected external account',
      'oauth_disconnected': 'Disconnected account',
      
      // Labels & Follow-ups
      'label_created': 'Created new label',
      'label_updated': 'Updated label',
      'label_deleted': 'Deleted label',
      'followup_created': 'Created follow-up reminder',
      'followup_completed': 'Completed follow-up',
      'followup_deleted': 'Deleted follow-up',
      
      // Filters & AI
      'filter_created': 'Created email filter',
      'filter_updated': 'Updated filter',
      'ai_suggestion_accepted': 'Accepted AI suggestion',
      'ai_suggestion_rejected': 'Rejected AI suggestion',
      
      // Activity Management
      'activity_logs_cleared': 'Cleared old activity logs',
      
      // General
      'general_action': 'Performed an action',
    };

    return actionMap[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // ✅ Get icon for action type
  const getIcon = (action) => {
    const iconMap = {
      'login': '🔐',
      'logout': '👋',
      'signup': '🎉',
      'profile_update': '👤',
      'profile_picture_upload': '📸',
      'profile_picture_delete': '🗑️',
      'settings_update': '⚙️',
      'password_change': '🔑',
      'email_processed': '📧',
      'email_archived': '📦',
      'email_deleted': '🗑️',
      'cleanup_performed': '✨',
      'bulk_action': '⚡',
      'subscription_change': '👑',
      'payment_success': '💳',
      'payment_failed': '❌',
      'referral_shared': '🎁',
      'referral_signup': '🤝',
      'label_created': '📁',
      'label_updated': '✏️',
      'label_deleted': '🗑️',
      'followup_created': '⏰',
      'followup_completed': '✅',
      'followup_deleted': '❌',
      'filter_created': '🔍',
      'filter_updated': '✏️',
      'ai_suggestion_accepted': '🤖',
      'ai_suggestion_rejected': '🚫',
      'activity_logs_cleared': '🧹',
      'oauth_connected': '🔗',
      'oauth_disconnected': '⛓️',
      'general_action': '📌',
    };

    return iconMap[action] || '📌';
  };

  // ✅ Get category for action type
  const getCategory = (action) => {
    if (['login', 'logout', 'signup', 'password_change'].includes(action)) {
      return 'Security';
    }
    if (action.startsWith('profile')) {
      return 'Profile';
    }
    if (action.startsWith('email') || action.startsWith('cleanup') || action.startsWith('bulk')) {
      return 'Email';
    }
    if (action.startsWith('subscription') || action.startsWith('payment')) {
      return 'Subscription';
    }
    if (action.startsWith('label') || action.startsWith('filter')) {
      return 'Organization';
    }
    if (action.startsWith('followup')) {
      return 'Follow-ups';
    }
    if (action.startsWith('ai')) {
      return 'AI';
    }
    if (action.startsWith('oauth') || action.startsWith('referral')) {
      return 'Integration';
    }
    if (action.startsWith('settings')) {
      return 'Settings';
    }
    return 'General';
  };

  // ✅ Get color gradient for category
  const getColor = (action) => {
    const category = getCategory(action);
    
    const colorMap = {
      'Security': 'from-blue-500 to-cyan-500',
      'Profile': 'from-purple-500 to-pink-500',
      'Email': 'from-emerald-500 to-teal-500',
      'Subscription': 'from-amber-500 to-orange-500',
      'Organization': 'from-indigo-500 to-purple-500',
      'Follow-ups': 'from-rose-500 to-pink-500',
      'AI': 'from-violet-500 to-purple-500',
      'Integration': 'from-sky-500 to-blue-500',
      'Settings': 'from-slate-500 to-zinc-500',
      'General': 'from-slate-500 to-gray-500',
    };

    return colorMap[category] || 'from-slate-500 to-gray-500';
  };

  // ✅ Format timestamp to relative time
  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return time.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: time.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-96">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Loading your activities...</p>
            <p className="text-slate-400 text-sm mt-2">This should only take a moment</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error state with better UX
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-900 mb-2">Unable to Load Activities</h3>
            <p className="text-red-700 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => fetchActivities()}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                🔄 Try Again
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="bg-white text-red-600 border border-red-300 px-6 py-3 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                Refresh Page
              </button>
            </div>
            <p className="text-sm text-red-600 mt-4">
              💡 Tip: Make sure you're logged in and your internet connection is stable
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-lg shadow-indigo-500/50">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Activity Log
                  </h1>
                  <p className="text-slate-600 mt-1">Track your recent actions and progress</p>
                </div>
              </div>
              
              {/* Stats Badge */}
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 px-6 py-3 rounded-xl border border-emerald-200">
                  <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Total Activities</p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">{pagination.total || activities.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
            
            {/* Section Header */}
            <div className="bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 p-6 border-b border-slate-200/50 backdrop-blur-sm">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-lg text-slate-800">Recent Activity</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full border border-indigo-200/50">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-600 font-medium">Live</span>
                  </div>
                  <button 
                    onClick={() => fetchActivities(pagination.page)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
            </div>
            
            {/* Activities List or Empty State */}
            {activities.length === 0 ? (
              <div className="p-20 text-center">
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Activity className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No activity yet</h3>
                <p className="text-slate-500 mb-4">Your recent actions will appear here</p>
                <p className="text-sm text-slate-400">Start by connecting your email or performing actions in the app</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200/50">
                {activities.map((activity, i) => (
                  <div 
                    key={i} 
                    className="group relative p-6 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:via-purple-50/50 hover:to-pink-50/50 transition-all duration-300 cursor-pointer"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500"></div>
                    
                    <div className="relative flex items-center gap-6">
                      {/* Icon with Gradient Background */}
                      <div className={`relative bg-gradient-to-br ${activity.color} p-4 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                        <span className="text-3xl filter drop-shadow-lg">{activity.icon}</span>
                        <div className="absolute inset-0 bg-white/20 rounded-2xl blur group-hover:blur-md transition-all duration-300"></div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h4 className="font-bold text-slate-800 text-lg group-hover:text-indigo-700 transition-colors">
                            {activity.action}
                          </h4>
                          {activity.category && (
                            <span className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-200/50">
                              {activity.category}
                            </span>
                          )}
                          {activity.status === 'failed' && (
                            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full border border-red-200">
                              ❌ Failed
                            </span>
                          )}
                          {activity.status === 'pending' && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full border border-yellow-200">
                              ⏳ Pending
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{activity.time}</span>
                        </div>
                      </div>
                      
                      {/* Arrow Indicator */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-slate-50 p-4 border-t border-slate-200/50">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <p className="text-sm text-slate-600">
                    Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchActivities(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => fetchActivities(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Insight Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 backdrop-blur-xl rounded-2xl shadow-lg border border-emerald-200/50 p-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
              <div className="flex-1">
                <h4 className="font-bold text-emerald-900 mb-1">💡 Activity Insight</h4>
                <p className="text-sm text-emerald-700">
                  {activities.length > 0 
                    ? "You've been actively managing your inbox! Keep up the great work to maintain a clutter-free email experience."
                    : "Start using the app to see your activity history here! Connect your email and begin organizing."}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}