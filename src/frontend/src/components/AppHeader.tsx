import { useState } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetOwnShopProfiles, useGetShopkeeperNotifications, useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Bell, Heart, FileText, AlertTriangle, Shield } from 'lucide-react';
import LoginButton from './LoginButton';

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { identity } = useInternetIdentity();
  const { data: ownShops } = useGetOwnShopProfiles();
  const { data: isAdmin } = useIsCallerAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const firstShopId = ownShops && ownShops.length > 0 ? ownShops[0].id.toString() : null;
  const { data: notifications } = useGetShopkeeperNotifications(firstShopId);
  const unreadCount = notifications?.length || 0;

  const isAuthenticated = !!identity;
  const isShopkeeper = ownShops && ownShops.length > 0;

  const navItems = [
    { label: 'Discover', path: '/', show: true },
    { label: 'Cart', path: '/cart', show: isAuthenticated },
    { label: 'Wishlist', path: '/wishlist', show: isAuthenticated },
    { label: 'Claims', path: '/claims', show: isAuthenticated },
    { label: 'Reports', path: '/reports', show: isAuthenticated },
    { label: 'My Products', path: '/shopkeeper/products', show: isShopkeeper },
    { label: 'Inbox', path: '/shopkeeper/inbox', show: isShopkeeper },
    { label: 'Admin', path: '/admin', show: isAdmin },
  ];

  const visibleNavItems = navItems.filter(item => item.show);

  const handleNavigation = (path: string) => {
    navigate({ to: path });
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigation('/')}>
            <img src="/assets/generated/bargen-logo.dim_512x512.png" alt="Bargen" className="h-8 w-8" />
            <span className="text-xl font-bold text-foreground">Bargen</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {visibleNavItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => handleNavigation(item.path)}
                className={location.pathname === item.path ? 'text-primary' : ''}
              >
                {item.label === 'Wishlist' && <Heart className="h-4 w-4 mr-2" />}
                {item.label === 'Claims' && <FileText className="h-4 w-4 mr-2" />}
                {item.label === 'Reports' && <AlertTriangle className="h-4 w-4 mr-2" />}
                {item.label === 'Admin' && <Shield className="h-4 w-4 mr-2" />}
                {item.label}
                {item.label === 'Inbox' && unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {isShopkeeper && (
              <Button
                variant="ghost"
                size="icon"
                className="relative hidden md:flex"
                onClick={() => handleNavigation('/shopkeeper/notifications')}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            )}
            <LoginButton />

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <nav className="flex flex-col gap-4 mt-8">
                  {visibleNavItems.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      onClick={() => handleNavigation(item.path)}
                      className={`justify-start ${location.pathname === item.path ? 'text-primary' : ''}`}
                    >
                      {item.label === 'Wishlist' && <Heart className="h-4 w-4 mr-2" />}
                      {item.label === 'Claims' && <FileText className="h-4 w-4 mr-2" />}
                      {item.label === 'Reports' && <AlertTriangle className="h-4 w-4 mr-2" />}
                      {item.label === 'Admin' && <Shield className="h-4 w-4 mr-2" />}
                      {item.label}
                      {item.label === 'Inbox' && unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
