'use client';

import { FormEvent, useState } from 'react';

import { FOCUS_RING } from '@/lib/a11y';

export type WaitlistFormCopy = {
  title?: string;
  description?: string;
  emailPlaceholder?: string;
  submit?: string;
  success?: string;
  error?: string;
};

export default function WaitlistSignupForm({
  copy,
  productKey,
  locale,
}: {
  copy?: WaitlistFormCopy;
  productKey: string;
  locale: string;
}) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/v1/waitlist-signups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, product_key: productKey, locale, source: 'store' }),
      });
      if (!res.ok) throw new Error('waitlist_failed');
      setEmail('');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {copy?.title ? <h3 className="text-[15px] font-black text-gray-900">{copy.title}</h3> : null}
      {copy?.description ? <p className="mt-1 text-[12px] leading-5 text-gray-500">{copy.description}</p> : null}
      <div className="mt-4 flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={copy?.emailPlaceholder}
          className={`min-w-0 flex-1 rounded-md border border-gray-200 px-3 py-2 text-[13px] ${FOCUS_RING}`}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className={`rounded-md bg-[var(--gm-primary)] px-4 text-[12px] font-bold text-white disabled:opacity-70 ${FOCUS_RING}`}
        >
          {copy?.submit}
        </button>
      </div>
      {status === 'success' ? <p className="mt-2 text-[12px] font-semibold text-green-700">{copy?.success}</p> : null}
      {status === 'error' ? <p className="mt-2 text-[12px] font-semibold text-red-700">{copy?.error}</p> : null}
    </form>
  );
}
