import React, { useEffect, useMemo, useState } from 'react';
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
} from 'lucide-react';
import type { User } from './Home';

interface InteractiveDemoProps {
  user: User | null;
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
    topStats: { label: string; value: string; tone?: string }[];
    dashboardTabs: string[];
    steps: DemoStep[];
  }
> = {
  brand: {
    label: 'Brand',
    heading: 'Brand Dashboard Preview',
    subheading: 'Built to resemble the real Brand dashboard layout: credits, filters, tabs, and swipe-style opportunity cards.',
    cta: 'Explore Opportunities',
    topStats: [
      { label: 'Credits', value: '450', tone: 'blue' },
      { label: 'Pending Matches', value: '3', tone: 'yellow' },
      { label: 'Meetings', value: '2', tone: 'green' },
    ],
    dashboardTabs: ['Discover', 'Influencers', 'Matches'],
    steps: [
      {
        title: 'Discover Events',
        status: '12 matching events',
      },
      {
        title: 'Send Pitch',
        status: '3 pitches sent',
      },
      {
        title: 'Schedule Meeting',
        status: '2 meetings confirmed',
      },
    ],
  },
  organizer: {
    label: 'Event Organizer',
    heading: 'Event Organizer Dashboard Preview',
    subheading: 'Built to resemble the real Opportunity Dashboard: create opportunity, stats cards, tabs, and event cards.',
    cta: 'Post Your Event',
    topStats: [
      { label: 'Live Opportunities', value: '4', tone: 'blue' },
      { label: 'Pending Pitches', value: '7', tone: 'yellow' },
      { label: 'Accepted Brands', value: '2', tone: 'green' },
    ],
    dashboardTabs: ['Opportunities', 'Matches'],
    steps: [
      {
        title: 'Create Opportunity',
        status: 'Opportunity live',
      },
      {
        title: 'Review Pitches',
        status: '7 brand pitches',
      },
      {
        title: 'Close Sponsor',
        status: '1 sponsor accepted',
      },
    ],
  },
};

