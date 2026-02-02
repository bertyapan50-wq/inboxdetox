import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Zap, 
  FolderOpen, 
  Calendar, 
  Brain, 
  Settings, 
  User, 
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Mail,
  Inbox,
  Archive,
  Send,
  FileEdit,
  Filter,
  Folder,
  Sliders,
  Link2,
  Receipt,
  Gift,
  Activity,
  Crown,
  Sparkles,
  AlertOctagon,  // For Spam
  Trash2          // For Trash
} from 'lucide-react';

const Sidebar = ({ currentView = 'inbox', setCurrentView, onOpenLabels, onOpenFollowUps, badges = {} }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
// 🔥 Trial progress logic
const totalTrialDays = 7;
const currentDay = 1; // pwede mo palitan later
const progressPercent = Math.min(
  (currentDay / totalTrialDays) * 100,
  100
);

 
const gradients = [
  'from-indigo-900 via-violet-900 to-purple-950',
  'from-slate-900 via-indigo-900 to-purple-900',
  'from-purple-900 via-fuchsia-900 to-indigo-900'
];

const [gradientIndex, setGradientIndex] = useState(0);
useEffect(() => {
  const interval = setInterval(() => {
    setGradientIndex((prev) => (prev + 1) % gradients.length);
  }, 8000); // slow = premium feel

  return () => clearInterval(interval);
}, []);


  const menuSections = [
    {
  title: '📧 EMAIL',
  items: [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      highlight: true,
      iconColor: 'text-indigo-300'  // ✅ ADD
    },
    { 
      id: 'inbox', 
      label: 'Inbox', 
      icon: Inbox, 
      badge: badges.unread || 0,
      iconColor: 'text-blue-300'  // ✅ ADD
    },
    { 
      id: 'archive', 
      label: 'Archive', 
      icon: Archive,
      iconColor: 'text-purple-300'  // ✅ ADD
    },
    { 
      id: 'sent', 
      label: 'Sent', 
      icon: Send,
      iconColor: 'text-green-300'  // ✅ ADD
    },
    { 
      id: 'drafts', 
      label: 'Drafts', 
      icon: FileEdit,
      badge: badges.drafts || 0,
      iconColor: 'text-yellow-300'  // ✅ ADD
    },
    { 
      id: 'spam', 
      label: 'Spam', 
      icon: AlertOctagon,
      badge: badges.spam || 0,
      warning: true,
      iconColor: 'text-orange-400'  // ✅ ADD
    },
    { 
      id: 'trash', 
      label: 'Trash', 
      icon: Trash2,
      badge: badges.trash || 0,
      danger: true,
      iconColor: 'text-red-400'  // ✅ ADD
    }
  ]
},
    {
      
  title: '🤖 AI TOOLS',
  items: [
    { 
      id: 'suggestions', 
      label: 'Suggestions', 
      icon: Zap,
      badge: badges.suggestions || 0,
      locked: badges.canUseCleanup === false,
      new: true         // ✅ ADD THIS
    },
    { 
      id: 'insights', 
      label: 'AI Insights', 
      icon: Brain,
      premium: true,    // ✅ ADD THIS
      new: true         // ✅ ADD THIS
    },
        { 
          id: 'smart-cleanup',
          label: 'Smart Cleanup', 
          icon: Sparkles,
          premium: true,
          badge: badges.smartCleanup || 0,
          new: true,
          locked: badges.canUseCleanup === false
        },
        { 
          id: 'smart-filters', 
          label: 'Smart Filters', 
          icon: Filter,
          new: true 
        },
        {
  id: 'auto-planner',
  label: 'Auto Planner', 
  icon: Calendar,
  new: true,
  highlight: true
}
        
      ]
    },

    {
  title: '📁 ORGANIZE',
  items: [
    { 
      id: 'labels', 
      label: 'Labels', 
      icon: FolderOpen, 
      action: onOpenLabels,
      iconColor: 'text-cyan-300'  // ✅ ADD
    },
    { 
      id: 'followups', 
      label: 'Follow-ups', 
      icon: Calendar, 
      action: onOpenFollowUps,
      badge: badges.followups || 0,
      iconColor: 'text-pink-300'  // ✅ ADD
    },
    { 
      id: 'categories', 
      label: 'Categories', 
      icon: Folder,
      iconColor: 'text-emerald-300'  // ✅ ADD
    }
  ]
},
    {
  title: '⚙️ SETTINGS',
  items: [
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      iconColor: 'text-yellow-400'
    },
    { 
      id: 'preferences', 
      label: 'Preferences', 
      icon: Sliders,
      
      iconColor: 'text-orange-400'  // ✅ ADD
    },
    { 
      id: 'connected-accounts', 
      label: 'Connected Accounts', 
      icon: Link2,
      
      iconColor: 'text-teal-300'  // ✅ ADD
    },
    { 
      id: 'subscription', 
      label: 'Subscription', 
      icon: Crown,
      highlight: true,
      important: true,
      gradientBg: true,
      badge: badges.trialDaysLeft || 0
      // No iconColor needed - special subscription styling
    }
  ]
},
    {
  title: '👤 ACCOUNT',
  items: [
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User,
      iconColor: 'text-blue-500'  // ✅ ADD
    },
    { 
      id: 'referrals', 
      label: 'Referrals', 
      icon: Gift,
      badge: badges.referrals || 0,
      new: true,
      iconColor: 'text-rose-300'  // ✅ ADD
    },
    { 
      id: 'activity-log', 
      label: 'Activity Log', 
      icon: Activity,
      
      iconColor: 'text-amber-300'  // ✅ ADD
    }
  ]
}
  ];

  const handleItemClick = (item) => {
    if (item.action) {
      item.action();
    } else {
      setCurrentView(item.id);
    }
  };

  const styles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(99, 102, 241, 0.1);
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(to bottom, rgba(99, 102, 241, 0.4), rgba(168, 85, 247, 0.4));
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(to bottom, rgba(99, 102, 241, 0.6), rgba(168, 85, 247, 0.6));
    }
    
    @keyframes pulse-slow {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.9;
        transform: scale(1.02);
      }
    }
    .animate-pulse-slow {
      animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }
    .animate-shimmer {
      animation: shimmer 3s infinite;
      background: linear-gradient(
        to right,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.3) 50%,
        rgba(255, 255, 255, 0) 100%
      );
      background-size: 1000px 100%;
    }
  /* ✅ ADD THIS - Icon shimmer glow */
  @keyframes icon-shimmer {
    0% {
      filter: drop-shadow(0 0 2px currentColor);
    }
    50% {
      filter: drop-shadow(0 0 8px currentColor) drop-shadow(0 0 12px currentColor);
    }
    100% {
      filter: drop-shadow(0 0 2px currentColor);
    }
  }
  .animate-icon-shimmer {
    animation: icon-shimmer 2s ease-in-out infinite;
  }

  `;

  return (
    <div 
  className={`bg-gradient-to-br ${gradients[gradientIndex]} text-white flex flex-col transition-all duration-1000 relative shadow-2xl ${
    isCollapsed ? 'w-20' : 'w-64'
  }`}
>

      <style>{styles}</style>

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none"></div>

      {/* Logo / Brand - CLICKABLE */}
      <button
        onClick={() => setCurrentView('dashboard')}
        className="relative p-6 border-b border-white/20 flex items-center justify-between hover:bg-white/10 transition-all duration-300 w-full group backdrop-blur-sm overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        {!isCollapsed && (
          <div className="flex items-center space-x-3 relative z-10">
            <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-indigo-400/50 transition-all duration-300 group-hover:scale-110">
              <Mail className="w-6 h-6" />
              <div className="absolute inset-0 bg-white/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <h1 className="font-bold text-lg group-hover:text-indigo-100 transition-colors duration-300">Gmail Cleanup AI</h1>
              <p className="text-xs text-indigo-200 group-hover:text-white transition-colors duration-300">Smart Cleanup</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto bg-white/20 p-2.5 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110 relative z-10">
            <Mail className="w-6 h-6" />
          </div>
        )}
      </button>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-20 -right-3 bg-white text-indigo-600 rounded-full p-1.5 shadow-xl hover:shadow-2xl transition-all duration-300 z-10 hover:scale-110 border-2 border-indigo-200"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Navigation */}
      <nav className="py-6 overflow-y-auto custom-scrollbar flex-1" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {menuSections.map((section, idx) => (
          <div key={idx} className="mb-6">
            {!isCollapsed && (
              <h3 className="px-6 text-xs font-bold text-indigo-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>{section.title}</span>
                <div className="flex-1 h-px bg-gradient-to-r from-white/30 to-transparent"></div>
              </h3>
            )}
            {isCollapsed && idx > 0 && (
              <div className="mx-auto w-8 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-3" />
            )}
            <div className="space-y-1.5 px-3">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                const isSubscription = item.id === 'subscription';
                const isSpam = item.id === 'spam';
                const isTrash = item.id === 'trash';
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    disabled={item.locked && !isSubscription}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                      item.locked && !isSubscription
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    } ${
                      isActive 
                        ? 'bg-white/15 backdrop-blur-sm shadow-lg shadow-white/10' 
                        : 'hover:bg-white/10 hover:shadow-md'
                    } ${
                      isSubscription
                        ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 hover:from-yellow-500 hover:via-orange-500 hover:to-pink-600 shadow-xl shadow-orange-500/50 animate-pulse-slow' 
                        : item.highlight 
                        ? 'bg-white/5 hover:bg-white/10' 
                        : ''
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                    title={isCollapsed ? item.label : ''}
                  >
                    {/* Hover gradient effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>

                   <div className="relative z-10">
  <Icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0 transition-all duration-300 animate-icon-shimmer ${
    isSubscription 
      ? 'text-white drop-shadow-lg animate-bounce' 
      : isActive
      ? 'text-white scale-110'
      : item.iconColor
      ? `${item.iconColor} group-hover:text-white`
      : item.premium 
      ? 'text-yellow-300 drop-shadow-lg' 
      : 'text-indigo-100 group-hover:text-white group-hover:scale-110'
  }`} />
                      
                      {/* Badge for counts */}
                      {item.badge > 0 && !item.locked && (
                        <span className={`absolute -top-2 -right-2 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg ${
                          isSpam 
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 shadow-yellow-500/50'
                            : isTrash
                            ? 'bg-gradient-to-r from-red-500 to-rose-500 shadow-red-500/50'
                            : 'bg-gradient-to-r from-red-500 to-pink-500 shadow-red-500/50'
                        }`}>
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                      
                      {/* Premium sparkle */}
                      {item.premium && !isCollapsed && !item.locked && (
                        <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 animate-pulse drop-shadow-lg" />
                      )}
                    </div>
                    
                    {!isCollapsed && (
  <div className="flex-1 flex items-center justify-between gap-1 relative z-10">
                        <span className={`font-medium text-sm transition-all duration-300 ${
                          isSubscription 
                            ? 'font-bold text-white drop-shadow-lg' 
                            : isActive
                            ? 'text-white font-semibold'
                            : item.highlight 
                            ? 'font-semibold text-indigo-100' 
                            : 'text-indigo-100 group-hover:text-white'
                        }`}>
                          {item.label}
                        </span>
                        
                        {/* Special "UPGRADE" Badge for Subscription */}
                        {isSubscription && (
                          <span className="text-xs bg-white text-orange-600 px-2.5 py-1 rounded-full font-bold shadow-lg animate-pulse">
                            UPGRADE
                          </span>
                        )}
                        
                        {/* "NEW" Badge */}
                        {item.new && !isSubscription && (
                          <span className="text-xs bg-gradient-to-r from-emerald-400 to-teal-400 text-white px-2.5 py-0.5 rounded-full font-bold animate-pulse shadow-lg">
                            NEW
                          </span>
                        )}
                        
                        {/* Lock Icon for Locked Features */}
                        {item.locked && !isCollapsed && (
                          <span className="text-yellow-300 text-sm animate-pulse" title="Premium feature locked - quota exhausted">
                            🔒
                          </span>
                        )}
                        
                        {/* Premium Badge (only show if NOT locked) */}
                        {item.premium && !item.locked && (
                          <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 px-2.5 py-0.5 rounded-full font-bold shadow-md">
                            PRO
                          </span>
                        )}
                        
                        {/* Count Badge (if no number badge) */}
                        {item.badge > 0 && !isCollapsed && !isSubscription && !item.locked && (
                          <span className={`ml-auto text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg ${
                            isSpam
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                              : isTrash
                              ? 'bg-gradient-to-r from-red-500 to-rose-500'
                              : 'bg-gradient-to-r from-red-500 to-pink-500'
                          }`}>
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Crown icon for subscription */}
                    {isSubscription && !isCollapsed && (
                      <Crown className="w-5 h-5 text-white animate-bounce drop-shadow-lg relative z-10" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
{!isCollapsed && (
  <div className="p-6 border-t border-white/20 backdrop-blur-sm space-y-4">

    {/* Existing Pro Tip Card */}
    <div className="relative bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-xl p-4 border border-white/30 shadow-xl overflow-hidden group">
      {/* Animated shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center space-x-2 mb-2">
          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse drop-shadow-lg" />
          <p className="text-xs text-white font-bold">💡 Pro Tip</p>
        </div>
        <p className="text-xs text-indigo-100 leading-relaxed">
          Use Smart AI Suggestions to quickly clean up old emails and save hours every week!
        </p>
      </div>
    </div>

  </div>
)}

    </div>
  );
};

export default Sidebar;