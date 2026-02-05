import React, { useState, useEffect, useCallback } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import Hero from './Hero';
import Markets from './Markets';
import Protocol from './Protocol';
import FAQ from './FAQ';

const sections = ['home', 'markets', 'protocol', 'faq'];

const Home: React.FC = () => {
  const [currentSection, setCurrentSection] = useState(0);

  const getScrollContainer = () => {
    return document.getElementById('main-scroll-container');
  };

  const detectCurrentSection = useCallback(() => {
    const container = getScrollContainer();
    if (!container) return;

    const scrollPosition = container.scrollTop + container.clientHeight / 3;

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = document.getElementById(sections[i]);
      if (section) {
        const sectionTop = section.offsetTop - container.offsetTop;
        if (scrollPosition >= sectionTop) {
          setCurrentSection(i);
          return;
        }
      }
    }
    setCurrentSection(0);
  }, []);

  useEffect(() => {
    const container = getScrollContainer();
    if (!container) return;

    container.addEventListener('scroll', detectCurrentSection);
    detectCurrentSection();

    return () => container.removeEventListener('scroll', detectCurrentSection);
  }, [detectCurrentSection]);

  const isAtLastSection = currentSection === sections.length - 1;

  const handleScrollClick = () => {
    const container = getScrollContainer();
    if (!container) return;

    if (isAtLastSection) {
      // Scroll to top
      container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Scroll to next section
      const nextSectionId = sections[currentSection + 1];
      const nextSection = document.getElementById(nextSectionId);
      if (nextSection) {
        const offset = nextSection.offsetTop - container.offsetTop;
        container.scrollTo({ top: offset, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="w-full relative">
      {/* Hero Section */}
      <section id="home">
        <Hero />
      </section>

      {/* Markets Section */}
      <section id="markets">
        <Markets />
      </section>

      {/* Protocol Section */}
      <section id="protocol">
        <Protocol />
      </section>

      {/* FAQ Section */}
      <section id="faq">
        <FAQ />
      </section>

      {/* Fixed Scroll Button */}
      <button
        onClick={handleScrollClick}
        className="fixed bottom-8 left-8 z-40 hidden md:flex items-center gap-4 group cursor-pointer"
      >
        <div className="w-12 h-12 border border-white/10 bg-black/50 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/10 group-hover:border-brand-stellar/30 transition-all duration-300">
          {isAtLastSection ? (
            <ArrowUp className="w-5 h-5 text-white animate-bounce" />
          ) : (
            <ArrowDown className="w-5 h-5 text-white animate-bounce" />
          )}
        </div>
        <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 group-hover:text-white transition-colors uppercase">
          {isAtLastSection ? 'Back to Top' : 'Scroll Down'}
        </span>
      </button>
    </div>
  );
};

export default Home;
