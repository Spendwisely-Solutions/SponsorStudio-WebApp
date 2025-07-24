import React from 'react';

const jobs = [
  {
    title: 'Frontend Developer',
    location: 'Remote',
    type: 'Full-time',
    description: 'Build beautiful, scalable UIs with React and Tailwind. Collaborate with designers and backend engineers to deliver a seamless user experience.',
    applyLink: '#',
  },
  {
    title: 'Backend Engineer',
    location: 'Bangalore, India',
    type: 'Full-time',
    description: 'Design and implement robust APIs and scalable backend systems. Experience with Node.js and cloud platforms preferred.',
    applyLink: '#',
  },
  {
    title: 'Product Designer',
    location: 'Remote',
    type: 'Contract',
    description: 'Shape the look and feel of SponsorStudio. Work closely with product and engineering to create delightful experiences.',
    applyLink: '#',
  },
];

export default function CareerPage() {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col justify-center items-center px-4 sm:px-8 py-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Animated Gradient Background - HeroSection theme */}
      <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-blue-200/40 via-indigo-100/40 to-purple-100/40 opacity-90"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-indigo-300/30 rounded-full blur-3xl animate-pulse opacity-60" style={{animationDuration: '4s'}}></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-200/40 to-pink-300/30 rounded-full blur-3xl animate-pulse opacity-60" style={{animationDuration: '6s', animationDelay: '2s'}}></div>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.8) 1px, transparent 0)`, backgroundSize: '50px 50px'}}></div>

      {/* Hero Section */}
      <div className="max-w-3xl mx-auto text-center mb-10 animate-fadein">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-4 drop-shadow-lg animate-slidein">Join SponsorStudio</h1>
        <p className="text-xl sm:text-2xl text-gray-700 mb-2 animate-fadein2">We're building the future of sponsorships. Come shape it with us.</p>
        <p className="text-base text-gray-500 animate-fadein3">We value creativity, collaboration, and a passion for making a difference. Explore our open roles below!</p>
      </div>

      {/* Job Listings with animation */}
      <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job, idx) => (
          <div
            key={idx}
            className={`bg-white/90 rounded-2xl shadow-xl hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 p-7 flex flex-col justify-between border border-blue-100/40 animate-cardin backdrop-blur-md`}
            style={{animationDelay: `${0.2 + idx * 0.15}s`}}
          >
            <div>
              <h2 className="text-2xl font-bold text-blue-800 mb-2 animate-fadein2">{job.title}</h2>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <span className="mr-3"><span className="font-medium text-blue-700">{job.location}</span></span>
                <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{job.type}</span>
              </div>
              <p className="text-gray-700 mb-4 text-sm animate-fadein3">{job.description}</p>
            </div>
            <a
              href={job.applyLink}
              className="mt-auto inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-5 py-2 rounded-xl transition-all text-center shadow-md animate-fadein3"
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply Now
            </a>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="max-w-2xl mx-auto mt-14 text-center animate-fadein3">
        <p className="text-gray-700 text-base mb-2">Don't see a role that fits? We're always looking for talented people!</p>
        <a
          href="mailto:careers@sponsorstudio.com"
          className="inline-block bg-gradient-to-r from-blue-100/80 to-indigo-100/80 hover:from-blue-200/90 hover:to-indigo-200/90 text-blue-800 font-semibold px-6 py-2 rounded-xl transition-all shadow"
        >
          Email us your profile
        </a>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes gradient {
          0%, 100% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .animate-pulse {
          animation: pulse 4s cubic-bezier(.4,0,.2,1) infinite;
        }
        @keyframes float {
          0%, 100% {transform: translateY(0) scale(1);}
          50% {transform: translateY(-30px) scale(1.05);}
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes fadein {
          from {opacity: 0; transform: translateY(20px);}
          to {opacity: 1; transform: translateY(0);}
        }
        .animate-fadein {
          animation: fadein 0.8s cubic-bezier(.4,0,.2,1) both;
        }
        .animate-fadein2 {
          animation: fadein 1.2s cubic-bezier(.4,0,.2,1) both;
        }
        .animate-fadein3 {
          animation: fadein 1.6s cubic-bezier(.4,0,.2,1) both;
        }
        @keyframes slidein {
          from {opacity: 0; transform: translateY(-40px) scale(0.95);}
          to {opacity: 1; transform: translateY(0) scale(1);}
        }
        .animate-slidein {
          animation: slidein 1.1s cubic-bezier(.4,0,.2,1) both;
        }
        @keyframes cardin {
          from {opacity: 0; transform: scale(0.95) translateY(30px);}
          to {opacity: 1; transform: scale(1) translateY(0);}
        }
        .animate-cardin {
          animation: cardin 1s cubic-bezier(.4,0,.2,1) both;
        }
      `}</style>
    </div>
  );
}
