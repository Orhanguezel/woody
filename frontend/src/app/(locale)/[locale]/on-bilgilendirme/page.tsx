'use client';

import React from 'react';
import Banner from '@/layout/banner/Breadcrum';
import CmsLegalPageContent from '@/components/containers/legal/CmsLegalPageContent';
import { LayoutSeoBridge } from '@/seo';

const MODULE_KEY = 'preliminary_info';
const FALLBACK_TITLE = 'Ön Bilgilendirme Formu';

export default function PreliminaryInfoPage() {
  return (
    <>
      <LayoutSeoBridge title={FALLBACK_TITLE} noindex={false} />
      <Banner title={FALLBACK_TITLE} />

      <main className="bg-(--gm-bg) min-h-screen">
        <CmsLegalPageContent moduleKey={MODULE_KEY} />
      </main>
    </>
  );
}
