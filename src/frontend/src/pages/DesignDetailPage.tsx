import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { SiWhatsapp } from "react-icons/si";
import { toast } from "sonner";
import Header from "../components/Header";
import { useCart } from "../context/CartContext";
import { parseInrPrice, useCurrency } from "../context/CurrencyContext";
import { useAllTshirts, useWhatsappNumber } from "../hooks/useQueries";

const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];

const FALLBACK_TSHIRTS = [
  {
    name: "Classic Origins",
    description:
      "Clean white geometric tee — where it all began. Crafted from 100% premium cotton with a relaxed fit. Perfect for everyday wear with a clean, minimal aesthetic. The signature piece of the Three Origin collection.",
    imageKey: "/assets/generated/tshirt1.dim_600x600.jpg",
    price: "₹499",
    deliveryCharge: "₹50",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [] as string[],
    stock: BigInt(50),
  },
  {
    name: "Line Art",
    description:
      "Bold black abstract lines, minimal and striking. A unique print inspired by modern art movements. Heavyweight fabric with a structured silhouette. For those who appreciate art they can wear.",
    imageKey: "/assets/generated/tshirt2.dim_600x600.jpg",
    price: "₹499",
    deliveryCharge: "₹50",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [] as string[],
    stock: BigInt(50),
  },
  {
    name: "Bold Statement",
    description:
      "Oversized grey drop for the unapologetic. Street-ready with a boxy cut and statement graphics. Made for those who wear confidence on their sleeve. Heavyweight cotton blend.",
    imageKey: "/assets/generated/tshirt3.dim_600x600.jpg",
    price: "₹599",
    deliveryCharge: "₹50",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [] as string[],
    stock: BigInt(25),
  },
  {
    name: "Summit",
    description:
      "Navy mountain tee — built for those who climb. Inspired by the outdoors, finished for the streets. Durable fabric with moisture-wicking properties. Your next adventure starts here.",
    imageKey: "/assets/generated/tshirt4.dim_600x600.jpg",
    price: "₹549",
    deliveryCharge: "₹50",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [] as string[],
    stock: BigInt(20),
  },
];

const REVIEWS = [
  {
    name: "Aryan Sharma",
    rating: 5,
    comment:
      "Absolutely love the quality! The fabric is super soft and the print doesn't fade after washing. Will definitely order more.",
    date: "March 2026",
  },
  {
    name: "Priya Mehta",
    rating: 5,
    comment:
      "The design is exactly as shown. Fast delivery, great packaging. Three Origin is my new favourite clothing brand!",
    date: "February 2026",
  },
  {
    name: "Karan Patel",
    rating: 4,
    comment:
      "Really nice minimal design. Fits perfectly in size M. The cotton quality is premium — worth every rupee.",
    date: "January 2026",
  },
];

