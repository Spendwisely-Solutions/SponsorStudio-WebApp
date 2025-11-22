import { motion } from "framer-motion";
import { Zap, Users, BarChart3, DollarSign, FileText } from "lucide-react";

const WhatIsSponsorStudio = () => {
  return (
    <motion.section
      className="py-12 lg:py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      id="what-is-sponsor-studio"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-40">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        <motion.div
          className="absolute bottom-20 right-10 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 bg-blue-600 rounded-xl lg:rounded-2xl mb-4 lg:mb-6"
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.4,
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              ease: "easeOut"
            }}
            whileHover={{ scale: 1.1, rotate: 10 }}
          >
            <Zap className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
          </motion.div>
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 lg:mb-6 leading-tight px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          >
            What is <span className="text-blue-600 whitespace-nowrap">Sponsor Studio</span>?
          </motion.h2>
          <motion.p
            className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
          >
            A comprehensive sponsorship platform connecting brands with verified events and their target audience.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Left side - Platform Overview */}
          <div className="space-y-6 lg:space-y-8">
            <motion.div
              className="hidden lg:block bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 backdrop-blur-sm"
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
              <div className="flex items-start sm:items-center mb-4 lg:mb-6">
                <motion.div
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                  Marketing Marketplace
                </h3>
              </div>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
                An aggregator platform that connects brands with trusted events and audiences, offering insights that make collaboration decisions clear and effective.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 backdrop-blur-sm"
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
              <div className="flex items-start sm:items-center mb-4 lg:mb-6">
                <motion.div
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                  Brand Benefits
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
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
          <div className="space-y-6 lg:space-y-8">
            <motion.div
              className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 backdrop-blur-sm"
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
              <div className="flex items-start sm:items-center mb-4 lg:mb-6">
                <motion.div
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
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
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center"
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
    </motion.section>
  );
};

export default WhatIsSponsorStudio;