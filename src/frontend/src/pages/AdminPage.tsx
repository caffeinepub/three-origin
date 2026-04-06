import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ImagePlus,
  Loader2,
  Lock,
  Phone,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import Header from "../components/Header";
import {
  useAddTshirt,
  useAllTshirts,
  usePaymentQR,
  useRemoveTshirt,
  useSetPaymentQR,
  useSetWhatsapp,
  useWhatsappNumber,
} from "../hooks/useQueries";

const ADMIN_PASSWORD = "OBS1314";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface ContactEntry {
  label: string;
  number: string;
}

function parseContacts(raw: string): ContactEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as ContactEntry[];
  } catch {
    // not JSON
  }
  // Legacy: plain number string
  const clean = raw.replace(/\D/g, "");
  if (clean) return [{ label: "WhatsApp", number: clean }];
  return [];
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("admin_auth") === "1",
  );

  const handleAuth = () => {
    sessionStorage.setItem("admin_auth", "1");
    setAuthed(true);
  };

  if (!authed) {
    return <PasswordGate onAuth={handleAuth} />;
  }

  return (
    <AdminDashboard
      onLogout={() => {
        sessionStorage.removeItem("admin_auth");
        setAuthed(false);
      }}
    />
  );
}

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError(false);
      onAuth();
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-sm w-full"
        >
          <p className="text-muted-foreground text-xs tracking-[0.3em] uppercase mb-4">
            Admin Access
          </p>
          <h1 className="font-display font-extrabold text-4xl uppercase tracking-tight mb-8">
            Three Origin
          </h1>
          <Card className="bg-card border-border">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2 text-left">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(false);
                    }}
                    autoFocus
                  />
                  {error && (
                    <p className="text-red-500 text-xs">
                      Incorrect password. Try again.
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  <Lock className="mr-2 h-4 w-4" />
                  Enter Admin Panel
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-muted-foreground text-xs tracking-[0.3em] uppercase mb-1">
                  Admin Panel
                </p>
                <h1 className="font-display font-extrabold text-2xl uppercase tracking-tight">
                  Three Origin
                </h1>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout}>
                Logout
              </Button>
            </div>

            <Tabs defaultValue="designs">
              <TabsList className="mb-6 bg-secondary w-full">
                <TabsTrigger value="designs" className="flex-1">
                  👕 Designs
                </TabsTrigger>
                <TabsTrigger value="contacts" className="flex-1">
                  📞 Contacts
                </TabsTrigger>
                <TabsTrigger value="payment" className="flex-1">
                  💳 Payment QR
                </TabsTrigger>
              </TabsList>

              <TabsContent value="designs">
                <DesignsTab />
              </TabsContent>
              <TabsContent value="contacts">
                <ContactsTab />
              </TabsContent>
              <TabsContent value="payment">
                <PaymentQRTab />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
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

function DesignsTab() {
  const { data: tshirts = [], isLoading } = useAllTshirts();
  const removeMutation = useRemoveTshirt();
  const addMutation = useAddTshirt();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState("");
  const [sizes, setSizes] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAddTshirt = async () => {
    if (!name.trim() || !imageFile) {
      toast.error("Please fill in the name and upload an image");
      return;
    }
    if (!price.trim() || !deliveryCharge.trim()) {
      toast.error("Please fill in price and delivery charge");
      return;
    }
    if (stock.trim() && Number.isNaN(Number.parseInt(stock.trim(), 10))) {
      toast.error("Stock must be a number");
      return;
    }
    setUploading(true);
    try {
      const imageKey = await fileToBase64(imageFile);
      await addMutation.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        imageKey,
        price: price.trim(),
        deliveryCharge: deliveryCharge.trim(),
        sizes: sizes.trim()
          ? sizes
              .trim()
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        stock: BigInt(Number.parseInt(stock.trim() || "0", 10)),
      });
      toast.success("Design added!");
      setName("");
      setDescription("");
      setPrice("");
      setDeliveryCharge("");
      setSizes("");
      setStock("");
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      toast.error("Failed to add design");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Your Designs</CardTitle>
          <CardDescription>
            Tap the trash icon to remove a design
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : tshirts.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No designs yet. Add your first one below.
            </p>
          ) : (
            <div className="space-y-2">
              {tshirts.map((t, i) => (
                <TshirtRow
                  key={t.name}
                  tshirt={t}
                  index={i + 1}
                  onDelete={() => {
                    removeMutation.mutate(t.name);
                    toast.success(`"${t.name}" removed`);
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Add New Design</CardTitle>
          <CardDescription>
            Upload a photo, set name and pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tshirt-name">Design Name *</Label>
            <Input
              id="tshirt-name"
              placeholder="e.g. Classic Origins Tee"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tshirt-desc">Description (optional)</Label>
            <Textarea
              id="tshirt-desc"
              placeholder="Short description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tshirt-price">Price *</Label>
              <Input
                id="tshirt-price"
                placeholder="e.g. ₹499"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                data-ocid="admin.designs.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tshirt-delivery">Delivery Charge *</Label>
              <Input
                id="tshirt-delivery"
                placeholder="e.g. ₹50"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(e.target.value)}
                data-ocid="admin.designs.input"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tshirt-sizes">
              Available Sizes (comma-separated)
            </Label>
            <Input
              id="tshirt-sizes"
              placeholder="e.g. S, M, L, XL, XXL"
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              data-ocid="admin.sizes.input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tshirt-stock">Stock (units remaining)</Label>
            <Input
              id="tshirt-stock"
              type="number"
              min="0"
              placeholder="e.g. 50"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              data-ocid="admin.stock.input"
            />
          </div>
          <div className="space-y-2">
            <Label>Photo *</Label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-foreground/40 transition-colors bg-transparent"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-28 h-28 object-cover rounded"
                />
              ) : (
                <ImagePlus className="w-8 h-8 text-muted-foreground" />
              )}
              <p className="text-muted-foreground text-sm">
                {imageFile ? imageFile.name : "Tap to choose photo"}
              </p>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <Button
            onClick={handleAddTshirt}
            disabled={uploading || addMutation.isPending}
            className="w-full"
            data-ocid="admin.designs.submit_button"
          >
            {uploading || addMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {uploading
              ? "Processing photo..."
              : addMutation.isPending
                ? "Saving..."
                : "Add Design"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function TshirtRow({
  tshirt,
  index: _index,
  onDelete,
}: {
  tshirt: {
    name: string;
    description: string;
    imageKey: string;
    price: string;
    deliveryCharge: string;
    sizes?: string[];
    stock?: bigint | number;
  };
  index: number;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/20">
      <div className="w-12 h-12 bg-muted rounded overflow-hidden shrink-0">
        {tshirt.imageKey && (
          <img
            src={tshirt.imageKey}
            alt={tshirt.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{tshirt.name}</p>
        {tshirt.price && (
          <p className="text-muted-foreground text-xs">
            {tshirt.price}
            {tshirt.deliveryCharge
              ? ` + ${tshirt.deliveryCharge} delivery`
              : ""}
          </p>
        )}
        {tshirt.sizes && tshirt.sizes.length > 0 && (
          <p className="text-muted-foreground text-xs">
            Sizes: {tshirt.sizes.join(", ")}
          </p>
        )}
        {tshirt.stock !== undefined && Number(tshirt.stock) > 0 && (
          <p className="text-muted-foreground text-xs">
            {Number(tshirt.stock)} units left
          </p>
        )}
        {tshirt.description && (
          <p className="text-muted-foreground text-xs truncate">
            {tshirt.description}
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
        data-ocid="admin.designs.delete_button"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

function ContactsTab() {
  const { data: rawValue = "", isLoading } = useWhatsappNumber();
  const mutation = useSetWhatsapp();

  const [contacts, setContacts] = useState<ContactEntry[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newNumber, setNewNumber] = useState("");

  // Initialize from fetched data once
  if (!initialized && !isLoading) {
    setContacts(parseContacts(rawValue));
    setInitialized(true);
  }

  const handleAdd = async () => {
    if (!newLabel.trim() || !newNumber.trim()) {
      toast.error("Please fill in both label and phone number");
      return;
    }
    const cleaned = newNumber.replace(/\D/g, "");
    if (!cleaned) {
      toast.error("Invalid phone number");
      return;
    }
    const updated = [...contacts, { label: newLabel.trim(), number: cleaned }];
    try {
      await mutation.mutateAsync(JSON.stringify(updated));
      setContacts(updated);
      setNewLabel("");
      setNewNumber("");
      toast.success("Contact added!");
    } catch {
      toast.error("Failed to save contact");
    }
  };

  const handleRemove = async (index: number) => {
    const updated = contacts.filter((_, i) => i !== index);
    try {
      await mutation.mutateAsync(JSON.stringify(updated));
      setContacts(updated);
      toast.success("Contact removed");
    } catch {
      toast.error("Failed to remove contact");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Contact Numbers</CardTitle>
          <CardDescription>
            These numbers appear on the Contact page. Customers tap them to chat
            on WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : contacts.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No contacts yet. Add your first number below.
            </p>
          ) : (
            <div className="space-y-2" data-ocid="admin.contacts.list">
              {contacts.map((c, i) => (
                <div
                  key={`${c.label}-${c.number}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/20"
                  data-ocid={`admin.contacts.item.${i + 1}`}
                >
                  <div className="w-9 h-9 bg-[#25D366]/10 border border-[#25D366]/20 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-[#25D366]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs tracking-widest uppercase text-muted-foreground">
                      {c.label}
                    </p>
                    <p className="font-medium text-sm">+{c.number}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(i)}
                    disabled={mutation.isPending}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    data-ocid={`admin.contacts.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Add Contact Number</CardTitle>
          <CardDescription>
            Add a label (e.g. "Orders", "Support") and the full number with
            country code (e.g. 919876543210 for India).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-label">Label *</Label>
            <Input
              id="contact-label"
              placeholder="e.g. Orders, Support, General"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              data-ocid="admin.contacts.input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-number">
              Phone Number (with country code) *
            </Label>
            <Input
              id="contact-number"
              placeholder="e.g. 919876543210"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              data-ocid="admin.contacts.input"
            />
            <p className="text-xs text-muted-foreground">
              For India: start with 91 followed by the 10-digit number.
            </p>
          </div>
          <Button
            onClick={handleAdd}
            disabled={mutation.isPending}
            className="w-full"
            data-ocid="admin.contacts.submit_button"
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {mutation.isPending ? "Saving..." : "Add Contact"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentQRTab() {
  const { data: currentUrl = "", isLoading } = usePaymentQR();
  const mutation = useSetPaymentQR();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please choose an image first");
      return;
    }
    setUploading(true);
    try {
      const bytes = new Uint8Array(await selectedFile.arrayBuffer());
      await mutation.mutateAsync(bytes);
      toast.success("Payment QR updated!");
      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      toast.error("Failed to upload QR code");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base">Payment QR Code</CardTitle>
        <CardDescription>
          Upload your UPI or bank payment QR code. Customers will scan this to
          pay.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : (
          <>
            {currentUrl && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Current QR Code:
                </p>
                <img
                  src={currentUrl}
                  alt="Current Payment QR"
                  className="w-40 h-40 object-contain border border-border p-2 rounded-lg"
                />
              </div>
            )}

            {currentUrl && <Separator />}

            <div className="space-y-4">
              <Label>Upload New QR Code</Label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-foreground/40 transition-colors bg-transparent"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-32 h-32 object-contain rounded"
                  />
                ) : (
                  <ImagePlus className="w-8 h-8 text-muted-foreground" />
                )}
                <p className="text-muted-foreground text-sm">
                  {selectedFile ? selectedFile.name : "Tap to choose QR image"}
                </p>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                onClick={handleUpload}
                disabled={uploading || mutation.isPending || !selectedFile}
                className="w-full"
                data-ocid="admin.payment.submit_button"
              >
                {uploading || mutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {uploading
                  ? "Uploading..."
                  : mutation.isPending
                    ? "Saving..."
                    : "Upload QR Code"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
