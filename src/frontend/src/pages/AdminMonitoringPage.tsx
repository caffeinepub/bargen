import AdminGate from '../components/admin/AdminGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Package, AlertTriangle, FileText, ShoppingBag } from 'lucide-react';
import AdminProductsTab from '../components/admin/AdminProductsTab';

export default function AdminMonitoringPage() {
  return (
    <AdminGate>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Admin Monitoring
            </h1>
            <p className="text-muted-foreground">Monitor deals, reports, claims, and products across the platform</p>
          </div>

          <Tabs defaultValue="deals" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="deals">
                <Package className="h-4 w-4 mr-2" />
                Deal Protection
              </TabsTrigger>
              <TabsTrigger value="reports">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="claims">
                <FileText className="h-4 w-4 mr-2" />
                Claims
              </TabsTrigger>
              <TabsTrigger value="products">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Products
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deals">
              <Card>
                <CardHeader>
                  <CardTitle>Deal Protection Orders</CardTitle>
                  <CardDescription>Monitor all deal protection orders and their statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No deal protection orders yet</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Seller Reports</CardTitle>
                  <CardDescription>Review and manage seller reports from customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertTriangle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No seller reports yet</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="claims">
              <Card>
                <CardHeader>
                  <CardTitle>Claims</CardTitle>
                  <CardDescription>Review and process customer claims</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No claims yet</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <AdminProductsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminGate>
  );
}
