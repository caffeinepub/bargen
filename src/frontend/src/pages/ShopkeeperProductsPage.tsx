import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useBrowseProductsWithShop, useCreateProduct } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AuthGate from '../components/AuthGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Package, Loader2 } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export default function ShopkeeperProductsPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: allProducts, isLoading } = useBrowseProductsWithShop();
  const createProductMutation = useCreateProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    shopId: '',
    name: '',
    description: '',
    price: '',
  });

  // Filter products owned by current user
  const myProducts = allProducts?.filter(product => {
    if (!identity) return false;
    return product.shop.owner.toString() === identity.getPrincipal().toString();
  }) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.shopId || !formData.name || !formData.description || !formData.price) {
      toast.error('Please fill in all fields');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      toast.error('Price must be a positive number');
      return;
    }

    try {
      await createProductMutation.mutateAsync({
        shopId: BigInt(formData.shopId),
        name: formData.name,
        description: formData.description,
        price: BigInt(Math.round(price * 100)), // Store as cents
      });

      toast.success('Product created successfully!');
      setDialogOpen(false);
      setFormData({ shopId: '', name: '', description: '', price: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create product');
    }
  };

  return (
    <AuthGate message="Please sign in to manage your products">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">My Products</h1>
              <p className="text-muted-foreground">Manage your product listings</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Create a new product listing for your shop
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="shopId">Shop ID *</Label>
                    <Input
                      id="shopId"
                      type="number"
                      value={formData.shopId}
                      onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
                      placeholder="Enter your shop ID"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Use the shop ID from your shop profile
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Wireless Headphones"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your product..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Base Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g., 99.99"
                      required
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={createProductMutation.isPending}
                    >
                      {createProductMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Product'
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : myProducts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Products Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first product to start selling
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProducts.map((product) => (
                <Card 
                  key={product.id.toString()}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate({ to: '/product/$productId', params: { productId: product.id.toString() } })}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-2">{product.name}</CardTitle>
                      <Badge variant="secondary">
                        {product.shop.name}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(product.price)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
