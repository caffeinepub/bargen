import { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import AuthGate from '../components/AuthGate';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useBrowseProductsWithShop, useGetCartItems } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

export default function ClaimWizardPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { productId?: string };
  const { data: allProducts } = useBrowseProductsWithShop();
  const { data: cartItems } = useGetCartItems();

  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    toast.info('Claims backend not yet implemented');
    setTimeout(() => {
      navigate({ to: '/claims' });
    }, 1500);
  };

  return (
    <AuthGate message="Please log in to file a claim">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">File a Claim</h1>
            <p className="text-muted-foreground">Follow the steps to submit your protection claim</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="mb-6">
            <CardContent className="p-6 text-center py-12">
              <p className="text-muted-foreground">
                Claims system is being set up. Please check back soon.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate({ to: '/claims' })} className="flex-1">
              Back to Claims
            </Button>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
