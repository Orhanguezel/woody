'use client';

// Rota-bagimli yan etkiler (SEO reset + scroll reveal).
// AYRI bilesen olma nedeni (2026-08-30): useSearchParams kullanan her sey Suspense ister;
// bu Suspense onceden TUM {children}'i sariyordu -> her sayfa stream ediyor, page icindeki
// notFound()/redirect() status kodu VEREMIYORDU (soft-404 fabrikasi, GSC cift-indeks).
// Simdi yalniz bu kucuk ada Suspense icinde; children bloklamadan status kodlari calisiyor.

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { resetLayoutSeo } from '../seo';

export default function RouteEffects() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Reset SEO store on route change
    resetLayoutSeo();
  }, [pathname, searchParams]);

  // Global scroll reveal observer.
  // Hydration-safe: Önce body'ye `scroll-reveal-ready` class eklenir
  // (CSS `.reveal` opacity/transform geçişini bu noktadan sonra aktive eder).
  // Sonra observer kurulur ve `.visible` class eklenmesi başlar — hydration
  // çoktan tamamlanmış olduğu için SSR/CSR class mismatch oluşmaz.
  useEffect(() => {
    let io: IntersectionObserver | null = null;
    let mo: MutationObserver | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    let raf1 = 0;
    let raf2 = 0;
    let postPaintTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const init = () => {
      if (cancelled) return;
      document.body.classList.add('scroll-reveal-ready');

      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('visible');
              io?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -20px 0px' },
      );

      const scan = () => {
        document.querySelectorAll('.reveal:not(.visible)').forEach((el) => io!.observe(el));
      };

      scan();
      mo = new MutationObserver(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(scan, 100);
      });
      mo.observe(document.body, { childList: true, subtree: true });
    };

    const scheduleInit = () => {
      if (cancelled) return;
      postPaintTimer = globalThis.setTimeout(init, 0);
    };

    // Çift rAF + setTimeout(0): commit, paint, sonra observer (hydration ile çakışmasın)
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(scheduleInit);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(postPaintTimer);
      io?.disconnect();
      mo?.disconnect();
      clearTimeout(debounceTimer);
    };
  }, [pathname]);

  return null;
}
