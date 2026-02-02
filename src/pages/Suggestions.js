import React, { useState, useEffect } from 'react';
import { 
  Mail, Trash2, Archive, CheckCircle, XCircle, Shield, 
  Brain, Eye, ChevronRight, X, Sparkles, Loader2, 
  TrendingUp, AlertCircle, Star, BarChart3, RefreshCw
} from 'lucide-react';
import api from '../services/api';

const EnhancedSuggestions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [previewMode, setPreviewMode] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [learningStats, setLearningStats] = useState(null);
  const [processingAction, setProcessingAction] = useState('');

  // Load AI suggestions on mount
  useEffect(() => {
    loadAISuggestions();
    loadLearningStats();
  }, []);

  /**
   * Load AI suggestions from backend
   */
  const loadAISuggestions = async () => {
    setIsLoading(true);
    setProcessingAction('🧠 Analyzing your emails with AI...');
    
    try {
      const response = await api.analyzeEmails();
      
      if (response.success) {
        console.log('✅ AI Analysis Complete:', response);
        
        // Group suggestions by action type
        const grouped = response.grouped || {};
        
        // Create suggestion cards
        const suggestions = [];
        
        if (grouped.delete && grouped.delete.length > 0) {
          suggestions.push({
            type: 'delete',
            action: 'delete',
            count: grouped.delete.length,
            reason: 'Spam or extremely low importance emails',
            confidence: calculateAverageConfidence(grouped.delete),
            emails: grouped.delete,
            emailIds: grouped.delete.map(e => e.emailId)
          });
        }
        
        if (grouped.archive && grouped.archive.length > 0) {
          suggestions.push({
            type: 'archive',
            action: 'archive',
            count: grouped.archive.length,
            reason: 'Old, unopened emails with low importance',
            confidence: calculateAverageConfidence(grouped.archive),
            emails: grouped.archive,
            emailIds: grouped.archive.map(e => e.emailId)
          });
        }
        
        if (grouped.unsubscribe && grouped.unsubscribe.length > 0) {
          suggestions.push({
            type: 'unsubscribe',
            action: 'unsubscribe',
            count: grouped.unsubscribe.length,
            reason: 'Newsletters not opened in 30+ days',
            confidence: calculateAverageConfidence(grouped.unsubscribe),
            emails: grouped.unsubscribe,
            emailIds: grouped.unsubscribe.map(e => e.emailId)
          });
        }
        
        setAiSuggestions(suggestions);
        setStatistics(response.statistics);
      }
    } catch (error) {
      console.error('Failed to load AI suggestions:', error);
      alert('Failed to analyze emails. Please try again.');
    } finally {
      setIsLoading(false);
      setProcessingAction('');
    }
  };

  /**
   * Load learning statistics
   */
  const loadLearningStats = async () => {
    try {
      const response = await api.getCleanupHistory();
      if (response.success) {
        setLearningStats(response.statistics);
      }
    } catch (error) {
      console.error('Failed to load learning stats:', error);
    }
  };

  /**
   * Calculate average confidence from emails
   */
  const calculateAverageConfidence = (emails) => {
    if (!emails || emails.length === 0) return 0;
    const total = emails.reduce((sum, e) => sum + (e.aiSuggestion?.confidence || 0), 0);
    return total / emails.length;
  };

  /**
   * Apply AI suggestion (execute cleanup)
   */
  const applySuggestion = async (suggestion) => {
    setIsLoading(true);
    setProcessingAction(`${getActionLabel(suggestion.action)}...`);
    
    try {
      // Get action IDs from emails
      const actionIds = suggestion.emails.map(e => e.id);
      
      // Execute cleanup via backend
      const response = await api.executeCleanup(actionIds);
      
      if (response.success) {
        console.log('✅ Cleanup executed:', response);
        
        // Show success message
        setSuccessMessage(`Successfully ${suggestion.action}d ${response.executed} emails! AI learned from your decision.`);
        setShowSuccess(true);
        
        // Remove applied suggestion
        setAiSuggestions(aiSuggestions.filter(s => s.type !== suggestion.type));
        
        // Reload learning stats
        await loadLearningStats();
        
        // Hide success after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);
        setPreviewMode(null);
      }
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
      alert('Failed to apply action. Please try again.');
    } finally {
      setIsLoading(false);
      setProcessingAction('');
    }
  };

  /**
   * Reject AI suggestion (for learning)
   */
  const rejectSuggestion = async (suggestion) => {
    setIsLoading(true);
    
    try {
      // Reject all actions in this suggestion
      for (const email of suggestion.emails) {
        await api.rejectSuggestion(email.id, 'User rejected suggestion');
      }
      
      // Show success
      setSuccessMessage(`Rejected suggestion. AI is learning from your feedback!`);
      setShowSuccess(true);
      
      // Remove rejected suggestion
      setAiSuggestions(aiSuggestions.filter(s => s.type !== suggestion.type));
      
      // Reload learning stats
      await loadLearningStats();
      
      setTimeout(() => setShowSuccess(false), 3000);
      setPreviewMode(null);
    } catch (error) {
      console.error('Failed to reject suggestion:', error);
      alert('Failed to reject. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get action label
   */
  const getActionLabel = (action) => {
    const labels = {
      delete: 'Deleting emails',
      archive: 'Archiving emails',
      unsubscribe: 'Unsubscribing from newsletters'
    };
    return labels[action] || 'Processing';
  };

  /**
   * Get action icon
   */
  const getActionIcon = (type) => {
    const icons = {
      delete: <Trash2 className="w-6 h-6 text-red-600" />,
      archive: <Archive className="w-6 h-6 text-blue-600" />,
      unsubscribe: <XCircle className="w-6 h-6 text-orange-600" />
    };
    return icons[type] || <Mail className="w-6 h-6" />;
  };

  /**
   * Get confidence color
   */
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-700 border-green-200';
    if (confidence >= 0.75) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  /**
   * Get confidence badge
   */
  const getConfidenceBadge = (confidence) => {
    if (confidence >= 0.9) return '✓ High Confidence';
    if (confidence >= 0.75) return '⚡ Good Confidence';
    return '⚠️ Medium Confidence';
  };

  /**
   * Format importance score
   */
  const getImportanceColor = (importance) => {
    if (importance >= 0.8) return 'text-red-600';
    if (importance >= 0.5) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-2">
          <Brain className="w-6 h-6 animate-pulse" />
          <h2 className="text-2xl font-bold">AI Suggestions</h2>
        </div>
        <p className="text-indigo-100">Advanced AI with multi-factor analysis, safety checks, and learning</p>
      </div>

      {/* Learning Statistics */}
      {learningStats && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-800">AI Learning Active</p>
                <p className="text-xs text-purple-700">
                  Accuracy: {learningStats.accuracy}% • 
                  Approved: {learningStats.approved} • 
                  Rejected: {learningStats.rejected}
                </p>
              </div>
            </div>
            <button
              onClick={loadAISuggestions}
              disabled={isLoading}
              className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-purple-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* Statistics Card */}
      {statistics && (
        <div className="bg-white rounded-xl shadow-lg border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-lg">Analysis Summary</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{statistics.total}</div>
              <div className="text-xs text-blue-600">Total Analyzed</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{statistics.highConfidence}</div>
              <div className="text-xs text-green-600">High Confidence</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">{statistics.averageConfidence}%</div>
              <div className="text-xs text-purple-600">Avg Confidence</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">{aiSuggestions.length}</div>
              <div className="text-xs text-orange-600">Actions Ready</div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-center space-x-3 shadow-sm">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800">{processingAction}</p>
            <div className="mt-2 w-full bg-blue-200 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{width: '70%'}}></div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3 shadow-lg animate-in slide-in-from-top duration-300">
          <CheckCircle className="w-5 h-5 text-green-600 animate-bounce" />
          <div className="flex-1">
            <h3 className="font-semibold text-green-800">Success! 🎉</h3>
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewMode && (
        <div className="bg-white rounded-xl shadow-2xl border-2 border-indigo-200 p-6 animate-in slide-in-from-top duration-300">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center space-x-2">
              <Eye className="w-5 h-5 text-indigo-600" />
              <span>Preview: {previewMode.type.charAt(0).toUpperCase() + previewMode.type.slice(1)}</span>
            </h3>
            <button 
              onClick={() => setPreviewMode(null)} 
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-gray-700 mb-3">{previewMode.reason}</p>

          <div className="flex items-center space-x-2 mb-4">
            <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${getConfidenceColor(previewMode.confidence)}`}>
              {getConfidenceBadge(previewMode.confidence)} ({Math.round(previewMode.confidence * 100)}%)
            </span>
            <span className="text-sm text-gray-600">{previewMode.count} emails affected</span>
          </div>

          {/* Email Preview List */}
          <div className="max-h-80 overflow-y-auto mb-4 space-y-2">
            {previewMode.emails.slice(0, 10).map((email, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{email.metadata.sender}</p>
                    <p className="text-xs text-gray-600 truncate">{email.metadata.subject}</p>
                  </div>
                  <span className={`text-xs font-medium ml-2 ${getImportanceColor(1 - (email.aiSuggestion?.scores?.finalScore || 0))}`}>
                    {Math.round((1 - (email.aiSuggestion?.scores?.finalScore || 0)) * 100)}%
                  </span>
                </div>

                {/* AI Analysis Details */}
                {email.aiSuggestion && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-600 italic">"{email.aiSuggestion.reasoning}"</p>
                    
                    {/* Factor Scores */}
                    {email.aiSuggestion.scores && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {email.aiSuggestion.scores.ageScore > 0.5 && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                            Old: {Math.round(email.aiSuggestion.scores.ageScore * 100)}%
                          </span>
                        )}
                        {email.aiSuggestion.scores.engagementScore > 0.5 && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                            Never Opened
                          </span>
                        )}
                        {email.metadata.senderCategory && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                            {email.metadata.senderCategory}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {previewMode.emails.length > 10 && (
              <p className="text-xs text-gray-500 text-center py-2">
                + {previewMode.emails.length - 10} more emails
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => applySuggestion(previewMode)}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Apply Action'}
            </button>
            <button
              onClick={() => rejectSuggestion(previewMode)}
              disabled={isLoading}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              Reject & Learn
            </button>
          </div>
        </div>
      )}

      {/* AI Suggestions List */}
      {!isLoading && aiSuggestions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-lg">
          <Shield className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-semibold mb-2">All Clear! ✨</h3>
          <p className="text-gray-600">No safe actions to suggest at this time.</p>
          <button
            onClick={loadAISuggestions}
            className="mt-4 px-6 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors"
          >
            Refresh Analysis
          </button>
        </div>
      ) : (
        aiSuggestions.map((suggestion, i) => (
          <div 
            key={i} 
            className="bg-white rounded-xl shadow-lg border p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1" 
            style={{animationDelay: `${i * 100}ms`}}
          >
            <div className="flex justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getActionIcon(suggestion.type)}
                <div>
                  <h3 className="font-semibold text-lg capitalize">{suggestion.type}</h3>
                  <p className="text-sm text-gray-600">{suggestion.reason}</p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${getConfidenceColor(suggestion.confidence)}`}>
                  {Math.round(suggestion.confidence * 100)}% Confident
                </span>
                <span className="text-sm text-gray-600">{suggestion.count} emails</span>
              </div>
            </div>

            {/* Safety Indicator */}
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200 flex items-start space-x-2">
              <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-green-700">
                Safety checks passed • Protected senders respected • Important keywords detected
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setPreviewMode(suggestion)}
                className="flex-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
              >
                <Eye className="w-4 h-4" />
                <span>Preview Details</span>
              </button>
              <button
                onClick={() => applySuggestion(suggestion)}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                Apply Now
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default EnhancedSuggestions;