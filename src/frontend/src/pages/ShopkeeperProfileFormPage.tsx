import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateShopProfile } from '../hooks/useQueries';
import AuthGate from '../components/AuthGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Store, Loader2 } from 'lucide-react';

export default function ShopkeeperProfileFormPage() {
  const navigate = useNavigate();
  const createShopMutation = useCreateShopProfile();

  const [formData, setFormData] = useState({
    name: '',
    rating: '5',
    address: '',
    distanceKm: '',
    priceInfo: '',
    phone: '',
    locationUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.address || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    const rating = parseInt(formData.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      toast.error('Rating must be between 1 and 5');
      return;
    }

    const distance = parseFloat(formData.distanceKm);
    if (isNaN(distance) || distance < 0) {
      toast.error('Distance must be a positive number');
      return;
    }

    try {
      const shopId = await createShopMutation.mutateAsync({
        name: formData.name,
        rating: BigInt(rating),
        address: formData.address,
        distance,
        priceInfo: formData.priceInfo,
        phone: formData.phone,
        locationUrl: formData.locationUrl,
      });

      toast.success('Shop profile created successfully!');
      navigate({ to: '/shopkeeper/products' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create shop profile');
    }
  };

  return (
    <AuthGate message="Please sign in to create your shop profile">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Create Your Shop</CardTitle>
                  <CardDescription>Set up your shop profile to start selling</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Shop Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Best Electronics Store"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (1-5) *</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Shop Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main Street, City, State, ZIP"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distanceKm">Distance (km) *</Label>
                  <Input
                    id="distanceKm"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.distanceKm}
                    onChange={(e) => setFormData({ ...formData, distanceKm: e.target.value })}
                    placeholder="e.g., 2.5"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceInfo">Price Range</Label>
                  <Input
                    id="priceInfo"
                    value={formData.priceInfo}
                    onChange={(e) => setFormData({ ...formData, priceInfo: e.target.value })}
                    placeholder="e.g., ₹₹ - Moderate, ₹₹₹ - Premium"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use ₹ symbols to indicate price range (₹ = Budget, ₹₹ = Moderate, ₹₹₹ = Premium)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1234567890"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locationUrl">Google Maps URL</Label>
                  <Input
                    id="locationUrl"
                    type="url"
                    value={formData.locationUrl}
                    onChange={(e) => setFormData({ ...formData, locationUrl: e.target.value })}
                    placeholder="https://maps.google.com/..."
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={createShopMutation.isPending}
                  >
                    {createShopMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Shop'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate({ to: '/' })}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGate>
  );
}
