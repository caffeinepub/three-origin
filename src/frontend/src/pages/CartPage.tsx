import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { SiWhatsapp } from "react-icons/si";
import Header from "../components/Header";
import { useCart } from "../context/CartContext";
import { parseInrPrice, useCurrency } from "../context/CurrencyContext";
import { useWhatsappNumber } from "../hooks/useQueries";

export default function CartPage() {
  const { items, cartTotal, removeFromCart, updateQuantity } = useCart();
  const { data: rawNumber } = useWhatsappNumber();
  const { formatPrice } = useCurrency();

  function handleOrderWhatsApp() {
    if (items.length === 0) return;

    const clean = (rawNumber ?? "").replace(/\D/g, "");
    if (!clean) {
      alert("WhatsApp number not set. Please contact admin.");
      return;
    }

    const lines = items
      .map((item) => {
        const colorLine = item.selectedColor
          ? `\nColour: ${item.selectedColor}`
          : "";
        const dc = item.deliveryCharge;
        const deliveryLine = !dc || dc === "0" ? "Free" : dc;
        return `Product: ${item.name}\nPrice: ${item.price}\nDelivery Charge: ${deliveryLine}\nSize: ${item.selectedSize}${colorLine}\nQuantity: ${item.quantity}`;
      })
      .join("\n\n");

    const url = `https://wa.me/${clean}?text=${encodeURIComponent(lines)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const isEmpty = items.length === 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              to="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
              data-ocid="cart.link"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>

          <h1 className="font-display font-extrabold text-3xl uppercase tracking-tight mb-8">
            Your Cart
          </h1>

          <AnimatePresence mode="wait">
            {isEmpty ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center py-24 text-center"
                data-ocid="cart.empty_state"
              >
                <ShoppingBag className="w-16 h-16 text-muted-foreground/40 mb-6" />
                <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-2">
                  Your cart is empty
                </h2>
                <p className="text-muted-foreground text-sm mb-8">
                  Looks like you haven't added anything yet.
                </p>
                <Link to="/">
                  <Button
                    className="rounded-full px-8 tracking-wider uppercase text-sm hover-glow-cyan"
                    data-ocid="cart.primary_button"
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="items"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid lg:grid-cols-3 gap-8"
              >
                {/* Items List */}
                <div className="lg:col-span-2 space-y-4" data-ocid="cart.list">
                  <AnimatePresence>
                    {items.map((item, i) => {
                      const itemPrice = formatPrice(parseInrPrice(item.price));
                      return (
                        <motion.div
                          key={`${item.name}-${item.selectedSize}-${item.selectedColor ?? ""}`}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 16, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex gap-4 p-4 border border-border rounded-xl bg-card card-neon-border"
                          data-ocid={`cart.item.${i + 1}`}
                        >
                          {/* Image */}
                          <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-muted">
                            {item.imageKey && (
                              <img
                                src={item.imageKey}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-display font-bold text-sm uppercase tracking-wide">
                                  {item.name}
                                </h3>
                                <p className="text-muted-foreground text-xs mt-0.5">
                                  Size: {item.selectedSize}
                                  {item.selectedColor
                                    ? ` | Color: ${item.selectedColor}`
                                    : ""}
                                </p>
                              </div>
                              <span className="font-bold text-sm shrink-0 text-primary">
                                {itemPrice}
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              {/* Qty Controls */}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item.name,
                                      item.selectedSize,
                                      item.quantity - 1,
                                      item.selectedColor,
                                    )
                                  }
                                  className="w-7 h-7 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors"
                                  aria-label="Decrease"
                                  data-ocid="cart.secondary_button"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-sm font-semibold">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item.name,
                                      item.selectedSize,
                                      item.quantity + 1,
                                      item.selectedColor,
                                    )
                                  }
                                  className="w-7 h-7 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors"
                                  aria-label="Increase"
                                  data-ocid="cart.secondary_button"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Remove */}
                              <button
                                type="button"
                                onClick={() =>
                                  removeFromCart(
                                    item.name,
                                    item.selectedSize,
                                    item.selectedColor,
                                  )
                                }
                                className="text-muted-foreground hover:text-destructive transition-colors"
                                aria-label="Remove item"
                                data-ocid="cart.delete_button"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div
                    className="border border-border rounded-xl p-6 bg-card sticky top-24"
                    data-ocid="cart.panel"
                  >
                    <h2 className="font-display font-bold text-sm uppercase tracking-wider mb-6">
                      Order Summary
                    </h2>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Subtotal (
                          {items.reduce((s, it) => s + it.quantity, 0)} items)
                        </span>
                        <span className="font-semibold">
                          {formatPrice(cartTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery</span>
                        <span className="text-muted-foreground text-xs">
                          Varies by location
                        </span>
                      </div>
                    </div>

                    <Separator className="mb-4" />

                    <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                      Delivery charges may vary depending on the shipping
                      location.
                    </p>

                    <Button
                      onClick={handleOrderWhatsApp}
                      className="w-full h-12 rounded-full font-bold tracking-wider uppercase text-sm bg-[#25D366] hover:bg-[#1ebe5d] text-white border-0 flex items-center gap-2"
                      data-ocid="cart.primary_button"
                    >
                      <SiWhatsapp className="w-4 h-4" />
                      Order via WhatsApp
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="border-t border-border py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-display font-bold text-sm tracking-widest uppercase">
            Three Origin
          </p>
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
