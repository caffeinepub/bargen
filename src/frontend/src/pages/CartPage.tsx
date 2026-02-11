import { useNavigate } from '@tanstack/react-router';
import { useGetCartItems, useGetCartTotalWithInsurance, useBrowseProductsWithShop } from '../hooks/useQueries';
import AuthGate from '../components/AuthGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, AlertCircle, Shield, FileText } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { normalizeBackendError } from '../utils/backendErrors';

export default function CartPage() {
  const navigate = useNavigate();
  const { data: cartItems, isLoading: itemsLoading, error: itemsError } = useGetCartItems();
  const { data: cartTotal, isLoading: totalLoading, error: totalError } = useGetCartTotalWithInsurance();
  const { data: allProducts } = useBrowseProductsWithShop();

  const isLoading = itemsLoading || totalLoading;
  const error = itemsError || totalError;

  const getProductDetails = (productId: bigint) => {
    return allProducts?.find((p) => p.id === productId);
  };

  const handleFileClaim = () => {
    navigate({ to: '/claims/wizard' });
  };

  if (isLoading) {
    return (
      <AuthGate>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-1/2 mb-8" />
            <Skeleton className="h-96" />
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Shopping Cart</h1>
            <p className="text-muted-foreground">Review your items and proceed to checkout</p>
          </div>

          {!cartItems || cartItems.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Your Cart is Empty</h3>
                <p className="text-muted-foreground mb-6">
                  Start adding products to your cart to see them here!
                </p>
                <Button onClick={() => navigate({ to: '/' })}>
                  Browse Products
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Cart Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items</CardTitle>
                  <CardDescription>{cartItems.length} item(s) in your cart</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => {
                    const product = getProductDetails(item.productId);
                    return (
                      <div key={item.productId.toString()} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div className="flex-1">
                          <h4 className="font-medium">{product?.name || 'Unknown Product'}</h4>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity.toString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            {product ? formatCurrency(product.price * item.quantity) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Deal Protection */}
              {cartTotal?.insurance && (
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Deal Protection Included
                    </CardTitle>
                    <CardDescription>{cartTotal.insurance.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {cartTotal.insurance.details}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Protection Fee:</span>
                      <span className="font-bold text-primary">
                        {formatCurrency(cartTotal.insurancePremium)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{cartTotal ? formatCurrency(cartTotal.subtotal) : 'N/A'}</span>
                  </div>
                  {cartTotal?.insurancePremium && cartTotal.insurancePremium > BigInt(0) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Protection Fee</span>
                      <span className="font-medium">{formatCurrency(cartTotal.insurancePremium)}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-border flex justify-between">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-lg font-bold text-primary">
                      {cartTotal ? formatCurrency(cartTotal.total) : 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4">
                <Button size="lg" className="flex-1">
                  Proceed to Checkout
                </Button>
                <Button size="lg" variant="outline" onClick={handleFileClaim}>
                  <FileText className="h-5 w-5 mr-2" />
                  File Claim
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
