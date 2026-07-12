import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  ExternalLink, 
  Filter, 
  PlusCircle, 
  Search, 
  Sparkles, 
  Wallet,
  MapPin,
  Clock,
  Video,
  FileText,
  BarChart2,
  Home,
  Check,
  X,
  User,
  LogOut,
  HelpCircle,
  Coins
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface InteractiveDashboardProps {
  user: any;
  setShowAuthForm: (value: boolean) => void;
}

type DemoRole = 'brand' | 'organizer';

interface DemoStep {
  title: string;
  status: string;
}

const roleContent: Record<
  DemoRole,
  {
    label: string;
    heading: string;
    subheading: string;
    cta: string;
    dashboardTabs: string[];
    steps: DemoStep[];
  }
> = {
  brand: {
    label: 'Brand',
    heading: 'Brand Dashboard Simulator',
    subheading: 'Replicates the Brand workflow: manage coin credits, discover events, request matches, and track pending connection contracts.',
    cta: 'Explore Opportunities',
    dashboardTabs: ['Discover Opportunities', 'Influencers', 'Matches'],
    steps: [
      {
        title: 'Discover Events',
        status: 'View active listings matching your audience',
      },
      {
        title: 'Submit Connection Match',
        status: 'Sends connection pitch and holds credit contracts',
      },
      {
        title: 'Check Matches Hub',
        status: 'Tracks contract status and risk analysis reports',
      },
    ],
  },
  organizer: {
    label: 'Event Organizer',
    heading: 'Organizer Dashboard Simulator',
    subheading: 'Replicates the Creator workflow: publish new event parameters, configure pricing structures, and manage incoming sponsor bids.',
    cta: 'Post Your Event',
    dashboardTabs: ['Your Opportunities', 'Brand Matches'],
    steps: [
      {
        title: 'View Listing Status',
        status: 'Check active listings and pending brand match requests',
      },
      {
        title: 'Configure Event Details',
        status: 'Populate dates, reach index, and custom packages',
      },
      {
        title: 'Accept Sponsor Partnership',
        status: 'Accept bids and lock brand sponsorship contracts',
      },
    ],
  },
};

