
import { Button } from "@/components/ui/button";
import BookingWidget from "@/components/BookingWidget";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section with Background */}
      <div className="relative h-[500px] bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        {/* Hero Content */}
        <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Premium Airport & Executive Transfers</h1>
          <p className="text-xl max-w-2xl mb-8">
            Reliable, comfortable, and professional chauffeur services for all your transportation needs
          </p>
          <Button className="bg-brand hover:bg-brand-600 text-white px-8 py-6 text-lg">
            Learn More
          </Button>
        </div>
      </div>

      {/* Booking Widget */}
      <div className="container mx-auto px-4">
        <BookingWidget />
      </div>

      {/* Features Section */}
      <section className="py-20 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Services</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-brand-100 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Punctuality Guaranteed</h3>
            <p className="text-gray-600">We understand the importance of timely pickups, especially for airport transfers.</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-brand-100 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Safety First</h3>
            <p className="text-gray-600">All our vehicles are regularly serviced and our chauffeurs are professionally trained.</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-brand-100 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Transparent Pricing</h3>
            <p className="text-gray-600">No hidden fees. The price you see is the price you pay, including all taxes and fees.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Your Transfer?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience premium chauffeur services tailored to your needs. Book now and travel in comfort and style.
          </p>
          <Button className="bg-brand hover:bg-brand-600 text-white px-8 py-6 text-lg">
            Book Your Transfer
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">About Us</h3>
              <p className="text-gray-400">
                We provide premium chauffeur services for airport transfers, executive travel, and special events. Our mission is to deliver exceptional service and comfort.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Services</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Fleet</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
              <address className="text-gray-400 not-italic">
                <p>123 Main Street</p>
                <p>New York, NY 10001</p>
                <p className="mt-2">Phone: (123) 456-7890</p>
                <p>Email: info@transferbooking.com</p>
              </address>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} Transfer Booking. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
