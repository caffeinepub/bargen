import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText } from 'lucide-react';

interface ClaimDescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const MIN_LENGTH = 20;
const MAX_LENGTH = 1000;

export default function ClaimDescriptionField({ value, onChange }: ClaimDescriptionFieldProps) {
  const charCount = value.length;
  const isValid = charCount >= MIN_LENGTH && charCount <= MAX_LENGTH;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Describe What Happened</h3>
        <p className="text-sm text-muted-foreground">
          Please provide a clear and detailed description of the issue. Include relevant dates, what you expected, and what actually happened.
        </p>
      </div>

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Why we need this:</strong> A detailed description helps our team understand your situation and resolve your claim faster. 
          Be specific about dates, communications, and any steps you've already taken.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Example: I ordered this product on January 15th and it was supposed to arrive within 3 days. However, it's now been 10 days and I still haven't received it. I've tried contacting the seller but received no response..."
          className="min-h-[200px] resize-none"
          maxLength={MAX_LENGTH}
        />
        <div className="flex justify-between text-xs">
          <span className={charCount < MIN_LENGTH ? 'text-destructive' : 'text-muted-foreground'}>
            {charCount < MIN_LENGTH
              ? `At least ${MIN_LENGTH - charCount} more characters required`
              : 'Minimum length met'}
          </span>
          <span className={charCount > MAX_LENGTH * 0.9 ? 'text-warning' : 'text-muted-foreground'}>
            {charCount}/{MAX_LENGTH}
          </span>
        </div>
      </div>

      {!isValid && charCount > 0 && (
        <Alert variant={charCount < MIN_LENGTH ? 'destructive' : 'default'}>
          <AlertDescription className="text-xs">
            {charCount < MIN_LENGTH
              ? `Please provide more details. Your description should be at least ${MIN_LENGTH} characters.`
              : `Description is too long. Please keep it under ${MAX_LENGTH} characters.`}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
