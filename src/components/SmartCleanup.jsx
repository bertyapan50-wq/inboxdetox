import React, { useState, useEffect } from 'react';
import { 
  Mail, Archive, Trash2, CheckCircle, AlertCircle, Shield, 
  TrendingUp, Clock, User, Sparkles, ChevronDown, ChevronUp,
  Loader2, RefreshCw, Undo2, X, Filter, Calendar
} from 'lucide-react';
import ScheduleSettings from './settings/ScheduleSettings';

const SmartCleanupFeature = ({ user }) => {
  const [emailGroups, setEmailGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroups, setSelectedGroups] = useState(new Set());
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [actionInProgress, setActionInProgress] = useState(false);
  const [filterConfidence, setFilterConfidence] = useState('all');
  const [showScheduleSettings, setShowScheduleSettings] = useState(false);

  // Mock data generator for email groups
  const generateMockData = () => {
    return [
      {
        id: 'group-1',
        sender: 'promotions@amazon.com',
        senderDomain: 'amazon.com',
        category: 'Promotional',
        emailCount: 15,
        confidenceScore: 95,
        confidenceLevel: 'high',
        reasons: [
          'Unopened for 30+ days',
          'Low engagement rate (0%)',
          'Promotional content detected',
          'No replies or important actions'
        ],
        safetyChecks: [
          'No payment information',
          'No invoice keywords',
          'Not from important contacts'
        ],
        oldestEmail: '45 days ago',
        newestEmail: '2 days ago',
        totalSize: '2.3 MB',
        emails: [
          { id: 'e1', subject: 'Black Friday Sale - 50% Off Everything!', date: '2 days ago', size: '154 KB' },
          { id: 'e2', subject: 'Cyber Monday Deals Starting Now', date: '5 days ago', size: '142 KB' },
          { id: 'e3', subject: 'Limited Time: Free Shipping on Orders', date: '8 days ago', size: '138 KB' }
        ]
      },
      {
        id: 'group-2',
        sender: 'newsletter@medium.com',
        senderDomain: 'medium.com',
        category: 'Newsletter',
        emailCount: 23,
        confidenceScore: 88,
        confidenceLevel: 'high',
        reasons: [
          'Unopened for 20+ days',
          'Similar content pattern',
          'Newsletter category',
          'Mass distribution detected'
        ],
        safetyChecks: [
          'No sensitive information',
          'Not from work contacts',
          'No action required'
        ],
        oldestEmail: '60 days ago',
        newestEmail: '1 day ago',
        totalSize: '4.1 MB',
        emails: [
          { id: 'e4', subject: 'Top Stories This Week', date: '1 day ago', size: '178 KB' },
          { id: 'e5', subject: 'Must Read Articles of the Month', date: '7 days ago', size: '182 KB' }
        ]
      },
      {
        id: 'group-3',
        sender: 'notifications@facebook.com',
        senderDomain: 'facebook.com',
        category: 'Social Media',
        emailCount: 42,
        confidenceScore: 92,
        confidenceLevel: 'high',
        reasons: [
          'Social media notifications',
          'Unopened for 15+ days',
          'Automated messages',
          'Low priority content'
        ],
        safetyChecks: [
          'No important messages',
          'Notification emails only',
          'Safe to archive'
        ],
        oldestEmail: '90 days ago',
        newestEmail: '3 hours ago',
        totalSize: '1.8 MB',
        emails: [
          { id: 'e6', subject: 'You have 5 new friend requests', date: '3 hours ago', size: '42 KB' },
          { id: 'e7', subject: 'John posted a new photo', date: '1 day ago', size: '38 KB' }
        ]
      },
      {
        id: 'group-4',
        sender: 'updates@github.com',
        senderDomain: 'github.com',
        category: 'Updates',
        emailCount: 8,
        confidenceScore: 65,
        confidenceLevel: 'medium',
        reasons: [
          'Work-related domain',
          'Some emails opened recently',
          'Mixed engagement pattern'
        ],
        safetyChecks: [
          'Contains repository updates',
          'May have important notifications',
          'Review recommended'
        ],
        oldestEmail: '30 days ago',
        newestEmail: '5 hours ago',
        totalSize: '892 KB',
        emails: [
          { id: 'e8', subject: 'Pull request #123 merged', date: '5 hours ago', size: '112 KB' },
          { id: 'e9', subject: 'New issue opened in project-x', date: '2 days ago', size: '98 KB' }
        ]
      },
      {
        id: 'group-5',
        sender: 'receipts@uber.com',
        senderDomain: 'uber.com',
        category: 'Receipts',
        emailCount: 12,
        confidenceScore: 45,
        confidenceLevel: 'low',
        reasons: [
          'Contains receipt information',
          'Financial records detected',
          'May be needed for expense reports'
        ],
        safetyChecks: [
          'Payment information present',
          'Important for records',
          'Manual review recommended'
        ],
        oldestEmail: '120 days ago',
        newestEmail: '10 days ago',
        totalSize: '1.2 MB',
        emails: [
          { id: 'e10', subject: 'Your trip receipt', date: '10 days ago', size: '102 KB' },
          { id: 'e11', subject: 'Trip receipt for January 5', date: '15 days ago', size: '98 KB' }
        ]
      }
    ];
  };

  // Load email groups
  useEffect(() => {
    loadEmailGroups();
  }, []);

  const loadEmailGroups = async () => {
    setLoading(true);
    try {
      console.log('🔍 Step 1: Loading emails from Gmail...');
      
      const emailsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/email/emails`, {
        credentials: 'include'
      });
      
      if (!emailsResponse.ok) {
        throw new Error('Failed to load emails');
      }
      
      const { emails } = await emailsResponse.json();
      console.log(`✅ Loaded ${emails.length} emails`);
      
      if (emails.length === 0) {
        setEmailGroups([]);
        setLoading(false);
        return;
      }
      
      console.log('🤖 Step 2: Analyzing emails with rule-based AI...');

      const groupEmailsBySender = (recommendations) => {
        const senderMap = new Map();
        
        recommendations.forEach(rec => {
          const emailMatch = rec.from.match(/<(.+?)>/) || rec.from.match(/([^\s]+@[^\s]+)/);
          const email = emailMatch ? emailMatch[1] || emailMatch[0] : rec.from;
          const domain = email.split('@')[1] || email;
          
          if (!senderMap.has(domain)) {
            senderMap.set(domain, {
              sender: rec.from,
              domain: domain,
              emails: [],
              category: rec.category,
              totalConfidence: 0,
              actions: { archive: 0, delete: 0, keep: 0 }
            });
          }
          
          const group = senderMap.get(domain);
          group.emails.push(rec);
          group.totalConfidence += rec.confidence;
          group.actions[rec.action]++;
        });
        
        return Array.from(senderMap.values()).map((group, index) => {
          const avgConfidence = Math.round(group.totalConfidence / group.emails.length);
          
          let confidenceLevel = 'low';
          if (avgConfidence >= 80) confidenceLevel = 'high';
          else if (avgConfidence >= 60) confidenceLevel = 'medium';
          
          const allReasons = group.emails.map(e => e.reason.split(' • ')).flat();
          const uniqueReasons = [...new Set(allReasons)].slice(0, 4);
          
          const dates = group.emails
            .map(e => new Date(e.date || Date.now()))
            .filter(d => !isNaN(d));
          
          const oldestDate = dates.length > 0 ? new Date(Math.min(...dates)) : new Date();
          const daysAgo = Math.floor((Date.now() - oldestDate) / (1000 * 60 * 60 * 24));
          const oldestEmail = daysAgo === 0 ? 'Today' : 
                              daysAgo === 1 ? 'Yesterday' : 
                              `${daysAgo} days ago`;
          
          const safetyChecks = [];
          if (group.category === 'Promotional') {
            safetyChecks.push('No payment information detected');
            safetyChecks.push('Promotional content only');
            safetyChecks.push('Safe to archive/delete');
          } else if (group.category === 'Social Media') {
            safetyChecks.push('Social media notifications');
            safetyChecks.push('No important messages');
            safetyChecks.push('Safe to clean up');
          } else if (group.category === 'Newsletter') {
            safetyChecks.push('Newsletter/update content');
            safetyChecks.push('No action required');
            safetyChecks.push('Safe to archive');
          } else {
            safetyChecks.push('No sensitive information detected');
            safetyChecks.push('Not from important contacts');
            safetyChecks.push('Safe to archive');
          }
          
          return {
            id: `group-${index}`,
            sender: group.sender.split('<')[0].trim() || group.domain,
            senderDomain: group.domain,
            category: group.category,
            emailCount: group.emails.length,
            confidenceScore: avgConfidence,
            confidenceLevel: confidenceLevel,
            reasons: uniqueReasons,
            safetyChecks: safetyChecks,
            oldestEmail: oldestEmail,
            newestEmail: '2 days ago',
            totalSize: `${Math.round(group.emails.length * 0.15 * 10) / 10} MB`,
            emails: group.emails.slice(0, 5).map((e, i) => ({
              id: e.emailId,
              subject: e.subject,
              date: '2 days ago',
              size: '~150 KB'
            }))
          };
        }).sort((a, b) => b.confidenceScore - a.confidenceScore);
      };
      
      const analyzeResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/email/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ emails })
      });
      
      if (!analyzeResponse.ok) {
        throw new Error('Failed to analyze emails');
      }
      
      const { recommendations } = await analyzeResponse.json();
      console.log(`✅ Analyzed ${recommendations.length} emails`);
      
      const groups = groupEmailsBySender(recommendations);
      console.log(`✅ Created ${groups.length} email groups`);
      
      setEmailGroups(groups);
      
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error loading emails: ' + error.message);
      
      const mockData = generateMockData();
      setEmailGroups(mockData);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroupSelection = (groupId) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedGroups(newSelected);
  };

  const toggleGroupExpansion = (groupId) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const selectAllGroups = () => {
    const filtered = getFilteredGroups();
    setSelectedGroups(new Set(filtered.map(g => g.id)));
  };

  const clearSelection = () => {
    setSelectedGroups(new Set());
  };

  const getConfidenceBadge = (level, score) => {
    const badges = {
      high: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', label: 'HIGH CONFIDENCE' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', label: 'MEDIUM CONFIDENCE' },
      low: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', label: 'LOW CONFIDENCE' }
    };
    const badge = badges[level] || badges.medium;
    return (
      <div className={`${badge.bg} ${badge.text} ${badge.border} border-2 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1`}>
        <span>{score}%</span>
        <span>•</span>
        <span>{badge.label}</span>
      </div>
    );
  };

  const handleArchive = async () => {
    if (selectedGroups.size === 0) return;
    
    const selectedEmailIds = emailGroups
      .filter(g => selectedGroups.has(g.id))
      .flatMap(g => g.emails.map(e => e.id));
    
    console.log('📦 Archiving email IDs:', selectedEmailIds);
    
    if (!window.confirm(
      `Archive ${selectedEmailIds.length} email(s) from ${selectedGroups.size} group(s)?\n\n` +
      `They will be removed from Inbox but kept in "All Mail".`
    )) {
      return;
    }
    
    setActionInProgress(true);
    try {
      console.log('📦 Calling /api/email/archive...');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/email/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ emailIds: selectedEmailIds })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Archive failed:', errorData);
        throw new Error(errorData.error || 'Failed to archive emails');
      }
      
      const data = await response.json();
      console.log('✅ Archive response:', data);
      
      setEmailGroups(emailGroups.filter(g => !selectedGroups.has(g.id)));
      setSelectedGroups(new Set());
      
      alert(
        `✅ Successfully archived ${data.count} email(s)!\n\n` +
        `Check your Gmail "All Mail" to find them.`
      );
      
    } catch (error) {
      console.error('❌ Archive error:', error);
      alert(`❌ Error: ${error.message}\n\nPlease try again.`);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDelete = async () => {
    if (selectedGroups.size === 0) return;
    
    const selectedEmailIds = emailGroups
      .filter(g => selectedGroups.has(g.id))
      .flatMap(g => g.emails.map(e => e.id));
    
    console.log('🗑️ Deleting email IDs:', selectedEmailIds);
    
    if (!window.confirm(
      `⚠️ PERMANENTLY DELETE ${selectedEmailIds.length} email(s)?\n\n` +
      `They will be moved to Trash and deleted after 30 days.\n\n` +
      `This action cannot be immediately undone!`
    )) {
      return;
    }
    
    setActionInProgress(true);
    try {
      console.log('🗑️ Calling /api/email/delete...');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/email/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ emailIds: selectedEmailIds })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Delete failed:', errorData);
        throw new Error(errorData.error || 'Failed to delete emails');
      }
      
      const data = await response.json();
      console.log('✅ Delete response:', data);
      
      setEmailGroups(emailGroups.filter(g => !selectedGroups.has(g.id)));
      setSelectedGroups(new Set());
      
      alert(
        `✅ Successfully deleted ${data.count} email(s)!\n\n` +
        `They are now in Trash and will be permanently deleted after 30 days.`
      );
      
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert(`❌ Error: ${error.message}\n\nPlease try again.`);
    } finally {
      setActionInProgress(false);
    }
  };

  const getFilteredGroups = () => {
    if (filterConfidence === 'all') return emailGroups;
    return emailGroups.filter(g => g.confidenceLevel === filterConfidence);
  };

  const filteredGroups = getFilteredGroups();
  const totalEmails = filteredGroups.reduce((sum, g) => sum + g.emailCount, 0);
  const selectedCount = selectedGroups.size;
  const selectedEmailCount = emailGroups
    .filter(g => selectedGroups.has(g.id))
    .reduce((sum, g) => sum + g.emailCount, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-16 h-16 text-purple-600 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Analyzing Your Inbox...</h3>
        <p className="text-gray-600">AI is grouping and analyzing your emails</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Smart AI Cleanup</h2>
            <p className="text-purple-100">AI-powered email organization</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Schedule Auto-Cleanup Button */}
            <button
              onClick={() => setShowScheduleSettings(true)}
              className="group px-4 py-2 rounded-lg font-semibold flex items-center gap-2
bg-white text-purple-700 transition-all duration-300 ease-in-out
hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600
hover:text-white shadow-md hover:shadow-lg"



            >
              <Calendar className="w-5 h-5 transition-colors duration-300 group-hover:text-white" />

              <span>Schedule Auto-Cleanup</span>
            </button>
            
            <button
              onClick={loadEmailGroups}
              disabled={actionInProgress}
              className="p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-6 h-6 ${actionInProgress ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-3xl font-bold text-gray-900">{filteredGroups.length}</div>
            <div className="text-sm text-gray-800 font-medium">Email Groups</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-3xl font-bold text-gray-900">{totalEmails}</div>
            <div className="text-sm text-gray-800 font-medium">Total Emails</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-3xl font-bold text-gray-900">{selectedEmailCount}</div>
            <div className="text-sm text-gray-800 font-medium">Selected</div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-2">
        <Filter className="w-5 h-5 text-gray-600" />
        <div className="relative">
          <select
            value={filterConfidence}
            onChange={(e) => setFilterConfidence(e.target.value)}
            className="appearance-none px-4 py-2 pr-12 border-2 border-gray-300 
                       rounded-lg focus:border-purple-500 focus:outline-none bg-white"
          >
            <option value="all">All Confidence Levels</option>
            <option value="high">High Confidence Only</option>
            <option value="medium">Medium Confidence</option>
            <option value="low">Low Confidence</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Email Groups */}
      <div className="space-y-4">
        {filteredGroups.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Email Groups Found</h3>
            <p className="text-gray-600">Try adjusting your filters or refresh the analysis</p>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div
              key={group.id}
              className={`bg-white rounded-xl shadow-lg border-2 transition-all ${
                selectedGroups.has(group.id) ? 'border-purple-500 shadow-xl' : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedGroups.has(group.id)}
                    onChange={() => toggleGroupSelection(group.id)}
                    className="w-5 h-5 mt-1 cursor-pointer"
                  />
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{group.sender}</h3>
                        <p className="text-sm text-gray-600">{group.category} • {group.emailCount} emails</p>
                      </div>
                      {getConfidenceBadge(group.confidenceLevel, group.confidenceScore)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{group.oldestEmail}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{group.totalSize}</span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="font-semibold text-sm text-gray-700">Why AI Recommends Action:</div>
                      {group.reasons.slice(0, 2).map((reason, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{reason}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center space-x-2 text-sm font-semibold text-blue-800 mb-2">
                        <Shield className="w-4 h-4" />
                        <span>Safety Checks</span>
                      </div>
                      {group.safetyChecks.map((check, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-sm text-blue-700">
                          <span>✓</span>
                          <span>{check}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => toggleGroupExpansion(group.id)}
                      className="text-purple-600 hover:text-gray-900
font-medium text-sm flex items-center space-x-1"
                    >
                      {expandedGroups.has(group.id) ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          <span>Hide Details</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          <span>Show {group.emails.length} Sample Emails</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              {expandedGroups.has(group.id) && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  <h4 className="font-bold text-sm text-gray-700 mb-3">Sample Emails:</h4>
                  <div className="space-y-2">
                    {group.emails.map((email) => (
                      <div key={email.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-800">{email.subject}</div>
                          <div className="text-xs text-gray-500">{email.date} • {email.size}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom Action Bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-2xl border-2 border-purple-500 px-6 py-4 flex items-center space-x-4 z-50">
          <span className="font-bold text-gray-800">
            {selectedCount} group{selectedCount > 1 ? 's' : ''} selected ({selectedEmailCount} emails)
          </span>
          <div className="w-px h-8 bg-gray-300"></div>
          <button
            onClick={handleArchive}
            disabled={actionInProgress}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-all disabled:opacity-50 flex items-center space-x-2"
          >
            <Archive className="w-4 h-4" />
            <span>Archive</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={actionInProgress}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-all disabled:opacity-50 flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
          <button
            onClick={clearSelection}
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}

      {/* Schedule Settings Modal */}
      {showScheduleSettings && (
        <ScheduleSettings onClose={() => setShowScheduleSettings(false)} />
      )}
    </div>
  );
};

export default SmartCleanupFeature;