import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Clock, Instagram, Facebook } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Footer from "@/components/Footer";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters")
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    }
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

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = "pk.eyJ1IjoiZmF1c3RvbGFnYXJlcyIsImEiOiJjbWFnNnB6aTYwYWNxMm5vZmJyMnFicWFvIn0.89qV4FAa3hPg15kITsNwLA";
    
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11", // Light style as base for B&W
      center: [-74.006, 40.7128], // NYC coordinates
      zoom: 12,
    });

    // Add marker for office location
    const marker = new mapboxgl.Marker({
      color: "#070A0D" // Updated to new black color
    })
      .setLngLat([-74.006, 40.7128])
      .addTo(mapRef.current);

    // Apply black and white styling after map loads
    mapRef.current.on('load', () => {
      if (!mapRef.current) return;
      
      // Style the map in monochrome
      mapRef.current.setPaintProperty('background', 'background-color', '#FFFFFE');
      mapRef.current.setPaintProperty('water', 'fill-color', '#EDECE6');
      mapRef.current.setPaintProperty('land', 'background-color', '#FFFFFE');
      
      // Adjust colors of various map layers to create a B&W effect
      const layers = ['road', 'building', 'admin', 'water', 'landuse'];
      layers.forEach(layer => {
        const layerIds = mapRef.current?.getStyle().layers
          .filter(l => l.id.includes(layer))
          .map(l => l.id);
          
        layerIds?.forEach(layerId => {
          if (mapRef.current?.getLayer(layerId)) {
            if (mapRef.current?.getPaintProperty(layerId, 'fill-color')) {
              mapRef.current?.setPaintProperty(layerId, 'fill-color', '#EDECE6');
            }
            if (mapRef.current?.getPaintProperty(layerId, 'line-color')) {
              mapRef.current?.setPaintProperty(layerId, 'line-color', '#070A0D');
            }
          }
        });
      });
    });
    
    // Cleanup on unmount
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-[#070A0D] py-16 px-4 mt-16">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-light text-white mb-2 text-center">
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
          <div className="p-6 flex flex-col items-center text-center border-b border-[#EDECE6]">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-[#EDECE6]">
              <Phone className="h-7 w-7 text-[#DA3237]" />
            </div>
            <h3 className="text-xl font-light mb-2">Phone</h3>
            <p className="text-gray-500 mb-2 text-sm">Speak with our team</p>
            <a href="tel:+13478487765" className="text-[#DA3237] hover:underline">+1 (347) 848-7765</a>
          </div>

          <div className="p-6 flex flex-col items-center text-center border-b border-[#EDECE6]">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-[#EDECE6]">
              <Mail className="h-7 w-7 text-[#DA3237]" />
            </div>
            <h3 className="text-xl font-light mb-2">Email</h3>
            <p className="text-gray-500 mb-2 text-sm">We'll respond as soon as possible</p>
            <a href="mailto:hello@aztransfergroup.com" className="text-[#DA3237] hover:underline">hello@aztransfergroup.com</a>
          </div>

          <div className="p-6 flex flex-col items-center text-center border-b border-[#EDECE6]">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-[#EDECE6]">
              <MapPin className="h-7 w-7 text-[#DA3237]" />
            </div>
            <h3 className="text-xl font-light mb-2">Location</h3>
            <p className="text-gray-500 mb-2 text-sm">Visit our office</p>
            <p className="text-gray-700">New York City, NY</p>
          </div>

          <div className="p-6 flex flex-col items-center text-center border-b border-[#EDECE6]">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-[#EDECE6]">
              <Clock className="h-7 w-7 text-[#DA3237]" />
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
          {/* Contact Form - Styled to match booking page */}
          <div className="bg-white border border-[#EDECE6] rounded-lg overflow-hidden shadow-sm">
            <div className="p-8">
              <h2 className="text-2xl font-light mb-6">Send a Message</h2>
              <p className="text-gray-600 mb-8 font-light">
                Fill out the form below and our team will get back to you as soon as possible.
              </p>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({
                    field
                  }) => <FormItem>
                          <FormLabel className="font-light">Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} className="font-light" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    
                    <FormField control={form.control} name="email" render={({
                    field
                  }) => <FormItem>
                          <FormLabel className="font-light">Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" {...field} className="font-light" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="phone" render={({
                    field
                  }) => <FormItem>
                          <FormLabel className="font-light">Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="(123) 456-7890" {...field} className="font-light" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    
                    <FormField control={form.control} name="subject" render={({
                    field
                  }) => <FormItem>
                          <FormLabel className="font-light">Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Service booking" {...field} className="font-light" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                  </div>

                  <FormField control={form.control} name="message" render={({
                  field
                }) => <FormItem>
                        <FormLabel className="font-light">Your Message</FormLabel>
                        <FormControl>
                          <Textarea placeholder="How can we help you?" className="min-h-32 font-light" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />

                  <Button type="submit" className="bg-[#DA3237] hover:bg-[#b32029] text-white font-light" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>

          {/* FAQ Section - Styled to match booking page */}
          <div className="bg-white border border-[#EDECE6] rounded-lg overflow-hidden shadow-sm">
            <div className="p-8">
              <h2 className="text-2xl font-light mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {faqs.map((faq, index) => <div key={index} className="border-b border-[#EDECE6] pb-5">
                    <h3 className="text-lg font-light mb-2">{faq.question}</h3>
                    <p className="text-gray-600 font-light">{faq.answer}</p>
                  </div>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-light mb-8 text-center">Follow Us on Social Media</h2>
          
          <div className="flex justify-center gap-8">
            <a href="https://www.instagram.com/aztransfer_oficial" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#DA3237]">
              <Instagram size={24} />
              <span className="sr-only">Instagram</span>
            </a>
            
            <a href="https://www.facebook.com/aztransferoficial" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#DA3237]">
              <Facebook size={24} />
              <span className="sr-only">Facebook</span>
            </a>
            
            <a href="https://www.tiktok.com/@aztransfer_oficial" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#DA3237]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
              </svg>
              <span className="sr-only">TikTok</span>
            </a>
          </div>
        </div>
      </div>

      {/* Map Section - Changed from bg-[#EDECE6] to bg-white */}
      <div className="w-full bg-white py-16">
        <h2 className="text-2xl font-light mb-8 text-center">Find Us</h2>
        <div className="h-[500px] w-full" ref={mapContainerRef}></div>
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
