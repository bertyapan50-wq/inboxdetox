import React from 'react';
import { Clock, CheckCircle, Trash2, AlertCircle } from 'lucide-react';

const TimelineView = ({ tasks, onTaskClick, onComplete, onDelete }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-green-600" />
          Today's Schedule
        </h3>
        <div className="text-center py-16 text-gray-400">
          <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No tasks scheduled yet</p>
          <p className="text-sm">Generate a daily plan to see your schedule here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Clock className="w-6 h-6 text-green-600" />
        Today's Schedule ({tasks.length} tasks)
      </h3>
      
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {tasks.map((task, index) => {
          const scheduledTime = task.scheduledTime || `${9 + index}:00`;
          const isCompleted = task.status === 'completed';
          
          return (
            <div
              key={task._id || index}
              className={`p-4 rounded-lg border-2 transition-all ${
                isCompleted 
                  ? 'bg-gray-50 border-gray-300 opacity-60' 
                  : 'bg-green-50 border-green-300 hover:border-green-400 cursor-pointer'
              }`}
              onClick={() => !isCompleted && onTaskClick && onTaskClick(task)}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-green-700">
                      {scheduledTime}
                    </span>
                    {task.priority && (
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {task.priority.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h4 className={`font-semibold ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.estimatedDuration || 60}m
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                {!isCompleted && onComplete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onComplete(task._id);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-all"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Complete
                  </button>
                )}
                
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(task._id);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                )}
              </div>
              
              {task.deadline && (
                <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                  <AlertCircle className="w-3 h-3" />
                  Deadline: {new Date(task.deadline).toLocaleDateString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineView;