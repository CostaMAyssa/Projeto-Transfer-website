import { useBooking } from "@/contexts/BookingContext";
import BookingStepIndicator from "@/components/BookingStepIndicator";
import VehicleSelection from "./VehicleSelection";
import ExtrasSelection from "./ExtrasSelection";
import Payment from "./Payment";
import Confirmation from "./Confirmation";
import Navbar from "@/components/Navbar";
import { useMemo, useCallback, Component, ReactNode, ErrorInfo } from "react";

// Error Boundary específico para o BookingLayout
class BookingErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('🚨 BookingLayout Error Boundary:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 BookingLayout Error details:', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <Navbar />
          <div className="bg-gray-50 min-h-screen pt-20 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-red-600 mb-4">Erro na Reserva</h2>
              <p className="text-gray-600 mb-4">
                Ocorreu um erro temporário. Por favor, recarregue a página.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Recarregar Página
              </button>
            </div>
          </div>
        </>
      );
    }

    return this.props.children;
  }
}

const BookingLayout = () => {
  const { currentStep, goToStep, bookingComplete } = useBooking();

  // Memoize step click handler
  const handleStepClick = useCallback((step: number) => {
    goToStep(step);
  }, [goToStep]);

  // Memoize steps to prevent recreation on every render
  const steps = useMemo(() => [
    { component: <VehicleSelection key="vehicle" /> },
    { component: <ExtrasSelection key="extras" /> },
    { component: <Payment key="payment" /> },
    { component: <Confirmation key="confirmation" /> }
  ], []);

  // Memoize current component to avoid recreation
  const currentComponent = useMemo(() => {
    return steps[currentStep]?.component || <VehicleSelection key="fallback" />;
  }, [steps, currentStep]);

  // If booking is complete, show the confirmation step
  if (bookingComplete) {
    return (
      <BookingErrorBoundary>
        <Navbar />
        <div className="bg-gray-50 min-h-screen pt-20">
          <Confirmation />
        </div>
      </BookingErrorBoundary>
    );
  }

  return (
    <BookingErrorBoundary>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pt-20">
        <div className="max-w-7xl mx-auto py-8 px-4">
          {currentStep < 3 && (
            <div className="px-4 md:px-8 lg:px-16 mb-6">
              <BookingStepIndicator 
                currentStep={currentStep} 
                onStepClick={handleStepClick}
              />
            </div>
          )}
          
          {currentComponent}
        </div>
      </div>
    </BookingErrorBoundary>
  );
}

export default BookingLayout;
