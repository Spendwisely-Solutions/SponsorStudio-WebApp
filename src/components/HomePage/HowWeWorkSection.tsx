import React, { useState } from 'react';
import { Play } from 'lucide-react';

const HowWeWorkSection: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  
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
          <div className="inline-flex items-center px-6 py-3 mb-8 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-blue-100/50">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-3 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-800">Platform Overview</span>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-600">See how it works</span>
              </div>
            </div>
          </div>
          
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            How We Work
          </h2>
          
          {/* Feature badges */}
          <div className="flex flex-wrap gap-3 justify-center mt-8 mb-10">
            <div className="feature-badge flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-200/50 shadow-sm">
              <span className="text-sm font-medium text-blue-800">Simple Process</span>
            </div>
            <div className="feature-badge flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200/50 shadow-sm">
              <span className="text-sm font-medium text-green-800">Smart Technology</span>
            </div>
            <div className="feature-badge flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-full border border-purple-200/50 shadow-sm">
              <span className="text-sm font-medium text-purple-800">Proven Results</span>
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
          {/* Video container with aspect ratio */}
          <div className="relative pb-[56.25%] bg-gray-900">
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
            >
              <source src="https://storage.googleapis.com/webfundamentals-assets/videos/chrome.webm" type="video/webm" />
              <source src="https://storage.googleapis.com/webfundamentals-assets/videos/chrome.mp4" type="video/mp4" />
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