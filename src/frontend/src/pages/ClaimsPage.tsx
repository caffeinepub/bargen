import { useNavigate } from '@tanstack/react-router';
import { useGetOwnClaims } from '../hooks/useQueries';
import AuthGate from '../components/AuthGate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Plus } from 'lucide-react';

export default function ClaimsPage() {
  const navigate = useNavigate();
  const { data: claims, isLoading } = useGetOwnClaims();

  if (isLoading) {
    return (
      <AuthGate>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-1/2 mb-8" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">My Claims</h1>
              <p className="text-muted-foreground">Track your protection claims and their status</p>
            </div>
            <Button onClick={() => navigate({ to: '/claims/wizard' })}>
              <Plus className="h-4 w-4 mr-2" />
              New Claim
            </Button>
          </div>

          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Claims Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't filed any protection claims. File a claim if you experience issues with your orders.
              </p>
              <Button onClick={() => navigate({ to: '/claims/wizard' })}>
                <Plus className="h-4 w-4 mr-2" />
                File Your First Claim
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGate>
  );
}
