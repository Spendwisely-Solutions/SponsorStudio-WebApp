import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ClientLogo as ClientLogoType } from "../../App"

gsap.registerPlugin(ScrollTrigger);

interface ClientLogoProps {
  logo: ClientLogoType;
}

const ClientLogo: React.FC<ClientLogoProps> = ({ logo }) => {
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      logoRef.current,
      { opacity: 0, x: 20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        scrollTrigger: { trigger: logoRef.current, start: 'top 90%', fastScrollEnd: true },
      }
    );
  }, []);

  return (
    <div ref={logoRef} className="flex-shrink-0 px-4">
      <img className="h-14 md:h-16 object-contain" src={logo.logo_url} alt={logo.name} loading="lazy" />
    </div>
  );
};

export default ClientLogo;