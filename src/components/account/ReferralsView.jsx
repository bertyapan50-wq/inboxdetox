import React, { useState, useEffect } from 'react';
import { Copy, Check, Gift, Users, DollarSign, Share2, Award, TrendingUp } from 'lucide-react';

// ✅ ADD THIS HELPER FUNCTION HERE (after imports)
const getReferralAnalytics = (referrals) => {
  const emailCounts = {};
  const statusByEmail = {};
  
  referrals.forEach(ref => {
    const email = ref.email || 'N/A';
    emailCounts[email] = (emailCounts[email] || 0) + 1;
    
    if (!statusByEmail[email]) {
      statusByEmail[email] = { active: 0, pending: 0 };
    }
    statusByEmail[email][ref.status]++;
  });
  
  return { emailCounts, statusByEmail };
};
const ReferralsView = () => {
  const [referralData, setReferralData] = useState(null);
  const [referralsList, setReferralsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      // ✅ FIXED: Use credentials include (cookies) instead of Bearer token
      const response = await fetch('/api/referral/info', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // ✅ Map the response data correctly
        const formattedData = {
          referralCode: data.referralCode,
          referralLink: data.referralLink,
          stats: data.stats,
          rewards: {
            monthsFree: Math.floor(data.stats.activeReferrals / 3),
            yearsFree: Math.floor(data.stats.activeReferrals / 10),
            lifetimePremium: data.stats.activeReferrals >= 25
          }
        };
        
        setReferralData(formattedData);
        
        // ✅ Set referrals list
        if (data.referrals && data.referrals.length > 0) {
          setReferralsList(data.referrals);
        }
      } else {
        console.log('API error, using demo data');
        loadDemoData();
      }
    } catch (error) {
      console.log('Error loading referrals:', error);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    const demoData = {
      referralCode: 'DEMO' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      referralLink: `${window.location.origin}/signup?ref=DEMO`,
      stats: {
        totalReferrals: 0,
        activeReferrals: 0,
        pendingReferrals: 0,
        earnedRewards: 0
      },
      rewards: {
        monthsFree: 0,
        yearsFree: 0,
        lifetimePremium: false
      }
    };
    setReferralData(demoData);
    setReferralsList([]);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareReferral = () => {
    if (navigator.share && referralData) {
      navigator.share({
        title: 'Join me on InboxIQ!',
        text: `Use my referral code ${referralData.referralCode} to get started with InboxIQ!`,
        url: referralData.referralLink
      }).catch(err => console.log('Error sharing:', err));
    } else {
      copyToClipboard(referralData.referralLink);
      alert('Referral link copied to clipboard!');
    }
  };

  const resetDemo = () => {
    loadDemoData();
    setShowResetConfirm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!referralData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Unable to load referral data</p>
        <button 
          onClick={loadReferralData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 h-[calc(100vh-120px)] overflow-y-auto">

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reset Demo Data?</h3>
            <p className="text-gray-600 mb-6">
              This will reset the demo data. Your actual referral data is stored in the backend.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={resetDemo}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Referral Program</h1>
          <p className="mt-2 text-gray-600">
            Share InboxIQ with friends and earn amazing rewards!
          </p>
        </div>
      </div>

      {referralData.rewards && (
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl shadow-xl p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Your Rewards</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-purple-200">
              <p className="text-sm text-purple-600 font-medium">Months Free</p>
              <p className="text-3xl font-bold text-purple-900">{referralData.rewards.monthsFree}</p>
              <p className="text-xs text-gray-500 mt-1">Every 3 referrals</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-pink-200">
              <p className="text-sm text-pink-600 font-medium">Years Free</p>
              <p className="text-3xl font-bold text-pink-900">{referralData.rewards.yearsFree}</p>
              <p className="text-xs text-gray-500 mt-1">Every 10 referrals</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-orange-200">
              <p className="text-sm text-orange-600 font-medium">Lifetime Premium</p>
              <p className="text-3xl font-bold text-orange-900">
                {referralData.rewards.lifetimePremium ? '✓' : '—'}
              </p>
              <p className="text-xs text-gray-500 mt-1">At 25 referrals</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Referrals</p>
              <p className="text-2xl font-bold text-blue-900">{referralData.stats.totalReferrals}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Active</p>
              <p className="text-2xl font-bold text-green-900">{referralData.stats.activeReferrals}</p>
            </div>
            <Check className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{referralData.stats.pendingReferrals}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Value Earned</p>
              <p className="text-2xl font-bold text-purple-900">
                ${(referralData.stats.earnedRewards / 100).toFixed(0)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Referral Link Section - keeping your existing beautiful design */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl shadow-xl p-8 border border-blue-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Referral Link
            </h2>
          </div>
          
          <div className="space-y-5">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Referral Code
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={referralData.referralCode}
                    readOnly
                    className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur font-mono text-xl font-bold text-gray-800 focus:outline-none focus:border-blue-400 transition-all group-hover:border-blue-300 shadow-sm"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-xl pointer-events-none"></div>
                </div>
                <button
                  onClick={() => copyToClipboard(referralData.referralCode)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                Referral Link
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={referralData.referralLink}
                    readOnly
                    className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur text-sm text-gray-700 focus:outline-none focus:border-purple-400 transition-all group-hover:border-purple-300 shadow-sm"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-xl pointer-events-none"></div>
                </div>
                <button
                  onClick={() => copyToClipboard(referralData.referralLink)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all flex items-center gap-2 font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95"
                >
                  <Copy className="w-5 h-5" />
                  Copy
                </button>
                {navigator.share && (
                  <button
                    onClick={shareReferral}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all flex items-center gap-2 font-medium shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105 active:scale-95"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 p-5 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl border border-blue-200/50 backdrop-blur">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Gift className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-1">How it works</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Share your referral link with friends. When they sign up and subscribe, you earn $2 per referral (max $50/year).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
   {/* ✅ ADD ANALYTICS SECTION HERE (BEFORE "Your Referrals") */}
      {referralsList.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Referral Analytics</h2>
          
          {(() => {
            const { emailCounts, statusByEmail } = getReferralAnalytics(referralsList);
            const duplicates = Object.entries(emailCounts).filter(([_, count]) => count > 1);
            const uniqueEmails = Object.keys(emailCounts).length;
            
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium">Unique Emails</p>
                    <p className="text-2xl font-bold text-blue-900">{uniqueEmails}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-yellow-600 font-medium">Duplicate Entries</p>
                    <p className="text-2xl font-bold text-yellow-900">{duplicates.length}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-medium">Conversion Rate</p>
                    <p className="text-2xl font-bold text-green-900">
                      {referralsList.length > 0 
                        ? Math.round((referralData.stats.activeReferrals / uniqueEmails) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
                
                {duplicates.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-yellow-800 mb-2">
                      ⚠️ Duplicate Entries Detected
                    </p>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {duplicates.map(([email, count]) => (
                        <li key={email}>
                          • {email}: {count} entries
                          {statusByEmail[email] && ` (${statusByEmail[email].active} active, ${statusByEmail[email].pending} pending)`}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-yellow-600 mt-2">
                      💡 Tip: Clean up duplicates to get accurate analytics
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Referrals List */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7" />
            Your Referrals
          </h2>
          <p className="text-blue-100 text-sm mt-1">Track your successful referrals</p>
        </div>
        
        <div className="p-6">
          {referralsList.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl mb-6">
                <Users className="w-20 h-20 text-gray-300" />
              </div>
              <p className="text-xl font-semibold text-gray-700 mb-2">No referrals yet</p>
              <p className="text-sm text-gray-500">
                Start sharing your referral link to earn rewards!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {referralsList.map((referral, index) => (
                <div key={referral.id || index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/30 to-purple-50/30 rounded-xl border border-gray-200 hover:border-blue-300 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{referral.email}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(referral.signedUpAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${
                      referral.status === 'active' 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
                        : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800'
                    }`}>
                      {referral.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralsView;