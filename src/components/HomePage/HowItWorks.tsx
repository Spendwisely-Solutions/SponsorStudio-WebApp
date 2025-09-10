import { motion } from "framer-motion";
import { Search, Heart, Link2, BarChart3, Calendar, Users, Handshake, TrendingUp } from "lucide-react";
import { useState } from "react";

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState<'brands' | 'events'>('brands');
  const brandSteps = [
    {
      step: "1",
      title: "Discover Events",
      description: "Explore a curated list of verified events relevant to your brand",
      icon: Search
    },
    {
      step: "2",
      title: "Show Interest",
      description: "Right swipe and shortlist events that fit your marketing goals",
      icon: Heart
    },
    {
      step: "3",
      title: "Get Matched",
      description: "Connect with organizers when both sides show interest",
      icon: Link2
    },
    {
      step: "4",
      title: "Get Insights",
      description: "Close the deal and receive detailed post-event reports for insights",
      icon: BarChart3
    }
  ];

  const eventSteps = [
    {
      step: "1",
      title: "List Your Event",
      description: "Submit your event to Sponsor Studio (we verify & approve)",
      icon: Calendar
    },
    {
      step: "2",
      title: "Connect with Brands",
      description: "Our team reviews and verifies your event to ensure quality and authenticity",
      icon: Users
    },
    {
      step: "3",
      title: "Secure Partnerships",
      description: "Meet brands and finalize sponsorship agreements",
      icon: Handshake
    },
    {
      step: "4",
      title: "Track Performance",
      description: "Monitor engagement, manage sponsor relationships, and analyze event success",
      icon: TrendingUp
    }
  ];

  const currentSteps = activeTab === 'brands' ? brandSteps : eventSteps;

  return (
    <motion.section
      className="relative w-full py-16 px-2 sm:px-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      id="how-we-work"
    >
      {/* Animated background orbs and pattern */}
      <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-blue-200/40 via-indigo-100/40 to-purple-100/40 opacity-80"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-200/40 to-indigo-300/30 rounded-full blur-3xl animate-pulse opacity-50" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-gradient-to-br from-purple-200/40 to-pink-300/30 rounded-full blur-3xl animate-pulse opacity-50" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.8) 1px, transparent 0)`, backgroundSize: '50px 50px' }}></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          <div className="inline-flex items-center px-4 py-1.5 mb-8 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
            <span className="text-sm font-medium">Our Process</span>
          </div>

          {/* Toggle Buttons */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-1 border border-blue-200/50 shadow-lg">
              <button
                onClick={() => setActiveTab('brands')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'brands'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                For Brands
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'events'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                For Events
              </button>
            </div>
          </div>
          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-fadein pb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
            key={activeTab} // Re-animate when tab changes
          >
            How We Works
          </motion.h2>
          <motion.p
            className="mt-6 max-w-2xl mx-auto text-xl sm:text-2xl text-gray-600 leading-relaxed font-light animate-fadein2"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
            key={`${activeTab}-desc`} // Re-animate when tab changes
          >
            {activeTab === 'brands' 
              ? "Our streamlined process makes finding and securing sponsorship deals simple, transparent, and effective."
              : "Join our platform and connect with brands looking for authentic sponsorship opportunities at your events."
            }
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" key={activeTab}>
          {currentSteps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={`${activeTab}-${index}`}
                className="relative group h-full"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: 0.5 + index * 0.1,
                  type: "spring",
                  stiffness: 200,
                  ease: "easeOut"
                }}
                whileHover={{ y: -5 }}
              >
                {/* Connection line for desktop */}
                {index < currentSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-8 h-0.5 bg-gradient-to-r from-blue-300 to-blue-400 z-0 transform translate-x-4"></div>
                )}

                <motion.div
                  className="bg-white/90 rounded-3xl shadow-xl border border-blue-100/40 backdrop-blur-md p-8 text-center relative z-10 transition-all duration-300 group-hover:shadow-2xl animate-cardin h-full flex flex-col"
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {/* Step number badge */}
                  <motion.div
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.3,
                      delay: 0.6 + index * 0.1,
                      type: "spring",
                      stiffness: 250
                    }}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">{step.step}</span>
                    </div>
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl w-fit mx-auto mb-6 group-hover:from-blue-100 group-hover:to-blue-200 transition-colors duration-300"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <IconComponent className="h-10 w-10 text-blue-600" />
                  </motion.div>

                  {/* Content */}
                  <motion.div
                    className="space-y-4 flex-grow flex flex-col justify-center"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.3,
                      delay: 0.7 + index * 0.1,
                      ease: "easeOut"
                    }}
                  >
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>

                  {/* Decorative bottom border */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
        
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-pulse {
          animation: pulse 4s cubic-bezier(.4,0,.2,1) infinite;
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadein {
          animation: fadein 0.8s cubic-bezier(.4,0,.2,1) both;
        }
        .animate-fadein2 {
          animation: fadein 1s cubic-bezier(.4,0,.2,1) both 0.2s;
        }
        @keyframes cardin {
          from { opacity: 0; transform: scale(0.95) translateY(30px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-cardin {
          animation: cardin 1s cubic-bezier(.4,0,.2,1) both;
        }
      `}</style>
    </motion.section>
  );
};

export default HowItWorks;
