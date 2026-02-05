import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetProductDetails, useAddToCart } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, Phone, Star, ShoppingCart, MessageCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import BargainRequestForm from '../components/BargainRequestForm';
import BestDealRequestButton from '../components/BestDealRequestButton';
import { formatPhoneForWhatsApp, formatPhoneForTel } from '../utils/phoneLinks';
import { formatCurrency } from '../utils/currency';
import { normalizeBackendError } from '../utils/backendErrors';

export default function ProductDetailPage() {
  const { productId } = useParams({ from: '/product/$productId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data, isLoading, error } = useGetProductDetails(productId);
  const addToCartMutation = useAddToCart();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to cart');
      return;
    }

    try {
      await addToCartMutation.mutateAsync({ productId: BigInt(productId), quantity: BigInt(1) });
      toast.success('Added to cart!');
    } catch (err: any) {
      toast.error(normalizeBackendError(err));
    }
  };

  const handleMessageShopkeeper = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to message shopkeepers');
      return;
    }
    navigate({ to: '/messages/$productId', params: { productId } });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="max-w-2xl mx-auto text-center py-12">
          <CardContent>
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
            <p className="text-muted-foreground mb-6">
              {error ? normalizeBackendError(error) : 'The product you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <Button onClick={() => navigate({ to: '/' })}>
              Back to Discovery
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { product, shop } = data;
  const whatsappLink = formatPhoneForWhatsApp(shop.phone);
  const telLink = formatPhoneForTel(shop.phone);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-4">
            ← Back to Discovery
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Product Info */}
          <div>
            <Badge variant="secondary" className="mb-4">
              {shop.name}
            </Badge>
            <h1 className="text-4xl font-bold text-foreground mb-4">{product.name}</h1>
            <p className="text-lg text-muted-foreground mb-6">{product.description}</p>
            
            <div className="mb-8">
              <p className="text-sm text-muted-foreground mb-2">Base Price</p>
              <p className="text-4xl font-bold text-primary">{formatCurrency(product.price)}</p>
              <p className="text-sm text-muted-foreground mt-1">Negotiable - Make an offer!</p>
            </div>

            <Separator className="my-6" />

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleAddToCart}
                disabled={!isAuthenticated || addToCartMutation.isPending}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
              </Button>

              {!isAuthenticated && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please log in to add items to cart, make offers, or message shopkeepers
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-3">
                <BargainRequestForm productId={productId} />
                <BestDealRequestButton productId={productId} />
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleMessageShopkeeper}
                disabled={!isAuthenticated}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Message Shopkeeper
              </Button>
            </div>
          </div>

          {/* Shop Info */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Shop Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{shop.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{Number(shop.rating)}/5 Rating</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Address</p>
                    <p className="text-sm">{shop.address}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Distance</p>
                    <p className="text-sm">{shop.distanceKm} km away</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Price Range</p>
                    <p className="text-sm">{shop.priceInfo}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Contact</p>
                    <div className="flex flex-col gap-2 mt-2">
                      <a 
                        href={telLink}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        {shop.phone}
                      </a>
                      <a 
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-green-600 hover:underline"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        WhatsApp
                      </a>
                    </div>
                  </div>

                  {shop.locationUrl && (
                    <div>
                      <a 
                        href={shop.locationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View on Google Maps
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
