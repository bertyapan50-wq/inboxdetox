import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, Mail, Users, Calendar, Zap, AlertCircle, CheckCircle, Loader2, X, Eye, Shield } from 'lucide-react';

const AIInsights = ({ emails, onRefresh }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewModal, setPreviewModal] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    generateInsights();
  }, [emails]);

  const generateInsights = async () => {
    setLoading(true);
    
    try {
      // ✅ Call smart AI analysis API
      console.log('🧠 Calling smart AI analysis...');
      
      const response = await fetch('http://localhost:5000/api/email/analyze-grouped', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ emails })
      });
      
      const data = await response.json();
      console.log('✅ Smart AI response:', data);
      
      if (data.success && data.suggestions) {
        // Use smart AI suggestions
        setInsights({
          totalEmails: emails.length,
          unreadEmails: emails.filter(e => !e.opened).length,
          oldEmails: emails.filter(e => e.daysOld > 30).length,
          importantEmails: emails.filter(e => e.importance > 0.7).length,
          
          // Smart AI suggestions (grouped)
          smartSuggestions: data.suggestions,
          
          // Statistics from AI
          statistics: data.statistics || {},
          
          // Categories
          categories: calculateCategories(emails),
          topSenders: calculateTopSenders(emails),
          
          // Score calculation
          score: calculateHealthScore(emails)
        });
      } else {
        // Fallback to basic insights
        setInsights(generateBasicInsights(emails));
      }
    } catch (error) {
      console.error('❌ AI analysis error:', error);
      // Fallback to basic insights
      setInsights(generateBasicInsights(emails));
    } finally {
      setLoading(false);
    }
  };

  const generateBasicInsights = (emails) => {
    return {
      totalEmails: emails.length,
      unreadEmails: emails.filter(e => !e.opened).length,
      oldEmails: emails.filter(e => e.daysOld > 30).length,
      importantEmails: emails.filter(e => e.importance > 0.7).length,
      smartSuggestions: [],
      categories: calculateCategories(emails),
      topSenders: calculateTopSenders(emails),
      score: calculateHealthScore(emails)
    };
  };

  const calculateCategories = (emails) => {
    const categories = {};
    emails.forEach(e => {
      categories[e.category] = (categories[e.category] || 0) + 1;
    });
    return categories;
  };

  const calculateTopSenders = (emails) => {
    const senders = {};
    emails.forEach(e => {
      senders[e.from] = (senders[e.from] || 0) + 1;
    });
    return Object.entries(senders)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([email, count]) => ({ email, count }));
  };

  const calculateHealthScore = (emails) => {
    const oldEmails = emails.filter(e => e.daysOld > 30).length;
    const unreadEmails = emails.filter(e => !e.opened).length;
    return Math.round((1 - (oldEmails + unreadEmails) / emails.length) * 100);
  };

  const handleSuggestionClick = (suggestion) => {
    setPreviewModal(suggestion);
  };

  const handleApplyAction = async () => {
    if (!previewModal) return;

    setIsProcessing(true);

    try {
      const emailIds = previewModal.email_ids || [];
      console.log('🔍 Applying action:', previewModal.suggested_actions[0]);
      console.log('🔍 Total emails:', emailIds.length);


      // Determine endpoint based on action
      let endpoint = '';
      let action = previewModal.suggested_actions[0];
      
      if (action === 'DELETE_ALL') {
        endpoint = 'http://localhost:5000/api/email/delete';
      } else if (action === 'ARCHIVE_ALL' || action === 'MUTE_SENDER') {
        endpoint = 'http://localhost:5000/api/email/archive';
      }

      console.log('📤 Calling:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ emailIds })
      });

      const data = await response.json();
      console.log('✅ Response:', data);

      if (data.success) {
        alert(`✅ Successfully processed ${emailIds.length} emails!`);
        setPreviewModal(null);
        // ✅ ADD THIS:
  if (onRefresh) {
    await onRefresh();
  }
        
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
      console.error('❌ Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getConfidenceBadge = (confidence) => {
    const badges = {
      'VERY_HIGH': { bg: 'bg-green-100', text: 'text-green-800', label: 'VERY HIGH' },
      'HIGH': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'HIGH' },
      'MEDIUM': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'MEDIUM' },
      'LOW': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'LOW' }
    };
    const badge = badges[confidence] || badges['LOW'];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
        {badge.label} CONFIDENCE
      </span>
    );
  };

  if (loading || !insights) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Analyzing with AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
      {/* Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Eye className="w-6 h-6" />
                  <div>
                    <h3 className="text-xl font-bold">{previewModal.title}</h3>
                    <p className="text-sm text-indigo-100">{previewModal.emails_count} emails • {previewModal.category}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setPreviewModal(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Confidence & Safety */}
              <div className="mt-4 flex items-center space-x-3">
                {getConfidenceBadge(previewModal.confidence)}
                {previewModal.safety_check?.is_safe && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500 bg-opacity-20 text-white flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>SAFE TO ACT</span>
                  </span>
                )}
              </div>
            </div>

            <div className="p-6">
              {/* AI Reasoning */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">🤖 AI Reasoning:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {previewModal.reasons?.map((reason, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>{reason.replace(/_/g, ' ')}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Safety Note */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  ℹ️ {previewModal.safety_note}
                </p>
              </div>

              {/* Email Preview */}
              <div className="max-h-80 overflow-y-auto space-y-2">
                {previewModal.emails?.slice(0, 20).map((email, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-800 truncate">{email.from}</p>
                        <p className="text-xs text-gray-600 truncate mt-1">{email.subject}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">{email.date}</span>
                          {email.isUnopened && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                              Unopened
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {previewModal.emails && previewModal.emails.length > 20 && (
                  <p className="text-center text-sm text-gray-500 py-2">
                    + {previewModal.emails.length - 20} more emails...
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-6 flex space-x-3">
              <button
                onClick={() => setPreviewModal(null)}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleApplyAction}
                disabled={isProcessing}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Apply: {previewModal.suggested_actions?.[0]?.replace(/_/g, ' ')}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-white bg-opacity-20 p-3 rounded-xl">
            <Brain className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Smart AI Insights</h2>
            <p className="text-indigo-100">Powered by intelligent analysis</p>
          </div>
        </div>
        
        <div className="bg-white bg-opacity-20 rounded-xl p-6 mt-6 backdrop-blur-sm">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-purple-900 font-semibold mb-1">Inbox Health Score</p>
      <p className="text-5xl font-bold text-purple-900">{insights.score}%</p>
    </div>
            <div className="text-right">
              {insights.score >= 80 ? (
                <CheckCircle className="w-16 h-16 text-green-300" />
              ) : insights.score >= 50 ? (
                <AlertCircle className="w-16 h-16 text-yellow-300" />
              ) : (
                <AlertCircle className="w-16 h-16 text-red-300" />
              )}
            </div>
          </div>
          <div className="mt-4 bg-white bg-opacity-20 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${insights.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <Mail className="w-8 h-8 text-blue-500" />
            <span className="text-3xl font-bold text-gray-800">{insights.totalEmails}</span>
          </div>
          <p className="text-sm text-gray-600">Total Emails</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <span className="text-3xl font-bold text-gray-800">{insights.importantEmails}</span>
          </div>
          <p className="text-sm text-gray-600">Important</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-orange-500" />
            <span className="text-3xl font-bold text-gray-800">{insights.unreadEmails}</span>
          </div>
          <p className="text-sm text-gray-600">Unread</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 text-red-500" />
            <span className="text-3xl font-bold text-gray-800">{insights.oldEmails}</span>
          </div>
          <p className="text-sm text-gray-600">Old (30+ days)</p>
        </div>
      </div>

      {/* Smart AI Suggestions */}
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          <span>Smart AI Suggestions</span>
        </h3>
        
        <div className="space-y-4">
          {insights.smartSuggestions?.map((suggestion, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-xl border-l-4 border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-bold text-gray-900">{suggestion.title}</h4>
                    {getConfidenceBadge(suggestion.confidence)}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {suggestion.reasons?.map((reason, i) => (
                      <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {reason.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {suggestion.emails_count} emails from {suggestion.sender_or_category}
                  </p>
                  
                  {suggestion.safety_note && (
                    <p className="text-xs text-green-700 bg-green-50 inline-block px-2 py-1 rounded">
                      ℹ️ {suggestion.safety_note}
                    </p>
                  )}
                </div>
                
                <button 
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="ml-4 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition text-sm font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>Review</span>
                </button>
              </div>
            </div>
          ))}
          
         {(!insights.smartSuggestions || insights.smartSuggestions.length === 0) && (
  <div className="text-center py-16 px-6">
    <div className="relative inline-block mb-6">
      <div className="absolute inset-0 bg-green-200 rounded-full blur-2xl opacity-50 animate-pulse"></div>
      <CheckCircle className="w-20 h-20 text-green-500 mx-auto relative animate-bounce" />
    </div>
    
    <h4 className="text-2xl font-bold text-gray-800 mb-3">
      All Clear! 🎉
    </h4>
    
    <p className="text-gray-600 text-lg mb-4 max-w-md mx-auto">
      No cleanup suggestions at the moment. Your inbox is well-maintained!
    </p>
    
    <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium border border-green-200">
      <span>✨</span>
      <span>Inbox health: Excellent</span>
    </div>
  </div>
)}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-gradient-to-br from-white via-indigo-50 to-purple-50 rounded-2xl shadow-2xl border border-indigo-200 p-8 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
        <h3 className="text-2xl font-bold mb-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-lg">📊</span>
          </div>
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Email Categories</span>
        </h3>
        <div className="space-y-5">
          {Object.entries(insights.categories)
            .sort((a, b) => b[1] - a[1])
            .map(([category, count]) => {
              const percentage = Math.round((count / insights.totalEmails) * 100);
              return (
                <div key={category} className="group hover:bg-white/50 p-3 rounded-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-800 capitalize tracking-wide">{category}</span>
                    <span className="text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-1.5 rounded-full shadow-md">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3 shadow-inner overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-700 ease-out shadow-lg group-hover:shadow-2xl relative overflow-hidden"
                      style={{ width: `${percentage}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Top Senders with Visual Analytics */}
      <div className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl shadow-2xl border border-purple-200 p-8 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">Top Senders</span>
          </h3>
          <span className="text-xs font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-full shadow-md">
            {insights.topSenders?.length || 0} senders
          </span>
        </div>
        
        {insights.topSenders && insights.topSenders.length > 0 ? (
          <div className="space-y-5">
            {insights.topSenders.map((sender, idx) => {
              const percentage = Math.round((sender.count / insights.totalEmails) * 100);
              
              let barColor = 'from-indigo-500 to-purple-600';
              if (percentage > 20) barColor = 'from-red-500 via-orange-500 to-yellow-500';
              else if (percentage > 10) barColor = 'from-yellow-500 via-orange-500 to-red-500';
              
              return (
                <div key={idx} className="group hover:bg-white/60 p-4 rounded-xl transition-all duration-300 border border-transparent hover:border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-gray-900 truncate block group-hover:text-indigo-700 transition-colors">
                          {sender.email}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          {sender.count} email{sender.count !== 1 ? 's' : ''} • {percentage}% of total
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {sender.count}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-200 rounded-full h-3 shadow-inner overflow-hidden">
                    <div 
                      className={`bg-gradient-to-r ${barColor} h-3 rounded-full transition-all duration-700 ease-out shadow-lg group-hover:shadow-2xl relative overflow-hidden`}
                      style={{ width: `${percentage}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                    <p className="text-xs font-medium text-gray-600 italic flex items-center space-x-1">
                      {percentage > 15 ? (
                        <>
                          <span className="text-orange-500">⚠️</span>
                          <span className="text-orange-600">High volume sender</span>
                        </>
                      ) : (
                        <>
                          <span className="text-green-500">✓</span>
                          <span className="text-green-600">Normal volume</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl border-2 border-dashed border-gray-300">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-base font-semibold">No sender data available</p>
            <p className="text-gray-400 text-sm mt-2">Load emails to see top senders</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;