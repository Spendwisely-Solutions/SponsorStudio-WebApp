'use client';

import { useState } from 'react';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import ContactSection from '../../components/HomePage/ContactSection';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  organization_type: string;
}

export default function ContactUsPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    organization_type: '',
  });
  const [showThankYou, setShowThankYou] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<string>('');

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText("Heavenly Plaza, Vazhakkala, Kakkanad, Ernakulam, Kerala 682021, India");
      setCopySuccess('Address copied to clipboard!');
      setTimeout(() => setCopySuccess(''), 3000);
    } catch (err) {
      setCopySuccess('Failed to copy address');
      setTimeout(() => setCopySuccess(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <NavBar hideAuthButton={true} />
      <div className="h-10"></div>
  
      <ContactSection
        formData={formData}
        setFormData={setFormData}
        showThankYou={showThankYou}
        setShowThankYou={setShowThankYou}
        disableAnimations={true}
      />

      {/* Map and Address Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Address Details */}
            <div className="space-y-8">
              <div>
                <span className="text-blue-600 font-bold text-sm tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full">Our Headquarters</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 leading-tight">Visit Our Office</h2>
                <p className="text-gray-600 mt-4 text-base sm:text-lg">Come by for a cup of coffee and a chat about how we can elevate your partnerships.</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 mt-1">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Address</h4>
                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                      Heavenly Plaza, Vazhakkala,<br />
                      Kakkanad, Ernakulam,<br />
                      Kerala 682021, India
                    </p>
                    <button 
                      onClick={handleCopyAddress}
                      className="text-blue-600 hover:text-blue-700 text-xs font-semibold mt-3 flex items-center gap-1.5 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      {copySuccess || 'Copy Full Address'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map */}
            <div className="h-[400px] w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white relative bg-gray-100">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.1764614275043!2d76.32621047464016!3d9.993992273062325!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1m3!1d0!2zOcKwNTknMzguNCJOIDc2wrAxOSc0My42IkU!5e0!3m2!1sen!2sin!4v1708892305412!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true}
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Sponsor Studio Location Map"
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
