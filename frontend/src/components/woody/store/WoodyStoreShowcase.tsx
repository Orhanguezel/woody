'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';

import { localizePath } from '@/integrations/shared';
import { FOCUS_RING } from '@/lib/a11y';
import { WhatsAppLink } from '@/components/common/WhatsAppLink';
import QuoteRequestForm, { type QuoteFormCopy } from '@/components/woody/quote/QuoteRequestForm';
import WaitlistSignupForm, { type WaitlistFormCopy } from '@/components/woody/waitlist/WaitlistSignupForm';

export type StoreCatalogCategory = {
  id: string;
  name: string;
  description?: string;
  route?: string;
  color?: string;
};

export type StoreCatalogProduct = {
  id: string | number;
  category: string;
  name: string;
  description?: string;
  price?: string;
  image?: string;
};

export type StoreCatalog = {
  quoteWhatsApp?: string;
  quoteMessage?: string;
  primaryCTA?: string;
  showQuoteButtons?: boolean;
  quoteForm?: QuoteFormCopy;
  waitlistForm?: WaitlistFormCopy;
  categories?: StoreCatalogCategory[];
  products?: StoreCatalogProduct[];
};

const categoryColors: Record<string, string> = {
  'okul-serisi': 'var(--brand-primary-light)',
  atolye: 'var(--color-success)',
  'ozel-ders': '#9C27B0',
};

const comingSoonImage =
  '/media/woody/reference/ga68xbh7_Paragraf%20metniniz%20(4).png';

function quoteText(message: string | undefined) {
  return (
    message ||
    'Merhaba, okul setlerinizin fiyat bilgisi hakkında bilgi almak istiyorum.\n\nŞehir:\nOkul Adı:\nÖğrenci Sayısı:\nLütfen dijital kataloğunuzla birlikte fiyat teklifinizi iletebilir misiniz?'
  );
}

