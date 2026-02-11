import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AuthGate from '../components/AuthGate';
import ReportSellerDialog from '../components/reports/ReportSellerDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, AlertTriangle, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function DeliveryOrderDetailsPage() {
  const { orderId } = useParams({ from: '/delivery/$orderId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [showReportDialog, setShowReportDialog] = useState(false);

  // Placeholder since backend not implemented
  const isLoading = false;
  const error = null;
  const order = null;

  if (isLoading) {
    return (
      <AuthGate>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-4">
            ← Back
          </Button>

          <Card className="max-w-2xl mx-auto text-center py-12">
            <CardContent>
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Delivery System Coming Soon</h2>
              <p className="text-muted-foreground mb-6">
                The delivery tracking system is being set up. Please check back soon.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate({ to: '/' })}>
                  Back to Discovery
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ReportSellerDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        orderId={orderId}
      />
    </AuthGate>
  );
}
