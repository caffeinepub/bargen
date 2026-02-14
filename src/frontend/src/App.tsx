import { StrictMode } from 'react';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from './components/AppLayout';
import ShopDiscoveryPage from './pages/ShopDiscoveryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import ShopkeeperProfileFormPage from './pages/ShopkeeperProfileFormPage';
import ShopkeeperProductsPage from './pages/ShopkeeperProductsPage';
import MessagesThreadPage from './pages/MessagesThreadPage';
import ClaimsPage from './pages/ClaimsPage';
import ClaimWizardPage from './pages/ClaimWizardPage';
import ClaimSubmittedPage from './pages/ClaimSubmittedPage';
import DeliveryOrderDetailsPage from './pages/DeliveryOrderDetailsPage';
import PartnerDashboardPage from './pages/PartnerDashboardPage';
import ShopkeeperInboxPage from './pages/ShopkeeperInboxPage';
import ShopkeeperNotificationsPage from './pages/ShopkeeperNotificationsPage';
import WishlistPage from './pages/WishlistPage';
import ReportsPage from './pages/ReportsPage';
import AdminMonitoringPage from './pages/AdminMonitoringPage';

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ShopDiscoveryPage,
});

const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/product/$productId',
  component: ProductDetailPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartPage,
});

const wishlistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wishlist',
  component: WishlistPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports',
  component: ReportsPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminMonitoringPage,
});

const shopkeeperProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shopkeeper/profile',
  component: ShopkeeperProfileFormPage,
});

const shopkeeperProductsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shopkeeper/products',
  component: ShopkeeperProductsPage,
});

const shopkeeperInboxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shopkeeper/inbox',
  component: ShopkeeperInboxPage,
});

const shopkeeperNotificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shopkeeper/notifications',
  component: ShopkeeperNotificationsPage,
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages/$productId',
  component: MessagesThreadPage,
});

const claimsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/claims',
  component: ClaimsPage,
});

const claimWizardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/claims/wizard',
  component: ClaimWizardPage,
});

const claimSubmittedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/claims/submitted',
  component: ClaimSubmittedPage,
});

const deliveryOrderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/delivery/$orderId',
  component: DeliveryOrderDetailsPage,
});

const partnerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/partner/dashboard',
  component: PartnerDashboardPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  productRoute,
  cartRoute,
  wishlistRoute,
  reportsRoute,
  adminRoute,
  shopkeeperProfileRoute,
  shopkeeperProductsRoute,
  shopkeeperInboxRoute,
  shopkeeperNotificationsRoute,
  messagesRoute,
  claimsRoute,
  claimWizardRoute,
  claimSubmittedRoute,
  deliveryOrderRoute,
  partnerDashboardRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <StrictMode>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </StrictMode>
  );
}
