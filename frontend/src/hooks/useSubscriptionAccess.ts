'use client';

import { useEffect, useState } from 'react';

import { tokenStore } from '@/integrations/rtk/token';

export type SubscriptionAccess = {
  hasAccess: boolean;
  isLoggedIn: boolean;
  status: 'none' | 'pending' | 'active' | 'canceled' | 'expired' | 'loading' | 'error';
};

export function useSubscriptionAccess(product?: string): SubscriptionAccess {
  const [state, setState] = useState<SubscriptionAccess>({
    hasAccess: false,
    isLoggedIn: false,
    status: 'loading',
  });

  useEffect(() => {
    let alive = true;
    const token = tokenStore.get();
    if (!token) {
      setState({ hasAccess: false, isLoggedIn: false, status: 'none' });
      return () => {
        alive = false;
      };
    }

    fetch('/api/v1/me/subscription', {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('subscription_status_failed');
        return res.json() as Promise<{ hasAccess?: boolean; status?: SubscriptionAccess['status'] }>;
      })
      .then((data) => {
        if (!alive) return;
        setState({
          hasAccess: product === 'library' ? false : Boolean(data.hasAccess),
          isLoggedIn: true,
          status: data.status && data.status !== 'loading' && data.status !== 'error' ? data.status : 'none',
        });
      })
      .catch(() => {
        if (!alive) return;
        setState({ hasAccess: false, isLoggedIn: true, status: 'error' });
      });

    return () => {
      alive = false;
    };
  }, [product]);

  return state;
}
