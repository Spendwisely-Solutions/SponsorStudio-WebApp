// Open roles on the careers page. Remove a role when it's filled; the page shows
// a "no open roles" note when this list is empty.

export type Role = {
  id: string;
  title: string;
  team: string;
  location: string;
  type: string;
  summary: string;
  responsibilities: string[];
  lookingFor: string[];
};

export const roles: Role[] = [
  {
    id: 'business-development-associate',
    title: 'Business Development Associate',
    team: 'Partnerships',
    location: 'In office',
    type: 'Full-time',
    summary:
      'Bring brands and event organisers onto Sponsor Studio, and help them turn a first conversation into a signed sponsorship.',
    responsibilities: [
      'Find and reach out to brands and event organisers that fit the platform',
      'Run introductory calls and demos, and follow up until deals close',
      'Help organisers prepare listings and proposals that sponsors respond to',
      'Keep the pipeline and deal notes up to date',
    ],
    lookingFor: [
      'Clear, confident communication in English; other Indian languages are a plus',
      'Interest in sales, marketing or the events industry',
      'Organised and comfortable with targets and follow-ups',
    ],
  },
  {
    id: 'social-media-manager',
    title: 'Social Media Manager',
    team: 'Marketing',
    location: 'In office',
    type: 'Full-time',
    summary: 'Own how Sponsor Studio shows up on Instagram, LinkedIn and beyond, for both brands and event organisers.',
    responsibilities: [
      'Plan and publish content across Instagram, LinkedIn and Facebook',
      'Turn partnerships, events and success stories into posts, reels and carousels',
      'Work with the team on campaigns, launches and The Backdrop newsletter',
      'Track what performs and report on growth each month',
    ],
    lookingFor: [
      'A portfolio of social content you have created or managed',
      'Good writing and a feel for design and short-form video',
      'Familiarity with scheduling and analytics tools',
    ],
  },
];
