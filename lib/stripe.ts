// /lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  // On n'indique pas apiVersion : Stripe utilisera la version par défaut du compte.
});
