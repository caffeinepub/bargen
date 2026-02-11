import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Package, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import type { ProductWithShopDetails } from '../../backend';

interface ClaimItemReviewProps {
  selectedProductId: bigint | null;
  onSelectProduct: (productId: bigint | null) => void;
  availableProducts: ProductWithShopDetails[];
  selectedProduct: ProductWithShopDetails | null | undefined;
}

export default function ClaimItemReview({
  selectedProductId,
  onSelectProduct,
  availableProducts,
  selectedProduct,
}: ClaimItemReviewProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Which item is this claim about?</h3>
        <p className="text-sm text-muted-foreground">
          Select a product from your cart, or choose "General claim" if it's not related to a specific item.
        </p>
      </div>

      <RadioGroup
        value={selectedProductId?.toString() || 'none'}
        onValueChange={(val) => onSelectProduct(val === 'none' ? null : BigInt(val))}
        className="space-y-3"
      >
        <div
          className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
            selectedProductId === null
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onClick={() => onSelectProduct(null)}
        >
          <RadioGroupItem value="none" id="none" className="mt-1" />
          <div className="flex-1">
            <Label htmlFor="none" className="flex items-center gap-2 cursor-pointer font-medium">
              <Package className="h-4 w-4" />
              General Claim
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Not related to a specific product
            </p>
          </div>
        </div>

        {availableProducts.map((product) => (
          <div
            key={product.id.toString()}
            className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
              selectedProductId?.toString() === product.id.toString()
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => onSelectProduct(product.id)}
          >
            <RadioGroupItem value={product.id.toString()} id={product.id.toString()} className="mt-1" />
            <div className="flex-1">
              <Label htmlFor={product.id.toString()} className="flex items-center gap-2 cursor-pointer font-medium">
                <ShoppingCart className="h-4 w-4" />
                {product.name}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm font-semibold text-primary">{formatCurrency(product.price)}</span>
                <span className="text-xs text-muted-foreground">Shop: {product.shop.name}</span>
              </div>
            </div>
          </div>
        ))}
      </RadioGroup>

      {selectedProduct && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-2">Selected Item Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product:</span>
                <span className="font-medium">{selectedProduct.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-medium">{formatCurrency(selectedProduct.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shop:</span>
                <span className="font-medium">{selectedProduct.shop.name}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedProductId === null && (
        <Card className="border-muted bg-muted/30">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              You've selected a general claim. This will not be associated with a specific product.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
