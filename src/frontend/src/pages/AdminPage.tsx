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
  Pencil,
  Phone,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import Header from "../components/Header";
import {
  useAddContact,
  useAddTshirt,
  useAllTshirts,
  useContacts,
  usePaymentQR,
  useRemoveContact,
  useRemoveTshirt,
  useSetPaymentQR,
  useUpdateTshirt,
} from "../hooks/useQueries";
import { useStorageClient } from "../hooks/useStorageClient";

const ADMIN_PASSWORD = "OBS1314";

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
  const storageClient = useStorageClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState("");
  const [sizes, setSizes] = useState("");
  const [colors, setColors] = useState("");
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
    if (!storageClient) {
      toast.error("Storage not ready, please try again");
      return;
    }
    setUploading(true);
    try {
      const bytes = new Uint8Array(await imageFile.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes);
      const imageKey = await storageClient.getDirectURL(hash);
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
        colors: colors.trim()
          ? colors
              .trim()
              .split(",")
              .map((c) => c.trim())
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
      setColors("");
      setStock("");
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to add design: ${msg}`);
      console.error("addTshirt error:", err);
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
            Tap the pencil icon to edit a design or the trash icon to remove it
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tshirt-delivery">Delivery Charge *</Label>
              <Input
                id="tshirt-delivery"
                placeholder="e.g. ₹50"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(e.target.value)}
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tshirt-colors">
              Available Colors (comma-separated)
            </Label>
            <Input
              id="tshirt-colors"
              placeholder="e.g. Black, White, Red, Navy Blue"
              value={colors}
              onChange={(e) => setColors(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty if no color options for this design.
            </p>
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

type TshirtData = {
  name: string;
  description: string;
  imageKey: string;
  price: string;
  deliveryCharge: string;
  sizes?: string[];
  colors?: string[];
  stock?: bigint | number;
};

function TshirtRow({
  tshirt,
  index: _index,
  onDelete,
}: {
  tshirt: TshirtData;
  index: number;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const updateMutation = useUpdateTshirt();

  const [editPrice, setEditPrice] = useState(tshirt.price);
  const [editDelivery, setEditDelivery] = useState(tshirt.deliveryCharge);
  const [editSizes, setEditSizes] = useState(tshirt.sizes?.join(", ") ?? "");
  const [editColors, setEditColors] = useState(tshirt.colors?.join(", ") ?? "");
  const [editStock, setEditStock] = useState(
    tshirt.stock !== undefined ? String(Number(tshirt.stock)) : "0",
  );
  const [editDescription, setEditDescription] = useState(tshirt.description);

  const handleSave = async () => {
    if (!editPrice.trim() || !editDelivery.trim()) {
      toast.error("Price and delivery charge are required");
      return;
    }
    const stockNum = Number.parseInt(editStock.trim() || "0", 10);
    if (Number.isNaN(stockNum) || stockNum < 0) {
      toast.error("Stock must be a valid non-negative number");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        name: tshirt.name,
        description: editDescription.trim(),
        imageKey: tshirt.imageKey,
        price: editPrice.trim(),
        deliveryCharge: editDelivery.trim(),
        sizes: editSizes.trim()
          ? editSizes
              .trim()
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        colors: editColors.trim()
          ? editColors
              .trim()
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean)
          : [],
        stock: BigInt(stockNum),
      });
      toast.success(`"${tshirt.name}" updated!`);
      setEditing(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Save failed: ${msg}`);
      console.error("updateTshirt error:", err);
    }
  };

  const handleCancel = () => {
    setEditPrice(tshirt.price);
    setEditDelivery(tshirt.deliveryCharge);
    setEditSizes(tshirt.sizes?.join(", ") ?? "");
    setEditColors(tshirt.colors?.join(", ") ?? "");
    setEditStock(
      tshirt.stock !== undefined ? String(Number(tshirt.stock)) : "0",
    );
    setEditDescription(tshirt.description);
    setEditing(false);
  };

  return (
    <div className="rounded-lg border border-border bg-secondary/20 overflow-hidden">
      {/* Collapsed row */}
      <div className="flex items-center gap-3 p-3">
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
          <p className="text-muted-foreground text-xs">
            Stock:{" "}
            <span
              className={
                Number(tshirt.stock ?? 0) === 0
                  ? "text-red-400 font-semibold"
                  : "text-green-400 font-semibold"
              }
            >
              {Number(tshirt.stock ?? 0)} units
            </span>
          </p>
          {tshirt.sizes && tshirt.sizes.length > 0 && (
            <p className="text-muted-foreground text-xs">
              Sizes: {tshirt.sizes.join(", ")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditing(!editing)}
            className="text-muted-foreground hover:text-foreground"
            data-ocid="admin.designs.edit_button"
          >
            {editing ? (
              <X className="w-4 h-4" />
            ) : (
              <Pencil className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            data-ocid="admin.designs.delete_button"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Expanded edit form */}
      {editing && (
        <div className="border-t border-border px-4 py-4 space-y-3 bg-background/40">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Edit Design
          </p>
          <div className="space-y-2">
            <Label className="text-xs">Description</Label>
            <Textarea
              placeholder="Short description..."
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="resize-none text-sm"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Price *</Label>
              <Input
                placeholder="e.g. ₹499"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="text-sm h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Delivery Charge *</Label>
              <Input
                placeholder="e.g. ₹50"
                value={editDelivery}
                onChange={(e) => setEditDelivery(e.target.value)}
                className="text-sm h-8"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Stock (units remaining) *</Label>
            <Input
              type="number"
              min="0"
              placeholder="e.g. 50"
              value={editStock}
              onChange={(e) => setEditStock(e.target.value)}
              className="text-sm h-8"
              data-ocid="admin.designs.stock_edit_input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sizes (comma-separated)</Label>
            <Input
              placeholder="e.g. S, M, L, XL, XXL"
              value={editSizes}
              onChange={(e) => setEditSizes(e.target.value)}
              className="text-sm h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Colors (comma-separated)</Label>
            <Input
              placeholder="e.g. Black, White, Red"
              value={editColors}
              onChange={(e) => setEditColors(e.target.value)}
              className="text-sm h-8"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              size="sm"
              className="flex-1"
              data-ocid="admin.designs.save_edit_button"
            >
              {updateMutation.isPending ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : null}
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ContactsTab() {
  const { data: contacts = [], isLoading } = useContacts();
  const addContactMutation = useAddContact();
  const removeContactMutation = useRemoveContact();

  const [newLabel, setNewLabel] = useState("");
  const [newNumber, setNewNumber] = useState("");

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
    // Check for duplicate label
    if (contacts.some((c) => c.contactLabel === newLabel.trim())) {
      toast.error(
        "A contact with this label already exists. Use a different label.",
      );
      return;
    }
    try {
      await addContactMutation.mutateAsync({
        contactLabel: newLabel.trim(),
        number: cleaned,
      });
      setNewLabel("");
      setNewNumber("");
      toast.success("Contact added!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to save contact: ${msg}`);
    }
  };

  const handleRemove = async (contactLabel: string) => {
    try {
      await removeContactMutation.mutateAsync(contactLabel);
      toast.success("Contact removed");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to remove contact: ${msg}`);
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
                  key={c.contactLabel}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/20"
                  data-ocid={`admin.contacts.item.${i + 1}`}
                >
                  <div className="w-9 h-9 bg-[#25D366]/10 border border-[#25D366]/20 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-[#25D366]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs tracking-widest uppercase text-muted-foreground">
                      {c.contactLabel}
                    </p>
                    <p className="font-medium text-sm">+{c.number}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(c.contactLabel)}
                    disabled={removeContactMutation.isPending}
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
            disabled={addContactMutation.isPending}
            className="w-full"
            data-ocid="admin.contacts.submit_button"
          >
            {addContactMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {addContactMutation.isPending ? "Saving..." : "Add Contact"}
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to upload QR code: ${msg}`);
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
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
                  Current QR Code
                </p>
                <img
                  src={currentUrl}
                  alt="Payment QR"
                  className="w-48 h-48 object-contain border border-border rounded-lg"
                />
              </div>
            )}
            <Separator />
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-foreground/40 transition-colors bg-transparent"
                data-ocid="admin.payment.upload_button"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="New QR Preview"
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
                {uploading || mutation.isPending
                  ? "Uploading..."
                  : "Upload QR Code"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
