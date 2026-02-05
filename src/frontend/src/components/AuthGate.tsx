import { ReactNode } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginButton from './LoginButton';
import { Lock } from 'lucide-react';

interface AuthGateProps {
  children: ReactNode;
  message?: string;
}

export default function AuthGate({ children, message }: AuthGateProps) {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              {message || 'Please log in to access this feature'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <LoginButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
