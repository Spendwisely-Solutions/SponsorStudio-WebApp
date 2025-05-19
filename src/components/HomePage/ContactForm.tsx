import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sendContactEmail } from '../../lib/email';
import { FormData } from '../../App';

gsap.registerPlugin(ScrollTrigger);

interface ContactFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  showThankYou: boolean;
  setShowThankYou: (value: boolean) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ formData, setFormData, showThankYou, setShowThankYou }) => {
  const formRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: formRef.current, start: 'top 80%', fastScrollEnd: true },
      }
    );

    const inputs = formRef.current?.querySelectorAll('input, textarea, select');
    if (inputs) {
      gsap.fromTo(
        inputs,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: { trigger: formRef.current, start: 'top 80%', fastScrollEnd: true },
        }
      );
    }

    // Removed the button scale animations
    return () => {
      // No need to clean up event listeners since they are no longer added
    };
  }, []);

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await sendContactEmail(formData);
      setShowThankYou(true);
      setFormData({ name: '', email: '', phone: '', message: '', organization_type: '' });
      setTimeout(() => setShowThankYou(false), 5000);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  return (
    <div ref={formRef} className="max-w-2xl mx-auto mt-12">
      {showThankYou ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center animate-fadeIn shadow-lg">
          <h3 className="text-2xl sm:text-xl font-semibold text-green-800">Thank you for contacting us!</h3>
          <p className="mt-3 text-lg sm:text-base text-green-600">We'll get back to you as soon as possible.</p>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          <h3 className="text-3xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">Get in Touch</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-base sm:text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                className="block w-full rounded-lg border-2 border-solid border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#2B4B9B] focus:ring-0 focus:outline-none text-lg sm:text-base transition-colors duration-200"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-base sm:text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Your email"
                className="block w-full rounded-lg border-2 border-solid border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#2B4B9B] focus:ring-0 focus:outline-none text-lg sm:text-base transition-colors duration-200"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-base sm:text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Your phone number"
                className="block w-full rounded-lg border-2 border-solid border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#2B4B9B] focus:ring-0 focus:outline-none text-lg sm:text-base transition-colors duration-200"
              />
            </div>
            <div>
              <label htmlFor="organization_type" className="block text-base sm:text-sm font-medium text-gray-700 mb-2">I am a</label>
              <select
                id="organization_type"
                value={formData.organization_type}
                onChange={(e) => setFormData({ ...formData, organization_type: e.target.value })}
                className="block w-full rounded-lg border-2 border-solid border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-[#2B4B9B] focus:ring-0 text-lg sm:text-base transition-colors duration-200"
                required
              >
                <option value="">Select one</option>
                <option value="Brand">Brand</option>
                <option value="Marketing Agency">Marketing Agency</option>
                <option value="Event Organizer">Event Organizer</option>
                <option value="Influencer">Influencer</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="message" className="block text-base sm:text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                id="message"
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Your message"
                className="block w-full rounded-lg border-2 border-solid border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#2B4B9B] focus:ring-0 focus:outline-none text-lg sm:text-base transition-colors duration-200"
                required
              />
            </div>
            <div className="md:col-span-2">
              <button
                ref={buttonRef}
                onClick={handleSubmit}
                className="w-full py-3 px-6 bg-gradient-to-r from-[#2B4B9B] to-[#1F3A7A] text-white rounded-lg font-medium hover:from-[#1F3A7A] hover:to-[#13295A] text-lg sm:text-base will-change-transform"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactForm;