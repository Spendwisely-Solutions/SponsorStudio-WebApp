import { useState } from 'react'
import Footer from '../components/HomePage/Footer'
import TrendingEvents from '../components/HomePage/TrendingEvents'
import NavBar from '../components/HomePage/NavBar'

function Trending() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const customNavLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/how-we-work' },
    { label: 'Faq', to: '/faq' },
  ];

  return (
    <>
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
