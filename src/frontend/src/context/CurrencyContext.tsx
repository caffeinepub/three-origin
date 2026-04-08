import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useActor } from "../hooks/useActor";

export type CurrencyCode = "INR" | "USD" | "GBP" | "EUR" | "AED";

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: "₹",
  USD: "$",
  GBP: "£",
  EUR: "€",
  AED: "د.إ",
};

const SUPPORTED_CURRENCIES: CurrencyCode[] = [
  "INR",
  "USD",
  "GBP",
  "EUR",
  "AED",
];

interface CurrencyContextValue {
  selectedCurrency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  exchangeRates: Record<string, number>;
  isLoadingRates: boolean;
  convertPrice: (inrPrice: number) => number;
  formatPrice: (inrPrice: number) => string;
  supportedCurrencies: CurrencyCode[];
  currencySymbols: Record<CurrencyCode, string>;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const CURRENCY_KEY = "three-origin-currency";
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

function parseRatesFromJson(json: string): Record<string, number> {
  try {
    const parsed = JSON.parse(json) as { rates?: Record<string, number> };
    if (parsed?.rates && typeof parsed.rates === "object") {
      return { INR: 1.0, ...parsed.rates };
    }
    // Some APIs return the rates directly at the top level
    if (typeof parsed === "object" && parsed !== null && !parsed.rates) {
      return { INR: 1.0, ...(parsed as Record<string, number>) };
    }
  } catch {
    // ignore parse errors
  }
  return { INR: 1.0 };
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { actor, isFetching } = useActor();
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("INR");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    INR: 1.0,
  });
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  // Restore user currency preference on mount
  useEffect(() => {
    const saved = localStorage.getItem(CURRENCY_KEY) as CurrencyCode | null;
    if (saved && SUPPORTED_CURRENCIES.includes(saved)) {
      setSelectedCurrency(saved);
    }
  }, []);

  // Load rates and auto-detect currency once actor is ready
  useEffect(() => {
    if (!actor || isFetching) return;

    let cancelled = false;

    async function init() {
      if (!actor) return;
      setIsLoadingRates(true);
      try {
        // Try to get cached rates timestamp from backend
        let ratesJson: string | null = null;

        try {
          const cachedAtResult = await actor.getRatesCachedAt();
          const cachedAtMs = Number(cachedAtResult) / 1_000_000; // nanoseconds → ms
          const now = Date.now();
          const needsRefresh =
            cachedAtMs === 0 || now - cachedAtMs > SIX_HOURS_MS;

          if (needsRefresh) {
            try {
              // refreshExchangeRates returns a string (the JSON) or error string
              const refreshResult = await actor.refreshExchangeRates();
              if (
                refreshResult &&
                refreshResult !== "error" &&
                refreshResult.length > 10
              ) {
                ratesJson = refreshResult;
              }
            } catch {
              // fall through to getCurrencyRates
            }
          }

          if (!ratesJson) {
            // getCurrencyRates returns string | null (backend.ts already unwraps Option)
            const cached = await actor.getCurrencyRates();
            ratesJson = cached; // already string | null
          }
        } catch {
          // backend might not support currency — stay with defaults
        }

        if (!cancelled && ratesJson) {
          setExchangeRates(parseRatesFromJson(ratesJson));
        }

        // Auto-detect currency only if user has no saved preference
        const savedCurrency = localStorage.getItem(CURRENCY_KEY);
        if (!savedCurrency) {
          try {
            const ipRes = await fetch("https://api.ipify.org?format=json");
            const { ip } = (await ipRes.json()) as { ip: string };
            const detected = await actor.detectUserCurrency(ip);
            const code = (detected ?? "").toUpperCase() as CurrencyCode;
            if (!cancelled && SUPPORTED_CURRENCIES.includes(code)) {
              setSelectedCurrency(code);
            }
          } catch {
            // Fallback to INR — no action needed
          }
        }
      } catch {
        // Silently fallback to INR with no conversion
      } finally {
        if (!cancelled) setIsLoadingRates(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [actor, isFetching]);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setSelectedCurrency(c);
    localStorage.setItem(CURRENCY_KEY, c);
  }, []);

  const convertPrice = useCallback(
    (inrPrice: number): number => {
      const rate = exchangeRates[selectedCurrency] ?? 1;
      return Math.round(inrPrice * rate * 100) / 100;
    },
    [exchangeRates, selectedCurrency],
  );

  const formatPrice = useCallback(
    (inrPrice: number): string => {
      const converted = convertPrice(inrPrice);
      const sym = CURRENCY_SYMBOLS[selectedCurrency] ?? selectedCurrency;
      // Round to 0 decimals for INR/AED, 2 for USD/GBP/EUR
      if (selectedCurrency === "INR" || selectedCurrency === "AED") {
        return `${sym}${Math.round(converted)}`;
      }
      return `${sym}${converted.toFixed(2)}`;
    },
    [convertPrice, selectedCurrency],
  );

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setCurrency,
        exchangeRates,
        isLoadingRates,
        convertPrice,
        formatPrice,
        supportedCurrencies: SUPPORTED_CURRENCIES,
        currencySymbols: CURRENCY_SYMBOLS,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}

/** Parse INR numeric value from a price string like "₹799" or "799" */
export function parseInrPrice(price: string): number {
  return Number.parseFloat(price.replace(/[^\d.]/g, "")) || 0;
}
