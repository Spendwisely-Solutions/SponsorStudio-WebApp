import React, { useState } from 'react';
import { useRazorpay } from 'react-razorpay';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import type { Database } from '../lib/database.types';

const creditPacks = [
  { name: 'Basic Pack', credits: 2000, price: 10000, description: 'Get started with our basic pack', expiryDays: 180 },
  { name: 'Standard Pack', credits: 5000, price: 20000, description: 'Ideal for small campaigns', expiryDays: 180 },
  { name: 'Premium Pack', credits: 10000, price: 30000 , description: 'Best value for large campaigns', expiryDays: 180 },
];

const PurchaseCredits: React.FC = () => {
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const { Razorpay } = useRazorpay();

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
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-4xl w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">Purchase Credits</h1>
        {error && (
          <motion.div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {creditPacks.map((pack, index) => (
            <motion.div
              key={pack.name}
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center border border-gray-200 hover:shadow-xl transition-shadow"
              variants={cardVariants}
              custom={index}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{pack.name}</h2>
              <p className="text-3xl font-bold text-indigo-600 mb-2">{pack.credits} Credits</p>
              <p className="text-gray-600 mb-4">
                {pack.price === 0 ? 'Free' : `₹${pack.price}`}
              </p>
              <p className="text-sm text-gray-500 mb-6">{pack.description}</p>
              <motion.button
                onClick={() => handlePurchase(pack, index)}
                disabled={loading[index]}
                className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
                  loading[index]
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#2B4B9B] to-[#3B5BB9] hover:from-[#3B5BB9] hover:to-[#4B6BC9]'
                }`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {loading[index] ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  pack.price === 0 ? 'Claim Free Credits' : 'Purchase Now'
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PurchaseCredits;