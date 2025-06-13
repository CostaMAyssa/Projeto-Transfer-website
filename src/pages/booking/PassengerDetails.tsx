import { useBooking } from "@/contexts/BookingContext";
import RideSummary from "@/components/RideSummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const PassengerDetails = () => {
  const { t } = useTranslation();
  const { nextStep, bookingData, setPassengerDetails, setPassengers, setLuggage } = useBooking();
  const [formData, setFormData] = useState({
    firstName: bookingData.passengerDetails.firstName,
    lastName: bookingData.passengerDetails.lastName,
    email: bookingData.passengerDetails.email,
    phone: bookingData.passengerDetails.phone,
    notes: bookingData.passengerDetails.notes || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePassengersChange = (value: string) => {
    setPassengers(parseInt(value));
  };

  const handleLuggageChange = (value: string) => {
    const luggageCount = parseInt(value);
    // Assumindo que a bagagem será dividida entre small e large
    // Para simplificar, vamos colocar metade em cada ou ajustar conforme necessário
    const smallLuggage = Math.floor(luggageCount / 2);
    const largeLuggage = luggageCount - smallLuggage;
    setLuggage(smallLuggage, largeLuggage);
  };

  const handleContinue = () => {
    setPassengerDetails(formData);
    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-normal mb-6">{t('booking.passengerDetails')}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="firstName"
                placeholder={t('booking.name')}
                value={formData.firstName}
                onChange={handleChange}
                className="p-3 bg-gray-50"
              />
              <Input
                name="lastName"
                placeholder={t('booking.lastName')}
                value={formData.lastName}
                onChange={handleChange}
                className="p-3 bg-gray-50"
              />
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  name="email"
                  type="email"
                  placeholder={t('booking.emailAddress')}
                  value={formData.email}
                  onChange={handleChange}
                  className="p-3"
                />
              </div>
              <div>
                <Input
                  name="phone"
                  placeholder={t('booking.phoneNumber')}
                  value={formData.phone}
                  onChange={handleChange}
                  className="p-3"
                />
              </div>
            </div>

            {/* Options */}
            <h3 className="text-xl font-normal pt-4">{t('booking.options')}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={bookingData.passengers.toString()} onValueChange={handlePassengersChange}>
                <SelectTrigger className="p-3 bg-gray-50">
                  <SelectValue placeholder={t('booking.passengers')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 {t('booking.passenger')}</SelectItem>
                  <SelectItem value="2">2 {t('booking.passengers')}</SelectItem>
                  <SelectItem value="3">3 {t('booking.passengers')}</SelectItem>
                  <SelectItem value="4">4 {t('booking.passengers')}</SelectItem>
                  <SelectItem value="5">5 {t('booking.passengers')}</SelectItem>
                  <SelectItem value="6">6 {t('booking.passengers')}</SelectItem>
                  <SelectItem value="7">7 {t('booking.passengers')}</SelectItem>
                  <SelectItem value="8">8 {t('booking.passengers')}</SelectItem>
                  <SelectItem value="9">9 {t('booking.passengers')}</SelectItem>
                  <SelectItem value="10">10 {t('booking.passengers')}</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={(bookingData.luggage.small + bookingData.luggage.large).toString()} 
                onValueChange={handleLuggageChange}
              >
                <SelectTrigger className="p-3 bg-gray-50">
                  <SelectValue placeholder={t('booking.luggage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{t('booking.noLuggage')}</SelectItem>
                  <SelectItem value="1">1 {t('booking.luggage')}</SelectItem>
                  <SelectItem value="2">2 {t('booking.luggage')}</SelectItem>
                  <SelectItem value="3">3 {t('booking.luggage')}</SelectItem>
                  <SelectItem value="4">4 {t('booking.luggage')}</SelectItem>
                  <SelectItem value="5">5 {t('booking.luggage')}</SelectItem>
                  <SelectItem value="6">6 {t('booking.luggage')}</SelectItem>
                  <SelectItem value="7">7 {t('booking.luggage')}</SelectItem>
                  <SelectItem value="8">8 {t('booking.luggage')}</SelectItem>
                  <SelectItem value="9">9 {t('booking.luggage')}</SelectItem>
                  <SelectItem value="10">10 {t('booking.luggage')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes to driver */}
            <div>
              <Textarea
                name="notes"
                placeholder={t('booking.notesToDriver')}
                value={formData.notes}
                onChange={handleChange}
                className="w-full h-28 p-3"
              />
            </div>

            {/* Continue Button */}
            <div className="mt-6">
              <Button 
                onClick={handleContinue} 
                className="bg-black hover:bg-gray-800 text-white px-8 py-6 text-lg w-full md:w-auto font-normal"
              >
                {t('booking.continue')} <ChevronRight size={18} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          <RideSummary />
        </div>
      </div>
    </div>
  );
};

export default PassengerDetails;
