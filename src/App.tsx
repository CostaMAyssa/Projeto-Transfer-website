
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BookingProvider } from "./contexts/BookingContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BookingLayout from "./pages/booking/BookingLayout";
import CityTourDetails from "./pages/city-tours/CityTourDetails";

// Placeholder pages for new routes
const Partners = () => <div className="pt-24 container mx-auto px-4 min-h-screen">Partners Page Coming Soon</div>;
const Blog = () => <div className="pt-24 container mx-auto px-4 min-h-screen">Blog Page Coming Soon</div>;

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BookingProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/booking" element={<BookingLayout />} />
            <Route path="/city-tours/:tourId" element={<CityTourDetails />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/blog" element={<Blog />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </BookingProvider>
  </QueryClientProvider>
);

export default App;
