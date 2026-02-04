import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import SuggestionCard from './SuggestionCard';

function SuggestionsView() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('💡 Loading AI suggestions...');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/email/analyze`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('✅ Suggestions loaded:', data);
      
      if (data.success) {
        setSuggestions(data.suggestions || []);
        setCompletedCount(0);
      } else {
        throw new Error(data.error || 'Failed to load suggestions');
      }
    } catch (err) {
      console.error('❌ Error loading suggestions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const handleComplete = (emailId) => {
    setSuggestions(prev => prev.filter(s => s.id !== emailId));
    setCompletedCount(prev => prev + 1);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
  
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg border p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">AI Suggestions</h2>
              <p className="text-purple-100 text-sm">
                {loading ? 'Analyzing your inbox...' : 
                 suggestions.length > 0 ? `${suggestions.length} emails need your attention` : 
                 'All caught up! 🎉'}
              </p>
            </div>
          </div>
          
          <button
            onClick={loadSuggestions}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats */}
        {completedCount > 0 && (
          <div className="mt-4 flex items-center space-x-2 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>{completedCount} suggestions completed today</span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-lg border p-12 text-center">
          <Loader className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 font-medium">Analyzing your emails with AI...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a few seconds</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-900">Error loading suggestions</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={loadSuggestions}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && suggestions.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg border p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up! 🎉</h3>
          <p className="text-gray-500">
            No urgent emails right now. Check back later for new suggestions.
          </p>
          <button
            onClick={loadSuggestions}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Check Again
          </button>
        </div>
      )}

      {/* Suggestions List */}
      {!loading && !error && suggestions.length > 0 && (
        <div className="space-y-4 flex flex-col h-full overflow-hidden">
          {suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onComplete={handleComplete}
              priorityColor={getPriorityColor(suggestion.priority)}
              priorityIcon={getPriorityIcon(suggestion.priority)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SuggestionsView;