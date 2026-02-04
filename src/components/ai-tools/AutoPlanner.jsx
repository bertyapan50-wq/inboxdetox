import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Zap, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Loader,
  X,
  Trash2
} from 'lucide-react';
import planningApiService from '../../services/planningApi';
console.log('planningApiService:', planningApiService); // Add this
console.log('getTasks:', planningApiService.getTasks); // Add this
console.log('getTodaySchedule:', planningApiService.getTodaySchedule); // Add this

const AutoPlanner = () => {
  const [tasks, setTasks] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    priority: 'medium', 
    estimatedDuration: 60 
  });
  const [error, setError] = useState(null);

// ✅ ADD THESE NEW STATES:
const [aiInsights, setAiInsights] = useState(null);
const [showInsights, setShowInsights] = useState(false);

  // 🔥 Auto-fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
    fetchTodaySchedule();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await planningApiService.getTasks();
      
      if (response.success) {
        setTasks(response.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaySchedule = async () => {
    try {
      const response = await planningApiService.getTodaySchedule();
      
      if (response.success) {
        setSchedule(response.tasks);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await planningApiService.createTask(newTask);
      
      if (response.success) {
        // ✅ Add new task to state
        setTasks([response.task, ...tasks]);
        setShowTaskForm(false);
        setNewTask({ title: '', description: '', priority: 'medium', estimatedDuration: 60 });
        
        // Show success message
        alert('✅ Task created successfully!');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('❌ Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
  try {
    setGenerating(true);
    setError(null); // Clear previous errors
    
    const response = await planningApiService.generatePlan(new Date().toISOString());
    
    if (response.success) {
      // ✅ NEW: Store AI insights
      if (response.reasoning) {
        setAiInsights(response.reasoning);
        setShowInsights(true);
      }
      
      const scheduledCount = response.schedule?.length || 0;
      const unscheduledCount = response.stats?.unscheduled || 0;
      
      let message = `✅ Plan generated! Scheduled ${scheduledCount} task${scheduledCount !== 1 ? 's' : ''}`;
      
      if (unscheduledCount > 0) {
        message += `. ${unscheduledCount} task${unscheduledCount !== 1 ? 's' : ''} couldn't fit today.`;
      }
      
      alert(message);
      
      // Refresh tasks and schedule
      await fetchTasks();
      await fetchTodaySchedule();
    }
  } catch (error) {
    console.error('Error generating plan:', error);
    setError('Failed to generate plan. Please try again.');
    alert('❌ Failed to generate plan. Please try again.');
  } finally {
    setGenerating(false);
  }
};
const handleDeleteTask = async (taskId) => {
  if (!window.confirm('Are you sure you want to delete this task?')) {
    return;
  }
  
  try {
    const response = await planningApiService.deleteTask(taskId);
    
    if (response.success) {
      // ✅ Remove from state
      setTasks(tasks.filter(t => t._id !== taskId));
      setSchedule(schedule.filter(t => t._id !== taskId));
      alert('✅ Task deleted');
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    alert('❌ Failed to delete task');
  }
};
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  
  const completionRate = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;

  if (loading && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
<div className="mb-8">
  <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
    <Calendar className="w-10 h-10 text-indigo-600" />
    Auto Planner
  </h1>
  <p className="text-gray-600">
    🧠 Intelligent daily scheduling • Smart task optimization • Learn from your patterns
  </p>
</div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500">
            <div className="text-sm text-gray-600 mb-1">Pending Tasks</div>
            <div className="text-3xl font-bold text-gray-800">{pendingTasks.length}</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="text-sm text-gray-600 mb-1">Scheduled Today</div>
            <div className="text-3xl font-bold text-gray-800">{scheduledTasks.length}</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="text-sm text-gray-600 mb-1">Work Hours</div>
            <div className="text-xl font-bold text-gray-800">09:00 - 17:00</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="text-sm text-gray-600 mb-1">Completion Rate</div>
            <div className="text-3xl font-bold text-gray-800">{completionRate}%</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowTaskForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Task
          </button>
          
          <button
            onClick={handleGeneratePlan}
            disabled={generating || pendingTasks.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Generate Daily Plan
              </>
            )}
          </button>

          <button
            onClick={fetchTasks}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all"
          >
            <Loader className="w-5 h-5" />
            Refresh
          </button>
        </div>

         {/* Info Banner */}
{pendingTasks.length === 0 && scheduledTasks.length === 0 && tasks.length === 0 && (
  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6 flex items-start gap-4">
    <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
    <div>
      <h3 className="font-semibold text-blue-900 mb-1">Get Started with Smart Auto Planner</h3>
      <p className="text-blue-700 text-sm">
        Create some tasks, then click "Generate Daily Plan" to let our intelligent algorithm automatically schedule your day. 
        The system analyzes task types, energy levels, and optimal timing to create a smart schedule that maximizes your productivity.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
          🧠 Smart task analysis
        </span>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
          ⚡ Energy-aware scheduling
        </span>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
          🎯 Priority optimization
        </span>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
          📊 Pattern learning
        </span>
      </div>
    </div>
  </div>
)}
{/* AI Insights Panel */}
{showInsights && aiInsights && (
  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-6 mb-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">🧠 AI Schedule Insights</h3>
          <p className="text-sm text-gray-600">Smart scheduling analysis</p>
        </div>
      </div>
      <button
        onClick={() => setShowInsights(false)}
        className="text-gray-400 hover:text-gray-600"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
    
    {/* Summary */}
    <div className="bg-white rounded-xl p-4 mb-4">
      <p className="text-gray-700 leading-relaxed">{aiInsights.summary}</p>
    </div>
    
    {/* Insights List */}
    {aiInsights.insights && aiInsights.insights.length > 0 && (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Optimizations:</h4>
        {aiInsights.insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-2 bg-white rounded-lg p-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">{insight}</p>
          </div>
        ))}
      </div>
    )}
    
    {/* Task Type Breakdown */}
    {aiInsights.taskTypeBreakdown && Object.keys(aiInsights.taskTypeBreakdown).length > 0 && (
      <div className="mt-4 pt-4 border-t border-purple-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Task Analysis:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(aiInsights.taskTypeBreakdown).map(([type, count]) => (
            <div key={type} className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">{count}</div>
              <div className="text-xs text-gray-600 capitalize">{type.replace('_', ' ')}</div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Pending Tasks */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-600" />
              Pending Tasks ({pendingTasks.length})
            </h3>
            
            {pendingTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No pending tasks</p>
                <p className="text-sm">Create a task to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map(task => (
                  <div
                    key={task._id}
                    className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-indigo-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-gray-800 flex-1">{task.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority.toUpperCase()}
                        </span>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    )}
                    
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.estimatedDuration}m
                      </span>
                      {task.deadline && (
                        <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Today's Schedule */}
<div className="bg-white rounded-2xl shadow-lg p-6">
  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
    <Calendar className="w-6 h-6 text-green-600" />
    Today's Schedule ({schedule.length})
  </h3>
  
  {schedule.length === 0 ? (
    <div className="text-center py-12 text-gray-400">
      <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
      <p>No schedule yet</p>
      <p className="text-sm">Generate a plan to see your schedule</p>
    </div>
  ) : (
    <div className="space-y-3">
      {schedule.map(task => (
        <div
          key={task._id}
          className="p-4 bg-green-50 rounded-lg border-2 border-green-200 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <div className="text-sm font-bold text-green-700 mb-1">
                {new Date(task.scheduledTime).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <h4 className="font-semibold text-gray-800">{task.title}</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                task.priority === 'high' ? 'bg-red-100 text-red-700' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {task.priority?.toUpperCase()}
              </span>
              <span className="text-xs text-gray-600">
                {task.estimatedDuration}m
              </span>
              <button
                onClick={() => handleDeleteTask(task._id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {task.description && (
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          )}
          
          {task.reasoning && (
            <div className="mt-2 pt-2 border-t border-green-200">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 italic">{task.reasoning}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )}
</div>
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Create Task</h3>
              <button
                onClick={() => setShowTaskForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  rows="3"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    value={newTask.estimatedDuration}
                    onChange={(e) => setNewTask({...newTask, estimatedDuration: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                    min="15"
                    step="15"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoPlanner;