'use client';

import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabaseBrowser';
import AuthDialog from '@/components/AuthDialog';
import { useRouter } from 'next/navigation';

export default function Client({ plan }: { plan: string }) {
  const supabase = useMemo(() => createSupabaseBrowser(), []);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      if (data.user) {
        // Déjà connecté → on va créer le projet directement
        router.replace(`/projects/new?plan=${encodeURIComponent(plan)}`);
      } else {
        setOpen(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [plan, router, supabase]);

  return (
    <>
      <AuthDialog
        open={open}
        onClose={() => setOpen(false)}
        plan={plan}
        defaultMode="signup"
      />

      {/* petit rappel en dessous (optionnel) */}
      <div className="mt-8 text-sm text-white/60">
        Après confirmation de votre e‑mail, vous serez redirigé pour créer votre
        premier projet <span className="text-teal-300">({plan})</span>.
      </div>
    </>
  );
}
