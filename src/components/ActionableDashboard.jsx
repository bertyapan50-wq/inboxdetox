import React, { useState, useEffect } from 'react';
import { 
  Mail, Archive, Trash2, XCircle, ChevronRight, TrendingUp, 
  CheckCircle, Zap, Target, Award, Star, Calendar, Clock, 
  Plus, ArrowRight 
} from 'lucide-react';
// ❌ REMOVED: import { useNavigate } from 'react-router-dom';
import planningApiService from '../services/planningApi';

export default function ActionableDashboard({
  emails = [],
  stats = {},
  onCategoryClick,
  onBulkArchive,
  onBulkDelete,
  onBulkUnsubscribe,
  onOpenLabels,
  onOpenFollowUps,
  onNavigate // ✅ NEW: Accept navigation function as prop
}) {
  // ❌ REMOVED: const navigate = useNavigate();
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  
  // ✅ Auto Planner State
  const [tasks, setTasks] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // ✅ Fetch tasks on mount
  useEffect(() => {
    fetchPlanningData();
  }, []);

  const fetchPlanningData = async () => {
    try {
      setLoadingTasks(true);
      
      const tasksResponse = await planningApiService.getTasks();
      if (tasksResponse.success) {
        setTasks(tasksResponse.tasks);
      }
      
      const scheduleResponse = await planningApiService.getTodaySchedule();
      if (scheduleResponse.success) {
        setTodaySchedule(scheduleResponse.tasks);
      }
    } catch (error) {
      console.error('Error fetching planning data:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const calculateHealthScore = () => {
    const total = stats.total || 1;
    const clutter = (stats.promotions || 0) + (stats.updates || 0) + (stats.junk || 0);
    const score = Math.max(0, Math.min(100, 100 - (clutter / total * 100)));
    return Math.round(score);
  };

  const healthScore = calculateHealthScore();

  const getTopSenders = () => {
    const promoEmails = emails.filter(e => {
      if (e.category?.toLowerCase() === 'promotions') return true;
      const labels = e.labelIds || [];
      return labels.includes('CATEGORY_PROMOTIONS');
    });
    
    if (promoEmails.length === 0) return [];
    
    const senderCounts = {};
    promoEmails.forEach(email => {
      let sender = email.from || 'Unknown';
      
      if (sender.includes('<')) {
        sender = sender.split('<')[0].trim();
      }
      sender = sender.replace(/['"]/g, '');
      
      if (sender.includes('@')) {
        const domain = sender.split('@')[1];
        sender = domain.split('.')[0];
        sender = sender.charAt(0).toUpperCase() + sender.slice(1);
      }
      
      if (!senderCounts[sender]) {
        senderCounts[sender] = 0;
      }
      senderCounts[sender]++;
    });
    
    return Object.entries(senderCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  const handleUnsubscribeClick = () => {
    setSelectedAction('promotions');
    setShowUnsubscribeModal(true);
  };

  const handleConfirmUnsubscribe = () => {
    const categoryEmails = emails.filter(e => e.category?.toLowerCase() === 'promotions');
    const emailIds = categoryEmails.map(e => e.id);
    onBulkUnsubscribe?.(emailIds);
    setShowUnsubscribeModal(false);
  };

  const handleCategoryAction = (category, action) => {
    const categoryEmails = emails.filter(e => {
      if (e.category?.toLowerCase() === category.toLowerCase()) {
        return true;
      }
      
      const labels = e.labelIds || [];
      
      switch(category.toLowerCase()) {
        case 'promotions':
          return labels.includes('CATEGORY_PROMOTIONS');
        case 'social':
          return labels.includes('CATEGORY_SOCIAL');
        case 'updates':
          return labels.includes('CATEGORY_UPDATES');
        case 'forums':
          return labels.includes('CATEGORY_FORUMS');
        case 'junk':
          return labels.includes('SPAM') || labels.includes('TRASH');
        case 'primary':
          return labels.includes('INBOX') && 
                 !labels.includes('CATEGORY_PROMOTIONS') &&
                 !labels.includes('CATEGORY_SOCIAL') &&
                 !labels.includes('CATEGORY_UPDATES');
        default:
          return false;
      }
    });
    
    const emailIds = categoryEmails.map(e => e.id);
    
    if (emailIds.length === 0) {
      alert(`No ${category} emails found to ${action}.`);
      return;
    }

    switch(action) {
      case 'archive':
        onBulkArchive?.(emailIds);
        break;
      case 'delete':
        onBulkDelete?.(emailIds);
        break;
      case 'unsubscribe':
        setSelectedAction(category);
        setShowUnsubscribeModal(true);
        break;
      default:
        break;
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedToday = tasks.filter(t => {
    if (t.status !== 'completed' || !t.completedAt) return false;
    const completedDate = new Date(t.completedAt);
    const today = new Date();
    return completedDate.toDateString() === today.toDateString();
  });

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Zap className="w-8 h-8 text-purple-600" />
          AI Productivity Hub
        </h1>
        <p className="text-gray-600">
          🧠 Smart email cleanup • Intelligent task scheduling • Premium AI tools
        </p>
      </div>

      {/* Inbox Health Score Card */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="text-2xl">📊</div>
              <h2 className="text-xl font-bold text-gray-800">Inbox Health Score</h2>
            </div>
            <p className="text-sm text-gray-600">Based on email organization.</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-5xl font-bold text-gray-800">{healthScore}</span>
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-semibold">6 today</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1 justify-end">
              <TrendingUp className="w-3 h-3" />
              <span>Better than yesterday</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-500 rounded-full"
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <span className="font-semibold text-gray-800">Excellent!</span>
          </div>
          <span className="text-sm text-gray-600">{stats.total || 0} total emails</span>
        </div>
      </div>

      {/* Two Column Layout: Email + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* LEFT: Email Cleanup */}
        <div className="space-y-4">
          {/* Clean My Inbox Button */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-4 px-6 font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6" />
                <span>Clean My Inbox</span>
              </div>
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-center text-sm text-gray-600 mt-3">
              Unsubscribe, archive, and delete in one go
            </p>
          </div>

          {/* Category Stats */}
          <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Email Categories
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onCategoryClick?.('primary')}
                className="bg-yellow-50 hover:bg-yellow-100 rounded-xl p-4 border border-yellow-200 transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                  <span className="font-semibold text-sm text-gray-800">Primary</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">{stats.primary || 0}</div>
              </button>

              <button
                onClick={() => onCategoryClick?.('promotions')}
                className="bg-orange-50 hover:bg-orange-100 rounded-xl p-4 border border-orange-200 transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🎁</span>
                  <span className="font-semibold text-sm text-gray-800">Promos</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">{stats.promotions || 0}</div>
              </button>

              <button
                onClick={() => onCategoryClick?.('social')}
                className="bg-blue-50 hover:bg-blue-100 rounded-xl p-4 border border-blue-200 transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">👥</span>
                  <span className="font-semibold text-sm text-gray-800">Social</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">{stats.social || 0}</div>
              </button>

              <button
                onClick={() => onCategoryClick?.('updates')}
                className="bg-green-50 hover:bg-green-100 rounded-xl p-4 border border-green-200 transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">📰</span>
                  <span className="font-semibold text-sm text-gray-800">Updates</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">{stats.updates || 0}</div>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Auto Planner */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-md p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-800">Auto Planner</h3>
              </div>
              <button
                onClick={() => onNavigate?.('auto-planner')} // ✅ FIXED: Use prop function
                className="text-purple-600 hover:text-purple-700 font-semibold text-sm flex items-center gap-1"
              >
                Open Full Planner
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Task Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-indigo-600">{pendingTasks.length}</div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{todaySchedule.length}</div>
                <div className="text-xs text-gray-600">Scheduled</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">{completedToday.length}</div>
                <div className="text-xs text-gray-600">Done Today</div>
              </div>
            </div>

            {/* Today's Schedule Preview */}
            {loadingTasks ? (
              <div className="text-center py-4 text-gray-500">
                <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" />
                <p className="text-sm">Loading schedule...</p>
              </div>
            ) : todaySchedule.length > 0 ? (
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-semibold text-gray-700">Today's Schedule:</h4>
                {todaySchedule.slice(0, 3).map(task => (
                  <div key={task._id} className="bg-white rounded-lg p-3 border border-purple-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-purple-700">
                        {new Date(task.scheduledTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{task.title}</p>
                    <p className="text-xs text-gray-600">{task.estimatedDuration}m</p>
                  </div>
                ))}
                {todaySchedule.length > 3 && (
                  <p className="text-xs text-center text-purple-600 font-semibold">
                    +{todaySchedule.length - 3} more tasks
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No schedule yet</p>
                <p className="text-xs">Create tasks to get started</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate?.('auto-planner')} // ✅ FIXED
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 px-4 font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Task
              </button>
              <button
                onClick={() => onNavigate?.('auto-planner')} // ✅ FIXED
                className="bg-white hover:bg-gray-50 text-purple-600 border-2 border-purple-600 rounded-lg py-2 px-4 font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Generate Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
          <h3 className="text-lg font-bold text-gray-800">Achievements Unlocked!</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.junk === 0 && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <h4 className="font-bold text-gray-800">Junk-Free! 🎉</h4>
              </div>
              <p className="text-sm text-gray-600">No spam in inbox</p>
            </div>
          )}

          {stats.promotions < 50 && stats.promotions > 0 && (
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-5 border border-pink-200">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-8 h-8 text-pink-600" />
                <h4 className="font-bold text-gray-800">Promo Control 📬</h4>
              </div>
              <p className="text-sm text-gray-600">Under 50 promotions</p>
            </div>
          )}

          {healthScore >= 80 && (
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 border border-yellow-200">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-8 h-8 text-yellow-600" />
                <h4 className="font-bold text-gray-800">Healthy Inbox 💪</h4>
              </div>
              <p className="text-sm text-gray-600">Score: {healthScore}/100</p>
            </div>
          )}

          {completedToday.length >= 5 && (
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-8 h-8 text-purple-600" />
                <h4 className="font-bold text-gray-800">Task Master! ⚡</h4>
              </div>
              <p className="text-sm text-gray-600">5+ tasks completed today</p>
            </div>
          )}

          {stats.total === 0 && (
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-8 h-8 text-indigo-600" />
                <h4 className="font-bold text-gray-800">Inbox Zero! 🏆</h4>
              </div>
              <p className="text-sm text-gray-600">Perfect inbox!</p>
            </div>
          )}
        </div>

        {stats.junk > 0 && stats.promotions >= 50 && healthScore < 80 && completedToday.length < 5 && stats.total > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">🎯 Keep working to unlock achievements!</p>
            <p className="text-sm text-gray-400 mt-2">
              Clean your inbox and complete tasks to earn badges
            </p>
          </div>
        )}
      </div>

      {/* Unsubscribe Modal */}
      {showUnsubscribeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Confirm Bulk Action</h3>
              <button
                onClick={() => setShowUnsubscribeModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-lg font-semibold text-gray-800 mb-4">
                <span className="font-bold">Unsubscribe</span> from {stats.promotions || 0} Promotions?
              </p>

              <div className="mb-4">
                <p className="font-semibold text-gray-700 mb-2">Top Senders:</p>
                <ol className="space-y-2">
                  {getTopSenders().map((sender, index) => (
                    <li key={index} className="flex items-center justify-between text-gray-700">
                      <span className="font-medium">{index + 1}. {sender.name}</span>
                      <span className="text-gray-500">{sender.count}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirmUnsubscribe}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 px-4 font-semibold transition-all"
              >
                Unsubscribe All
              </button>
              <button
                onClick={() => {
                  const categoryEmails = emails.filter(e => e.category?.toLowerCase() === 'promotions');
                  const emailIds = categoryEmails.map(e => e.id);
                  onBulkArchive?.(emailIds);
                  setShowUnsubscribeModal(false);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg py-3 px-4 font-semibold transition-all"
              >
                Archive Instead
              </button>
              <button
                onClick={() => setShowUnsubscribeModal(false)}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg py-3 px-4 font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}