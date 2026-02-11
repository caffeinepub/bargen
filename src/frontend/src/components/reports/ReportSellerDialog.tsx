import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ReportSellerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId?: string;
  shopId?: string;
}

export default function ReportSellerDialog({
  open,
  onOpenChange,
  orderId,
  shopId,
}: ReportSellerDialogProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason.trim() || !details.trim()) {
      setError('Please provide both reason and details');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Placeholder - backend not yet implemented
    setTimeout(() => {
      setIsSubmitting(false);
      onOpenChange(false);
      setReason('');
      setDetails('');
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Report Seller</DialogTitle>
          <DialogDescription>
            Submit a report about this seller. Our team will review it promptly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              placeholder="e.g., Fraudulent behavior, Poor service"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Details</Label>
            <Textarea
              id="details"
              placeholder="Provide detailed information about the issue..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={5}
            />
          </div>

          {orderId && (
            <p className="text-sm text-muted-foreground">
              Related to Order #{orderId}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
