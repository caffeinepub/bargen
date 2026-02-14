import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useBrowseProductsWithShop, useCreateProduct, useUpdateProduct, useDeleteProduct, useGetOwnShopProfiles, useGetBargainsByProduct, useAcceptBargain } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AuthGate from '../components/AuthGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Package, AlertCircle, Store, HandshakeIcon, Inbox, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/currency';
import { normalizeBackendError } from '../utils/backendErrors';
import ProductPhotosPicker from '../components/products/ProductPhotosPicker';
import ProductPhotoThumb from '../components/products/ProductPhotoThumb';
import EditProductDialog from '../components/products/EditProductDialog';
import DeleteProductConfirmDialog from '../components/products/DeleteProductConfirmDialog';
import { ExternalBlob, Condition, VerificationLabel, ProductAge, ProductAgeTime } from '@/backend';
import { getConditionLabel, getConditionBadgeVariant } from '../utils/productCondition';

export default function ShopkeeperProductsPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [photoBlobs, setPhotoBlobs] = useState<ExternalBlob[]>([]);
  const [productCondition, setProductCondition] = useState<Condition | ''>('');
  const [productAge, setProductAge] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('Return Available');
  const [verifiedProduct, setVerifiedProduct] = useState(false);
  const [qualityChecked, setQualityChecked] = useState(false);
  const [resetToken, setResetToken] = useState(0);

  const { data: allProducts, isLoading: productsLoading } = useBrowseProductsWithShop();
  const { data: ownShops, isLoading: shopsLoading } = useGetOwnShopProfiles();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const acceptBargainMutation = useAcceptBargain();

  const myProducts = allProducts?.filter(
    (p) => p.shop.owner.toString() === identity?.getPrincipal().toString()
  ) || [];

  // Clear product age when condition changes to New
  useEffect(() => {
    if (productCondition === Condition.new_) {
      setProductAge('');
    }
  }, [productCondition]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedShopId || !productName || !productDescription || !productPrice) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!productCondition) {
      toast.error('Please select a product condition');
      return;
    }

    const priceInPaise = Math.round(parseFloat(productPrice) * 100);
    if (isNaN(priceInPaise) || priceInPaise <= 0) {
      toast.error('Please enter a valid price');
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
    if (productCondition === Condition.used && productAge.trim()) {
      age = {
        time: { __kind__: 'unknown', unknown: null } as ProductAgeTime,
        conditionDescription: productAge.trim(),
      };
    }

    try {
      await createProductMutation.mutateAsync({
        shopId: BigInt(selectedShopId),
        name: productName,
        description: productDescription,
        price: BigInt(priceInPaise),
        photoBlobs: photoBlobs.length > 0 ? photoBlobs : null,
        condition: productCondition,
        returnPolicy,
        age,
        productVerificationLabels: verificationLabels,
      });
      toast.success('Product created successfully!');
      setDialogOpen(false);
      // Reset form
      setProductName('');
      setProductDescription('');
      setProductPrice('');
      setSelectedShopId('');
      setPhotoBlobs([]);
      setProductCondition('');
      setProductAge('');
      setReturnPolicy('Return Available');
      setVerifiedProduct(false);
      setQualityChecked(false);
      setResetToken((prev) => prev + 1);
    } catch (err: any) {
      toast.error(normalizeBackendError(err));
    }
  };

  const handleAcceptBargain = async (bargainId: bigint) => {
    try {
      await acceptBargainMutation.mutateAsync(bargainId);
      toast.success('Bargain accepted! Customer can now arrange delivery.');
    } catch (err: any) {
      toast.error(normalizeBackendError(err));
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      // Reset form when dialog closes
      setProductName('');
      setProductDescription('');
      setProductPrice('');
      setSelectedShopId('');
      setPhotoBlobs([]);
      setProductCondition('');
      setProductAge('');
      setReturnPolicy('Return Available');
      setVerifiedProduct(false);
      setQualityChecked(false);
      setResetToken((prev) => prev + 1);
    }
  };

  return (
    <AuthGate>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">My Products</h1>
              <p className="text-muted-foreground">Manage your shop's product listings and bargain requests</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" onClick={() => navigate({ to: '/shopkeeper/inbox' })}>
                <Inbox className="h-5 w-5 mr-2" />
                Inbox
              </Button>
              <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                      Create a new product listing for one of your shops
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateProduct} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="shop">Shop</Label>
                      {shopsLoading ? (
                        <Skeleton className="h-10 w-full" />
                      ) : ownShops && ownShops.length > 0 ? (
                        <Select value={selectedShopId} onValueChange={setSelectedShopId}>
                          <SelectTrigger id="shop">
                            <SelectValue placeholder="Select a shop" />
                          </SelectTrigger>
                          <SelectContent>
                            {ownShops.map((shop) => (
                              <SelectItem key={shop.id.toString()} value={shop.id.toString()}>
                                {shop.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            You need to create a shop profile first.{' '}
                            <Button
                              variant="link"
                              className="p-0 h-auto"
                              onClick={() => navigate({ to: '/shopkeeper/profile' })}
                            >
                              Create Shop Profile
                            </Button>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="e.g., Fresh Tomatoes"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        placeholder="Describe your product..."
                        rows={3}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="condition">Condition *</Label>
                      <Select 
                        value={productCondition} 
                        onValueChange={(value) => setProductCondition(value as Condition)}
                      >
                        <SelectTrigger id="condition">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Condition.new_}>New</SelectItem>
                          <SelectItem value={Condition.used}>Used</SelectItem>
                        </SelectContent>
                      </Select>
                      {!productCondition && (
                        <p className="text-sm text-muted-foreground">
                          Please select whether this product is new or used
                        </p>
                      )}
                    </div>

                    {productCondition === Condition.used && (
                      <div className="space-y-2">
                        <Label htmlFor="productAge">Product Age (Optional)</Label>
                        <Input
                          id="productAge"
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
                      <Label htmlFor="returnPolicy">Return Policy</Label>
                      <Select value={returnPolicy} onValueChange={setReturnPolicy}>
                        <SelectTrigger id="returnPolicy">
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
                            id="verifiedProduct"
                            checked={verifiedProduct}
                            onCheckedChange={(checked) => setVerifiedProduct(checked === true)}
                          />
                          <label
                            htmlFor="verifiedProduct"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Verified Product
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="qualityChecked"
                            checked={qualityChecked}
                            onCheckedChange={(checked) => setQualityChecked(checked === true)}
                          />
                          <label
                            htmlFor="qualityChecked"
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
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={createProductMutation.isPending || !ownShops || ownShops.length === 0}
                      >
                        {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Products List */}
          {productsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : myProducts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Products Yet</h3>
                <p className="text-muted-foreground mb-6">
                  {ownShops && ownShops.length > 0
                    ? 'Start by adding your first product listing'
                    : 'Create a shop profile first, then add products'}
                </p>
                {ownShops && ownShops.length > 0 ? (
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-5 w-5 mr-2" />
                    Add Your First Product
                  </Button>
                ) : (
                  <Button onClick={() => navigate({ to: '/shopkeeper/profile' })}>
                    <Store className="h-5 w-5 mr-2" />
                    Create Shop Profile
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProducts.map((product) => (
                <ProductCardWithBargains
                  key={product.id.toString()}
                  product={product}
                  onAcceptBargain={handleAcceptBargain}
                  isAccepting={acceptBargainMutation.isPending}
                  onUpdate={updateProductMutation.mutateAsync}
                  onDelete={deleteProductMutation.mutateAsync}
                  isUpdating={updateProductMutation.isPending}
                  isDeleting={deleteProductMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}

function ProductCardWithBargains({
  product,
  onAcceptBargain,
  isAccepting,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: {
  product: any;
  onAcceptBargain: (bargainId: bigint) => void;
  isAccepting: boolean;
  onUpdate: (data: any) => Promise<void>;
  onDelete: (productId: bigint) => Promise<void>;
  isUpdating: boolean;
  isDeleting: boolean;
}) {
  const { data: bargains } = useGetBargainsByProduct(product.id.toString());
  const pendingBargains = bargains?.filter((b) => !b.mutuallyAccepted) || [];
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleUpdate = async (data: any) => {
    try {
      await onUpdate(data);
      toast.success('Product updated successfully!');
      setEditDialogOpen(false);
    } catch (err: any) {
      toast.error(normalizeBackendError(err));
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(product.id);
      toast.success('Product deleted successfully!');
      setDeleteDialogOpen(false);
    } catch (err: any) {
      toast.error(normalizeBackendError(err));
    }
  };

  return (
    <>
      <Card>
        <ProductPhotoThumb
          photoBlobs={product.photoBlobs}
          productName={product.name}
          className="w-full h-48 rounded-t-lg"
        />
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <Badge variant={getConditionBadgeVariant(product.condition)}>
              {getConditionLabel(product.condition)}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">{product.description}</CardDescription>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xl font-bold text-primary">{formatCurrency(product.price)}</p>
          </div>
          {product.age && (
            <p className="text-sm text-muted-foreground mt-1">
              Age: {product.age.conditionDescription}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-destructive hover:text-destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>

          {/* Bargain Requests */}
          {pendingBargains.length > 0 && (
            <div className="pt-3 border-t">
              <div className="flex items-center gap-2 mb-2">
                <HandshakeIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {pendingBargains.length} Bargain Request{pendingBargains.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-2">
                {pendingBargains.slice(0, 2).map((bargain) => (
                  <div
                    key={bargain.id.toString()}
                    className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
                  >
                    <div>
                      <p className="font-medium">{formatCurrency(bargain.desiredPrice)}</p>
                      {bargain.note && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{bargain.note}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onAcceptBargain(bargain.id)}
                      disabled={isAccepting}
                    >
                      Accept
                    </Button>
                  </div>
                ))}
                {pendingBargains.length > 2 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{pendingBargains.length - 2} more
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <EditProductDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        product={product}
        onSubmit={handleUpdate}
        isSubmitting={isUpdating}
      />

      <DeleteProductConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        productName={product.name}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
