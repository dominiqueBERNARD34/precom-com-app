'use client';

import { useState } from 'react';
import supabase from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // après login, on vous renvoie directement vers la page d'import
        emailRedirectTo: `${location.origin}/import`,
      },
    });
    setLoading(false);
    if (error) alert(error.message);
    else setSent(true);
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Connexion</h1>
      {sent ? (
        <p>Un lien de connexion vient d’être envoyé à <b>{email}</b>. Ouvrez‑le puis revenez ici.</p>
      ) : (
        <form onSubmit={handleSignIn} style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
          <label>
            Votre e‑mail
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              style={{ width: '100%', padding: 8 }}
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Envoi…' : 'Recevoir un lien magique'}
          </button>
        </form>
      )}
    </main>
  );
}