const InteractiveDemo: React.FC<InteractiveDemoProps> = ({ user, setShowAuthForm }) => {
  const [role, setRole] = useState<DemoRole>('brand');
  const [activeStep, setActiveStep] = useState(0);

  const content = useMemo(() => roleContent[role], [role]);

  useEffect(() => {
    setActiveStep(0);
  }, [role]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStep((prev) => (prev + 1) % content.steps.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [content.steps.length]);

  return (
    <section className="py-16 bg-white relative z-10" id="interactive-demo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-4 py-1.5 mb-5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            <Sparkles className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Interactive Product Walkthrough</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            Explore Sponsor Studio by Role
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg sm:text-xl text-gray-600 leading-relaxed font-light">
            Switch between Brand and Event Organizer journeys to preview how matching and deal flow works.
          </p>
        </div>

        <div className="bg-gradient-to-br from-white via-blue-50/70 to-indigo-50/60 border border-blue-100 rounded-3xl shadow-xl p-5 sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="inline-flex bg-white border border-gray-200 rounded-full p-1 shadow-sm">
              <button
                onClick={() => setRole('brand')}
                className={`px-4 sm:px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  role === 'brand' ? 'bg-[#2B4B9B] text-white shadow' : 'text-gray-600 hover:text-[#2B4B9B]'
                }`}
              >
                Brand View
              </button>
              <button
                onClick={() => setRole('organizer')}
                className={`px-4 sm:px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  role === 'organizer' ? 'bg-[#2B4B9B] text-white shadow' : 'text-gray-600 hover:text-[#2B4B9B]'
                }`}
              >
                Event Organizer View
              </button>
            </div>
            <div className="text-sm text-gray-500 font-medium">Auto-playing demo - click any step to inspect</div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#2B4B9B]">{content.label} Journey</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{content.heading}</h3>
                <p className="text-gray-600 mt-3">{content.subheading}</p>
              </div>

              <div className="space-y-3">
                {content.steps.map((step, index) => (
                  <button
                    key={step.title}
                    onClick={() => setActiveStep(index)}
                    className={`w-full text-left rounded-2xl border p-4 transition-all ${
                      activeStep === index
                        ? 'bg-white border-[#2B4B9B] shadow-md'
                        : 'bg-white/70 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#2B4B9B]">Step {index + 1}</p>
                        <p className="text-base font-semibold text-gray-900 mt-0.5">{step.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{step.status}</p>
                      </div>
                      {activeStep === index && <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {user ? (
                  <a
                    href="/dashboard"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                ) : (
                  <button
                    onClick={() => setShowAuthForm(true)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all"
                  >
                    {content.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                )}
                <a
                  href="https://demo.sponsorstudio.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-white border border-blue-200 text-[#2B4B9B] font-semibold rounded-xl hover:bg-blue-50 transition-all"
                >
                  Try Live Demo
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
              <p className="text-xs text-gray-500">Public demo available without signup</p>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-lg p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-gray-800">{role === 'brand' ? 'Brand Dashboard Preview' : 'Opportunity Dashboard Preview'}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">Live Simulation</span>
              </div>

              {role === 'brand' ? (
                <>
                  <div className="bg-white border border-gray-100 rounded-xl p-3 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Wallet className="w-4 h-4 text-[#2B4B9B]" />
                      <span className="text-sm font-semibold">Credits Available</span>
                    </div>
                    <span className="text-lg font-bold text-[#2B4B9B]">{content.topStats[0].value}</span>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-xl p-3 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Search className="w-4 h-4 text-[#2B4B9B]" />
                      <span className="text-sm font-medium">Search Opportunities</span>
                    </div>
                    <Filter className="w-4 h-4 text-gray-500" />
                  </div>
                </>
              ) : (
                <div className="bg-white border border-gray-100 rounded-xl p-3 mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">Opportunity Dashboard</span>
                  <button className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#2B4B9B] text-white text-xs font-semibold">
                    <PlusCircle className="w-3.5 h-3.5 mr-1" />
                    Create Opportunity
                  </button>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 mb-3">
                {content.topStats.map((stat) => (
                  <div
                    key={stat.label}
                    className={`rounded-lg border p-2.5 ${
                      stat.tone === 'yellow'
                        ? 'bg-yellow-50 border-yellow-100'
                        : stat.tone === 'green'
                        ? 'bg-green-50 border-green-100'
                        : 'bg-blue-50 border-blue-100'
                    }`}
                  >
                    <p className="text-[11px] text-gray-500">{stat.label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
                {content.dashboardTabs.map((tab) => (
                  <div
                    key={tab}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                      (role === 'brand' && ((activeStep === 0 && tab === 'Discover') || (activeStep > 0 && tab === 'Matches'))) ||
                      (role === 'organizer' && ((activeStep === 0 && tab === 'Opportunities') || (activeStep > 0 && tab === 'Matches')))
                        ? 'bg-[#2B4B9B] text-white'
                        : 'bg-white border border-gray-200 text-gray-600'
                    }`}
                  >
                    {tab}
                  </div>
                ))}
              </div>

              {role === 'brand' ? (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900">Tech Summit 2026</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">Active</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Bengaluru . Reach 40K+ . Budget 2L - 5L</p>
                  <p className="text-sm text-gray-600 mt-3">
                    {activeStep === 0 && 'Browsing event opportunity details and checking fit for brand campaign goals.'}
                    {activeStep === 1 && 'Pitch sent to organizer. Match request is pending response.'}
                    {activeStep === 2 && 'Match accepted. Meeting scheduled with organizer for discussion.'}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-[#2B4B9B] font-semibold">
                      {activeStep === 0 ? 'Fit score: 92%' : activeStep === 1 ? 'Credits used: 50' : 'Meeting: Tomorrow 11:30 AM'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600">Reject</button>
                      <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2B4B9B] text-white">Match</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900">Startup Connect 2026</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">Opportunity</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Business Category . Reach 50K+ . Status: Active</p>
                  <p className="text-sm text-gray-600 mt-3">
                    {activeStep === 0 && 'Creating and publishing an opportunity with sponsorship brochure and pricing details.'}
                    {activeStep === 1 && 'Reviewing incoming brand pitches and checking profile fit before decision.'}
                    {activeStep === 2 && 'Sponsor accepted and meeting phase initiated for final closure.'}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-[#2B4B9B] font-semibold">
                      {activeStep === 0 ? 'Verification: Pending' : activeStep === 1 ? 'Pitches: 7 incoming' : 'Sponsor: Alpha Ventures'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600">Decline</button>
                      <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2B4B9B] text-white">Accept</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                {content.steps.map((step, index) => (
                  <button
                    key={step.title}
                    onClick={() => setActiveStep(index)}
                    className={`h-2 rounded-full transition-all ${
                      activeStep === index ? 'w-10 bg-[#2B4B9B]' : 'w-5 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to ${step.title}`}
                  />
                ))}
              </div>

              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 border border-green-100 text-green-700">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                {content.steps[activeStep].status}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemo;
