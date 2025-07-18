import React from 'react';
import ContactForm from './ContactForm';
import { FormData } from '../../App';

interface ContactSectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  showThankYou: boolean;
  setShowThankYou: (value: boolean) => void;
}

const ContactSection: React.FC<ContactSectionProps> = ({
  formData,
  setFormData,
  showThankYou,
  setShowThankYou,
}) => {
  return (
    <section className="py-20 bg-gray-50 relative z-10" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-6 py-3 mb-8 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-blue-100/50">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-3 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-800">Get In Touch</span>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-600">We're here to help</span>
              </div>
            </div>
          </div>
          
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
            data-aos="zoom-in-up"
            data-aos-duration="800"
            data-aos-easing="ease-out-cubic"
            data-aos-delay="50"
            data-aos-once="false"
          >
            Contact Us
          </h2>
          
          {/* Feature badges */}
          <div className="flex flex-wrap gap-3 justify-center mt-8 mb-10">
            <div className="feature-badge flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-200/50 shadow-sm">
              <span className="text-sm font-medium text-blue-800">Quick Response</span>
            </div>
            <div className="feature-badge flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200/50 shadow-sm">
              <span className="text-sm font-medium text-green-800">24/7 Support</span>
            </div>
            <div className="feature-badge flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-full border border-purple-200/50 shadow-sm">
              <span className="text-sm font-medium text-purple-800">Expert Assistance</span>
            </div>
          </div>
          
          <p
            className="mt-6 max-w-2xl mx-auto text-xl sm:text-2xl text-gray-600 leading-relaxed font-light"
            data-aos="zoom-in-up"
            data-aos-duration="800"
            data-aos-easing="ease-out-cubic"
            data-aos-delay="75"
            data-aos-once="false"
          >
            Have questions? We're here to help! Reach out to our team for personalized assistance.
          </p>
        </div>
        <ContactForm
          formData={formData || { name: '', email: '', phone: '', message: '', organization_type: '' }}
          setFormData={setFormData}
          showThankYou={showThankYou}
          setShowThankYou={setShowThankYou}
        />
      </div>
    </section>
  );
};

export default ContactSection;