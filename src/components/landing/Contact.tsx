import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Phone, Mail, Link as LinkIcon } from 'lucide-react';

const Contact = () => {
  const contactMethods = [
    {
      icon: MessageCircle,
      title: 'Chat on WhatsApp',
      description: 'Quick responses during business hours',
      action: 'Message Us',
      href: 'https://wa.me/917898282349',
      color: 'bg-green-500',
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Monday to Saturday: 9AM - 7PM',
      action: '+91-7898282349',
      href: 'tel:+917898282349',
      color: 'bg-primary',
    },
    {
      icon: Mail,
      title: 'Email Us',
      description: 'For detailed inquiries',
      action: 'Email Us',
      href: 'mailto:dastawez.in@gmail.com',
      color: 'bg-accent',
    },
    {
      icon: LinkIcon,
      title: 'Link Tree',
      description: 'Visit our more social platforms',
      action: 'Linktree',
      href: 'https://linktr.ee/dastawez',
      color: 'bg-purple-500',
    },
  ];

  return (
    <section id="contact" className="py-20 gradient-primary-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-white/10 text-white rounded-full text-sm font-medium mb-4">
            Contact Us
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Have questions or need assistance?
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            We're here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 h-full">
                <CardContent className="p-6 text-center">
                  <div className={`w-14 h-14 ${method.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <method.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-white mb-1">
                    {method.title}
                  </h3>
                  <p className="text-white/70 text-sm mb-3">{method.description}</p>
                  <span className="text-accent font-medium text-sm">{method.action}</span>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Contact;
