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
      className="py-16 relative z-10 bg-gradient-to-br from-white via-blue-50 to-indigo-50"
      id="clients"
    >
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-blue-300 mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-indigo-300 mix-blend-multiply filter blur-xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2
            ref={titleRef}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
          >
            Our Partner Network
          </h2>

          <p
            ref={subtitleRef}
            className="mt-6 max-w-2xl mx-auto text-xl sm:text-2xl text-gray-600 leading-relaxed font-light"
          >
            Explore brands and event organizers already collaborating through Sponsor Studio.
          </p>
        </div>
        
        <div ref={contentRef} className="mt-8">
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
                  gradientColor={"#ffffff"} 
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
                    <div className="mx-8 text-gray-500 text-lg">No logos in Row 1</div>
                  )}
                </Marquee>
              </div>
              
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
                    <div className="mx-8 text-gray-500 text-lg">No logos in Row 2</div>
                  )}
                </Marquee>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </section>
  );
};

export default ClientsSection;