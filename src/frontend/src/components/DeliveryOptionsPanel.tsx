import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Truck, Package } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/currency';
import { DeliveryOption } from '../backend';

interface DeliveryOptionsPanelProps {
  shopId: bigint;
  shopName: string;
  shopAddress: string;
  distanceKm: number;
  existingOrderId?: bigint;
}

export default function DeliveryOptionsPanel({
  shopId,
  shopName,
  shopAddress,
  distanceKm,
  existingOrderId,
}: DeliveryOptionsPanelProps) {
  const navigate = useNavigate();
  const [deliveryOption, setDeliveryOption] = useState<'delivery' | 'pickup'>('delivery');
  const [dropoffLocation, setDropoffLocation] = useState('');

  // Simple fee calculation (matching backend logic)
  const baseFee = Math.round(1000_00 * distanceKm);
  const deliveryFee = BigInt(baseFee);

  const handleCreateOrder = async () => {
    if (deliveryOption === 'delivery' && !dropoffLocation.trim()) {
      toast.error('Please enter your delivery address');
      return;
    }

    toast.info('Delivery system is being set up. Please check back soon.');
  };

  if (existingOrderId) {
    return (
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Order Active
          </CardTitle>
          <CardDescription>
            You already have a delivery order for this shop
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={() => toast.info('Delivery tracking coming soon')}
          >
            View Delivery Status
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Arrange Delivery
        </CardTitle>
        <CardDescription>
          Your bargain has been accepted! Choose delivery or pickup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={deliveryOption} onValueChange={(v) => setDeliveryOption(v as 'delivery' | 'pickup')}>
          <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted">
            <RadioGroupItem value="delivery" id="delivery" />
            <Label htmlFor="delivery" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                <span className="font-medium">Home Delivery</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Delivered to your doorstep
              </p>
            </Label>
          </div>

          <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted">
            <RadioGroupItem value="pickup" id="pickup" />
            <Label htmlFor="pickup" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="font-medium">Self Pickup</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Pick up from {shopName}
              </p>
            </Label>
          </div>
        </RadioGroup>

        {deliveryOption === 'delivery' && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="dropoff">Delivery Address</Label>
              <Input
                id="dropoff"
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                placeholder="Enter your full delivery address"
              />
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Distance</span>
                <span className="font-medium">{distanceKm} km</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Delivery Fee</span>
                <span className="font-bold text-primary">{formatCurrency(deliveryFee)}</span>
              </div>
            </div>
          </>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={handleCreateOrder}
        >
          Confirm Order
        </Button>
      </CardContent>
    </Card>
  );
}
