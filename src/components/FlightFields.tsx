import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import FlightValidationMessage from './FlightValidationMessage';
import { FlightValidationData } from '@/types/booking';

interface FlightFieldsProps {
  airline: string;
  flightNumber: string;
  noFlightInfo: boolean;
  onAirlineChange: (value: string) => void;
  onFlightNumberChange: (value: string) => void;
  onNoFlightInfoChange: (checked: boolean) => void;
  flightData?: FlightValidationData;
  isLoading?: boolean;
  className?: string;
}

const FlightFields: React.FC<FlightFieldsProps> = ({
  airline,
  flightNumber,
  noFlightInfo,
  onAirlineChange,
  onFlightNumberChange,
  onNoFlightInfoChange,
  flightData,
  isLoading = false,
  className = ''
}) => {
  const { t } = useTranslation();

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
            onChange={(e) => onAirlineChange(e.target.value)}
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
            onChange={(e) => onFlightNumberChange(e.target.value)}
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
          id={`noFlightInfo-${Math.random()}`}
          checked={noFlightInfo}
          onChange={(e) => onNoFlightInfoChange(e.target.checked)}
          className="rounded border-gray-300"
        />
        <label htmlFor={`noFlightInfo-${Math.random()}`} className="text-sm text-gray-600">
          {t('booking.noFlightInfo')}
        </label>
      </div>
      
      {/* Flight Validation Message */}
      <FlightValidationMessage
        flightData={flightData}
        isLoading={isLoading}
        className="mt-2"
      />
    </div>
  );
};

export default FlightFields;
