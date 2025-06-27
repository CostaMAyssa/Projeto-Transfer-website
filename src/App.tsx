import React, { ErrorInfo, ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BookingProvider } from "./contexts/BookingContext";
import Index from "./pages/Index";
import BookingLayout from "./pages/booking/BookingLayout";
import Contact from "./pages/Contact";
import TestZonePricing from "./pages/TestZonePricing";
import TestZonePricingSimple from "./pages/TestZonePricingSimple";
import NotFound from "./pages/NotFound";
import './lib/i18n';
import './lib/domErrorFix';

// Placeholder pages for routes that don't have dedicated pages yet
const Fleet = () => <div className="pt-24 container mx-auto px-4 min-h-screen">Fleet Page Coming Soon</div>;
const Services = () => <div className="pt-24 container mx-auto px-4 min-h-screen">Services Page Coming Soon</div>;
const About = () => <div className="pt-24 container mx-auto px-4 min-h-screen">About Page Coming Soon</div>;
const Pricing = () => <div className="pt-24 container mx-auto px-4 min-h-screen">Pricing Page Coming Soon</div>;
const Partners = () => <div className="pt-24 container mx-auto px-4 min-h-screen">Partners Page Coming Soon</div>;
const Blog = () => <div className="pt-24 container mx-auto px-4 min-h-screen">Blog Page Coming Soon</div>;

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error; errorInfo?: ErrorInfo }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('🚨 Error Boundary caught an error:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error Boundary - Error details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Algo deu errado</h2>
            <p className="text-gray-600 mb-4">
              Encontramos um erro inesperado. Os detalhes foram registrados no console.
            </p>
            {this.state.error && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                  Detalhes técnicos
                </summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        console.warn('🔄 Query retry attempt:', failureCount, error);
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BookingProvider>
          <TooltipProvider>
            <BrowserRouter>
              <div className="App">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/booking/*" element={<BookingLayout />} />
                  <Route path="/fleet" element={<Fleet />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/partners" element={<Partners />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/test-zone-pricing" element={<TestZonePricing />} />
                  <Route path="/test-zone-pricing-simple" element={<TestZonePricingSimple />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
                <Sonner />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </BookingProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
