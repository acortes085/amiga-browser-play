import { Link, useNavigate  } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useMyRoles } from "@/lib/roles";

export function AppHeader() {
  const { data } = useMyRoles();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <nav className="mb-6 flex flex-wrap items-center justify-end gap-4 text-sm">
      <span className="text-muted-foreground">{data?.email}</span>
      <a
        href="https://t.me/acores085"
        target="_blank"
        rel="noopener noreferrer"
        className="font-display text-xs text-muted-foreground hover:text-primary hover:underline"
      >
        ¿ALGÚN PROBLEMA?
      </a>
      {data?.premium ? (
        <span className="font-display text-xs text-primary">★ PREMIUM</span>
      ) : (
        <Link to="/premium" className="font-display text-xs text-primary hover:underline">HAZTE PREMIUM</Link>
      )}
      {data?.admin && (
        <Link to="/admin" className="font-display text-xs text-primary hover:underline">ADMIN</Link>
      )}
      <button onClick={handleSignOut} className="font-display text-xs hover:underline">
        SALIR
      </button>
    </nav>
  );
}
