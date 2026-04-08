import { Button } from "@/components/ui/button";
import { MessageCircle, Phone } from "lucide-react";
import { motion } from "motion/react";
import { SiWhatsapp } from "react-icons/si";
import Header from "../components/Header";
import { useContacts } from "../hooks/useQueries";

export default function ContactPage() {
  const { data: contacts = [], isLoading } = useContacts();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center mx-auto mb-8">
            <MessageCircle className="w-9 h-9 text-[#25D366]" />
          </div>

          <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase mb-3">
            Three Origin
          </p>
          <h1 className="font-display font-extrabold text-4xl uppercase tracking-tight mb-4">
            Get in Touch
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-10">
            Have questions about an order, need help with sizing, or just want
            to chat? Reach us directly on WhatsApp — we're always happy to help.
          </p>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : contacts.length > 0 ? (
            <div className="space-y-4 mb-6" data-ocid="contact.list">
              {contacts.map((contact, i) => {
                // numbers are stored as digits-only (e.g. 919876543210)
                const digitsOnly = contact.number.replace(/\D/g, "");
                const waLink = `https://wa.me/${digitsOnly}?text=${encodeURIComponent("Hi! I'd like to know more about Three Origin.")}`;
                const displayNum = contact.number
                  ? `+${contact.number}`
                  : "Contact Us";
                return (
                  <motion.div
                    key={contact.contactLabel}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="p-5 border border-border rounded-2xl bg-card"
                    data-ocid={`contact.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-[#25D366]" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
                          {contact.contactLabel}
                        </p>
                        <p className="font-display font-bold text-lg">
                          {displayNum}
                        </p>
                      </div>
                    </div>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-ocid={`contact.primary_button.${i + 1}`}
                    >
                      <Button className="w-full h-11 rounded-full font-bold tracking-wider uppercase text-sm bg-[#25D366] hover:bg-[#1ebe5d] text-white border-0 flex items-center justify-center gap-3">
                        <SiWhatsapp className="w-4 h-4" />
                        Chat on WhatsApp
                      </Button>
                    </a>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div
              className="p-6 border border-border rounded-2xl bg-card mb-6 text-center"
              data-ocid="contact.empty_state"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                Contact details coming soon.
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Check back shortly or visit our store.
              </p>
            </div>
          )}

          <p className="text-muted-foreground text-xs mt-2">
            We typically respond within a few hours.
          </p>
        </motion.div>
      </main>

      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-display font-bold text-sm tracking-widest uppercase">
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
