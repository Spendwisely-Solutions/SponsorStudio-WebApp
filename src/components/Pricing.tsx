import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronDown } from 'lucide-react';
import { useRazorpay } from 'react-razorpay';
import axios from 'axios';
import { supabase } from '../lib/supabase';

interface PricingTier {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
  disabled?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Get started with basic event management tools.',
    features: [
      '1 active event',
      'Up to 100 attendees',
      'Basic analytics',
      'Email support',
    ],
    cta: 'Sign Up Free',
    disabled: false,
  },
  {
    name: 'Basic',
    monthlyPrice: 500,
    annualPrice: 5400,
    description: 'Perfect for small events and startups.',
    features: [
      '5 active events',
      'Up to 500 attendees',
      'Standard analytics',
      'Priority email support',
      'Custom branding',
    ],
    cta: 'Start Basic Plan',
    isPopular: true,
  },
  {
    name: 'Premium',
    monthlyPrice: 1000,
    annualPrice: 10800,
    description: 'For enterprises with high-volume events.',
    features: [
      'Unlimited events',
      'Unlimited attendees',
      'Premium analytics',
      '24/7 phone support',
      'Custom branding',
      'API access',
      'Dedicated account manager',
    ],
    cta: 'Start Premium Plan',
  },
];

const faqs = [
  {
    question: 'Can I switch plans later?',
    answer: 'Yes, you can upgrade, downgrade, or cancel your plan at any time from your account settings.',
  },
  {
    question: 'Is there a free trial for paid plans?',
    answer: 'We offer a 14-day free trial for Basic and Premium plans, no credit card required.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept all major credit cards, UPI, and net banking via Razorpay.',
  },
  {
    question: 'Do you offer discounts for nonprofits?',
    answer: 'Yes, we offer a 20% discount for registered nonprofits. Contact our support team for details.',
  },
];

