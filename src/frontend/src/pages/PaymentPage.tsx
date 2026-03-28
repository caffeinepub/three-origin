import { motion } from "motion/react";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import { usePaymentQR } from "../hooks/useQueries";
import { getAnonStorageClient } from "../hooks/useStorageClient";

const FALLBACK_QR = "/assets/generated/payment-qr.dim_400x400.png";

export default function PaymentPage() {
  const { data: qrKey } = usePaymentQR();
  const [qrUrl, setQrUrl] = useState<string>(FALLBACK_QR);

  useEffect(() => {
    if (!qrKey) return;
    getAnonStorageClient().then((client) => {
      client
        .getDirectURL(qrKey)
        .then(setQrUrl)
        .catch(() => setQrUrl(FALLBACK_QR));
    });
  }, [qrKey]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-sm w-full"
          data-ocid="payment.section"
        >
          <p className="text-muted-foreground text-xs tracking-[0.3em] uppercase mb-3">
            Secure Payment
          </p>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl uppercase tracking-tight mb-10">
            Pay Here
          </h1>

          <div className="border border-border p-6 bg-card inline-block">
            <img
              src={qrUrl}
              alt="Payment QR Code"
              className="w-64 h-64 object-contain"
              data-ocid="payment.canvas_target"
            />
          </div>

          <p className="text-muted-foreground text-sm mt-6 leading-relaxed">
            Scan the QR code to make payment
          </p>
        </motion.div>
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
