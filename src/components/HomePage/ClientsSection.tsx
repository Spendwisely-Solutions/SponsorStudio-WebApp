import React from 'react';
import Marquee from 'react-fast-marquee';
import Skeleton from 'react-loading-skeleton';
import ClientLogo from './ClientLogo';
import { ClientLogo as ClientLogoType } from '../../App';

interface ClientsSectionProps {
  loading: boolean;
  clientLogos: ClientLogoType[];
}

const ClientsSection: React.FC<ClientsSectionProps> = ({ loading, clientLogos }) => {
  return (
    <section className="py-20 bg-gray-50 relative z-10" id="clients">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">People Who Trust Us</h2>
          <p className="mt-4 text-xl sm:text-lg text-gray-600">Join these amazing brands and event organizers on our platform</p>
        </div>
        <div className="mt-16">
          {loading ? (
            <div className="flex justify-center space-x-4">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} width={100} height={56} className="md:h-16" />
              ))}
            </div>
          ) : (
            <Marquee gradient={true} gradientColor={[249, 250, 252]} speed={40} pauseOnHover={true}>
              {clientLogos.map((logo) => (
                <ClientLogo key={logo.id} logo={logo} />
              ))}
            </Marquee>
          )}
        </div>
      </div>
    </section>
  );
};

export default ClientsSection;