
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="font-bold text-xl">
            <span className="text-brand">Luxe</span>Transfers
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-brand transition-colors">
              Home
            </Link>
            <Link to="/services" className="text-gray-700 hover:text-brand transition-colors">
              Services
            </Link>
            <Link to="/fleet" className="text-gray-700 hover:text-brand transition-colors">
              Our Fleet
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-brand transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-brand transition-colors">
              Contact
            </Link>
          </div>

          {/* Phone Number and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <a href="tel:+1234567890" className="hidden md:flex items-center text-gray-700 hover:text-brand">
              <Phone size={16} className="mr-2" />
              <span>(123) 456-7890</span>
            </a>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link 
              to="/" 
              className="block text-gray-700 hover:text-brand transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/services" 
              className="block text-gray-700 hover:text-brand transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Services
            </Link>
            <Link 
              to="/fleet" 
              className="block text-gray-700 hover:text-brand transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Our Fleet
            </Link>
            <Link 
              to="/about" 
              className="block text-gray-700 hover:text-brand transition-colors"
              onClick={() => setIsOpen(false)}
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className="block text-gray-700 hover:text-brand transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            
            <a 
              href="tel:+1234567890" 
              className="flex items-center text-gray-700 hover:text-brand"
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
