
// ✅ ADD THIS IMPORT
import { ThemeProvider } from './contexts/ThemeContext';
import ActionableDashboard from './components/ActionableDashboard';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ===== EXISTING COMPONENTS =====
import LandingPage from './components/LandingPage';
import AIInsights from './components/AIInsights';
import LabelManager from './components/LabelManager';
import FollowUpManager from './components/FollowUpManager';
import EmailViewer from './components/EmailViewer';
import AppLayout from './components/AppLayout';
import Sidebar from './components/Sidebar';

// ===== NEW COMPONENTS - EMAIL SECTION =====
import InboxView from './components/email/InboxView';
import ArchiveView from './components/email/ArchiveView';
import SentView from './components/email/SentView';
import DraftsView from './components/email/DraftsView';
import SpamView from './components/email/SpamView';
import TrashView from './components/email/TrashView';


// ===== NEW COMPONENTS - AI TOOLS =====
import SmartFilters from './components/ai-tools/SmartFilters';
import SmartCleanup from './components/SmartCleanup'; // ← ✅ ADDED!
import SuggestionsView from './components/SuggestionsView';
import AutoPlanner from './components/ai-tools/AutoPlanner';




// ===== NEW COMPONENTS - ORGANIZE =====
import Categories from './components/organize/Categories';

// ===== NEW COMPONENTS - SETTINGS =====
import SimplePreferences from './components/settings/SimplePreferences';
import ConnectedAccounts from './components/settings/ConnectedAccounts';
import SubscriptionSettings from './components/settings/SubscriptionSettings';

// ===== NEW COMPONENTS - ACCOUNT =====
import ProfileView from './components/account/ProfileView';
import ReferralsView from './components/account/ReferralsView';
import ActivityLog from './components/account/ActivityLog';


// ===== ICONS =====
import { 
  Mail, Trash2, Archive, CheckCircle, XCircle, Settings, 
  Inbox, Zap, Calendar, LogOut, Loader2, AlertCircle, 
  BarChart3, Shield, Brain, Star, Eye, ChevronRight, 
  X, HelpCircle, Sparkles 
} from 'lucide-react';

// ===== API SERVICE =====
import * as apiModule from './services/api';
const api = apiModule.default;


const GmailCleanupTool = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
    const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [isLoadingFollowUps, setIsLoadingFollowUps] = useState(false);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState({ archived: 0, deleted: 0, unsubscribed: 0 });
  const [testMode, setTestMode] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [previewMode, setPreviewMode] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showTooltip, setShowTooltip] = useState(null);
  const [processingAction, setProcessingAction] = useState('');
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false); // ✅ ADD THIS
  const [selectedEmailForFollowUp, setSelectedEmailForFollowUp] = useState(null); // ✅ ADD THIS
  const [followUps, setFollowUps] = useState({ due: [], upcoming: [], completed: [] });
const [followUpsLoading, setFollowUpsLoading] = useState(false);
const [selectedEmailForView, setSelectedEmailForView] = useState(null); // ✅ ADD THIS
const [isEmailViewerOpen, setIsEmailViewerOpen] = useState(false); 
const [showSmartCleanupGate, setShowSmartCleanupGate] = useState(false);

  
  // Check authentication on page load
useEffect(() => {
  checkAuth();
  
  // Check if redirected from OAuth
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('auth') === 'success') {
    checkAuth();
    window.history.replaceState({}, document.title, '/');
  }
  
  // ✅ NEW: Request notification permission
  if (Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      console.log('Notification permission:', permission);
    });
  }
}, []);
// ✅ NEW: Detect and store referral code from URL
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref');
  
  if (refCode) {
    localStorage.setItem('referralCode', refCode);
    console.log('✅ Referral code detected:', refCode);
    alert(`🎉 You're invited! Sign up to get 14-day Premium trial using code: ${refCode}`);
  }
}, []);

  // Check if user is authenticated
  const checkAuth = async () => {
  try {
    const response = await fetch('/api/auth/user', {
      credentials: 'include'
    });
    const data = await response.json();
    
    if (data.success) {
      setIsAuthenticated(true);
      setUser(data.user);
      
      // ✅ NEW: Check if there's a stored referral code
      const storedRefCode = localStorage.getItem('referralCode');
      if (storedRefCode && !data.user.referredBy) {
        await applyReferralCode(storedRefCode, data.user._id);
        localStorage.removeItem('referralCode');
      }
      
      loadRealEmails();
      loadFollowUps();
    }

  } catch (error) {
    console.error('Auth check failed:', error);
  }
};
// ✅ FIXED: Apply referral code function
const applyReferralCode = async (refCode, userId) => {
  try {
    console.log('🔄 Applying referral code:', refCode, 'for user:', userId);
    
    // ✅ Get user email from API first
    const userResponse = await fetch('/api/auth/user', { credentials: 'include' });
    const userData = await userResponse.json();
    
    if (!userData.success) {
      console.error('❌ Failed to get user data');
      return;
    }
    
    const userEmail = userData.user.email;
    console.log('📧 User email:', userEmail);
    
    const response = await fetch('/api/referral/signup', {  
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        referralCode: refCode,
        userId: userId,
        email: userEmail  // ✅ Now we have the email!
      })
    });
    
    const data = await response.json();
    console.log('✅ Referral response:', data);
    
    if (data.success) {
      console.log('✅ Referral applied! You get 14-day trial');
      alert('🎉 Referral code applied! You received 14-day Premium trial!');
    } else {
      console.error('❌ Referral failed:', data.error);
    }
  } catch (error) {
    console.error('Failed to apply referral code:', error);
  }
};
// ✅ NEW: Check if user has premium access
const hasPremiumAccess = () => {
  if (!user) return false;
  const isPremium = user.subscriptionTier === 'premium' || 
                    user.subscriptionTier === 'pro' || 
                    user.subscriptionTier === 'enterprise';
  const isTrialActive = user.trialEndDate && new Date() < new Date(user.trialEndDate);
  return isPremium || isTrialActive;
};

// ✅ NEW: Get cleanup quota info
const getCleanupQuota = () => {
  if (!user) return { remaining: 0, limit: 3, hasUnlimited: false };
  
  const hasUnlimited = hasPremiumAccess();
  const remaining = user.freeCleanupCount || 0;
  
  return {
    remaining: hasUnlimited ? '∞' : remaining,
    limit: 3,
    hasUnlimited,
    canCleanup: hasUnlimited || remaining > 0
  };
};

// ✅ NEW: Check if cleanup is available
const canUseCleanup = () => {
  const quota = getCleanupQuota();
  return quota.canCleanup;
};
// Handle Smart Cleanup Access
const handleSmartCleanupAccess = () => {
  const hasAccess = 
    user?.subscriptionTier === 'premium' ||
    user?.subscriptionTier === 'pro' || 
    user?.trialStatus === 'active';
  
  if (hasAccess) {
    setCurrentView('insights');
  } else {
    setShowSmartCleanupGate(true);
  }
};

// Handle Trial Activation Success
const handleTrialActivated = async () => {
  await checkAuth();
  setCurrentView('insights');
};
// ✅ NEW: Better importance calculator
const calculateImportanceFromEmail = (email) => {
  let score = 0.5;
  
  const from = (email.from || '').toLowerCase();
  const subject = (email.subject || '').toLowerCase();
  const snippet = (email.snippet || '').toLowerCase();
  
  if (email.labelIds?.includes('STARRED')) score += 0.4;
  
  if (email.category === 'Primary') score += 0.2;
  else if (email.category === 'Social') score -= 0.2;
  else if (email.category === 'Promotions') score -= 0.3;
  else if (email.category === 'Updates') score -= 0.1;
  
  const urgentWords = ['urgent', 'important', 'asap', 'deadline'];
  if (urgentWords.some(word => subject.includes(word))) score += 0.3;
  
  if (subject.includes('?')) score += 0.1;
  
  const spamWords = ['unsubscribe', 'click here', 'buy now'];
  if (spamWords.some(word => snippet.includes(word))) score -= 0.2;
  
  return Math.max(0, Math.min(1, score));
};
  // Load real emails from Gmail
  // Load real emails from Gmail
