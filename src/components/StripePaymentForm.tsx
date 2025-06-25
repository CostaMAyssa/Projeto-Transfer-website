import { useState } from "react";
import { useBooking } from "@/contexts/BookingContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const paymentSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  company: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  postal: z.string().min(1, "Postal code is required"),
  cardNumber: z.string().min(13, "Valid card number is required"),
  cardHolder: z.string().min(3, "Cardholder name is required"),
  expiryMonth: z.string().min(1, "Month is required"),
  expiryYear: z.string().min(4, "Year is required"),
  cvv: z.string().min(3, "CVV is required"),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
  newsletterSubscription: z.boolean().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const StripePaymentForm = () => {
  const { t } = useTranslation();
  const { completeBooking, bookingData, setPaymentDetails, calculateTotal } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const defaultValues = {
    firstName: bookingData.paymentDetails.firstName || bookingData.passengerDetails.firstName || "",
    lastName: bookingData.paymentDetails.lastName || bookingData.passengerDetails.lastName || "",
    company: bookingData.paymentDetails.company || "",
    address: bookingData.paymentDetails.address || "",
    country: bookingData.paymentDetails.country || "US",
    city: bookingData.paymentDetails.city || "",
    postal: bookingData.paymentDetails.postal || "",
    cardHolder: bookingData.paymentDetails.cardHolder || "",
    cardNumber: bookingData.paymentDetails.cardNumber || "",
    expiryMonth: bookingData.paymentDetails.expiryMonth || "",
    expiryYear: bookingData.paymentDetails.expiryYear || "",
    cvv: bookingData.paymentDetails.cvv || "",
    termsAccepted: bookingData.paymentDetails.termsAccepted || false,
    newsletterSubscription: bookingData.paymentDetails.newsletterSubscription || false,
  };

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues,
  });
  
  const onSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true);
    
    try {
      // Create a complete payment details object that matches PaymentDetails interface
      const paymentDetails = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        company: data.company,
        address: data.address || '',
        country: data.country || '',
        city: data.city || '',
        postal: data.postal || '',
        cardHolder: data.cardHolder,
        cardNumber: data.cardNumber,
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        cvv: data.cvv,
        termsAccepted: data.termsAccepted || false,
        newsletterSubscription: data.newsletterSubscription || false,
      };
      
      // Update payment details in context
      setPaymentDetails(paymentDetails);
      
      // Calculate total price
      const { total } = await calculateTotal();
      
      // Mock payment processing function
      const mockPaymentProcess = async (params: { 
        body: { 
          paymentDetails: Record<string, unknown>; 
          bookingData: Record<string, unknown> 
        } 
      }) => {
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock success response
        return { error: null };
      };
      
      // Process payment
      const { error } = await mockPaymentProcess({ 
        body: { 
          paymentDetails: paymentDetails, 
          bookingData: {
            ...bookingData,
            total,
          }
        }
      });

      if (error) {
        console.error("Payment error:", error);
        toast({
          title: "Payment Failed",
          description: error.message || "There was a problem processing your payment",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Handle successful payment
      toast({
        title: "Payment Successful",
        description: "Your booking has been confirmed",
      });
      
      // Complete the booking
      completeBooking();
      
    } catch (error) {
      console.error("Payment submission error:", error);
      toast({
        title: "Payment Error",
        description: "There was a problem processing your payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-2xl font-bold mb-6">{t('payment.billingAddress')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payment.firstName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('payment.firstName')} className="p-3 bg-gray-50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payment.lastName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('payment.lastName')} className="p-3 bg-gray-50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('payment.company')}</FormLabel>
              <FormControl>
                <Input placeholder={t('payment.company')} className="p-3 bg-gray-50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('payment.address')}</FormLabel>
              <FormControl>
                <Input placeholder={t('payment.address')} className="p-3 bg-gray-50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payment.country')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('payment.country')} className="p-3 bg-gray-50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payment.city')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('payment.city')} className="p-3 bg-gray-50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="postal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payment.postalCode')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('payment.postalCode')} className="p-3 bg-gray-50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <h3 className="text-xl font-semibold pt-4">{t('payment.creditCardPayment')}</h3>

        <FormField
          control={form.control}
          name="cardHolder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('payment.cardHolderName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('payment.cardHolderName')} className="p-3 bg-gray-50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cardNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('payment.cardNumber')}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={t('payment.cardNumber')} 
                  className="p-3 bg-gray-50" 
                  maxLength={19}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="expiryMonth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payment.month')}</FormLabel>
                <FormControl>
                  <Input placeholder="MM" className="p-3 bg-gray-50" maxLength={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="expiryYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payment.year')}</FormLabel>
                <FormControl>
                  <Input placeholder="YYYY" className="p-3 bg-gray-50" maxLength={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cvv"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payment.cvv')}</FormLabel>
                <FormControl>
                  <Input placeholder="CVV" className="p-3 bg-gray-50" maxLength={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2 my-4">
          <div className="w-10 h-6 bg-gray-200 rounded"></div>
          <div className="w-10 h-6 bg-gray-200 rounded"></div>
          <div className="w-10 h-6 bg-gray-200 rounded"></div>
        </div>

        <p className="text-sm text-gray-600">
          {t('payment.cardInfo')}
        </p>

        <div className="space-y-3 pt-4">
          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {t('payment.termsConditions')}
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="newsletterSubscription"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {t('payment.newsletter')}
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isProcessing}
          className="bg-black hover:bg-gray-800 text-white px-8 py-6 text-lg w-full md:w-auto mt-6"
        >
          {isProcessing ? t('payment.processing') : t('payment.bookNow')} <ChevronRight size={18} className="ml-1" />
        </Button>
      </form>
    </Form>
  );
};

export default StripePaymentForm;
