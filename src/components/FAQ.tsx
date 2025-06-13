import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

const FAQ = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  
  // FAQ data with questions and answers using translations
  const faqItems = [
    {
      question: t('faq.questions.driverLanguage'),
      answer: t('faq.answers.driverLanguage')
    },
    {
      question: t('faq.questions.airportMeeting'),
      answer: t('faq.answers.airportMeeting')
    },
    {
      question: t('faq.questions.nameSign'),
      answer: t('faq.answers.nameSign')
    },
    {
      question: t('faq.questions.flightInfo'),
      answer: t('faq.answers.flightInfo')
    },
    {
      question: t('faq.questions.howItWorks'),
      answer: t('faq.answers.howItWorks')
    },
    {
      question: t('faq.questions.tourOptions'),
      answer: t('faq.answers.tourOptions')
    },
    {
      question: t('faq.questions.bestOutlet'),
      answer: t('faq.answers.bestOutlet')
    },
    {
      question: t('faq.questions.cityTourRoute'),
      answer: t('faq.answers.cityTourRoute')
    },
    {
      question: t('faq.questions.carCityTour'),
      answer: t('faq.answers.carCityTour')
    },
    {
      question: t('faq.questions.flightDelay'),
      answer: t('faq.answers.flightDelay')
    },
    {
      question: t('faq.questions.flightCancellation'),
      answer: t('faq.answers.flightCancellation')
    },
    {
      question: t('faq.questions.tripCancellation'),
      answer: t('faq.answers.tripCancellation')
    },
    {
      question: t('faq.questions.bestCarType'),
      answer: t('faq.answers.bestCarType')
    },
    {
      question: t('faq.questions.pricingMeaning'),
      answer: t('faq.answers.pricingMeaning')
    },
    {
      question: t('faq.questions.bestTimeToVisit'),
      answer: t('faq.answers.bestTimeToVisit')
    },
    {
      question: t('faq.questions.bookWithoutHotel'),
      answer: t('faq.answers.bookWithoutHotel')
    },
    {
      question: t('faq.questions.hotelRecommendations'),
      answer: t('faq.answers.hotelRecommendations')
    }
  ];
  
  // Split items into two arrays for desktop view
  const midIndex = Math.ceil(faqItems.length / 2);
  const leftColumnItems = faqItems.slice(0, midIndex);
  const rightColumnItems = faqItems.slice(midIndex);
  
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-normal mb-10 text-center">{t('faq.title')}</h2>
        
        {isMobile ? (
          // Mobile view - Single column
          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`} 
                  className="border border-gray-200 rounded-lg shadow-sm px-[25px] py-0"
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
        ) : (
          // Desktop view - Two columns
          <div className="grid grid-cols-2 gap-6 max-w-7xl mx-auto">
            {/* Left column */}
            <div>
              <Accordion type="single" collapsible className="w-full space-y-4">
                {leftColumnItems.map((item, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-left-${index}`} 
                    className="border border-gray-200 rounded-lg shadow-sm px-[25px] py-0"
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
            
            {/* Right column */}
            <div>
              <Accordion type="single" collapsible className="w-full space-y-4">
                {rightColumnItems.map((item, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-right-${index}`} 
                    className="border border-gray-200 rounded-lg shadow-sm px-[25px] py-0"
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
        )}
      </div>
    </section>
  );
};

export default FAQ;
