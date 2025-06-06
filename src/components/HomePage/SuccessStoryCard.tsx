import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { SuccessStory as SuccessStoryType } from '../../App';

interface SuccessStoryCardProps {
  story: SuccessStoryType;
  'data-aos'?: string;
  'data-aos-delay'?: string;
}

const SuccessStoryCard: React.FC<SuccessStoryCardProps> = ({ story, ...aosProps }) => {
  console.log(`SuccessStoryCard ${story.id} received AOS props:`, aosProps);

  return (
    <div
      className="flex flex-col rounded-lg shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 ease-in-out hover:scale-105"
      {...aosProps}
    >
      <div
        className="transition-shadow duration-200 ease-out "
        onMouseEnter={() => console.log(`Hovered over card ${story.id}`)}
      >
        <img className="h-48 w-full object-cover" src={story.preview_image} alt={story.title} loading="lazy" />
        <div className="flex-1 p-6">
          <h3
            className="text-2xl sm:text-xl font-semibold text-gray-900"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            {story.title}
          </h3>
          <p
            className="mt-3 text-lg sm:text-base text-gray-600"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            {story.preview_text}
          </p>
          <Link
            to={`/story/${story.id}`}
            className="mt-5 flex items-center text-[#2B4F9F] hover:text-[#1F3A7A] text-lg sm:text-base transition-colors duration-200 ease-in-out"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            Read more <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessStoryCard;