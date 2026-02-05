import { useNavigate } from '@tanstack/react-router';
import { useGetCartItems, useBrowseProductsWithShop } from '../hooks/useQueries';
import AuthGate from '../components/AuthGate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, Trash2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export default function CartPage() {
  const navigate = useNavigate();
  const { data: cartItems, isLoading: cartLoading, error: cartError } = useGetCartItems();
  const { data: allProducts, isLoading: productsLoading, error: productsError } = useBrowseProductsWithShop();

  const isLoading = cartLoading || productsLoading;
  const hasError = cartError || productsError;

  // Map cart items to products with safe fallback
  const cartWithProducts = cartItems?.map(item => {
    const product = allProducts?.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(item => item.product) || [];

  const subtotal = cartWithProducts.reduce((sum, item) => {
    return sum + (Number(item.product!.price) * Number(item.quantity));
  }, 0);

  return (
    <AuthGate message="Please log in to view your cart">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Shopping Cart</h1>
            <p className="text-muted-foreground">Review your items and proceed to checkout</p>
          </div>

          {hasError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Unable to load cart items. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="h-24 w-24" />
                      <div className="flex-1">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !cartWithProducts || cartWithProducts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-6">
                  Start shopping to add items to your cart
                </p>
                <Button onClick={() => navigate({ to: '/' })}>
                  Browse Products
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartWithProducts.map((item) => (
                  <Card key={item.productId.toString()}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div 
                          className="h-24 w-24 bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                          onClick={() => navigate({ to: '/product/$productId', params: { productId: item.productId.toString() } })}
                        >
                          <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 
                            className="font-semibold text-lg mb-1 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => navigate({ to: '/product/$productId', params: { productId: item.productId.toString() } })}
                          >
                            {item.product!.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.product!.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-muted-foreground">
                                Qty: {Number(item.quantity)}
                              </span>
                              <span className="text-lg font-semibold text-primary">
                                {formatCurrency(item.product!.price)}
                              </span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-20">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">{formatCurrency(BigInt(Math.round(subtotal)))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Items</span>
                        <span className="font-medium">{cartWithProducts.length}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">{formatCurrency(BigInt(Math.round(subtotal)))}</span>
                    </div>

                    <Button className="w-full" size="lg">
                      Proceed to Checkout
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Prices are negotiable. Contact shopkeepers for better deals!
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
