import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface ErrorLog {
  id: string;
  timestamp: Date;
  type: 'error' | 'warning' | 'info';
  message: string;
  source?: string;
}

const DebugMonitor = () => {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Monitor console errors
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'string' ? arg : JSON.stringify(arg)
      ).join(' ');
      
      setErrors(prev => [...prev.slice(-9), {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: 'error',
        message,
        source: 'console.error'
      }]);
      
      originalError(...args);
    };

    console.warn = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'string' ? arg : JSON.stringify(arg)
      ).join(' ');
      
      setErrors(prev => [...prev.slice(-9), {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: 'warning',
        message,
        source: 'console.warn'
      }]);
      
      originalWarn(...args);
    };

    // Monitor unhandled errors
    const handleGlobalError = (event: ErrorEvent) => {
      setErrors(prev => [...prev.slice(-9), {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: 'error',
        message: event.message,
        source: event.filename
      }]);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setErrors(prev => [...prev.slice(-9), {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: 'error',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        source: 'Promise'
      }]);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Check for development environment
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (!isVisible || errors.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white border rounded-lg shadow-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
            Debug Monitor
          </h4>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {errors.slice(-5).map((error) => (
            <Alert key={error.id} variant={error.type === 'error' ? 'destructive' : 'default'} className="py-2">
              <div className="flex items-start space-x-2">
                {error.type === 'error' ? (
                  <XCircle className="w-3 h-3 mt-0.5 text-red-500" />
                ) : error.type === 'warning' ? (
                  <AlertCircle className="w-3 h-3 mt-0.5 text-yellow-500" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 mt-0.5 text-blue-500" />
                )}
                <div className="flex-1 min-w-0">
                  <AlertDescription className="text-xs">
                    <div className="font-mono text-xs text-gray-500">
                      {error.timestamp.toLocaleTimeString()}
                    </div>
                    <div className="truncate">
                      {error.message}
                    </div>
                    {error.source && (
                      <div className="text-xs text-gray-400 truncate">
                        {error.source}
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </div>
        
        <div className="mt-2 pt-2 border-t">
          <button
            onClick={() => setErrors([])}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Limpar logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugMonitor; 