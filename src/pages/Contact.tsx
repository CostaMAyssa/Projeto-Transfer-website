
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Footer from "@/components/Footer";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Here you would typically send the form data to your backend
      console.log("Form submitted:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Message sent successfully! We'll contact you soon.");
      form.reset();
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-[#111111] py-16 px-4 mt-16">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-light text-white mb-2">
            Contact Us
          </h1>
          <p className="text-lg text-gray-300 font-light max-w-2xl">
            Our team is available to help you with any information or service 24/7.
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="p-6 flex flex-col items-center text-center border-b border-gray-100">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gray-50">
              <Phone className="h-7 w-7 text-brand-500" />
            </div>
            <h3 className="text-xl font-light mb-2">Phone</h3>
            <p className="text-gray-500 mb-2 text-sm">Speak with our team</p>
            <a href="tel:+1 480-680-7664" className="text-brand-500 hover:underline">
              +1 (480) 680-7664
            </a>
          </div>

          <div className="p-6 flex flex-col items-center text-center border-b border-gray-100">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gray-50">
              <Mail className="h-7 w-7 text-brand-500" />
            </div>
            <h3 className="text-xl font-light mb-2">Email</h3>
            <p className="text-gray-500 mb-2 text-sm">We'll respond as soon as possible</p>
            <a href="mailto:info@aztransfer.com" className="text-brand-500 hover:underline">
              info@aztransfer.com
            </a>
          </div>

          <div className="p-6 flex flex-col items-center text-center border-b border-gray-100">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gray-50">
              <MapPin className="h-7 w-7 text-brand-500" />
            </div>
            <h3 className="text-xl font-light mb-2">Location</h3>
            <p className="text-gray-500 mb-2 text-sm">Visit our office</p>
            <p className="text-gray-700">
              Phoenix, Arizona
            </p>
          </div>

          <div className="p-6 flex flex-col items-center text-center border-b border-gray-100">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gray-50">
              <Clock className="h-7 w-7 text-brand-500" />
            </div>
            <h3 className="text-xl font-light mb-2">Hours</h3>
            <p className="text-gray-500 mb-2 text-sm">We're available for you</p>
            <p className="text-gray-700">
              24/7 - Always at your service
            </p>
          </div>
        </div>

        {/* Form and Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div className="p-8 border border-gray-100">
            <h2 className="text-2xl font-light mb-6">Send a Message</h2>
            <p className="text-gray-600 mb-8 font-light">
              Fill out the form below and our team will get back to you as soon as possible.
            </p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-light">Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} className="font-light" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-light">Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} className="font-light" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-light">Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="(123) 456-7890" {...field} className="font-light" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-light">Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Service booking" {...field} className="font-light" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-light">Your Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="How can we help you?" 
                          className="min-h-32 font-light" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="bg-brand-500 hover:bg-brand-600 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Form>
          </div>

          {/* FAQ Section */}
          <div className="p-8 border border-gray-100">
            <h2 className="text-2xl font-light mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-100 pb-5">
                  <h3 className="text-lg font-light mb-2">{faq.question}</h3>
                  <p className="text-gray-600 font-light">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-light mb-8 text-center">Follow Us on Social Media</h2>
          
          <div className="flex justify-center gap-8">
            <a href="https://www.facebook.com/aztransfer" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-brand-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            
            <a href="https://www.instagram.com/aztransfer" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-brand-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            
            <a href="https://wa.me/14806807664" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-brand-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Map Section - Moved to bottom */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-light mb-8 text-center">Find Us</h2>
          <div className="h-[400px] overflow-hidden border border-gray-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d214616.86204587483!2d-112.07403710797066!3d33.56197553928274!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x872b12ed50a179cb%3A0x8c69c7f8354a1bac!2sPhoenix%2C%20AZ%2C%20USA!5e0!3m2!1sen!2sbr!4v1704406673789!5m2!1sen!2sbr"
              className="w-full h-full border-0"
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Office Location"
            ></iframe>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// FAQ data
const faqs = [
  {
    question: "How far in advance should I book a transfer?",
    answer: "We recommend booking at least 24 hours in advance to ensure availability. For peak seasons or special events, it's advisable to book further in advance."
  },
  {
    question: "What happens if my flight is delayed?",
    answer: "Don't worry! We monitor all flights and our drivers adjust their schedule according to your actual arrival time, at no extra cost."
  },
  {
    question: "Is there an extra fee for luggage?",
    answer: "Standard luggage (up to 2 pieces per person) is included in the price. Additional or oversized luggage may incur extra costs."
  },
  {
    question: "How can I pay for the transfer service?",
    answer: "We accept all major credit cards, PayPal, and bank transfers. Payment is typically required at the time of booking to confirm your service."
  },
  {
    question: "What is the cancellation policy?",
    answer: "Free cancellation up to 24 hours before your scheduled pickup time. Cancellations within 24 hours may be subject to a fee."
  }
];

export default Contact;
