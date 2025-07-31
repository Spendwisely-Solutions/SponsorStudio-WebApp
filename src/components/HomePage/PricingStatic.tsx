import React, { useEffect } from "react";
import { Check } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS styles
import { User } from '../../App'; // Assuming User type is defined in App.tsx

interface OpportunityPricingStep {
  name: string;
  cost: string;
  description: string;
  details: string[];
  isHighlighted?: boolean;
}

interface PricingSectionStaticProps {
  user: User | null;
}

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

const PricingSectionStatic: React.FC<PricingSectionStaticProps> = ({ user }) => {
  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 600, // Animation duration in milliseconds
      once: false, // Animate every time the element enters the viewport
      offset: 100, // Trigger animation 100px before the element enters the viewport
    });
  }, []);

  return (
    <div
      className="py-12 px-4 sm:px-6 lg:px-8"
      style={{ background: "#FFFFFF", minHeight: "100vh" }}
      id="pricing"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-6 py-3 mb-8 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-blue-100/50">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-3 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-800">Transparent Pricing</span>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-600">Pay only for what you use</span>
              </div>
            </div>
          </div>
          
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
            data-aos="zoom-in-up"
            data-aos-delay="100"
          >
            Our Pricing
          </h2>
          
          {/* Feature badges */}
          <div className="flex flex-wrap gap-3 justify-center mt-8 mb-10">
            <div className="feature-badge flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-200/50 shadow-sm">
              <span className="text-sm font-medium text-blue-800">No Hidden Fees</span>
            </div>
            <div className="feature-badge flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200/50 shadow-sm">
              <span className="text-sm font-medium text-green-800">Free Opportunity Listing</span>
            </div>
            <div className="feature-badge flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-full border border-purple-200/50 shadow-sm">
              <span className="text-sm font-medium text-purple-800">Pay Only For Success</span>
            </div>
          </div>
          
          <p
            className="mt-6 max-w-2xl mx-auto text-xl sm:text-2xl text-gray-600 leading-relaxed font-light"
            data-aos="zoom-in-up"
            data-aos-delay="200"
          >
            Pricing for each Opportunity you list. Pay only for the services you use with our transparent pricing model.
          </p>
        </div>

        {opportunityPricingSteps.length === 0 ? (
          <div
            className="text-center text-gray-600"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            No pricing steps available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {opportunityPricingSteps.map((step, index) => (
              <div
                key={step.name}
                className={`relative rounded-2xl border border-gray-200/50 shadow-xl min-h-[400px] bg-white transition duration-300 ease-in-out hover:shadow-2xl hover:bg-gray-50 will-change-transform hover:scale-105 ${
                  step.isHighlighted ? "ring-2 ring-indigo-500" : ""
                }`}
                data-aos="zoom-in-up"
                data-aos-delay={index * 100}
              >
                <div className="p-8 h-full flex flex-col">
                  {step.isHighlighted && (
                    <div
                      className="absolute top-0 right-0 bg-gray-800 text-white text-sm font-semibold px-4 py-1 rounded-full"
                      data-aos="fade-in"
                      data-aos-delay={(index * 100) + 200}
                    >
                      Key Step
                    </div>
                  )}
                  <h3
                    className="text-xl font-bold text-gray-900 mb-4"
                    data-aos="fade-up"
                    data-aos-delay={(index * 100) + 300}
                  >
                    {step.name}
                  </h3>
                  <p
                    className="text-sm text-gray-600 mb-6"
                    data-aos="fade-up"
                    data-aos-delay={(index * 100) + 400}
                  >
                    {step.description}
                  </p>
                  <div
                    className="mb-8"
                    data-aos="fade-up"
                    data-aos-delay={(index * 100) + 500}
                  >
                    <span className="text-3xl font-extrabold text-gray-900">{step.cost}</span>
                  </div>
                  <ul className="mt-6 space-y-4 flex-1">
                    {step.details.map((detail, i) => (
                      <li
                        key={i}
                        className="flex items-center text-sm text-gray-600"
                        data-aos="fade-left"
                        data-aos-delay={(index * 100) + 600 + (i * 100)}
                      >
                        <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                        <span className="text-base">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingSectionStatic;