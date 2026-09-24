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
      color: "#2A3A92",
    },
    {
      step: 2,
      icon: Heart,
      label: "Shortlist",
      description: "Save the opportunities that matter most.",
      color: "#2A3A92",
    },
    {
      step: 3,
      icon: Handshake,
      label: "Connect",
      description: "Match with brands and organizers that fit your goals.",
      color: "#2A3A92",
    },
    {
      step: 4,
      icon: MessageSquare,
      label: "Collaborate",
      description: "Meet, negotiate, and plan with ease.",
      color: "#2A3A92",
    },
    {
      step: 5,
      icon: FileText,
      label: "Close Deals",
      description: "Digitally finalize sponsorship agreements.",
      color: "#2A3A92",
    },
    {
      step: 6,
      icon: BarChart3,
      label: "Measure Impact",
      description: "Track outcomes with actionable insights.",
      color: "#2A3A92",
    },
  ];

  // 5 Differentiators
  const whySponsorStudio = [
    {
      icon: ShieldCheck,
      title: "Verified Network",
      desc: "Every organizer and brand undergoes verification, creating a trusted ecosystem for genuine partnerships.",
      color: "#2A3A92",
    },
    {
      icon: Eye,
      title: "Complete Transparency",
      desc: "Access clear sponsorship details, pricing, deliverables, and expectations before you commit.",
      color: "#2A3A92",
    },
    {
      icon: Zap,
      title: "Intelligent Matching",
      desc: "Our recommendation engine helps connect brands and events based on budgets, audience fit, industry, and potential impact.",
      color: "#2A3A92",
    },
    {
      icon: Layers,
      title: "End-to-End Platform",
      desc: "Manage discovery, communication, agreements, and performance tracking from a single dashboard.",
      color: "#2A3A92",
    },
    {
      icon: Cpu,
      title: "AI Powered Risk Analysis",
      desc: "Our Custom trained AI helps brand owners to make the right decisions by properly evaluating the risk involved.",
      color: "#2A3A92",
    },
  ];

  return (
    <div className="w-full">
      {/* SECTION 1: THE PROBLEM & HOW WE SOLVE IT */}
      <section
        className="relative w-full py-20 px-4 sm:px-8 overflow-hidden transition-colors duration-500 bg-background"
        id="problem-solution"
      >
        
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="eyebrow mb-4 inline-block">The Sponsorship Problem
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl text-text-primary mb-6 leading-tight max-w-4xl mx-auto">
              Traditional sponsorships are{' '}
              <span className="italic">
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
              className="bg-background-secondary border border-border rounded-card p-8 relative overflow-hidden"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl sm:text-2xl font-semibold text-text-secondary mb-6 flex items-center gap-2">
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
                    <span className="text-text-muted mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* The Sponsor Studio Way Card */}
            <motion.div
              className="bg-surface border border-border rounded-card p-8 relative overflow-hidden"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl sm:text-2xl font-semibold mb-6 flex items-center gap-2 text-text-primary" >
                <CheckCircle2 className="w-6 h-6 text-brand-600 flex-shrink-0" />
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
                    <span className="text-brand-400 font-bold mt-1">•</span>
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
        
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Section header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="eyebrow mb-4 inline-block">The Sponsor Studio Journey
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl text-text-primary mb-6 leading-tight">
              From Discovery to Partnership{' '}
              <span className="italic"
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
                      style={{ background: 'var(--color-border)' }}
                    />
                  )}

                  {/* Icon */}
                  <motion.div
                    className="relative w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-surface border border-border text-brand-600"
                  >
                    <Icon className="w-6 h-6" />
                    {/* Step number badge */}
                    <div
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] bg-primary text-white"
                    >
                      {s.step}
                    </div>
                  </motion.div>

                  <h3 className="text-text-primary font-semibold text-sm mb-1">{s.label}</h3>
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

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl text-text-primary mb-6 leading-tight">
              Why Leading Brands &amp; Organizers{' '}
              <span className="italic">
                Choose Sponsor Studio
              </span>
            </h2>
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
                  className="rounded-card p-6 bg-surface border border-border flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <div 
                    className="w-11 h-11 rounded-lg flex items-center justify-center mb-5 bg-brand-50 text-brand-600"
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-text-primary font-semibold text-lg mb-2">{item.title}</h4>
                  <p className="text-text-secondary text-sm leading-relaxed flex-grow">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Testimonial / CTA strip (user requested to skip changing testimonials, keeping layout) */}
          <motion.div
            className="relative rounded-card p-8 md:p-10 overflow-hidden bg-surface border border-border transition-colors duration-500"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-text-primary text-lg italic mb-4 max-w-xl">
                  "Sponsor Studio helped us find the perfect partner for our event. The process was seamless and ROI was exceptional."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm bg-primary">D</div>
                  <div>
                    <div className="text-text-primary font-semibold text-sm">Drake Jost</div>
                    <div className="text-text-muted text-xs">marketing head</div>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <a
                  href="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white text-base transition-all duration-300 bg-primary text-white hover:bg-primary-hover"
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