import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { SuccessStory as SuccessStoryType } from '../../App';

interface SuccessStoryCardProps {
  story: SuccessStoryType;
  storyNumber: number;
  'data-aos'?: string;
  'data-aos-delay'?: string;
  hoverClassName?: string;
}

const SuccessStoryCard: React.FC<SuccessStoryCardProps> = ({ story, storyNumber, hoverClassName, ...aosProps }) => {
  return (
    <div
      className={`group flex flex-col rounded-xl overflow-hidden shadow-lg bg-white transition-all duration-300 ease-in-out ${hoverClassName || 'hover:shadow-xl hover:scale-105'}`}
      {...aosProps}
    >
      <div className="h-full flex flex-col">
        <div className="relative overflow-hidden">
          {/* Numbered badge overlay */}
          <div className="absolute top-4 left-4 z-10 w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
            #{storyNumber}
          </div>
          
          {/* Image overlay with gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out"></div>
          
          <img 
            className="h-64 w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" 
            src={story.preview_image} 
            alt={story.title} 
            loading="lazy" 
          />
        </div>
        <div className="flex-1 p-8 bg-gradient-to-br from-white via-white to-blue-50/20">
          {/* Story number indicator */}
          <div className="flex items-center mb-4">
            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 mr-2"></div>
            <span className="text-xs font-semibold text-blue-700">Story #{storyNumber}</span>
          </div>
          
          {/* Story title with gradient text */}
          <h3
            className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 mb-4"
            data-aos="fade-up"
            data-aos-delay="40"
          >
            {story.title}
          </h3>
          
          {/* Story preview text */}
          <p
            className="text-base text-gray-600 mb-6 line-clamp-3"
            data-aos="fade-up"
            data-aos-delay="70"
          >
            {story.preview_text}
          </p>
          
          {/* Read blog link with enhanced styling */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <Link
              to={`/story/${story.id}`}
              className="inline-flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:text-indigo-800 font-medium transition-all duration-200 ease-in-out group rounded-full px-5 py-2"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              Read full blog <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessStoryCard;