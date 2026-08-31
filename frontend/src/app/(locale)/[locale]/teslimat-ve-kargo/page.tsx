'use client';

import React from 'react';
import Banner from '@/layout/banner/Breadcrum';
import CmsLegalPageContent from '@/components/containers/legal/CmsLegalPageContent';
import { LayoutSeoBridge } from '@/seo';

const MODULE_KEY = 'shipping';
const FALLBACK_TITLE = 'Teslimat ve Kargo Koşulları';

export default function ShippingPolicyPage() {
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
