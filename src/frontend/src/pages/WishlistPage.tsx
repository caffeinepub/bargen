import { useNavigate } from '@tanstack/react-router';
import { useGetWishlist, useUnlikeProduct, useBrowseProductsWithShop } from '../hooks/useQueries';
import AuthGate from '../components/AuthGate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Store, AlertCircle, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { toast } from 'sonner';
import { normalizeBackendError } from '../utils/backendErrors';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { data: wishlist, isLoading, error } = useGetWishlist();
  const { data: allProducts } = useBrowseProductsWithShop();
  const unlikeMutation = useUnlikeProduct();

  const handleRemove = async (productId: bigint) => {
    try {
      await unlikeMutation.mutateAsync(productId);
      toast.success('Removed from wishlist');
    } catch (err: any) {
      toast.error(normalizeBackendError(err));
    }
  };

  const getShopName = (shopId: bigint) => {
    const product = allProducts?.find(p => p.shop.id === shopId);
    return product?.shop.name || 'Unknown Shop';
  };

  if (isLoading) {
    return (
      <AuthGate>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-1/2 mb-8" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </div>
      </AuthGate>
    );
  }

  if (error) {
    return (
      <AuthGate>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{normalizeBackendError(error)}</AlertDescription>
          </Alert>
        </div>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Heart className="h-8 w-8 text-primary fill-primary" />
              My Wishlist
            </h1>
            <p className="text-muted-foreground">Products you've liked and want to keep track of</p>
          </div>

          {!wishlist || wishlist.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Your Wishlist is Empty</h3>
                <p className="text-muted-foreground mb-6">
                  Start adding products you love to your wishlist!
                </p>
                <Button onClick={() => navigate({ to: '/' })}>
                  Browse Products
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {wishlist.map((product) => (
                <Card key={product.id.toString()} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Store className="h-4 w-4" />
                            <span>{getShopName(product.shopId)}</span>
                          </div>
                          <div className="text-2xl font-bold text-primary">
                            {formatCurrency(product.price)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate({ to: '/product/$productId', params: { productId: product.id.toString() } })}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(product.id)}
                          disabled={unlikeMutation.isPending}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
