import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Services from '@/components/landing/Services';
import Contact from '@/components/landing/Contact';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isPWA, setIsPWA] = useState(false);
  const [checkingPWA, setCheckingPWA] = useState(true);

  useEffect(() => {
    // Detect if running as installed PWA (standalone mode)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    
    setIsPWA(isStandalone);
    setCheckingPWA(false);
  }, []);

  useEffect(() => {
    // Only redirect after we've checked PWA status and auth state
    if (checkingPWA || isLoading) return;

    if (isPWA) {
      if (user) {
        // Logged in PWA user → go to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // Not logged in PWA user → go to auth
        navigate('/auth', { replace: true });
      }
    }
  }, [isPWA, user, isLoading, checkingPWA, navigate]);

  // Show loading while checking PWA/auth status
  if (checkingPWA || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If PWA, we're redirecting, show loading
  if (isPWA) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Normal browser: show landing page
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
