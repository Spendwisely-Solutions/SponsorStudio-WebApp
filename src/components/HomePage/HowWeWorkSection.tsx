import React, { useState } from 'react';
import { Play } from 'lucide-react';

const HowWeWorkSection: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoType, setVideoType] = useState<'brands' | 'providers'>('brands');

  // Video sources
  const videoSources = {
    brands: [
      { src: '', type: 'video/webm' },
      { src: '', type: 'video/mp4' }
    ],
    providers: [
      { src: '', type: 'video/webm' },
      { src: '', type: 'video/mp4' }
    ]
  };

  const handlePlayVideo = () => {
    setIsPlaying(true);
    const videoElement = document.getElementById('howWeWorkVideo') as HTMLVideoElement;
    if (videoElement) {
      videoElement.play();
    }
  };

  return (
    <section className="py-20 bg-white relative z-10" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id='about-video'>
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-1.5 mb-8 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
            <span className="text-sm font-medium">Platform Overview</span>
          </div>
          
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            How We Work
          </h2>
          {/* Pill-style toggle for video type with explanation */}
          <div className="flex flex-col items-center mt-8 mb-4">
            <span className="mb-2 text-base text-gray-700 font-medium">Are you a</span>
            <div className="relative flex items-center w-80 h-12 bg-gray-100 rounded-full shadow-inner border border-gray-200">
              <span
                className="absolute top-1 left-1 h-10 rounded-full transition-all duration-300 shadow-md"
                style={{
                  background: '#2563eb',
                  transform: videoType === 'brands' ? 'translateX(0)' : 'translateX(160px)',
                  width: 'calc(50% - 12px)',
                  zIndex: 1,
                }}
              ></span>
              <button
                className={`flex-1 h-full rounded-full font-medium text-base z-10 transition-colors duration-200 focus:outline-none ${videoType === 'brands' ? 'text-white' : 'text-blue-700'}`}
                style={{ background: 'transparent', marginRight: '2px' }}
                onClick={() => { setVideoType('brands'); setIsPlaying(false); }}
              >
                Brand
              </button>
              <button
                className={`flex-1 h-full rounded-full font-medium text-base z-10 transition-colors duration-200 focus:outline-none ${videoType === 'providers' ? 'text-white' : 'text-blue-700'}`}
                style={{ background: 'transparent', marginLeft: '2px' }}
                onClick={() => { setVideoType('providers'); setIsPlaying(false); }}
              >
                Event
              </button>
            </div>
          </div>
          
          
          <p
            className="mt-6 max-w-2xl mx-auto text-xl sm:text-2xl text-gray-600 leading-relaxed font-light"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Watch our quick overview of the Sponsor Studio platform and discover how we connect brands with event organizers
          </p>
        </div>
        
        <div 
          className="relative rounded-2xl overflow-hidden shadow-2xl"
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-delay="200"
         
        >
          {/* Video container with reduced height (16:7 aspect ratio) */}
          <div className="relative bg-gray-900 pb-[43.75%]">
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 backdrop-blur-sm"></div>
                <button 
                  onClick={handlePlayVideo}
                  className="relative z-20 w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30"
                >
                  <div className="ml-2">
                    <Play fill="white" size={32} className="text-white" />
                  </div>
                </button>
                <div className="absolute bottom-8 left-0 right-0 text-center">
                  <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">See how our platform connects brands and events</h3>
                </div>
              </div>
            )}
            
            <video 
              id="howWeWorkVideo"
              className="absolute inset-0 w-full h-full object-cover"
              poster="/dashboard-mockup.png"
              controls={isPlaying}
              playsInline
              preload="metadata"
              key={videoType}
            >
              {videoSources[videoType].map((source, idx) => (
                <source key={source.type + idx} src={source.src} type={source.type} />
              ))}
              Your browser does not support the video tag.
            </video>
          </div>
          
          {/* Video highlights below */}
          <div className="bg-white py-6 px-4 sm:px-8">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="font-bold text-blue-700 text-lg">Easy Setup</div>
                <p className="text-sm text-gray-600">Create your profile in minutes</p>
              </div>
              <div className="text-center p-4">
                <div className="font-bold text-blue-700 text-lg">Smart Matching</div>
                <p className="text-sm text-gray-600">Find your perfect partners</p>
              </div>
              <div className="text-center p-4">
                <div className="font-bold text-blue-700 text-lg">Secure Deals</div>
                <p className="text-sm text-gray-600">Manage contracts and payments</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowWeWorkSection;