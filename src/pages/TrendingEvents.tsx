import { useState } from 'react'
import Footer from '../components/HomePage/Footer'
import TrendingEvents from '../components/HomePage/TrendingEvents'
import NavBar from '../components/HomePage/NavBar'
import { Helmet } from 'react-helmet-async'

function Trending() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const customNavLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/how-we-work' },
    { label: 'Faq', to: '/faq' },
  ];

  return (
    <>
    <Helmet>
      <title>Trending Events - Sponsor Studio | Latest Sponsorship Opportunities</title>
      <meta name="description" content="Explore trending sponsorship opportunities and events on Sponsor Studio. Discover the latest partnerships between brands and event organizers across various industries." />
      <meta name="keywords" content="trending events, sponsorship opportunities, event partnerships, brand collaborations, event marketing, sponsorship deals, latest events" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.sponsorstudio.in/trending-events" />
      <meta property="og:title" content="Trending Events - Sponsor Studio | Latest Sponsorship Opportunities" />
      <meta property="og:description" content="Explore trending sponsorship opportunities and events on Sponsor Studio. Discover the latest partnerships between brands and event organizers across various industries." />
      <meta property="og:image" content="https://www.sponsorstudio.in/sponsor_studio_logo.png" />
      <meta property="og:site_name" content="Sponsor Studio" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://www.sponsorstudio.in/trending-events" />
      <meta property="twitter:title" content="Trending Events - Sponsor Studio | Latest Sponsorship Opportunities" />
      <meta property="twitter:description" content="Explore trending sponsorship opportunities and events on Sponsor Studio. Discover the latest partnerships between brands and event organizers across various industries." />
      <meta property="twitter:image" content="https://www.sponsorstudio.in/sponsor_studio_logo.png" />

      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Sponsor Studio" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href="https://www.sponsorstudio.in/trending-events" />
      
      {/* Event-specific structured data hints */}
      <meta name="category" content="Events" />
      <meta name="classification" content="Business, Marketing, Events" />
    </Helmet>
    
    <NavBar 
      user={null}
      profile={null}
      isProfileComplete={false}
      setShowAuthForm={() => {}}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
      hideAuthButton={true}
      navLinks={customNavLinks}
    />
    <div className="h-10"></div>
    <TrendingEvents showAuthForm={() => {}} />
    <Footer />
    </>
  )
}

export default Trending
