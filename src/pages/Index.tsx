import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Services from '@/components/landing/Services';
import Contact from '@/components/landing/Contact';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Services />
      <Contact />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
