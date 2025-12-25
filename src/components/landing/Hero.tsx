import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Printer, FileCheck, Receipt, Monitor } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Hero = () => {
  const { user } = useAuth();

  return (
    <section className="relative gradient-hero min-h-screen flex items-center pt-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 leading-tight">
            Instant Printing & MP Online Services{' '}
            <span className="text-accent">Delivered</span> to Your Doorstep
          </h1>

          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Fast, reliable, and affordable solutions for all your printing and government service needs. We handle the paperwork so you don't have to!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to={user ? '/dashboard' : '/auth'}>
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold text-lg px-8 py-6">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <a href="#services">
              <Button size="lg" variant="ghost" className="border-2 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white font-semibold text-lg px-8 py-6 backdrop-blur-sm">
                View Services
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
              { icon: Printer, label: 'Printing', value: '50+', sublabel: 'Services' },
              { icon: FileCheck, label: 'Certificates', value: '100%', sublabel: 'Authentic' },
              { icon: Receipt, label: 'Bill Payments', value: '24/7', sublabel: 'Available' },
              { icon: Monitor, label: 'CSC Service', value: '10+', sublabel: 'Services' },
            ].map((stat, index) => (
              <div key={index} className="glass-card p-4 text-center">
                <stat.icon className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/70">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
