import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";
import LanguageSelector from "./LanguageSelector";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();
  
  // Check if we're on the home page
  const isHomePage = location.pathname === "/";

  // Add scroll event listener to change navbar background on scroll for home page
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    if (isHomePage) {
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHomePage]);

  const navbarClasses = isHomePage 
    ? `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#111111]' : 'bg-transparent'
      }`
    : 'fixed top-0 left-0 right-0 z-50 bg-[#111111]';

  return (
    <header className={navbarClasses}>
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/2fc23855-16a2-4858-9fa6-3c8cd43a7d9e.png" 
              alt="AZ Transfer Logo" 
              className="h-9" 
            />
          </Link>

          {/* Phone Number, Language Selector, and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <a href="tel:+13478487765" className="hidden md:flex items-center text-white hover:text-brand-500">
              <Phone size={16} className="mr-2" />
              <span>{t('nav.phone')}</span>
            </a>
            
            {/* Language Selector - Desktop */}
            <div className="hidden md:block">
              <LanguageSelector variant="desktop" />
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-white hover:text-brand-500"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-black bg-opacity-90 shadow-lg">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <a 
              href="tel:+13478487765" 
              className="flex items-center text-white hover:text-brand-500 text-sm font-light"
              onClick={() => setIsOpen(false)}
            >
              <Phone size={16} className="mr-2" />
              <span>{t('nav.phone')}</span>
            </a>

            {/* Language Selector - Mobile */}
            <div className="pt-4 border-t border-white/20">
              <LanguageSelector variant="mobile" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
