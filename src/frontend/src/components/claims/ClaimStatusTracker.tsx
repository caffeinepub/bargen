import { Card, CardContent } from '@/components/ui/card';
import { Check, Clock, FileText, CheckCircle } from 'lucide-react';

// Define local ClaimStatus type since it's not in backend
type ClaimStatus = 'submitted' | 'under_review' | 'approved' | 'rejected';

interface ClaimStatusTrackerProps {
  status: ClaimStatus;
}

export default function ClaimStatusTracker({ status }: ClaimStatusTrackerProps) {
  const steps = [
    {
      key: 'submitted',
      label: 'Submitted',
      description: 'Your claim has been received',
      icon: FileText,
    },
    {
      key: 'under_review',
      label: 'Under Review',
      description: 'Our team is reviewing your claim',
      icon: Clock,
    },
    {
      key: 'resolved',
      label: 'Resolved',
      description: 'Your claim has been processed',
      icon: CheckCircle,
    },
  ];

  const getCurrentStepIndex = () => {
    switch (status) {
      case 'submitted':
        return 0;
      case 'under_review':
        return 1;
      case 'approved':
      case 'rejected':
        return 2;
      default:
        return 0;
    }
  };

  const currentStepIndex = getCurrentStepIndex();

  const getExpectedResolutionTime = () => {
    switch (status) {
      case 'submitted':
        return 'Expected review start: within 24 hours';
      case 'under_review':
        return 'Expected resolution: within 48 hours';
      case 'approved':
        return 'Claim approved and processed';
      case 'rejected':
        return 'Claim reviewed and decision made';
      default:
        return '';
    }
  };

  const getOutcomeMessage = () => {
    if (status === 'approved') {
      return {
        type: 'success' as const,
        message: 'Your claim has been approved. The resolution will be processed according to your protection plan terms.',
      };
    }
    if (status === 'rejected') {
      return {
        type: 'error' as const,
        message: 'Your claim was reviewed but did not meet the criteria for approval. Please contact support if you have questions.',
      };
    }
    return null;
  };

  const outcome = getOutcomeMessage();

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold text-sm mb-1">Claim Status</h4>
        <p className="text-xs text-muted-foreground">{getExpectedResolutionTime()}</p>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 h-8 transition-colors ${
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className={`font-medium text-sm ${isCurrent || isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{step.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      {outcome && (
        <Card className={outcome.type === 'success' ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-destructive/20 bg-destructive/5'}>
          <CardContent className="p-4">
            <p className="text-sm">{outcome.message}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
