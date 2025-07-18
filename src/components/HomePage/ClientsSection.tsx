import React, { useEffect, useRef } from 'react';
import Marquee from 'react-fast-marquee';
import ClientLogo from './ClientLogo';
import { ClientLogo as ClientLogoType } from '../../App';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface ClientsSectionProps {
  loading: boolean;
  clientLogos: ClientLogoType[];
}

const ClientsSection: React.FC<ClientsSectionProps> = ({ loading, clientLogos }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Animate elements when they come into view
  useEffect(() => {
    if (!titleRef.current || !subtitleRef.current || !contentRef.current) return;
    
    // Title animation
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: -30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 85%",
        }
      }
    );
    
    // Subtitle animation
    gsap.fromTo(
      subtitleRef.current,
      { opacity: 0, y: -20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        delay: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: subtitleRef.current,
          start: "top 85%",
        }
      }
    );
    
    // Content reveal animation
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1, 
        delay: 0.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 85%",
        }
      }
    );
    
    return () => {
      // Clean up scroll triggers
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-16 relative z-10 bg-gradient-to-br from-white via-blue-50 to-indigo-50" 
      id="clients"
    >
      {/* Background pattern/shapes */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-blue-300 mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-indigo-300 mix-blend-multiply filter blur-xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-6 py-3 mb-8 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-blue-100/50">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-3 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-800">Trusted Partners</span>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-600">Global brands and event organizers</span>
              </div>
            </div>
          </div>
          
          <h2
            ref={titleRef}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
          >
            People Who Trust Us
          </h2>
          
          {/* Feature badges */}
          <div className="flex flex-wrap gap-3 justify-center mt-8 mb-10">
            <div className="feature-badge flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-200/50 shadow-sm">
              <span className="text-sm font-medium text-blue-800">Global Brands</span>
            </div>
            <div className="feature-badge flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200/50 shadow-sm">
              <span className="text-sm font-medium text-green-800">Event Organizers</span>
            </div>
            <div className="feature-badge flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-full border border-purple-200/50 shadow-sm">
              <span className="text-sm font-medium text-purple-800">Trusted Partners</span>
            </div>
          </div>
          
          <p
            ref={subtitleRef}
            className="mt-6 max-w-2xl mx-auto text-xl sm:text-2xl text-gray-600 leading-relaxed font-light"
          >
            Join these amazing brands and event organizers who are already transforming their sponsorship experiences
          </p>
        </div>
        
        <div
          ref={contentRef}
          className="mt-12"
        >
          {loading ? (
            <div className="flex justify-center space-x-6">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 w-32 bg-blue-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 px-0 overflow-hidden [&_*::-webkit-scrollbar]:hidden [&_*]:scrollbar-hide">
              {/* First row - faster speed */}
              <div className="mb-8">
                <Marquee 
                  gradient={true} 
                  gradientColor={"#ffffff"} 
                  gradientWidth={100}
                  speed={60} 
                  pauseOnHover={true}
                  direction="left"
                  className="overflow-hidden"
                >
                  {clientLogos.map((logo) => (
                    <div 
                      key={logo.id} 
                      className="mx-8 transition-all duration-300 hover:scale-110 filter hover:drop-shadow-md"
                    >
                      <ClientLogo logo={logo} />
                    </div>
                  ))}
                </Marquee>
              </div>
              
              {/* Second row - opposite direction */}
              <div>
                <Marquee 
                  gradient={true} 
                  gradientColor={"#ffffff"} 
                  gradientWidth={100}
                  speed={45} 
                  pauseOnHover={true}
                  direction="right"
                  className="overflow-hidden"
                >
                  {[...clientLogos].reverse().map((logo) => (
                    <div 
                      key={`reverse-${logo.id}`}
                      className="mx-8 transition-all duration-300 hover:scale-110 filter hover:drop-shadow-md"
                    >
                      <ClientLogo logo={logo} />
                    </div>
                  ))}
                </Marquee>
              </div>
            </div>
          )}
          
          {/* Trust Badges - similar to the Hero section */}
          {!loading && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 md:gap-8 text-gray-500">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-100 shadow-sm mr-3">
                  <svg className="w-5 h-5 text-[#2B4B9B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Verified Partners</span>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-100 shadow-sm mr-3">
                  <svg className="w-5 h-5 text-[#2B4B9B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Secure Platform</span>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-100 shadow-sm mr-3">
                  <svg className="w-5 h-5 text-[#2B4B9B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">24/7 Support</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ClientsSection;