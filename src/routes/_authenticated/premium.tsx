import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useMyRoles } from "@/lib/roles";
import { PAYPAL_ME_URL, PREMIUM_PRICE } from "@/lib/premium";

export const Route = createFileRoute("/_authenticated/premium")({
  head: () => ({
    meta: [
      { title: "Hazte Premium — Amiga Arcade" },
      { name: "description", content: "Guarda tus partidas y accede a todas las opciones del emulador." },
      { property: "og:title", content: "Hazte Premium — Amiga Arcade" },
      { property: "og:description", content: "Guarda tus partidas y accede a todas las opciones del emulador." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PremiumPage,
});

function PremiumPage() {
  const { data } = useMyRoles();
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <AppHeader />
      <Link to="/" className="font-display text-xs text-primary hover:underline">◀ VOLVER</Link>
      <h1 className="mt-4 font-display text-xl text-primary">HAZTE PREMIUM</h1>
      {data?.premium ? (
        <p className="mt-6 border-2 bg-card p-4 pixel-shadow">¡Ya eres Premium! Disfruta guardando tus partidas.</p>
      ) : (
        <div className="mt-6 space-y-4 border-2 bg-card p-6 pixel-shadow">
          <p>Con Premium puedes <b>guardar y continuar tus partidas</b> y usar <b>todas las opciones del emulador</b>.</p>
          <ol className="list-decimal space-y-2 pl-6">
            <li>Envía <b>{PREMIUM_PRICE}</b> por PayPal con el botón de abajo.</li>
            <li>En el concepto del pago escribe tu email: <b className="text-primary">{data?.email}</b></li>
            <li>En cuanto lo recibamos activaremos tu cuenta Premium (normalmente en menos de 24 h).</li>
          </ol>
          <a href={PAYPAL_ME_URL} target="_blank" rel="noreferrer" className="inline-block border-2 bg-secondary px-4 py-3 font-display text-xs pixel-shadow hover:bg-primary hover:text-primary-foreground">
            PAGAR CON PAYPAL ▶
          </a>
        </div>
      )}
    </main>
  );
}
