
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white hover:text-brand-500 transition-colors text-sm font-light">
              Home
            </Link>
            <Link to="/services" className="text-white hover:text-brand-500 transition-colors text-sm font-light">
              Services
            </Link>
            <Link to="/fleet" className="text-white hover:text-brand-500 transition-colors text-sm font-light">
              Our Fleet
            </Link>
            <Link to="/partners" className="text-white hover:text-brand-500 transition-colors text-sm font-light">
              Partners
            </Link>
            <Link to="/blog" className="text-white hover:text-brand-500 transition-colors text-sm font-light">
              Blog
            </Link>
            <Link to="/about" className="text-white hover:text-brand-500 transition-colors text-sm font-light">
              About Us
            </Link>
            <Link to="/contact" className="text-white hover:text-brand-500 transition-colors text-sm font-light">
              Contact
            </Link>
          </div>

          {/* Phone Number and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <a href="tel:+1234567890" className="hidden md:flex items-center text-white hover:text-brand-500">
              <Phone size={16} className="mr-2" />
              <span>(123) 456-7890</span>
            </a>
            
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
            <Link 
              to="/" 
              className="block text-white hover:text-brand-500 transition-colors text-sm font-light"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/services" 
              className="block text-white hover:text-brand-500 transition-colors text-sm font-light"
              onClick={() => setIsOpen(false)}
            >
              Services
            </Link>
            <Link 
              to="/fleet" 
              className="block text-white hover:text-brand-500 transition-colors text-sm font-light"
              onClick={() => setIsOpen(false)}
            >
              Our Fleet
            </Link>
            <Link 
              to="/partners" 
              className="block text-white hover:text-brand-500 transition-colors text-sm font-light"
              onClick={() => setIsOpen(false)}
            >
              Partners
            </Link>
            <Link 
              to="/blog" 
              className="block text-white hover:text-brand-500 transition-colors text-sm font-light"
              onClick={() => setIsOpen(false)}
            >
              Blog
            </Link>
            <Link 
              to="/about" 
              className="block text-white hover:text-brand-500 transition-colors text-sm font-light"
              onClick={() => setIsOpen(false)}
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className="block text-white hover:text-brand-500 transition-colors text-sm font-light"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            
            <a 
              href="tel:+1234567890" 
              className="flex items-center text-white hover:text-brand-500 text-sm font-light"
              onClick={() => setIsOpen(false)}
            >
              <Phone size={16} className="mr-2" />
              <span>(123) 456-7890</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
