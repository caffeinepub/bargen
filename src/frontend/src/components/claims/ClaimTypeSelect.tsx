import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertCircle, Package, Clock, ShieldAlert, HelpCircle, Truck, Star, PackageX } from 'lucide-react';

// Define local ClaimType since it's not in backend
type ClaimType = 'fraud' | 'damage' | 'late_delivery' | 'non_delivery' | 'incorrect' | 'quality_issue' | 'missing_items' | 'other';

interface ClaimTypeSelectProps {
  value: ClaimType | null;
  onChange: (value: ClaimType) => void;
}

export default function ClaimTypeSelect({ value, onChange }: ClaimTypeSelectProps) {
  const claimTypes = [
    { value: 'fraud' as ClaimType, label: 'Fraud or Scam', description: 'Seller engaged in fraudulent behavior', icon: ShieldAlert },
    { value: 'damage' as ClaimType, label: 'Product Damage', description: 'Item arrived damaged or broken', icon: AlertCircle },
    { value: 'late_delivery' as ClaimType, label: 'Late Delivery', description: 'Order arrived later than expected', icon: Clock },
    { value: 'non_delivery' as ClaimType, label: 'Non-Delivery', description: 'Order never arrived', icon: Truck },
    { value: 'incorrect' as ClaimType, label: 'Incorrect Item', description: 'Received wrong product', icon: Package },
    { value: 'quality_issue' as ClaimType, label: 'Quality Issue', description: 'Product quality below expectations', icon: Star },
    { value: 'missing_items' as ClaimType, label: 'Missing Items', description: 'Some items missing from order', icon: PackageX },
    { value: 'other' as ClaimType, label: 'Other Issue', description: 'Different type of problem', icon: HelpCircle },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">What type of issue are you experiencing?</h3>
        <p className="text-sm text-muted-foreground">
          Select the category that best describes your claim. This helps us route your case to the right team.
        </p>
      </div>

      <RadioGroup
        value={value || ''}
        onValueChange={(val) => onChange(val as ClaimType)}
        className="space-y-3"
      >
        {claimTypes.map((type) => {
          const Icon = type.icon;
          return (
            <div
              key={type.value}
              className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                value === type.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onChange(type.value)}
            >
              <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
              <div className="flex-1">
                <Label htmlFor={type.value} className="flex items-center gap-2 cursor-pointer font-medium">
                  <Icon className="h-4 w-4" />
                  {type.label}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
              </div>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
