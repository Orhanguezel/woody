import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ payment?: string; order?: string }>;
};

export default async function StoreCheckoutResultPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { payment, order } = await searchParams;
  const success = payment === 'success';

  return (
    <main className="bg-[var(--gm-bg)] py-20 text-[var(--gm-text)]">
      <div className="container max-w-2xl">
        <div className="rounded-lg border border-[var(--gm-border-soft)] bg-[var(--gm-surface)] p-8 shadow-[var(--gm-shadow-card)]">
          <div className="flex items-center gap-3">
            {success ? (
              <CheckCircle2 className="size-8 text-[var(--gm-primary)]" aria-hidden />
            ) : (
              <XCircle className="size-8 text-[var(--gm-error)]" aria-hidden />
            )}
            <h1 className="text-3xl font-semibold">
              {success ? 'Ödeme alındı' : 'Ödeme tamamlanamadı'}
            </h1>
          </div>
          <p className="mt-5 leading-8 text-[var(--gm-text-dim)]">
            {success
              ? 'Siparişiniz kaydedildi ve ödeme onaylandı.'
              : 'Ödeme sonucu başarısız görünüyor. Siparişinizi tekrar deneyebilirsiniz.'}
          </p>
          {order ? (
            <p className="mt-4 rounded-md border border-[var(--gm-border-soft)] p-3 font-mono text-sm">
              {order}
            </p>
          ) : null}
          <Link
            href={`/${locale}/store`}
            className="mt-8 inline-flex min-h-11 items-center rounded-md bg-[var(--gm-primary)] px-5 py-3 font-semibold text-[var(--gm-surface)]"
          >
            Mağazaya dön
          </Link>
        </div>
      </div>
    </main>
  );
}
