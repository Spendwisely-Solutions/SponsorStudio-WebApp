import Footer from "../components/HomePage/Footer"
import HowItWorks from "../components/HomePage/HowItWorks"
import NavBar from "../components/HomePage/NavBar"
import { useState } from "react"

function HowWeWork() {
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
    <HowItWorks />
    <Footer />
    </>
  )
}

export default HowWeWork
