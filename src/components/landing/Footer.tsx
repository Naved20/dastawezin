import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

const Footer = () => {
  const services = [
    'MP Online Services',
    'Academic Forms',
    'Document Services',
    'Digital Services',
    'Exam Forms',
    'Invoice',
  ];

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Dastawez Logo" className="w-10 h-10 rounded-lg object-contain" />
              <span className="text-xl font-display font-bold">Dastawez</span>
            </div>
            <p className="text-background/70 mb-4">
              Your trusted partner for all document and government service needs.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Services</h4>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service}>
                  <a href="#services" className="text-background/70 hover:text-primary transition-colors">
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Contact Info</h4>
            <ul className="space-y-2 text-background/70">
              <li>📍 Bhopal, Madhya Pradesh, India</li>
              <li>
                <a href="tel:+917898282349" className="hover:text-primary transition-colors">
                  📞 +91-7898282349
                </a>
              </li>
              <li>
                <a href="mailto:dastawez.in@gmail.com" className="hover:text-primary transition-colors">
                  ✉️ dastawez.in@gmail.com
                </a>
              </li>
              <li>
                <a href="https://linktr.ee/dastawez" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  🔗 Link Tree
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/60 text-sm">
            © {new Date().getFullYear()} Dastawez. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
