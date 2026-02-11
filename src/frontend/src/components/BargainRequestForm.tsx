import { useState } from 'react';
import { useSendBargainRequest } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { normalizeBackendError } from '../utils/backendErrors';

interface BargainRequestFormProps {
  productId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BargainRequestForm({ productId, open, onOpenChange }: BargainRequestFormProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [desiredPrice, setDesiredPrice] = useState('');
  const [note, setNote] = useState('');

  const sendBargainMutation = useSendBargainRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to make bargain requests');
      return;
    }

    const price = parseFloat(desiredPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      await sendBargainMutation.mutateAsync({
        productId: BigInt(productId),
        desiredPrice: BigInt(Math.round(price * 100)),
        note: note.trim() || null,
      });

      toast.success('Bargain request sent successfully!');
      onOpenChange(false);
      setDesiredPrice('');
      setNote('');
    } catch (err: any) {
      toast.error(normalizeBackendError(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make a Bargain Offer</DialogTitle>
          <DialogDescription>
            Propose your desired price and the shopkeeper will review your offer
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="desiredPrice">Your Desired Price (₹) *</Label>
            <Input
              id="desiredPrice"
              type="number"
              step="0.01"
              min="0.01"
              value={desiredPrice}
              onChange={(e) => setDesiredPrice(e.target.value)}
              placeholder="e.g., 1499.00"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter your offer in Indian Rupees (₹)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Additional Note (Optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any additional information..."
              rows={3}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={sendBargainMutation.isPending}
            >
              {sendBargainMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Offer'
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
