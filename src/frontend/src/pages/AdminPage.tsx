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
  LogIn,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import Header from "../components/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddTshirt,
  useAllTshirts,
  useClaimFirstAdmin,
  useIsAdmin,
  usePaymentQR,
  useRemoveTshirt,
  useResetAdmin,
  useSetPaymentQR,
  useSetWhatsapp,
  useWhatsappNumber,
} from "../hooks/useQueries";
import {
  getAnonStorageClient,
  useStorageClient,
} from "../hooks/useStorageClient";

export default function AdminPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = !!identity;

  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  if (!isLoggedIn) {
    return (
      <LoginGate onLogin={login} isLoggingIn={loginStatus === "logging-in"} />
    );
  }

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2
            className="w-6 h-6 animate-spin text-muted-foreground"
            data-ocid="admin.loading_state"
          />
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return <ClaimAdminGate />;
  }

  return <AdminDashboard />;
}

function ClaimAdminGate() {
  const claimMutation = useClaimFirstAdmin();
  const resetMutation = useResetAdmin();
  const { clear } = useInternetIdentity();
  const [showReset, setShowReset] = useState(false);

  const handleClaim = async () => {
    try {
      await claimMutation.mutateAsync();
      toast.success("Admin access granted!");
    } catch {
      // Admin already claimed — show reset option
      setShowReset(true);
      toast.error(
        "Admin already claimed. Use the reset button below to reclaim it.",
      );
    }
  };

  const handleReset = async () => {
    try {
      await resetMutation.mutateAsync();
      toast.success("Admin reset! Now click Activate Admin Access.");
      setShowReset(false);
    } catch {
      toast.error("Reset failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full"
          data-ocid="admin.claim_panel"
        >
          <div className="text-center mb-8">
            <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-foreground" />
            <h2 className="font-display font-bold text-xl uppercase tracking-wider mb-2">
              Activate Admin
            </h2>
            <p className="text-muted-foreground text-sm">
              Click below to activate your admin account.
            </p>
          </div>
          <Card className="bg-card border-border">
            <CardContent className="p-6 space-y-3">
              <Button
                onClick={handleClaim}
                disabled={claimMutation.isPending}
                className="w-full"
                data-ocid="admin.claim_button"
              >
                {claimMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                )}
                {claimMutation.isPending
                  ? "Activating..."
                  : "Activate Admin Access"}
              </Button>

              {showReset && (
                <>
                  <p className="text-xs text-muted-foreground text-center">
                    Admin is already claimed by someone else. Reset it so you
                    can claim it.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={resetMutation.isPending}
                    className="w-full"
                    data-ocid="admin.reset_button"
                  >
                    {resetMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="mr-2 h-4 w-4" />
                    )}
                    {resetMutation.isPending
                      ? "Resetting..."
                      : "Reset Admin & Reclaim"}
                  </Button>
                </>
              )}

              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={clear}
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

function LoginGate({
  onLogin,
  isLoggingIn,
}: { onLogin: () => void; isLoggingIn: boolean }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-sm w-full"
          data-ocid="admin.panel"
        >
          <p className="text-muted-foreground text-xs tracking-[0.3em] uppercase mb-4">
            Admin Access
          </p>
          <h1 className="font-display font-extrabold text-4xl uppercase tracking-tight mb-8">
            Three Origin
          </h1>
          <Card className="bg-card border-border">
            <CardContent className="p-8">
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                Sign in to manage your store: update designs, WhatsApp number,
                and payment QR.
              </p>
              <Button
                onClick={onLogin}
                disabled={isLoggingIn}
                className="w-full"
                data-ocid="admin.primary_button"
              >
                {isLoggingIn ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                {isLoggingIn ? "Signing in..." : "Login to Admin Panel"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

function AdminDashboard() {
  const { clear } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-muted-foreground text-xs tracking-[0.3em] uppercase mb-1">
                  Admin Panel
                </p>
                <h1 className="font-display font-extrabold text-3xl uppercase tracking-tight">
                  Three Origin
                </h1>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                data-ocid="admin.secondary_button"
              >
                Logout
              </Button>
            </div>

            <Tabs defaultValue="designs" data-ocid="admin.tab">
              <TabsList className="mb-8 bg-secondary">
                <TabsTrigger value="designs" data-ocid="admin.designs.tab">
                  Designs
                </TabsTrigger>
                <TabsTrigger value="whatsapp" data-ocid="admin.whatsapp.tab">
                  WhatsApp
                </TabsTrigger>
                <TabsTrigger value="payment" data-ocid="admin.payment.tab">
                  Payment QR
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

function DropZone({
  preview,
  fileName,
  onTrigger,
  ocid,
}: {
  preview: string | null;
  fileName?: string;
  onTrigger: () => void;
  ocid: string;
}) {
  return (
    <button
      type="button"
      onClick={onTrigger}
      className="w-full border border-dashed border-border rounded p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-foreground/30 transition-colors bg-transparent"
      data-ocid={ocid}
    >
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="w-32 h-32 object-cover rounded"
        />
      ) : (
        <ImagePlus className="w-8 h-8 text-muted-foreground" />
      )}
      <p className="text-muted-foreground text-xs">
        {fileName ?? (preview ? "Image selected" : "Click to upload image")}
      </p>
    </button>
  );
}

function DesignsTab() {
  const { data: tshirts = [], isLoading } = useAllTshirts();
  const removeMutation = useRemoveTshirt();
  const addMutation = useAddTshirt();
  const storageClient = useStorageClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
      toast.error("Please fill in all fields and upload an image");
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
      });
      toast.success("Design added successfully");
      setName("");
      setDescription("");
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
    <div className="space-y-8">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-sm uppercase tracking-wider">
            Current Designs
          </CardTitle>
          <CardDescription>
            Manage your existing t-shirt listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div
              className="flex items-center gap-2 text-muted-foreground"
              data-ocid="designs.loading_state"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading designs...</span>
            </div>
          ) : tshirts.length === 0 ? (
            <p
              className="text-muted-foreground text-sm"
              data-ocid="designs.empty_state"
            >
              No designs yet. Add your first one below.
            </p>
          ) : (
            <div className="space-y-3" data-ocid="designs.list">
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
          <CardTitle className="font-display text-sm uppercase tracking-wider">
            Add New Design
          </CardTitle>
          <CardDescription>Upload a new t-shirt to your shop</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tshirt-name">Name</Label>
            <Input
              id="tshirt-name"
              placeholder="e.g. Classic Origins"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="designs.input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tshirt-desc">Description</Label>
            <Textarea
              id="tshirt-desc"
              placeholder="A short description of this design..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={2}
              data-ocid="designs.textarea"
            />
          </div>
          <div className="space-y-2">
            <Label>Image</Label>
            <DropZone
              preview={imagePreview}
              fileName={imageFile?.name}
              onTrigger={() => fileInputRef.current?.click()}
              ocid="designs.dropzone"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              data-ocid="designs.upload_button"
            />
          </div>
          <Button
            onClick={handleAddTshirt}
            disabled={uploading || addMutation.isPending || !storageClient}
            className="w-full"
            data-ocid="designs.submit_button"
          >
            {uploading || addMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {uploading
              ? "Uploading..."
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
  index,
  onDelete,
}: {
  tshirt: { name: string; description: string; imageKey: string };
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
    <div
      className="flex items-center gap-4 p-3 rounded border border-border bg-secondary/30"
      data-ocid={`designs.item.${index}`}
    >
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
        <p className="text-muted-foreground text-xs truncate">
          {tshirt.description}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
        data-ocid={`designs.delete_button.${index}`}
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
      toast.success("WhatsApp number updated");
    } catch {
      toast.error("Failed to update WhatsApp number");
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="font-display text-sm uppercase tracking-wider">
          WhatsApp Number
        </CardTitle>
        <CardDescription>
          Enter the number with country code (e.g. 919876543210 for India). This
          is displayed in the header.
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
              <p className="text-xs text-muted-foreground">
                Current:{" "}
                <span className="text-foreground font-medium">{current}</span>
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="whatsapp">New Number</Label>
              <Input
                id="whatsapp"
                placeholder="e.g. 919876543210"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                data-ocid="whatsapp.input"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={mutation.isPending}
              data-ocid="whatsapp.save_button"
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
  const { data: currentKey = "", isLoading } = usePaymentQR();
  const mutation = useSetPaymentQR();
  const storageClient = useStorageClient();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useState(() => {
    if (currentKey) {
      getAnonStorageClient().then((client) => {
        client
          .getDirectURL(currentKey)
          .then(setCurrentUrl)
          .catch(() => {});
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !storageClient) {
      toast.error("Please select an image");
      return;
    }
    setUploading(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes);
      await mutation.mutateAsync(hash);
      setCurrentUrl(await storageClient.getDirectURL(hash));
      toast.success("Payment QR updated");
    } catch {
      toast.error("Failed to update QR code");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="font-display text-sm uppercase tracking-wider">
          Payment QR Code
        </CardTitle>
        <CardDescription>
          Upload your UPI / bank payment QR code image.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div
            className="flex items-center gap-2 text-muted-foreground"
            data-ocid="payment.loading_state"
          >
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
                  alt="Current QR"
                  className="w-40 h-40 object-contain border border-border p-2 rounded"
                />
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <DropZone
                preview={preview}
                onTrigger={() => fileInputRef.current?.click()}
                ocid="payment.dropzone"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                data-ocid="payment.upload_button"
              />
              <Button
                onClick={handleUpload}
                disabled={
                  uploading || mutation.isPending || !preview || !storageClient
                }
                data-ocid="payment.submit_button"
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
