import { motion } from "framer-motion";
import { 
  Search, 
  Heart, 
  Handshake, 
  MessageSquare, 
  FileText, 
  BarChart3, 
  XCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  Zap, 
  Cpu, 
  Layers,
  ChevronRight
} from "lucide-react";

const WhatIsSponsorStudio = () => {
  // 6 Journey Steps
  const journeySteps = [
    {
      step: 1,
      icon: Search,
      label: "Discover",
      description: "Find verified sponsorship opportunities powered by data.",
      color: "#00D4FF",
      glow: "rgba(0,212,255,0.3)",
    },
    {
      step: 2,
      icon: Heart,
      label: "Shortlist",
      description: "Save the opportunities that matter most.",
      color: "#F472B6",
      glow: "rgba(244,114,182,0.3)",
    },
    {
      step: 3,
      icon: Handshake,
      label: "Connect",
      description: "Match with brands and organizers that fit your goals.",
      color: "#34D399",
      glow: "rgba(52,211,153,0.3)",
    },
    {
      step: 4,
      icon: MessageSquare,
      label: "Collaborate",
      description: "Meet, negotiate, and plan with ease.",
      color: "#A78BFA",
      glow: "rgba(167,139,250,0.3)",
    },
    {
      step: 5,
      icon: FileText,
      label: "Close Deals",
      description: "Digitally finalize sponsorship agreements.",
      color: "#FBBF24",
      glow: "rgba(251,191,36,0.3)",
    },
    {
      step: 6,
      icon: BarChart3,
      label: "Measure Impact",
      description: "Track outcomes with actionable insights.",
      color: "#00D4FF",
      glow: "rgba(0,212,255,0.3)",
    },
  ];

  // 5 Differentiators
  const whySponsorStudio = [
    {
      icon: ShieldCheck,
      title: "Verified Network",
      desc: "Every organizer and brand undergoes verification, creating a trusted ecosystem for genuine partnerships.",
      color: "#00D4FF",
    },
    {
      icon: Eye,
      title: "Complete Transparency",
      desc: "Access clear sponsorship details, pricing, deliverables, and expectations before you commit.",
      color: "#F472B6",
    },
    {
      icon: Zap,
      title: "Intelligent Matching",
      desc: "Our recommendation engine helps connect brands and events based on budgets, audience fit, industry, and potential impact.",
      color: "#34D399",
    },
    {
      icon: Layers,
      title: "End-to-End Platform",
      desc: "Manage discovery, communication, agreements, and performance tracking from a single dashboard.",
      color: "#A78BFA",
    },
    {
      icon: Cpu,
      title: "AI Powered Risk Analysis",
      desc: "Our Custom trained AI helps brand owners to make the right decisions by properly evaluating the risk involved.",
      color: "#FBBF24",
    },
  ];

  return (
    <div className="w-full">
      {/* SECTION 1: THE PROBLEM & HOW WE SOLVE IT */}
      <section
        className="relative w-full py-20 px-4 sm:px-8 overflow-hidden transition-colors duration-500 bg-background"
        id="problem-solution"
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(color-mix(in srgb, var(--color-primary) 80%, transparent) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full text-sm font-medium bg-red-500/10 border border-red-500/30 text-red-500">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              The Sponsorship Problem
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-text-primary mb-6 leading-tight max-w-4xl mx-auto">
              Traditional sponsorships are{' '}
              <span style={{ background: 'linear-gradient(90deg, #EF4444, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                slow and fragmented
              </span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Finding the right sponsor or event shouldn't take hundreds of emails, opaque pricing, and paper-based negotiations.
            </p>
          </motion.div>

          {/* Side-by-Side Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The Old Way Card */}
            <motion.div
              className="bg-surface/10 border border-red-500/20 rounded-3xl p-8 relative overflow-hidden backdrop-blur-md"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
              <h3 className="text-xl sm:text-2xl font-bold text-red-500 mb-6 flex items-center gap-2">
                <XCircle className="w-6 h-6 flex-shrink-0" />
                The Archaic Offline Way
              </h3>
              <ul className="space-y-5">
                {[
                  "Endless cold emails and follow-ups with generic pitches.",
                  "Opaque, non-standardized pricing with hidden deliverables.",
                  "Weeks spent negotiating contracts and drafting manual agreements.",
                  "Zero verified ROI data or post-event analytics."
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-text-secondary text-sm sm:text-base leading-relaxed">
                    <span className="text-red-500/80 font-bold mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* The Sponsor Studio Way Card */}
            <motion.div
              className="bg-surface/20 border border-primary/30 rounded-3xl p-8 relative overflow-hidden backdrop-blur-md shadow-[0_0_40px_rgba(0,212,255,0.05)]"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              <h3 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#00D4FF' }}>
                <CheckCircle2 className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                The Sponsor Studio Solution
              </h3>
              <ul className="space-y-5">
                {[
                  "Intelligent matching connects target audiences instantly.",
                  "100% pricing transparency, packages, and deliverables.",
                  "Digital workspace to chat, meet, and instantly sign MOUs.",
                  "AI-driven risk analysis reports and performance metrics."
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-text-primary text-sm sm:text-base leading-relaxed">
                    <span className="text-cyan-400 font-bold mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE SPONSORSHIP JOURNEY */}
      <section
        className="relative w-full py-20 px-4 sm:px-8 overflow-hidden transition-colors duration-500 bg-background-secondary"
        style={{ background: 'var(--gradient-what-is)' }}
        id="what-is-sponsor-studio"
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(color-mix(in srgb, var(--color-primary) 80%, transparent) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Section header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-info/10 border border-info/30 text-info">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              The Sponsor Studio Journey
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-text-primary mb-6 leading-tight">
              From Discovery to Partnership{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #00D4FF, #6366F1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                in 6 Simple Steps.
              </span>
            </h2>
            <p className="text-text-secondary text-lg max-w-3xl mx-auto">
              Everything you need to discover opportunities, connect with the right partners, manage agreements, and measure results from one intelligent platform.
            </p>
          </motion.div>

          {/* Journey steps */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
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
                  <p className="text-text-muted text-xs leading-relaxed px-2">{s.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: WHY LEADING BRANDS & ORGANIZERS CHOOSE SPONSOR STUDIO */}
      <section
        className="relative w-full py-20 px-4 sm:px-8 overflow-hidden transition-colors duration-500 bg-background"
        id="why-choose"
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(color-mix(in srgb, var(--color-primary) 80%, transparent) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-text-primary mb-6 leading-tight">
              Why Leading Brands &amp; Organizers{' '}
              <span style={{ background: 'linear-gradient(90deg, #00D4FF, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Choose Sponsor Studio
              </span>
            </h3>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              We leverage data, artificial intelligence, and centralized deal workspaces to make sponsorships transparent and profitable.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {whySponsorStudio.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  className="group rounded-3xl p-6 transition-all duration-300 hover:scale-105 cursor-pointer bg-surface/30 border border-border backdrop-blur-md hover:bg-surface-hover/50 hover:border-primary/30 flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: `color-mix(in srgb, ${item.color} 15%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${item.color} 30%, transparent)`,
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  <h4 className="text-text-primary font-bold text-lg mb-3">{item.title}</h4>
                  <p className="text-text-secondary text-sm leading-relaxed flex-grow">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Testimonial / CTA strip (user requested to skip changing testimonials, keeping layout) */}
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
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-[#0A1628] text-base transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #00D4FF, #3B82F6)',
                    boxShadow: '0 0 30px color-mix(in srgb, var(--color-primary) 40%, transparent)',
                  }}
                >
                  Go to Meetings
                  <ChevronRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default WhatIsSponsorStudio;