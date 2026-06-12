import { motion } from "framer-motion";
import { Linkedin, Instagram, Globe, Facebook, Mail, Phone, MapPin, ArrowRight } from "lucide-react";

const Footer = () => {
  return (
    <motion.footer
      className="relative overflow-hidden border-t border-border transition-colors duration-500"
      style={{ background: 'var(--gradient-footer)' }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-primary) 50%, transparent), transparent)' }}
      />

      {/* CTA Banner */}
      <div className="relative py-16 px-4 border-b border-border"
      >
        <div className="max-w-5xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-info/10 border border-info/30 text-info"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Your next big partnership is just a match away.
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-text-primary mb-6 leading-tight">
            Connecting brands with{' '}
            <span style={{
              background: 'linear-gradient(90deg, #00D4FF, #6366F1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              opportunities that matter.
            </span>
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-10">
            Discover. Collaborate. Close Deals. Measure What Matters.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/dashboard"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-[#0A1628] text-base transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00D4FF, #3B82F6)',
                boxShadow: '0 0 30px color-mix(in srgb, var(--color-primary) 40%, transparent)',
              }}
            >
              I'm a Brand — Explore Opportunities
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-text-primary text-base border border-border bg-surface/20 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-surface-hover/30"
            >
              List Your Event
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          {/* Mini Stats */}
          <div className="flex flex-wrap justify-center gap-10 mt-12">
            {[
              { value: '5000+', label: 'Events' },
              { value: '10000+', label: 'Brands' },
              { value: '₹250Cr+', label: 'Deals Facilitated' },
              { value: '50L+', label: 'Attendees Reached' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-black text-text-primary mb-1">{stat.value}</div>
                <div className="text-xs text-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="text-xl font-bold text-text-primary mb-4">
              Sponsor Studio
            </div>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              Empowering brands and events to connect, collaborate, and grow through seamless partnerships.
            </p>
            <div className="flex space-x-3">
              {[
                { href: 'https://sponsorstudio.in', icon: Globe, hover: 'hover:bg-cyan-500/20 hover:border-cyan-500/40' },
                { href: 'https://www.instagram.com/sponsorstudio.official', icon: Instagram, hover: 'hover:bg-pink-500/20 hover:border-pink-500/40' },
                { href: 'https://in.linkedin.com/company/sponsor-studio', icon: Linkedin, hover: 'hover:bg-blue-500/20 hover:border-blue-500/40' },
                { href: 'https://www.facebook.com/people/Sponsor-Studio/61559157077711/', icon: Facebook, hover: 'hover:bg-blue-700/20 hover:border-blue-700/40' },
              ].map(({ href, icon: Icon, hover }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 bg-surface border border-border ${hover}`}
                >
                  <Icon className="w-4 h-4 text-text-secondary" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Company */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h4 className="text-text-primary font-semibold mb-5 text-sm uppercase tracking-widest">Company</h4>
            <div className="space-y-3 text-sm">
              {[
                { label: 'About Us', href: '#how-we-work' },
                { label: 'Success Stories', href: '/stories' },
                { label: 'Contact Us', href: '/Contact-us' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Support', href: 'mailto:connect@sponsorstudio.in' },
              ].map((link, i) => (
                <a key={i} href={link.href} className="block text-text-secondary hover:text-primary transition-colors duration-200">
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Platform */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h4 className="text-text-primary font-semibold mb-5 text-sm uppercase tracking-widest">Platform</h4>
            <div className="space-y-3 text-sm">
              {[
                { label: 'For Brands', href: '#what-is-sponsor-studio' },
                { label: 'For Organizers', href: '#how-we-work' },
                { label: 'Trending Events', href: '/trending-events' },
                { label: 'Blogs', href: '/blogs' },
                { label: 'Pricing', href: '/pricing' },
              ].map((link, i) => (
                <a key={i} href={link.href} className="block text-text-secondary hover:text-primary transition-colors duration-200">
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <h4 className="text-text-primary font-semibold mb-5 text-sm uppercase tracking-widest">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 text-text-secondary">
                <Mail className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span>connect@sponsorstudio.in</span>
              </div>
              <div className="flex items-start gap-3 text-text-secondary">
                <Phone className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span>+91 773 603 7993</span>
              </div>
              <div className="flex items-start gap-3 text-text-secondary">
                <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Heavenly Plaza, Vazhakkala, Ernakulam</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border"
        >
          <p className="text-text-muted text-sm">© 2025 Sponsor Studio. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-text-muted">
            <a href="#" className="hover:text-text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
