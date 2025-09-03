// app/pricing/page.tsx
export const metadata = { title: 'Tarifs — precom-com' }

export default function PricingPage() {
  return (
    <main className="pricing">
      <section className="hero">
        <h1>Tarifs</h1>
        <p>Choisissez le plan qui vous convient.</p>
      </section>

      <div className="grid">
        <article className="card">
          <h3>Starter</h3>
          <p className="price">0€</p>
          <ul className="features">
            <li>Import Excel</li>
            <li>Arbo Systèmes / Sous-systèmes</li>
            <li>Aperçu des éléments</li>
          </ul>
          <button className="btn">Choisir Starter</button>
        </article>

        <article className="card">
          <h3>Pro</h3>
          <p className="price">29€</p>
          <ul className="features">
            <li>Fiches tests (précom/com)</li>
            <li>Réserves & suivi</li>
            <li>Exports CSV</li>
          </ul>
          <button className="btn">Passer en Pro</button>
        </article>

        <article className="card">
          <h3>Entreprise</h3>
          <p className="price">Sur devis</p>
          <ul className="features">
            <li>Templates personnalisés</li>
            <li>SSO / Rôles & ACL</li>
            <li>Support prioritaire</li>
          </ul>
          <button className="btn">Nous contacter</button>
        </article>
      </div>

      <p className="note">Toutes les offres peuvent évoluer selon vos besoins.</p>

      <style jsx>{`
        .pricing {
          background: var(--bg);
          color: #fff;
          min-height: 100dvh;
          padding: 32px 16px 64px;
        }
        .hero { max-width: 1100px; margin: 0 auto 20px; }
        .hero h1 { font-size: 36px; margin: 0; }
        .hero p { margin: 6px 0 0; color: var(--muted); }

        .grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
        }

        .card {
          background: var(--card);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 16px;
        }

        .price {
          font-size: 40px;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 6px 0 12px;
          color: #e6faff;
        }

        .features {
          margin: 0 0 10px;
          padding-left: 18px;
          color: var(--muted);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: 1px solid transparent;
          padding: 10px 14px;
          background: var(--primary);     /* turquoise ici */
          color: #08121a;
          font-weight: 600;
          margin-top: 8px;
          box-shadow: 0 1px 0 rgba(0,0,0,.4);
          outline: none;
          cursor: pointer;
        }
        .btn:hover { background: var(--primary-600); }   /* hover turquoise plus sombre */
        .btn:focus-visible { box-shadow: var(--ring); }

        .note {
          max-width: 1100px;
          margin: 16px auto 0;
          color: var(--muted);
          font-size: 14px;
        }
      `}</style>
    </main>
  )
}
