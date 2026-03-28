import { Link, useLocation } from "@tanstack/react-router";
import { SiWhatsapp } from "react-icons/si";
import { useWhatsappNumber } from "../hooks/useQueries";

const FALLBACK_NUMBER = "919876543210";
const FALLBACK_DISPLAY = "Contact Us";

function formatWhatsapp(raw: string): { number: string; display: string } {
  if (!raw) return { number: FALLBACK_NUMBER, display: FALLBACK_DISPLAY };
  // If it looks like a plain number, format it nicely
  const clean = raw.replace(/\D/g, "");
  return { number: clean || raw, display: `+${clean}` || raw };
}

export default function Header() {
  const location = useLocation();
  const { data: rawNumber } = useWhatsappNumber();
  const { number, display } = formatWhatsapp(rawNumber ?? "");

  return (
    <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className="font-display font-extrabold text-xl sm:text-2xl tracking-widest uppercase text-foreground"
          data-ocid="header.link"
        >
          THREE ORIGIN
        </Link>

        {/* Nav + WhatsApp */}
        <div className="flex items-center gap-3 sm:gap-6">
          <nav className="flex items-center gap-3 sm:gap-5">
            <Link
              to="/"
              className={`text-sm font-medium tracking-wider uppercase transition-colors ${
                location.pathname === "/"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-ocid="nav.designs.link"
            >
              Designs
            </Link>
            <Link
              to="/payment"
              className={`text-sm font-medium tracking-wider uppercase transition-colors ${
                location.pathname === "/payment"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-ocid="nav.payment.link"
            >
              Payment
            </Link>
            <Link
              to="/admin"
              className={`text-xs font-medium tracking-wider uppercase transition-colors ${
                location.pathname === "/admin"
                  ? "text-foreground"
                  : "text-muted-foreground/60 hover:text-muted-foreground"
              }`}
              data-ocid="nav.admin.link"
            >
              Admin
            </Link>
          </nav>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 px-3 py-1.5 rounded text-xs sm:text-sm font-medium tracking-wide transition-colors"
            data-ocid="header.whatsapp.button"
          >
            <SiWhatsapp className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{display}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
