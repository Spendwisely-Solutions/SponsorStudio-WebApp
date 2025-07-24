import React from 'react'


function NotFound() {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 overflow-hidden">
      {/* Animated Gradient Background - HeroSection theme */}
      <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-blue-200/40 via-indigo-100/40 to-purple-100/40 opacity-90"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-indigo-300/30 rounded-full blur-3xl animate-pulse opacity-60" style={{animationDuration: '4s'}}></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-200/40 to-pink-300/30 rounded-full blur-3xl animate-pulse opacity-60" style={{animationDuration: '6s', animationDelay: '2s'}}></div>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.8) 1px, transparent 0)`, backgroundSize: '50px 50px'}}></div>

      <div className="z-10 flex flex-col items-center text-center animate-fadein">
        <h1 className="text-7xl sm:text-8xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 animate-slidein drop-shadow-lg">404</h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 animate-fadein2">Page Not Found</h2>
        <p className="text-lg sm:text-xl text-gray-600 mb-8 animate-fadein3 max-w-xl">Sorry, the page you are looking for does not exist or has been moved. Let's get you back on track!</p>
        <a
          href="/"
          className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all text-lg animate-fadein3"
        >
          Go to Home
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
      `}</style>
    </div>
  );
}

export default NotFound
