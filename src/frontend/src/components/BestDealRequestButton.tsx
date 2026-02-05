import { useSendBargainRequest } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Sparkles, Loader2 } from 'lucide-react';
import { normalizeBackendError } from '../utils/backendErrors';

interface BestDealRequestButtonProps {
  productId: string;
}

export default function BestDealRequestButton({ productId }: BestDealRequestButtonProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const sendBargainMutation = useSendBargainRequest();

  const handleBestDeal = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to request best deals');
      return;
    }

    try {
      await sendBargainMutation.mutateAsync({
        productId: BigInt(productId),
        desiredPrice: BigInt(0),
        note: 'Best deal request',
      });

      toast.success('Best deal request sent successfully!');
    } catch (err: any) {
      toast.error(normalizeBackendError(err));
    }
  };

  return (
    <Button 
      variant="secondary"
      onClick={handleBestDeal}
      disabled={!isAuthenticated || sendBargainMutation.isPending}
    >
      {sendBargainMutation.isPending ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 mr-2" />
          Best Deal
        </>
      )}
    </Button>
  );
}
