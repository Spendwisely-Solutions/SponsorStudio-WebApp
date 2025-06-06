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
    console.log("PricingSectionStatic mounted with AOS initialized");
    console.log("opportunityPricingSteps:", opportunityPricingSteps);
  }, []);

  return (
    <div
      className="py-12 px-4 sm:px-6 lg:px-8"
      style={{ background: "#FFFFFF", minHeight: "100vh" }}
      id="pricing"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4"
            data-aos="zoom-in-up"
            data-aos-delay="100"
          >
            Our Pricing
          </h2>
          <p
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            data-aos="zoom-in-up"
            data-aos-delay="200"
          >
            Pricing for each Opportunity you list. Pay only for the services you use.
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
                onMouseEnter={() => console.log(`Hovered over ${step.name}`)}
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