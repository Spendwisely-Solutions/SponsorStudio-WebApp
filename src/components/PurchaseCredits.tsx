import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRazorpay } from 'react-razorpay';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Shield, Clock, ArrowLeft, CreditCard, Gift, Sparkles } from 'lucide-react';

const creditPacks = [
  { 
    name: 'Starter Pack', 
    credits: 2000, 
    price: 10000, 
    description: 'Perfect for testing the waters',
    features: ['40+ Like/Interest actions', '20+ Brochure unlocks', '4+ Risk Analysis reports', '6+ Revive opportunities'],
    expiryDays: 180,
    popular: false,
    icon: Gift,
    color: 'from-blue-500 to-blue-600'
  },
  { 
    name: 'Professional Pack', 
    credits: 5000, 
    price: 20000, 
    description: 'Most popular choice for growing brands',
    features: ['100+ Like/Interest actions', '50+ Brochure unlocks', '10+ Risk Analysis reports', '16+ Revive opportunities'],
    expiryDays: 180,
    popular: true,
    icon: Star,
    color: 'from-purple-500 to-purple-600'
  },
  { 
    name: 'Enterprise Pack', 
    credits: 10000, 
    price: 30000, 
    description: 'Maximum value for large-scale campaigns',
    features: ['200+ Like/Interest actions', '100+ Brochure unlocks', '20+ Risk Analysis reports', '33+ Revive opportunities'],
    expiryDays: 180,
    popular: false,
    icon: Zap,
    color: 'from-green-500 to-green-600'
  },
];

const PurchaseCredits: React.FC = () => {
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [currentCredits, setCurrentCredits] = useState<number>(0);
  const { Razorpay } = useRazorpay();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setCurrentCredits(profileData?.credits || 0);
      } catch (error) {
        console.error('Error fetching credits:', error);
      }
    };

    fetchCredits();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getMoneyPerCredit = (price: number, credits: number) => {
    if (price === 0) return 'Free';
    const perCredit = price / credits;
    return `₹${perCredit.toFixed(2)} per credit`;
  };

  const handlePurchase = async (pack: typeof creditPacks[0], index: number) => {
    try {
      setLoading((prev) => ({ ...prev, [index]: true }));
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Calculate expiry date
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + pack.expiryDays);
      expiryDate.setHours(23, 59, 59, 999); // Set to end of day

      // Check for existing unexpired credits
      const { data: existingCredits, error: creditsError } = await supabase
        .from('credits')
        .select('id, credits_added, expires_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('expires_at', new Date().toISOString());

      if (creditsError) throw new Error('Failed to fetch existing credits');

      // Get current profile credits
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (profileError) throw new Error('Failed to fetch profile');

      const currentCredits = profile.credits || 0;

      // For free pack
      if (pack.price === 0) {
        // Update existing unexpired credits' expiry date or add new credits
        if (existingCredits.length > 0) {
          const { error: updateExpiryError } = await supabase
            .from('credits')
            .update({ expires_at: expiryDate.toISOString() })
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .gte('expires_at', new Date().toISOString());

          if (updateExpiryError) throw new Error('Failed to update existing credits expiry');

          // Add new credits to profile
          const newCredits = currentCredits + pack.credits;
          const { error: updateProfileError } = await supabase
            .from('profiles')
            .update({ credits: newCredits })
            .eq('id', user.id);

          if (updateProfileError) throw new Error('Failed to update profile credits');
        } else {
          // Add new credits
          const newCredits = currentCredits + pack.credits;
          const { error: updateProfileError } = await supabase
            .from('profiles')
            .update({ credits: newCredits })
            .eq('id', user.id);

          if (updateProfileError) throw new Error('Failed to update profile credits');
        }

        // Record free pack redemption in credits table
        const { error: creditError } = await supabase
          .from('credits')
          .insert({
            user_id: user.id,
            amount: 0,
            currency: 'INR',
            status: 'completed',
            credits_added: pack.credits,
            description: `Free Pack: ${pack.credits} credits`,
            expires_at: expiryDate.toISOString(),
          });

        if (creditError) console.error('Failed to record free pack redemption:', creditError.message);

        // Update the current credits display on the page for free pack
        setCurrentCredits(currentCredits + pack.credits);
        
        // Show success message and clear any errors
        setError(null);

        setLoading((prev) => ({ ...prev, [index]: false }));
        return;
      }

      // For paid packs, initiate Razorpay payment
      const response = await axios.post('https://payment-gateway-serverless-lac.vercel.app/api/create-order', {
        amount: pack.price,
        currency: 'INR',
      });

      const { orderId, amount: razorpayAmount, currency } = response.data;

      // Record payment attempt in credits table
      const { data: credit, error: creditError } = await supabase
        .from('credits')
        .insert({
          user_id: user.id,
          amount: razorpayAmount * 100,
          currency: 'INR',
          status: 'pending',
          razorpay_order_id: orderId,
          credits_added: pack.credits,
          description: `${pack.name}: ${pack.credits} credits`,
          expires_at: expiryDate.toISOString(),
        })
        .select()
        .single();

      if (creditError) throw new Error('Failed to create credit record');

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayAmount * 100,
        currency,
        name: 'Sponsor Studio',
        description: `Purchase ${pack.credits} credits`,
        order_id: orderId,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verifyResponse = await axios.post('https://payment-gateway-serverless-lac.vercel.app/api/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.data.success) {
              // Update credit record status
              const { error: updateCreditError } = await supabase
                .from('credits')
                .update({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  status: 'completed',
                })
                .eq('id', credit.id);

              if (updateCreditError) throw new Error('Failed to update credit record status');

              // Update existing unexpired credits' expiry date
              if (existingCredits.length > 0) {
                const { error: updateExpiryError } = await supabase
                  .from('credits')
                  .update({ expires_at: expiryDate.toISOString() })
                  .eq('user_id', user.id)
                  .eq('status', 'completed')
                  .gte('expires_at', new Date().toISOString());

                if (updateExpiryError) throw new Error('Failed to update existing credits expiry');
              }

              // Update user credits
              const newCredits = currentCredits + pack.credits;
              const { error: updateCreditsError } = await supabase
                .from('profiles')
                .update({ credits: newCredits })
                .eq('id', user.id);

              if (updateCreditsError) throw new Error('Failed to update credits');

              // Update the current credits display on the page
              setCurrentCredits(newCredits);
              
              // Show success message
              setError(null);
            } else {
              await supabase
                .from('credits')
                .update({ status: 'failed' })
                .eq('id', credit.id);
              setError('Payment verification failed. Please contact support.');
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            await supabase
              .from('credits')
              .update({ status: 'failed' })
              .eq('id', credit.id);
            setError('Error verifying payment. Please try again.');
          } finally {
            setLoading((prev) => ({ ...prev, [index]: false }));
          }
        },
        prefill: {
          name: user.user_metadata?.name || 'User',
          email: user.email || 'user@example.com',
          contact: user.user_metadata?.phone || '+919999999999',
        },
        theme: {
          color: '#2B4B9B',
        },
      };

      const razorpay = new Razorpay(options);
      razorpay.on('payment.failed', async (response: any) => {
        console.error('Payment failed:', response.error.description);
        await supabase
          .from('credits')
          .update({ status: 'failed' })
          .eq('id', credit.id);
        setError(`Payment failed: ${response.error.description}`);
        setLoading((prev) => ({ ...prev, [index]: false }));
      });
      razorpay.open();
    } catch (error: any) {
      console.error('Purchase error:', error.message);
      setError('Failed to process purchase. Please try again.');
      setLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' },
    tap: { scale: 0.95 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#2B4B9B] to-[#3B5BB9] text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
          </motion.div>
          
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 mr-3 text-yellow-300" />
              <h1 className="text-4xl lg:text-5xl font-bold">
                Boost Your Campaign
              </h1>
            </div>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Choose the perfect credit pack to power your sponsorship campaigns and connect with amazing opportunities
            </p>
            
            {/* Current Credits Display */}
            {currentCredits > 0 && (
              <motion.div
                className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <CreditCard className="w-5 h-5 mr-2 text-yellow-300" />
                <span className="font-semibold">Current Balance: {currentCredits.toLocaleString()} Credits</span>
              </motion.div>
            )}
          </motion.div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-white/5 rounded-full"></div>
          <div className="absolute top-32 -left-8 w-24 h-24 bg-white/5 rounded-full"></div>
          <div className="absolute bottom-16 right-32 w-20 h-20 bg-white/5 rounded-full"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {error && (
          <motion.div
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Shield className="w-5 h-5 mr-3 text-red-500" />
            {error}
          </motion.div>
        )}

        {/* Credit Usage Guide - Hidden on mobile, shown on desktop */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-gray-100 hidden lg:block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">How Credits Work</h2>
            <p className="text-gray-600">Understand how your credits are used across our platform</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { action: 'Like/Interest', cost: 50, icon: '❤️', color: 'bg-red-50 border-red-100' },
              { action: 'Unlock Brochure', cost: 100, icon: '📄', color: 'bg-blue-50 border-blue-100' },
              { action: 'Post Event Report', cost: 100, icon: '📊', color: 'bg-green-50 border-green-100' },
              { action: 'Revive Opportunities', cost: 300, icon: '🔄', color: 'bg-orange-50 border-orange-100' },
              { action: 'Risk Analysis', cost: 500, icon: '🛡️', color: 'bg-purple-50 border-purple-100' },
            ].map((item, index) => (
              <motion.div
                key={item.action}
                className={`${item.color} rounded-xl p-4 text-center border`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">{item.action}</h3>
                <p className="text-lg font-bold text-gray-900">{item.cost} credits</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Credit Packs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {creditPacks.map((pack, index) => {
            const IconComponent = pack.icon;
            return (
              <motion.div
                key={pack.name}
                className={`relative bg-white rounded-2xl shadow-xl border-2 ${
                  pack.popular ? 'border-purple-200 ring-4 ring-purple-100' : 'border-gray-100'
                } overflow-hidden group hover:shadow-2xl transition-all duration-300 flex flex-col`}
                variants={cardVariants}
                custom={index}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -5 }}
              >
                {/* Popular Badge */}
                {pack.popular && (
                  <div className="absolute -top-1 -right-1 z-10">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-bl-xl rounded-tr-xl text-sm font-semibold flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className={`bg-gradient-to-r ${pack.color} p-6 text-white relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <IconComponent className="w-8 h-8" />
                      <div className="text-right">
                        <div className="text-3xl font-bold">{pack.credits.toLocaleString()}</div>
                        <div className="text-sm opacity-90">Credits</div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{pack.name}</h3>
                    <p className="text-sm opacity-90">{pack.description}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                      {pack.price === 0 ? 'FREE' : formatPrice(pack.price)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getMoneyPerCredit(pack.price, pack.credits)}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8 flex-grow">
                    {pack.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Expiry Info */}
                  <div className="flex items-center justify-center mb-6 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">Valid for {pack.expiryDays} days</span>
                  </div>

                  {/* Purchase Button */}
                  <motion.button
                    onClick={() => handlePurchase(pack, index)}
                    disabled={loading[index]}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 mt-auto ${
                      loading[index]
                        ? 'bg-gray-400 cursor-not-allowed'
                        : pack.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
                        : `bg-gradient-to-r ${pack.color} hover:shadow-lg`
                    }`}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {loading[index] ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                          <circle 
                            className="opacity-25" 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="4" 
                            fill="none" 
                          />
                          <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8v8H4z" 
                          />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        {pack.price === 0 ? (
                          <>
                            <Gift className="w-5 h-5 mr-2" />
                            Claim Free Credits
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5 mr-2" />
                            Purchase Now
                          </>
                        )}
                      </span>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Credit Usage Guide - Mobile version (shown only on mobile) */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 my-12 border border-gray-100 block lg:hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">How Credits Work</h2>
            <p className="text-gray-600 text-sm">Credit costs for different actions</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { action: 'Like/Interest', cost: 50, icon: '❤️', color: 'bg-red-50 border-red-100' },
              { action: 'Unlock Brochure', cost: 100, icon: '📄', color: 'bg-blue-50 border-blue-100' },
              { action: 'Post Event Report', cost: 100, icon: '📊', color: 'bg-green-50 border-green-100' },
              { action: 'Revive Opportunities', cost: 300, icon: '🔄', color: 'bg-orange-50 border-orange-100' },
              { action: 'Risk Analysis', cost: 500, icon: '🛡️', color: 'bg-purple-50 border-purple-100' },
            ].map((item, index) => (
              <motion.div
                key={item.action}
                className={`${item.color} rounded-xl p-3 text-center border`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <div className="text-xl mb-1">{item.icon}</div>
                <h3 className="font-semibold text-gray-800 text-xs mb-1">{item.action}</h3>
                <p className="text-sm font-bold text-gray-900">{item.cost} credits</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Security & Trust Section */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-green-500 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">Secure & Trusted</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">256-bit SSL Encryption</h4>
                <p className="text-gray-600 text-sm">Your payment information is always secure</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Instant Activation</h4>
                <p className="text-gray-600 text-sm">Credits are added to your account immediately</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">24/7 Support</h4>
                <p className="text-gray-600 text-sm">Get help whenever you need it</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PurchaseCredits;