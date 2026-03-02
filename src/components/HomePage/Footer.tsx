import { motion } from "framer-motion";
import { Linkedin, Instagram, Globe, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <motion.footer
      className="bg-gray-900 text-white py-12"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          >
            <div className="text-xl font-bold mb-4">
              Sponsor Studio
            </div>
              <p className="text-gray-400">
                Empowering brands and events to connect, collaborate, and grow through seamless partnerships and valuable insights.
              </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          >
            <h4 className="font-semibold mb-4">Company</h4>
            <div className="space-y-2 text-gray-400">
              <a href="#how-we-work" className="block hover:text-white transition-colors" >About Us</a>
              <a href="/stories" className="block hover:text-white transition-colors" >Success Stories</a>
              <a href="/contact-us" className="block hover:text-white transition-colors" >Contact Us</a>
              <a href="/faq" className="block hover:text-white transition-colors" >FAQ</a>
              <a href="mailto:connect@sponsorstudio.in" className="block hover:text-white transition-colors" >Support</a>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          >
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-gray-400">
              <div>connect@sponsorstudio.in</div>

              <div>Heavenly Plaza, Vazhakkala, Ernakulam</div>
              <div>+91 773 603 7993</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
          >
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <motion.a
                href="https://sponsorstudio.in"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.5, ease: "easeOut" }}
              >
                <Globe className="w-5 h-5" />
              </motion.a>
             
              <motion.a
                href="https://www.instagram.com/sponsorstudio.official"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors"
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.6, ease: "easeOut" }}
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://in.linkedin.com/company/sponsor-studio"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.7, ease: "easeOut" }}
              >
                <Linkedin className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://www.facebook.com/sponsorstudio"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.8, ease: "easeOut" }}
              >
                <Facebook className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>
        </div>
        
        <motion.div
          className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.9, ease: "easeOut" }}
        >
          <p>&copy; 2025 Sponsor Studio. All rights reserved.</p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;