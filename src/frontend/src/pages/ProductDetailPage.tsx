import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import {
  useGetProductDetails,
  useAddToCart,
  useGetProductLikeStatus,
  useLikeProduct,
  useUnlikeProduct,
  useBrowseProductsWithShop,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Phone,
  Store,
  Star,
  ShoppingCart,
  MessageCircle,
  Heart,
  AlertCircle,
  ExternalLink,
  BadgeCheck,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { formatPhoneForWhatsApp, formatPhoneForTel } from '../utils/phoneLinks';
import { findMatchingProducts } from '../utils/productComparison';
import BargainRequestForm from '../components/BargainRequestForm';
import BestDealRequestButton from '../components/BestDealRequestButton';
import DeliveryOptionsPanel from '../components/DeliveryOptionsPanel';
import CompareAcrossShopsSection from '../components/CompareAcrossShopsSection';
import ProductPhotoGallery from '../components/products/ProductPhotoGallery';
import { toast } from 'sonner';
import { normalizeBackendError } from '../utils/backendErrors';
import { getConditionLabel, getConditionBadgeVariant } from '../utils/productCondition';

export default function ProductDetailPage() {
  const { productId } = useParams({ from: '/product/$productId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [showBargainForm, setShowBargainForm] = useState(false);

  const { data: productDetails, isLoading, error } = useGetProductDetails(productId);
  const { data: allProducts } = useBrowseProductsWithShop();
  const { data: likeStatus } = useGetProductLikeStatus(productId);
  const addToCartMutation = useAddToCart();
  const likeMutation = useLikeProduct();
  const unlikeMutation = useUnlikeProduct();

  const handleAddToCart = async () => {
    if (!identity) {
      toast.error('Please log in to add items to cart');
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        productId: BigInt(productId),
        quantity: BigInt(1),
      });
      toast.success('Added to cart!');
    } catch (err: any) {
      toast.error(normalizeBackendError(err));
    }
  };

  const handleToggleLike = async () => {
    if (!identity) {
      toast.error('Please log in to like products');
      return;
    }

    try {
      if (likeStatus) {
        await unlikeMutation.mutateAsync(BigInt(productId));
        toast.success('Removed from wishlist');
      } else {
        await likeMutation.mutateAsync(BigInt(productId));
        toast.success('Added to wishlist');
      }
    } catch (err: any) {
      toast.error(normalizeBackendError(err));
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-96 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !productDetails) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Product not found or an error occurred. <Button variant="link" onClick={() => navigate({ to: '/' })}>Go back</Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const shop = productDetails.shop;
  const matchingProducts = allProducts ? findMatchingProducts(productDetails.name, allProducts, productDetails.id) : [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Photos */}
          <div>
            <ProductPhotoGallery photoBlobs={productDetails.photoBlobs} productName={productDetails.name} />
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-3xl font-bold text-foreground">{productDetails.name}</h1>
                <Badge variant={getConditionBadgeVariant(productDetails.condition)}>
                  {getConditionLabel(productDetails.condition)}
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground">{productDetails.description}</p>
            </div>

            {/* Product Age (for Used products) */}
            {productDetails.condition === 'used' && productDetails.age && productDetails.age.conditionDescription && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Product Age</h3>
                </div>
                <p className="text-sm text-muted-foreground">{productDetails.age.conditionDescription}</p>
              </div>
            )}

            {/* Verification Labels */}
            {productDetails.productVerificationLabels && productDetails.productVerificationLabels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {productDetails.productVerificationLabels.map((label, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1.5">
                    {label.labelText === 'Verified Product' ? (
                      <BadgeCheck className="h-3.5 w-3.5" />
                    ) : (
                      <ShieldCheck className="h-3.5 w-3.5" />
                    )}
                    {label.labelText}
                  </Badge>
                ))}
              </div>
            )}

            {/* Return Policy */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-2">Return Policy</h3>
              <p className="text-sm text-muted-foreground">{productDetails.returnPolicy}</p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">{formatCurrency(productDetails.price)}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
              </Button>
              <Button
                size="lg"
                variant={likeStatus ? 'default' : 'outline'}
                onClick={handleToggleLike}
                disabled={likeMutation.isPending || unlikeMutation.isPending}
              >
                <Heart className={`h-5 w-5 ${likeStatus ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Bargain Options */}
            <div className="space-y-3">
              <BargainRequestForm
                productId={productId}
                open={showBargainForm}
                onOpenChange={setShowBargainForm}
              />
              <BestDealRequestButton productId={productId} />
            </div>

            <Separator />

            {/* Shop Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    {shop.name}
                  </CardTitle>
                  {shop.rating >= 4 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verified Seller
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: Number(shop.rating) }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{shop.address}</p>
                    <p className="text-muted-foreground">{shop.distanceKm} km away</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex gap-2">
                    <a
                      href={formatPhoneForWhatsApp(shop.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      WhatsApp
                    </a>
                    <span className="text-muted-foreground">•</span>
                    <a href={formatPhoneForTel(shop.phone)} className="text-primary hover:underline">
                      Call
                    </a>
                  </div>
                </div>

                {shop.locationUrl && (
                  <a
                    href={shop.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on Map
                  </a>
                )}

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => navigate({ to: '/messages/$productId', params: { productId } })}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message Seller
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delivery Options */}
        <div className="mb-12">
          <DeliveryOptionsPanel 
            shopId={shop.id} 
            shopName={shop.name}
            shopAddress={shop.address}
            distanceKm={shop.distanceKm} 
          />
        </div>

        {/* Compare Across Shops */}
        {matchingProducts.length > 0 && (
          <CompareAcrossShopsSection matchingListings={matchingProducts} />
        )}
      </div>
    </div>
  );
}
