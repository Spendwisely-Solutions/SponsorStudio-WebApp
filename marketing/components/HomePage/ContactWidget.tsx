import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, CheckCircle2, User, Mail, Phone, Users, ShieldAlert } from 'lucide-react';
import { sendContactEmail } from '../../lib/email';
import { FormData } from './Home';

const ContactWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    organization_type: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.organization_type) newErrors.organization_type = "Please select your role";
    if (!formData.message.trim()) newErrors.message = "Message is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await sendContactEmail(formData);
      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '', organization_type: '' });
      setErrors({});
      // Auto close success card after 4 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setIsOpen(false);
      }, 4000);
    } catch (err) {
      console.error("Error sending contact email:", err);
      alert("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#3B82F6] flex items-center justify-center text-[#0A1628] shadow-2xl focus:outline-none hover:scale-105 active:scale-95 transition-transform duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          layoutId="contact-widget-button"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-text-inverse" />
          ) : (
            <MessageSquare className="w-6 h-6 text-text-inverse" />
          )}

          {/* Quick Tooltip label for engagement */}
          {!isOpen && (
            <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-surface text-text-primary border border-border px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shadow-lg select-none hidden md:block transition-colors duration-500">
              Questions? Reach out
            </span>
          )}
        </motion.button>
      </div>

      {/* Floating Contact Form Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-32px)] bg-surface border border-border rounded-3xl shadow-2xl z-50 p-6 flex flex-col transition-colors duration-500"
          >
            {isSuccess ? (
              <div className="text-center py-8 flex flex-col items-center">
                <CheckCircle2 className="w-16 h-16 text-success mb-4 animate-bounce" />
                <h3 className="text-xl font-bold text-text-primary mb-2">Message Sent!</h3>
                <p className="text-text-secondary text-sm leading-relaxed px-4">
                  Thank you for reaching out. We have received your inquiry and will contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">Contact Sponsor Studio</h3>
                    <p className="text-xs text-text-muted">Have a question? We reply in a few hours.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg hover:bg-surface-hover transition-colors"
                  >
                    <X className="w-4 h-4 text-text-muted" />
                  </button>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-text-secondary">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-surface-hover/30 border ${errors.name ? 'border-danger' : 'border-border'} focus:outline-none focus:border-primary text-text-primary transition-colors`}
                    />
                  </div>
                  {errors.name && <p className="text-[10px] text-danger">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-text-secondary">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-surface-hover/30 border ${errors.email ? 'border-danger' : 'border-border'} focus:outline-none focus:border-primary text-text-primary transition-colors`}
                    />
                  </div>
                  {errors.email && <p className="text-[10px] text-danger">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-text-secondary">Phone (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-surface-hover/30 border border-border focus:outline-none focus:border-primary text-text-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-text-secondary">Are you a Brand or Organizer?</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <select
                      name="organization_type"
                      value={formData.organization_type}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-surface border ${errors.organization_type ? 'border-danger' : 'border-border'} focus:outline-none focus:border-primary text-text-primary transition-colors`}
                    >
                      <option value="">Select your role</option>
                      <option value="brand">Brand / Sponsor</option>
                      <option value="organizer">Event Organizer</option>
                    </select>
                  </div>
                  {errors.organization_type && <p className="text-[10px] text-danger">{errors.organization_type}</p>}
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-text-secondary">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe your inquiry..."
                    className={`w-full p-3 rounded-xl text-sm bg-surface-hover/30 border ${errors.message ? 'border-danger' : 'border-border'} focus:outline-none focus:border-primary text-text-primary transition-colors resize-none`}
                  />
                  {errors.message && <p className="text-[10px] text-danger">{errors.message}</p>}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#3B82F6] text-[#0A1628] font-bold text-sm hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all duration-200"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ContactWidget;
