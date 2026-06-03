import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  type: string;
}

type EditRow = Partial<Row> & {
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  type: string;
};

const emptyRow = (): EditRow => ({
  start_date: "",
  end_date: "",
  start_time: "01:00",
  end_time: "23:00",
  type: "blocked",
});

export const ReservationsAdmin = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditRow | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await callAdmin<{ rows: Row[] }>({ action: "list_reservations" });
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
      await callAdmin({ action: "delete_reservation", id });
      toast({ title: "Törölve" });
      load();
    } catch (e: any) {
      toast({ title: "Hiba", description: e.message, variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.start_date || !editing.end_date) {
      toast({ title: "Kezdő és végdátum kötelező", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { id, ...data } = editing;
      await callAdmin({ action: "upsert_reservation", id, data });
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Idősávok befoglalása</h2>
        <Button onClick={() => setEditing(emptyRow())}>+ Új befoglalás</Button>
      </div>

      {loading ? (
        <p>Betöltés...</p>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kezdő dátum</TableHead>
                <TableHead>Vég dátum</TableHead>
                <TableHead>Kezdő idő</TableHead>
                <TableHead>Vég idő</TableHead>
                <TableHead>Típus</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow
                  key={r.id}
                  className="cursor-pointer"
                  onClick={() =>
                    setEditing({
                      id: r.id,
                      start_date: r.start_date,
                      end_date: r.end_date,
                      start_time: (r.start_time || "").slice(0, 5),
                      end_time: (r.end_time || "").slice(0, 5),
                      type: r.type || "blocked",
                    })
                  }
                >
                  <TableCell>{r.start_date}</TableCell>
                  <TableCell>{r.end_date}</TableCell>
                  <TableCell>{r.start_time}</TableCell>
                  <TableCell>{r.end_time}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
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
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nincs befoglalás
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? "Befoglalás szerkesztése" : "Új befoglalás"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <div className="grid gap-1">
                <Label>Kezdő dátum *</Label>
                <Input
                  type="date"
                  value={editing.start_date}
                  onChange={(e) =>
                    setEditing({ ...editing, start_date: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-1">
                <Label>Vég dátum *</Label>
                <Input
                  type="date"
                  value={editing.end_date}
                  onChange={(e) =>
                    setEditing({ ...editing, end_date: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label>Kezdő idő</Label>
                  <Input
                    type="time"
                    value={editing.start_time}
                    onChange={(e) =>
                      setEditing({ ...editing, start_time: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <Label>Vég idő</Label>
                  <Input
                    type="time"
                    value={editing.end_time}
                    onChange={(e) =>
                      setEditing({ ...editing, end_time: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-1">
                <Label>Típus</Label>
                <Input
                  value={editing.type}
                  onChange={(e) =>
                    setEditing({ ...editing, type: e.target.value })
                  }
                />
              </div>
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
