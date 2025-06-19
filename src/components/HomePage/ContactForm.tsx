import React, { useRef } from 'react';
import { sendContactEmail } from '../../lib/email';
import { FormData } from '../../App';

interface ContactFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  showThankYou: boolean;
  setShowThankYou: (value: boolean) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ formData, setFormData, showThankYou, setShowThankYou }) => {
  const formRef = useRef<HTMLDivElement>(null);

  // Provide default values if formData is undefined
  const safeFormData: FormData = {
    name: formData?.name ?? '',
    email: formData?.email ?? '',
    phone: formData?.phone ?? '',
    message: formData?.message ?? '',
    organization_type: formData?.organization_type ?? '',
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await sendContactEmail(safeFormData);
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
        <div
          className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center shadow-lg"
          data-aos="zoom-in-up"
          data-aos-duration="800"
          data-aos-easing="ease-out-cubic"
          data-aos-delay="100"
          data-aos-once="false"
        >
          <h3 className="text-2xl sm:text-xl font-semibold text-green-800">Thank you for contacting us!</h3>
          <p className="mt-3 text-lg sm:text-base text-green-600">We'll get back to you as soon as possible.</p>
        </div>
      ) : (
        <div
          className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200"
          data-aos="zoom-in-up"
          data-aos-duration="800"
          data-aos-easing="ease-out-cubic"
          data-aos-delay="100"
          data-aos-once="false"
        >
          <h3
            className="text-3xl sm:text-2xl font-bold text-gray-900 mb-6 text-center"
            data-aos="zoom-in-up"
            data-aos-duration="800"
            data-aos-easing="ease-out-cubic"
            data-aos-delay="125"
            data-aos-once="false"
          >
            Get in Touch
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-base sm:text-sm font-medium text-gray-700 mb-2"
                data-aos="zoom-in-up"
                data-aos-duration="800"
                data-aos-easing="ease-out-cubic"
                data-aos-delay="150"
                data-aos-once="false"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={safeFormData.name}
                onChange={(e) => setFormData({ ...safeFormData, name: e.target.value })}
                placeholder="Your name"
                className="block w-full rounded-lg border-2 border-solid border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#2B4B9B] focus:ring-0 focus:outline-none text-lg sm:text-base transition-colors duration-200"
                required
                data-aos="zoom-in-up"
                data-aos-duration="800"
                data-aos-easing="ease-out-cubic"
                data-aos-delay="175"
                data-aos-once="false"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-base sm:text-sm font-medium text-gray-700 mb-2"
                data-aos="zoom-in-up"
                data-aos-duration="800"
                data-aos-easing="ease-out-cubic"
                data-aos-delay="200"
                data-aos-once="false"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={safeFormData.email}
                onChange={(e) => setFormData({ ...safeFormData, email: e.target.value })}
                placeholder="Your email"
                className="block w-full rounded-lg border-2 border-solid border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#2B4B9B] focus:ring-0 focus:outline-none text-lg sm:text-base transition-colors duration-200"
                required
                data-aos="zoom-in-up"
                data-aos-duration="800"
                data-aos-easing="ease-out-cubic"
                data-aos-delay="225"
                data-aos-once="false"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-base sm:text-sm font-medium text-gray-700 mb-2"
                data-aos="zoom-in-up"
                data-aos-duration="800"
                data-aos-easing="ease-out-cubic"
                data-aos-delay="250"
                data-aos-once="false"
              >
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                value={safeFormData.phone}
                onChange={(e) => setFormData({ ...safeFormData, phone: e.target.value })}
                placeholder="Your phone number"
                className="block w-full rounded-lg border-2 border-solid border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#2B4B9B] focus:ring-0 focus:outline-none text-lg sm:text-base transition-colors duration-200"
                data-aos="zoom-in-up"
                data-aos-duration="800"
                data-aos-easing="ease-out-cubic"
                data-aos-delay="275"
                data-aos-once="false"
              />
            </div>
            <div>
              <label
                htmlFor="organization_type"
                className="block text-base sm:text-sm font-medium text-gray-700 mb-2"
                data-aos="zoom-in-up"
                data-aos-duration="800"
                data-aos-easing="ease-out-cubic"
                data-aos-delay="300"
                data-aos-once="false"
              >
                I am a
              </label>
              <select
                id="organization_type"
                value={safeFormData.organization_type}
                onChange={(e) => setFormData({ ...safeFormData, organization_type: e.target.value })}
                className="block w-full rounded-lg border-2 border-solid border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-[#2B4B9B] focus:ring-0 text-lg sm:text-base transition-colors duration-200"
                required
                data-aos="zoom-in-up"
                data-aos-duration="800"
                data-aos-easing="ease-out-cubic"
                data-aos-delay="325"
                data-aos-once="false"
              >
                <option value="">Select one</option>
                <option value="Brand">Brand</option>
                <option value="Marketing Agency">Marketing Agency</option>
                <option value="Opportunity Provider">Opportunity Provider</option>
                <option value="Influencer">Influencer</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="message"
                className="block text-base sm:text-sm font-medium text-gray-700 mb-2"
                data-aos="zoom-in-up"
                data-aos-duration="800"
                data-aos-easing="ease-out-cubic"
                data-aos-delay="350"
                data-aos-once="false"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                value={safeFormData.message}
                onChange={(e) => setFormData({ ...safeFormData, message: e.target.value })}
                placeholder="Your message"
                className="block w-full rounded-lg border-2 border-solid border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#2B4B9B] focus:ring-0 focus:outline-none text-lg sm:text-base transition-colors duration-200"
                required
                data-aos="zoom-in-up"
                data-aos-duration="800"
                data-aos-easing="ease-out-cubic"
                data-aos-delay="375"
                data-aos-once="false"
              />
            </div>
            <div className="md:col-span-2">
              <button
                onClick={handleSubmit}
                className="w-full py-3 px-6 bg-gradient-to-r from-[#2B4B9B] to-[#1F3A7A] text-white rounded-lg font-medium hover:from-[#1F3A7A] hover:to-[#13295A] text-lg sm:text-base will-change-transform"
                data-aos="zoom-in-up"
                data-aos-duration="600"
                data-aos-easing="ease-out-cubic"
                data-aos-delay="400"
                data-aos-once="false"
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