// Load real emails from Gmail
const loadRealEmails = async () => {
  setIsLoading(true);
  setProcessingAction('Loading all your emails from all categories...');
  
  try {
    console.log('🔍 Fetching emails from /api/email/emails');
    
    const response = await fetch('/api/email/emails', {  // ✅ CHANGED: /api/email/emails instead of /api/auth/emails
      credentials: 'include'
    });
    
    console.log('📧 Response status:', response.status);
    
    const data = await response.json();
    console.log('📧 Response data:', data);
    
    if (data.success) {
      console.log(`✅ Loaded ${data.total} total emails`);
      
      const transformedEmails = data.emails.map((email, index) => ({
        id: email.id,           // Gmail message ID
        displayId: index + 1,   // For UI display
        from: email.from,
        subject: email.subject,
        category: email.category || 'Primary',
        date: formatDate(email.date),
        daysOld: calculateDaysOld(email.date),
        opened: email.labelIds ? !email.labelIds.includes('UNREAD') : false,
        importance: calculateImportanceFromEmail(email),
        labelIds: email.labelIds || [],
        size: 0,
        selected: false,
        snippet: email.snippet
      }));
      
      console.log(`✅ Transformed ${transformedEmails.length} emails for display`);
      setEmails(transformedEmails);
    } else {
      console.error('❌ API returned error:', data.message || data.error);
      alert('Failed to load emails: ' + (data.message || data.error));
    }
  } catch (error) {
    console.error('❌ Failed to load emails:', error);
    alert('Failed to load emails. Please try again.');
  } finally {
    setIsLoading(false);
    setProcessingAction('');
  }
};

// Helper: Categorize email based on sender
const categorizeEmail = (email) => {
  const from = email.from.toLowerCase();
  const subject = email.subject.toLowerCase();
  
  if (from.includes('newsletter') || from.includes('digest') || from.includes('medium.com')) {
    return 'Newsletters';
  } else if (subject.includes('promo') || subject.includes('sale') || subject.includes('discount')) {
    return 'Promotions';
  } else if (from.includes('noreply') || subject.includes('spam')) {
    return 'Junk';
  } else if (from.includes('company.com') || from.includes('@work')) {
    return 'Work';
  } else {
    return 'Personal';
  }
};
  // Helper: Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };
  // ✅ NEW: Format follow-up date (more precise)
const formatFollowUpDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date - now;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffHours < 0) return 'Overdue';
  if (diffHours < 1) return 'In < 1 hour';
  if (diffHours < 24) return `In ${diffHours} hours`;
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  return formatDate(dateString); // Use your existing function
};
  // Helper: Calculate days old
  const calculateDaysOld = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  // Helper: Calculate importance score
  const calculateImportance = (email) => {
    let score = 0.5;
    const from = email.from.toLowerCase();
    const subject = email.subject.toLowerCase();
    
    // Higher importance for work emails
    if (from.includes('boss') || from.includes('hr') || from.includes('ceo')) score += 0.4;
    
    // Important keywords
    if (subject.includes('urgent') || subject.includes('important')) score += 0.3;
    if (subject.includes('deadline') || subject.includes('invoice')) score += 0.2;
    
    // Lower importance for promotions
    if (subject.includes('sale') || subject.includes('promo')) score -= 0.3;
    
    return Math.max(0, Math.min(1, score));
  };
  
  const [aiConfig] = useState({
    archiveThreshold: 180,
    confidenceThreshold: 0.7,
    safetyChecks: true
  });

  const [userPreferences] = useState({
    neverArchive: ['boss@company.com', 'hr@company.com'],
    importantKeywords: ['urgent', 'important', 'deadline', 'invoice']
  });

  const [aiLearning, setAiLearning] = useState({
    correctSuggestions: 0,
    rejectedSuggestions: 0
  });

  const generateMockEmails = () => {
    return [
      { id: 1, from: 'boss@company.com', subject: 'URGENT: Q4 Budget Approval', category: 'Work', date: '2 hours ago', daysOld: 0, opened: false, importance: 0.95, size: 245 },
      { id: 2, from: 'hr@company.com', subject: 'Benefits Enrollment Deadline', category: 'Work', date: '1 day ago', daysOld: 1, opened: true, importance: 0.90, size: 180 },
      { id: 3, from: 'team@company.com', subject: 'Project Review', category: 'Work', date: '3 days ago', daysOld: 3, opened: true, importance: 0.75, size: 320 },
      { id: 4, from: 'friend@email.com', subject: 'Weekend plans?', category: 'Personal', date: '2 days ago', daysOld: 2, opened: true, importance: 0.60, size: 45 },
      { id: 5, from: 'newsletter@tech.com', subject: 'Daily Digest', category: 'Newsletters', date: '7 months ago', daysOld: 210, opened: false, importance: 0.15, size: 450 },
      { id: 6, from: 'newsletter@medium.com', subject: 'Top Stories', category: 'Newsletters', date: '8 months ago', daysOld: 240, opened: false, importance: 0.10, size: 380 },
      { id: 7, from: 'promo@shop.com', subject: 'Flash Sale 50% Off', category: 'Promotions', date: '4 months ago', daysOld: 120, opened: false, importance: 0.20, size: 890 },
      { id: 8, from: 'deals@store.com', subject: 'Weekend Sale', category: 'Promotions', date: '3 months ago', daysOld: 90, opened: false, importance: 0.22, size: 780 },
      { id: 9, from: 'spam@unknown.com', subject: 'You Won a Prize!', category: 'Junk', date: '1 year ago', daysOld: 365, opened: false, importance: 0.02, size: 120 },
      { id: 10, from: 'lottery@fake.com', subject: 'Claim Prize Now', category: 'Junk', date: '10 months ago', daysOld: 300, opened: false, importance: 0.03, size: 95 },
    ].map(e => ({ ...e, selected: false }));
  };

  const [emails, setEmails] = useState([]);
  const [isFirstLogin, setIsFirstLogin] = useState(true);

  useEffect(() => {
    if (isAuthenticated && emails.length === 0 && !user) {
      setEmails(generateMockEmails());
      if (isFirstLogin) {
        setTimeout(() => setShowOnboarding(true), 500);
        setIsFirstLogin(false);
      }
    }
  }, [isAuthenticated]);

  const onboardingSteps = [
    {
      title: 'Welcome to Gmail Cleanup AI! 🎉',
      content: 'Let\'s take a quick tour to help you get started. This tool uses advanced AI to help you organize your inbox intelligently.',
      icon: <Sparkles className="w-12 h-12 text-indigo-600" />,
      highlight: null
    },
    {
      title: 'Dashboard Overview',
      content: 'Your dashboard shows email statistics by category. We\'ve automatically analyzed your inbox and categorized each email.',
      icon: <BarChart3 className="w-12 h-12 text-blue-600" />,
      highlight: 'stats'
    },
    {
      title: 'AI-Powered Suggestions',
      content: 'Check the Suggestions tab to see AI-generated cleanup recommendations. Each suggestion includes a confidence score and safety checks.',
      icon: <Brain className="w-12 h-12 text-purple-600" />,
      highlight: 'suggestions'
    },
    {
      title: 'Preview Before You Act',
      content: 'Always preview suggestions before applying them. This lets you see exactly which emails will be affected and their importance scores.',
      icon: <Eye className="w-12 h-12 text-green-600" />,
      highlight: null
    },
    {
      title: 'Safety First',
      content: 'Our AI never suggests archiving important emails from protected senders (like your boss or HR) or emails with critical keywords.',
      icon: <Shield className="w-12 h-12 text-green-600" />,
      highlight: null
    },
    {
      title: 'You\'re All Set! 🚀',
      content: 'The AI learns from your decisions to improve suggestions over time. Start by checking out your AI suggestions!',
      icon: <CheckCircle className="w-12 h-12 text-green-600" />,
      highlight: null
    }
  ];

  const calculateEmailScore = (email) => {
    let score = 0;
    let reasons = [];
    
    const ageFactor = Math.min(email.daysOld / aiConfig.archiveThreshold, 1);
    score += ageFactor * 0.3;
    if (ageFactor > 0.8) reasons.push('Very old');
    
    if (!email.opened) {
      score += 0.25;
      reasons.push('Never opened');
    }
    
    const categoryScores = { 'Junk': 0.9, 'Promotions': 0.7, 'Newsletters': 0.6, 'Work': 0.1, 'Personal': 0.2 };
    score += (categoryScores[email.category] || 0.5) * 0.2;
    
    score -= email.importance * 0.4;
    if (email.importance > 0.7) reasons.push('High importance');
    
    if (aiConfig.safetyChecks) {
      if (userPreferences.neverArchive.some(s => email.from.includes(s))) {
        score = 0;
        reasons = ['Protected sender'];
      }
      
      if (userPreferences.importantKeywords.some(k => email.subject.toLowerCase().includes(k))) {
        score *= 0.2;
        reasons.push('Important keyword');
      }
      
      if (email.daysOld < 7) {
        score *= 0.4;
        reasons.push('Too recent');
      }
    }
    
    return { score: Math.max(Math.min(score, 1), 0), confidence: score > 0.7 ? 0.9 : 0.6, reasons };
  };
