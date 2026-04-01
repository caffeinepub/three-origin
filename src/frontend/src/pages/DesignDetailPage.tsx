import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "@tanstack/react-router";
import { ArrowLeft, Package, Truck } from "lucide-react";
import { motion } from "motion/react";
import { SiWhatsapp } from "react-icons/si";
import Header from "../components/Header";
import { useAllTshirts, useWhatsappNumber } from "../hooks/useQueries";

const FALLBACK_NUMBER = "919876543210";

const FALLBACK_TSHIRTS = [
  {
    name: "Classic Origins",
    description:
      "Clean white geometric tee — where it all began. Crafted from 100% premium cotton with a relaxed fit. Perfect for everyday wear with a clean, minimal aesthetic.",
    image: "/assets/generated/tshirt1.dim_600x600.jpg",
    price: "₹499",
    deliveryCharge: "₹50",
  },
  {
    name: "Line Art",
    description:
      "Bold black abstract lines, minimal and striking. A unique print inspired by modern art movements. Heavyweight fabric with a structured silhouette.",
    image: "/assets/generated/tshirt2.dim_600x600.jpg",
    price: "₹499",
    deliveryCharge: "₹50",
  },
  {
    name: "Bold Statement",
    description:
      "Oversized grey drop for the unapologetic. Street-ready with a boxy cut and statement graphics. Made for those who wear confidence on their sleeve.",
    image: "/assets/generated/tshirt3.dim_600x600.jpg",
    price: "₹599",
    deliveryCharge: "₹50",
  },
  {
    name: "Summit",
    description:
      "Navy mountain tee — built for those who climb. Inspired by the outdoors, finished for the streets. Durable fabric with moisture-wicking properties.",
    image: "/assets/generated/tshirt4.dim_600x600.jpg",
    price: "₹549",
    deliveryCharge: "₹50",
  },
];

function calcTotal(price: string, delivery: string): string {
  const p = Number.parseFloat(price.replace(/[^\d.]/g, ""));
  const d = Number.parseFloat(delivery.replace(/[^\d.]/g, ""));
  if (Number.isNaN(p) || Number.isNaN(d)) return "—";
  const sym = price.match(/[^\d.,\s]+/)?.[0] ?? "";
  return `${sym}${(p + d).toFixed(0)}`;
}

function buildWhatsappMessage(
  whatsapp: string,
  name: string,
  price: string,
  delivery: string,
  imageUrl: string,
) {
  const clean = whatsapp.replace(/\D/g, "") || FALLBACK_NUMBER;
  const msg = encodeURIComponent(
    `Hi! I'd like to order the "${name}" t-shirt from Three Origin.\n\nPrice: ${price}\nDelivery: ${delivery}\n\nDesign image: ${imageUrl}\n\nPlease confirm availability.`,
  );
  return `https://wa.me/${clean}?text=${msg}`;
}

export default function DesignDetailPage() {
  const { name } = useParams({ strict: false }) as { name: string };
  const decodedName = decodeURIComponent(name ?? "");

  const { data: tshirts } = useAllTshirts();
  const { data: rawNumber } = useWhatsappNumber();
  const whatsappNumber = rawNumber ?? FALLBACK_NUMBER;

  const backendTshirt = tshirts?.find((t) => t.name === decodedName);
  const fallbackTshirt = FALLBACK_TSHIRTS.find((t) => t.name === decodedName);

  const tshirt = backendTshirt
    ? backendTshirt
    : fallbackTshirt
      ? {
          name: fallbackTshirt.name,
          description: fallbackTshirt.description,
          imageKey: fallbackTshirt.image,
          price: fallbackTshirt.price,
          deliveryCharge: fallbackTshirt.deliveryCharge,
        }
      : null;

  const imgUrl = tshirt?.imageKey ?? null;

  const total = tshirt
    ? calcTotal(tshirt.price ?? "", tshirt.deliveryCharge ?? "")
    : "—";
  const waLink = tshirt
    ? buildWhatsappMessage(
        whatsappNumber,
        tshirt.name,
        tshirt.price ?? "",
        tshirt.deliveryCharge ?? "",
        imgUrl ?? window.location.href,
      )
    : "#";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors"
              data-ocid="design_detail.link"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Designs
            </button>
          </motion.div>

          {!tshirt ? (
            <div className="space-y-4" data-ocid="design_detail.loading_state">
              <Skeleton className="w-full" style={{ height: "50vh" }} />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Image */}
              <div
                className="w-full overflow-hidden rounded-2xl bg-muted mb-8"
                style={{ maxHeight: "50vh" }}
              >
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={tshirt.name}
                    className="w-full object-cover"
                    style={{ maxHeight: "50vh" }}
                  />
                ) : (
                  <Skeleton className="w-full" style={{ height: "50vh" }} />
                )}
              </div>

              {/* Info */}
              <div className="space-y-6">
                <div>
                  <p className="text-muted-foreground text-xs tracking-[0.3em] uppercase mb-2">
                    Three Origin
                  </p>
                  <h1 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight mb-3">
                    {tshirt.name}
                  </h1>
                  <p className="text-muted-foreground leading-relaxed">
                    {tshirt.description}
                  </p>
                </div>

                {/* Price breakdown */}
                <div
                  className="border border-border rounded-2xl overflow-hidden"
                  data-ocid="design_detail.card"
                >
                  <div className="px-5 py-4 bg-secondary/20">
                    <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                      Price Details
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span>Item Price</span>
                        </div>
                        <span className="font-semibold">
                          {tshirt.price || "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Truck className="w-4 h-4 text-muted-foreground" />
                          <span>Delivery Charge</span>
                        </div>
                        <span className="font-semibold">
                          {tshirt.deliveryCharge || "—"}
                        </span>
                      </div>
                      <div className="border-t border-border pt-3 flex items-center justify-between">
                        <span className="font-bold uppercase tracking-wide text-sm">
                          Total
                        </span>
                        <span className="font-extrabold text-xl">{total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Button */}
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="design_detail.primary_button"
                >
                  <Button className="w-full h-14 text-base font-bold rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white border-0">
                    <SiWhatsapp className="w-5 h-5 mr-2" />
                    Order Now via WhatsApp
                  </Button>
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center mt-8">
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
      </footer>
    </div>
  );
}
