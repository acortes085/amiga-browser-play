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
