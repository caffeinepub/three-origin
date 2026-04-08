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

const RATES_TS_KEY = "three_origin_rates_ts";
const CURRENCY_KEY = "three_origin_currency";
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

function parseRatesFromJson(json: string): Record<string, number> {
  try {
    const parsed = JSON.parse(json) as { rates?: Record<string, number> };
    if (parsed?.rates && typeof parsed.rates === "object") {
      return { INR: 1.0, ...parsed.rates };
    }
  } catch {
    // ignore
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

  // Restore user currency preference
  useEffect(() => {
    const saved = localStorage.getItem(CURRENCY_KEY) as CurrencyCode | null;
    if (saved && SUPPORTED_CURRENCIES.includes(saved)) {
      setSelectedCurrency(saved);
    }
  }, []);

  // Load rates and auto-detect currency on actor ready
  useEffect(() => {
    if (!actor || isFetching) return;

    async function init() {
      if (!actor) return;
      setIsLoadingRates(true);
      try {
        // Check if cached rates are fresh enough
        const cachedAtResult = await actor.getRatesCachedAt();
        const cachedAtMs = Number(cachedAtResult) / 1_000_000; // nanoseconds to ms
        const now = Date.now();
        const needsRefresh =
          cachedAtMs === 0 || now - cachedAtMs > SIX_HOURS_MS;

        let ratesJson: string | null = null;

        if (needsRefresh) {
          try {
            ratesJson = await actor.refreshExchangeRates();
            localStorage.setItem(RATES_TS_KEY, String(now));
          } catch {
            // Fall through to cached rates
          }
        }

        if (!ratesJson) {
          const cached = await actor.getCurrencyRates();
          ratesJson =
            Array.isArray(cached) && cached.length > 0
              ? (cached[0] ?? null)
              : null;
        }

        if (ratesJson) {
          setExchangeRates(parseRatesFromJson(ratesJson));
        }

        // Auto-detect currency only if user hasn't set a preference
        const savedCurrency = localStorage.getItem(CURRENCY_KEY);
        if (!savedCurrency) {
          try {
            const ipRes = await fetch("https://api.ipify.org?format=json");
            const { ip } = (await ipRes.json()) as { ip: string };
            const detectedCurrency = await actor.detectUserCurrency(ip);
            const code = detectedCurrency.toUpperCase() as CurrencyCode;
            if (SUPPORTED_CURRENCIES.includes(code)) {
              setSelectedCurrency(code);
            }
          } catch {
            // Fallback to INR
          }
        }
      } catch {
        // Fallback to INR with no conversion
      } finally {
        setIsLoadingRates(false);
      }
    }

    init();
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
