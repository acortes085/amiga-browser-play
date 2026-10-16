import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nueva contraseña — Amiga Arcade" },
      { name: "description", content: "Elige una nueva contraseña para tu cuenta de Amiga Arcade." },
      { property: "og:title", content: "Nueva contraseña — Amiga Arcade" },
      { property: "og:description", content: "Elige una nueva contraseña para tu cuenta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setMsg(error.message);
    else navigate({ to: "/" });
  }
  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-4 font-display text-xs text-primary">NUEVA CONTRASEÑA</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border-2 bg-background p-3" type="password" required minLength={6} placeholder="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full border-2 bg-secondary p-3 font-display text-xs pixel-shadow hover:bg-primary hover:text-primary-foreground">GUARDAR</button>
      </form>
      {msg && <p className="mt-4 text-destructive">{msg}</p>}
    </main>
  );
}
