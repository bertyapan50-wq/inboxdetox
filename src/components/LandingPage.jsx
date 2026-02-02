import { motion, useScroll, useTransform } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { 
  Mail, Sparkles, DollarSign, Users, Star, Award, 
  Zap, Shield, Clock, CheckCircle, X, ChevronDown,
  TrendingUp, BarChart3, Trash2, Filter, MessageSquare,
  CreditCard
} from 'lucide-react';

export default function LandingPage({ onLogin }) {
  const [spotsLeft, setSpotsLeft] = useState(847);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 47, seconds: 32 });
  const [showFAQ, setShowFAQ] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleGmailConnect = () => {
    if (onLogin) {
      onLogin();
    } else {
      window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/auth/google`;
    }
  };

  const faqs = [
    {
      q: "Is my Gmail data secure?",
      a: "Yes! We use bank-level encryption (AES-256). We never read your emails or store your content. Only metadata is processed to identify cleanup candidates. SOC 2 Type II certified."
    },
    {
      q: "How does the AI decide what to delete?",
      a: "Our AI analyzes patterns: newsletters you never open, promotional emails, duplicates, and old notifications. YOU always have final approval before anything is deleted."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept multiple payment options: PayMongo (GCash, PayMaya, credit/debit cards), Stripe (international cards), and PayPal. All payments are processed securely with industry-standard encryption."
    },
    {
      q: "Can I undo deletions?",
      a: "Absolutely! All emails go to Gmail's Trash for 30 days. Plus, we create a backup list of everything cleaned, so you can restore anytime."
    },
    {
      q: "What's the difference between Free and Pro?",
      a: "Free: 100 emails/month, 3 AI cleanups/month, basic features. Pro: UNLIMITED processing, unlimited cleanups, advanced AI, auto-scheduling, analytics, and earn ₱20 per referral signup."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white font-sans">
      
      {/* Early Bird Banner with Timer */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-3 text-center">
          <span className="font-bold text-sm">🎉 EARLY BIRD SPECIAL: 30% OFF</span>
          <div className="flex gap-2 items-center bg-white/20 px-3 py-1 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-mono">
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
          <motion.span
            className="bg-yellow-400 text-emerald-900 px-3 py-1 rounded-full text-xs font-bold"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Only {spotsLeft} spots left!
          </motion.span>
        </div>
      </div>

      {/* Hero Section - Simplified & Punchy */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-5xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-4 py-2 rounded-full mb-6 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold">Trusted by 18,230+ users</span>
          </motion.div>

          {/* Headline - Specific & Compelling */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl font-black mb-6 leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Delete 10,000+ Emails<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              In Under 5 Minutes
            </span>
          </motion.h1>

          {/* Subheadline - Problem Focused */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Drowning in 47,000 unread emails? Our AI cleans your Gmail in seconds—not hours.
            <span className="block mt-2 text-emerald-400 font-semibold">Save 5+ hours every week.</span>
          </motion.p>

          {/* CTA Button - Primary */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(59, 130, 246, 0.5)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGmailConnect}
            className="group relative px-10 py-5 text-lg font-bold text-slate-900 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 mb-4"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Clean My Inbox Now - FREE
            </span>
          </motion.button>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 text-sm text-blue-200"
          >
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-emerald-400" />
              Bank-level encryption
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-emerald-400" />
              Setup in 60 seconds
            </span>
          </motion.div>

          {/* Live User Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex items-center justify-center gap-3"
          >
            <div className="flex -space-x-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-slate-900" />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold">283 people cleaning right now</span>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          style={{ opacity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-8 h-8 text-blue-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 px-4 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Problem */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl font-black text-red-400">The Problem</h2>
              <div className="space-y-4">
                {[
                  "Spending 2+ hours daily managing emails",
                  "47,000 unread promotional messages",
                  "Can't find important emails in the clutter",
                  "Stress and inbox anxiety every morning"
                ].map((problem, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <X className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                    <span className="text-lg text-blue-100">{problem}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Solution */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl font-black text-emerald-400">The Solution</h2>
              <div className="space-y-4">
                {[
                  { icon: Zap, text: "AI cleans 10,000 emails in 5 minutes" },
                  { icon: Filter, text: "Smart filters learn your preferences" },
                  { icon: Shield, text: "100% safe - you approve before deletion" },
                  { icon: TrendingUp, text: "Reclaim 5+ hours every week" }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
                  >
                    <item.icon className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                    <span className="text-lg text-white font-semibold">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black mb-4">How It Works</h2>
            <p className="text-xl text-blue-200">Three simple steps to inbox zero</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: Mail,
                title: "Connect Gmail",
                desc: "One-click secure authentication. Takes 30 seconds.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                step: "2",
                icon: Sparkles,
                title: "AI Analyzes",
                desc: "Our AI scans and categorizes promotional emails, newsletters, and spam.",
                color: "from-purple-500 to-pink-500"
              },
              {
                step: "3",
                icon: Trash2,
                title: "Bulk Delete",
                desc: "Review suggestions and delete thousands with one click. Undo anytime!",
                color: "from-emerald-500 to-teal-500"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative group"
              >
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 h-full">
                  {/* Step Number */}
                  <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl font-black shadow-lg`}>
                    {item.step}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-blue-200 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Proof Section */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-black mb-12"
          >
            Real Results from Real Users
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Before */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-8"
            >
              <div className="text-6xl font-black text-red-400 mb-2">47,382</div>
              <div className="text-xl text-red-300 mb-4">Unread Emails</div>
              <div className="text-sm text-blue-200">Inbox Status: Chaos 😰</div>
            </motion.div>

            {/* After */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl p-8"
            >
              <div className="text-6xl font-black text-emerald-400 mb-2">24</div>
              <div className="text-xl text-emerald-300 mb-4">Unread Emails</div>
              <div className="text-sm text-blue-200">Inbox Status: Peace ✨</div>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-emerald-400 text-xl font-semibold"
          >
            ⏱️ Cleanup completed in 4 minutes 32 seconds
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-black mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-blue-200 mb-8">Start free, upgrade when you need more</p>
            
            {/* Billing Cycle Toggle */}
            <div className="inline-flex items-center gap-4 bg-slate-800/50 border border-slate-700 rounded-full p-2">
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  billingCycle === 'monthly' 
                    ? 'bg-slate-700 text-white shadow-lg' 
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  billingCycle === 'annual' 
                    ? 'bg-slate-700 text-white shadow-lg' 
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                Annual <span className="text-emerald-400 text-sm ml-1">(Save 20%)</span>
              </button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8"
            >
              <div className="flex items-center justify-between mb-4">
                <Shield className="w-10 h-10 text-gray-400" />
              </div>
              
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="text-5xl font-black mb-4">₱0</div>
              <p className="text-blue-200 mb-6">Perfect to get started</p>
              
              <ul className="space-y-3 mb-8">
                {[
                  "100 emails processed/month",
                  "3 AI cleanups/month",
                  "Basic AI suggestions",
                  "Email categorization",
                  "1 connected account"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-blue-100">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleGmailConnect}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-full font-semibold transition-colors"
              >
                Start Free
              </button>
            </motion.div>

            {/* Pro Plan - Featured */}
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              whileInView={{ y: 0, opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 shadow-2xl border-4 border-yellow-400"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-slate-900 px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                MOST POPULAR
              </div>

              <div className="flex items-center justify-between mb-4">
                <Zap className="w-10 h-10 text-yellow-400" />
              </div>

              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              
              {/* Dynamic Pricing based on billing cycle */}
              {billingCycle === 'monthly' ? (
                <>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl line-through text-blue-200">₱499</span>
                    <span className="text-5xl font-black">₱399</span>
                  </div>
                  <p className="text-blue-100 mb-6">per month</p>
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl line-through text-blue-200">₱3,588</span>
                    <span className="text-5xl font-black">₱3,830</span>
                  </div>
                  <p className="text-blue-100 mb-2">per year</p>
                  <p className="text-sm text-yellow-300 mb-4">
                    That's only ₱239/month - Save ₱718 annually! 🎉
                  </p>
                </>
              )}
              
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited email processing",
                  "Unlimited AI cleanups",
                  "Advanced AI insights",
                  "Smart cleanup patterns",
                  "Auto Planner - Smart scheduling",
                  "Follow-up manager",
                  "Bulk email operations",
                  "Email analytics",
                  "Referral credits (₱20/signup)"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold text-white">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleGmailConnect}
                className="w-full py-3 bg-white text-purple-600 hover:bg-yellow-400 hover:text-slate-900 rounded-full font-bold transition-all shadow-lg"
              >
                Start 14-Day Free Trial
              </button>
              
              <p className="text-xs text-blue-100 text-center mt-3">
                No credit card required • Cancel anytime
              </p>
            </motion.div>
          </div>

          {/* Payment Methods */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-sm text-blue-300 mb-3">Accepted payment methods:</p>
            <div className="flex items-center justify-center gap-6 text-blue-200">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                <span className="text-sm font-semibold">PayMongo</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                <span className="text-sm font-semibold">Stripe</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                <span className="text-sm font-semibold">PayPal</span>
              </div>
            </div>
            <p className="text-xs text-blue-300 mt-3">
              GCash, PayMaya, Credit/Debit Cards accepted
            </p>
          </motion.div>
        </div>
      </section>

      {/* Social Proof - Testimonials */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black mb-4">What Our Users Say</h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-xl text-blue-200">4.9/5 from 12,847 reviews</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Maria Santos",
                role: "Marketing Manager",
                text: "Deleted 23,000 promotional emails in 3 minutes! This is absolutely life-changing. I actually enjoy checking my inbox now.",
                rating: 5,
                avatar: "MS"
              },
              {
                name: "David Chen",
                role: "Software Engineer",
                text: "Best $7/month I've ever spent. The AI is scary accurate at identifying what I don't need. Saved me countless hours.",
                rating: 5,
                avatar: "DC"
              },
              {
                name: "Sarah Johnson",
                role: "Freelancer",
                text: "I was skeptical but WOW. From 47K emails to inbox zero in one afternoon. The peace of mind is priceless.",
                rating: 5,
                avatar: "SJ"
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-blue-100 mb-6 leading-relaxed italic">"{testimonial.text}"</p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center font-bold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-blue-300">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
          >
            {[
              { icon: Users, number: "50K+", label: "Active Users" },
              { icon: Mail, number: "2M+", label: "Emails Cleaned" },
              { icon: Clock, number: "250K+", label: "Hours Saved" },
              { icon: Star, number: "4.9★", label: "User Rating" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <div className="text-3xl font-black text-white mb-1">{stat.number}</div>
                <div className="text-sm text-blue-300">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Shield className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
            <h2 className="text-4xl font-black mb-4">Your Privacy is Sacred</h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              We never read, store, or sell your email content. Period.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Shield,
                title: "Bank-Level Encryption",
                desc: "AES-256 encryption protects all your data. Same security as online banking.",
                badge: "SOC 2 Type II"
              },
              {
                icon: CheckCircle,
                title: "You're Always in Control",
                desc: "Review every deletion before it happens. Undo anytime within 30 days.",
                badge: "100% Safe"
              },
              {
                icon: Zap,
                title: "Metadata Only",
                desc: "We only analyze email metadata (sender, subject, date). Never the content.",
                badge: "GDPR Compliant"
              },
              {
                icon: Award,
                title: "Trusted Authentication",
                desc: "OAuth 2.0 via Google. We never see or store your Gmail password.",
                badge: "Google Verified"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ x: i % 2 === 0 ? -50 : 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex gap-4"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-sm text-blue-200 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-blue-200">Everything you need to know</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setShowFAQ(showFAQ === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-800/80 transition-colors"
                >
                  <span className="font-semibold text-lg pr-4">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: showFAQ === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  </motion.div>
                </button>
                
                <motion.div
                  initial={false}
                  animate={{
                    height: showFAQ === i ? "auto" : 0,
                    opacity: showFAQ === i ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 text-blue-200 leading-relaxed">
                    {faq.a}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral Section - Moved Lower */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-12 text-center border-4 border-yellow-400"
          >
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h2 className="text-4xl font-black mb-4">Invite Friends, Earn ₱20 Each! 💰</h2>
            <p className="text-xl text-blue-100 mb-8">
              Pro users: Share your unique link and earn <span className="font-bold text-white">₱20 credit</span> for every friend who signs up
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
              {[
                { emoji: "🎁", title: "They Get", value: "14 Days Free" },
                { emoji: "💵", title: "You Earn", value: "₱20 Credit" },
                { emoji: "⭐", title: "Unlimited", value: "Earnings" }
              ].map((card, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl mb-1">{card.emoji}</div>
                  <div className="text-xs text-blue-200 mb-1">{card.title}</div>
                  <div className="text-xl font-bold">{card.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 text-left max-w-2xl mx-auto">
              <p className="text-sm text-white mb-3 font-bold">💡 How it works:</p>
              <div className="space-y-2 text-sm text-blue-100">
                <div className="flex gap-2">
                  <span>1️⃣</span>
                  <span>Upgrade to Pro and get your unique referral link</span>
                </div>
                <div className="flex gap-2">
                  <span>2️⃣</span>
                  <span>Share with friends - they get 14 days free trial</span>
                </div>
                <div className="flex gap-2">
                  <span>3️⃣</span>
                  <span>When they sign up, you earn ₱20 credit instantly</span>
                </div>
                <div className="flex gap-2">
                  <span>4️⃣</span>
                  <span>Use credits toward your subscription - no limits!</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleGmailConnect}
              className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 hover:text-slate-900 transition-all shadow-xl"
            >
              Get My Referral Link →
            </button>

            <p className="text-sm text-blue-200 mt-4">Available to Pro subscribers only</p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl sm:text-6xl font-black mb-6">
              Stop Drowning in Emails.<br />
              <span className="text-yellow-400">Start Living.</span>
            </h2>

            <p className="text-2xl text-blue-100 mb-8">
              Join 50,000+ users who reclaimed their inbox in minutes
            </p>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 30px 80px rgba(255, 255, 255, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGmailConnect}
              className="px-12 py-6 text-xl font-black text-slate-900 bg-white rounded-full shadow-2xl mb-6 inline-flex items-center gap-3"
            >
              <Mail className="w-6 h-6" />
              Clean My Inbox Now - FREE
            </motion.button>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                14-day Premium trial
              </span>
              <span className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                30% off early bird special
              </span>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-yellow-400 font-bold text-lg mt-8 animate-pulse"
            >
              ⏰ Only {spotsLeft} early bird spots remaining!
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-950 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-blue-400" />
              <div>
                <div className="font-black text-xl">Gmail Cleanup AI</div>
                <div className="text-sm text-blue-300">Smart email management powered by AI</div>
              </div>
            </div>

            <div className="flex gap-6 text-sm text-blue-300">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-blue-400">
            © 2026 Gmail Cleanup AI. All rights reserved. Made with ❤️ for productivity enthusiasts.
          </div>
        </div>
      </footer>

      {/* Floating CTA Button - Sticky */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 right-6 z-50 hidden md:block"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGmailConnect}
          className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full font-bold shadow-2xl flex items-center gap-2 hover:shadow-blue-500/50 transition-all"
        >
          <Sparkles className="w-5 h-5" />
          Get Started Free
        </motion.button>
      </motion.div>
    </div>
  );
}