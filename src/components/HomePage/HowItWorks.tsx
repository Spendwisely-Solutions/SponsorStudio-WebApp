import { motion } from "framer-motion";
import { Search, Heart, Link2, BarChart3, Calendar, Users, Handshake, TrendingUp } from "lucide-react";
import { useState } from "react";

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState<'brands' | 'events'>('brands');

  const brandSteps = [
    {
      step: "01",
      title: "Discover Events",
      description: "Explore a curated list of verified events relevant to your brand goals",
      icon: Search,
      color: "#00D4FF",
    },
    {
      step: "02",
      title: "Show Interest",
      description: "Right swipe and shortlist events that fit your marketing strategy",
      icon: Heart,
      color: "#F472B6",
    },
    {
      step: "03",
      title: "Get Matched",
      description: "Connect with organizers when both sides show mutual interest",
      icon: Link2,
      color: "#34D399",
    },
    {
      step: "04",
      title: "Get Insights",
      description: "Close the deal and receive detailed post-event analytics reports",
      icon: BarChart3,
      color: "#A78BFA",
    },
  ];

  const eventSteps = [
    {
      step: "01",
      title: "List Your Event",
      description: "Submit your event details; our team verifies and approves it",
      icon: Calendar,
      color: "#00D4FF",
    },
    {
      step: "02",
      title: "Connect with Brands",
      description: "Discover interested brands and unlock mutual match opportunities",
      icon: Users,
      color: "#F472B6",
    },
    {
      step: "03",
      title: "Secure Partnerships",
      description: "Meet brands virtually and finalize sponsorship agreements",
      icon: Handshake,
      color: "#34D399",
    },
    {
      step: "04",
      title: "Track Performance",
      description: "Manage sponsors, track engagement, and measure event success",
      icon: TrendingUp,
      color: "#A78BFA",
    },
  ];

  const currentSteps = activeTab === 'brands' ? brandSteps : eventSteps;

  return (
    <section
      className="relative w-full py-20 px-4 sm:px-8 overflow-hidden transition-colors duration-500"
      style={{ background: 'var(--gradient-how-it-works)' }}
      id="how-we-work"
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(color-mix(in srgb, var(--color-primary) 80%, transparent) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section label */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-info/10 border border-info/30 text-info"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Our Process
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-text-primary mb-6 leading-tight">
            How{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #00D4FF, #6366F1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              We Work
            </span>
          </h2>

          {/* Tab Toggle */}
          <div className="flex justify-center mb-4">
            <div
              className="relative flex p-1 rounded-2xl bg-surface border border-border"
            >
              {(['brands', 'events'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative z-10 px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    activeTab === tab
                      ? 'text-[#0A1628]'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                  style={{
                    background: activeTab === tab
                      ? 'linear-gradient(135deg, #00D4FF, #3B82F6)'
                      : 'transparent',
                    boxShadow: activeTab === tab ? '0 0 20px color-mix(in srgb, var(--color-primary) 40%, transparent)' : 'none',
                  }}
                >
                  {tab === 'brands' ? 'For Brands' : 'For Organizers'}
                </button>
              ))}
            </div>
          </div>

          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            {activeTab === 'brands'
              ? "We make it easy for brands to find the right events, connect with organizers, and secure valuable partnerships."
              : "We help events get discovered by the right brands and secure sponsorships with ease."}
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" key={activeTab}>
          {currentSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={`${activeTab}-${index}`}
                className="relative group"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Connector line */}
                {index < currentSteps.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-10 left-full w-6 h-px z-0"
                    style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${step.color} 25%, transparent), transparent)` }}
                  />
                )}

                <motion.div
                  className="relative rounded-3xl p-6 h-full transition-all duration-300 bg-surface/30 border border-border backdrop-blur-md"
                  whileHover={{
                    y: -8,
                    background: `color-mix(in srgb, ${step.color} 8%, transparent)`,
                    borderColor: `color-mix(in srgb, ${step.color} 30%, transparent)`,
                  }}
                >
                  {/* Step number */}
                  <div
                    className="text-5xl font-black mb-4 leading-none"
                    style={{
                      background: `linear-gradient(135deg, color-mix(in srgb, ${step.color} 20%, transparent), color-mix(in srgb, ${step.color} 5%, transparent))`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: 'none',
                      color: `color-mix(in srgb, ${step.color} 30%, transparent)`,
                    }}
                  >
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: `color-mix(in srgb, ${step.color} 15%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${step.color} 30%, transparent)`,
                      boxShadow: `0 0 20px color-mix(in srgb, ${step.color} 20%, transparent)`,
                    }}
                  >
                    <Icon className="w-7 h-7" style={{ color: step.color }} />
                  </div>

                  {/* Content */}
                  <h3 className="text-text-primary font-bold text-lg mb-3">{step.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{step.description}</p>

                  {/* Bottom accent line */}
                  <div
                    className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(90deg, transparent, ${step.color}, transparent)` }}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
