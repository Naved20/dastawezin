import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Services from '@/components/landing/Services';
import Contact from '@/components/landing/Contact';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';
import logo from '@/assets/logo.png';

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isPWA, setIsPWA] = useState(false);
  const [checkingPWA, setCheckingPWA] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

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
      // Show splash for at least 1.5 seconds for branding
      const timer = setTimeout(() => {
        setShowSplash(false);
        if (user) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/auth', { replace: true });
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isPWA, user, isLoading, checkingPWA, navigate]);

  // PWA Splash Screen
  if (isPWA && (checkingPWA || isLoading || showSplash)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="animate-fade-in flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
            <img 
              src={logo} 
              alt="Dastawez" 
              className="relative w-28 h-28 object-contain animate-pulse"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Dastawez
          </h1>
          <div className="flex gap-1.5 mt-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  // Non-PWA loading state
  if (checkingPWA || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <img src={logo} alt="Dastawez" className="w-16 h-16 animate-pulse" />
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
