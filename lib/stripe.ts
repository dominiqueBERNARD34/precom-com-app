import Stripe from 'stripe';

/**
 * NOTE: Le SDK Stripe installé est typé sur l'API '2025-08-27.basil'.
 * Pour éviter l'erreur de compilation, on aligne la valeur ci-dessous.
 * (Nous n'activons pas encore les paiements — cette config suffit pour builder.)
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-08-27.basil',
});
