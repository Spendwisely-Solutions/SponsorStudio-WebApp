import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { useRazorpay } from "react-razorpay";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { supabase } from "../../lib/supabase";

interface PricingTier {
  name: string;
  monthlyPrice: number;
  description: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
  disabled?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    monthlyPrice: 0,
    description: "Start connecting your brand with opportunities.",
    features: [
      "Express interest in up to 3 opportunities per month",
      "1 Risk Analysis report per month",
    ],
    cta: "Sign Up Free",
    disabled: false,
  },
  {
    name: "Basic",
    monthlyPrice: 500,
    description: "Ideal for growing brands seeking more opportunities.",
    features: [
      "Express interest in up to 10 opportunities per month",
      "3 Risk Analysis reports per month",
    ],
    cta: "Start Basic Plan",
    isPopular: true,
  },
  {
    name: "Premium",
    monthlyPrice: 1000,
    description: "For brands maximizing their opportunity engagement.",
    features: [
      "Express unlimited interest in opportunities",
      "5 Risk Analysis reports per month",
      "Dedicated account manager",
    ],
    cta: "Start Premium Plan",
  },
];

const WarningModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tierName: string;
}> = ({ isOpen, onClose, onConfirm, tierName }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Plan Upgrade</h3>
          <p className="text-sm text-gray-600 mb-6">
            Upgrading to the {tierName} plan will cancel your existing plan. Do you want to continue?
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-full text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Continue
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Skeleton UI for pricing cards
const PricingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[...Array(3)].map((_, index) => (
      <div key={index} className="bg-white/80 rounded-2xl shadow-lg p-8 min-h-[500px] animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
        <div className="h-10 bg-gray-200 rounded mb-8"></div>
        <div className="h-10 bg-gray-200 rounded-full mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const Pricing: React.FC = () => {
  const [paymentStatus, setPaymentStatus] = useState<Record<string, string>>({});
  const [paymentInitiated, setPaymentInitiated] = useState<Record<string, boolean>>({});
  const [paymentError, setPaymentError] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [lockedBillingCycle, setLockedBillingCycle] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [isBrand, setIsBrand] = useState<boolean | null>(null);
  const { Razorpay } = useRazorpay();
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUserTypeAndSubscription() {
      setLoading(true);

      try {
        // Parallelize auth and profile queries
        const [authResponse, profileResponse] = await Promise.all([
          supabase.auth.getUser(),
          supabase.auth.getUser().then(({ data: { user } }) =>
            user ? supabase.from("profiles").select("user_type").eq("id", user.id).single() : Promise.reject(new Error("No user"))
          ),
        ]);

        const { data: { user }, error: authError } = authResponse;
        const { data: profile, error: profileError } = profileResponse;

        if (authError || !user) {
          console.log("No authenticated user found");
          navigate("/login");
          setLoading(false);
          return;
        }

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          navigate("/unauthorized");
          setLoading(false);
          return;
        }

        if (profile.user_type !== "brand") {
          console.log(`User ${user.id} is not a brand, user_type: ${profile.user_type}`);
          setIsBrand(false);
          navigate("/unauthorized");
          setLoading(false);
          return;
        }

        setIsBrand(true);

        // Fetch subscription only if user is a brand
        let { data: subscriptions, error: subError } = await supabase
          .from("subscriptions")
          .select("plan_name, status")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        if (subError) {
          console.error("Error fetching subscriptions:", subError);
          throw subError;
        }

        if (!subscriptions) {
          console.log(`No subscription found for user ${user.id}, creating Free plan`);
          const { data: newSubscription, error: insertError } = await supabase
            .from("subscriptions")
            .insert({
              user_id: user.id,
              plan_name: "Free",
              amount: 0,
              currency: "INR",
              status: "active",
              razorpay_subscription_id: null,
              razorpay_order_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (insertError) {
            console.error("Error creating Free plan:", insertError);
            throw insertError;
          }
          subscriptions = newSubscription;
        }

        const statusMap: Record<string, string> = {};
        console.log("Subscription found/created:", subscriptions);
        statusMap[subscriptions.plan_name] = subscriptions.status;
        setCurrentPlan(subscriptions.plan_name);
        setPaymentStatus((prev) => ({ ...prev, ...statusMap }));
      } catch (error: any) {
        console.error("Unexpected error handling user check or subscriptions:", error.message);
        navigate("/error");
      } finally {
        setLoading(false);
      }
    }

    checkUserTypeAndSubscription();
  }, [navigate]);

  const checkSubscriptionStatus = async (
    subscriptionId: string,
    tierName: string,
    maxAttempts = 5,
    interval = 3000
  ) => {
    console.log(`Checking subscription status for ${subscriptionId}, tier: ${tierName}`);
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`Attempt ${attempts}/${maxAttempts} for subscriptionId: ${subscriptionId}`);

      try {
        const response = await axios.post(
          "https://payment-gateway-serverless-lac.vercel.app/api/check-subscription-status",
          { subscriptionId }
        );

        console.log("Check subscription response:", response.data);

        if (response.data.success && response.data.status === "active") {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error: updateError } = await supabase
              .from("subscriptions")
              .update({
                plan_name: tierName,
                status: "active",
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", user.id);

            if (updateError) {
              console.error(`Failed to update plan to ${tierName}:`, updateError);
              throw new Error("Failed to finalize subscription");
            }
          }

          setPaymentStatus((prev) => ({ ...prev, [tierName]: "active" }));
          setPaymentError((prev) => ({ ...prev, [tierName]: null }));
          setCurrentPlan(tierName);
          console.log(`Payment confirmed for ${tierName}, subscriptionId: ${subscriptionId}`);
          return true;
        } else if (response.data.success) {
          console.log(`Subscription status: ${response.data.status}, retrying...`);
        } else {
          console.error("Check subscription error:", response.data.error);
        }

        await new Promise((resolve) => setTimeout(resolve, interval));
      } catch (error: any) {
        console.error(`Error checking subscription status on attempt ${attempts}:`, error.message);
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }

    console.error(`Failed to confirm subscription after ${maxAttempts} attempts for ${subscriptionId}`);
    setPaymentError((prev) => ({
      ...prev,
      [tierName]: "Payment not confirmed. Please check your account or contact support.",
    }));
    return false;
  };

  const initiateSubscription = async (tier: PricingTier, isUpgrade = false) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setPaymentError((prev) => ({
          ...prev,
          [tier.name]: "Please log in to subscribe.",
        }));
        return;
      }

      if (tier.name === "Free") {
        console.log(`Initiating Free plan for user ${user.id}`);
        setPaymentInitiated((prev) => ({ ...prev, [tier.name]: true }));
        const { data, error } = await supabase
          .from("subscriptions")
          .upsert(
            {
              user_id: user.id,
              plan_name: "Free",
              amount: null,
              currency: null,
              status: "active",
              razorpay_subscription_id: null,
              razorpay_order_id: null,
              updated_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            },
            { onConflict: ["user_id"] }
          )
          .select()
          .single();

        if (error) {
          console.error(`Failed to set Free plan for user ${user.id}:`, error);
          throw new Error("Failed to set Free plan");
        }

        console.log(`Free plan set for user ${user.id}:`, data);
        setPaymentStatus((prev) => ({ ...prev, [tier.name]: "active" }));
        setPaymentError((prev) => ({ ...prev, [tier.name]: null }));
        setCurrentPlan("Free");
        setPaymentInitiated((prev) => ({ ...prev, [tier.name]: false }));
        setLockedBillingCycle(null);
        return;
      }

      const { data: currentSubscription, error: fetchError } = await supabase
        .from("subscriptions")
        .select("plan_name, status, razorpay_subscription_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching current subscription:", fetchError);
        throw new Error("Failed to verify current subscription");
      }

      const originalPlan = currentSubscription?.plan_name || "Free";
      const originalStatus = currentSubscription?.status || "active";
      const existingSubscriptionId = currentSubscription?.razorpay_subscription_id;

      setPaymentInitiated((prev) => ({ ...prev, [tier.name]: true }));
      setPaymentError((prev) => ({ ...prev, [tier.name]: null }));
      setLockedBillingCycle("monthly");

      if (isUpgrade && existingSubscriptionId && originalPlan !== "Free") {
        console.log(`Cancelling existing subscription ${existingSubscriptionId} for user ${user.id}`);
        try {
          const response = await axios.post(
            "https://payment-gateway-serverless-lac.vercel.app/api/cancel-subscription",
            { subscriptionId: existingSubscriptionId }
          );

          if (!response.data.success) {
            throw new Error(response.data.error || "Failed to cancel existing subscription");
          }

          console.log(`Cancelled subscription ${existingSubscriptionId}:`, response.data.data);

          const { error: updateError } = await supabase
            .from("subscriptions")
            .update({
              razorpay_subscription_id: null,
              razorpay_order_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);

          if (updateError) {
            console.error(`Failed to clear Razorpay IDs for user ${user.id}:`, updateError);
            throw new Error("Failed to update subscription record");
          }
        } catch (error: any) {
          console.error(`Error cancelling subscription ${existingSubscriptionId}:`, error.message);
          throw error;
        }
      }

      const planAmount = tier.monthlyPrice;
      const billingCycle = "monthly";
      console.log("Initiating subscription:", {
        plan_name: tier.name,
        billing_cycle: billingCycle,
        planAmount,
        user_id: user.id,
      });

      const response = await axios.post(
        "https://payment-gateway-serverless-lac.vercel.app/api/post-subscription",
        {
          amount: planAmount,
          currency: "INR",
          plan_name: tier.name,
          billing_cycle: billingCycle,
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to create subscription order");
      }

      const { orderId, amount, currency, subscriptionId, planAmount: serverPlanAmount } =
        response.data.data;

      if (!subscriptionId || !orderId) {
        throw new Error("Missing subscription ID or order ID from server");
      }

      if (planAmount !== serverPlanAmount) {
        console.error("Plan amount mismatch:", {
          clientAmount: planAmount,
          serverAmount: serverPlanAmount,
        });
        throw new Error("Plan amount mismatch between client and server");
      }

      console.log(`Upserting subscription for user ${user.id}:`, {
        plan_name: tier.name,
        amount: planAmount * 100,
        subscriptionId,
        orderId,
      });

      const { data, error: upsertError } = await supabase
        .from("subscriptions")
        .upsert(
          {
            user_id: user.id,
            plan_name: originalPlan, // Keep original until confirmed
            amount: planAmount * 100,
            currency: "INR",
            status: "pending",
            razorpay_subscription_id: subscriptionId,
            razorpay_order_id: orderId,
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          },
          { onConflict: ["user_id"] }
        )
        .select()
        .single();

      if (upsertError) {
        console.error(`Failed to upsert subscription for ${tier.name}:`, upsertError);
        throw new Error("Failed to update subscription record");
      }

      console.log(`Subscription upserted for user ${user.id}:`, data);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency,
        name: "Sponsor Studio",
        description: `${tier.name} Plan`,
        order_id: orderId,
        subscription_id: subscriptionId,
        handler: async (response: any) => {
          try {
            console.log("Razorpay payment response:", JSON.stringify(response, null, 2));
            setPaymentError((prev) => ({ ...prev, [tier.name]: null }));
            await checkSubscriptionStatus(subscriptionId, tier.name);
          } catch (error: any) {
            console.error(`Error for ${tier.name}:`, error.message);
            setPaymentError((prev) => ({
              ...prev,
              [tier.name]: "Failed to confirm payment. Please check your account or contact support.",
            }));
          } finally {
            setPaymentInitiated((prev) => ({ ...prev, [tier.name]: false }));
            setLockedBillingCycle(null);
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || "User",
          email: user.email || "user@example.com",
          contact: user.user_metadata?.phone || "+91",
        },
        theme: {
          color: "#2B4B9B",
        },
        notes: {
          subscription_id: subscriptionId,
        },
      };

      console.log("Razorpay options:", JSON.stringify(options, null, 2));
      const razorpay = new Razorpay(options);
      razorpay.on("payment.failed", async (response: any) => {
        console.error("Payment failed:", response.error);
        await supabase
          .from("subscriptions")
          .update({
            plan_name: originalPlan,
            status: originalStatus,
            razorpay_subscription_id: null,
            razorpay_order_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
        setPaymentError((prev) => ({
          ...prev,
          [tier.name]: `Payment failed: ${response.error.description || "Unknown error"}`,
        }));
        setPaymentInitiated((prev) => ({ ...prev, [tier.name]: false }));
        setLockedBillingCycle(null);
      });
      razorpay.open();
    } catch (error: any) {
      console.error(`Subscription error for ${tier.name}:`, error.message);
      setPaymentError((prev) => ({
        ...prev,
        [tier.name]: error.message || "Failed to initiate subscription",
      }));
      setPaymentInitiated((prev) => ({ ...prev, [tier.name]: false }));
      setLockedBillingCycle(null);
    }
  };

  const handlePlanSelection = useMemo(
    () =>
      (tier: PricingTier) => {
        const isUpgrade = currentPlan === "Basic" && tier.name === "Premium";
        if (isUpgrade) {
          setSelectedTier(tier);
          setShowWarningModal(true);
        } else {
          initiateSubscription(tier);
        }
      },
    [currentPlan]
  );

  const handleConfirmUpgrade = useMemo(
    () => () => {
      if (selectedTier) {
        initiateSubscription(selectedTier, true);
      }
      setShowWarningModal(false);
      setSelectedTier(null);
    },
    [selectedTier]
  );

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  };

  const buttonVariants = {
    hover: { scale: 1.1, transition: { duration: 0.2 } },
    tap: { scale: 0.95, opacity: 0.8, transition: { duration: 0.1 } },
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <span className="text-xl font-bold text-gray-900">Sponsor Studio</span>
                </div>
                <div className="ml-10 flex items-center space-x-4">
                  <Link
                    to="/"
                    className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Home
                  </Link>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto animate-pulse"></div>
          </div>
          <PricingSkeleton />
        </div>
      </div>
    );
  }

  if (isBrand === false) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized Access</h2>
          <p className="text-gray-600 mb-4">
            This page is only accessible to users with a Brand account.
          </p>
          <Link
            to="/"
            className="px-4 py-2 rounded-full text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-gray-900">Sponsor Studio</span>
              </div>
              <div className="ml-10 flex items-center space-x-4">
                <Link
                  to="/"
                  className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </Link>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <motion.div
        className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <WarningModal
          isOpen={showWarningModal}
          onClose={() => {
            setShowWarningModal(false);
            setSelectedTier(null);
          }}
          onConfirm={handleConfirmUpgrade}
          tierName={selectedTier?.name || ""}
        />

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
            Choose the plan that fits your brand’s needs. No hidden fees, cancel anytime.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingTiers.map((tier, index) => {
            const isCurrentPlan = currentPlan === tier.name;
            const isDisabled =
              tier.disabled ||
              paymentInitiated[tier.name] ||
              (currentPlan === "Premium" && (tier.name === "Basic" || tier.name === "Free")) ||
              (currentPlan === "Basic" && tier.name === "Free");
            const buttonText = isCurrentPlan
              ? "Current Plan"
              : currentPlan === "Basic" && tier.name === "Premium"
              ? "Upgrade"
              : currentPlan === "Free" && tier.name !== "Free"
              ? "Subscribe"
              : tier.cta;

            return (
              <motion.div
                key={tier.name}
                className={`relative rounded-2xl overflow-hidden border border-gray-200/50 shadow-lg min-h-[500px] ${
                  tier.isPopular ? "ring-2 ring-indigo-500" : ""
                } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={isDisabled ? {} : "hover"}
                transition={{ delay: 0.1 * index }}
              >
                <div className="bg-white/80 backdrop-blur-sm p-8 h-full flex flex-col">
                  {tier.isPopular && (
                    <div className="absolute top-0 right-0 bg-gray-800 text-white text-sm font-semibold px-4 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{tier.name}</h3>
                  <p className="text-sm text-gray-600 mb-6">{tier.description}</p>
                  <div className="mb-8">
                    <span className="text-4xl font-extrabold text-gray-900">₹{tier.monthlyPrice}</span>
                    <span className="text-base text-gray-500">/month</span>
                  </div>
                  {paymentError[tier.name] && (
                    <p className="text-sm text-red-600 mb-4">{paymentError[tier.name]}</p>
                  )}
                  <motion.button
                    onClick={() => !isCurrentPlan && !isDisabled && handlePlanSelection(tier)}
                    className={`w-full py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                      isDisabled || paymentInitiated[tier.name]
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-700 to-indigo-600 text-white hover:brightness-110 shadow-md"
                    }`}
                    variants={buttonVariants}
                    whileHover={isDisabled || paymentInitiated[tier.name] ? {} : "hover"}
                    whileTap={isDisabled || paymentInitiated[tier.name] ? {} : "tap"}
                    disabled={isDisabled || paymentInitiated[tier.name]}
                    aria-label={paymentInitiated[tier.name] ? "Processing subscription" : buttonText}
                  >
                    {paymentInitiated[tier.name] ? (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-center"
                      >
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Processing...
                      </motion.span>
                    ) : (
                      <motion.span
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {buttonText}
                      </motion.span>
                    )}
                  </motion.button>
                  <ul className="mt-6 space-y-4 flex-1">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-600">
                        <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                        <span className="text-base">{feature}</span>
                      </li>
                    ))}
                    {tier.name !== "Premium" && (
                      <li className="flex items-center text-sm text-gray-600">
                        <X className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                        <span className="text-base">No dedicated account manager</span>
                      </li>
                    )}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default React.memo(Pricing);