import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { useMyRoles } from "@/lib/roles";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administración — Amiga Arcade" },
      { name: "description", content: "Gestiona los usuarios Premium de Amiga Arcade." },
      { property: "og:title", content: "Administración — Amiga Arcade" },
      { property: "og:description", content: "Gestiona los usuarios Premium." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const me = useMyRoles();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");
  const users = useQuery({
    queryKey: ["admin-users"],
    enabled: !!me.data?.admin,
    queryFn: async () => {
      const [p, r] = await Promise.all([
        supabase.from("profiles").select("id,email,display_name,created_at").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id,role"),
      ]);
      const roles = r.data ?? [];
      return (p.data ?? []).map((u) => ({
        ...u,
        premium: roles.some((x) => x.user_id === u.id && x.role === "premium"),
        admin: roles.some((x) => x.user_id === u.id && x.role === "admin"),
      }));
    },
  });

  async function toggle(id: string, premium: boolean) {
    if (premium) await supabase.from("user_roles").delete().eq("user_id", id).eq("role", "premium");
    else await supabase.from("user_roles").insert({ user_id: id, role: "premium" });
    qc.invalidateQueries({ queryKey: ["admin-users"] });
    qc.invalidateQueries({ queryKey: ["my-roles"] });
  }

  if (me.isLoading) return null;
  if (!me.data?.admin)
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p>No tienes acceso a esta página.</p>
        <Link to="/" className="text-primary hover:underline">Volver</Link>
      </main>
    );

  const list = (users.data ?? []).filter((u) => (u.email ?? "").toLowerCase().includes(filter.toLowerCase()));

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <AppHeader />
      <Link to="/" className="font-display text-xs text-primary hover:underline">◀ VOLVER</Link>
      <h1 className="mt-4 font-display text-xl text-primary">USUARIOS</h1>
      <input className="mt-4 w-full border-2 bg-background p-3" placeholder="Buscar por email…" value={filter} onChange={(e) => setFilter(e.target.value)} />
      <ul className="mt-4 divide-y-2 border-2 bg-card">
        {list.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
            <div>
              <p>{u.email} {u.admin && <span className="text-muted-foreground">(admin)</span>}</p>
              <p className="text-muted-foreground">Alta: {new Date(u.created_at).toLocaleDateString("es-ES")}</p>
            </div>
            <button
              onClick={() => toggle(u.id, u.premium)}
              className={`border-2 px-3 py-2 font-display text-xs pixel-shadow ${u.premium ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            >
              {u.premium ? "★ PREMIUM (quitar)" : "HACER PREMIUM"}
            </button>
          </li>
        ))}
        {list.length === 0 && <li className="p-3 text-muted-foreground">No hay usuarios.</li>}
      </ul>
    </main>
  );
}
