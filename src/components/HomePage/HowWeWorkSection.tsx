import React from 'react';
import { Building2, FileCheck, MessageSquare } from 'lucide-react';
import Step from './Step';

const HowWeWorkSection: React.FC = () => {
  const steps = [
    {
      icon: <Building2 className="h-8 w-8" />,
      title: 'Create Your Profile',
      description: 'Sign up and create your profile as a brand or event organizer',
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: 'Connect & Collaborate',
      description: 'Browse opportunities or list your event to find the perfect match',
    },
    {
      icon: <FileCheck className="h-8 w-8" />,
      title: 'Finalize & Execute',
      description: 'Seal the deal and bring your partnership to life',
    },
  ];

  return (
    <section className="py-20 bg-white relative z-10" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">How We Work</h2>
          <p className="mt-4 text-xl sm:text-lg text-gray-600">
            Simple steps to connect brands with the right sponsorship opportunities
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Step key={index} icon={step.icon} title={step.title} description={step.description} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowWeWorkSection;