
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
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
      
      toast.success("Message sent successfully! We'll get back to you soon.");
      form.reset();
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen">
      {/* Hero Section */}
      <div className="bg-[#111111] py-20 px-4 text-center">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Have questions or need to book a service? Our team is here to help you 24/7.
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-brand-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Phone className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Phone</h3>
              <p className="text-gray-500 mb-4">Talk to our friendly team</p>
              <a href="tel:(123) 456-7890" className="text-brand-500 hover:underline">
                (123) 456-7890
              </a>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-brand-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email</h3>
              <p className="text-gray-500 mb-4">We'll respond as soon as possible</p>
              <a href="mailto:info@aztransfer.com" className="text-brand-500 hover:underline">
                info@aztransfer.com
              </a>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-brand-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Location</h3>
              <p className="text-gray-500 mb-4">Come visit our office</p>
              <p className="text-brand-500">
                123 Transfer Street, Phoenix, AZ 85001
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-brand-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Working Hours</h3>
              <p className="text-gray-500 mb-4">We're available for you</p>
              <p className="text-brand-500">
                24/7 - Always at your service
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6">Send Us a Message</h2>
            <p className="text-gray-600 mb-8">
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
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
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
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} />
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
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="(123) 456-7890" {...field} />
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
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Booking Inquiry" {...field} />
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
                      <FormLabel>Your Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="How can we help you?" 
                          className="min-h-32" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full md:w-auto px-8"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Form>
          </div>

          {/* Map */}
          <div className="h-full min-h-[400px] bg-gray-100 rounded-xl overflow-hidden shadow-lg">
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

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find quick answers to common questions about our services and booking process.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-none shadow">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Can't find the answer you're looking for?
            </p>
            <Button>
              Contact Our Support Team
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// FAQ data
const faqs = [
  {
    question: "How far in advance should I book a transfer?",
    answer: "We recommend booking at least 24 hours in advance to ensure availability. For peak seasons or special events, booking further ahead is advisable."
  },
  {
    question: "What happens if my flight is delayed?",
    answer: "Don't worry! We monitor all flight arrivals. Our drivers will adjust their schedule according to your actual arrival time at no extra cost."
  },
  {
    question: "Is there an extra charge for luggage?",
    answer: "Standard luggage (up to 2 pieces per person) is included in the price. Additional or oversized luggage may incur extra charges."
  },
  {
    question: "How can I pay for my transfer?",
    answer: "We accept all major credit cards, PayPal, and bank transfers. Payment is typically required at the time of booking to confirm your reservation."
  },
  {
    question: "What is your cancellation policy?",
    answer: "Free cancellation up to 24 hours before your scheduled pickup. Cancellations within 24 hours may be subject to a fee."
  }
];

export default Contact;
