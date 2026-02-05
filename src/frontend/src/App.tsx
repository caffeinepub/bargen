import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import AppLayout from './components/AppLayout';
import ShopDiscoveryPage from './pages/ShopDiscoveryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import ShopkeeperProfileFormPage from './pages/ShopkeeperProfileFormPage';
import ShopkeeperProductsPage from './pages/ShopkeeperProductsPage';
import MessagesThreadPage from './pages/MessagesThreadPage';
import { Toaster } from '@/components/ui/sonner';

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

const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/product/$productId',
  component: ProductDetailPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartPage,
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

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages/$productId',
  component: MessagesThreadPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  productDetailRoute,
  cartRoute,
  shopkeeperProfileRoute,
  shopkeeperProductsRoute,
  messagesRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
