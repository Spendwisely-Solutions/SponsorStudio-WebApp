import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { User } from './Home';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  user: User | null;
  setShowAuthForm: (value: boolean) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ user, setShowAuthForm }) => {
  const titles = [
    "Spend your marketing budget wisely!",
    "Find Sponsors for your event!",
    "Secure your next collaboration with us!"
  ];
  const [currentTitleIndex, setCurrentTitleIndex] = useState<number>(0);
  const [displayText, setDisplayText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  useEffect(() => {
    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: heroRef.current, fastScrollEnd: true } }
    );

    gsap.fromTo(
      textRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1.2, ease: 'power4.out', delay: 0.2 }
    );

    gsap.fromTo(
      buttonRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.4 }
    );

    if (buttonRef.current) {
      buttonRef.current.addEventListener('mouseenter', () => {
        gsap.to(buttonRef.current, { scale: 1.05, duration: 0.2, ease: 'power2.out' });
      });
      buttonRef.current.addEventListener('mouseleave', () => {
        gsap.to(buttonRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
      });
    }

    let currentIndex = 0;
    let currentText = '';
    let isDeleting = false;
    let timeout: NodeJS.Timeout;

    const type = () => {
      const currentTitle = titles[currentTitleIndex];
      const shouldDelayBeforeDeleting = !isDeleting && currentText === currentTitle;
      const shouldStartNextWord = isDeleting && currentText === '';

      if (shouldStartNextWord) {
        isDeleting = false;
        setCurrentTitleIndex((prevIndex) => (prevIndex + 1) % titles.length);
        return;
      }

      if (shouldDelayBeforeDeleting) {
        timeout = setTimeout(() => {
          isDeleting = true;
          type();
        }, 2000);
        return;
      }

      const delta = isDeleting ? -1 : 1;
      currentText = isDeleting
        ? currentTitle.substring(0, currentText.length - 1)
        : currentTitle.substring(0, currentText.length + 1);

      setDisplayText(currentText);
      setIsTyping(!shouldDelayBeforeDeleting);

      const typingSpeed = isDeleting ? 50 : 100;
      timeout = setTimeout(type, typingSpeed);
    };

    timeout = setTimeout(type, 100);

    return () => {
      clearTimeout(timeout);
      if (buttonRef.current) {
        buttonRef.current.removeEventListener('mouseenter', () => {});
        buttonRef.current.removeEventListener('mouseleave', () => {});
      }
    };
  }, [currentTitleIndex]);

  return (
    <div ref={heroRef} className="min-h-[80vh] flex items-center pt-20 relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 ref={textRef} className="text-5xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
          <span className="block text-[#2B4B9B] min-h-[60px] lg:min-h-[72px]">
            {displayText}
            <span className={`inline-block w-0.5 h-8 lg:h-10 bg-[#2B4B9B] -mb-1 ml-1 ${isTyping ? 'animate-blink' : 'opacity-0'}`} />
          </span>
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg sm:text-xl text-gray-600">
          Connect with the right partners for your next event. Whether you're a brand or an organizer, we've got you covered.
        </p>
        <div className="mt-8">
          {user ? (
            <a
              ref={buttonRef as React.RefObject<HTMLAnchorElement>}
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-[#2B4B9B] text-white text-lg sm:text-base rounded-full hover:bg-[#1F3A7A] will-change-transform"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          ) : (
            <button
              ref={buttonRef as React.RefObject<HTMLButtonElement>}
              onClick={() => setShowAuthForm(true)}
              className="inline-flex items-center px-6 py-3 bg-[#2B4B9B] text-white text-lg sm:text-base rounded-full hover:bg-[#1F3A7A] will-change-transform"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;