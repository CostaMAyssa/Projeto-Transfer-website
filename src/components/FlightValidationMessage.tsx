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
      <div className={`p-3 rounded-lg border border-gray-200 bg-white ${className}`}>
        <div className="flex items-center space-x-2 text-green-600 text-sm mb-2">
          <CheckCircle size={16} />
          <span className="font-medium">{t('flightValidation.validSchedule')}</span>
        </div>
        {flight_info && (
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <Plane size={12} />
              <span>{flight_info.airline} {flight_info.flight_number}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
            {(flight_info.terminal || flight_info.gate) && (
              <div className="flex items-center space-x-4">
                {flight_info.terminal && (
                  <div className="flex items-center space-x-1">
                    <MapPin size={12} />
                    <span>{t('flightValidation.terminal')}: {flight_info.terminal}</span>
                  </div>
                )}
                {flight_info.gate && (
                  <div className="flex items-center space-x-1">
                    <MapPin size={12} />
                    <span>{t('flightValidation.gate')}: {flight_info.gate}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-lg border border-gray-200 bg-white ${className}`}>
      <div className="flex items-center space-x-2 text-amber-600 text-sm mb-2">
        <AlertCircle size={16} />
        <span className="font-medium">{t('flightValidation.scheduleIssue')}</span>
      </div>
      
      <div className="text-sm text-gray-700 mb-3">{reason}</div>
      
      {(suggested_time || suggested_date) && (
        <div className="p-2 bg-white rounded border border-gray-200 mb-3">
          <div className="text-xs font-medium text-gray-800 mb-1">
            {t('flightValidation.suggestedTime')}:
          </div>
          <div className="text-xs text-gray-600">
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
        <div className="p-2 bg-white rounded border border-gray-200">
          <div className="text-xs font-medium text-gray-800 mb-2">
            {t('flightValidation.flightInfo')}:
          </div>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <Plane size={12} />
              <span>{flight_info.airline} {flight_info.flight_number}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
            {(flight_info.terminal || flight_info.gate) && (
              <div className="flex items-center space-x-4">
                {flight_info.terminal && (
                  <div className="flex items-center space-x-1">
                    <MapPin size={12} />
                    <span>{t('flightValidation.terminal')}: {flight_info.terminal}</span>
                  </div>
                )}
                {flight_info.gate && (
                  <div className="flex items-center space-x-1">
                    <MapPin size={12} />
                    <span>{t('flightValidation.gate')}: {flight_info.gate}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightValidationMessage;
