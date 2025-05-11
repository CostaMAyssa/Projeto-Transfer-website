
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AzBooking = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="w-full h-[800px] border border-gray-200 rounded-lg overflow-hidden">
            <iframe 
              src="https://customer.moovs.app/az-transfer/iframe" 
              title="Moovs App"
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AzBooking;
