// app/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import './pricing.css';

type PlanKey = 'free' | 'starter' | 'growth' | 'business' | 'pro';

type Plan = {
  key: PlanKey;
  title: string;
  priceMonthly: number;      // € / mois (mensuel)
  priceYearlyMonthly: number;// € / mois (si facturé/an)
  saveLabel?: string;        // ex: "Save 20%"
  badge?: string;            // ex: "Le + populaire"
  features: string[];
};

const PLANS: Plan[] = [
  {
    key: 'free',
    title: 'Gratuit (essai)',
    priceMonthly: 0,
    priceYearlyMonthly: 0,
    features: [
      'Projets : 1',
      'Systèmes / projet : 1',
      'Sous‑systèmes / système : 2',
    ],
  },
  {
    key: 'starter',
    title: 'Starter',
    priceMonthly: 19.99,
    priceYearlyMonthly: 15.99,
    saveLabel: 'Économisez 20%',
    features: [
      'Projets : 1',
      'Systèmes / projet : 5',
      'Sous‑systèmes / système : 5',
    ],
  },
  {
    key: 'growth',
    title: 'Growth',
    priceMonthly: 49.99,
    priceYearlyMonthly: 39.99,
    saveLabel: 'Économisez 20%',
    badge: 'Populaire',
    features: [
      'Projets : 2',
      'Systèmes / projet : 10',
      'Sous‑systèmes / système : 10',
    ],
  },
  {
    key: 'business',
    title: 'Business',
    priceMonthly: 199.99,
    priceYearlyMonthly: 159.99,
    saveLabel: 'Économisez 20%',
    features: [
      'Projets : 3',
      'Systèmes / projet : 20',
      'Sous‑systèmes / système : 15',
    ],
  },
  {
    key: 'pro',
    title: 'Pro',
    priceMonthly: 999.90,
    priceYearlyMonthly: 799.90,
    saveLabel: 'Économisez 20%',
    features: [
      'Projets : 5',
      'Systèmes / projet : 25',
      'Sous‑systèmes / système : 25',
    ],
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <main className="pricing">
      {/* Barre top minimaliste */}
      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand">
            <Link className="brand__name" href="/">precom‑com</Link>
          </div>
          <nav className="topnav">
            <Link href="/login" className="topnav__link">Se connecter</Link>
            <Link href="/signup" className="topnav__cta">Créer un compte</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <h1>Choisissez votre formule</h1>
        <p className="hero__subtitle">
          Passez de l’essai gratuit à la version pro quand vous voulez.
        </p>

        {/* Toggle mensuel / annuel */}
        <div className="billing-toggle" role="tablist" aria-label="Fréquence de facturation">
          <button
            role="tab"
            aria-selected={billing === 'monthly'}
            className={`billing-toggle__btn ${billing === 'monthly' ? 'is-active' : ''}`}
            onClick={() => setBilling('monthly')}
          >
            Mensuel
          </button>
          <button
            role="tab"
            aria-selected={billing === 'yearly'}
            className={`billing-toggle__btn ${billing === 'yearly' ? 'is-active' : ''}`}
            onClick={() => setBilling('yearly')}
            title="Facturé annuellement"
          >
            Annuel <span className="save">Économisez ~20%</span>
          </button>
        </div>
      </section>

      {/* Grille des cartes */}
      <section className="grid">
        {PLANS.map((plan) => {
          const price =
            billing === 'monthly' ? plan.priceMonthly : plan.priceYearlyMonthly;

          return (
            <article key={plan.key} className={`card ${plan.badge ? 'card--highlight' : ''}`}>
              {plan.badge && <div className="card__badge">{plan.badge}</div>}

              <h3 className="card__title">{plan.title}</h3>

              <div className="card__price">
                <span className="card__amount">
                  {price.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="card__period">€ / mois</span>
              </div>

              {billing === 'yearly' && plan.saveLabel && (
                <div className="card__save">{plan.saveLabel}</div>
              )}

              <ul className="card__features">
                {plan.features.map((f, i) => (
                  <li key={i}>
                    <CheckIcon /> {f}
                  </li>
                ))}
              </ul>

              <Link
                href={`/signup?plan=${plan.key}`}
                className="card__cta"
                aria-label={`Choisir le plan ${plan.title}`}
              >
                Choisir
              </Link>
            </article>
          );
        })}
      </section>

      {/* Bandeau sécurité / garanties */}
      <section className="footnote">
        <p>
          Paiement sécurisé • Annulation à tout moment • Assistance par e‑mail.
        </p>
      </section>
    </main>
  );
}

function CheckIcon() {
  return (
    <svg
      className="check"
      viewBox="0 0 20 20"
      width="20"
      height="20"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M7.5 13.3 3.9 9.7l-1.4 1.4 5 5 10-10-1.4-1.4-8.6 8.6Z"
        fill="currentColor"
      />
    </svg>
  );
}
