import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Download, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Crown,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Percent
} from 'lucide-react';

export default function SubscriptionSettings({ user }) {
  const [subscription, setSubscription] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annual'

  useEffect(() => {
    loadSubscription();
    loadPaymentHistory();
  }, []);

  const loadSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/subscription/current`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentHistory = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/subscription/payment-history`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setPaymentHistory(data.payments || []);
      }
    } catch (error) {
      console.error('Error loading payment history:', error);
    }
  };

  const handleUpgrade = async (tier, cycle) => {
    setProcessing(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/subscription/paymongo/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tier, billingCycle: cycle })
      });
      
      const data = await response.json();
      
      if (data.success) {
        window.location.href = data.checkoutUrl;
      } else {
        showMessage('Failed to create checkout session', 'error');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      showMessage('Failed to upgrade subscription', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/subscription/cancel`, {
        method: 'POST',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        showMessage('Subscription cancelled. You will have access until the end of your billing period.', 'success');
        loadSubscription();
      } else {
        showMessage(data.message || 'Failed to cancel subscription', 'error');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      showMessage('Failed to cancel subscription', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setProcessing(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/subscription/reactivate`, {
        method: 'POST',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        showMessage('Subscription reactivated successfully!', 'success');
        loadSubscription();
      } else {
        showMessage(data.message || 'Failed to reactivate subscription', 'error');
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      showMessage('Failed to reactivate subscription', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const downloadInvoice = async (invoiceId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/subscription/invoice/${invoiceId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        showMessage('Failed to download invoice', 'error');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      showMessage('Failed to download invoice', 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'pro':
        return 'from-indigo-500 to-purple-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'pro':
        return Zap;
      default:
        return Shield;
    }
  };

  // ✅ UPDATED: Only 2 plans (Free & Pro with Monthly/Annual)
  const plans = [
    {
      tier: 'free',
      name: 'Free',
      monthly: 0,
      annual: 0,
      features: [
        '100 emails processed/month',
        '3 AI cleanups/month',
        'Basic AI suggestions',
        'Email categorization',
        '1 connected account'
      ],
      icon: Shield
    },
    {
      tier: 'pro',
      name: 'Pro',
      monthly: 399,
      annual: 3830, // ₱399/month = 20% discount
      savings: 958, // ₱399 × 12 -  ₱4,788
      features: [
        'Unlimited email processing',
        'Unlimited AI cleanups',
        'Advanced AI insights',
        'Smart cleanup patterns',
         'Auto Planner - Smart scheduling',
        'Follow-up manager',
        'Bulk email operations',
        'Email analytics',
        'Referral credits (₱20/signup)'
      ],
      icon: Zap,
      popular: true
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-gray-600">Loading subscription...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <CreditCard className="w-7 h-7 text-indigo-600" />
              Subscription & Billing
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your plan and payment details
            </p>
          </div>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`rounded-lg p-4 flex items-center gap-3 animate-in slide-in-from-top duration-300 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className={`bg-gradient-to-r ${getTierColor(subscription?.tier)} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {React.createElement(getTierIcon(subscription?.tier), { className: "w-12 h-12" })}
              <div>
                <h2 className="text-2xl font-bold capitalize">{subscription?.tier || 'Free'} Plan</h2>
                <p className="text-white/80">
                  {subscription?.status === 'active' 
                    ? 'Active subscription' 
                    : subscription?.cancelAtPeriodEnd 
                    ? 'Cancelled (active until period end)' 
                    : 'No active subscription'}
                </p>
              </div>
            </div>
            
            {subscription?.tier !== 'free' && (
              <div className="text-right">
                <p className="text-white/80 text-sm">Next billing date</p>
                <p className="text-xl font-bold">
                  {subscription?.currentPeriodEnd 
                    ? new Date(subscription.currentPeriodEnd).toLocaleDateString() 
                    : 'N/A'}
                </p>
              </div>
            )}
          </div>
        </div>

        {subscription?.tier !== 'free' && (
          <div className="p-6 bg-gray-50 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Payment Method</p>
                  <p className="text-sm text-gray-600">{subscription?.paymentMethod || 'Not set'}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {subscription?.cancelAtPeriodEnd ? (
                  <button
                    onClick={handleReactivateSubscription}
                    disabled={processing}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reactivate
                  </button>
                ) : (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={processing}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all disabled:opacity-50"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ NEW: Billing Cycle Toggle */}
      {subscription?.tier !== 'pro' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Upgrade Your Plan</h2>
            
            {/* Billing Toggle */}
            <div className="flex items-center gap-3 bg-white border rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  billingCycle === 'annual'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Annual
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
          
          {/* ✅ UPDATED: Plan Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = plan.tier === subscription?.tier;
              const displayPrice = billingCycle === 'monthly' ? plan.monthly : plan.annual;
              const monthlyEquivalent = billingCycle === 'annual' ? Math.round(plan.annual / 12) : plan.monthly;
              
              return (
                <div
                  key={plan.tier}
                  className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all duration-200 ${
                    plan.popular 
                      ? 'border-indigo-500 shadow-lg transform hover:scale-105' 
                      : isCurrentPlan
                      ? 'border-green-500'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {plan.popular && (
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-2 text-sm font-semibold flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Most Popular
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Icon className={`w-10 h-10 ${plan.popular ? 'text-indigo-600' : 'text-gray-600'}`} />
                      {isCurrentPlan && (
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                    
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900">₱{displayPrice}</span>
                        {displayPrice > 0 && (
                          <span className="text-gray-600">
                            {billingCycle === 'annual' ? '/year' : '/month'}
                          </span>
                        )}
                      </div>
                      
                      {/* ✅ Show monthly equivalent for annual */}
                      {billingCycle === 'annual' && plan.tier === 'pro' && (
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-indigo-600 font-semibold">
                            ₱{monthlyEquivalent}/month (billed annually)
                          </p>
                          <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                            <Percent className="w-4 h-4" />
                            Save ₱{plan.savings} per year!
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    {!isCurrentPlan && plan.tier !== 'free' && (
                      <button
                        onClick={() => handleUpgrade(plan.tier, billingCycle)}
                        disabled={processing}
                        className="w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Upgrade Now
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-indigo-600" />
            Payment History
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment) => (
                  <tr key={payment._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-sm text-gray-700">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700">
                      {payment.description || 'Subscription Payment'}
                    </td>
                    <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                      ₱{payment.amount.toFixed(2)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        payment.status === 'paid' 
                          ? 'bg-green-100 text-green-700' 
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {payment.status === 'paid' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : payment.status === 'pending' ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {payment.status === 'paid' && (
                        <button
                          onClick={() => downloadInvoice(payment._id)}
                          className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 ml-auto"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm">Download</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex gap-4">
          <div className="bg-blue-100 p-2 rounded-lg h-fit">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">Subscription Benefits</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Cancel anytime - no long-term commitment</li>
              <li>• All payments are secure and encrypted via PayMongo</li>
              <li>• Instant access to premium features upon upgrade</li>
              <li>• 30-day money-back guarantee on all plans</li>
              <li>• Save 20% with annual billing</li>Referral credits (₱20/signup)

            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}