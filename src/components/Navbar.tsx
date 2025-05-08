
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#111111]">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/2fc23855-16a2-4858-9fa6-3c8cd43a7d9e.png" 
              alt="AZ Transfer Logo" 
              className="h-10" 
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white hover:text-brand-200 transition-colors">
              Home
            </Link>
            <Link to="/services" className="text-white hover:text-brand-200 transition-colors">
              Services
            </Link>
            <Link to="/fleet" className="text-white hover:text-brand-200 transition-colors">
              Our Fleet
            </Link>
            <Link to="/about" className="text-white hover:text-brand-200 transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="text-white hover:text-brand-200 transition-colors">
              Contact
            </Link>
          </div>

          {/* Phone Number and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <a href="tel:+1234567890" className="hidden md:flex items-center text-white hover:text-brand-200">
              <Phone size={16} className="mr-2" />
              <span>(123) 456-7890</span>
            </a>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-white hover:text-brand-200"
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
              className="block text-white hover:text-brand-200 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/services" 
              className="block text-white hover:text-brand-200 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Services
            </Link>
            <Link 
              to="/fleet" 
              className="block text-white hover:text-brand-200 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Our Fleet
            </Link>
            <Link 
              to="/about" 
              className="block text-white hover:text-brand-200 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className="block text-white hover:text-brand-200 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            
            <a 
              href="tel:+1234567890" 
              className="flex items-center text-white hover:text-brand-200"
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
