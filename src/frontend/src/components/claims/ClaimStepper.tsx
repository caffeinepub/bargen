import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface ClaimStepperProps {
  currentStep: number;
  totalSteps: number;
}

export default function ClaimStepper({ currentStep, totalSteps }: ClaimStepperProps) {
  const steps = [
    { number: 1, title: 'Claim Type', description: 'Select the type of issue you experienced' },
    { number: 2, title: 'Item Details', description: 'Review the item related to your claim' },
    { number: 3, title: 'Upload Proof', description: 'Provide photo or video evidence' },
    { number: 4, title: 'Description', description: 'Describe what happened in detail' },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  step.number < currentStep
                    ? 'bg-primary text-primary-foreground'
                    : step.number === currentStep
                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step.number < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.number
                )}
              </div>
              <div className="mt-2 text-center hidden sm:block">
                <div className={`text-sm font-medium ${step.number <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground mt-1 max-w-[120px]">
                  {step.description}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 transition-colors ${
                  step.number < currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
