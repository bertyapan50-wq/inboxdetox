import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import AppLayout from './AppLayout';
import InboxView from './email/InboxView';
import ArchiveView from './email/ArchiveView';
import SentView from './email/SentView';
import DraftsView from './email/DraftsView';
import LabelManager from './LabelManager';
import FollowUpManager from './FollowUpManager';
import EmailViewer from './EmailViewer';
import AIInsights from './AIInsights';

// ============================================
// DASHBOARD VIEW COMPONENT
// ============================================
const DashboardView = () => {
  const navigate = useNavigate();
  
  const [stats] = useState({
    total: 1247,
    unread: 99,
    cleaned: 234,
    timeSaved: '2.5 hrs'
  });

  const activityData = [
    { day: 'Mon', emails: 45 },
    { day: 'Tue', emails: 89 },
    { day: 'Wed', emails: 67 },
    { day: 'Thu', emails: 52 },
    { day: 'Fri', emails: 103 },
    { day: 'Sat', emails: 125 },
    { day: 'Sun', emails: 145 }
  ];

  const categoryData = [
    { name: 'Primary', value: 40, color: '#3b82f6' },
    { name: 'Promotions', value: 35, color: '#10b981' },
    { name: 'Updates', value: 15, color: '#f59e0b' },
    { name: 'Social', value: 7, color: '#8b5cf6' },
    { name: 'Junk', value: 3, color: '#ef4444' }
  ];

  const topSenders = [
    { name: 'jobstreet.com', count: 45 },
    { name: 'facebook.com', count: 23 },
    { name: 'socialbee.com', count: 18 },
    { name: 'noreply@fing', count: 15 }
  ];

  const recentActivity = [
    { icon: '🗑️', action: 'Deleted 12 promotional emails', time: '2m ago' },
    { icon: '📦', action: 'Archived 45 newsletters', time: '15m ago' },
    { icon: '✨', action: 'AI cleaned 67 emails', time: '1h ago' },
    { icon: '🏷️', action: 'Added label "Important"', time: '2h ago' },
    { icon: '✅', action: 'Marked 8 emails as read', time: '3h ago' }
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-900">📊 Dashboard</h2>
        <p className="text-gray-600 mt-1">👋 Welcome back! Here's your email overview for today</p>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '📧', label: 'Total', value: stats.total.toLocaleString(), subtitle: 'emails' },
              { icon: '📬', label: 'Unread', value: stats.unread, subtitle: 'emails' },
              { icon: '🗑️', label: 'Cleaned', value: stats.cleaned, subtitle: 'this week' },
              { icon: '⏱️', label: 'Saved', value: stats.timeSaved, subtitle: 'this month' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-sm text-gray-500 mb-1">{stat.label}</div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.subtitle}</div>
              </div>
            ))}
          </div>

          {/* Email Activity Chart */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 EMAIL ACTIVITY (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="emails" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Actions & Top Senders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 QUICK ACTIONS</h3>
              <div className="space-y-3">
                {[
                  { icon: '🧹', label: 'Clean Inbox Now', path: 'inbox' },
                  { icon: '✨', label: 'View Suggestions', path: 'suggestions' },
                  { icon: '📊', label: 'AI Insights', path: 'ai-insights' },
                  { icon: '🔍', label: 'Smart Filters', path: 'filters' }
                ].map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(`/${action.path}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg transition-all border border-blue-200"
                  >
                    <span className="text-xl">{action.icon}</span>
                    <span className="font-medium text-gray-700">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Top Senders */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📧 TOP SENDERS</h3>
              <div className="space-y-4">
                {topSenders.map((sender, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-gray-700">{sender.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{sender.count} emails</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏷️ CATEGORY BREAKDOWN</h3>
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="w-64 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-3">
                {categoryData.map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: cat.color }}></div>
                    <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                    <span className="text-sm text-gray-500">({cat.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 RECENT ACTIVITY</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{activity.icon}</span>
                    <span className="text-gray-700">{activity.action}</span>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN AUTHENTICATED DASHBOARD COMPONENT
// ============================================
const AuthenticatedDashboard = ({
  setIsLabelModalOpen,
  setIsFollowUpModalOpen,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const currentPath = location.pathname.split('/').pop() || 'dashboard';

  return (
    <AppLayout
      currentView={currentPath}
      setCurrentView={(view) => navigate(`/${view}`)}
      onOpenLabels={() => setIsLabelModalOpen(true)}
      onOpenFollowUps={() => setIsFollowUpModalOpen(true)}
    >
      <Routes>
        {/* Default redirect to dashboard */}
        <Route path="/" element={<Navigate to="dashboard" replace />} />

        {/* MAIN DASHBOARD */}
        <Route path="dashboard" element={<DashboardView />} />

        {/* EMAIL VIEWS */}
        <Route path="inbox" element={<InboxView />} />
        <Route path="archive" element={<ArchiveView />} />
        <Route path="sent" element={<SentView />} />
        <Route path="drafts" element={<DraftsView />} />

        {/* AI TOOLS */}
        <Route path="ai-insights" element={<AIInsights />} />
        <Route path="suggestions" element={
          <div className="p-8">
            <h2 className="text-2xl font-bold">✨ AI Suggestions</h2>
            <p className="text-gray-600 mt-2">Coming soon...</p>
          </div>
        } />
        <Route path="cleanup" element={
          <div className="p-8">
            <h2 className="text-2xl font-bold">🧹 Smart Cleanup</h2>
            <p className="text-gray-600 mt-2">Coming soon...</p>
          </div>
        } />
        <Route path="filters" element={
          <div className="p-8">
            <h2 className="text-2xl font-bold">🔍 Smart Filters</h2>
            <p className="text-gray-600 mt-2">Coming soon...</p>
          </div>
        } />
         
{/* NEW AI TOOL - AUTO PLANNER */}
<Route path="auto-planner" element={<AutoPlanner />} />

        {/* ORGANIZE */}
        <Route path="labels" element={<LabelManager />} />
        <Route path="followups" element={<FollowUpManager />} />
      </Routes>
    </AppLayout>
  );
};

export default AuthenticatedDashboard;