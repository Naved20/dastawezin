import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ = () => {
  const faqs = [
    {
      question: 'How long does it take to process government documents?',
      answer: 'Processing time varies by document type. Most government certificates take 7-15 working days depending on the department. We keep you updated throughout the process.',
    },
    {
      question: 'What documents do I need to provide for certificate applications?',
      answer: 'Required documents vary by certificate type. Generally, you need ID proof (Aadhaar/Voter ID), address proof, and relevant supporting documents. We provide a complete checklist when you place an order.',
    },
    {
      question: 'Do you offer delivery services?',
      answer: 'Yes! We offer doorstep delivery for all completed documents within our service area. Delivery charges may apply based on your location.',
    },
    {
      question: 'How do I pay for your services?',
      answer: 'We accept all major payment methods including UPI, debit/credit cards, net banking, and cash on delivery for eligible orders.',
    },
    {
      question: 'Can you help with corrections in official documents?',
      answer: 'Yes, we assist with corrections in various official documents including birth certificates, caste certificates, and other government-issued documents. Contact us with your specific requirement.',
    },
  ];

  return (
    <section id="faq" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Find answers to common questions about our services
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-display font-semibold hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
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
