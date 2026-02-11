import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { ProductWithShopDetails } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin, ArrowUpDown } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { applySorting, type SortOption } from '../utils/productComparison';

interface CompareAcrossShopsSectionProps {
  matchingListings: ProductWithShopDetails[];
}

export default function CompareAcrossShopsSection({ matchingListings }: CompareAcrossShopsSectionProps) {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('price');

  if (matchingListings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compare across shops</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No other shops found for this product yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sortedListings = applySorting(matchingListings, sortBy);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Compare across shops</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <div className="flex gap-1">
              <Button
                variant={sortBy === 'price' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('price')}
              >
                <ArrowUpDown className="h-3 w-3 mr-1" />
                Price
              </Button>
              <Button
                variant={sortBy === 'rating' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('rating')}
              >
                <ArrowUpDown className="h-3 w-3 mr-1" />
                Rating
              </Button>
              <Button
                variant={sortBy === 'distance' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('distance')}
              >
                <ArrowUpDown className="h-3 w-3 mr-1" />
                Distance
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedListings.map((listing, index) => (
            <div key={listing.id.toString()}>
              {index > 0 && <Separator className="mb-4" />}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{listing.shop.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                      {Number(listing.shop.rating)}/5
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{listing.shop.distanceKm} km</span>
                    </div>
                    <div className="font-semibold text-foreground">
                      {formatCurrency(listing.price)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate({
                      to: '/product/$productId',
                      params: { productId: listing.id.toString() },
                    })
                  }
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
