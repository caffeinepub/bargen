import { useNavigate } from '@tanstack/react-router';
import AuthGate from '../components/AuthGate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function ClaimSubmittedPage() {
  const navigate = useNavigate();

  return (
    <AuthGate message="Please log in to view your claim">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <Card className="border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Claim Submitted Successfully</CardTitle>
              <p className="text-muted-foreground mt-2">
                Your claim has been received and is being processed. We'll review it and get back to you soon.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/30 p-4 rounded-lg text-center">
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                <div className="font-semibold">Claim system is being set up</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Once the backend is ready, you'll be able to track your claims here.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate({ to: '/claims' })}
                >
                  View All Claims
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => navigate({ to: '/' })}
                >
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGate>
  );
}
