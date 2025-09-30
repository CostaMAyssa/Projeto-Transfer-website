import React from 'react';
import { AlertCircle, CheckCircle, Clock, Plane, MapPin } from 'lucide-react';
import { FlightValidationData } from '@/types/booking';
import { useTranslation } from 'react-i18next';

interface FlightValidationMessageProps {
  flightData?: FlightValidationData;
  isLoading?: boolean;
  className?: string;
}

const FlightValidationMessage: React.FC<FlightValidationMessageProps> = ({
  flightData,
  isLoading = false,
  className = ''
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 text-blue-600 text-sm ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>{t('flightValidation.checkingFlight')}</span>
      </div>
    );
  }

  if (!flightData?.validationResult) {
    return null;
  }

  const { validationResult } = flightData;
  const { is_valid, reason, suggested_time, suggested_date, flight_info } = validationResult;

  if (is_valid) {
    return (
      <div className={`flex items-start space-x-2 text-green-600 text-sm ${className}`}>
        <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="font-medium">{t('flightValidation.validSchedule')}</div>
          {flight_info && (
            <div className="mt-1 space-y-1 text-xs text-green-700">
              <div className="flex items-center space-x-1">
                <Plane size={12} />
                <span>{flight_info.airline} {flight_info.flight_number}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock size={12} />
                <span>
                  {t('flightValidation.departure')}: {new Date(flight_info.departure_time).toLocaleString()}
                </span>
              </div>
              {flight_info.terminal && (
                <div className="flex items-center space-x-1">
                  <MapPin size={12} />
                  <span>{t('flightValidation.terminal')}: {flight_info.terminal}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start space-x-2 text-amber-600 text-sm ${className}`}>
      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <div className="font-medium text-amber-800">{t('flightValidation.scheduleIssue')}</div>
        <div className="mt-1 text-amber-700">{reason}</div>
        
        {(suggested_time || suggested_date) && (
          <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
            <div className="text-xs font-medium text-amber-800 mb-1">
              {t('flightValidation.suggestedTime')}:
            </div>
            <div className="text-xs text-amber-700">
              {suggested_date && (
                <div>{t('flightValidation.date')}: {new Date(suggested_date).toLocaleDateString()}</div>
              )}
              {suggested_time && (
                <div>{t('flightValidation.time')}: {suggested_time}</div>
              )}
            </div>
          </div>
        )}

        {flight_info && (
          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
            <div className="text-xs font-medium text-blue-800 mb-1">
              {t('flightValidation.flightInfo')}:
            </div>
            <div className="text-xs text-blue-700 space-y-1">
              <div className="flex items-center space-x-1">
                <Plane size={12} />
                <span>{flight_info.airline} {flight_info.flight_number}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock size={12} />
                <span>
                  {t('flightValidation.departure')}: {new Date(flight_info.departure_time).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock size={12} />
                <span>
                  {t('flightValidation.arrival')}: {new Date(flight_info.arrival_time).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightValidationMessage;
