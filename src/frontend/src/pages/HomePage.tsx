import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { SiWhatsapp } from "react-icons/si";
import Header from "../components/Header";
import { useAllTshirts, useWhatsappNumber } from "../hooks/useQueries";

const FALLBACK_NUMBER = "919876543210";

const FALLBACK_TSHIRTS = [
  {
    id: 1,
    image: "/assets/generated/tshirt1.dim_600x600.jpg",
    name: "Classic Origins",
    description: "Clean white geometric tee — where it all began.",
    price: "₹499",
    deliveryCharge: "₹50",
  },
  {
    id: 2,
    image: "/assets/generated/tshirt2.dim_600x600.jpg",
    name: "Line Art",
    description: "Bold black abstract lines, minimal and striking.",
    price: "₹499",
    deliveryCharge: "₹50",
  },
  {
    id: 3,
    image: "/assets/generated/tshirt3.dim_600x600.jpg",
    name: "Bold Statement",
    description: "Oversized grey drop for the unapologetic.",
    price: "₹599",
    deliveryCharge: "₹50",
  },
  {
    id: 4,
    image: "/assets/generated/tshirt4.dim_600x600.jpg",
    name: "Summit",
    description: "Navy mountain tee — built for those who climb.",
    price: "₹549",
    deliveryCharge: "₹50",
  },
];

function buildWhatsappLink(
  number: string,
  designName: string,
  imageUrl: string,
) {
  const clean = number.replace(/\D/g, "") || FALLBACK_NUMBER;
  // Image URL placed FIRST so WhatsApp renders it as a preview at the top of the message
  const msg = encodeURIComponent(
    `${imageUrl}\n\nHi! I'd like to order the "${designName}" t-shirt from Three Origin.\n\nPlease let me know the details.`,
  );
  return `https://wa.me/${clean}?text=${msg}`;
}

function TshirtCard({
  name,
  description,
  imageKey,
  price,
  deliveryCharge,
  index,
  whatsappNumber,
}: {
  name: string;
  description: string;
  imageKey: string;
  price?: string;
  deliveryCharge?: string;
  index: number;
  whatsappNumber: string;
}) {
  const navigate = useNavigate();

  const priceLabel =
    price && deliveryCharge
      ? `${price} + ${deliveryCharge} delivery`
      : (price ?? "");

  const absoluteImageUrl = imageKey
    ? imageKey.startsWith("http")
      ? imageKey
      : `${window.location.origin}${imageKey}`
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      data-ocid={`designs.item.${index + 1}`}
    >
      <Card className="bg-card border-border overflow-hidden hover:border-[#25D366]/50 transition-colors">
        <button
          type="button"
          className="aspect-square overflow-hidden bg-muted relative w-full block cursor-pointer group"
          onClick={() =>
            navigate({
              to: "/design/$name",
              params: { name: encodeURIComponent(name) },
            })
          }
          aria-label={`View ${name}`}
        >
          {imageKey ? (
            <>
              <img
                src={imageKey}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold bg-black/50 px-3 py-1 rounded-full">
                  View Details
                </span>
              </div>
            </>
          ) : (
            <Skeleton className="w-full h-full" />
          )}
        </button>
        <CardContent className="p-4">
          <h3 className="font-display font-bold text-base uppercase tracking-wide mb-0.5">
            {name}
          </h3>
          {priceLabel && (
            <p className="text-foreground/80 text-xs font-semibold mb-1">
              {priceLabel}
            </p>
          )}
          <p className="text-muted-foreground text-xs leading-relaxed mb-3">
            {description}
          </p>
          <a
            href={buildWhatsappLink(whatsappNumber, name, absoluteImageUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
          >
            <SiWhatsapp className="w-4 h-4" />
            Order Now
          </a>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function HomePage() {
  const { data: tshirts, isLoading } = useAllTshirts();
  const { data: rawNumber } = useWhatsappNumber();
  const whatsappNumber = rawNumber ?? FALLBACK_NUMBER;
  const hasDynamic = tshirts && tshirts.length > 0;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        <section
          className="border-b border-border py-16 sm:py-24 text-center bg-cover bg-center bg-no-repeat relative"
          style={{
            backgroundImage:
              "url('/assets/generated/clothing-bg.dim_1600x900.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-muted-foreground text-xs tracking-[0.3em] uppercase mb-4"
            >
              Collection 2026
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-extrabold text-5xl sm:text-7xl tracking-tight uppercase leading-none mb-6"
            >
              Three Origin
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base leading-relaxed"
            >
              Streetwear rooted in authenticity. Each piece tells the story of
              where it came from.
            </motion.p>
          </div>
        </section>

        <section
          className="max-w-6xl mx-auto px-4 sm:px-6 py-16"
          data-ocid="designs.section"
        >
          <h2 className="font-display font-bold text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">
            Our Designs
          </h2>
          <p className="text-muted-foreground text-xs mb-10">
            Click any design picture to view details and price, then order via
            WhatsApp
          </p>

          {isLoading ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              data-ocid="designs.loading_state"
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          ) : hasDynamic ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              data-ocid="designs.list"
            >
              {tshirts.map((t, i) => (
                <TshirtCard
                  key={t.name}
                  name={t.name}
                  description={t.description}
                  imageKey={t.imageKey}
                  price={t.price}
                  deliveryCharge={t.deliveryCharge}
                  index={i}
                  whatsappNumber={whatsappNumber}
                />
              ))}
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              data-ocid="designs.list"
            >
              {FALLBACK_TSHIRTS.map((tshirt, index) => {
                const absoluteImageUrl = `${window.location.origin}${tshirt.image}`;
                return (
                  <motion.div
                    key={tshirt.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    data-ocid={`designs.item.${index + 1}`}
                  >
                    <Card className="bg-card border-border overflow-hidden hover:border-[#25D366]/50 transition-colors">
                      <button
                        type="button"
                        className="aspect-square overflow-hidden relative w-full block cursor-pointer group"
                        onClick={() =>
                          navigate({
                            to: "/design/$name",
                            params: { name: encodeURIComponent(tshirt.name) },
                          })
                        }
                        aria-label={`View ${tshirt.name}`}
                      >
                        <img
                          src={tshirt.image}
                          alt={tshirt.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold bg-black/50 px-3 py-1 rounded-full">
                            View Details
                          </span>
                        </div>
                      </button>
                      <CardContent className="p-4">
                        <h3 className="font-display font-bold text-base uppercase tracking-wide mb-0.5">
                          {tshirt.name}
                        </h3>
                        <p className="text-foreground/80 text-xs font-semibold mb-1">
                          {tshirt.price} + {tshirt.deliveryCharge} delivery
                        </p>
                        <p className="text-muted-foreground text-xs leading-relaxed mb-3">
                          {tshirt.description}
                        </p>
                        <a
                          href={buildWhatsappLink(
                            whatsappNumber,
                            tshirt.name,
                            absoluteImageUrl,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
                        >
                          <SiWhatsapp className="w-4 h-4" />
                          Order Now
                        </a>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center">
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
