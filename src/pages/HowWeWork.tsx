import Footer from "../components/HomePage/Footer"
import HowItWorks from "../components/HomePage/HowItWorks"
import NavBar from "../components/HomePage/NavBar"
import { useState } from "react"
import { Helmet } from "react-helmet-async"

function HowWeWork() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const customNavLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/how-we-work' },
    { label: 'Faq', to: '/faq' },
    { label: 'Blogs', to: '/blogs' },
    { label: 'Success Stories', to: '/stories' },
    { label: 'Contact Us', to: '/contact-us' }
  ];

  return (
    <>
    <Helmet>
      <title>How We Work - Sponsor Studio | Event Sponsorship Platform</title>
      <meta name="description" content="Discover how Sponsor Studio connects brands with event organizers through our streamlined sponsorship platform. Learn about our process, benefits, and success stories." />
      <meta name="keywords" content="event sponsorship, brand partnerships, sponsorship platform, event marketing, brand activation, sponsorship process" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.sponsorstudio.in/how-we-work" />
      <meta property="og:title" content="How We Work - Sponsor Studio | Event Sponsorship Platform" />
      <meta property="og:description" content="Discover how Sponsor Studio connects brands with event organizers through our streamlined sponsorship platform. Learn about our process, benefits, and success stories." />
      <meta property="og:image" content="https://www.sponsorstudio.in/sponsor_studio_logo.png" />
      <meta property="og:site_name" content="Sponsor Studio" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://www.sponsorstudio.in/how-we-work" />
      <meta property="twitter:title" content="How We Work - Sponsor Studio | Event Sponsorship Platform" />
      <meta property="twitter:description" content="Discover how Sponsor Studio connects brands with event organizers through our streamlined sponsorship platform. Learn about our process, benefits, and success stories." />
      <meta property="twitter:image" content="https://www.sponsorstudio.in/sponsor_studio_logo.png" />

      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Sponsor Studio" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href="https://www.sponsorstudio.in/how-we-work" />
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
    <HowItWorks />
    <Footer />
    </>
  )
}

export default HowWeWork
