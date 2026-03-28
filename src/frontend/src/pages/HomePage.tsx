import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { SiWhatsapp } from "react-icons/si";
import Header from "../components/Header";
import { useAllTshirts, useWhatsappNumber } from "../hooks/useQueries";
import { getAnonStorageClient } from "../hooks/useStorageClient";

const FALLBACK_NUMBER = "919876543210";

const FALLBACK_TSHIRTS = [
  {
    id: 1,
    image: "/assets/generated/tshirt1.dim_600x600.jpg",
    name: "Classic Origins",
    description: "Clean white geometric tee — where it all began.",
  },
  {
    id: 2,
    image: "/assets/generated/tshirt2.dim_600x600.jpg",
    name: "Line Art",
    description: "Bold black abstract lines, minimal and striking.",
  },
  {
    id: 3,
    image: "/assets/generated/tshirt3.dim_600x600.jpg",
    name: "Bold Statement",
    description: "Oversized grey drop for the unapologetic.",
  },
  {
    id: 4,
    image: "/assets/generated/tshirt4.dim_600x600.jpg",
    name: "Summit",
    description: "Navy mountain tee — built for those who climb.",
  },
];

function buildWhatsappLink(number: string, designName: string) {
  const clean = number.replace(/\D/g, "") || FALLBACK_NUMBER;
  const msg = encodeURIComponent(
    `Hi! I'd like to order the "${designName}" t-shirt from Three Origin. Please let me know the details.`,
  );
  return `https://wa.me/${clean}?text=${msg}`;
}

type SelectedDesign = { name: string; description: string; imgUrl: string };

function DesignModal({
  design,
  whatsappNumber,
  onClose,
}: { design: SelectedDesign; whatsappNumber: string; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-card border border-border rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end p-2 pb-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-4">
            <img
              src={design.imgUrl}
              alt={design.name}
              className="w-full h-72 object-cover rounded-xl"
            />
          </div>
          <div className="p-4 pt-3">
            <h3 className="font-display font-bold text-lg uppercase tracking-wide mb-1">
              {design.name}
            </h3>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {design.description}
            </p>
            <a
              href={buildWhatsappLink(whatsappNumber, design.name)}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="designs.open_modal_button"
              className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white px-4 py-3 rounded-full text-sm font-bold transition-colors shadow-lg"
            >
              <SiWhatsapp className="w-5 h-5" />
              Order Now via WhatsApp
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function TshirtCard({
  name,
  description,
  imageKey,
  index,
  whatsappNumber,
  onImageClick,
}: {
  name: string;
  description: string;
  imageKey: string;
  index: number;
  whatsappNumber: string;
  onImageClick: (design: SelectedDesign) => void;
}) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    getAnonStorageClient().then((client) => {
      client
        .getDirectURL(imageKey)
        .then(setImgUrl)
        .catch(() => {});
    });
  }, [imageKey]);

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
          onClick={() => imgUrl && onImageClick({ name, description, imgUrl })}
          aria-label={`View ${name}`}
        >
          {imgUrl ? (
            <>
              <img
                src={imgUrl}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold bg-black/50 px-3 py-1 rounded-full">
                  View Design
                </span>
              </div>
            </>
          ) : (
            <Skeleton className="w-full h-full" />
          )}
        </button>
        <CardContent className="p-4">
          <h3 className="font-display font-bold text-base uppercase tracking-wide mb-1">
            {name}
          </h3>
          <p className="text-muted-foreground text-xs leading-relaxed mb-3">
            {description}
          </p>
          <a
            href={buildWhatsappLink(whatsappNumber, name)}
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
  const [selectedDesign, setSelectedDesign] = useState<SelectedDesign | null>(
    null,
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {selectedDesign && (
        <DesignModal
          design={selectedDesign}
          whatsappNumber={whatsappNumber}
          onClose={() => setSelectedDesign(null)}
        />
      )}

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
            Click any design picture to view it, then tap "Order Now via
            WhatsApp"
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
                  index={i}
                  whatsappNumber={whatsappNumber}
                  onImageClick={setSelectedDesign}
                />
              ))}
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              data-ocid="designs.list"
            >
              {FALLBACK_TSHIRTS.map((tshirt, index) => (
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
                        setSelectedDesign({
                          name: tshirt.name,
                          description: tshirt.description,
                          imgUrl: tshirt.image,
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
                          View Design
                        </span>
                      </div>
                    </button>
                    <CardContent className="p-4">
                      <h3 className="font-display font-bold text-base uppercase tracking-wide mb-1">
                        {tshirt.name}
                      </h3>
                      <p className="text-muted-foreground text-xs leading-relaxed mb-3">
                        {tshirt.description}
                      </p>
                      <a
                        href={buildWhatsappLink(whatsappNumber, tshirt.name)}
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
              ))}
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
