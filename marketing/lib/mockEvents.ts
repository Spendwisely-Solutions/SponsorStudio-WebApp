// Fictional events and brands for the homepage product demos. None of these are
// real listings or customers.
// Photos in public/mock are from Unsplash (free under the Unsplash licence, no
// attribution required). Source photo IDs: concert 1470229722913, festival
// 1492684223066, edm 1514525253161, marathon 1461896836934, summit 1540575467063,
// conference 1531058020387, gala 1511795409834, keynote 1505373877841.

export type MockEvent = {
  id: string;
  title: string;
  city: string;
  dates: string;
  category: string;
  reach: string;
  price: string;
  image: string;
};

export const mockEvents: MockEvent[] = [
  {
    id: 'vibefest',
    title: 'VibeFest Carnival 2026',
    city: 'Vagator, Goa',
    dates: '12–14 Dec',
    category: 'Music festival',
    reach: '65K attendees',
    price: '₹8L–₹20L',
    image: '/mock/festival.jpg',
  },
  {
    id: 'founders-summit',
    title: 'Bengaluru Founders Summit',
    city: 'Bengaluru, KA',
    dates: '7–8 Nov',
    category: 'Startup conference',
    reach: '4,500 founders',
    price: '₹3L–₹9L',
    image: '/mock/summit.jpg',
  },
  {
    id: 'coastal-run',
    title: 'Kochi Coastal Half Marathon',
    city: 'Kochi, KL',
    dates: '18 Jan',
    category: 'Sports',
    reach: '12K runners',
    price: '₹2L–₹6L',
    image: '/mock/marathon.jpg',
  },
  {
    id: 'neon-nights',
    title: 'Neon Nights EDM',
    city: 'Pune, MH',
    dates: '21 Feb',
    category: 'Nightlife',
    reach: '18K attendees',
    price: '₹4L–₹10L',
    image: '/mock/edm.jpg',
  },
  {
    id: 'campus-spark',
    title: 'Campus Spark Carnival',
    city: 'Mumbai, MH',
    dates: '3–5 Mar',
    category: 'College fest',
    reach: '25K students',
    price: '₹1.5L–₹6L',
    image: '/mock/concert.jpg',
  },
  {
    id: 'design-gala',
    title: 'Delhi Design Week Gala',
    city: 'New Delhi, DL',
    dates: '14 Mar',
    category: 'Corporate gala',
    reach: '900 guests',
    price: '₹2L–₹5L',
    image: '/mock/gala.jpg',
  },
];

export const mockBrands = [
  { name: 'Northwind Beverages', category: 'Food and drink', initial: 'N' },
  { name: 'Kora Audio', category: 'Consumer electronics', initial: 'K' },
  { name: 'Lumen Pay', category: 'Fintech', initial: 'L' },
  { name: 'Zestly Foods', category: 'FMCG', initial: 'Z' },
];

export const mockEvent = (id: string) => mockEvents.find((event) => event.id === id)!;
