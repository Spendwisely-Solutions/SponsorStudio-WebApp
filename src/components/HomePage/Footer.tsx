import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-lg sm:text-base text-gray-400">© {new Date().getFullYear()} Sponsor Studio. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;