// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Aligner sur la version supportée par le SDK installé
  apiVersion: '2024-06-20',
});

export default stripe;
