import { Link } from '@tanstack/react-router';
import { ShoppingCart, Store, Menu } from 'lucide-react';
import LoginButton from './LoginButton';
import ShareLiveLinkButton from './ShareLiveLinkButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';

export default function AppHeader() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img 
              src="/assets/generated/bargen-logo.dim_512x512.png" 
              alt="Bargen" 
              className="h-10 w-10 object-contain"
            />
            <span className="text-2xl font-bold text-primary">Bargen</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Discover
            </Link>
            {isAuthenticated && (
              <>
                <Link 
                  to="/cart" 
                  className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Cart
                </Link>
                <Link 
                  to="/shopkeeper/profile" 
                  className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                >
                  <Store className="h-4 w-4" />
                  My Shop
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ShareLiveLinkButton />
            <LoginButton />
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 mt-8">
                <Link 
                  to="/" 
                  className="text-base font-medium text-foreground/80 hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Discover
                </Link>
                {isAuthenticated && (
                  <>
                    <Link 
                      to="/cart" 
                      className="flex items-center gap-2 text-base font-medium text-foreground/80 hover:text-foreground transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Cart
                    </Link>
                    <Link 
                      to="/shopkeeper/profile" 
                      className="flex items-center gap-2 text-base font-medium text-foreground/80 hover:text-foreground transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Store className="h-4 w-4" />
                      My Shop
                    </Link>
                  </>
                )}
                <div className="pt-4 border-t border-border flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <ShareLiveLinkButton />
                    <span className="text-sm text-muted-foreground">Share this app</span>
                  </div>
                  <LoginButton />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
