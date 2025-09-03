// Retourne l'origine à utiliser dans les liens d'auth (client + SSR)
export function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin; // navigateur
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL; // prod
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`; // preview vercel
  return 'http://localhost:3000';
}