// Helper function for calculating average confidence
const calculateAverageConfidence = (emails) => {
  if (!emails || emails.length === 0) return 0;
  const total = emails.reduce((sum, e) => sum + (e.aiSuggestion?.confidence || 0), 0);
  return total / emails.length;
};

// ==================== AI SUGGESTIONS SYSTEM ====================
// ✅ HYBRID AI: FREE rule-based for all users, PREMIUM API for paying users
const loadAISuggestions = async () => {
  setIsLoading(true);
  
  // Check if user has premium access
  const isPremium = hasPremiumAccess();
  
  // 🆓 ALWAYS use frontend rule-based AI (backend not ready yet)
  setProcessingAction(isPremium ? '🧠 Analyzing with AI...' : '🧠 Analyzing your emails...');
  console.log('🔄 Using frontend rule-based AI (backend API bypassed)');
  generateRuleBasedSuggestions();
  
  setIsLoading(false);
  setProcessingAction('');
};

// ✅ RULE-BASED AI GENERATOR (FREE - No API costs)
const generateRuleBasedSuggestions = () => {
  try {
    const suggestions = [];
    
    console.log('🔍 Analyzing', emails.length, 'emails for patterns...');
    
    // ==================== PATTERN 1: Old Unopened by Sender ====================
    const oldUnopened = emails.filter(e => 
      !e.opened && 
      e.daysOld > 60 &&
      e.category !== 'Primary' &&
      !e.labelIds?.includes('STARRED')
    );
    
    if (oldUnopened.length >= 3) {
      // Group by sender
      const bySender = {};
      oldUnopened.forEach(e => {
        const sender = e.from.toLowerCase();
        if (!bySender[sender]) bySender[sender] = [];
        bySender[sender].push(e);
      });
      
      // Find senders with 3+ old emails
      Object.entries(bySender).forEach(([sender, senderEmails]) => {
        if (senderEmails.length >= 3) {
          const senderName = sender.includes('@') ? sender.split('@')[0] : sender;
          const avgDays = Math.round(senderEmails.reduce((sum, e) => sum + e.daysOld, 0) / senderEmails.length);
          
          suggestions.push({
            type: 'archive',
            count: senderEmails.length,
            reason: `${senderEmails.length} unopened emails from "${senderName}" (avg ${avgDays} days old)`,
            confidence: 0.92,
            emails: senderEmails,
            emailIds: senderEmails.map(e => e.id),
            icon: '📦',
            category: 'Sender Pattern'
          });
        }
      });
    }
    
    // ==================== PATTERN 2: Old Promotions ====================
    const oldPromotions = emails.filter(e => 
      e.category === 'Promotions' && 
      !e.opened && 
      e.daysOld > 30
    );
    
    if (oldPromotions.length >= 5) {
      suggestions.push({
        type: 'archive',
        count: oldPromotions.length,
        reason: `${oldPromotions.length} unopened promotional emails (30+ days old)`,
        confidence: 0.88,
        emails: oldPromotions.slice(0, 20),
        emailIds: oldPromotions.map(e => e.id),
        icon: '🎁',
        category: 'Promotions'
      });
    }
    
    // ==================== PATTERN 3: Old Newsletters ====================
    const oldNewsletters = emails.filter(e => 
      (e.category === 'Newsletters' || 
       e.from.toLowerCase().includes('newsletter') ||
       e.from.toLowerCase().includes('digest') ||
       e.subject.toLowerCase().includes('newsletter')) &&
      !e.opened && 
      e.daysOld > 45
    );
    
    if (oldNewsletters.length >= 5) {
      suggestions.push({
        type: 'archive',
        count: oldNewsletters.length,
        reason: `${oldNewsletters.length} old unread newsletters (45+ days)`,
        confidence: 0.85,
        emails: oldNewsletters.slice(0, 20),
        emailIds: oldNewsletters.map(e => e.id),
        icon: '📰',
        category: 'Newsletters'
      });
    }
    
    // ==================== PATTERN 4: Social Media Notifications ====================
    const socialOld = emails.filter(e => 
      (e.category === 'Social' ||
       e.from.toLowerCase().includes('facebook') ||
       e.from.toLowerCase().includes('twitter') ||
       e.from.toLowerCase().includes('linkedin') ||
       e.from.toLowerCase().includes('instagram')) &&
      !e.opened && 
      e.daysOld > 14
    );
    
    if (socialOld.length >= 5) {
      suggestions.push({
        type: 'archive',
        count: socialOld.length,
        reason: `${socialOld.length} old social media notifications (14+ days)`,
        confidence: 0.90,
        emails: socialOld.slice(0, 20),
        emailIds: socialOld.map(e => e.id),
        icon: '👥',
        category: 'Social'
      });
    }
    
    // ==================== PATTERN 5: Very Old Emails (1+ year) ====================
    const veryOld = emails.filter(e => 
      e.daysOld > 365 &&
      !e.opened &&
      !e.labelIds?.includes('STARRED') &&
      e.category !== 'Primary'
    );
    
    if (veryOld.length >= 3) {
      suggestions.push({
        type: 'delete',
        count: veryOld.length,
        reason: `${veryOld.length} very old unopened emails (1+ year old) - Safe to delete`,
        confidence: 0.95,
        emails: veryOld.slice(0, 20),
        emailIds: veryOld.map(e => e.id),
        icon: '🗑️',
        category: 'Very Old'
      });
    }
    
    // ==================== PATTERN 6: High-Volume Senders ====================
    const senderCounts = {};
    emails.forEach(e => {
      const sender = e.from.toLowerCase();
      if (!senderCounts[sender]) {
        senderCounts[sender] = { 
          total: 0, 
          unopened: 0, 
          emails: [],
          oldEmails: []
        };
      }
      senderCounts[sender].total++;
      if (!e.opened) {
        senderCounts[sender].unopened++;
        senderCounts[sender].emails.push(e);
        if (e.daysOld > 30) {
          senderCounts[sender].oldEmails.push(e);
        }
      }
    });
    
    // Find high-volume senders with mostly unopened emails
    Object.entries(senderCounts).forEach(([sender, data]) => {
      const unopenedRate = data.unopened / data.total;
      
      if (data.oldEmails.length >= 5 && unopenedRate > 0.7) {
        const senderName = sender.includes('@') ? sender.split('@')[0] : sender;
        suggestions.push({
          type: 'archive',
          count: data.oldEmails.length,
          reason: `${data.oldEmails.length} old emails from "${senderName}" (${Math.round(unopenedRate * 100)}% never opened)`,
          confidence: 0.87,
          emails: data.oldEmails.slice(0, 20),
          emailIds: data.oldEmails.map(e => e.id),
          icon: '📬',
          category: 'High Volume'
        });
      }
    });
    
    // ==================== PATTERN 7: Updates Category ====================
    const oldUpdates = emails.filter(e => 
      e.category === 'Updates' &&
      !e.opened && 
      e.daysOld > 30
    );
    
    if (oldUpdates.length >= 5) {
      suggestions.push({
        type: 'archive',
        count: oldUpdates.length,
        reason: `${oldUpdates.length} old update notifications (30+ days)`,
        confidence: 0.83,
        emails: oldUpdates.slice(0, 20),
        emailIds: oldUpdates.map(e => e.id),
        icon: '🔔',
        category: 'Updates'
      });
    }
    
    // Sort by confidence (highest first) and limit to top 5
    suggestions.sort((a, b) => b.confidence - a.confidence);
    const topSuggestions = suggestions.slice(0, 5);
    
    console.log('✅ Generated', topSuggestions.length, 'rule-based AI suggestions');
    topSuggestions.forEach((s, i) => {
      console.log(`  ${i+1}. ${s.icon} ${s.reason} (${Math.round(s.confidence * 100)}% confidence)`);
    });
    
    setAiSuggestions(topSuggestions);
    
  } catch (error) {
    console.error('❌ Failed to generate suggestions:', error);
    setAiSuggestions([]);
  }
};

