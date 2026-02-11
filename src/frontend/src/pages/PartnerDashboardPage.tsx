import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useRegisterDeliveryPartner, useSetPartnerAvailability } from '../hooks/useQueries';
import AuthGate from '../components/AuthGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeBackendError } from '../utils/backendErrors';

export default function PartnerDashboardPage() {
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);

  // Registration form state
  const [name, setName] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [location, setLocation] = useState('');

  const registerMutation = useRegisterDeliveryPartner();
  const availabilityMutation = useSetPartnerAvailability();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !vehicleType.trim() || !location.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const id = await registerMutation.mutateAsync({
        name: name.trim(),
        vehicleType: vehicleType.trim(),
        location: location.trim(),
      });
      setPartnerId(id.toString());
      setIsRegistered(true);
      toast.success('Successfully registered as delivery partner!');
    } catch (err: any) {
      toast.error(normalizeBackendError(err));
    }
  };

  const handleToggleAvailability = async () => {
    if (!partnerId) return;

    try {
      const newAvailability = !isAvailable;
      await availabilityMutation.mutateAsync({
        partnerId: BigInt(partnerId),
        isAvailable: newAvailability,
      });
      setIsAvailable(newAvailability);
      toast.success(`You are now ${newAvailability ? 'available' : 'unavailable'} for deliveries`);
    } catch (err: any) {
      toast.error(normalizeBackendError(err));
    }
  };

  return (
    <AuthGate>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Delivery Partner Dashboard</h1>
            <p className="text-muted-foreground">
              Register as a delivery partner and manage your availability
            </p>
          </div>

          {!isRegistered ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-6 w-6 text-primary" />
                  Register as Delivery Partner
                </CardTitle>
                <CardDescription>
                  Fill in your details to start accepting delivery requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicle">Vehicle Type</Label>
                    <Input
                      id="vehicle"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      placeholder="e.g., Motorcycle, Bicycle, Car"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Current Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Downtown, Market Area"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? 'Registering...' : 'Register as Partner'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  You are registered as a delivery partner! Partner ID: {partnerId}
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle>Availability Status</CardTitle>
                  <CardDescription>
                    Toggle your availability to receive delivery assignments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {isAvailable ? 'Available for Deliveries' : 'Unavailable'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isAvailable
                          ? 'You will receive delivery assignments'
                          : 'You will not receive new assignments'}
                      </p>
                    </div>
                    <Switch
                      checked={isAvailable}
                      onCheckedChange={handleToggleAvailability}
                      disabled={availabilityMutation.isPending}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-sm">{name}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vehicle Type</p>
                    <p className="text-sm">{vehicleType}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p className="text-sm">{location}</p>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Note: This is a simplified delivery partner system. In a production environment, you would see assigned deliveries and be able to update delivery status.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
