import "../assets/css/LandingPage.css";

import useLandingPage from "../hooks/useLandingPage";

import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import About from "../components/landing/About";
import MenuSection from "../components/landing/MenuSection";
import TeamSection from "../components/landing/TeamSection";
import TestimonialSection from "../components/landing/TestimonialSection";
import Footer from "../components/landing/Footer";

export default function LandingPage({ onNavigate }) {
  const landing = useLandingPage();

  return (
    <div className="landing-wrapper">
      <Navbar
        isScrolled={landing.isScrolled}
        timeStr={landing.timeStr}
        onNavigate={onNavigate}
      />

      <Hero
        heroSlides={landing.heroSlides}
        currentSlide={landing.currentSlide}
        setCurrentSlide={landing.setCurrentSlide}
      />

      <Features />

      <About />

      <MenuSection
        menuFilter={landing.menuFilter}
        setMenuFilter={landing.setMenuFilter}
        filteredMenu={landing.filteredMenu}
      />

      <TeamSection />

      <TestimonialSection
        testiData={landing.testiData}
        testiPage={landing.testiPage}
        TESTI_PER_PAGE={landing.TESTI_PER_PAGE}
        nextTesti={landing.nextTesti}
        prevTesti={landing.prevTesti}
      />

      <Footer
        isOpen={landing.isOpen}
        showScrollTop={landing.showScrollTop}
        scrollToTop={landing.scrollToTop}
      />
    </div>
  );
}