import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import NavBar from '../components/HomePage/NavBar';
import Footer from '../components/HomePage/Footer';
import ContactSection from '../components/HomePage/ContactSection';
import { FormData } from '../App';

function ContactUs() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    organization_type: '',
  });
  const [showThankYou, setShowThankYou] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
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
      <Helmet>
        <title>Contact Us - Sponsor Studio | Get in Touch</title>
        <meta name="description" content="Contact Sponsor Studio for sponsorship opportunities, partnerships, and support. We're here to help brands and event organizers connect effectively." />
        <meta name="keywords" content="contact sponsor studio, sponsorship support, brand partnership contact, event sponsorship help, customer support" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.sponsorstudio.in/Contact-us" />
        <meta property="og:title" content="Contact Us - Sponsor Studio | Get in Touch" />
        <meta property="og:description" content="Contact Sponsor Studio for sponsorship opportunities, partnerships, and support. We're here to help brands and event organizers connect effectively." />
        <meta property="og:image" content="https://www.sponsorstudio.in/sponsor_studio_logo.png" />
        <meta property="og:site_name" content="Sponsor Studio" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://www.sponsorstudio.in/Contact-us" />
        <meta property="twitter:title" content="Contact Us - Sponsor Studio | Get in Touch" />
        <meta property="twitter:description" content="Contact Sponsor Studio for sponsorship opportunities, partnerships, and support. We're here to help brands and event organizers connect effectively." />
        <meta property="twitter:image" content="https://www.sponsorstudio.in/sponsor_studio_logo.png" />

        {/* Additional SEO tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Sponsor Studio" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://www.sponsorstudio.in/Contact-us" />
        
        {/* Contact specific tags */}
        <meta name="category" content="Contact, Support" />
        <meta name="classification" content="Contact Form, Customer Support, Business Inquiries" />
        <meta name="audience" content="Brands, Event Organizers, Business Partners" />
      </Helmet>

      <NavBar
        user={null}
        profile={null}
        isProfileComplete={false}
        setShowAuthForm={() => {}} // Empty function since auth form isn't needed on contact page
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        hideAuthButton={true}
        navLinks={[
          { label: 'Home', to: '/' },
          { label: 'About', to: '/how-we-work' },
          { label: 'Faq', to: '/faq' },
        ]}
      />
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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm">
              <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Find Us</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Visit Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Office</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Come meet our team in person or reach out to us through any of the channels below
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Address and Contact Info */}
            <div className="space-y-4 sm:space-y-6">
              {/* Address Card */}
              <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 p-6 sm:p-8 rounded-2xl border border-blue-100 hover:shadow-xl hover:shadow-blue-100/50 transform hover:-translate-y-1 transition-all duration-300">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                  <div className="p-2 bg-blue-600 rounded-lg mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  Our Address
                </h3>
                <div className="space-y-3 ml-12 sm:ml-16">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4"></div>
                    <div className="space-y-1">
                      <p className="text-gray-900 font-semibold text-base sm:text-lg">Sponsor Studio</p>
                      <p className="text-gray-700 text-sm sm:text-base">Heavenly Plaza</p>
                      <p className="text-gray-700 text-sm sm:text-base">Vazhakkala, Kakkanad</p>
                      <p className="text-gray-700 text-sm sm:text-base">Ernakulam, Kerala 682021</p>
                    
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Details Grid */}
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                

                {/* Email Card */}
                <div className="group bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-6 rounded-xl border border-purple-100 hover:shadow-xl hover:shadow-purple-100/50 transform hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="p-2 bg-purple-600 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Email</h4>
                  </div>
                  <div className="ml-10 sm:ml-11">
                    <a href="mailto:connect@sponsorstudio.in" className="text-gray-700 font-medium hover:text-purple-600 transition-colors text-sm sm:text-base break-all">
                      connect@sponsorstudio.in
                    </a>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">We'll respond within 24 hours</p>
                  </div>
                </div>

                {/* Business Hours Card */}
                <div className="group bg-gradient-to-br from-orange-50 to-amber-50 p-4 sm:p-6 rounded-xl border border-orange-100 hover:shadow-xl hover:shadow-orange-100/50 transform hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="p-2 bg-orange-600 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Business Hours</h4>
                  </div>
                  <div className="space-y-2 text-gray-700 ml-10 sm:ml-11">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                      <span className="text-sm sm:text-base">Monday - Saturday</span>
                      <span className="font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs sm:text-sm w-fit">9:30 AM - 6:30 PM</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                      <span className="text-sm sm:text-base">Sunday</span>
                      <span className="font-semibold bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs sm:text-sm w-fit">Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Map Section */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-xl border border-gray-200 relative" style={{ height: '500px' }}>
                {/* Loading Skeleton */}
                {!mapLoaded && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-300 rounded-full mb-4 mx-auto animate-pulse"></div>
                      <div className="h-4 bg-gray-300 rounded w-32 mb-2 mx-auto animate-pulse"></div>
                      <div className="h-3 bg-gray-300 rounded w-24 mx-auto animate-pulse"></div>
                    </div>
                  </div>
                )}
                
                {/* Google Maps Embed */}
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.040455015802!2d76.3280984747846!3d10.013517172802514!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473559c8e15ed7d9%3A0x7be9c79062276d64!2sSponsor%20Studio!5e0!3m2!1sen!2sin!4v1758276492117!5m2!1sen!2sin"
                  style={{ 
                    border: 0, 
                    opacity: mapLoaded ? 1 : 0,
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="transition-opacity duration-300"
                  title="Sponsor Studio Office Location"
                  onLoad={() => setMapLoaded(true)}
                ></iframe>
                
                {/* Enhanced Map Overlay */}
                <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-200/50 max-w-xs">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse shadow-lg"></div>
                    <span className="text-sm font-semibold text-gray-900">Sponsor Studio</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Heavenly Plaza, Kakkanad
                    <br />
                    <span className="font-medium">Ernakulem, Kerala</span>
                  </p>
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="font-medium">Open Now</span>
                  </div>
                </div>

                {/* Map Controls */}
               
              </div>

              {/* Enhanced Map Actions */}

              {/* Copy Success Notification */}
              {copySuccess && (
                <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-800 font-medium">{copySuccess}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Social Media & Connect Section */}
    

      {/* Floating Action Buttons - Mobile Optimized */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 sm:gap-3">
        {/* WhatsApp Floating Button */}
        <a
          href="https://wa.me/917736037993?text=Hi! I'd like to know more about Sponsor Studio services."
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
          title="Chat on WhatsApp"
        >
          <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.108"/>
          </svg>
          {/* Tooltip - Hidden on mobile */}
          <div className="hidden sm:block absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            WhatsApp Chat
            <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        </a>

        {/* Phone Floating Button */}
        <a
          href="tel:+917736037993"
          className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
          title="Call us directly"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {/* Tooltip - Hidden on mobile */}
          <div className="hidden sm:block absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Call Now
            <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        </a>

        {/* Email Floating Button */}
        <a
          href="mailto:connect@sponsorstudio.in"
          className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
          title="Send us an email"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {/* Tooltip - Hidden on mobile */}
          <div className="hidden sm:block absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Send Email
            <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        </a>
      </div>
      
      <Footer />
    </div>
  );
}

export default ContactUs;