const InteractiveDashboard: React.FC<InteractiveDashboardProps> = ({ user, setShowAuthForm }) => {
  const [role, setRole] = useState<DemoRole>('brand');
  const [activeStep, setActiveStep] = useState(0);
  const [activeBrandTab, setActiveBrandTab] = useState<'discover' | 'matches'>('discover');

  const content = useMemo(() => roleContent[role], [role]);

  // Mock Data definitions (fictional names)
  const brandUser = {
    name: 'Sarah Jenkins',
    role: 'Brand Manager',
    company: 'ApexLabs Inc.',
    avatarLetter: 'S'
  };

  const organizerUser = {
    name: 'Marcus Chen',
    role: 'Lead Organizer',
    company: 'Spark Events Group',
    avatarLetter: 'M'
  };

  const mockOpportunity = {
    title: "VibeFest Carnival 2026",
    location: "Vagator Field, Goa",
    category: "Music & Festivals",
    reach: "65K+ Gen-Z Audience",
    price: "₹8L - ₹20L",
    creator: "Spark Events Group"
  };

  useEffect(() => {
    setActiveStep(0);
    setActiveBrandTab('discover');
  }, [role]);

  // Sync Brand tabs automatically in autoplay
  useEffect(() => {
    if (role === 'brand') {
      if (activeStep === 2) {
        setActiveBrandTab('matches');
      } else {
        setActiveBrandTab('discover');
      }
    }
  }, [activeStep, role]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStep((prev) => (prev + 1) % content.steps.length);
    }, 3800);
    return () => window.clearInterval(timer);
  }, [content.steps.length]);

  return (
    <section className="py-16 bg-[#F8FAFC] relative z-10 border-t border-gray-200" id="interactive-demo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-1.5 mb-5 rounded-full bg-[#2B4B9B]/10 text-[#2B4B9B] border border-[#2B4B9B]/20">
            <Sparkles className="w-4 h-4 mr-2 text-[#2B4B9B]" />
            <span className="text-sm font-semibold">Interactive Product Walkthrough</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-tight">
            Explore Sponsor Studio by{' '}
            <span style={{ background: 'linear-gradient(90deg, #2B4B9B, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              User Role
            </span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-gray-600 leading-relaxed font-light">
            Switch between Brand and Event Organizer views to see exact visual layouts of matching and creation workspaces.
          </p>
        </div>

        {/* Dashboard Mock Panel Container (Cleaner, removed address bar styling) */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-xl p-5 sm:p-6 lg:p-8">
          
          {/* Header role toggles */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="inline-flex bg-gray-55 border border-gray-200 rounded-2xl p-1 shadow-sm">
              <button
                onClick={() => setRole('brand')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  role === 'brand' 
                    ? 'bg-[#2B4B9B] text-white shadow' 
                    : 'text-gray-600 hover:text-[#2B4B9B]'
                }`}
              >
                Brand View
              </button>
              <button
                onClick={() => setRole('organizer')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  role === 'organizer' 
                    ? 'bg-[#2B4B9B] text-white shadow' 
                    : 'text-gray-600 hover:text-[#2B4B9B]'
                }`}
              >
                Event Organizer View
              </button>
            </div>
            <div className="text-xs text-gray-500 font-medium">Auto-playing demo - click any step to inspect</div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Left side: Guide Steps list */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#2B4B9B]">{role === 'brand' ? 'Sponsor Brand' : 'Event Organizer'} Journey</p>
                  <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">{content.heading}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-3">{content.subheading}</p>
                </div>

                <div className="space-y-3">
                  {content.steps.map((step, index) => (
                    <button
                      key={step.title}
                      onClick={() => setActiveStep(index)}
                      className={`w-full text-left rounded-2xl border p-4 transition-all duration-200 ${
                        activeStep === index
                          ? 'bg-[#F1F5F9] border-[#2B4B9B] shadow-sm'
                          : 'bg-white border-gray-200 hover:border-[#2B4B9B]/40 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-[#2B4B9B]">Step {index + 1}</p>
                          <p className="text-sm font-bold text-gray-900 mt-1">{step.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{step.status}</p>
                        </div>
                        {activeStep === index && <CheckCircle2 className="w-4.5 h-4.5 text-success shrink-0" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA links */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  {user ? (
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center px-6 py-3 bg-[#2B4B9B] hover:bg-[#1a2f61] text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-all text-sm"
                    >
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => setShowAuthForm(true)}
                      className="inline-flex items-center px-6 py-3 bg-[#2B4B9B] hover:bg-[#1a2f61] text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-all text-sm"
                    >
                      {content.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  )}
                  <a
                    href="https://demo.sponsorstudio.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-white border border-gray-250 text-[#2B4B9B] font-bold rounded-xl hover:bg-gray-50 hover:scale-105 transition-all text-sm"
                  >
                    Try Live Demo
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </div>
                <p className="text-[10px] text-gray-500">Public demo available without signup</p>
              </div>
            </div>

            {/* Right side: Mock Dashboard Layout */}
            <div className="lg:col-span-7 rounded-2xl border border-gray-200 shadow-xl bg-white flex flex-col overflow-hidden">
              
              {/* Sidebar + Canvas wrapper */}
              <div className="flex flex-row flex-1 min-h-[440px] text-gray-900 bg-gray-50">
                
                {/* Left Sidebar Mock */}
                <div className="w-14 sm:w-48 bg-white border-r border-gray-200 p-3.5 flex flex-col justify-between shrink-0 select-none">
                  <div className="space-y-4">
                    {/* App Logo */}
                    <div className="px-2.5 hidden sm:block">
                      <img 
                        src="https://i.ibb.co/ZzPfwrxP/logo-final-png.png" 
                        alt="Sponsor Studio Logo" 
                        className="h-8 object-contain"
                      />
                    </div>

                    {/* Profile details */}
                    <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="w-7 h-7 rounded-full bg-[#2B4B9B] flex items-center justify-center font-bold text-white text-[11px] shrink-0">
                        {role === 'brand' ? brandUser.avatarLetter : organizerUser.avatarLetter}
                      </div>
                      <div className="hidden sm:block truncate text-left leading-tight">
                        <p className="text-[10px] font-bold text-gray-900 truncate">
                          {role === 'brand' ? brandUser.name : organizerUser.name}
                        </p>
                        <p className="text-[8px] text-gray-500 truncate">
                          {role === 'brand' ? 'brand' : 'Opportunity Provider'}
                        </p>
                      </div>
                    </div>

                    {/* Sidebar Links */}
                    <div className="space-y-1">
                      {[
                        { label: 'Dashboard', icon: Home, active: activeStep < 3 },
                        { label: 'Meetings', icon: Calendar, active: false },
                        role === 'brand'
                          ? { label: 'Reports', icon: FileText, active: false }
                          : { label: 'Analytics', icon: BarChart2, active: false },
                        { label: 'Profile', icon: User, active: false }
                      ].map((tab, i) => {
                        const Icon = tab.icon;
                        return (
                          <div
                            key={i}
                            className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[10px] font-bold ${
                              tab.active 
                                ? 'bg-blue-50 text-[#2B4B9B] border-l-4 border-[#2B4B9B] rounded-l-none' 
                                : 'text-gray-600'
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="hidden sm:inline">{tab.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sign Out link at bottom */}
                  <div className="flex items-center gap-2.5 px-2.5 py-2 text-[10px] font-bold text-red-500">
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </div>
                </div>

                {/* Right Content Canvas ( bg-gray-50 ) */}
                <div className="flex-1 p-5 bg-gray-50 flex flex-col justify-between overflow-y-auto">
                  
                  <div className="space-y-4">
                    
                    {/* ROLE: BRAND WORKFLOWS */}
                    {role === 'brand' && (
                      <>
                        {/* Header bar */}
                        <div className="flex items-center justify-between text-left">
                          <h4 className="text-base font-black text-gray-900">Brand Dashboard</h4>
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <Filter className="w-4 h-4 cursor-pointer hover:text-gray-600" />
                            <Search className="w-4 h-4 cursor-pointer hover:text-gray-600" />
                          </div>
                        </div>

                        {/* Top Credit Bar */}
                        <div className="bg-white border border-gray-200 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-yellow-400/10 flex items-center justify-center border border-yellow-400">
                              <Coins className="w-3.5 h-3.5 text-yellow-500" />
                            </div>
                            <span className="text-xs font-bold text-gray-900">
                              {activeStep === 0 ? '100 credits' : '90 credits'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3.5">
                            <button className="hidden md:flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline bg-transparent border-0 cursor-pointer">
                              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                              How Credits Work
                            </button>
                            <button className="px-3.5 py-1.5 bg-[#2B4B9B] hover:bg-[#1a2f61] text-white text-[10.5px] font-black rounded-lg transition-colors border-0">
                              + Add Credits
                            </button>
                          </div>
                        </div>

                        {/* Discover vs Matches Tabs */}
                        <div className="grid grid-cols-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                          <button 
                            onClick={() => setActiveBrandTab('discover')}
                            className="py-3 text-center border-r border-gray-150 relative bg-transparent border-0 cursor-pointer"
                          >
                            <span className="text-[11px] font-bold block text-gray-800">Discover</span>
                            <span className="text-[9px] text-gray-400 block">Events</span>
                            {activeBrandTab === 'discover' && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                            )}
                          </button>
                          
                          <button 
                            onClick={() => setActiveBrandTab('matches')}
                            className="py-3 text-center relative bg-transparent border-0 cursor-pointer"
                          >
                            <div className="inline-flex items-center gap-1">
                              <span className="text-[11px] font-bold text-gray-800">Matches</span>
                              <span className="px-1.5 py-0.25 text-[8.5px] font-black rounded-full bg-yellow-400 text-gray-950">2</span>
                            </div>
                            <span className="text-[9px] text-gray-400 block">Your Connections</span>
                            {activeBrandTab === 'matches' && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                            )}
                          </button>
                        </div>

                        {/* Screen Content based on Active Tab */}
                        <AnimatePresence mode="wait">
                          {activeBrandTab === 'discover' ? (
                            // Brand Discover Tab Content
                            <motion.div
                              key="discover-tab"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 text-left space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <h5 className="text-xs font-black text-gray-900">{mockOpportunity.title}</h5>
                                <span className="text-[9px] px-2 py-0.5 rounded bg-blue-50 text-[#2B4B9B] border border-blue-100 font-bold uppercase">{mockOpportunity.category}</span>
                              </div>
                              <p className="text-[10px] text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400" /> {mockOpportunity.location}</p>
                              
                              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-[10px]">
                                <div>
                                  <span className="text-gray-500 text-[8px] block uppercase font-bold">Budget Target</span>
                                  <strong className="text-success">{mockOpportunity.price}</strong>
                                </div>
                                <div>
                                  <span className="text-gray-500 text-[8px] block uppercase font-bold">Target Reach</span>
                                  <strong className="text-gray-900">{mockOpportunity.reach}</strong>
                                </div>
                              </div>

                              <p className="text-[10px] text-gray-600 leading-relaxed">
                                {activeStep === 0 ? "Step 1: Check fit, review audience reach stats and complete criteria evaluations." : "Step 2: Submit a Connection Match proposal (deducts 10 credits)."}
                              </p>

                              <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
                                <span className="text-[9.5px] text-[#2B4B9B] font-bold">Fit Score: 96%</span>
                                <div className="flex items-center gap-1.5">
                                  <button type="button" className="px-2.5 py-1 text-[9.5px] font-bold rounded-lg border border-gray-200 text-gray-600 bg-white">Pass</button>
                                  <button type="button" className="px-2.5 py-1 text-[9.5px] font-bold rounded-lg bg-[#2B4B9B] text-white border-0">Connect</button>
                                </div>
                              </div>
                            </motion.div>
                          ) : (
                            // Brand Matches Tab Content ( yellow bg cards )
                            <motion.div
                              key="matches-tab"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="text-left space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <h5 className="text-xs font-bold text-gray-900">Your Matches</h5>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-yellow-600 font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                <span>Pending Response</span>
                              </div>

                              <div className="space-y-2.5">
                                {[
                                  { name: organizerUser.name, interested: 'VibeFest Carnival 2026', date: '24/06/2026', hasAnalysis: false },
                                  { name: organizerUser.name, interested: 'EcoFuture Summit 2026', date: '24/06/2026', hasAnalysis: true }
                                ].map((match, idx) => (
                                  <div key={idx} className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-900">{match.name}</span>
                                        <span className="px-2 py-0.5 text-[9px] rounded-full bg-yellow-100 text-yellow-800 font-bold">Pending</span>
                                      </div>
                                      <p className="text-[10px] text-gray-500">Interested in: <strong className="text-gray-700">{match.interested}</strong></p>
                                      <p className="text-[9px] text-gray-400">Sent: {match.date}</p>
                                    </div>

                                    <div>
                                      {match.hasAnalysis ? (
                                        <button className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#2B4B9B] text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer">
                                          <FileText className="w-3 h-3" />
                                          Request Risk Analysis
                                        </button>
                                      ) : (
                                        <button className="px-3 py-1.5 bg-gray-100 border border-gray-200 text-gray-550 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-not-allowed" disabled>
                                          <FileText className="w-3 h-3 text-gray-450" />
                                          Requested
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}

                    {/* ROLE: ORGANIZER WORKFLOWS */}
                    {role === 'organizer' && (
                      <>
                        {/* Header bar */}
                        <div className="flex items-center justify-between text-left">
                          <h4 className="text-base font-black text-gray-900">Opportunity Dashboard</h4>
                          <button className="px-3.5 py-1.5 bg-[#2B4B9B] hover:bg-[#1a2f61] text-white text-[10.5px] font-black rounded-lg flex items-center gap-1 border-0">
                            <PlusCircle className="w-3.5 h-3.5" />
                            Create Opportunity
                          </button>
                        </div>

                        {/* Top Stats Cards Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-left">
                          {[
                            { label: 'Total Opportunities', value: activeStep === 0 ? '0' : '1', sub: activeStep === 0 ? '0 active' : '1 active', tone: 'blue' },
                            { label: 'Pending Matches', value: activeStep === 2 ? '0' : '1', sub: activeStep === 2 ? 'Awaiting action' : 'Awaiting your response', tone: 'yellow' },
                            { label: 'Accepted Matches', value: activeStep === 2 ? '1' : '0', sub: activeStep === 2 ? '1 partnership' : 'Confirmed partnerships', tone: 'green' },
                            { label: 'Rejected Matches', value: '0', sub: 'Declined partnerships', tone: 'red' },
                          ].map((st, i) => (
                            <div 
                              key={i} 
                              className={`bg-white border rounded-xl p-3 flex flex-col justify-between ${
                                st.tone === 'blue' ? 'border-blue-200' :
                                st.tone === 'yellow' ? 'border-yellow-200' :
                                st.tone === 'green' ? 'border-emerald-200' : 'border-red-200'
                              }`}
                            >
                              <div>
                                <p className="text-[8.5px] font-bold text-gray-500 uppercase tracking-wide leading-tight">{st.label}</p>
                                <strong className="text-lg font-black text-gray-900 block mt-1">{st.value}</strong>
                              </div>
                              <span className="text-[7.5px] text-gray-400 block mt-1.5 leading-none">{st.sub}</span>
                            </div>
                          ))}
                        </div>

                        {/* Opportunities vs Matches Tabs (Highlights active tab correctly) */}
                        <div className="flex border-b border-gray-200">
                          <button className={`px-4 py-2 text-[11px] font-bold ${
                            activeStep < 2 
                              ? 'text-[#2B4B9B] border-b-2 border-[#2B4B9B]' 
                              : 'text-gray-500 border-0'
                          } bg-transparent border-0 cursor-pointer`}>
                            Your Opportunities
                          </button>
                          <button className={`px-4 py-2 text-[11px] font-bold ${
                            activeStep === 2 
                              ? 'text-[#2B4B9B] border-b-2 border-[#2B4B9B]' 
                              : 'text-gray-500 border-0'
                          } bg-transparent border-0 cursor-pointer`}>
                            Brand Matches
                          </button>
                        </div>

                        {/* Content canvas simulation based on active steps */}
                        <AnimatePresence mode="wait">
                          {activeStep === 0 && (
                            // Empty State view
                            <motion.div
                              key="empty-state"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-sm"
                            >
                              <div className="w-12 h-12 rounded-full bg-gray-150 flex items-center justify-center text-gray-450">
                                <PlusCircle className="w-6 h-6" />
                              </div>
                              <div className="space-y-1">
                                <h5 className="text-xs font-bold text-gray-950">No Opportunities Yet</h5>
                                <p className="text-[10px] text-gray-500 max-w-xs leading-normal">Create your first Opportunity to start connecting with brands.</p>
                              </div>
                              <button className="px-4 py-2 bg-[#2B4B9B] text-white text-[10.5px] font-black rounded-lg shadow-sm border-0">
                                Create Opportunity
                              </button>
                            </motion.div>
                          )}

                          {activeStep === 1 && (
                            // Create New Opportunity Form view
                            <motion.div
                              key="creation-form"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="bg-white border border-gray-250 rounded-2xl p-4 text-left space-y-4 shadow-sm text-[10px]"
                            >
                              <div className="border-b border-gray-100 pb-2">
                                <h5 className="text-xs font-black text-gray-950">Create New Opportunity</h5>
                                <p className="text-[8.5px] text-gray-500">Fill in the details to create a new opportunity</p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-8 space-y-3">
                                  {/* Title, Category, Location */}
                                  <div className="grid grid-cols-2 gap-2.5">
                                    <div className="space-y-1">
                                      <label className="font-bold text-gray-700">Title <span className="text-red-500">*</span></label>
                                      <input type="text" placeholder="Enter opportunity title" className="w-full p-2 border border-gray-200 rounded-lg text-[9.5px]" defaultValue="Campus Spark Carnival 2026" />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="font-bold text-gray-700">Category <span className="text-red-500">*</span></label>
                                      <select className="w-full p-2 border border-gray-200 rounded-lg text-[9.5px] bg-white">
                                        <option>Music &amp; Festivals</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2.5">
                                    <div className="space-y-1">
                                      <label className="font-bold text-gray-700">Location <span className="text-red-500">*</span></label>
                                      <input type="text" placeholder="Enter location" className="w-full p-2 border border-gray-200 rounded-lg text-[9.5px]" defaultValue="Mumbai, MH" />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="font-bold text-gray-700">Reach (Audience Size)</label>
                                      <input type="text" placeholder="Expected audience size" className="w-full p-2 border border-gray-200 rounded-lg text-[9.5px]" defaultValue="25,000" />
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="font-bold text-gray-700">Description <span className="text-red-500">*</span></label>
                                    <textarea placeholder="Describe your opportunity in detail" rows={2} className="w-full p-2 border border-gray-200 rounded-lg text-[9.5px]" defaultValue="Premium ground activation for brands targeting college-going youth demographics." />
                                  </div>
                                </div>

                                {/* Pricing plan right block */}
                                <div className="md:col-span-4 bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-[#2B4B9B]">Pricing Plan</span>
                                    <span className="text-[8.5px] px-1.5 py-0.25 rounded bg-[#2B4B9B] text-white font-bold">Basic</span>
                                  </div>
                                  <ul className="list-disc pl-3 text-[8.5px] text-gray-600 space-y-1">
                                    <li>Free event listing</li>
                                    <li>₹5,00,000 threshold limit</li>
                                    <li>10% standard matching fee</li>
                                  </ul>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {activeStep === 2 && (
                            // Brand Matches list tab for Step 3 ( exact screenshot design style )
                            <motion.div
                              key="brand-matches-tab"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="text-left space-y-3"
                            >
                              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Confirmed Partnerships</span>
                              </div>

                              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
                                <div className="space-y-1 bg-transparent">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-900">{brandUser.company}</span>
                                    <span className="px-2 py-0.5 text-[9px] rounded-full bg-emerald-100 text-emerald-800 font-bold">Accepted</span>
                                  </div>
                                  <p className="text-[10px] text-gray-500">Interested in: <strong className="text-gray-700">Campus Spark Carnival 2026</strong></p>
                                  <p className="text-[9px] text-gray-400">Locked package: Title Sponsor (₹6,00,000)</p>
                                </div>

                                <button className="px-3.5 py-1.5 bg-[#2B4B9B] text-white text-[10px] font-bold rounded-lg border-0 cursor-pointer">
                                  Download Contract
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}

                  </div>

                  {/* Bullet progress indicators */}
                  <div className="mt-4 flex gap-1.5 justify-center">
                    {content.steps.map((step, index) => (
                      <button
                        key={step.title}
                        onClick={() => setActiveStep(index)}
                        className={`h-1.5 rounded-full transition-all ${
                          activeStep === index ? 'w-8 bg-[#2B4B9B]' : 'w-4 bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to ${step.title}`}
                      />
                    ))}
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default InteractiveDashboard;
