import { motion } from "framer-motion";
import { Linkedin, Instagram, Globe, Facebook, Mail, Phone, MapPin, ArrowRight } from "lucide-react";

const Footer = () => {
  return (
    <motion.footer
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #060D1F 0%, #040A14 100%)' }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)' }}
      />

      {/* CTA Banner */}
      <div className="relative py-16 px-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00D4FF' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Your next big partnership is just a match away.
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Connecting brands with{' '}
            <span style={{
              background: 'linear-gradient(90deg, #00D4FF, #6366F1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              opportunities that matter.
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
            Discover. Collaborate. Close Deals. Measure What Matters.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/dashboard"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-[#0A1628] text-base transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00D4FF, #3B82F6)',
                boxShadow: '0 0 30px rgba(0,212,255,0.4)',
              }}
            >
              I'm a Brand — Explore Opportunities
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white text-base border transition-all duration-300 hover:scale-105 hover:bg-white/10"
              style={{
                borderColor: 'rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.05)',
              }}
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
                <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
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
            <div className="text-xl font-bold text-white mb-4">
              Sponsor Studio
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
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
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${hover}`}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <Icon className="w-4 h-4 text-gray-400" />
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
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-widest">Company</h4>
            <div className="space-y-3 text-sm">
              {[
                { label: 'About Us', href: '#how-we-work' },
                { label: 'Success Stories', href: '/stories' },
                { label: 'Contact Us', href: '/Contact-us' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Support', href: 'mailto:connect@sponsorstudio.in' },
              ].map((link, i) => (
                <a key={i} href={link.href} className="block text-gray-500 hover:text-cyan-400 transition-colors duration-200">
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
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-widest">Platform</h4>
            <div className="space-y-3 text-sm">
              {[
                { label: 'For Brands', href: '#what-is-sponsor-studio' },
                { label: 'For Organizers', href: '#how-we-work' },
                { label: 'Trending Events', href: '/trending-events' },
                { label: 'Blogs', href: '/blogs' },
                { label: 'Pricing', href: '/pricing' },
              ].map((link, i) => (
                <a key={i} href={link.href} className="block text-gray-500 hover:text-cyan-400 transition-colors duration-200">
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
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-widest">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 text-gray-500">
                <Mail className="w-4 h-4 mt-0.5 text-cyan-400 flex-shrink-0" />
                <span>connect@sponsorstudio.in</span>
              </div>
              <div className="flex items-start gap-3 text-gray-500">
                <Phone className="w-4 h-4 mt-0.5 text-cyan-400 flex-shrink-0" />
                <span>+91 773 603 7993</span>
              </div>
              <div className="flex items-start gap-3 text-gray-500">
                <MapPin className="w-4 h-4 mt-0.5 text-cyan-400 flex-shrink-0" />
                <span>Heavenly Plaza, Vazhakkala, Ernakulam</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-gray-600 text-sm">© 2025 Sponsor Studio. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
