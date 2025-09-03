'use client'
import { useSearchParams } from 'next/navigation'

export default function CheckoutPage() {
  const sp = useSearchParams()
  const plan = sp.get('plan') ?? 'starter'
  const billing = sp.get('billing') ?? 'monthly'
  return (
    <div style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
      <h1>Checkout</h1>
      <p>Plan choisi : <b>{plan}</b></p>
      <p>Facturation : <b>{billing}</b></p>
      <p>(Branche ici Stripe : crée la session en envoyant plan & billing à ton API/Edge Function.)</p>
    </div>
  )
}
