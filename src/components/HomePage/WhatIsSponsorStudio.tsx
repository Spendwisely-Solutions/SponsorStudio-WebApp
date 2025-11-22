import { motion } from "framer-motion";
import { Zap, Users, BarChart3, DollarSign, FileText } from "lucide-react";

const WhatIsSponsorStudio = () => {
  return (
    <motion.section
      className="relative w-full pb-16 px-2 sm:px-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      id="what-is-sponsor-studio"
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
            <span className="text-sm font-medium">About Us</span>
          </div>
          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 pb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          >
            What is <span className="whitespace-nowrap">Sponsor Studio</span>?
          </motion.h2>
          <motion.p
            className="mt-6 max-w-2xl mx-auto text-xl sm:text-2xl text-gray-600 leading-relaxed font-light"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
          >
            A comprehensive sponsorship platform connecting brands with verified events and their target audience.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Left side - Platform Overview */}
          <div className="space-y-6">
            <motion.div
              className="hidden lg:block bg-white/90 rounded-3xl shadow-xl border border-blue-100/40 backdrop-blur-md px-6 py-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: 0.3,
                ease: "easeOut",
                type: "spring",
                stiffness: 150
              }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="flex items-start sm:items-center mb-4">
                <motion.div
                  className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <Users className="w-6 h-6 text-blue-600" />
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold text-blue-800 leading-tight">
                  Marketing Marketplace
                </h3>
              </div>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
                An aggregator platform that connects brands with trusted events and audiences, offering insights that make collaboration decisions clear and effective.
              </p>
            </motion.div>

            <motion.div
              className="bg-white/90 rounded-3xl shadow-xl border border-blue-100/40 backdrop-blur-md px-6 py-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: 0.4,
                ease: "easeOut",
                type: "spring",
                stiffness: 150
              }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="flex items-start sm:items-center mb-4">
                <motion.div
                  className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold text-blue-800 leading-tight">
                  Brand Benefits
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Quality Events',
                  'Verified Organizers',
                  'Smart Matching',
                  'Risk Analysis Reports'
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-3 p-3 rounded-xl bg-blue-50 border border-blue-100"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: 0.5 + index * 0.06,
                      type: "spring",
                      stiffness: 200,
                      ease: "easeOut"
                    }}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "#dbeafe",
                      transition: { duration: 0.2 }
                    }}
                  >
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700 font-medium text-sm lg:text-base">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right side - Value Proposition */}
          <div className="space-y-6">
            <motion.div
              className="bg-white/90 rounded-3xl shadow-xl border border-blue-100/40 backdrop-blur-md px-6 py-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: 0.6,
                ease: "easeOut",
                type: "spring",
                stiffness: 150
              }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="flex items-start sm:items-center mb-4">
                <motion.div
                  className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold text-blue-800 leading-tight">
                  Streamlined Process
                </h3>
              </div>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
                Our platform simplifies every step of the sponsorship journey, from discovery to post-event analysis.
              </p>
            </motion.div>

            {/* Key advantages for brands */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: '✓', bgColor: 'bg-green-100', textColor: 'text-green-600', text: 'Verified Events' },
                { icon: Zap, bgColor: 'bg-blue-100', textColor: 'text-blue-600', text: 'Fast Matching' },
                { icon: BarChart3, bgColor: 'bg-purple-100', textColor: 'text-purple-600', text: 'Risk Analysis' },
                { icon: Users, bgColor: 'bg-orange-100', textColor: 'text-orange-600', text: 'Target Audience' },
                { icon: FileText, bgColor: 'bg-emerald-100', textColor: 'text-emerald-600', text: 'Post Event Reports' },
                { icon: '⚡', bgColor: 'bg-yellow-100', textColor: 'text-yellow-600', text: 'Quick Setup' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-white/90 rounded-2xl p-4 shadow-lg border border-blue-100/40 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: 0.6 + index * 0.08,
                    type: "spring",
                    stiffness: 200,
                    ease: "easeOut"
                  }}
                  whileHover={{ y: -5, scale: 1.05 }}
                >
                  <motion.div
                    className={`w-10 h-10 ${item.bgColor} rounded-xl mx-auto mb-3 flex items-center justify-center`}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {typeof item.icon === 'string' ? (
                      <span className={`${item.textColor} font-bold text-lg`}>{item.icon}</span>
                    ) : (
                      <item.icon className={`w-5 h-5 ${item.textColor}`} />
                    )}
                  </motion.div>
                  <p className="text-gray-700 font-medium text-sm">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
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
      `}</style>
    </motion.section>
  );
};

export default WhatIsSponsorStudio;