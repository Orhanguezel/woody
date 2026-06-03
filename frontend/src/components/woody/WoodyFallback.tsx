import { getPublicAppName } from '@/lib/site-config';

export default function WoodyFallback({ pageKey }: { pageKey: string }) {
  return (
    <main className="min-h-[60vh] bg-[var(--gm-bg)] text-[var(--gm-text)]">
      <section className="container py-20">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--gm-gold-deep)]">
          {getPublicAppName()}
        </p>
        <h1 className="mt-4 text-4xl font-semibold">{pageKey}</h1>
      </section>
    </main>
  );
}
