import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Condition, VerificationLabel, ProductAge, ProductAgeTime, ExternalBlob } from '@/backend';
import ProductPhotosPicker from './ProductPhotosPicker';

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
  onSubmit: (data: {
    productId: bigint;
    name: string;
    description: string;
    price: bigint;
    photoBlobs: ExternalBlob[] | null;
    condition: Condition;
    returnPolicy: string;
    age: ProductAge | null;
    productVerificationLabels: VerificationLabel[];
    listingQualityScore: bigint | null;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export default function EditProductDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
  isSubmitting,
}: EditProductDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [photoBlobs, setPhotoBlobs] = useState<ExternalBlob[]>([]);
  const [condition, setCondition] = useState<Condition>(Condition.new_);
  const [returnPolicy, setReturnPolicy] = useState('Return Available');
  const [productAge, setProductAge] = useState('');
  const [verifiedProduct, setVerifiedProduct] = useState(false);
  const [qualityChecked, setQualityChecked] = useState(false);
  const [resetToken, setResetToken] = useState(0);

  // Initialize form with product data when dialog opens
  useEffect(() => {
    if (open && product) {
      setName(product.name || '');
      setDescription(product.description || '');
      setPrice(product.price ? (Number(product.price) / 100).toFixed(2) : '');
      setPhotoBlobs(product.photoBlobs || []);
      setCondition(product.condition || Condition.new_);
      setReturnPolicy(product.returnPolicy || 'Return Available');
      setProductAge(product.age?.conditionDescription || '');
      
      // Set verification checkboxes
      const hasVerified = product.productVerificationLabels?.some(
        (label: VerificationLabel) => label.labelText === 'Verified Product'
      );
      const hasQuality = product.productVerificationLabels?.some(
        (label: VerificationLabel) => label.labelText === 'Quality Checked'
      );
      setVerifiedProduct(hasVerified || false);
      setQualityChecked(hasQuality || false);
      
      setResetToken((prev) => prev + 1);
    }
  }, [open, product]);

  // Clear product age when condition changes to New
  useEffect(() => {
    if (condition === Condition.new_) {
      setProductAge('');
    }
  }, [condition]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !price) {
      return;
    }

    const priceInPaise = Math.round(parseFloat(price) * 100);
    if (isNaN(priceInPaise) || priceInPaise <= 0) {
      return;
    }

    // Build verification labels array
    const verificationLabels: VerificationLabel[] = [];
    if (verifiedProduct) {
      verificationLabels.push({
        labelText: 'Verified Product',
        description: 'This product has been verified by the seller',
      });
    }
    if (qualityChecked) {
      verificationLabels.push({
        labelText: 'Quality Checked',
        description: 'This product has undergone quality inspection',
      });
    }

    // Build product age for used products
    let age: ProductAge | null = null;
    if (condition === Condition.used && productAge.trim()) {
      age = {
        time: { __kind__: 'unknown', unknown: null } as ProductAgeTime,
        conditionDescription: productAge.trim(),
      };
    }

    await onSubmit({
      productId: product.id,
      name,
      description,
      price: BigInt(priceInPaise),
      photoBlobs: photoBlobs.length > 0 ? photoBlobs : null,
      condition,
      returnPolicy,
      age,
      productVerificationLabels: verificationLabels,
      listingQualityScore: product.listingQualityScore || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update your product listing details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Product Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Fresh Tomatoes"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-price">Price (₹)</Label>
            <Input
              id="edit-price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-condition">Condition *</Label>
            <Select 
              value={condition} 
              onValueChange={(value) => setCondition(value as Condition)}
            >
              <SelectTrigger id="edit-condition">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Condition.new_}>New</SelectItem>
                <SelectItem value={Condition.used}>Used</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {condition === Condition.used && (
            <div className="space-y-2">
              <Label htmlFor="edit-productAge">Product Age (Optional)</Label>
              <Input
                id="edit-productAge"
                value={productAge}
                onChange={(e) => setProductAge(e.target.value)}
                placeholder="e.g., Used for 6 months, Purchased in 2024"
              />
              <p className="text-sm text-muted-foreground">
                Describe how long the product has been used
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-returnPolicy">Return Policy</Label>
            <Select value={returnPolicy} onValueChange={setReturnPolicy}>
              <SelectTrigger id="edit-returnPolicy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Return Available">Return Available</SelectItem>
                <SelectItem value="No Return">No Return</SelectItem>
                <SelectItem value="Exchange Only">Exchange Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Product Verification</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-verifiedProduct"
                  checked={verifiedProduct}
                  onCheckedChange={(checked) => setVerifiedProduct(checked === true)}
                />
                <label
                  htmlFor="edit-verifiedProduct"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Verified Product
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-qualityChecked"
                  checked={qualityChecked}
                  onCheckedChange={(checked) => setQualityChecked(checked === true)}
                />
                <label
                  htmlFor="edit-qualityChecked"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Quality Checked
                </label>
              </div>
            </div>
          </div>

          <ProductPhotosPicker 
            onPhotosChange={setPhotoBlobs} 
            resetToken={resetToken}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
