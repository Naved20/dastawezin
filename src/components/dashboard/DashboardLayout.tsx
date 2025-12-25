import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import NotificationBell from '@/components/NotificationBell';
import logo from '@/assets/logo.png';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FolderOpen,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const userNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: ShoppingCart, label: 'New Order', href: '/dashboard/new-order' },
  { icon: Package, label: 'My Orders', href: '/dashboard/orders' },
  { icon: FolderOpen, label: 'My Documents', href: '/dashboard/documents' },
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setSidebarOpen(false);
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-16 flex items-center justify-between px-4">
        <div className="flex items-center">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-muted rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="flex items-center gap-2 ml-3">
            <img src={logo} alt="Dastawez Logo" className="w-8 h-8 rounded-lg object-contain" />
            <span className="text-lg font-display font-bold">Dastawez</span>
          </Link>
        </div>
        <NotificationBell />
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Dastawez Logo" className="w-10 h-10 rounded-lg object-contain" />
            <span className="text-xl font-display font-bold text-sidebar-foreground">Dastawez</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-sidebar-accent rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <nav className="p-4 space-y-2">
            {userNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent border-t border-sidebar-border mt-4 pt-4"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium">Admin Panel</span>
              </Link>
            )}
          </nav>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-sidebar-foreground/60">User</p>
            </div>
          </div>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-end h-16 px-8 border-b border-border bg-card">
          <NotificationBell />
        </header>
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
