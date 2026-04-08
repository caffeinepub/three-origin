import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { CartProvider } from "./context/CartContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import AdminPage from "./pages/AdminPage";
import CartPage from "./pages/CartPage";
import ContactPage from "./pages/ContactPage";
import DesignDetailPage from "./pages/DesignDetailPage";
import HomePage from "./pages/HomePage";
import PaymentPage from "./pages/PaymentPage";

const rootRoute = createRootRoute({
  component: () => (
    <CurrencyProvider>
      <CartProvider>
        <Outlet />
        <Toaster />
      </CartProvider>
    </CurrencyProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const paymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment",
  component: PaymentPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const designDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/design/$name",
  component: DesignDetailPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: ContactPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  paymentRoute,
  adminRoute,
  designDetailRoute,
  cartRoute,
  contactRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
