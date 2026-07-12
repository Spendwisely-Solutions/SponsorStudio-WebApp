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



      {/* Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
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
                { label: 'About Us', href: '/about-us' },
                { label: 'Contact Us', href: '/Contact-us' },
                { label: 'Blogs', href: '/blogs' },
                { label: 'FAQ', href: '/faq' },
              ].map((link, i) => (
                <a key={i} href={link.href} className="block text-text-secondary hover:text-primary transition-colors duration-200">
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>

          {/* What We Do */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h4 className="text-text-primary font-semibold mb-5 text-sm uppercase tracking-widest">What We Do</h4>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Platform Overview', href: '/platform-overview' },
                { label: 'Agency Services', href: '/agency-services' },
              ].map((link, i) => (
                <a key={i} href={link.href} className="block text-text-secondary hover:text-primary transition-colors duration-200">
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-8 flex items-center justify-center border-t border-border"
        >
          <p className="text-text-muted text-sm">© 2026 Sponsor Studio. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
