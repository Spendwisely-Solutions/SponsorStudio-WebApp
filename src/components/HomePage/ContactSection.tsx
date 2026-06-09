import React from 'react';
import ContactForm from './ContactForm';
import { FormData } from '../../App';

interface ContactSectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  showThankYou: boolean;
  setShowThankYou: (value: boolean) => void;
  disableAnimations?: boolean;
}

const ContactSection: React.FC<ContactSectionProps> = ({
  formData,
  setFormData,
  showThankYou,
  setShowThankYou,
  disableAnimations = false,
}) => {
  return (
    <section
      className="py-20 relative z-10"
      id="contact"
      style={{ background: 'linear-gradient(180deg, #060D1F 0%, #0A1628 100%)' }}
    >
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(rgba(0,212,255,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full text-sm font-medium" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00D4FF' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Get In Touch
          </div>
          
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight"
            {...(!disableAnimations && {
              'data-aos': 'zoom-in-up',
              'data-aos-duration': '800',
              'data-aos-easing': 'ease-out-cubic',
              'data-aos-delay': '10',
              'data-aos-once': 'true'
            })}
          >
            Contact{' '}
            <span style={{ background: 'linear-gradient(90deg, #00D4FF, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Us</span>
          </h2>
          
          <p
            className="mt-4 max-w-2xl mx-auto text-lg text-gray-400 leading-relaxed"
            {...(!disableAnimations && {
              'data-aos': 'zoom-in-up',
              'data-aos-duration': '800',
              'data-aos-easing': 'ease-out-cubic',
              'data-aos-delay': '20',
              'data-aos-once': 'true'
            })}
          >
            Have questions? We're here to help! Reach out to our team for personalized assistance.
          </p>
        </div>
        <ContactForm
          formData={formData || { name: '', email: '', phone: '', message: '', organization_type: '' }}
          setFormData={setFormData}
          showThankYou={showThankYou}
          setShowThankYou={setShowThankYou}
          disableAnimations={disableAnimations}
        />
      </div>
    </section>
  );
};

export default ContactSection;