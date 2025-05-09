
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
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Por favor informe um email válido"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Assunto deve ter pelo menos 3 caracteres"),
  message: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
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
      
      toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
      form.reset();
    } catch (error) {
      toast.error("Falha ao enviar mensagem. Por favor tente novamente.");
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
            Entre em Contato
          </h1>
          <p className="text-lg text-gray-300 font-light max-w-2xl">
            Nosso time está disponível para ajudar você com qualquer informação ou serviço 24/7.
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
            <h3 className="text-xl font-light mb-2">Telefone</h3>
            <p className="text-gray-500 mb-2 text-sm">Fale com nossa equipe</p>
            <a href="tel:+1 480-680-7664" className="text-brand-500 hover:underline">
              +1 (480) 680-7664
            </a>
          </div>

          <div className="p-6 flex flex-col items-center text-center border-b border-gray-100">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gray-50">
              <Mail className="h-7 w-7 text-brand-500" />
            </div>
            <h3 className="text-xl font-light mb-2">Email</h3>
            <p className="text-gray-500 mb-2 text-sm">Responderemos o mais rápido possível</p>
            <a href="mailto:info@aztransfer.com" className="text-brand-500 hover:underline">
              info@aztransfer.com
            </a>
          </div>

          <div className="p-6 flex flex-col items-center text-center border-b border-gray-100">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gray-50">
              <MapPin className="h-7 w-7 text-brand-500" />
            </div>
            <h3 className="text-xl font-light mb-2">Localização</h3>
            <p className="text-gray-500 mb-2 text-sm">Visite nosso escritório</p>
            <p className="text-gray-700">
              Phoenix, Arizona
            </p>
          </div>

          <div className="p-6 flex flex-col items-center text-center border-b border-gray-100">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gray-50">
              <Clock className="h-7 w-7 text-brand-500" />
            </div>
            <h3 className="text-xl font-light mb-2">Horário</h3>
            <p className="text-gray-500 mb-2 text-sm">Estamos disponíveis para você</p>
            <p className="text-gray-700">
              24/7 - Sempre ao seu serviço
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div className="p-8 border border-gray-100">
            <h2 className="text-2xl font-light mb-6">Envie uma Mensagem</h2>
            <p className="text-gray-600 mb-8 font-light">
              Preencha o formulário abaixo e nossa equipe entrará em contato o mais rápido possível.
            </p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-light">Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="João Silva" {...field} className="font-light" />
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
                          <Input placeholder="joao@exemplo.com" {...field} className="font-light" />
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
                        <FormLabel className="font-light">Telefone (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 98765-4321" {...field} className="font-light" />
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
                        <FormLabel className="font-light">Assunto</FormLabel>
                        <FormControl>
                          <Input placeholder="Reserva de serviço" {...field} className="font-light" />
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
                      <FormLabel className="font-light">Sua Mensagem</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Como podemos te ajudar?" 
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
                  {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                </Button>
              </form>
            </Form>
          </div>

          {/* Map */}
          <div className="h-full min-h-[400px] overflow-hidden border border-gray-100">
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
            <h2 className="text-2xl font-light mb-2">Perguntas Frequentes</h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-light">
              Encontre respostas rápidas para perguntas comuns sobre nossos serviços e processo de reserva.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-5">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-5">
                <h3 className="text-lg font-light mb-2">{faq.question}</h3>
                <p className="text-gray-600 font-light">{faq.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <p className="text-gray-600 mb-4 font-light">
              Não encontrou a resposta que procura?
            </p>
            <Button className="bg-brand-500 hover:bg-brand-600 text-white">
              Entre em Contato com Nossa Equipe
            </Button>
          </div>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-light mb-8 text-center">Siga-nos nas Redes Sociais</h2>
          
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

      <Footer />
    </div>
  );
};

// FAQ data
const faqs = [
  {
    question: "Qual a antecedência recomendada para reservar um transfer?",
    answer: "Recomendamos reservar com pelo menos 24 horas de antecedência para garantir disponibilidade. Para temporadas de pico ou eventos especiais, é aconselhável reservar com mais antecedência."
  },
  {
    question: "O que acontece se meu voo atrasar?",
    answer: "Não se preocupe! Monitoramos todos os voos e nossos motoristas ajustam o horário conforme seu tempo real de chegada, sem custo adicional."
  },
  {
    question: "Há alguma taxa extra para bagagem?",
    answer: "Bagagem padrão (até 2 peças por pessoa) está incluída no preço. Bagagem adicional ou de grandes dimensões pode ter custos extras."
  },
  {
    question: "Como posso pagar pelo serviço de transfer?",
    answer: "Aceitamos todos os principais cartões de crédito, PayPal e transferências bancárias. O pagamento geralmente é necessário no momento da reserva para confirmar seu serviço."
  },
  {
    question: "Qual é a política de cancelamento?",
    answer: "Cancelamento gratuito até 24 horas antes do horário agendado para busca. Cancelamentos dentro de 24 horas podem estar sujeitos a uma taxa."
  }
];

export default Contact;
