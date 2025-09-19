import React, { useRef, useState } from 'react';
import { sendContactEmail } from '../../lib/email';
import { FormData } from '../../App';
import { Check, Send, User, Mail, Phone, Building2, MessageSquare } from 'lucide-react';

interface ContactFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  showThankYou: boolean;
  setShowThankYou: (value: boolean) => void;
  disableAnimations?: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({ formData, setFormData, showThankYou, setShowThankYou, disableAnimations = false }) => {
  const formRef = useRef<HTMLDivElement>(null);

  // Provide default values if formData is undefined
  const safeFormData: FormData = {
    name: formData?.name ?? '',
    email: formData?.email ?? '',
    phone: formData?.phone ?? '',
    message: formData?.message ?? '',
    organization_type: formData?.organization_type ?? '',
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!safeFormData.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!safeFormData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeFormData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!safeFormData.organization_type) {
      errors.organization_type = "Please select your role";
    }
    
    if (!safeFormData.message.trim()) {
      errors.message = "Message is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Shake the form gently to indicate validation error
      formRef.current?.classList.add('animate-wiggle');
      setTimeout(() => {
        formRef.current?.classList.remove('animate-wiggle');
      }, 500);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await sendContactEmail(safeFormData);
      setShowThankYou(true);
      setFormData({ name: '', email: '', phone: '', message: '', organization_type: '' });
      setFormErrors({});
      
      // Hide thank you message after 8 seconds
      setTimeout(() => {
        setShowThankYou(false);
      }, 8000);
    } catch (error) {
      console.error('Error sending email:', error);
      alert("There was an error sending your message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation for field focus
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  // Add the wiggle animation to the global styles
  React.useEffect(() => {
    // Check if the animation already exists
    if (!document.querySelector('#contact-form-animations')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'contact-form-animations';
      styleSheet.textContent = `
        @keyframes wiggle {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float 12s ease-in-out infinite reverse;
        }
        .animate-float-delayed {
          animation: float 10s ease-in-out 2s infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }, []);

  return (
    <div ref={formRef} className="max-w-3xl mx-auto mt-12 relative">
      {/* Background elements */}
      <div className="absolute -z-10 inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-blue-300 mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-indigo-300 mix-blend-multiply filter blur-xl animate-float-slow"></div>
        <div className="absolute top-1/2 -translate-y-1/2 left-1/4 w-32 h-32 rounded-full bg-purple-300 mix-blend-multiply filter blur-lg animate-float-delayed"></div>
        <div className="absolute -bottom-5 right-1/4 w-40 h-40 rounded-full bg-cyan-300 mix-blend-multiply filter blur-xl animate-float-slow"></div>
        
        {/* Geometric shapes */}
        <div className="absolute top-10 left-10 w-16 h-16 border-2 border-blue-200 rounded-lg rotate-45"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 border-2 border-indigo-200 rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-10 h-10 border-2 border-purple-200 rotate-12"></div>
      </div>
      
      {showThankYou ? (
        <div
          className="bg-white/90 backdrop-blur-sm border border-green-200 rounded-2xl p-10 text-center shadow-xl relative overflow-hidden"
          {...(!disableAnimations && {
            'data-aos': 'zoom-in-up',
            'data-aos-duration': '500',
            'data-aos-easing': 'ease-out-cubic'
          })}
        >
          {/* Success confetti particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-2 left-1/4 w-2 h-8 bg-blue-500 rotate-45 animate-float-slow"></div>
            <div className="absolute top-10 right-1/4 w-3 h-3 bg-green-500 rounded-full animate-float"></div>
            <div className="absolute top-1/2 left-10 w-4 h-4 bg-yellow-500 rounded-full animate-float-delayed"></div>
            <div className="absolute bottom-10 right-10 w-2 h-6 bg-purple-500 rotate-12 animate-float-slow"></div>
            <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-pink-500 rounded-full animate-float"></div>
          </div>
          
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-lg animate-bounce-slow">
              <Check className="h-12 w-12 text-white" strokeWidth={3} />
            </div>
            
            <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-4">
              Message Sent Successfully!
            </h3>
            
            <p className="text-xl text-gray-700 mb-6 max-w-md mx-auto">
              Thank you for reaching out! Our team will get back to you within 24 hours.
            </p>
            
            <div className="inline-flex items-center justify-center gap-2 text-green-700 font-medium">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Your request has been recorded</span>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-xl border border-blue-100"
          {...(!disableAnimations && {
            'data-aos': 'zoom-in-up',
            'data-aos-duration': '500',
            'data-aos-easing': 'ease-out-cubic',
            'data-aos-delay': '30'
          })}
        >
          {/* Removed duplicate badge, heading, and subtitle to avoid repetition. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className="relative"
              {...(!disableAnimations && {
                'data-aos': 'fade-up',
                'data-aos-delay': '50'
              })}
            >
              <label
                htmlFor="name"
                className="block text-base sm:text-sm font-medium text-gray-700 mb-2"
              >
                Name
              </label>
              <div className="relative flex flex-col">
                <div className="absolute inset-y-0 bottom-5 left-0 flex items-center pl-4 pointer-events-none">
                  <User className={`h-5 w-5 ${formErrors.name ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type="text"
                  value={safeFormData.name}
                  onChange={(e) => {
                    setFormData({ ...safeFormData, name: e.target.value });
                    if (formErrors.name) {
                      setFormErrors({...formErrors, name: ''});
                    }
                  }}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Your name"
                  className={`block w-full rounded-lg border-2 border-solid ${
                    formErrors.name ? 'border-red-500 bg-red-50' : 
                    focusedField === 'name' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
                  } bg-white pl-12 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none text-lg sm:text-base transition-all duration-200`}
                  required
                />
                <div style={{ minHeight: '22px' }}>
                  {formErrors.name && (
                    <p className="mt-1 text-red-500 text-sm">{formErrors.name}</p>
                  )}
                </div>
              </div>
            </div>
            <div
              {...(!disableAnimations && {
                'data-aos-duration': '500',
                'data-aos': 'fade-up',
                'data-aos-delay': '70'
              })}
            >
              <label
                htmlFor="email"
                className="block text-base sm:text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <div className="relative flex flex-col">
                <div className="absolute inset-y-0 bottom-5  left-0 flex items-center pl-4 pointer-events-none">
                  <Mail className={`h-5 w-5 ${formErrors.email ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type="email"
                  id="email"
                  value={safeFormData.email}
                  onChange={(e) => {
                    setFormData({ ...safeFormData, email: e.target.value });
                    if (formErrors.email) {
                      setFormErrors({...formErrors, email: ''});
                    }
                  }}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Your email address"
                  className={`block w-full rounded-lg border-2 border-solid ${
                    formErrors.email ? 'border-red-500 bg-red-50' : 
                    focusedField === 'email' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
                  } bg-white pl-12 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none text-lg sm:text-base transition-all duration-200`}
                  required
                />
                <div style={{ minHeight: '22px' }}>
                  {formErrors.email && (
                    <p className="mt-1 text-red-500 text-sm">{formErrors.email}</p>
                  )}
                </div>
              </div>
            </div>
            <div
              className="relative"
              {...(!disableAnimations && {
                'data-aos': 'fade-up',
                'data-aos-delay': '90'
              })}
            >
              <label
                htmlFor="phone"
                className="block text-base sm:text-sm font-medium text-gray-700 mb-2"
              >
                Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={safeFormData.phone}
                  onChange={(e) => setFormData({ ...safeFormData, phone: e.target.value })}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Your phone number"
                  className={`block w-full rounded-lg border-2 border-solid ${
                    focusedField === 'phone' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
                  } bg-white pl-12 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none text-lg sm:text-base transition-all duration-200`}
                />
              </div>
            </div>
            <div
              className="relative"
              {...(!disableAnimations && {
                'data-aos': 'fade-up',
                'data-aos-delay': '110'
              })}
            >
              <label
                htmlFor="organization_type"
                className="block text-base sm:text-sm font-medium text-gray-700 mb-2"
              >
                I am a
              </label>
              <div className="relative flex flex-col">
                <div className="absolute inset-y-0 bottom-5 left-0 flex items-center pl-4 pointer-events-none">
                  <Building2 className={`h-5 w-5 ${formErrors.organization_type ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <select
                  id="organization_type"
                  value={safeFormData.organization_type}
                  onChange={(e) => {
                    setFormData({ ...safeFormData, organization_type: e.target.value });
                    if (formErrors.organization_type) {
                      setFormErrors({...formErrors, organization_type: ''});
                    }
                  }}
                  onFocus={() => setFocusedField('organization_type')}
                  onBlur={() => setFocusedField(null)}
                  className={`block w-full rounded-lg border-2 border-solid ${
                    formErrors.organization_type ? 'border-red-500 bg-red-50' : 
                    focusedField === 'organization_type' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
                  } bg-white pl-12 pr-4 py-3 text-gray-900 focus:outline-none text-lg sm:text-base transition-all duration-200 appearance-none`}
                  required
                >
                  <option value="">Select your role</option>
                  <option value="Brand">Brand</option>
                  <option value="Marketing Agency">Marketing Agency</option>
                  <option value="Opportunity Provider">Opportunity Provider</option>
                  <option value="Influencer">Influencer</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className={`h-5 w-5 ${formErrors.organization_type ? 'text-red-400' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div style={{ minHeight: '22px' }}>
                  {formErrors.organization_type && (
                    <p className="mt-1 text-red-500 text-sm">{formErrors.organization_type}</p>
                  )}
                </div>
              </div>
            </div>
            <div 
              className="md:col-span-2"
              {...(!disableAnimations && {
                'data-aos': 'fade-up',
                'data-aos-delay': '130'
              })}
            >
              <label
                htmlFor="message"
                className="block text-base sm:text-sm font-medium text-gray-700 mb-2"
              >
                Message
              </label>
              <div className="relative flex flex-col">
                <div className="absolute top-5 left-4 pointer-events-none">
                  <MessageSquare className={`h-5 w-5 ${formErrors.message ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <textarea
                  id="message"
                  rows={5}
                  value={safeFormData.message}
                  onChange={(e) => {
                    setFormData({ ...safeFormData, message: e.target.value });
                    if (formErrors.message) {
                      setFormErrors({...formErrors, message: ''});
                    }
                  }}
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Your message"
                  className={`block w-full rounded-lg border-2 border-solid ${
                    formErrors.message ? 'border-red-500 bg-red-50' : 
                    focusedField === 'message' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
                  } bg-white pl-12 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none text-lg sm:text-base transition-all duration-200`}
                  required
                />
                <div style={{ minHeight: '22px' }}>
                  {formErrors.message && (
                    <p className="mt-1 text-red-500 text-sm">{formErrors.message}</p>
                  )}
                </div>
              </div>
            </div>
            <div 
              className="md:col-span-2"
              {...(!disableAnimations && {
                'data-aos': 'fade-up',
                'data-aos-delay': '150'
              })}
            >
              <button
                onClick={(e) => {
                  // Disable submit button temporarily to prevent double submissions
                  const button = e.currentTarget;
                  button.disabled = true;
                  button.classList.add('opacity-75');
                  
                  // Show loading state
                  const originalText = button.innerHTML;
                  button.innerHTML = `
                    <div class="flex items-center justify-center">
                      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </div>
                  `;
                  
                  // Handle submission
                  handleSubmit(e)
                    .finally(() => {
                      // Only reset if not showing thank you message
                      if (!showThankYou) {
                        button.disabled = false;
                        button.classList.remove('opacity-75');
                        button.innerHTML = originalText;
                      }
                    });
                }}
                className="w-full py-3 px-6 bg-gradient-to-r from-[#2B4B9B] to-[#4C6ECA] text-white rounded-lg font-medium hover:from-[#1F3A7A] hover:to-[#395CB0] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg sm:text-base transform transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="h-5 w-5" />
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