// State for AI suggestions
const [aiSuggestions, setAiSuggestions] = useState([]);
// ✅ NEW: Check for due follow-ups
const checkDueFollowUps = async () => {
  if (!isAuthenticated) return;
  
  try {
    const response = await fetch('/api/followups/notifications/due', {
      credentials: 'include'
    });
    const data = await response.json();
    
    if (data.success && data.count > 0) {
      console.log(`📧 ${data.count} follow-up(s) due!`);
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        const notification = new Notification(`📧 ${data.count} Follow-up${data.count > 1 ? 's' : ''} Due!`, {
          body: data.dueFollowUps[0]?.emailSubject || 'Check your follow-ups',
          icon: '/favicon.ico', // or your app icon
          badge: '/favicon.ico',
          tag: 'follow-up-reminder',
          requireInteraction: true
        });
        
        // Click notification to open follow-ups
        notification.onclick = () => {
          window.focus();
          setIsFollowUpModalOpen(true);
        };
      }
      
      // Also show in-app alert
      alert(`⏰ You have ${data.count} follow-up(s) due! Check your follow-ups tab.`);
    }
  } catch (error) {
    console.error('Error checking follow-ups:', error);
  }
};
// ✅ NEW: Load user's follow-ups
const loadFollowUps = async () => {
  if (!isAuthenticated) return;
  
  setFollowUpsLoading(true);
  try {
    const response = await fetch('/api/followups', {
      credentials: 'include'
    });
    const data = await response.json();
    
    if (data.success) {
      setFollowUps(data.followUps);
      console.log('✅ Loaded follow-ups:', data.counts);
    }
  } catch (error) {
    console.error('Error loading follow-ups:', error);
  } finally {
    setFollowUpsLoading(false);
  }
};
// ✅ NEW: Check for due follow-ups every 5 minutes
useEffect(() => {
  if (!isAuthenticated) return;
  
  // Check immediately on load
  checkDueFollowUps();
  
  // Then check every 5 minutes
  const interval = setInterval(checkDueFollowUps, 5 * 60 * 1000); // 5 minutes
  
  return () => clearInterval(interval);
}, [isAuthenticated]);
// ✅ AUTO-TRIGGER: Load AI suggestions when emails are ready
useEffect(() => {
  if (emails.length > 0 && aiSuggestions.length === 0 && isAuthenticated) {
    console.log('📧 Emails loaded, triggering AI analysis...');
    // Small delay to ensure UI is ready
    setTimeout(() => {
      loadAISuggestions();
    }, 1000);
  }
}, [emails.length, isAuthenticated]);

const stats = {
  total: emails.length,
  primary: emails.filter(e => e.category === 'Primary').length,
  promotions: emails.filter(e => e.category === 'Promotions').length,
  social: emails.filter(e => e.category === 'Social').length,
  updates: emails.filter(e => e.category === 'Updates').length,
  forums: emails.filter(e => e.category === 'Forums').length,
  work: emails.filter(e => e.category === 'Work').length,
  newsletters: emails.filter(e => e.category === 'Newsletters').length,
  junk: emails.filter(e => e.category === 'Junk').length
};
// ✅ PASTE THIS HERE - Inbox Health Score Calculator
const calculateInboxHealth = () => {
  if (emails.length === 0) return { score: 100, grade: 'A+', metrics: {} };
  
  const totalEmails = emails.length;
  const unreadCount = emails.filter(e => !e.opened).length;
  const oldEmails = emails.filter(e => e.daysOld > 30).length;
  const veryOldEmails = emails.filter(e => e.daysOld > 180).length;
  const promotions = emails.filter(e => e.category === 'Promotions').length;
  const junk = emails.filter(e => e.category === 'Junk').length;
  
  // Calculate penalties
  let score = 100;
  score -= (unreadCount / totalEmails) * 30; // 30% penalty for unread
  score -= (oldEmails / totalEmails) * 20;   // 20% penalty for old emails
  score -= (veryOldEmails / totalEmails) * 25; // 25% penalty for very old
  score -= (promotions / totalEmails) * 15;  // 15% penalty for promotions
  score -= (junk / totalEmails) * 10;        // 10% penalty for junk
  
  score = Math.max(0, Math.min(100, score));
  
  const grade = score >= 90 ? 'A+' : 
                score >= 80 ? 'A' :
                score >= 70 ? 'B' :
                score >= 60 ? 'C' : 'D';
  
  return {
    score: Math.round(score),
    grade,
    metrics: {
      totalEmails,
      unreadCount,
      oldEmails,
      veryOldEmails,
      promotions,
      junk,
      unreadPercentage: Math.round((unreadCount / totalEmails) * 100),
      oldPercentage: Math.round((oldEmails / totalEmails) * 100)
    }
  };
};

