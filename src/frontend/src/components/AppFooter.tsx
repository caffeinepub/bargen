import { Heart } from 'lucide-react';

export default function AppFooter() {
  return (
    <footer className="w-full border-t border-border bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center text-sm text-muted-foreground">
          © 2026. Built with <Heart className="inline h-4 w-4 text-red-500 fill-red-500" /> using{' '}
          <a 
            href="https://caffeine.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
