import React, { useEffect, useRef } from 'react';
import Marquee from 'react-fast-marquee';
import ClientLogo from './ClientLogo';
import { ClientLogo as ClientLogoType } from './Home';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface ClientsSectionProps {
  loading: boolean;
  clientLogos: ClientLogoType[];
}

const ClientsSection: React.FC<ClientsSectionProps> = ({ loading, clientLogos }) => {
  const theme = 'dark'; // Assume dark theme
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const marqueeGradientColor = theme === 'dark' ? "rgb(10, 22, 40)" : "rgb(255, 255, 255)";


  // Animate elements when they come into view
  useEffect(() => {
    if (!titleRef.current || !subtitleRef.current || !contentRef.current) return;
    
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
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const row1Logos = clientLogos.filter(logo => logo.row === "1");
  const row2Logos = clientLogos.filter(logo => logo.row === "2");

  return (
    <section 
      ref={sectionRef}
      className="py-16 relative z-10 transition-colors duration-500" 
      style={{ background: 'var(--gradient-clients)' }}
      id="clients"
    >
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(color-mix(in srgb, var(--color-primary) 80%, transparent) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 15%, transparent) 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--color-secondary) 15%, transparent) 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full text-sm font-medium bg-info/10 border border-info/30 text-info">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Trusted Partners
          </div>
          
          <h2
            ref={titleRef}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-text-primary mb-4 leading-tight"
          >
            People Who{' '}
            <span style={{ background: 'linear-gradient(90deg, #00D4FF, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Trust Us</span>
          </h2>
          
          <p
            ref={subtitleRef}
            className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary leading-relaxed"
          >
            Join amazing brands and event organizers already transforming their sponsorship experiences
          </p>
        </div>
        
        <div ref={contentRef} className="mt-12">
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
              <div className="mb-8">
                <Marquee 
                  gradient={true} 
                  gradientColor={marqueeGradientColor} 
                  gradientWidth={100}
                  speed={60} 
                  pauseOnHover={true}
                  direction="left"
                  className="overflow-hidden"
                >
                  {row1Logos.length > 0 ? (
                    row1Logos.map((logo) => (
                      <div 
                        key={logo.id} 
                        className="mx-8 transition-all duration-300 hover:scale-110 filter hover:drop-shadow-md"
                      >
                        <ClientLogo logo={logo} />
                      </div>
                    ))
                  ) : (
                    <div className="mx-8 text-text-muted text-lg">No logos in Row 1</div>
                  )}
                </Marquee>
              </div>
              
              <div>
                <Marquee 
                  gradient={true} 
                  gradientColor={marqueeGradientColor} 
                  gradientWidth={100}
                  speed={45} 
                  pauseOnHover={true}
                  direction="right"
                  className="overflow-hidden"
                >
                  {row2Logos.length > 0 ? (
                    row2Logos.map((logo) => (
                      <div 
                        key={`row2-${logo.id}`}
                        className="mx-8 transition-all duration-300 hover:scale-110 filter hover:drop-shadow-md"
                      >
                        <ClientLogo logo={logo} />
                      </div>
                    ))
                  ) : (
                    <div className="mx-8 text-text-muted text-lg">No logos in Row 2</div>
                  )}
                </Marquee>
              </div>
            </div>
          )}
          
          {!loading && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 md:gap-8 text-text-secondary">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-border shadow-sm mr-3">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-text-primary">Verified Partners</span>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-border shadow-sm mr-3">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-text-primary">Secure Platform</span>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-border shadow-sm mr-3">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-text-primary">24/7 Support</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ClientsSection;