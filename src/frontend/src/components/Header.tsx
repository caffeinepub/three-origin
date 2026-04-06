import { Link, useLocation } from "@tanstack/react-router";
import { Menu, Settings, ShoppingBag, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useCart } from "../context/CartContext";

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
          className="font-display font-extrabold text-lg sm:text-xl tracking-[0.2em] uppercase text-foreground hover:opacity-80 transition-opacity"
          data-ocid="header.link"
        >
          THREE ORIGIN
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-medium tracking-wider uppercase transition-colors ${
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
            className="text-sm font-medium tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="nav.shop.link"
          >
            Shop
          </a>
          <Link
            to="/cart"
            className={`text-sm font-medium tracking-wider uppercase transition-colors ${
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
            className={`text-sm font-medium tracking-wider uppercase transition-colors ${
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
            className={`flex items-center gap-1.5 text-sm font-medium tracking-wider uppercase transition-colors ${
              location.pathname === "/admin"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid="nav.admin.link"
          >
            <Settings className="w-4 h-4" />
            Admin
          </Link>
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
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
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
                className={`px-3 py-2.5 text-sm font-medium tracking-wider uppercase rounded-md transition-colors ${
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
                className="px-3 py-2.5 text-sm font-medium tracking-wider uppercase text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors text-left"
                onClick={() => {
                  setMenuOpen(false);
                  window.location.href = "/#shop";
                }}
              >
                Shop
              </button>
              <Link
                to="/cart"
                className={`px-3 py-2.5 text-sm font-medium tracking-wider uppercase rounded-md transition-colors ${
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
                className={`px-3 py-2.5 text-sm font-medium tracking-wider uppercase rounded-md transition-colors ${
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
                className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium tracking-wider uppercase rounded-md transition-colors ${
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
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
