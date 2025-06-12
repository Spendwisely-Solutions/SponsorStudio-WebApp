 import React, { useRef } from 'react';

interface StepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const Step: React.FC<StepProps> = ({ icon, title, description, index }) => {
  const stepRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={stepRef}
      className="text-center"
      data-aos="zoom-in-up"
      data-aos-duration="800"
      data-aos-easing="ease-out-cubic"
      data-aos-delay={200 + index * 200} // Base delay of 200ms plus 200ms per step
      data-aos-anchor-placement="top-bottom"
      data-aos-once="false"
    >
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#2B4B9B] text-white mx-auto shadow-md transform hover:scale-110 transition-transform duration-200 ease-out">
        {icon}
      </div>
      <h3 className="mt-6 text-2xl sm:text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-lg sm:text-base text-gray-600">{description}</p>
    </div>
  );
};

export default Step;