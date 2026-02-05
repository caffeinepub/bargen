import { ReactNode } from 'react';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-1 w-full">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
