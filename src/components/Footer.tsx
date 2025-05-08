
import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-black text-white py-24">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Company Info */}
          <div className="space-y-8">
            <div className="mb-8">
              <img 
                src="/lovable-uploads/38f717db-0697-430d-8dd5-cc6b4cb08c47.png" 
                alt="AZ Transfer Logo" 
                className="h-20 w-auto"
              />
            </div>
            <p className="text-gray-400 max-w-xs font-light">
              Luxury chauffeur service providing premium transportation solutions with comfort, safety, and professionalism.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/aztransfer_oficial" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-brand transition-colors p-2 bg-gray-900 rounded-full"
              >
                <Instagram size={18} />
                <span className="sr-only">Instagram</span>
              </a>
              <a 
                href="https://www.facebook.com/aztransferoficial" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-brand transition-colors p-2 bg-gray-900 rounded-full"
              >
                <Facebook size={18} />
                <span className="sr-only">Facebook</span>
              </a>
              <a 
                href="https://www.tiktok.com/@aztransfer_oficial" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-brand transition-colors p-2 bg-gray-900 rounded-full"
              >
                {/* Custom TikTok SVG icon since it's not available in lucide-react */}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="lucide-tiktok"
                >
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                </svg>
                <span className="sr-only">TikTok</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h3 className="text-xl font-light tracking-wide border-b border-gray-800 pb-2">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-light">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-light">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-light">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/partners" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-light">
                  Partners
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-light">
                  Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <h3 className="text-xl font-light tracking-wide border-b border-gray-800 pb-2">Contact Us</h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-brand min-w-[18px] mt-1" />
                <a href="mailto:hello@aztransfergroup.com" className="text-gray-400 hover:text-white transition-colors font-light">
                  hello@aztransfergroup.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-brand min-w-[18px] mt-1" />
                <a href="tel:+13478487765" className="text-gray-400 hover:text-white transition-colors font-light">
                  +1 (347) 848-7765
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Smartphone size={18} className="text-brand min-w-[18px] mt-1" />
                <a href="https://wa.me/13478487765" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors font-light">
                  WhatsApp: +1 (347) 848-7765
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-8">
            <h3 className="text-xl font-light tracking-wide border-b border-gray-800 pb-2">Newsletter</h3>
            <p className="text-gray-400 font-light">
              Subscribe to our newsletter to receive updates and promotions.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your Email Address"
                className="bg-gray-900 border border-gray-800 rounded-none px-4 py-2 focus:outline-none focus:ring-1 focus:ring-brand text-white"
              />
              <Button 
                type="submit" 
                className="bg-brand hover:bg-brand-600 text-white font-light"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Footer - More minimalist */}
        <div className="pt-8 border-t border-gray-900">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm mb-4 md:mb-0 font-light">
              &copy; {currentYear} AZ Transfer Group. All rights reserved.
            </div>
            <div className="flex gap-8 text-sm">
              <Link to="/privacy-policy" className="text-gray-500 hover:text-white transition-colors font-light">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-500 hover:text-white transition-colors font-light">
                Terms of Service
              </Link>
              <Link to="/sitemap" className="text-gray-500 hover:text-white transition-colors font-light">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
