import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import FlightValidationMessage from './FlightValidationMessage';
import { FlightValidationData } from '@/types/booking';

interface FlightFieldsInlineProps {
  airline: string;
  setAirline: (value: string) => void;
  flightNumber: string;
  setFlightNumber: (value: string) => void;
  noFlightInfo: boolean;
  setNoFlightInfo: (value: boolean) => void;
  validationData?: FlightValidationData;
  isLoading: boolean;
  onSuggestTime?: (suggestedTime: string, suggestedDate: string) => void;
  className?: string;
}

const FlightFieldsInline: React.FC<FlightFieldsInlineProps> = ({
  airline,
  setAirline,
  flightNumber,
  setFlightNumber,
  noFlightInfo,
  setNoFlightInfo,
  validationData,
  isLoading,
  onSuggestTime,
  className = ""
}) => {
  const { t } = useTranslation();
  
  // Debug logs
  console.log('🔍 FlightFieldsInline props:', {
    airline,
    flightNumber,
    noFlightInfo,
    validationData,
    isLoading
  });

  return (
    <div className={`space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <span className="text-sm font-medium text-blue-800">{t('booking.flightInfoTitle')}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Airline */}
        <div className="space-y-2">
          <div className="flex items-center mb-1">
            <span className="text-sm font-medium">{t('booking.airline')}</span>
          </div>
          <Input
            type="text"
            value={airline}
            onChange={(e) => setAirline(e.target.value)}
            placeholder={t('booking.airlineExample')}
            className="w-full"
            disabled={noFlightInfo}
          />
        </div>

        {/* Flight Number */}
        <div className="space-y-2">
          <div className="flex items-center mb-1">
            <span className="text-sm font-medium">{t('booking.flightNumber')}</span>
          </div>
          <Input
            type="text"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            placeholder={t('booking.flightExample')}
            className="w-full"
            disabled={noFlightInfo}
          />
        </div>
      </div>
      
      {/* No Flight Info Checkbox */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={`noFlightInfo-${Math.random().toString(36).substr(2, 9)}`}
          checked={noFlightInfo}
          onChange={(e) => setNoFlightInfo(e.target.checked)}
          className="rounded border-gray-300"
        />
        <label htmlFor={`noFlightInfo-${Math.random().toString(36).substr(2, 9)}`} className="text-sm text-gray-600">
          {t('booking.noFlightInfo')}
        </label>
      </div>
      
      {/* Flight Validation Message */}
      <FlightValidationMessage
        flightData={validationData}
        isLoading={isLoading}
        className="mt-2"
      />
    </div>
  );
};

export default FlightFieldsInline;