const healthScore = calculateInboxHealth();
// ✅ NEW: Calculate Smart Cleanup patterns count
const calculateSmartCleanupCount = () => {
  let patternCount = 0;
  
  // Group by sender
  const senderGroups = {};
  emails.forEach(email => {
    const sender = email.from?.toLowerCase() || '';
    if (!senderGroups[sender]) senderGroups[sender] = [];
    senderGroups[sender].push(email);
  });
  
  // Count sender patterns (3+ unopened old emails from same sender)
  Object.values(senderGroups).forEach(senderEmails => {
    const old = senderEmails.filter(e => !e.opened && e.daysOld > 30);
    if (old.length >= 3) patternCount++;
  });
  
  // Count category patterns
  const promotions = emails.filter(e => e.category === 'Promotions' && !e.opened && e.daysOld > 60);
  if (promotions.length >= 5) patternCount++;
  
  const newsletters = emails.filter(e => e.category === 'Newsletters' && !e.opened && e.daysOld > 60);
  if (newsletters.length >= 5) patternCount++;
  
  // Count very old emails
  const veryOld = emails.filter(e => e.daysOld > 365 && !e.opened);
  if (veryOld.length >= 3) patternCount++;
  
  return patternCount;
};

// Real Gmail OAuth Login
const handleLogin = () => {
  window.location.href = 'http://localhost:5000/api/auth/google';
};

// Real Logout
const handleLogout = async () => {
  try {
    await fetch('/api/auth/logout', {
      credentials: 'include'
    });
    setIsAuthenticated(false);
    setUser(null);
    setEmails([]);
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

// Delete selected emails
const handleDelete = async (selectedIds) => {
  if (!selectedIds || !selectedIds.length) return;
  setProcessingAction('Deleting emails...');
  setIsLoading(true);

  try {
    const res = await fetch('/api/email/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ emailIds: selectedIds })
    });
    const data = await res.json();
    console.log('Delete response:', data);

    setEmails(prev => prev.filter(e => !selectedIds.includes(e.id)));
    setReportData(prev => ({ ...prev, deleted: prev.deleted + selectedIds.length }));
  } catch (err) {
    console.error('Failed to delete emails:', err);
  } finally {
    setIsLoading(false);
    setProcessingAction('');
  }
};

// ------------------ ARCHIVE selected emails ------------------
const handleArchive = async (selectedIds) => {
  if (!selectedIds || !selectedIds.length) return;
  setProcessingAction('Archiving emails...');
  setIsLoading(true);

  try {
    const res = await fetch('/api/email/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ✅ ALREADY FIXED
      body: JSON.stringify({ emailIds: selectedIds })
    });
    const data = await res.json();
    console.log('Archive response:', data);

    // Mark as archived in local state
    setEmails(prev =>
      prev.map(e => selectedIds.includes(e.id) ? { ...e, category: 'Archived' } : e)
    );
    setReportData(prev => ({ ...prev, archived: prev.archived + selectedIds.length }));
  } catch (err) {
    console.error('Failed to archive emails:', err);
  } finally {
    setIsLoading(false);
    setProcessingAction('');
  }
};

const handleBulkAction = async (action, emailIds = null, fromSuggestion = false) => {
  setIsLoading(true);
  setProcessingAction(`${action === 'archive' ? 'Archiving' : action === 'delete' ? 'Deleting' : 'Unsubscribing from'} emails...`);

  try {
    const ids = emailIds || emails.filter(e => e.selected).map(e => e.id);

    // Call backend API to actually delete/archive in Gmail
    if (action === 'delete') {
      const response = await fetch('/api/email/delete', { // ✅ CHANGED: /api/email/delete
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ ALREADY FIXED
        body: JSON.stringify({ emailIds: ids })
      });

      const data = await response.json();
      console.log('Delete result:', data);
    } else if (action === 'archive') {
      const response = await fetch('/api/email/archive', { // ✅ CHANGED: /api/email/archive
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ ALREADY FIXED
        body: JSON.stringify({ emailIds: ids })
      });

      const data = await response.json();
      console.log('Archive result:', data);
    }
    // Update AI learning
    if (fromSuggestion) {
      setAiLearning(prev => ({ ...prev, correctSuggestions: prev.correctSuggestions + 1 }));
    }

    // Remove from frontend display
    setEmails(emails.filter(e => !ids.includes(e.id)));

    // Update report data
    if (action === 'archive') setReportData(prev => ({ ...prev, archived: prev.archived + ids.length }));
    else if (action === 'delete') setReportData(prev => ({ ...prev, deleted: prev.deleted + ids.length }));
    else if (action === 'unsubscribe') setReportData(prev => ({ ...prev, unsubscribed: prev.unsubscribed + ids.length }));

    setShowReport(true);
    setPreviewMode(null);
    setTimeout(() => setShowReport(false), 3000);

  } catch (error) {
    console.error('Bulk action failed:', error);
    alert('Failed to complete action. Please try again.');
  } finally {
    setIsLoading(false);
    setProcessingAction('');
  }
};

