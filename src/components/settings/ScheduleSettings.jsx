import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Zap, Save, X, History, AlertCircle } from 'lucide-react';

const ScheduleSettings = ({ onClose }) => {
  const [schedule, setSchedule] = useState({
    enabled: false,
    type: 'weekly',
    time: '09:00',
    dayOfWeek: 1,
    dayOfMonth: 1,
    confidenceLevel: 'high',
    categories: [],
    action: 'archive'
  });

  const [loading, setLoading] = useState(false);
  const [existingSchedule, setExistingSchedule] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadSchedule();
    loadHistory();
  }, []);

  const loadSchedule = async () => {
    try {
      const response = await fetch('/api/schedule/get', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.schedule) {
          setExistingSchedule(data.schedule);
          setSchedule({
            enabled: data.schedule.is_active,
            type: data.schedule.schedule_type,
            time: data.schedule.time,
            dayOfWeek: data.schedule.day_of_week || 1,
            dayOfMonth: data.schedule.day_of_month || 1,
            confidenceLevel: data.schedule.confidence_level,
            categories: data.schedule.categories || [],
            action: data.schedule.action
          });
        }
      }
    } catch (error) {
      console.error('Failed to load schedule:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/schedule/history', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/schedule/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(schedule)
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message}`);
        onClose();
      } else {
        throw new Error(data.error || 'Failed to save schedule');
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSchedulePreview = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    if (schedule.type === 'daily') {
      return `Every day at ${schedule.time}`;
    } else if (schedule.type === 'weekly') {
      return `Every ${days[schedule.dayOfWeek]} at ${schedule.time}`;
    } else {
      return `Day ${schedule.dayOfMonth} of every month at ${schedule.time}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white sticky top-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Auto-Cleanup Schedule
              </h2>
              <p className="text-purple-100 mt-1">Set it and forget it! 🚀</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-bold text-gray-800">Enable Auto-Cleanup</h3>
              <p className="text-sm text-gray-600">Automatically clean your inbox on schedule</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={schedule.enabled}
                onChange={(e) => setSchedule({ ...schedule, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {schedule.enabled && (
            <>
              {/* Frequency */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Frequency
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['daily', 'weekly', 'monthly'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSchedule({ ...schedule, type })}
                      className={`p-3 rounded-lg border-2 font-medium capitalize transition-all ${
                        schedule.type === type
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-300 text-gray-700 hover:border-purple-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Time
                </label>
                <input
                  type="time"
                  value={schedule.time}
                  onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Day Selector */}
              {schedule.type === 'weekly' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Day of Week
                  </label>
                  <select
                    value={schedule.dayOfWeek}
                    onChange={(e) => setSchedule({ ...schedule, dayOfWeek: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  >
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </select>
                </div>
              )}

              {schedule.type === 'monthly' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Day of Month
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={schedule.dayOfMonth}
                    onChange={(e) => setSchedule({ ...schedule, dayOfMonth: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Confidence Level */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Only Clean Emails With
                </label>
                <select
                  value={schedule.confidenceLevel}
                  onChange={(e) => setSchedule({ ...schedule, confidenceLevel: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="high">High Confidence Only (Safest)</option>
                  <option value="medium">Medium & High Confidence</option>
                  <option value="all">All Confidence Levels</option>
                </select>
              </div>

              {/* Action */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Action to Take
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSchedule({ ...schedule, action: 'archive' })}
                    className={`p-4 rounded-lg border-2 font-medium transition-all ${
                      schedule.action === 'archive'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:border-blue-400'
                    }`}
                  >
                    📦 Archive (Safer)
                  </button>
                  <button
                    onClick={() => setSchedule({ ...schedule, action: 'delete' })}
                    className={`p-4 rounded-lg border-2 font-medium transition-all ${
                      schedule.action === 'delete'
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-gray-300 text-gray-700 hover:border-red-400'
                    }`}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <h4 className="font-bold text-purple-900 mb-2">📅 Schedule Preview</h4>
                <p className="text-purple-800">{getSchedulePreview()}</p>
                <p className="text-sm text-purple-700 mt-1">
                  Action: {schedule.action === 'archive' ? 'Archive' : 'Delete'} emails with {schedule.confidenceLevel} confidence
                </p>
                {existingSchedule && existingSchedule.next_run && (
                  <p className="text-sm text-purple-600 mt-2">
                    ⏰ Next run: {new Date(existingSchedule.next_run).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Stats */}
              {existingSchedule && existingSchedule.total_runs > 0 && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <h4 className="font-bold text-green-900 mb-2">📊 Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-green-700">Total Runs</p>
                      <p className="text-2xl font-bold text-green-900">{existingSchedule.total_runs}</p>
                    </div>
                    <div>
                      <p className="text-green-700">Emails Processed</p>
                      <p className="text-2xl font-bold text-green-900">{existingSchedule.total_emails_processed}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* History Button */}
          {history.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-purple-500 transition-all flex items-center justify-center gap-2"
            >
              <History className="w-5 h-5" />
              <span>{showHistory ? 'Hide' : 'Show'} Execution History</span>
            </button>
          )}

          {/* History */}
          {showHistory && history.length > 0 && (
            <div className="border-2 border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
              <h4 className="font-bold text-gray-800 mb-3">Recent Executions</h4>
              <div className="space-y-2">
                {history.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                    <div>
                      <p className="font-medium text-gray-800">
                        {log.action_taken === 'archive' ? '📦 Archived' : '🗑️ Deleted'} {log.emails_processed} emails
                      </p>
                      <p className="text-gray-600 text-xs">
                        {new Date(log.executed_at).toLocaleString()}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-bold mb-1">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Cleanup runs automatically at the scheduled time</li>
                <li>You'll receive a notification after each cleanup</li>
                <li>You can always undo actions from your Gmail trash/archive</li>
                <li>High confidence = safest automated cleanup</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Schedule
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSettings;