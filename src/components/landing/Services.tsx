import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CreditCard, Image, FileText, BookOpen,
  Home, IndianRupee, Users, Baby,
  Zap, Droplet, Smartphone,
  Fingerprint, Briefcase
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard,
  Image,
  FileText,
  BookOpen,
  Home,
  IndianRupee,
  Users,
  Baby,
  Zap,
  Droplet,
  Smartphone,
  Fingerprint,
  Briefcase,
};

interface Service {
  name: string;
  description: string;
  icon: string;
  price: number;
}

interface ServiceCategoryProps {
  title: string;
  description: string;
  services: Service[];
  gradient: string;
}

const ServiceCategory = ({ title, description, services, gradient }: ServiceCategoryProps) => {
  return (
    <div className="mb-16">
      <div className="text-center mb-8">
        <h3 className={`text-2xl font-display font-bold ${gradient} bg-clip-text text-transparent inline-block`}>
          {title}
        </h3>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((service, index) => {
          const IconComponent = iconMap[service.icon] || FileText;
          return (
            <Card key={index} className="hover-lift cursor-pointer border-border/50 hover:border-primary/50 transition-all">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg font-display">{service.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                <p className="text-primary font-semibold">₹{service.price}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const Services = () => {
  const categories = [
    {
      title: '🖨️ Printing Services',
      description: 'Professional printing solutions for all your needs',
      gradient: 'bg-gradient-to-r from-primary to-accent',
      services: [
        { name: 'ID Card Printing', description: 'Professional ID card printing with lamination', icon: 'CreditCard', price: 50 },
        { name: 'Photo Printing', description: 'Passport size and other photo prints', icon: 'Image', price: 20 },
        { name: 'Document Printing', description: 'A4/A3 document printing', icon: 'FileText', price: 5 },
        { name: 'Brochure Printing', description: 'Business brochures and flyers', icon: 'BookOpen', price: 100 },
      ],
    },
    {
      title: '📜 Government Certificates',
      description: 'Official government certificate services',
      gradient: 'bg-gradient-to-r from-green-500 to-emerald-400',
      services: [
        { name: 'Domicile Certificate', description: 'Government domicile certificate', icon: 'Home', price: 150 },
        { name: 'Income Certificate', description: 'Government income certificate', icon: 'IndianRupee', price: 100 },
        { name: 'Caste Certificate', description: 'Government caste certificate', icon: 'Users', price: 100 },
        { name: 'Birth Certificate', description: 'Government birth certificate', icon: 'Baby', price: 150 },
      ],
    },
    {
      title: '💳 Bill Payments',
      description: 'Pay all your utility bills in one place',
      gradient: 'bg-gradient-to-r from-orange-500 to-amber-400',
      services: [
        { name: 'Electricity Bill', description: 'Pay your electricity bills', icon: 'Zap', price: 10 },
        { name: 'Water Bill', description: 'Pay your water bills', icon: 'Droplet', price: 10 },
        { name: 'Mobile Recharge', description: 'Prepaid and postpaid recharge', icon: 'Smartphone', price: 5 },
      ],
    },
    {
      title: '🏛️ CSC Services',
      description: 'All your government online services',
      gradient: 'bg-gradient-to-r from-purple-500 to-pink-400',
      services: [
        { name: 'PAN Card', description: 'Apply for new or correction in PAN', icon: 'CreditCard', price: 200 },
        { name: 'Aadhaar Update', description: 'Update Aadhaar details', icon: 'Fingerprint', price: 100 },
        { name: 'E-Shram Card', description: 'Register for E-Shram card', icon: 'Briefcase', price: 50 },
      ],
    },
  ];

  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Our Services
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Everything You Need, One Place
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From printing to government certificates, we've got all your document needs covered with fast and reliable service.
          </p>
        </div>

        {categories.map((category, index) => (
          <ServiceCategory key={index} {...category} />
        ))}
      </div>
    </section>
  );
};

export default Services;
