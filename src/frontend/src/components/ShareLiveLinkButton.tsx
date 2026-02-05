import { Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState } from 'react';
import { toast } from 'sonner';
import { getLiveShareUrl } from '../utils/liveShareUrl';

export default function ShareLiveLinkButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const liveUrl = getLiveShareUrl();
    
    try {
      await navigator.clipboard.writeText(liveUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!', {
        description: 'Share this link with others to access Bargen.',
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link', {
        description: 'Please try again or copy the URL manually.',
      });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            className="relative"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? 'Copied!' : 'Share live link'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
