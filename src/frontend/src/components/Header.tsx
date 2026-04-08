import { Link, useLocation } from "@tanstack/react-router";
import {
  ChevronDown,
  Loader2,
  Menu,
  Settings,
  ShoppingBag,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { type CurrencyCode, useCurrency } from "../context/CurrencyContext";

const CURRENCY_OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: "INR", label: "₹ INR" },
  { code: "USD", label: "$ USD" },
  { code: "GBP", label: "£ GBP" },
  { code: "EUR", label: "€ EUR" },
  { code: "AED", label: "د.إ AED" },
];

function CurrencySwitcher({ compact = false }: { compact?: boolean }) {
  const { selectedCurrency, setCurrency, isLoadingRates, currencySymbols } =
    useCurrency();
  const [open, setOpen] = useState(false);

  const currentLabel =
    CURRENCY_OPTIONS.find((o) => o.code === selectedCurrency)?.label ??
    `${currencySymbols[selectedCurrency]} ${selectedCurrency}`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase border border-border rounded-lg px-2.5 py-1.5 hover:bg-secondary transition-colors ${compact ? "w-full justify-between" : ""}`}
        aria-label="Switch currency"
        data-ocid="header.currency_switcher"
      >
        {isLoadingRates ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <span>{currentLabel}</span>
        )}
        <ChevronDown
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default"
              aria-label="Close dropdown"
              onClick={() => setOpen(false)}
              onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={`absolute z-50 mt-1 min-w-[120px] bg-card border border-border rounded-xl shadow-lg overflow-hidden ${compact ? "left-0 right-0" : "right-0"}`}
            >
              {CURRENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => {
                    setCurrency(opt.code);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold tracking-wider uppercase hover:bg-secondary transition-colors ${
                    selectedCurrency === opt.code
                      ? "text-foreground bg-secondary/60"
                      : "text-muted-foreground"
                  }`}
                  data-ocid={`currency.option.${opt.code.toLowerCase()}`}
                >
                  {opt.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Header() {
  const location = useLocation();
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className="font-display font-black text-lg sm:text-xl tracking-[0.2em] uppercase text-foreground hover:opacity-80 transition-opacity"
          data-ocid="header.link"
        >
          THREE ORIGIN
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-bold tracking-wider uppercase transition-colors ${
              location.pathname === "/"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid="nav.home.link"
          >
            Home
          </Link>
          <a
            href="/#shop"
            className="text-sm font-bold tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="nav.shop.link"
          >
            Shop
          </a>
          <Link
            to="/cart"
            className={`text-sm font-bold tracking-wider uppercase transition-colors ${
              location.pathname === "/cart"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid="nav.cart.link"
          >
            Cart
          </Link>
          <Link
            to="/contact"
            className={`text-sm font-bold tracking-wider uppercase transition-colors ${
              location.pathname === "/contact"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid="nav.contact.link"
          >
            Contact
          </Link>
          <Link
            to="/admin"
            className={`flex items-center gap-1.5 text-sm font-bold tracking-wider uppercase transition-colors ${
              location.pathname === "/admin"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid="nav.admin.link"
          >
            <Settings className="w-4 h-4" />
            Admin
          </Link>
          <CurrencySwitcher />
        </nav>

        {/* Right: Cart + Mobile Menu */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-secondary transition-colors"
            aria-label={`Cart (${cartCount} items)`}
            data-ocid="header.cart.button"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* Hamburger */}
          <button
            type="button"
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-secondary transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            data-ocid="header.toggle"
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <nav className="flex flex-col px-4 py-4 gap-1">
              <Link
                to="/"
                className={`px-3 py-2.5 text-sm font-bold tracking-wider uppercase rounded-md transition-colors ${
                  location.pathname === "/"
                    ? "text-foreground bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
                onClick={() => setMenuOpen(false)}
                data-ocid="mobile.nav.home.link"
              >
                Home
              </Link>
              <button
                type="button"
                className="px-3 py-2.5 text-sm font-bold tracking-wider uppercase text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors text-left"
                onClick={() => {
                  setMenuOpen(false);
                  window.location.href = "/#shop";
                }}
              >
                Shop
              </button>
              <Link
                to="/cart"
                className={`px-3 py-2.5 text-sm font-bold tracking-wider uppercase rounded-md transition-colors ${
                  location.pathname === "/cart"
                    ? "text-foreground bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
                onClick={() => setMenuOpen(false)}
                data-ocid="mobile.nav.cart.link"
              >
                Cart
              </Link>
              <Link
                to="/contact"
                className={`px-3 py-2.5 text-sm font-bold tracking-wider uppercase rounded-md transition-colors ${
                  location.pathname === "/contact"
                    ? "text-foreground bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
                onClick={() => setMenuOpen(false)}
                data-ocid="mobile.nav.contact.link"
              >
                Contact
              </Link>
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-3 py-2.5 text-sm font-bold tracking-wider uppercase rounded-md transition-colors ${
                  location.pathname === "/admin"
                    ? "text-foreground bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
                onClick={() => setMenuOpen(false)}
                data-ocid="mobile.nav.admin.link"
              >
                <Settings className="w-4 h-4" />
                Admin
              </Link>
              {/* Currency Switcher in mobile */}
              <div className="px-3 py-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Currency
                </p>
                <CurrencySwitcher compact />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
