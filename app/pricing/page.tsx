// app/pricing/page.tsx  — composant SERVEUR par défaut (pas de `use client`)
import styles from './pricing.module.css';

export default function Page() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Tarifs</h1>
    </main>
  );
}
