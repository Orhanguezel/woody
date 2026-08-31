'use client';

import React from 'react';
import Banner from '@/layout/banner/Breadcrum';
import CmsLegalPageContent from '@/components/containers/legal/CmsLegalPageContent';
import { LayoutSeoBridge } from '@/seo';

const MODULE_KEY = 'distance_sales';
const FALLBACK_TITLE = 'Mesafeli Satış Sözleşmesi';

export default function DistanceSalesPage() {
  return (
    <>
      <LayoutSeoBridge title={FALLBACK_TITLE} noindex={false} />
      <Banner title={FALLBACK_TITLE} variant="legal" />

      <main className="bg-(--gm-bg) min-h-screen">
        <CmsLegalPageContent moduleKey={MODULE_KEY} />
      </main>
    </>
  );
}
