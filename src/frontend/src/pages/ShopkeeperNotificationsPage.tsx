import { useGetOwnShopProfiles, useGetShopkeeperNotifications, useGetUserProfile } from '../hooks/useQueries';
import AuthGate from '../components/AuthGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Heart, ShoppingCart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ShopkeeperNotificationsPage() {
  const { data: ownShops, isLoading: shopsLoading } = useGetOwnShopProfiles();
  const shopId = ownShops && ownShops.length > 0 ? ownShops[0].id : null;
  const { data: notifications, isLoading: notificationsLoading } = useGetShopkeeperNotifications(
    shopId ? shopId.toString() : null
  );

  if (shopsLoading || notificationsLoading) {
    return (
      <AuthGate>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-1/2 mb-8" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </div>
        </div>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated on customer activity for your products
            </p>
          </div>

          {!notifications || notifications.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Notifications Yet</h3>
                <p className="text-muted-foreground">
                  You'll see customer activity here when they like or add your products to cart
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
  const { data: userProfile } = useGetUserProfile(notification.user);
  const userName = userProfile?.name || 'A customer';
  const timeAgo = formatDistanceToNow(new Date(Number(notification.timestamp) / 1000000), {
    addSuffix: true,
  });

  const isLike = notification.action.__kind__ === 'liked';
  const icon = isLike ? (
    <Heart className="h-5 w-5 text-red-500" />
  ) : (
    <ShoppingCart className="h-5 w-5 text-primary" />
  );
  const actionText = isLike ? 'liked' : 'added to cart';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded-full">{icon}</div>
            <div>
              <CardTitle className="text-base">
                {userName} {actionText} your product
              </CardTitle>
              <CardDescription className="mt-1">
                Product ID: {notification.productId.toString()}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {timeAgo}
          </Badge>
        </div>
      </CardHeader>
    </Card>
  );
}