const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<Record<string, string>>({});
  const [paymentInitiated, setPaymentInitiated] = useState<Record<string, boolean>>({});
  const [paymentError, setPaymentError] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [lockedBillingCycle, setLockedBillingCycle] = useState<string | null>(null);
  const { Razorpay } = useRazorpay();

  useEffect(() => {
    async function fetchSubscriptions() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await axios.get('https://payment-gateway-serverless-lac.vercel.app/api/get-subscription-details', {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });

        const statusMap: Record<string, string> = {};
        response.data.subscriptions.forEach((sub: any) => {
          if (sub.status === 'active') {
            statusMap[sub.plan_name] = sub.status;
          }
        });

        setPaymentStatus(prev => ({ ...prev, ...statusMap }));
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscriptions();
  }, []);

  const initiateSubscription = async (tier: PricingTier) => {
    if (tier.name === 'Free') {
      setPaymentStatus(prev => ({ ...prev, [tier.name]: 'active' }));
      setPaymentError(prev => ({ ...prev, [tier.name]: null }));
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPaymentError(prev => ({ ...prev, [tier.name]: 'Please log in to subscribe.' }));
        return;
      }

      setPaymentInitiated(prev => ({ ...prev, [tier.name]: true }));
      setPaymentError(prev => ({ ...prev, [tier.name]: null }));
      setLockedBillingCycle(isAnnual ? 'yearly' : 'monthly');

      const { data: existingSubscription, error: checkError } = await supabase
        .from('subscriptions')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('plan_name', tier.name)
        .eq('status', 'active')
        .maybeSingle();

      if (checkError) {
        console.error(`Subscription check failed for ${tier.name}:`, checkError.message);
        throw new Error('Failed to verify subscription status');
      }

      if (existingSubscription) {
        setPaymentStatus(prev => ({ ...prev, [tier.name]: existingSubscription.status }));
        setPaymentInitiated(prev => ({ ...prev, [tier.name]: false }));
        setLockedBillingCycle(null);
        return;
      }

      const planAmount = isAnnual ? tier.annualPrice : tier.monthlyPrice;
      const billingCycle = isAnnual ? 'yearly' : 'monthly';
      console.log('Initiating subscription:', { plan_name: tier.name, billing_cycle: billingCycle, planAmount });

      const response = await axios.post('https://payment-gateway-serverless-lac.vercel.app/api/post-subscription', {
        amount: planAmount,
        currency: 'INR',
        plan_name: tier.name,
        billing_cycle: billingCycle,
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create subscription order');
      }

      const { orderId, amount, currency, subscriptionId, planAmount: serverPlanAmount } = response.data.data;

      if (!subscriptionId || !orderId) {
        throw new Error('Missing subscription ID or order ID from server');
      }

      if (planAmount !== serverPlanAmount) {
        console.error('Plan amount mismatch:', { clientAmount: planAmount, serverAmount: serverPlanAmount });
        throw new Error('Plan amount mismatch between client and server');
      }

      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_name: tier.name,
          amount: planAmount * 100, // Store plan amount in paise
          currency: 'INR',
          status: 'pending',
          razorpay_subscription_id: subscriptionId,
          razorpay_order_id: orderId,
        })
        .select()
        .single();

      if (subscriptionError) {
        console.error(`Failed to create subscription for ${tier.name}:`, subscriptionError.message);
        throw new Error('Failed to create subscription record');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount * 100, // Full plan amount in paise (e.g., 50000 for ₹500)
        currency,
        name: 'Sponsor Studio',
        description: `${tier.name} Plan (${isAnnual ? 'Annual' : 'Monthly'})`,
        order_id: orderId,
        subscription_id: subscriptionId,
        handler: async (response: any) => {
          try {
            console.log('Razorpay payment response:', JSON.stringify(response, null, 2));
            // Validate response fields
            if (!response.razorpay_payment_id || !response.razorpay_signature) {
              throw new Error('Missing razorpay_payment_id or razorpay_signature in response');
            }

            // Use response.razorpay_order_id if available, otherwise fallback to orderId
            const verifyOrderId = response.razorpay_order_id || orderId;
            if (verifyOrderId !== orderId) {
              console.warn('Order ID mismatch:', { responseOrderId: response.razorpay_order_id, originalOrderId: orderId });
            }

            // Clean inputs
            const cleanPaymentId = response.razorpay_payment_id.trim();
            const cleanSignature = response.razorpay_signature.trim();
            const cleanOrderId = verifyOrderId.trim();

            const verifyPayload = {
              razorpay_order_id: cleanOrderId,
              razorpay_payment_id: cleanPaymentId,
              razorpay_signature: cleanSignature,
              subscription_id: subscriptionId,
              amount: amount, // Full plan amount
            };
            console.log('Verification payload:', JSON.stringify(verifyPayload, null, 2));

            const verifyResponse = await axios.post('https://payment-gateway-serverless-lac.vercel.app/api/verify-post-subscription', verifyPayload);

            if (verifyResponse.data.success) {
              const { error: updateError } = await supabase
                .from('subscriptions')
                .update({
                  status: 'active',
                  razorpay_payment_id: cleanPaymentId,
                  razorpay_signature: cleanSignature,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', subscription.id);

              if (updateError) {
                console.error('Supabase update error:', updateError.message);
                throw new Error('Failed to update subscription');
              }

              console.log(`Subscription ${subscriptionId} activated in Supabase`);
              setPaymentStatus(prev => ({ ...prev, [tier.name]: 'active' }));
              setPaymentError(prev => ({ ...prev, [tier.name]: null }));
            } else {
              console.error('Verification failed:', verifyResponse.data.error, verifyResponse.data.details);
              await supabase
                .from('subscriptions')
                .update({ status: 'failed' })
                .eq('id', subscription.id);
              setPaymentError(prev => ({ ...prev, [tier.name]: verifyResponse.data.error || 'Payment verification failed' }));
            }
          } catch (error: any) {
            console.error(`Verification error for ${tier.name}:`, error.message, error.stack);
            await supabase
              .from('subscriptions')
              .update({ status: 'failed' })
              .eq('id', subscription.id);
            setPaymentError(prev => ({ ...prev, [tier.name]: error.message || 'Error verifying payment' }));
          } finally {
            setPaymentInitiated(prev => ({ ...prev, [tier.name]: false }));
            setLockedBillingCycle(null);
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || 'User',
          email: user.email || 'user@example.com',
          contact: user.user_metadata?.phone || '+919999999999',
        },
        theme: {
          color: '#2B4B9B',
        },
      };

      console.log('Razorpay options:', JSON.stringify(options, null, 2));
      const razorpay = new Razorpay(options);
      razorpay.on('payment.failed', async (response: any) => {
        console.error('Payment failed:', response.error, {
          orderId,
          subscriptionId,
          expectedAmount: amount,
          plan: tier.name,
          billingCycle,
          razorpayOptions: options,
        });
        await supabase
          .from('subscriptions')
          .update({ status: 'failed' })
          .eq('id', subscription.id);
        setPaymentError(prev => ({ ...prev, [tier.name]: `Payment failed: ${response.error.description || 'Unknown error'}` }));
        setPaymentInitiated(prev => ({ ...prev, [tier.name]: false }));
        setLockedBillingCycle(null);
      });
      razorpay.open();
    } catch (error: any) {
      console.error(`Subscription error for ${tier.name}:`, error.message, error.stack);
      setPaymentError(prev => ({ ...prev, [tier.name]: error.message || 'Failed to initiate subscription' }));
      setPaymentInitiated(prev => ({ ...prev, [tier.name]: false }));
      setLockedBillingCycle(null);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  };

  const buttonVariants = {
    hover: { scale: 1.1, transition: { duration: 0.2 } },
    tap: { scale: 0.9 },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center mb-12">
          <motion.h1
            className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Simple, Transparent Pricing
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Choose the plan that fits your needs. No hidden fees, cancel anytime.
          </motion.p>
        </div>

        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-sm flex items-center">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !isAnnual
                  ? 'bg-gradient-to-r from-indigo-400 to-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => !lockedBillingCycle && setIsAnnual(false)}
              disabled={!!lockedBillingCycle}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isAnnual
                  ? 'bg-gradient-to-r from-indigo-400 to-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => !lockedBillingCycle && setIsAnnual(true)}
              disabled={!!lockedBillingCycle}
            >
              Annual (Save ~10%)
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              className={`relative rounded-2xl overflow-hidden border border-gray-200/50 shadow-lg ${
                tier.isPopular ? 'ring-2 ring-indigo-500' : ''
              } ${tier.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={tier.disabled ? {} : 'hover'}
              transition={{ delay: 0.1 * index }}
            >
              <div className="h-full flex flex-col bg-white/80 p-6 backdrop-blur-sm">
                {tier.isPopular && (
                  <div className="absolute right-0 top-0 rounded-bl-lg bg-gray-900 px-4 py-1 text-sm font-medium text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="mb-2 text-xl font-bold text-gray-900">{tier.name}</h3>
                <p className="mb-4 text-sm text-gray-600">{tier.description}</p>
                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-gray-900">
                    ₹{isAnnual ? Math.round(tier.annualPrice / 12) : tier.monthlyPrice}
                  </span>
                  <span className="text-sm text-gray-600">/month</span>
                  {isAnnual && tier.monthlyPrice > 0 && (
                    <p className="text-sm text-gray-500">Billed annually at ₹{tier.annualPrice}</p>
                  )}
                </div>
                {paymentError[tier.name] && (
                  <p className="mb-4 text-sm text-red-600">{paymentError[tier.name]}</p>
                )}
                <motion.button
                  className={`w-full rounded-full py-3 text-sm font-semibold transition-all ${
                    paymentInitiated[tier.name] || tier.disabled
                      ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                      : 'bg-gradient-to-r from-indigo-400 to-indigo-600 text-white shadow-sm hover:brightness-110'
                  }`}
                  disabled={paymentInitiated[tier.name] || tier.disabled}
                  onClick={() => initiateSubscription(tier)}
                  variants={buttonVariants}
                  whileHover={paymentInitiated[tier.name] || tier.disabled ? {} : 'hover'}
                  whileTap={paymentInitiated[tier.name] || tier.disabled ? {} : 'tap'}
                >
                  {paymentInitiated[tier.name] ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="mr-2 h-5 w-5 animate-spin text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          d="M4 12a8 8 0 018-8v8H4z"
                          fill="currentColor"
                        />
                      </svg>
                      Initiating...
                    </span>
                  ) : paymentStatus[tier.name] === 'active' ? (
                    'Subscribed'
                  ) : (
                    tier.cta
                  )}
                </motion.button>
                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((feature, i) => (
                    <li className="flex items-center text-sm text-gray-600" key={i}>
                      <Check className="mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 rounded-2xl bg-white/80 p-6 shadow-lg backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
            Compare Plans
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-600">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">
                    Feature
                  </th>
                  {pricingTiers.map(tier => (
                    <th
                      className="px-4 py-3 text-center font-semibold text-gray-900"
                      key={tier.name}
                    >
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  'Active Events',
                  'Attendees',
                  'Analytics',
                  'Support',
                  'Custom Branding',
                  'API Access',
                  'Account Manager',
                ].map((feature, index) => (
                  <tr className="border-t border-gray-200" key={index}>
                    <td className="px-4 py-3">{feature}</td>
                    {pricingTiers.map(tier => {
                      const hasFeature = tier.features.some(f =>
                        f.toLowerCase().includes(feature.toLowerCase()),
                      );
                      return (
                        <td className="px-4 py-3 text-center" key={tier.name}>
                          {hasFeature ? (
                            <Check className="mx-auto h-5 w-5 text-green-500" />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-red-500" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          className="mx-auto mt-16 max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                className="rounded-lg bg-white shadow-sm"
                initial="hidden"
                key={index}
                transition={{ duration: 0.3 + index * 0.1 }}
                variants={cardVariants}
              >
                <button
                  className="flex w-full items-center justify-between p-4 text-left"
                  onClick={() =>
                    setExpandedFAQ(expandedFAQ === index ? null : index)
                  }
                >
                  <span className="text-sm font-semibold text-gray-900">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: expandedFAQ === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {expandedFAQ === index && (
                    <motion.div
                      className="px-4 pb-4 text-sm text-gray-600"
                      exit={{ height: 0, opacity: 0 }}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Pricing;