export default function WoodyStoreShowcase({
  catalog,
  locale,
}: {
  catalog: StoreCatalog;
  locale: string;
}) {
  const isTr = locale === 'tr';
  const categories = catalog.categories ?? [];
  const products = catalog.products ?? [];
  const quoteMessage = quoteText(catalog.quoteMessage);
  const quoteLabel = String(catalog.primaryCTA || '').trim();
  const showQuoteButtons = catalog.showQuoteButtons !== false && Boolean(quoteLabel);

  return (
    <main className="bg-white text-gray-900">
      <section className="mt-[72px] bg-white py-8 md:py-10">
        <div className="mx-auto flex max-w-[600px] items-center justify-center px-6">
          <h1 className="sr-only">Woody Store</h1>
          <Image
            src="/assets/woody/woody-store-logo.png"
            alt="Woody Store"
            width={750}
            height={492}
            priority
            className="h-auto w-full max-w-[450px] object-contain"
          />
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-6 pt-2 md:px-16 lg:px-20">
        <Link
          href={`/${locale}`}
          className={`inline-flex items-center gap-2 text-[13px] font-medium tracking-wide text-gray-600 transition hover:text-black ${FOCUS_RING}`}
        >
          <ChevronLeft className="size-5" aria-hidden />
          {isTr ? 'GERİ' : 'BACK'}
        </Link>
      </div>

      <section className="border-b border-gray-200 bg-white py-4 md:py-5">
        <div className="container max-w-[1000px] text-center">
          <p className="text-[15px] font-semibold text-gray-700 md:text-[17px]">
            {isTr ? 'Okul öncesi İngilizce eğitim setleri' : 'Preschool English learning sets'}
          </p>
        </div>
      </section>

      {categories.map((category) => {
        const color = category.color || categoryColors[category.id] || 'var(--brand-primary)';
        const categoryProducts = products.filter((product) => product.category === category.id);
        const isComingSoon = category.id === 'atolye' || category.id === 'ozel-ders';

        return (
          <section key={category.id} className="w-full py-10 md:py-12" data-testid={`store-category-${category.id}`}>
            <div className="container max-w-[900px]">
              <div className="mb-6">
                <div className="mb-3 flex items-center gap-3">
                  <h2 className="text-[24px] font-black leading-tight text-gray-900 md:text-[28px]">
                    {category.name}
                  </h2>
                  {category.route ? (
                    <Link
                      href={localizePath(locale as any, category.route)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-bold transition hover:shadow-md ${FOCUS_RING}`}
                      style={{ color }}
                    >
                      {isTr ? 'Seriye Git' : 'Go to Series'}
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  ) : null}
                </div>
                <div className="mb-4 h-[3px] w-24" style={{ backgroundColor: color }} />

                {category.id === 'okul-serisi' ? (
                  <div className="mt-3 space-y-1">
                    <p className="text-[13px] font-semibold text-gray-700 md:text-[14px]">
                      {isTr ? 'Sınıf kullanımı içindir.' : 'Designed for classroom use.'}
                    </p>
                    <p className="text-[11px] text-gray-500 md:text-[12px]">
                      {isTr
                        ? '(Öğretmen seti, Mina Yayınevi anlaşması ile verilir. Sadece öğrenci seti almanız yeterlidir.)'
                        : '(The teacher set is provided through Mina Publishing House agreements. Purchasing the student set is sufficient.)'}
                    </p>
                  </div>
                ) : category.description ? (
                  <p className="mt-3 text-[13px] font-semibold text-gray-600 md:text-[14px]">{category.description}</p>
                ) : null}
              </div>

              {isComingSoon ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="relative mb-4 aspect-[500/281] w-full max-w-[500px] overflow-hidden rounded-2xl">
                    <Image src={comingSoonImage} alt={isTr ? 'Çok yakında' : 'Coming soon'} fill sizes="500px" className="object-cover" />
                  </div>
                  <p className="text-[16px] font-bold text-gray-700 md:text-[18px]">
                    {isTr ? 'Çok yakında buradayız' : 'Coming soon'}
                  </p>
                  <WaitlistSignupForm copy={catalog.waitlistForm} productKey={category.id} locale={locale} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {categoryProducts.map((product) => (
                    <article
                      key={product.id}
                      className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:shadow-lg"
                      data-testid={`store-product-${product.id}`}
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 450px"
                            className="object-contain transition duration-500 group-hover:scale-105"
                          />
                        ) : null}
                      </div>
                      <div className="p-3 md:p-4">
                        <h3 className="mb-1 line-clamp-2 text-[13px] font-bold text-gray-900 md:text-[15px]">
                          {product.name}
                        </h3>
                        {product.description ? (
                          <p className="mb-3 line-clamp-1 text-[11px] text-gray-500 md:text-[12px]">
                            {product.description}
                          </p>
                        ) : null}
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          {product.price ? (
                            <p className="text-[12px] font-black leading-tight text-gray-800 md:text-[13px]">
                              {product.price}
                            </p>
                          ) : null}
                          <div className="flex w-full flex-wrap gap-2 md:w-auto">
                            {showQuoteButtons ? (
                              <WhatsAppLink
                                phone={catalog.quoteWhatsApp}
                                text={quoteMessage}
                                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-primary px-3 py-2 text-[11px] font-bold text-white transition hover:bg-brand-dark md:flex-none md:text-[12px] ${FOCUS_RING}`}
                                data-testid={`store-quote-btn-${product.id}`}
                              >
                                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                                {quoteLabel}
                              </WhatsAppLink>
                            ) : null}
                            {catalog.quoteForm?.linkLabel ? (
                              <a
                                href="#quote-form"
                                className={`inline-flex flex-1 items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-[11px] font-bold text-gray-800 transition hover:bg-gray-50 md:flex-none md:text-[12px] ${FOCUS_RING}`}
                              >
                                {catalog.quoteForm.linkLabel}
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}

      <QuoteRequestForm copy={catalog.quoteForm} source="store" />
    </main>
  );
}
