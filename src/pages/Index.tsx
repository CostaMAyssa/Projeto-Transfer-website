
import { Button } from "@/components/ui/button";
import BookingWidget from "@/components/BookingWidget";
import Navbar from "@/components/Navbar";
import { Play, Shield, FileText, Car, ArrowRight, ArrowLeft } from "lucide-react";
import { vehicles } from "@/data/mockData";
import { Link } from "react-router-dom";
const Index = () => {
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section with Background */}
      <div className="relative h-[700px]">
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center" style={{
        backgroundImage: "url('/lovable-uploads/8dbef764-77f5-4717-bfe4-19f5775b0869.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 my-0 py-0"></div>
        </div>
        
        {/* Hero Content */}
        <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-10 pt-16">
          <div className="max-w-3xl text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal mb-6">
              The Nation's #1 Largest Personal Driver Service
            </h1>
            <p className="text-xl mb-8 font-light max-w-2xl">
              Luxury chauffeur service providing premium transportation solutions with comfort, safety, and professionalism for all your travel needs.
            </p>
            <div className="flex space-x-4">
              <Button className="bg-brand hover:bg-brand-600 text-white py-[21px] px-[59px] text-base">
                Book Now
              </Button>
              
            </div>
          </div>
        </div>
      </div>

      {/* Booking Widget */}
      <div className="container mx-auto px-4">
        <BookingWidget />
      </div>

      {/* Benefits Section - NEW SECTION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Safety First */}
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mb-6">
                <Shield size={40} className="text-brand" />
              </div>
              <h3 className="text-2xl font-normal mb-4">Safety First</h3>
              <p className="text-gray-600 font-light">
                Both you and your shipments will travel with professional drivers. Always with the highest quality standards.
              </p>
            </div>
            
            {/* Prices With No Surprises */}
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mb-6">
                <FileText size={40} className="text-brand" />
              </div>
              <h3 className="text-2xl font-normal mb-4">Prices With No Surprises</h3>
              <p className="text-gray-600 font-light">
                Both you and your shipments will travel with professional drivers. Always with the highest quality standards.
              </p>
            </div>
            
            {/* Private Travel Solutions */}
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mb-6">
                <Car size={40} className="text-brand" />
              </div>
              <h3 className="text-2xl font-normal mb-4">Private Travel Solutions</h3>
              <p className="text-gray-600 font-light">
                Both you and your shipments will travel with professional drivers. Always with the highest quality standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-normal">Our Fleet</h2>
          <Link to="/fleet" className="flex items-center text-brand hover:text-brand-700">
            More Fleet <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map(vehicle => <div key={vehicle.id} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 bg-gray-50 flex items-center justify-center h-60 overflow-hidden">
                <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-contain" style={{
              transform: "scale(1.3)"
            }} // 30% zoom
            />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-normal mb-2">{vehicle.category}</h3>
                <p className="text-gray-600 text-sm mb-4">{vehicle.models}</p>
                <div className="flex flex-col space-y-4">
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mr-1 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm text-gray-500">Passengers: {vehicle.capacity}</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <span className="text-sm text-gray-500">Luggage:</span>
                    {vehicle.id === "suv" && <p className="text-xs text-gray-600">6 of 23kg (checked baggage) and 5 of 10kg (carry-on baggage)</p>}
                    {vehicle.id === "sedan" && <p className="text-xs text-gray-600">3 of 23kg (checked baggage) and 2 of 10kg (carry-on baggage)</p>}
                    {vehicle.id === "minivan" && <p className="text-xs text-gray-600">4 of 23kg (checked baggage) and 4 of 10kg (carry-on baggage)</p>}
                  </div>
                </div>
              </div>
            </div>)}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-normal text-center mb-12">Why Choose Our Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand-100 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-normal mb-2">Safety First</h3>
              <p className="text-gray-600">Both you and your belongings will travel with professional drivers. Always with the highest quality standards.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand-100 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-normal mb-2">Prices With No Surprises</h3>
              <p className="text-gray-600">Both you and your belongings will travel with professional drivers. Always with the highest quality standards.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand-100 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
                <Car size={24} />
              </div>
              <h3 className="text-xl font-normal mb-2">Private Travel Solutions</h3>
              <p className="text-gray-600">Both you and your belongings will travel with professional drivers. Always with the highest quality standards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-normal mb-4">Ready to Book Your Transfer?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto font-light">
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
              <h3 className="text-xl font-normal mb-4">About Us</h3>
              <p className="text-gray-400">
                We provide premium chauffeur services for airport transfers, executive travel, and special events. Our mission is to deliver exceptional service and comfort.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-normal mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Services</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Fleet</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-normal mb-4">Contact Us</h3>
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
    </div>;
};
export default Index;
