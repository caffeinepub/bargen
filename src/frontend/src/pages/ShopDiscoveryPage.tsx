import { useNavigate } from '@tanstack/react-router';
import { useBrowseProductsWithShop } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, Store, TrendingUp, Star, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export default function ShopDiscoveryPage() {
  const navigate = useNavigate();
  const { data: products, isLoading, error } = useBrowseProductsWithShop();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                Best Deals in Town
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Bargain Your Way to Better Prices
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Connect directly with local shopkeepers, negotiate prices, and get the best deals on products you love.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => {
                  const firstProduct = products?.[0];
                  if (firstProduct) {
                    navigate({ to: '/product/$productId', params: { productId: firstProduct.id.toString() } });
                  }
                }} disabled={!products || products.length === 0}>
                  Start Shopping
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate({ to: '/shopkeeper/profile' })}>
                  <Store className="h-4 w-4 mr-2" />
                  Become a Seller
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/assets/generated/bargen-hero.dim_1600x600.png" 
                alt="Marketplace" 
                className="w-full h-auto rounded-lg shadow-2xl"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Discover Products</h2>
          <p className="text-muted-foreground">Browse products from local shops and start bargaining</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Products</AlertTitle>
            <AlertDescription>
              Unable to load products. Please check your connection and try again.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        ) : !products || products.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Products Yet</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to add products to the marketplace!
              </p>
              <Button onClick={() => navigate({ to: '/shopkeeper/profile' })}>
                Create Your Shop
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card 
                key={product.id.toString()} 
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate({ to: '/product/$productId', params: { productId: product.id.toString() } })}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </CardTitle>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Starting at</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Store className="h-3.5 w-3.5" />
                        <span className="font-medium truncate">{product.shop.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span>{Number(product.shop.rating)}/5</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{product.shop.distanceKm} km • {product.shop.priceInfo}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
