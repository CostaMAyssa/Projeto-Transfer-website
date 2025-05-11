
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";

const AzBooking = () => {
  const isMobile = useIsMobile();
  const [iframeHeight, setIframeHeight] = useState("800px");

  useEffect(() => {
    // Adjust iframe height based on window size
    const updateHeight = () => {
      // Calculate available viewport height (minus navbar and some padding)
      const viewportHeight = window.innerHeight;
      const navbarHeight = 64; // 16 * 4 = 64px (h-16)
      const padding = 48; // 24px top + 24px bottom
      
      // Set the iframe height to fill the available space
      const newHeight = viewportHeight - navbarHeight - padding;
      setIframeHeight(`${newHeight}px`);
    };
    
    // Set initial height
    updateHeight();
    
    // Update height on window resize
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-6">
          <div 
            className="w-full border border-gray-200 rounded-lg overflow-hidden"
            style={{ height: iframeHeight }}
          >
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
