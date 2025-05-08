
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// FAQ data with questions and answers
const faqItems = [
  {
    question: "O motorista é brasileiro ou fala português?",
    answer: "Sim, nossos motoristas são brasileiros ou fluentes em português para garantir a melhor comunicação e conforto durante sua viagem."
  },
  {
    question: "Onde encontro com o motorista no aeroporto?",
    answer: "O motorista estará esperando no setor de desembarque com uma placa contendo seu nome, facilitando o encontro imediato após sua chegada."
  },
  {
    question: "O motorista terá placa com o meu nome?",
    answer: "Sim, o motorista terá uma placa com seu nome para que você possa identificá-lo facilmente no aeroporto."
  },
  {
    question: "Por que preciso informar dia e horário do meu voo para obter o orçamento?",
    answer: "Essas informações são necessárias para planejarmos sua recepção no aeroporto e garantir que o veículo adequado esteja disponível, considerando possíveis atrasos ou antecipações."
  },
  {
    question: "Como funciona o serviço?",
    answer: "Oferecemos serviço de transfer privativo do aeroporto ao seu destino em Nova York, com conforto e segurança. Você reserva conosco antecipadamente, e um motorista estará aguardando por você na chegada."
  },
  {
    question: "Quais opções de passeios vocês trabalham?",
    answer: "Trabalhamos com uma variedade de passeios, incluindo City Tours por Nova York, visitas a pontos turísticos icônicos, tours de compras, entre outros, todos com guias que falam português."
  },
  {
    question: "Qual Outlet é melhor para compras?",
    answer: "A escolha do Outlet depende de suas preferências pessoais, mas estamos preparados para levá-lo aos mais populares, como o Woodbury Common Premium Outlets e o Jersey Gardens, oferecendo ótimas opções de compras."
  },
  {
    question: "Qual o roteiro de vocês para o City Tour?",
    answer: "Nosso City Tour abrange os principais pontos turísticos de Nova York, incluindo Times Square, Estátua da Liberdade, Central Park, entre outros, com flexibilidade para personalizar conforme seu interesse."
  },
  {
    question: "Como é o City Tour de carro?",
    answer: "O City Tour de carro é uma experiência privativa e confortável, permitindo que você veja os principais pontos turísticos da cidade com a conveniência de não precisar caminhar ou depender do transporte público."
  },
  {
    question: "Como funciona se o meu voo atrasar?",
    answer: "Monitoramos os voos e ajustamos a programação de acordo com qualquer atraso, garantindo que o motorista estará lá quando você chegar."
  },
  {
    question: "Como funciona se o meu voo for cancelado?",
    answer: "Em caso de cancelamento do voo, pedimos que entre em contato conosco o mais rápido possível para reagendar o serviço sem custos adicionais."
  },
  {
    question: "Como funciona caso a viagem seja cancelada?",
    answer: "Para cancelamentos da viagem, oferecemos reembolso total ou parcial, dependendo da antecedência do aviso de cancelamento."
  },
  {
    question: "Qual o melhor tipo de carro para idosos e crianças?",
    answer: "Oferecemos veículos espaçosos e confortáveis, com opções de assentos infantis e espaço adequado para acomodar idosos, garantindo segurança e conforto durante o transporte."
  },
  {
    question: "O que significa dizer que o orçamento é por trajeto/viagem?",
    answer: "Significa que o valor informado cobre todo o serviço de transporte de um ponto a outro, sem custos adicionais baseados em tempo ou distância."
  },
  {
    question: "Qual a melhor época para visitar New York?",
    answer: "Nova York é encantadora o ano todo, mas muitos preferem visitar na primavera (abril a junho) ou outono (setembro a novembro), quando o clima é mais ameno."
  },
  {
    question: "Posso reservar o transfer sem ter definido o hotel?",
    answer: "Sim, você pode reservar o serviço de transfer conosco, mas é importante informar o endereço final assim que possível para garantir o transporte adequado."
  },
  {
    question: "Vocês têm indicação de hotéis?",
    answer: "Sim, podemos oferecer recomendações de hotéis baseadas em nossas experiências e no feedback de clientes, considerando sua preferência de localização e orçamento."
  }
];

const FAQ = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-normal mb-10 text-center">Perguntas Frequentes</h2>
        
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-gray-200 rounded-lg px-6 py-2 shadow-sm"
              >
                <AccordionTrigger className="text-left font-normal">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
