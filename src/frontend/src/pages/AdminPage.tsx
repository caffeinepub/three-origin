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
import { ImagePlus, Loader2, Lock, Trash2, Upload } from "lucide-react";
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
import {
  getAnonStorageClient,
  useStorageClient,
} from "../hooks/useStorageClient";

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
                <TabsTrigger value="whatsapp" className="flex-1">
                  📱 WhatsApp
                </TabsTrigger>
                <TabsTrigger value="payment" className="flex-1">
                  💳 Payment QR
                </TabsTrigger>
              </TabsList>

              <TabsContent value="designs">
                <DesignsTab />
              </TabsContent>
              <TabsContent value="whatsapp">
                <WhatsAppTab />
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
    if (!name.trim() || !imageFile || !storageClient) {
      toast.error("Please fill in the name and upload an image");
      return;
    }
    if (!price.trim() || !deliveryCharge.trim()) {
      toast.error("Please fill in price and delivery charge");
      return;
    }
    setUploading(true);
    try {
      const bytes = new Uint8Array(await imageFile.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes);
      await addMutation.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        imageKey: hash,
        price: price.trim(),
        deliveryCharge: deliveryCharge.trim(),
      });
      toast.success("Design added!");
      setName("");
      setDescription("");
      setPrice("");
      setDeliveryCharge("");
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
            disabled={uploading || addMutation.isPending || !storageClient}
            className="w-full"
          >
            {uploading || addMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {uploading
              ? "Uploading photo..."
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
  };
  index: number;
  onDelete: () => void;
}) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useState(() => {
    getAnonStorageClient().then((client) => {
      client
        .getDirectURL(tshirt.imageKey)
        .then(setImgUrl)
        .catch(() => {});
    });
  });

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/20">
      <div className="w-12 h-12 bg-muted rounded overflow-hidden shrink-0">
        {imgUrl && (
          <img
            src={imgUrl}
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
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

function WhatsAppTab() {
  const { data: current = "", isLoading } = useWhatsappNumber();
  const [value, setValue] = useState("");
  const mutation = useSetWhatsapp();

  useState(() => {
    if (current) setValue(current);
  });

  const handleSave = async () => {
    if (!value.trim()) {
      toast.error("Please enter a WhatsApp number");
      return;
    }
    try {
      await mutation.mutateAsync(value.trim());
      toast.success("WhatsApp number saved!");
    } catch {
      toast.error("Failed to save");
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base">WhatsApp Number</CardTitle>
        <CardDescription>
          Include country code — e.g. <strong>919876543210</strong> for India
          (+91). Customers will click this to contact you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : (
          <>
            {current && (
              <div className="bg-secondary/30 rounded-lg px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Current number
                </p>
                <p className="font-medium">{current}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Enter Number</Label>
              <Input
                id="whatsapp"
                placeholder="919876543210"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={mutation.isPending}
              className="w-full"
            >
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {mutation.isPending ? "Saving..." : "Save Number"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
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
