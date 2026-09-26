'use client';

import { useEffect } from 'react';

import { cartActions } from '@/features/cart/cart.store';

/** Ödeme başarı sayfasında sepeti boşaltır (sipariş sunucuda kayıtlı). */
export default function ClearCartOnSuccess() {
  useEffect(() => {
    cartActions.clear();
  }, []);
  return null;
}
