import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface CartItem {
  name: string;
  imageKey: string;
  price: string;
  deliveryCharge: string;
  selectedSize: string;
  selectedColor?: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (name: string, size: string, color?: string) => void;
  updateQuantity: (
    name: string,
    size: string,
    qty: number,
    color?: string,
  ) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = "three_origin_cart";

function parsePrice(price: string): number {
  const num = Number.parseFloat(price.replace(/[^\d.]/g, ""));
  return Number.isNaN(num) ? 0 : num;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) =>
          i.name === item.name &&
          i.selectedSize === item.selectedSize &&
          (i.selectedColor ?? "") === (item.selectedColor ?? ""),
      );
      if (existing) {
        return prev.map((i) =>
          i.name === item.name &&
          i.selectedSize === item.selectedSize &&
          (i.selectedColor ?? "") === (item.selectedColor ?? "")
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback(
    (name: string, size: string, color?: string) => {
      setItems((prev) =>
        prev.filter(
          (i) =>
            !(
              i.name === name &&
              i.selectedSize === size &&
              (i.selectedColor ?? "") === (color ?? "")
            ),
        ),
      );
    },
    [],
  );

  const updateQuantity = useCallback(
    (name: string, size: string, qty: number, color?: string) => {
      if (qty < 1) return;
      setItems((prev) =>
        prev.map((i) =>
          i.name === name &&
          i.selectedSize === size &&
          (i.selectedColor ?? "") === (color ?? "")
            ? { ...i, quantity: qty }
            : i,
        ),
      );
    },
    [],
  );

  const clearCart = useCallback(() => setItems([]), []);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce(
    (sum, i) => sum + parsePrice(i.price) * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
