import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetShopkeeperNotifications, useGetOwnShopProfiles, useGetUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AuthGate from '../components/AuthGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, Heart, ShoppingCart, User, Package, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ShopkeeperAction } from '@/backend';

export default function ShopkeeperNotificationsPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: ownShops, isLoading: shopsLoading } = useGetOwnShopProfiles();
  
  // Get notifications for the first shop (in a real app, you'd handle multiple shops)
  const shopId = ownShops && ownShops.length > 0 ? ownShops[0].id : null;
  const { data: notifications, isLoading: notificationsLoading } = useGetShopkeeperNotifications(
    shopId ? shopId.toString() : null
  );

  const isLoading = shopsLoading || notificationsLoading;

  return (
    <AuthGate>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Notifications</h1>
            <p className="text-muted-foreground">Stay updated on customer activity for your products</p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : !shopId ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need to create a shop profile first to receive notifications.{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => navigate({ to: '/shopkeeper/profile' })}
                >
                  Create Shop Profile
                </Button>
              </AlertDescription>
            </Alert>
          ) : !notifications || notifications.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Notifications Yet</h3>
                <p className="text-muted-foreground">
                  You'll be notified when customers like or add your products to their cart.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification, index) => (
                <NotificationCard key={index} notification={notification} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}

function NotificationCard({ notification }: { notification: any }) {
  const navigate = useNavigate();
  const { data: userProfile } = useGetUserProfile(notification.user);

  const displayName = userProfile?.name || `User ${notification.user.toString().slice(0, 8)}...`;
  const timeAgo = formatDistanceToNow(new Date(Number(notification.timestamp) / 1000000), { addSuffix: true });

  const isLike = notification.action === ShopkeeperAction.liked;
  const icon = isLike ? <Heart className="h-5 w-5 text-red-500" /> : <ShoppingCart className="h-5 w-5 text-primary" />;
  const actionText = isLike ? 'liked' : 'added to cart';

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="p-2 bg-muted rounded-full">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{displayName}</span>
                <span className="text-muted-foreground">{actionText}</span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>Product ID: {notification.productId.toString()}</span>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
