import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  RefreshCw, 
  Trash2, 
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Plus,
  Shield,
  Clock,
  Sparkles,
  Crown
} from 'lucide-react';

export default function ConnectedAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState({});
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadAccounts();
    
    // ✅ NEW: Check if returning from OAuth
    const returnFlag = localStorage.getItem('returnToConnectedAccounts');
    if (returnFlag) {
      localStorage.removeItem('returnToConnectedAccounts');
      showMessage('Account connected successfully! Refreshing...', 'success');
      setTimeout(() => loadAccounts(), 1000);
    }
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const response = await fetch('${process.env.REACT_APP_API_URL}/api/settings/connected-accounts', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setAccounts(data.accounts);
      } else {
        showMessage('Failed to load accounts', 'error');
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
      showMessage('Failed to load accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const syncAccount = async (accountId) => {
    setSyncing(prev => ({ ...prev, [accountId]: true }));
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/connected-accounts/${accountId}/sync`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        showMessage('Account sync initiated successfully', 'success');
        setTimeout(() => loadAccounts(), 2000);
      } else {
        showMessage(data.message || 'Failed to sync account', 'error');
      }
    } catch (error) {
      console.error('Error syncing account:', error);
      showMessage('Failed to sync account', 'error');
    } finally {
      setSyncing(prev => ({ ...prev, [accountId]: false }));
    }
  };

  const disconnectAccount = async (accountId, email) => {
    if (!window.confirm(`Disconnect ${email}? This will remove access to this account.`)) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/connected-accounts/${accountId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        showMessage('Account disconnected successfully', 'success');
        loadAccounts();
      } else {
        showMessage(data.message || 'Failed to disconnect account', 'error');
      }
    } catch (error) {
      console.error('Error disconnecting account:', error);
      showMessage('Failed to disconnect account', 'error');
    }
  };

  // ✅ IMPROVED: Connect new account with better redirect handling
  const connectNewAccount = () => {
    console.log('🔄 Connect Account button clicked');
    
    // Save flag to know we're returning from OAuth
    localStorage.setItem('returnToConnectedAccounts', 'true');
    
    // Use environment variable or fallback to localhost
    const apiUrl = process.env.REACT_APP_API_URL;
    const authUrl = `${apiUrl}/api/auth/google`;
    
    console.log('🚀 Redirecting to:', authUrl);
    
    // Redirect to Google OAuth
    window.location.href = authUrl;
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'from-emerald-400 to-teal-500';
      case 'syncing':
        return 'from-blue-400 to-cyan-500';
      case 'error':
        return 'from-red-400 to-pink-500';
      default:
        return 'from-slate-400 to-slate-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'syncing':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-600" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <span className="text-lg text-slate-600 font-medium">Loading accounts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 rounded-2xl shadow-lg shadow-indigo-500/50">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Connected Accounts
                  </h1>
                  <p className="text-slate-600 mt-1">Manage your connected email accounts</p>
                </div>
              </div>
              
              <button
                onClick={connectNewAccount}
                className="group relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/70 hover:scale-105"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                Connect Account
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`rounded-2xl p-5 flex items-center gap-3 animate-in slide-in-from-top duration-300 backdrop-blur-xl border ${
            message.type === 'success' 
              ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/50 shadow-lg shadow-emerald-500/20' 
              : 'bg-red-50/80 text-red-800 border-red-200/50 shadow-lg shadow-red-500/20'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 flex-shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* REST OF THE COMPONENT STAYS THE SAME... */}
        {/* (Keep all the existing account list UI) */}
        
        {/* Accounts List */}
        {accounts.length === 0 ? (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-16 text-center">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Mail className="w-16 h-16 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">No Connected Accounts</h3>
              <p className="text-slate-600 mb-8 text-lg">Connect your Gmail account to get started with smart email management</p>
              <button
                onClick={connectNewAccount}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 inline-flex items-center gap-3 shadow-xl shadow-indigo-500/50 hover:shadow-2xl hover:scale-105 font-semibold text-lg"
              >
                <Plus className="w-6 h-6" />
                Connect Gmail Account
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="group relative"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                
                {/* Card */}
                <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  {/* Header Gradient Bar */}
                  <div className={`h-2 bg-gradient-to-r ${getStatusColor(account.status)}`}></div>
                  
                  <div className="p-8">
                    {/* Account Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start gap-5 flex-1">
                        {/* Provider Icon */}
                        <div className="relative">
                          <div className={`bg-gradient-to-br ${getStatusColor(account.status)} p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <Mail className="w-8 h-8 text-white" />
                          </div>
                          {account.isPrimary && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 p-1.5 rounded-full shadow-lg">
                              <Crown className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        
                        {/* Account Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-2xl font-bold text-slate-800">{account.email}</h3>
                            {account.isPrimary && (
                              <span className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-sm font-bold px-3 py-1 rounded-full border border-amber-200/50 shadow-sm">
                                PRIMARY
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 capitalize font-medium">{account.provider} Account</p>
                        </div>

                        {/* Status Badge */}
                        <div className={`px-4 py-2 rounded-xl border text-sm font-bold flex items-center gap-2 shadow-lg bg-gradient-to-r ${
                          account.status === 'connected' 
                            ? 'from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200/50' 
                            : account.status === 'syncing'
                            ? 'from-blue-50 to-cyan-50 text-blue-700 border-blue-200/50'
                            : 'from-red-50 to-pink-50 text-red-700 border-red-200/50'
                        }`}>
                          {getStatusIcon(account.status)}
                          <span className="capitalize">{account.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100/50 hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
                            <Mail className="w-5 h-5 text-white" />
                          </div>
                          <p className="text-sm text-slate-600 font-semibold">Emails Processed</p>
                        </div>
                        <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {account.emailsProcessed?.toLocaleString() || 0}
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100/50 hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg">
                            <Clock className="w-5 h-5 text-white" />
                          </div>
                          <p className="text-sm text-slate-600 font-semibold">Last Sync</p>
                        </div>
                        <p className="text-xl font-bold text-slate-800">
                          {formatDate(account.lastSync)}
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100/50 hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-lg">
                            <Shield className="w-5 h-5 text-white" />
                          </div>
                          <p className="text-sm text-slate-600 font-semibold">Permissions</p>
                        </div>
                        <p className="text-xl font-bold text-slate-800">
                          {account.permissions?.length || 0} granted
                        </p>
                      </div>
                    </div>

                    {/* Permissions List */}
                    {account.permissions && account.permissions.length > 0 && (
                      <div className="mb-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200/50">
                        <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Granted Permissions
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {account.permissions.map((permission, idx) => (
                            <span
                              key={idx}
                              className="bg-white text-indigo-700 text-sm font-semibold px-4 py-2 rounded-xl border border-indigo-200/50 shadow-sm hover:shadow-md transition-shadow capitalize"
                            >
                              {permission}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-6 border-t border-slate-200/50">
                      <button
                        onClick={() => syncAccount(account.id)}
                        disabled={syncing[account.id] || account.status === 'syncing'}
                        className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
                      >
                        {syncing[account.id] || account.status === 'syncing' ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-5 h-5" />
                            Sync Now
                          </>
                        )}
                      </button>

                      <button
                        className="px-5 py-3 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
                        title="Account Settings"
                      >
                        <Settings className="w-5 h-5" />
                        Settings
                      </button>

                      {!account.isPrimary && (
                        <button
                          onClick={() => disconnectAccount(account.id, account.email)}
                          className="px-5 py-3 bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 text-red-700 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
                        >
                          <Trash2 className="w-5 h-5" />
                          Disconnect
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 border border-blue-200/50 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
            <div className="flex gap-5">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl h-fit shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-3 text-lg">About Connected Accounts</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                    <span>Your primary account cannot be disconnected</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                    <span>Sync pulls latest emails from your Gmail inbox</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                    <span>We only access emails you explicitly grant permission for</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                    <span>You can revoke access anytime from your Google Account settings</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in-from-top {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}