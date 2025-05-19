import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SuccessStory as SuccessStoryType } from '../../App';

gsap.registerPlugin(ScrollTrigger);

interface SuccessStoryCardProps {
  story: SuccessStoryType;
}

const SuccessStoryCard: React.FC<SuccessStoryCardProps> = ({ story }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: cardRef.current, start: 'top 85%', fastScrollEnd: true },
      }
    );

    const card = cardRef.current;
    if (card) {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { scale: 1.05, duration: 0.2, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { scale: 1, duration: 0.2, ease: 'power2.out' });
      });
    }

    return () => {
      if (card) {
        card.removeEventListener('mouseenter', () => {});
        card.removeEventListener('mouseleave', () => {});
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-transform duration-200 ease-out bg-white"
    >
      <img className="h-48 w-full object-cover" src={story.preview_image} alt={story.title} loading="lazy" />
      <div className="flex-1 p-6">
        <h3 className="text-2xl sm:text-xl font-semibold text-gray-900">{story.title}</h3>
        <p className="mt-3 text-lg sm:text-base text-gray-600">{story.preview_text}</p>
        <Link
          to={`/story/${story.id}`}
          className="mt-6 flex items-center text-[#2B4B9B] hover:text-[#1F3A7A] text-lg sm:text-base transition-colors duration-200 ease-out"
        >
          Read more <ChevronRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default SuccessStoryCard;