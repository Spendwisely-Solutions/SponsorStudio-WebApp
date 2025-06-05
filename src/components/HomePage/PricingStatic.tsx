import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";

interface BrandPricingTier {
  name: string;
  monthlyPrice: number;
  description: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
}

interface OpportunityPricingStep {
  name: string;
  cost: string;
  description: string;
  details: string[];
  isHighlighted?: boolean;
}

const brandPricingTiers: BrandPricingTier[] = [
  {
    name: "Free",
    monthlyPrice: 0,
    description: "Start connecting your brand with opportunities.",
    features: [
      "Express interest in up to 3 opportunities per month",
      "1 Risk Analysis report per month",
    ],
    cta: "Sign Up Free",
  },
  {
    name: "Basic",
    monthlyPrice: 1000,
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
    monthlyPrice: 2000,
    description: "For brands maximizing their opportunity engagement.",
    features: [
      "Express unlimited interest in opportunities",
      "5 Risk Analysis reports per month",
      "Dedicated account manager",
    ],
    cta: "Start Premium Plan",
  },
];

const opportunityPricingSteps: OpportunityPricingStep[] = [
  {
    name: "Opportunity Listing",
    cost: "Free",
    description: "List your Opportunity on our platform at no cost.",
    details: [
      "Get visibility from 100+ verified brands across industries",
      "Showcase Opportunity category, audience profile, and brand visibility options",
    ],
  },
  {
    name: "Discover Your Match",
    cost: "₹5,000 per Opportunity",
    description: "Unlock brand matches, shortlisting, and communication support.",
    details: [
      "Gain access to interested Sponsors through our dedicated dashboard",
    ],
    isHighlighted: true,
  },
  {
    name: "Commission on Deals",
    cost: "10% of Final Sponsorship Amount",
    description: "Charged only if a Sponsor is successfully onboarded via Sponsor Studio.",
    details: [
      "Pay only when a deal is successfully closed",
    ],
  },
];

const PricingSectionStatic: React.FC = () => {
  const [view, setView] = useState<"Brands" | "Opportunity Providers">("Brands");

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  };

  const buttonVariants = {
    hover: { scale: 1.1, transition: { duration: 0.2 } },
    tap: { scale: 0.95, opacity: 0.8, transition: { duration: 0.1 } },
  };

  const toggleVariants = {
    brands: { backgroundColor: "#3B82F6", color: "#FFFFFF" },
    opportunities: { backgroundColor: "#3B82F6", color: "#FFFFFF" },
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center mb-12">
          <motion.h2
            className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Our Pricing
          </motion.h2>
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-full bg-gray-200 p-1">
              <motion.button
                className="px-4 py-2 rounded-full text-sm font-semibold"
                onClick={() => setView("Brands")}
                variants={toggleVariants}
                animate={view === "Brands" ? "brands" : {}}
                style={
                  view !== "Brands"
                    ? { backgroundColor: "#E5E7EB", color: "#000000" }
                    : undefined
                }
              >
                Brands
              </motion.button>
              <motion.button
                className="px-4 py-2 rounded-full text-sm font-semibold"
                onClick={() => setView("Opportunity Providers")}
                variants={toggleVariants}
                animate={view === "Opportunity Providers" ? "opportunities" : {}}
                style={
                  view !== "Opportunity Providers"
                    ? { backgroundColor: "#E5E7EB", color: "#000000" }
                    : undefined
                }
              >
                Opportunity Providers
              </motion.button>
            </div>
          </div>
          <motion.p
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {view === "Brands"
              ? "Choose the plan that fits your brand’s needs. No hidden fees, cancel anytime."
              : "Pricing for each Opportunity you list. Pay only for the services you use."}
          </motion.p>
        </div>

        {view === "Brands" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {brandPricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                className={`relative rounded-2xl overflow-hidden border border-gray-200/50 shadow-2xl min-h-[500px] ${
                  tier.isPopular ? "ring-2 ring-indigo-500" : ""
                }`}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
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
                  <Link to="/pricing">
                    <motion.button
                      className="w-full py-3 rounded-full text-sm font-semibold transition-all duration-200 bg-gradient-to-r from-blue-700 to-indigo-600 text-white hover:brightness-110 shadow-md"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      aria-label={`View ${tier.name} plan details`}
                    >
                      {tier.cta}
                    </motion.button>
                  </Link>
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
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {opportunityPricingSteps.map((step, index) => (
              <motion.div
                key={step.name}
                className={`relative rounded-2xl overflow-hidden border border-gray-200/50 shadow-2xl min-h-[400px] ${
                  step.isHighlighted ? "ring-2 ring-indigo-500" : ""
                }`}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ delay: 0.1 * index }}
              >
                <div className="bg-white/80 backdrop-blur-sm p-8 h-full flex flex-col">
                  {step.isHighlighted && (
                    <div className="absolute top-0 right-0 bg-gray-800 text-white text-sm font-semibold px-4 py-1 rounded-full">
                      Key Step
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{step.name}</h3>
                  <p className="text-sm text-gray-600 mb-6">{step.description}</p>
                  <div className="mb-8">
                    <span className="text-3xl font-extrabold text-gray-900">{step.cost}</span>
                  </div>
                  <ul className="mt-6 space-y-4 flex-1">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-600">
                        <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                        <span className="text-base">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PricingSectionStatic;