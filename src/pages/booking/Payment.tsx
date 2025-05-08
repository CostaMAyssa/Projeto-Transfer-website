
import { useBooking } from "@/contexts/BookingContext";
import RideSummary from "@/components/RideSummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const Payment = () => {
  const { completeBooking, bookingData, setPaymentDetails } = useBooking();
  const [formData, setFormData] = useState({
    firstName: bookingData.paymentDetails.firstName || bookingData.passengerDetails.firstName || '',
    lastName: bookingData.paymentDetails.lastName || bookingData.passengerDetails.lastName || '',
    company: bookingData.paymentDetails.company || '',
    address: bookingData.paymentDetails.address || '',
    country: bookingData.paymentDetails.country || 'UK',
    city: bookingData.paymentDetails.city || 'London',
    postal: bookingData.paymentDetails.postal || '',
    cardHolder: bookingData.paymentDetails.cardHolder || '',
    cardNumber: bookingData.paymentDetails.cardNumber || '',
    expiryMonth: bookingData.paymentDetails.expiryMonth || '',
    expiryYear: bookingData.paymentDetails.expiryYear || '',
    cvv: bookingData.paymentDetails.cvv || '',
    termsAccepted: bookingData.paymentDetails.termsAccepted || false,
    newsletterSubscription: bookingData.paymentDetails.newsletterSubscription || false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleBookNow = () => {
    if (!formData.termsAccepted) {
      alert("Please accept the terms and conditions");
      return;
    }
    
    setPaymentDetails(formData);
    completeBooking();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Billing Address</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="firstName"
                placeholder="Name"
                value={formData.firstName}
                onChange={handleInputChange}
                className="p-3 bg-gray-50"
              />
              <Input
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                className="p-3 bg-gray-50"
              />
            </div>

            {/* Company Field */}
            <Input
              name="company"
              placeholder="Company"
              value={formData.company}
              onChange={handleInputChange}
              className="p-3 bg-gray-50"
            />

            {/* Address Field */}
            <Input
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleInputChange}
              className="p-3 bg-gray-50"
            />

            {/* Country, City, Postal Code */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select 
                value={formData.country}
                onValueChange={(value) => handleSelectChange('country', value)}
              >
                <SelectTrigger className="p-3">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UK">UK</SelectItem>
                  <SelectItem value="USA">USA</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={formData.city}
                onValueChange={(value) => handleSelectChange('city', value)}
              >
                <SelectTrigger className="p-3">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="London">London</SelectItem>
                  <SelectItem value="Manchester">Manchester</SelectItem>
                  <SelectItem value="Birmingham">Birmingham</SelectItem>
                </SelectContent>
              </Select>

              <Input
                name="postal"
                placeholder="ZIP / Postal code"
                value={formData.postal}
                onChange={handleInputChange}
                className="p-3"
              />
            </div>

            {/* Payment Method Selection */}
            <h3 className="text-xl font-semibold pt-4">Select Payment Method</h3>

            <Select defaultValue="creditCard">
              <SelectTrigger className="p-3">
                <SelectValue placeholder="Credit Card" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="creditCard">Credit Card</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="bankTransfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>

            {/* Credit Card Payment Section */}
            <h3 className="text-xl font-semibold pt-4">Credit Card Payment</h3>

            <Input
              name="cardHolder"
              placeholder="Card Holder Name"
              value={formData.cardHolder}
              onChange={handleInputChange}
              className="p-3 bg-gray-50"
            />

            <Input
              name="cardNumber"
              placeholder="Card Number"
              value={formData.cardNumber}
              onChange={handleInputChange}
              className="p-3 bg-gray-50"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Select 
                value={formData.expiryMonth}
                onValueChange={(value) => handleSelectChange('expiryMonth', value)}
              >
                <SelectTrigger className="p-3">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = i + 1;
                    return <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                      {month.toString().padStart(2, '0')}
                    </SelectItem>;
                  })}
                </SelectContent>
              </Select>

              <Select
                value={formData.expiryYear}
                onValueChange={(value) => handleSelectChange('expiryYear', value)}
              >
                <SelectTrigger className="p-3">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>;
                  })}
                </SelectContent>
              </Select>

              <Input
                name="cvv"
                placeholder="CVV"
                value={formData.cvv}
                onChange={handleInputChange}
                className="p-3"
                maxLength={3}
              />
            </div>

            {/* Payment Icons */}
            <div className="flex gap-2 my-4">
              <div className="w-10 h-6 bg-gray-200 rounded"></div>
              <div className="w-10 h-6 bg-gray-200 rounded"></div>
              <div className="w-10 h-6 bg-gray-200 rounded"></div>
              <div className="w-10 h-6 bg-gray-200 rounded"></div>
              <div className="w-10 h-6 bg-gray-200 rounded"></div>
            </div>

            <p className="text-sm text-gray-600">
              The credit card must be issued in the driver's name. Debit cards are accepted at some locations and for some car categories.
            </p>

            {/* Terms & Newsletter */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => handleCheckboxChange('termsAccepted', checked === true)}
                />
                <Label htmlFor="terms" className="text-sm">
                  I accept the Terms & Conditions - Booking Conditions and Privacy Policy. *
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="newsletter" 
                  checked={formData.newsletterSubscription}
                  onCheckedChange={(checked) => handleCheckboxChange('newsletterSubscription', checked === true)}
                />
                <Label htmlFor="newsletter" className="text-sm">
                  I want to subscribe to Transfero's newsletter (Travel tips and special deals)
                </Label>
              </div>
            </div>

            {/* Book Now Button */}
            <div className="mt-6">
              <Button 
                onClick={handleBookNow} 
                className="bg-black hover:bg-gray-800 text-white px-8 py-6 text-lg w-full md:w-auto"
              >
                Book Now <ChevronRight size={18} className="ml-1" />
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

export default Payment;
