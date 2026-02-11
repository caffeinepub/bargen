import { useNavigate } from '@tanstack/react-router';
import AuthGate from '../components/AuthGate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';

export default function ReportsPage() {
  const navigate = useNavigate();

  return (
    <AuthGate>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-primary" />
              My Reports
            </h1>
            <p className="text-muted-foreground">Track your submitted seller reports and their status</p>
          </div>

          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Reports Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't submitted any seller reports. Reports can be filed from order details.
              </p>
              <Button onClick={() => navigate({ to: '/' })}>
                Browse Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGate>
  );
}
