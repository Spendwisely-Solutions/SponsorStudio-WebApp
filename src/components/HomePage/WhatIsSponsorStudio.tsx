import { motion } from "framer-motion";
import { Search, Heart, Handshake, Video, FileText, BarChart3, ChevronRight } from "lucide-react";

const journeySteps = [
  {
    step: 1,
    icon: Search,
    label: "Discover",
    description: "Find opportunities that match your goals",
    color: "#00D4FF",
    glow: "rgba(0,212,255,0.3)",
  },
  {
    step: 2,
    icon: Heart,
    label: "Like",
    description: "Digitize your interest & swipe to shortlist",
    color: "#F472B6",
    glow: "rgba(244,114,182,0.3)",
  },
  {
    step: 3,
    icon: Handshake,
    label: "Match",
    description: "Organizer accepts your interest & collaboration begins",
    color: "#34D399",
    glow: "rgba(52,211,153,0.3)",
  },
  {
    step: 4,
    icon: Video,
    label: "Meet",
    description: "Schedule meetings & discuss collaboration",
    color: "#A78BFA",
    glow: "rgba(167,139,250,0.3)",
  },
  {
    step: 5,
    icon: FileText,
    label: "Sign MOU",
    description: "We'll generate MOUs for platform-aided partnerships",
    color: "#FBBF24",
    glow: "rgba(251,191,36,0.3)",
  },
  {
    step: 6,
    icon: BarChart3,
    label: "Measure",
    description: "AI reports help you measure your real impact",
    color: "#00D4FF",
    glow: "rgba(0,212,255,0.3)",
  },
];

const whySponsorStudio = [
  { icon: "🔒", title: "Verified & Secure", desc: "All brands and organizers are verified" },
  { icon: "🔍", title: "Transparent", desc: "Pricing and offering details are clear" },
  { icon: "🤖", title: "AI Powered", desc: "Smart matching powered by AI analysis" },
  { icon: "🔗", title: "End to End", desc: "Everything from discovery to closure in one place" },
];

const WhatIsSponsorStudio = () => {
  return (
    <section
      className="relative w-full py-20 px-4 sm:px-8 overflow-hidden transition-colors duration-500"
      style={{ background: 'var(--gradient-what-is)' }}
      id="what-is-sponsor-studio"
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(color-mix(in srgb, var(--color-primary) 80%, transparent) 1px, transparent 1px),
            linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 80%, transparent) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      {/* Glow blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-[0.08]"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 15%, transparent) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-[0.08]"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--color-secondary) 15%, transparent) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-info/10 border border-info/30 text-info"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            The Sponsorship Journey
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-text-primary mb-6 leading-tight">
            From discovery to impact{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #00D4FF, #6366F1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              in 6 simple steps.
            </span>
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Our streamlined process takes you from discovering the perfect sponsorship opportunity to measuring real business impact.
          </p>
        </motion.div>

        {/* Journey steps */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-20">
          {journeySteps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                className="relative group flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {/* Connector line (not on last item) */}
                {i < journeySteps.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-8 left-[60%] right-[-40%] h-px"
                    style={{ background: `linear-gradient(90deg, ${s.color}40, transparent)` }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: `rgba(${s.color === '#00D4FF' ? '0,212,255' : s.color === '#F472B6' ? '244,114,182' : s.color === '#34D399' ? '52,211,153' : s.color === '#A78BFA' ? '167,139,250' : '251,191,36'},0.1)`,
                    border: `1px solid ${s.color}30`,
                    boxShadow: `0 0 20px ${s.glow}`,
                  }}
                  whileHover={{ boxShadow: `0 0 40px ${s.glow}` }}
                >
                  <Icon className="w-7 h-7" style={{ color: s.color }} />
                  {/* Step number badge */}
                  <div
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${s.color}, ${s.color}80)`,
                      color: '#0A1628',
                    }}
                  >
                    {s.step}
                  </div>
                </motion.div>

                <h3 className="text-text-primary font-bold text-sm mb-1">{s.label}</h3>
                <p className="text-text-muted text-xs leading-relaxed">{s.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Why Sponsor Studio */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl sm:text-3xl font-black text-text-primary text-center mb-10">
            Why{' '}
            <span style={{ background: 'linear-gradient(90deg, #00D4FF, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Sponsor Studio?
            </span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {whySponsorStudio.map((item, i) => (
              <motion.div
                key={i}
                className="group rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 cursor-pointer bg-surface/30 border border-border backdrop-blur-md hover:bg-surface-hover/50 hover:border-primary/30"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="text-text-primary font-bold text-sm mb-2">{item.title}</h4>
                <p className="text-text-secondary text-xs leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonial / CTA strip */}
        <motion.div
          className="relative rounded-3xl p-8 md:p-10 overflow-hidden bg-surface border border-border transition-colors duration-500"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 15%, transparent) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-text-primary text-lg italic mb-4 max-w-xl">
                "Sponsor Studio helped us find the perfect partner for our event. The process was seamless and ROI was exceptional."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">D</div>
                <div>
                  <div className="text-text-primary font-semibold text-sm">Drake Jost</div>
                  <div className="text-text-muted text-xs">marketing head</div>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <button
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-[#0A1628] text-base transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #00D4FF, #3B82F6)',
                  boxShadow: '0 0 30px color-mix(in srgb, var(--color-primary) 40%, transparent)',
                }}
              >
                Go to Meetings
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhatIsSponsorStudio;