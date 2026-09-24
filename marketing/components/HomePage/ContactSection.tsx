import React from 'react';
import ContactForm from './ContactForm';
import { FormData } from './Home';

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
      className="py-20 relative z-10 transition-colors duration-500"
      style={{ background: 'var(--gradient-contact)' }}
      id="contact"
    >
      {/* Background grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="eyebrow mb-4 inline-block">Get In Touch
          </div>
          
          <h2
            className="text-4xl sm:text-5xl md:text-6xl text-text-primary mb-4 leading-tight"
            {...(!disableAnimations && {
              'data-aos': 'zoom-in-up',
              'data-aos-duration': '800',
              'data-aos-easing': 'ease-out-cubic',
              'data-aos-delay': '10',
              'data-aos-once': 'true'
            })}
          >
            Contact{' '}
            <span className="italic">Us</span>
          </h2>
          
          <p
            className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary leading-relaxed"
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