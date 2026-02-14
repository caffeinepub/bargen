import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Edit, Trash2, Package } from 'lucide-react';
import { useAdminBrowseProductsWithShop, useAdminUpdateProduct, useAdminDeleteProduct } from '@/hooks/useQueries';
import { formatCurrency } from '@/utils/currency';
import { getConditionLabel, getConditionBadgeVariant } from '@/utils/productCondition';
import EditProductDialog from '../products/EditProductDialog';
import DeleteProductConfirmDialog from '../products/DeleteProductConfirmDialog';
import { toast } from 'sonner';
import { normalizeBackendError } from '@/utils/backendErrors';

type SortOption = 'name' | 'shop' | 'price' | 'condition';

export default function AdminProductsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('shop');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);

  const { data: products = [], isLoading, error } = useAdminBrowseProductsWithShop();
  const updateMutation = useAdminUpdateProduct();
  const deleteMutation = useAdminDeleteProduct();

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.shop.name.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'shop':
          return a.shop.name.localeCompare(b.shop.name);
        case 'price':
          return Number(a.price - b.price);
        case 'condition':
          return a.condition.localeCompare(b.condition);
        default:
          return 0;
      }
    });

    return sorted;
  }, [products, searchQuery, sortBy]);

  const handleEdit = (product: any) => {
    setEditingProduct(product);
  };

  const handleDelete = (product: any) => {
    setDeletingProduct(product);
  };

  const handleEditSubmit = async (data: any) => {
    try {
      await updateMutation.mutateAsync(data);
      toast.success('Product updated successfully');
      setEditingProduct(null);
    } catch (error: any) {
      const message = normalizeBackendError(error);
      toast.error(`Failed to update product: ${message}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;

    try {
      await deleteMutation.mutateAsync(deletingProduct.id);
      toast.success('Product deleted successfully');
      setDeletingProduct(null);
    } catch (error: any) {
      const message = normalizeBackendError(error);
      toast.error(`Failed to delete product: ${message}`);
    }
  };

  if (error) {
    const message = normalizeBackendError(error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Manage all products across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-destructive">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Failed to load products: {message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Manage all products across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product or shop name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shop">Sort by Shop</SelectItem>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="price">Sort by Price</SelectItem>
                <SelectItem value="condition">Sort by Condition</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50 animate-pulse" />
              <p>Loading products...</p>
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>{searchQuery ? 'No products match your search' : 'No products yet'}</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Shop</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedProducts.map((product) => (
                    <TableRow key={product.id.toString()}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.shop.name}</TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>
                        <Badge variant={getConditionBadgeVariant(product.condition)}>
                          {getConditionLabel(product.condition)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            disabled={updateMutation.isPending || deleteMutation.isPending}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product)}
                            disabled={updateMutation.isPending || deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      {editingProduct && (
        <EditProductDialog
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
          product={editingProduct}
          onSubmit={handleEditSubmit}
          isSubmitting={updateMutation.isPending}
        />
      )}

      {/* Delete Product Confirmation Dialog */}
      {deletingProduct && (
        <DeleteProductConfirmDialog
          open={!!deletingProduct}
          onOpenChange={(open) => !open && setDeletingProduct(null)}
          productName={deletingProduct.name}
          onConfirm={handleDeleteConfirm}
          isDeleting={deleteMutation.isPending}
          scopeText="from the platform"
        />
      )}
    </>
  );
}