export default function DesignDetailPage() {
  const { name } = useParams({ strict: false }) as { name: string };
  const decodedName = decodeURIComponent(name ?? "");

  const { data: tshirts } = useAllTshirts();
  const { data: rawNumber } = useWhatsappNumber();
  const { addToCart } = useCart();
  const { formatPrice, selectedCurrency } = useCurrency();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const backendTshirt = tshirts?.find((t) => t.name === decodedName);
  const fallbackTshirt = FALLBACK_TSHIRTS.find((t) => t.name === decodedName);
  const tshirt = backendTshirt ?? fallbackTshirt ?? null;

  const sizes =
    tshirt?.sizes && tshirt.sizes.length > 0 ? tshirt.sizes : DEFAULT_SIZES;
  const colors =
    tshirt?.colors && tshirt.colors.length > 0 ? tshirt.colors : [];

  useEffect(() => {
    if (colors.length > 0 && selectedColor === null) {
      setSelectedColor(colors[0]);
    }
  }, [colors, selectedColor]);

  const isOutOfStock =
    tshirt?.stock !== undefined && Number(tshirt.stock) === 0;

  const inrPrice = parseInrPrice(tshirt?.price ?? "0");
  const inrDelivery = parseInrPrice(tshirt?.deliveryCharge ?? "0");
  const displayPrice = formatPrice(inrPrice);
  const displayDelivery = formatPrice(inrDelivery);
  const displayTotal = formatPrice(inrPrice + inrDelivery);
  const showInrSub = selectedCurrency !== "INR" && inrPrice > 0;

  function handleAddToCart() {
    if (!tshirt) return;
    if (!selectedSize) {
      toast.error("Please select a size first");
      return;
    }
    addToCart({
      name: tshirt.name,
      imageKey: tshirt.imageKey,
      price: tshirt.price,
      deliveryCharge: tshirt.deliveryCharge,
      selectedSize,
      selectedColor: selectedColor ?? undefined,
      quantity,
    });
    const colorMsg = selectedColor ? ` / ${selectedColor}` : "";
    toast.success(`${tshirt.name} (${selectedSize}${colorMsg}) added to cart!`);
  }

  function handleBuyNowWhatsApp() {
    if (!selectedSize) {
      toast.error("Please select a size before ordering");
      return;
    }
    if (!tshirt) return;

    const clean = (rawNumber ?? "").replace(/\D/g, "");
    if (!clean) {
      alert("WhatsApp number not set. Please contact admin.");
      return;
    }

    const colorLine = selectedColor ? `\nColour: ${selectedColor}` : "";
    const dc = tshirt.deliveryCharge;
    const deliveryLine = !dc || dc === "0" ? "Free" : dc;

    const message = `Product: ${tshirt.name}\nPrice: ${tshirt.price}\nDelivery Charge: ${deliveryLine}\nSize: ${selectedSize}${colorLine}\nQuantity: ${quantity}`;

    const url = `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* Back */}
          <motion.button
            type="button"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors"
            data-ocid="design_detail.link"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Designs
          </motion.button>

          {!tshirt ? (
            <div
              className="grid md:grid-cols-2 gap-10"
              data-ocid="design_detail.loading_state"
            >
              <Skeleton className="w-full aspect-square rounded-2xl" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid md:grid-cols-2 gap-10 lg:gap-16"
            >
              {/* Left: Image */}
              <div className="space-y-4">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted shadow-lg">
                  {tshirt.imageKey ? (
                    <img
                      src={tshirt.imageKey}
                      alt={tshirt.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Skeleton className="w-full h-full" />
                  )}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                      <Badge
                        variant="secondary"
                        className="text-sm px-4 py-2 tracking-widest uppercase"
                      >
                        Sold Out
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Details */}
              <div className="space-y-6">
                {/* Brand + Title */}
                <div>
                  <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase mb-2">
                    Three Origin
                  </p>
                  <h1 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight mb-3">
                    {tshirt.name}
                  </h1>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="font-bold text-2xl text-primary">
                      {displayPrice}
                    </span>
                    {tshirt.deliveryCharge && (
                      <span className="text-muted-foreground text-sm">
                        + {displayDelivery} delivery
                      </span>
                    )}
                  </div>
                  {showInrSub && (
                    <p className="text-muted-foreground text-xs mb-3">
                      ₹{inrPrice} INR
                    </p>
                  )}
                  <p className="text-muted-foreground text-sm leading-relaxed mt-3">
                    {tshirt.description}
                  </p>
                </div>

                {/* Stock */}
                {tshirt.stock !== undefined && (
                  <div
                    data-ocid={
                      isOutOfStock
                        ? "design_detail.error_state"
                        : "design_detail.success_state"
                    }
                  >
                    {isOutOfStock ? (
                      <Badge variant="destructive" className="text-xs">
                        Out of Stock
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs text-muted-foreground"
                      >
                        {Number(tshirt.stock)} units available
                      </Badge>
                    )}
                  </div>
                )}

                <Separator />

                {/* Size Selector */}
                <div data-ocid="design_detail.panel">
                  <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">
                    Select Size
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() =>
                          setSelectedSize(selectedSize === size ? "" : size)
                        }
                        className={`w-12 h-12 border rounded-lg text-sm font-semibold transition-all duration-200 ${
                          selectedSize === size
                            ? "border-primary bg-primary/15 text-primary shadow-md"
                            : "border-border bg-transparent text-foreground hover:border-primary/60 hover:text-primary"
                        }`}
                        data-ocid="design_detail.toggle"
                        aria-pressed={selectedSize === size}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selector */}
                {colors.length > 0 && (
                  <div data-ocid="design_detail.panel">
                    <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">
                      Select Color
                      {selectedColor && (
                        <span className="ml-2 normal-case tracking-normal text-secondary font-semibold">
                          — {selectedColor}
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() =>
                            setSelectedColor(
                              selectedColor === color ? null : color,
                            )
                          }
                          className={`px-4 h-10 border rounded-lg text-sm font-semibold transition-all duration-200 ${
                            selectedColor === color
                              ? "border-secondary bg-secondary/15 text-secondary shadow-md"
                              : "border-border bg-transparent text-foreground hover:border-secondary/60 hover:text-secondary"
                          }`}
                          data-ocid="design_detail.toggle"
                          aria-pressed={selectedColor === color}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">
                    Quantity
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 border border-border rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                      aria-label="Decrease quantity"
                      data-ocid="design_detail.secondary_button"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-lg">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-10 h-10 border border-border rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                      aria-label="Increase quantity"
                      data-ocid="design_detail.secondary_button"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* CTAs */}
                {isOutOfStock ? (
                  <Button
                    disabled
                    className="w-full h-13 text-sm font-bold tracking-wider uppercase rounded-full"
                    data-ocid="design_detail.primary_button"
                  >
                    Out of Stock
                  </Button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      onClick={handleAddToCart}
                      className="flex-1 h-12 text-sm font-bold tracking-wider uppercase rounded-full flex items-center gap-2 border-primary/40 text-primary hover:bg-primary/10 hover-glow-cyan transition-all"
                      data-ocid="design_detail.secondary_button"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Add to Cart
                    </Button>
                    <Button
                      onClick={handleBuyNowWhatsApp}
                      className="flex-1 h-12 text-sm font-bold tracking-wider uppercase rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white border-0 flex items-center gap-2"
                      data-ocid="design_detail.primary_button"
                    >
                      <SiWhatsapp className="w-4 h-4" />
                      Buy Now via WhatsApp
                    </Button>
                  </div>
                )}

                {/* Delivery Notice */}
                <div
                  className="flex items-start gap-3 p-4 rounded-xl border border-border bg-secondary/20"
                  data-ocid="design_detail.card"
                >
                  <Truck className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold mb-1">Delivery</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Delivery charges may vary depending on the shipping
                      location.
                    </p>
                    {tshirt.deliveryCharge && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Estimated delivery: {displayDelivery}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="px-5 py-4 bg-secondary/10">
                    <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
                      Price Details
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Package className="w-4 h-4" /> Item Price
                        </span>
                        <span className="font-semibold">{displayPrice}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Truck className="w-4 h-4" /> Delivery Charge
                        </span>
                        <span className="font-semibold">
                          {tshirt.deliveryCharge ? displayDelivery : "—"}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm uppercase tracking-wider">
                          Total
                        </span>
                        <span className="font-extrabold text-xl">
                          {displayTotal}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Reviews Section */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-20"
          >
            <Separator className="mb-12" />
            <h2 className="font-display font-extrabold text-2xl uppercase tracking-tight mb-2">
              Customer Reviews
            </h2>
            <p className="text-muted-foreground text-sm mb-8">
              What our customers are saying
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {REVIEWS.map((review, i) => (
                <motion.div
                  key={review.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="p-5 border border-border rounded-xl bg-card"
                  data-ocid={`reviews.item.${i + 1}`}
                >
                  <div className="flex items-center gap-0.5 mb-3 text-yellow-400 text-base">
                    {"★".repeat(review.rating)}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    "{review.comment}"
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{review.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {review.date}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-border py-8 mt-16">
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