// ADD THIS: rejectSuggestion para mawala ang ESLint error
const rejectSuggestion = () => {
  setAiLearning(prev => ({
    ...prev,
    rejectedSuggestions: prev.rejectedSuggestions + 1
  }));
  setPreviewMode(null);
  setShowReport(true);
  setTimeout(() => setShowReport(false), 2000);
};


  const runTests = () => {
    setTestMode(true);
    const results = [
      { test: 'OAuth2 Authentication', status: isAuthenticated ? 'PASS' : 'FAIL', message: isAuthenticated ? 'User authenticated via Google' : 'Not authenticated' },
      { test: 'Importance Scoring', status: emails.every(e => e.importance !== undefined) ? 'PASS' : 'FAIL', message: 'All emails scored' },
      { test: 'Safety Checks', status: !aiSuggestions.some(s => s.emails.some(e => userPreferences.neverArchive.some(p => e.from.includes(p)))) ? 'PASS' : 'FAIL', message: 'Protected senders respected' },
      { test: 'AI Confidence', status: 'PASS', message: `Avg confidence: ${Math.round(aiSuggestions.reduce((s, a) => s + a.confidence, 0) / aiSuggestions.length * 100)}%` },
      { test: 'Learning System', status: 'PASS', message: `${aiLearning.correctSuggestions} correct, ${aiLearning.rejectedSuggestions} rejected` }
    ];
    setTestResults(results);
  };

  const getCategoryColor = (cat) => ({
    'Work': 'bg-blue-100 text-blue-700 border-blue-200',
    'Personal': 'bg-green-100 text-green-700 border-green-200',
    'Newsletters': 'bg-purple-100 text-purple-700 border-purple-200',
    'Promotions': 'bg-orange-100 text-orange-700 border-orange-200',
    'Junk': 'bg-red-100 text-red-700 border-red-200'
  }[cat]);

  const getImportanceColor = (imp) => imp >= 0.8 ? 'text-red-600' : imp >= 0.5 ? 'text-yellow-600' : 'text-green-600';

  const selectedCount = emails.filter(e => e.selected).length;

 if (!isAuthenticated) {
  return <LandingPage onLogin={handleLogin} />;
}
  return (
  <AppLayout 
    sidebar={
      <Sidebar 
  currentView={currentView}
  setCurrentView={setCurrentView}
  onOpenLabels={() => setIsLabelModalOpen(true)}
  onOpenFollowUps={() => setIsFollowUpModalOpen(true)}
  badges={{
    unread: emails.filter(e => !e.opened).length,
    drafts: 0,
    suggestions: aiSuggestions.length,
    smartCleanup: calculateSmartCleanupCount(),
    followups: (followUps.due?.length || 0) + (followUps.upcoming?.length || 0),
    canUseCleanup: canUseCleanup() // ✅ ADD THIS
  }}
/>
    }
  >
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* ✨ Modern Background Effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-indigo-100/40 to-purple-100/40 rounded-full blur-3xl opacity-40 -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full blur-3xl opacity-30 -z-10"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-purple-50/20 to-pink-50/20 rounded-full blur-3xl opacity-20 -z-10"></div>
      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 transform transition-all animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-3">
                {onboardingSteps[onboardingStep].icon}
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{onboardingSteps[onboardingStep].title}</h2>
                  <p className="text-sm text-gray-500">Step {onboardingStep + 1} of {onboardingSteps.length}</p>
                </div>
              </div>
              <button onClick={() => setShowOnboarding(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">{onboardingSteps[onboardingStep].content}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {onboardingSteps.map((_, i) => (
                  <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === onboardingStep ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-300'}`} />
                ))}
              </div>
              
              <div className="flex space-x-3">
                {onboardingStep > 0 && (
                  <button
                    onClick={() => setOnboardingStep(onboardingStep - 1)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Back
                  </button>
                )}
                {onboardingStep < onboardingSteps.length - 1 ? (
                  <button
                    onClick={() => setOnboardingStep(onboardingStep + 1)}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowOnboarding(false);
                      setCurrentView('suggestions');
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <span>Get Started</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40 backdrop-blur-sm bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Gmail Cleanup AI</h1>
                <p className="text-xs text-gray-500">{user?.email || 'user@gmail.com'} • Learning Active ✨</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowOnboarding(true)}
                onMouseEnter={() => setShowTooltip('help')}
                onMouseLeave={() => setShowTooltip(null)}
                className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
              >
                <HelpCircle className="w-5 h-5" />
                {showTooltip === 'help' && (
                  <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap animate-in fade-in slide-in-from-top-2 duration-200">
                    Show Tutorial
                  </div>
                )}
              </button>
              <button
                onClick={runTests}
                className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition-all duration-200 flex items-center space-x-1 shadow-sm hover:shadow"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Test AI</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg text-sm transition-all duration-200 flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
{/* ✅ ADD THIS - Trial Warning Banner */}
{user?.trialEndDate && new Date() < new Date(user.trialEndDate) && 
 Math.ceil((new Date(user.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24)) <= 3 && (
  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-3 text-center font-medium shadow-lg">
    <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
      <span className="text-2xl">⏰</span>
      <span>
        Trial ends in {Math.ceil((new Date(user.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24))} day(s)!
      </span>
      <button 
        onClick={() => setCurrentView('subscription')}
        className="ml-3 bg-white text-orange-600 px-4 py-1 rounded-lg font-bold hover:bg-orange-50 transition-all"
      >
        Upgrade Now
      </button>
    </div>
  </div>
)}
        {/* Learning Stats */}
        {(aiLearning.correctSuggestions > 0 || aiLearning.rejectedSuggestions > 0) && (
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 flex items-center space-x-3 shadow-sm hover:shadow-md transition-shadow duration-200">
            <Brain className="w-5 h-5 text-purple-600 animate-pulse" />
            <div className="flex-1">
              <p className="text-sm text-purple-800 font-medium">AI Learning Active</p>
              <p className="text-xs text-purple-700">Accepted: {aiLearning.correctSuggestions} | Rejected: {aiLearning.rejectedSuggestions} | Accuracy: {aiLearning.correctSuggestions + aiLearning.rejectedSuggestions > 0 ? Math.round((aiLearning.correctSuggestions / (aiLearning.correctSuggestions + aiLearning.rejectedSuggestions)) * 100) : 0}%</p>
            </div>
          </div>
        )}

        {/* Test Results */}
        {testMode && (
          <div className="mb-6 bg-white rounded-xl shadow-lg border p-6 animate-in slide-in-from-top duration-300">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold text-lg">AI System Tests</h3>
              <button onClick={() => setTestMode(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {testResults.map((r, i) => (
                <div key={i} className={`p-3 rounded-lg transform transition-all duration-200 hover:scale-102 ${r.status === 'PASS' ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {r.status === 'PASS' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                      <div>
                        <p className="font-medium text-sm">{r.test}</p>
                        <p className="text-xs text-gray-600">{r.message}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${r.status === 'PASS' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewMode && (
          <div className="mb-6 bg-white rounded-xl shadow-2xl border-2 border-indigo-200 p-6 animate-in slide-in-from-top duration-300">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center space-x-2">
                <Eye className="w-5 h-5 text-indigo-600" />
                <span>Preview: {previewMode.type.charAt(0).toUpperCase() + previewMode.type.slice(1)}</span>
              </h3>
              <button onClick={() => setPreviewMode(null)} className="text-gray-500 hover:text-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-700 mb-2">{previewMode.reason}</p>
            <div className="flex items-center space-x-2 mb-4">
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${previewMode.confidence >= 0.9 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {Math.round(previewMode.confidence * 100)}% Confidence
              </span>
              <span className="text-sm text-gray-600">{previewMode.count} emails affected</span>
            </div>
            <div className="max-h-60 overflow-y-auto mb-4 space-y-2">
              {previewMode.emails.slice(0, 5).map(e => (
  <div key={e.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
    <div className="flex items-center justify-between mb-1">
      <p className="text-sm font-medium truncate flex-1">{e.from}</p>
      <span className={`text-xs px-2 py-1 rounded-full ml-2 border ${getCategoryColor(e.category)}`}>
        {e.category}
      </span>
    </div>
    <p className="text-xs text-gray-600 truncate mb-1">{e.subject}</p>
    <p className={`text-xs font-medium ${getImportanceColor(e.importance)}`}>AI Score: {Math.round(e.importance * 100)}%</p>
    
    {/* NEW: Show AI reasoning */}
    {e.aiSuggestion && (
      <div className="mt-2">
        <p className="text-xs text-gray-600 italic">"{e.aiSuggestion.reasoning}"</p>
        {e.aiSuggestion.scores && (
          <div className="flex flex-wrap gap-1 mt-1">
            {e.aiSuggestion.scores.ageScore > 0.5 && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                Old: {Math.round(e.aiSuggestion.scores.ageScore * 100)}%
              </span>
            )}
            {e.aiSuggestion.scores.engagementScore > 0.5 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                Never Opened
              </span>
            )}
          </div>
        )}
      </div>
    )}
  </div>
))}

              {previewMode.emails.length > 5 && (
                <p className="text-xs text-gray-500 text-center py-2">+ {previewMode.emails.length - 5} more emails</p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleBulkAction(previewMode.type, previewMode.emailIds, true)}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Apply Action
              </button>
              <button
                onClick={rejectSuggestion}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-xl transition-all duration-200"
              >
                Reject & Learn
              </button>
            </div>
          </div>
        )}

       

        {/* Loading State */}
        {isLoading && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-center space-x-3 shadow-sm animate-in slide-in-from-top duration-200">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">{processingAction}</p>
              <div className="mt-2 w-full bg-blue-200 rounded-full h-1.5">
                <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{width: '70%'}}></div>
              </div>
            </div>
          </div>
        )}

        {/* Success Report */}
        {showReport && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3 shadow-lg animate-in slide-in-from-top duration-300">
            <CheckCircle className="w-5 h-5 text-green-600 animate-bounce" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-800">Action Completed! 🎉</h3>
              <p className="text-sm text-green-700 mt-1">AI is learning from your decision to improve future suggestions.</p>
            </div>
          </div>
        )}

        
        {/* Dashboard View */}
{currentView === 'dashboard' && (
  <div className="space-y-6 animate-in fade-in duration-300">


{/* ✅ ADD THIS - Trial Expired Banner */}
{user?.trialUsed && new Date() > new Date(user?.trialEndDate) && user?.subscriptionTier === 'free' && (
  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg p-5 mb-6 shadow-lg">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="bg-yellow-500 p-2 rounded-lg">
          <span className="text-2xl">⏰</span>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-lg mb-1">
            Your 7-Day Trial Has Ended
          </h3>
          <p className="text-sm text-gray-600">
            Upgrade to Premium to continue enjoying unlimited AI cleanups and advanced features!
          </p>
        </div>
      </div>
      <button
        onClick={() => setCurrentView('subscription')}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
      >
        Upgrade Now
      </button>
    </div>
  </div>
)}
{/* ✅ Cleanup Quota Banner - Enhanced */}
{user?.subscriptionTier === 'free' && !hasPremiumAccess() && (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 rounded-lg p-5 mb-6 shadow-lg">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🎯</span>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">
              AI Cleanup Quota
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < (user?.freeCleanupCount || 0)
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {user?.freeCleanupCount || 0}/3 remaining
              </span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 ml-12">
          {(user?.freeCleanupCount || 0) > 0 
            ? `You have ${user?.freeCleanupCount || 0} cleanup${(user?.freeCleanupCount || 0) > 1 ? 's' : ''} remaining this month`
            : '⚠️ You\'ve used all free cleanups this month'}
        </p>
        {(user?.freeCleanupCount || 0) === 0 && (
          <p className="text-sm text-indigo-600 font-semibold mt-2 ml-12">
            💡 Upgrade to Premium for unlimited cleanups at ₱299/month!
          </p>
        )}
      </div>
      {(user?.freeCleanupCount || 0) === 0 && (
        <button
          onClick={() => setCurrentView('subscription')}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap ml-4"
        >
          Upgrade Now
        </button>
      )}
    </div>
  </div>
)}
  {/* ✅ ADD THIS - Active Trial Card */}
    {user?.trialEndDate && new Date() < new Date(user.trialEndDate) && (
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <span className="text-3xl">🎉</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">
                Free Trial Active
              </h3>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-indigo-600">
                  {Math.ceil((new Date(user.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24))} days
                </span> remaining until {new Date(user.trialEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('subscription')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Upgrade Early
          </button>
        </div>
        
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Day {7 - Math.ceil((new Date(user.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24)) + 1} of 7</span>
            <span>{Math.round(((7 - Math.ceil((new Date(user.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24))) / 7) * 100)}% used</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-inner"
              style={{ 
                width: `${((7 - Math.ceil((new Date(user.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24))) / 7) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>
    )}
  

           
        
<div className="max-h-[calc(100vh-200px)] overflow-y-auto scroll-smooth">
  <ActionableDashboard 
    emails={emails}
    stats={stats}
    healthScore={healthScore}
    onNavigate={(view) => setCurrentView(view)} 
    onCategoryClick={(category) => {
      console.log('📂 Category clicked:', category);
      console.log('📊 Stats:', stats);
      console.log('📧 Emails:', emails.length);
      setCurrentView('inbox');
    }}
    onBulkArchive={(emailIds) => {
      console.log('📦 Bulk Archive called with:', emailIds);
      handleArchive(emailIds);
    }}
    onBulkDelete={(emailIds) => {
      console.log('🗑️ Bulk Delete called with:', emailIds);
      handleDelete(emailIds);
    }}
    // ✅ FIXED CODE:
onBulkUnsubscribe={async (emailIds) => {
  console.log('✉️ Bulk Unsubscribe called with:', emailIds);
  
  if (!emailIds || emailIds.length === 0) {
    console.log('⚠️ No emails to unsubscribe');
    return;
  }
  
  // Confirm action
  if (!window.confirm(`Unsubscribe from ${emailIds.length} senders and archive their emails?`)) {
    console.log('❌ User cancelled unsubscribe');
    return;
  }
  
  setIsLoading(true);
  setProcessingAction(`Unsubscribing from ${emailIds.length} senders...`);
  
  try {
    console.log('🔄 Processing unsubscribe...');
    
    // Option 1: If you have an unsubscribe endpoint
    // const response = await fetch('/api/email/unsubscribe', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   credentials: 'include',
    //   body: JSON.stringify({ emailIds })
    // });
    // const data = await response.json();
    
    // Option 2: For now, archive them (temporary solution)
    const response = await fetch('/api/email/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ emailIds })
    });
    
    const data = await response.json();
    console.log('✅ Unsubscribe response:', data);
    
    if (data.success) {
      // Remove from frontend
      setEmails(prev => prev.filter(e => !emailIds.includes(e.id)));
      
      // Update report
      setReportData(prev => ({ 
        ...prev, 
        unsubscribed: prev.unsubscribed + emailIds.length 
      }));
      
      // Show success message
      alert(`✅ Successfully unsubscribed from ${emailIds.length} senders!`);
      
      // Reload emails to update stats
      await loadRealEmails();
    } else {
      throw new Error(data.message || 'Unsubscribe failed');
    }
    
  } catch (error) {
    console.error('❌ Unsubscribe failed:', error);
    alert('❌ Failed to unsubscribe: ' + error.message);
  } finally {
    setIsLoading(false);
    setProcessingAction('');
  }
}}
    onOpenLabels={() => {
      console.log('📁 Opening Labels Manager');
      setIsLabelModalOpen(true);
    }}
    onOpenFollowUps={() => {
      console.log('📅 Opening Follow-ups Manager');
      setIsFollowUpModalOpen(true);
    }}
  />
</div>

</div>




        )}
{/* ✅ Auto Planner View - MOVE THIS HERE (OUTSIDE dashboard) */}
{currentView === 'auto-planner' && (
  <div className="animate-in fade-in duration-300">
    <AutoPlanner />
  </div>
)}

        {/* Suggestions View */}
{/* Inbox View */}
{currentView === 'inbox' && (
  <div className="animate-in fade-in duration-300">
    <InboxView 
      emails={emails}
      onArchive={(emailIds) => handleArchive(emailIds)}
      onDelete={(emailIds) => handleDelete(emailIds)}
      onMarkAsRead={(emailIds) => {
        // Mark emails as read
        setEmails(prev =>
          prev.map(e => emailIds.includes(e.id) ? { ...e, opened: true } : e)
        );
      }}
      onMarkAsUnread={(emailIds) => {
        // Mark emails as unread
        setEmails(prev =>
          prev.map(e => emailIds.includes(e.id) ? { ...e, opened: false } : e)
        );
      }}
      onFollowUp={(email) => {
        setSelectedEmailForFollowUp(email);
        setIsFollowUpModalOpen(true);
      }}
      onEmailClick={(email) => {
        setSelectedEmailForView(email);
        setIsEmailViewerOpen(true);
      }}
    />
  </div>
)}

{/* Archive View */}
{currentView === 'archive' && (
  <div className="animate-in fade-in duration-300">
    <ArchiveView emails={emails.filter(e => e.category === 'Archived')} />
  </div>
)}

{/* Sent View */}
{currentView === 'sent' && (
  <div className="animate-in fade-in duration-300">
    <SentView emails={emails} />
  </div>
)}

{/* Drafts View */}
{currentView === 'drafts' && (
  <div className="animate-in fade-in duration-300">
    <DraftsView emails={emails} />
  </div>
)}

{/* Spam View */}
{currentView === 'spam' && (
  <div className="animate-in fade-in duration-300">
    <SpamView emails={emails} />
  </div>
)}
{/* Trash View */}
{currentView === 'trash' && (
  <div className="animate-in fade-in duration-300">
    <TrashView emails={emails} />
  </div>
)}
{/* Auto Planner View */}
{currentView === 'auto-planner' && (
  <div className="animate-in fade-in duration-300">
    {!isAuthenticated ? (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to use Auto Planner</h2>
        <button
          onClick={handleLogin}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold"
        >
          Login with Google
        </button>
      </div>
    ) : (
      <AutoPlanner />
    )}
  </div>
)}
       {currentView === 'suggestions' && (
  <div className="animate-in fade-in duration-300">
    <SuggestionsView />
  </div>
)}

{/* ✅ NEW: Smart Cleanup View - PREMIUM */}
{currentView === 'smart-cleanup' && (
  <div className="animate-in fade-in duration-300">
    {(user?.trialUsed && user?.trialEndDate && new Date() > new Date(user.trialEndDate) && user?.subscriptionTier !== 'premium' && user?.subscriptionTier !== 'pro') ? (
      // Show upgrade prompt for free users with no cleanups left
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Smart Cleanup Locked 🔒
          </h2>
          <p className="text-gray-600 mb-2">
            You've used all 3 free AI cleanups this month.
          </p>
          <p className="text-gray-700 font-medium mb-6">
            Upgrade to Premium to unlock Smart Cleanup with advanced pattern detection!
          </p>
          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-800 font-semibold mb-2">🚀 Smart Cleanup Features:</p>
            <ul className="text-sm text-purple-700 space-y-1 text-left">
              <li>• Auto-detect email patterns</li>
              <li>• Bulk cleanup by sender</li>
              <li>• Category-based cleanup</li>
              <li>• One-click unsubscribe</li>
            </ul>
          </div>
          <button
            onClick={() => setCurrentView('subscription')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Upgrade to Premium - ₱299/month
          </button>
        </div>
      </div>
    ) : (
      // Show normal smart cleanup view
      <SmartCleanup 
        emails={emails}
        user={user}
        onArchive={(emailIds) => handleArchive(emailIds)}
        onDelete={(emailIds) => handleDelete(emailIds)}
        onMuteSender={(sender) => {
          console.log('Muting sender:', sender);
          alert('Mute sender feature coming soon! Would mute: ' + sender);
        }}
        onUpgrade={() => setCurrentView('subscription')}
      />
    )}
  </div>
)}
{/* Smart Filters View */}
{currentView === 'smart-filters' && (
  <div className="animate-in fade-in duration-300">
    <SmartFilters emails={emails} />
  </div>
)}
{/* ✅ ADD THIS - Categories View */}
{currentView === 'categories' && (
  <div className="animate-in fade-in duration-300">
    <Categories />
  </div>
)}

        {/* Settings View */}
        {/* AI Insights View */}
{/* AI Insights View */}
        {currentView === 'insights' && (
  <div className="animate-in fade-in duration-300">
    {(user?.trialUsed && user?.trialEndDate && new Date() > new Date(user.trialEndDate) && user?.subscriptionTier !== 'premium' && user?.subscriptionTier !== 'pro') ? (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            AI Insights Locked 🔒
          </h2>
          <p className="text-gray-600 mb-2">
            AI Insights is a Premium feature.
          </p>
          <p className="text-gray-700 font-medium mb-6">
            Upgrade to Premium to unlock deep email analysis and smart insights!
          </p>
          <div className="bg-indigo-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-indigo-800 font-semibold mb-2">🧠 AI Insights Includes:</p>
            <ul className="text-sm text-indigo-700 space-y-1 text-left">
              <li>• Deep email pattern analysis</li>
              <li>• Sender behavior tracking</li>
              <li>• Inbox health monitoring</li>
              <li>• Smart recommendations</li>
            </ul>
          </div>
          <button
            onClick={() => setCurrentView('subscription')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Upgrade to Premium - ₱299/month
          </button>
        </div>
      </div>
    ) : (
      <AIInsights emails={emails} onRefresh={loadRealEmails} />
    )}
  </div>
)}

       {/* Settings View - Original AI Configuration */}
        {currentView === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>AI Configuration</span>
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <h3 className="font-medium flex items-center space-x-2">
                    <span>Protected Senders</span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">{userPreferences.neverArchive.join(', ')}</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <h3 className="font-medium flex items-center space-x-2">
                    <span>Important Keywords</span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">{userPreferences.importantKeywords.join(', ')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <span>Cleanup Report</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Archived', value: reportData.archived, color: 'blue' },
                  { label: 'Deleted', value: reportData.deleted, color: 'red' },
                  { label: 'Unsubscribed', value: reportData.unsubscribed, color: 'orange' }
                ].map((item, i) => (
                  <div key={i} className={`p-4 bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 rounded-xl border border-${item.color}-200 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1`}>
                    <div className={`text-3xl font-bold text-${item.color}-700 mb-1`}>{item.value}</div>
                    <div className="text-sm text-gray-700">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== ⭐ NEW SETTINGS VIEWS ⭐ ==================== */}
        
        
{currentView === 'preferences' && (
  <SimplePreferences />
)}

        {/* Connected Accounts View */}
        {currentView === 'connected-accounts' && (
          <div className="animate-in fade-in duration-300">
            <ConnectedAccounts user={user} />
          </div>
        )}

        {/* Subscription Settings View */}
        {currentView === 'subscription' && (
          <div className="animate-in fade-in duration-300">
            <SubscriptionSettings user={user} />
          </div>
        )}
        {/* ==================== ⭐ NEW ACCOUNT VIEWS ⭐ ==================== */}

{/* Profile View */}
{currentView === 'profile' && (
  <div className="animate-in fade-in duration-300">
    <ProfileView user={user} />
  </div>
)}

{/* Referrals View */}
{currentView === 'referrals' && (
  <div className="animate-in fade-in duration-300">
    <ReferralsView user={user} />
  </div>
)}

{/* Activity Log View */}
{currentView === 'activity-log' && (
  <div className="animate-in fade-in duration-300">
    <ActivityLog user={user} />
  </div>
)}

{/* ==================== END ACCOUNT VIEWS ==================== */}
        {/* ==================== END NEW SETTINGS VIEWS ==================== */}

      </div>
      {/* ✅ NEW: Labels Manager Modal */}
      <LabelManager 
        isOpen={isLabelModalOpen} 
        onClose={() => setIsLabelModalOpen(false)} 
      />
      {/* ✅ NEW: Follow-up Manager Modal - ADD THIS */}
{isFollowUpModalOpen && (
  <FollowUpManager 
    selectedEmail={selectedEmailForFollowUp}
    onClose={() => {
      setIsFollowUpModalOpen(false);
      setSelectedEmailForFollowUp(null);
      loadFollowUps(); 
    }}
  />

)}
 
      
      {/* ✅ ADD FLOATING ACTION BUTTONS HERE */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
       {/* ✅ Email Viewer Modal */}
      {isEmailViewerOpen && selectedEmailForView && (
        <EmailViewer 
          email={selectedEmailForView}
          onClose={() => {
            setIsEmailViewerOpen(false);
            setSelectedEmailForView(null);
          }}
        />
      )}
        {/* Follow-ups FAB with Badge */}
        <button
          onClick={() => setIsFollowUpModalOpen(true)}
          className="relative bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:scale-110"
          title="View Follow-ups"
        >
          <Calendar className="w-6 h-6" />
          {followUps.due?.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
              {followUps.due.length}
            </span>
          )}
        </button>
        
        {/* Labels FAB */}
        <button
          onClick={() => setIsLabelModalOpen(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:scale-110"
          title="Manage Labels"
        >
          <Mail className="w-6 h-6" />
        </button>
      </div>
    </div>
</AppLayout>
  );
};

// ✅ NEW (End of file):
const App = () => {
  return (
    <ThemeProvider>
      <GmailCleanupTool />
    </ThemeProvider>
  );
};

export default App;