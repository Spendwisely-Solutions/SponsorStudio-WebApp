
import React, { useRef } from 'react';
import { ClientLogo as ClientLogoType } from "../../App"

interface ClientLogoProps {
  logo: ClientLogoType;
}

const ClientLogo: React.FC<ClientLogoProps> = ({ logo }) => {

  const logoRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={logoRef} className="flex-shrink-0 px-4">
      <img className="h-14 md:h-16 object-contain filter grayscale dark:invert opacity-40 hover:opacity-70 hover:grayscale-0 dark:hover:invert-0 transition-all duration-300" src={logo.logo_url} alt={logo.name} loading="lazy" />
    </div>
  );
};

export default ClientLogo;