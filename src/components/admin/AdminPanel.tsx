import { useState } from "react";
import { Button } from "@/components/ui/button";
import { clearAdminPassword } from "@/lib/adminApi";
import { SzulinapokAdmin } from "./SzulinapokAdmin";
import { ReservationsAdmin } from "./ReservationsAdmin";

type View = "menu" | "szulinapok" | "reservations";

export const AdminPanel = ({ onLogout }: { onLogout: () => void }) => {
  const [view, setView] = useState<View>("menu");

  const handleLogout = () => {
    clearAdminPassword();
    onLogout();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Admin</h1>
          <div className="flex gap-2">
            {view !== "menu" && (
              <Button variant="outline" onClick={() => setView("menu")}>
                Vissza
              </Button>
            )}
            <Button variant="destructive" onClick={handleLogout}>
              Kilépés
            </Button>
          </div>
        </div>

        {view === "menu" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Button
              size="lg"
              className="h-32 text-lg"
              onClick={() => setView("szulinapok")}
            >
              Meglévő foglalások
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="h-32 text-lg"
              onClick={() => setView("reservations")}
            >
              Idősávok befoglalása
            </Button>
          </div>
        )}

        {view === "szulinapok" && <SzulinapokAdmin />}
        {view === "reservations" && <ReservationsAdmin />}
      </div>
    </div>
  );
};
