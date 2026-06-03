import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");
    if (!adminPassword) return json({ error: "Server not configured" }, 500);

    const providedPassword = req.headers.get("x-admin-password") ?? "";
    if (providedPassword !== adminPassword) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json().catch(() => ({}));
    const { action, id, data } = body as {
      action: string;
      id?: string;
      data?: Record<string, unknown>;
    };

    switch (action) {
      case "verify":
        return json({ ok: true });

      case "list_szulinapok": {
        const { data: rows, error } = await supabase
          .from("kockabarlang_szulinapok")
          .select("*")
          .order("date", { ascending: false });
        if (error) throw error;
        return json({ rows });
      }
      case "update_szulinapok": {
        if (!id || !data) return json({ error: "Missing id/data" }, 400);
        const { error } = await supabase
          .from("kockabarlang_szulinapok")
          .update(data)
          .eq("id", id);
        if (error) throw error;
        return json({ ok: true });
      }
      case "delete_szulinapok": {
        if (!id) return json({ error: "Missing id" }, 400);
        const { error } = await supabase
          .from("kockabarlang_szulinapok")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return json({ ok: true });
      }

      case "list_reservations": {
        const today = new Date().toISOString().slice(0, 10);
        const { data: rows, error } = await supabase
          .from("kockabarlang_reservations")
          .select("*")
          .gte("start_date", today)
          .order("start_date", { ascending: true });
        if (error) throw error;
        return json({ rows });
      }
      case "upsert_reservation": {
        if (!data) return json({ error: "Missing data" }, 400);
        const payload: Record<string, unknown> = {
          start_date: data.start_date,
          end_date: data.end_date,
          start_time: data.start_time || "01:00:00",
          end_time: data.end_time || "23:00:00",
          type: data.type || "blocked",
        };
        if (id) {
          const { error } = await supabase
            .from("kockabarlang_reservations")
            .update(payload)
            .eq("id", id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("kockabarlang_reservations")
            .insert(payload);
          if (error) throw error;
        }
        return json({ ok: true });
      }
      case "delete_reservation": {
        if (!id) return json({ error: "Missing id" }, 400);
        const { error } = await supabase
          .from("kockabarlang_reservations")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return json({ ok: true });
      }

      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    console.error("admin-api error", e);
    return json({ error: (e as Error).message }, 500);
  }
});
