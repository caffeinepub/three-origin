import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import Header from "../components/Header";
import { useAllTshirts } from "../hooks/useQueries";

const FALLBACK_TSHIRTS = [
  {
    name: "Classic Origins",
    description:
      "Clean white geometric tee — where it all began. Premium cotton with a relaxed fit.",
    imageKey: "/assets/generated/tshirt1.dim_600x600.jpg",
    price: "₹499",
    deliveryCharge: "₹50",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: BigInt(30),
  },
  {
    name: "Line Art",
    description:
      "Bold black abstract lines, minimal and striking. Modern art meets street culture.",
    imageKey: "/assets/generated/tshirt2.dim_600x600.jpg",
    price: "₹499",
    deliveryCharge: "₹50",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: BigInt(30),
  },
  {
    name: "Bold Statement",
    description:
      "Oversized grey drop for the unapologetic. Street-ready with a boxy cut.",
    imageKey: "/assets/generated/tshirt3.dim_600x600.jpg",
    price: "₹599",
    deliveryCharge: "₹50",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: BigInt(25),
  },
  {
    name: "Summit",
    description:
      "Navy mountain tee — built for those who climb. Inspired by the outdoors.",
    imageKey: "/assets/generated/tshirt4.dim_600x600.jpg",
    price: "₹549",
    deliveryCharge: "₹50",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: BigInt(20),
  },
];

function ProductCard({
  name,
  description,
  imageKey,
  price,
  stock,
  index,
}: {
  name: string;
  description: string;
  imageKey: string;
  price: string;
  stock: bigint;
  index: number;
}) {
  const navigate = useNavigate();
  const isOutOfStock = Number(stock) === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      className="group cursor-pointer"
      onClick={() =>
        navigate({
          to: "/design/$name",
          params: { name: encodeURIComponent(name) },
        })
      }
      data-ocid={`shop.item.${index + 1}`}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted mb-4 shadow-md">
        {imageKey ? (
          <img
            src={imageKey}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <Skeleton className="w-full h-full" />
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <Badge
              variant="secondary"
              className="text-xs tracking-widest uppercase"
            >
              Sold Out
            </Badge>
          </div>
        )}
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          <span className="bg-background text-foreground text-xs font-bold tracking-wider uppercase px-4 py-2 rounded-full flex items-center gap-2">
            View Product <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Info */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-extrabold text-sm uppercase tracking-wide leading-tight">
            {name}
          </h3>
          <span className="font-extrabold text-sm text-foreground shrink-0">
            {price}
          </span>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
          {description}
        </p>
        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs font-bold tracking-wider uppercase h-8"
            tabIndex={-1}
          >
            View Product
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const { data: tshirts, isLoading } = useAllTshirts();
  const hasDynamic = tshirts && tshirts.length > 0;
  const displayTshirts = hasDynamic ? tshirts : FALLBACK_TSHIRTS;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative min-h-[70vh] flex flex-col items-center justify-center bg-cover bg-center text-center px-4"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-clothing-bg.dim_1920x1080.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-amber-300/80 text-xs font-bold tracking-[0.4em] uppercase mb-4"
            >
              Collection 2026
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-black text-6xl sm:text-8xl lg:text-9xl tracking-tight uppercase leading-none mb-6 text-white drop-shadow-2xl"
            >
              Three
              <br />
              Origin
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="text-white/90 text-sm sm:text-base font-medium max-w-md mx-auto leading-relaxed mb-10"
            >
              Streetwear rooted in authenticity. Each piece tells the story of
              where it came from.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <a
                href="#shop"
                className="inline-flex items-center justify-center gap-2 bg-amber-500 text-black font-bold text-sm tracking-wider uppercase px-8 py-3.5 rounded-full hover:bg-amber-400 transition-colors"
                data-ocid="hero.primary_button"
              >
                <ShoppingBag className="w-4 h-4" />
                Shop Now
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 border border-amber-400/50 text-amber-200 font-bold text-sm tracking-wider uppercase px-8 py-3.5 rounded-full hover:bg-amber-400/10 transition-colors"
                data-ocid="hero.secondary_button"
              >
                Contact Us
              </Link>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="w-px h-12 bg-gradient-to-b from-amber-400/40 to-transparent mx-auto" />
          </motion.div>
        </section>

        {/* Shop / Product Grid */}
        <section
          id="shop"
          className="max-w-7xl mx-auto px-4 sm:px-6 py-20"
          data-ocid="shop.section"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-xs font-bold tracking-[0.4em] uppercase text-muted-foreground mb-2">
              Our Collection
            </p>
            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight">
              Featured Designs
            </h2>
          </motion.div>

          {isLoading ? (
            <div
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
              data-ocid="shop.loading_state"
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-8"
              data-ocid="shop.list"
            >
              {displayTshirts.map((t, i) => (
                <ProductCard
                  key={t.name}
                  name={t.name}
                  description={t.description}
                  imageKey={t.imageKey}
                  price={t.price}
                  stock={t.stock}
                  index={i}
                />
              ))}
            </div>
          )}
        </section>

        {/* Brand Values Strip */}
        <section className="border-t border-border bg-secondary/10 py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {[
                {
                  title: "Premium Quality",
                  desc: "100% premium cotton, built to last.",
                },
                {
                  title: "Unique Designs",
                  desc: "Originals you won't find anywhere else.",
                },
                {
                  title: "Fast Delivery",
                  desc: "Shipped quickly to your doorstep.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <h3 className="font-display font-extrabold text-sm uppercase tracking-wider mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-display font-black text-sm tracking-widest uppercase">
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
