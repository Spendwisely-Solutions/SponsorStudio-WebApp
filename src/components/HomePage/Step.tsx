import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface StepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const Step: React.FC<StepProps> = ({ icon, title, description, index }) => {
  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      stepRef.current,
      { opacity: 0, y: 50, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: stepRef.current, start: 'top 85%', fastScrollEnd: true },
        delay: index * 0.2,
      }
    );
  }, [index]);

  return (
    <div ref={stepRef} className="text-center">
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#2B4B9B] text-white mx-auto shadow-md transform will-change-transform hover:scale-110 transition-transform duration-200 ease-out">
        {icon}
      </div>
      <h3 className="mt-6 text-2xl sm:text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-lg sm:text-base text-gray-600">{description}</p>
    </div>
  );
};

export default Step;