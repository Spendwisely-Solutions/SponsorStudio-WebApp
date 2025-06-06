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
        <div className="text-center">
          <h2
            className="text-4xl sm:text-3xl md:text-4xl font-extrabold text-gray-900"
            data-aos="zoom-in-up"
            data-aos-duration="800"
            data-aos-easing="ease-out-cubic"
            data-aos-delay="50"
            data-aos-once="false"
          >
            Contact Us
          </h2>
          <p
            className="mt-4 text-xl sm:text-lg text-gray-600"
            data-aos="zoom-in-up"
            data-aos-duration="800"
            data-aos-easing="ease-out-cubic"
            data-aos-delay="75"
            data-aos-once="false"
          >
            Have questions? We're here to help!
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