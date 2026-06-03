import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { callAdmin, setAdminPassword, getAdminPassword } from "@/lib/adminApi";
import { AdminPanel } from "./AdminPanel";

export const AdminGate = () => {
  const [promptOpen, setPromptOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean>(!!getAdminPassword());

  useEffect(() => {
    let lastPress = 0;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const now = Date.now();
        if (now - lastPress < 600) {
          lastPress = 0;
          if (!loggedIn) {
            setPromptOpen(true);
          }
        } else {
          lastPress = now;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [loggedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await callAdmin({ action: "verify" }, password);
      setAdminPassword(password);
      setLoggedIn(true);
      setPromptOpen(false);
      setPassword("");
    } catch (err: any) {
      setError("Hibás jelszó");
    } finally {
      setLoading(false);
    }
  };

  if (loggedIn) {
    return <AdminPanel onLogout={() => setLoggedIn(false)} />;
  }

  return (
    <Dialog open={promptOpen} onOpenChange={setPromptOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Admin belépés</DialogTitle>
          <DialogDescription>Add meg az admin jelszót.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Jelszó"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading || !password} className="w-full">
            {loading ? "Ellenőrzés..." : "Belépés"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
