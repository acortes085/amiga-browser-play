import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Amiga Arcade" },
      { name: "description", content: "Inicia sesión o regístrate para jugar a clásicos de Amiga." },
      { property: "og:title", content: "Entrar — Amiga Arcade" },
      { property: "og:description", content: "Inicia sesión o regístrate para jugar a clásicos de Amiga." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const input = "w-full border-2 bg-background p-3";
const btn = "w-full border-2 bg-secondary p-3 font-display text-xs pixel-shadow hover:bg-primary hover:text-primary-foreground disabled:opacity-40";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => data.session && navigate({ to: "/" }));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => s && navigate({ to: "/" }));
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg("Email o contraseña incorrectos.");
    } else if (mode === "up") {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      setMsg(error ? error.message : "Revisa tu correo y pulsa el enlace para confirmar la cuenta.");
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      setMsg(error ? error.message : "Te hemos enviado un correo para cambiar la contraseña.");
    }
    setBusy(false);
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) setMsg("No se pudo entrar con Google.");
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <div className="mb-8 flex items-center gap-3">
        <div className="boing h-10 w-10" />
        <h1 className="font-display text-lg text-primary">AMIGA ARCADE</h1>
      </div>
      <h2 className="mb-4 font-display text-xs">
        {mode === "in" ? "ENTRAR" : mode === "up" ? "CREAR CUENTA" : "RECUPERAR CONTRASEÑA"}
      </h2>
      <form onSubmit={submit} className="space-y-3">
        <input className={input} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {mode !== "forgot" && (
          <input className={input} type="password" required minLength={6} placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        )}
        <button className={btn} disabled={busy}>
          {mode === "in" ? "ENTRAR" : mode === "up" ? "REGISTRARME" : "ENVIAR CORREO"}
        </button>
      </form>
      {mode !== "forgot" && (
        <button onClick={google} className={`${btn} mt-3`}>CONTINUAR CON GOOGLE</button>
      )}
      {msg && <p className="mt-4 text-primary">{msg}</p>}
      <div className="mt-6 flex flex-col gap-2 text-muted-foreground">
        {mode !== "in" && <button className="hover:underline" onClick={() => setMode("in")}>Ya tengo cuenta</button>}
        {mode !== "up" && <button className="hover:underline" onClick={() => setMode("up")}>Crear una cuenta nueva</button>}
        {mode === "in" && <button className="hover:underline" onClick={() => setMode("forgot")}>He olvidado mi contraseña</button>}
      </div>
    </main>
  );
}
