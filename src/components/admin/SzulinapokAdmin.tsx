import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { callAdmin } from "@/lib/adminApi";
import { toast } from "@/hooks/use-toast";

interface Row {
  id: string;
  date: string | null;
  time: string | null;
  theme: string | null;
  parent: string | null;
  child: string | null;
  phone: string | null;
  email: string | null;
  birthday: string | null;
  message: string | null;
  invoice: string | null;
  gyerekek_szama: string | null;
}

const FIELDS: { key: keyof Row; label: string; type?: string; textarea?: boolean }[] = [
  { key: "date", label: "Dátum", type: "date" },
  { key: "time", label: "Időpont" },
  { key: "theme", label: "Téma" },
  { key: "parent", label: "Szülő neve" },
  { key: "gyerekek_szama", label: "Gyerekek száma" },
  { key: "child", label: "Gyerek neve" },
  { key: "birthday", label: "Gyerek szül.napja", type: "date" },
  { key: "phone", label: "Telefon" },
  { key: "email", label: "Email" },
  { key: "invoice", label: "Számlázás" },
  { key: "message", label: "Üzenet", textarea: true },
];

export const SzulinapokAdmin = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await callAdmin<{ rows: Row[] }>({ action: "list_szulinapok" });
      setRows(res.rows ?? []);
    } catch (e: any) {
      toast({ title: "Hiba", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Biztosan törlöd?")) return;
    try {
      await callAdmin({ action: "delete_szulinapok", id });
      toast({ title: "Törölve" });
      load();
    } catch (e: any) {
      toast({ title: "Hiba", description: e.message, variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const { id, ...data } = editing;
      await callAdmin({ action: "update_szulinapok", id, data });
      toast({ title: "Mentve" });
      setEditing(null);
      load();
    } catch (e: any) {
      toast({ title: "Hiba", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Meglévő foglalások</h2>
      {loading ? (
        <p>Betöltés...</p>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dátum</TableHead>
                <TableHead>Idő</TableHead>
                <TableHead>Szülő</TableHead>
                <TableHead>Gyerek</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Email</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>{r.time}</TableCell>
                  <TableCell>{r.parent}</TableCell>
                  <TableCell>{r.child}</TableCell>
                  <TableCell>{r.phone}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => setEditing(r)}>
                      Szerkeszt
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(r.id)}
                    >
                      Töröl
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nincs foglalás
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Foglalás szerkesztése</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              {FIELDS.map((f) => (
                <div key={f.key} className="grid gap-1">
                  <Label>{f.label}</Label>
                  {f.textarea ? (
                    <Textarea
                      value={(editing[f.key] as string) ?? ""}
                      onChange={(e) =>
                        setEditing({ ...editing, [f.key]: e.target.value })
                      }
                    />
                  ) : (
                    <Input
                      type={f.type || "text"}
                      value={(editing[f.key] as string) ?? ""}
                      onChange={(e) =>
                        setEditing({ ...editing, [f.key]: e.target.value })
                      }
                    />
                  )}
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditing(null)}>
                  Mégse
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Mentés..." : "Mentés"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
