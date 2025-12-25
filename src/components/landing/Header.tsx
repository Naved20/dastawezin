import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo.png';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Dastawez Logo" className="w-10 h-10 rounded-lg object-contain" />
          <span className="text-xl font-display font-bold text-foreground">Dastawez</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#services" className="text-muted-foreground hover:text-primary transition-colors">
            Services
          </a>
          <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
            Contact
          </a>
          <a href="#faq" className="text-muted-foreground hover:text-primary transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link to="/dashboard">
              <Button className="gradient-primary">Dashboard</Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button className="gradient-primary">Login / Sign Up</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
