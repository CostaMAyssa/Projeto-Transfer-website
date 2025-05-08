
import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return <footer className="bg-white text-black py-24">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Company Info */}
          <div className="space-y-8">
            <div className="mb-8">
              <img src="/lovable-uploads/168f2f96-96fb-4f79-a0a2-cbd7929ea8a9.png" alt="AZ Transfer Logo" className="h-12 w-auto" />
            </div>
            <p className="text-gray-600 max-w-xs font-normal text-sm">
              Luxury executive transfer service providing premium transportation solutions with comfort, safety, and professionalism.
            </p>
            <div className="space-y-2">
              <p className="text-gray-600 font-bold text-sm">Follow Us</p>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/aztransfer_oficial" target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors p-2 bg-gray-100 rounded-full">
                  <Instagram size={18} />
                  <span className="sr-only">Instagram</span>
                </a>
                <a href="https://www.facebook.com/aztransferoficial" target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors p-2 bg-gray-100 rounded-full">
                  <Facebook size={18} />
                  <span className="sr-only">Facebook</span>
                </a>
                <a href="https://www.tiktok.com/@aztransfer_oficial" target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors p-2 bg-gray-100 rounded-full">
                  {/* Custom TikTok SVG icon since it's not available in lucide-react */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-tiktok">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                  </svg>
                  <span className="sr-only">TikTok</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h3 className="text-base font-medium tracking-wide border-b border-gray-200 pb-2">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-brand transition-colors flex items-center gap-2 font-normal text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-brand transition-colors flex items-center gap-2 font-normal text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-600 hover:text-brand transition-colors flex items-center gap-2 font-normal text-sm">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/partners" className="text-gray-600 hover:text-brand transition-colors flex items-center gap-2 font-normal text-sm">
                  Partners
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-600 hover:text-brand transition-colors flex items-center gap-2 font-normal text-sm">
                  Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <h3 className="text-base font-medium tracking-wide border-b border-gray-200 pb-2">Contact Us</h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-[#F35B62] min-w-[18px] mt-1" />
                <a href="mailto:hello@aztransfergroup.com" className="text-gray-600 hover:text-brand transition-colors font-normal text-sm">
                  hello@aztransfergroup.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-[#F35B62] min-w-[18px] mt-1" />
                <a href="tel:+13478487765" className="text-gray-600 hover:text-brand transition-colors font-normal text-sm">
                  +1 (347) 848-7765
                </a>
              </li>
              <li className="flex items-start gap-3">
                {/* WhatsApp icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 1219.547 1225.016" className="text-[#25D366] min-w-[18px] mt-1">
                  <path fill="#25D366" d="M1041.858 178.02C927.206 63.289 774.753.07 612.325 0 277.617 0 5.232 272.298 5.098 606.991c-.039 106.986 27.915 211.42 81.048 303.476L0 1225.016l321.898-84.406c88.689 48.368 188.547 73.855 290.166 73.896h.258.003c334.654 0 607.08-272.346 607.222-607.023.056-162.208-63.052-314.724-177.689-429.463zm-429.533 933.963h-.197c-90.578-.048-179.402-24.366-256.878-70.339l-18.438-10.93-191.021 50.083 51-186.176-12.013-19.087c-50.525-80.336-77.198-173.175-77.16-268.504.111-278.186 226.507-504.503 504.898-504.503 134.812.056 261.519 52.604 356.814 147.965 95.289 95.36 147.728 222.128 147.688 356.948-.118 278.195-226.522 504.543-504.693 504.543z"/>
                  <path fill="#25D366" d="M886.527 348.903c-30.669-30.669-71.446-47.559-114.818-47.559-89.616 0-162.503 72.887-162.56 162.454-.013 32.892 13.192 62.754 29.321 82.936l-36.282 132.435 135.443-35.503c19.526 10.626 41.65 16.23 64.069 16.241h.051c89.58 0 162.445-72.888 162.496-162.466.025-43.288-16.87-84.127-47.48-114.768l.071-.014-.311-.255zm-114.843 251.323c-24.329 0-48.183-6.564-68.988-18.934l-4.945-2.938-51.273 13.419 13.717-50.025-3.214-5.1c-13.517-21.516-20.644-46.356-20.644-71.863.042-74.416 60.651-134.983 135.149-134.983 36.122.013 70.053 14.103 95.597 39.661 25.545 25.559 39.605 59.45 39.592 95.512-.042 74.432-60.644 134.991-135.012 135.043l.021-.003z"/>
                </svg>
                <a href="https://wa.me/13478487765" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-brand transition-colors font-normal text-sm">
                  WhatsApp: +1 (347) 848-7765
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-8">
            <h3 className="text-base font-medium tracking-wide border-b border-gray-200 pb-2">Newsletter</h3>
            <p className="text-gray-600 font-normal text-sm">
              Subscribe to our newsletter to receive updates and promotions.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input type="email" placeholder="Your Email Address" className="bg-gray-100 border border-gray-200 rounded-none px-4 py-2 focus:outline-none focus:ring-1 focus:ring-brand text-black text-sm" />
              <Button type="submit" className="bg-brand hover:bg-brand-600 text-white font-normal text-sm">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Footer - More minimalist */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm mb-4 md:mb-0 font-normal">
              &copy; {currentYear} AZ Transfer Group. All rights reserved.
            </div>
            <div className="flex gap-8 text-sm">
              <Link to="/privacy-policy" className="text-gray-500 hover:text-brand transition-colors font-normal">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-500 hover:text-brand transition-colors font-normal">
                Terms of Service
              </Link>
              <Link to="/sitemap" className="text-gray-500 hover:text-brand transition-colors font-normal">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;
