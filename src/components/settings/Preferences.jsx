import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Bell, 
  Mail, 
  Zap, 
  Shield, 
  Globe, 
  Save,
  RotateCcw,
  Check,
  Loader2,
  Moon,
  Sun,
  Monitor,
  Volume2,
  VolumeX
} from 'lucide-react';

export default function Preferences() {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/preferences', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setPreferences(data.preferences);
      } else {
        showMessage('Failed to load preferences', 'error');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      showMessage('Failed to load preferences', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ preferences })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPreferences(data.preferences);
        setHasChanges(false);
        showMessage('Preferences saved successfully!', 'success');
      } else {
        showMessage('Failed to save preferences', 'error');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      showMessage('Failed to save preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetPreferences = async () => {
    if (!window.confirm('Reset all preferences to default values?')) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/settings/preferences/reset', {
        method: 'POST',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPreferences(data.preferences);
        setHasChanges(false);
        showMessage('Preferences reset to defaults', 'success');
      }
    } catch (error) {
      console.error('Error resetting preferences:', error);
      showMessage('Failed to reset preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-gray-600">Loading preferences...</span>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load preferences</p>
      </div>
    );
  }

  return (
   <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Settings className="w-7 h-7 text-indigo-600" />
              Preferences
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Customize your email management experience
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={resetPreferences}
              disabled={saving}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={savePreferences}
              disabled={!hasChanges || saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`rounded-lg p-4 flex items-center gap-3 animate-in slide-in-from-top duration-300 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <Check className="w-5 h-5" />
          {message.text}
        </div>
      )}

      {/* Appearance Settings */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Monitor className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Appearance</h2>
            <p className="text-sm text-gray-600">Customize how your inbox looks</p>
          </div>
        </div>

        <div className="space-y-6 animate-in fade-in duration-300 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
          {/* Theme */}
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <label className="font-medium text-gray-800">Theme</label>
              <p className="text-sm text-gray-600">Choose your preferred color scheme</p>
            </div>
            <div className="flex gap-2">
              {[
                { value: 'light', icon: Sun, label: 'Light' },
                { value: 'dark', icon: Moon, label: 'Dark' },
                { value: 'auto', icon: Monitor, label: 'Auto' }
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => updatePreference('theme', value)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    preferences.theme === value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Compact Mode */}
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <label className="font-medium text-gray-800">Compact Mode</label>
              <p className="text-sm text-gray-600">Show more emails on screen</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.compactMode}
                onChange={(e) => updatePreference('compactMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Show Email Previews */}
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <label className="font-medium text-gray-800">Email Previews</label>
              <p className="text-sm text-gray-600">Show snippet of email content</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.showEmailPreviews}
                onChange={(e) => updatePreference('showEmailPreviews', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Emails Per Page */}
          <div className="flex items-center justify-between py-3">
            <div>
              <label className="font-medium text-gray-800">Emails Per Page</label>
              <p className="text-sm text-gray-600">Number of emails to display</p>
            </div>
            <select
              value={preferences.emailsPerPage}
              onChange={(e) => updatePreference('emailsPerPage', parseInt(e.target.value))}
              className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 cursor-pointer"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-100 p-2 rounded-lg">
            <Bell className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
            <p className="text-sm text-gray-600">Manage how you get notified</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <label className="font-medium text-gray-800">Email Notifications</label>
              <p className="text-sm text-gray-600">Receive email updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => updatePreference('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <label className="font-medium text-gray-800">Desktop Notifications</label>
              <p className="text-sm text-gray-600">Browser notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.desktopNotifications}
                onChange={(e) => updatePreference('desktopNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <label className="font-medium text-gray-800">Sound</label>
              <p className="text-sm text-gray-600">Play sound for new emails</p>
            </div>
            <button
              onClick={() => updatePreference('soundEnabled', !preferences.soundEnabled)}
              className={`p-2 rounded-lg transition-all ${
                preferences.soundEnabled
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {preferences.soundEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <label className="font-medium text-gray-800">Priority Emails Only</label>
              <p className="text-sm text-gray-600">Notify only for important emails</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.priorityEmailsOnly}
                onChange={(e) => updatePreference('priorityEmailsOnly', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <label className="font-medium text-gray-800">Digest Frequency</label>
              <p className="text-sm text-gray-600">Summary email schedule</p>
            </div>
            <select
              value={preferences.digestFrequency}
              onChange={(e) => updatePreference('digestFrequency', e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 cursor-pointer"
            >
              <option value="never">Never</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Email Processing */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Email Processing</h2>
            <p className="text-sm text-gray-600">Automate email management</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <label className="font-medium text-gray-800">Auto-Archive Read Emails</label>
              <p className="text-sm text-gray-600">Move old read emails to archive</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.autoArchiveRead}
                onChange={(e) => updatePreference('autoArchiveRead', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {preferences.autoArchiveRead && (
            <div className="flex items-center justify-between py-3 border-b bg-blue-50 rounded-lg px-4">
              <div>
                <label className="font-medium text-gray-800">Auto-Archive After</label>
                <p className="text-sm text-gray-600">Days before archiving</p>
              </div>
              <select
                value={preferences.autoArchiveDays}
                onChange={(e) => updatePreference('autoArchiveDays', parseInt(e.target.value))}
                className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 cursor-pointer"
              >
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <label className="font-medium text-gray-800">Smart Categorization</label>
              <p className="text-sm text-gray-600">Auto-categorize emails</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.smartCategorization}
                onChange={(e) => updatePreference('smartCategorization', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <label className="font-medium text-gray-800">Auto-Label Important</label>
              <p className="text-sm text-gray-600">Label high-priority emails</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.autoLabelImportant}
                onChange={(e) => updatePreference('autoLabelImportant', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <label className="font-medium text-gray-800">Spam Filter Level</label>
              <p className="text-sm text-gray-600">Aggressiveness of spam detection</p>
            </div>
            <select
              value={preferences.spamFilterLevel}
              onChange={(e) => updatePreference('spamFilterLevel', e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 cursor-pointer"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI Features */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Zap className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">AI Features</h2>
            <p className="text-sm text-gray-600">Smart assistance powered by AI</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <label className="font-medium text-gray-800">AI Insights</label>
              <p className="text-sm text-gray-600">Get AI-powered email insights</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.aiInsightsEnabled}
                onChange={(e) => updatePreference('aiInsightsEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <label className="font-medium text-gray-800">Smart Reply Suggestions</label>
              <p className="text-sm text-gray-600">AI-suggested replies</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.autoSuggestReplies}
                onChange={(e) => updatePreference('autoSuggestReplies', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <label className="font-medium text-gray-800">Smart Filters</label>
              <p className="text-sm text-gray-600">AI-powered email filtering</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.smartFiltersEnabled}
                onChange={(e) => updatePreference('smartFiltersEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <label className="font-medium text-gray-800">AI Summary Length</label>
              <p className="text-sm text-gray-600">Length of AI-generated summaries</p>
            </div>
            <select
              value={preferences.aiSummaryLength}
              onChange={(e) => updatePreference('aiSummaryLength', e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 cursor-pointer"
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-100 p-2 rounded-lg">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Privacy</h2>
            <p className="text-sm text-gray-600">Control your data and privacy</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <label className="font-medium text-gray-800">Share Analytics</label>
              <p className="text-sm text-gray-600">Help improve our service</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.shareAnalytics}
                onChange={(e) => updatePreference('shareAnalytics', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <label className="font-medium text-gray-800">Email Tracking</label>
              <p className="text-sm text-gray-600">Track email opens</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailTracking}
                onChange={(e) => updatePreference('emailTracking', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <label className="font-medium text-gray-800">Read Receipts</label>
              <p className="text-sm text-gray-600">Send read receipts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.readReceipts}
                onChange={(e) => updatePreference('readReceipts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Language & Region */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-cyan-100 p-2 rounded-lg">
            <Globe className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Language & Region</h2>
            <p className="text-sm text-gray-600">Localization settings</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <label className="font-medium text-gray-800">Language</label>
              <p className="text-sm text-gray-600">Interface language</p>
            </div>
            <select
              value={preferences.language}
              onChange={(e) => updatePreference('language', e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 cursor-pointer"
            >
              <option value="en">English</option>
              <option value="tl">Tagalog</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <label className="font-medium text-gray-800">Timezone</label>
              <p className="text-sm text-gray-600">Your local timezone</p>
            </div>
            <select
              value={preferences.timezone}
              onChange={(e) => updatePreference('timezone', e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 cursor-pointer"
            >
              <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
              <option value="America/New_York">America/New York (GMT-5)</option>
              <option value="Europe/London">Europe/London (GMT+0)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <label className="font-medium text-gray-800">Date Format</label>
              <p className="text-sm text-gray-600">How dates are displayed</p>
            </div>
            <select
              value={preferences.dateFormat}
              onChange={(e) => updatePreference('dateFormat', e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 cursor-pointer"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <label className="font-medium text-gray-800">Time Format</label>
              <p className="text-sm text-gray-600">12-hour or 24-hour</p>
            </div>
            <select
              value={preferences.timeFormat}
              onChange={(e) => updatePreference('timeFormat', e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 cursor-pointer"
            >
              <option value="12h">12-hour (3:00 PM)</option>
              <option value="24h">24-hour (15:00)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Changes Footer */}
      {hasChanges && (
        <div className="sticky bottom-4 bg-indigo-600 text-white rounded-xl shadow-2xl p-4 flex items-center justify-between animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">You have unsaved changes</p>
              <p className="text-sm text-indigo-100">Don't forget to save your preferences</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadPreferences}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
            >
              Discard
            </button>
            <button
              onClick={savePreferences}
              disabled={saving}
              className="px-6 py-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}