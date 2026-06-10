'use client';

import { FormEvent, useState } from 'react';

import { FOCUS_RING } from '@/lib/a11y';

export type QuoteFormCopy = {
  title?: string;
  description?: string;
  linkLabel?: string;
  submit?: string;
  success?: string;
  error?: string;
  kvkkLabel?: string;
  fields?: {
    orgName?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    studentCount?: string;
    level?: string;
    city?: string;
    district?: string;
    message?: string;
  };
  levels?: Record<string, string>;
};

type Props = {
  copy?: QuoteFormCopy;
  source: string;
};

const LEVELS = ['mixed', 'basic', 'junior', 'senior'] as const;

function initialForm() {
  return {
    org_name: '',
    contact_name: '',
    email: '',
    phone: '',
    student_count: '',
    level: 'mixed',
    city: '',
    district: '',
    message: '',
    kvkk_accepted: false,
  };
}

export default function QuoteRequestForm({ copy, source }: Props) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  function setField(name: keyof ReturnType<typeof initialForm>, value: string | boolean) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/v1/quote-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          student_count: Number(form.student_count),
          source,
        }),
      });
      if (!res.ok) throw new Error('quote_request_failed');
      window.gtag?.('event', 'quote_form_submit', {
        source,
        student_count: Number(form.student_count),
        level: form.level,
      });
      setForm(initialForm());
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  const fields = copy?.fields || {};

  return (
    <section id="quote-form" className="w-full bg-gray-50 py-14 md:py-16">
      <div className="mx-auto grid max-w-[1100px] gap-8 px-6 md:grid-cols-[0.9fr_1.1fr] md:px-12">
        <div>
          <h2 className="font-display text-[30px] font-black leading-tight text-gray-900 md:text-[42px]">
            {copy?.title}
          </h2>
          {copy?.description ? (
            <p className="mt-4 text-[15px] leading-7 text-gray-600">{copy.description}</p>
          ) : null}
        </div>

        <form onSubmit={onSubmit} className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <input className={`rounded-md border border-gray-200 px-3 py-3 text-[14px] ${FOCUS_RING}`} required placeholder={fields.orgName} value={form.org_name} onChange={(event) => setField('org_name', event.target.value)} />
            <input className={`rounded-md border border-gray-200 px-3 py-3 text-[14px] ${FOCUS_RING}`} required placeholder={fields.contactName} value={form.contact_name} onChange={(event) => setField('contact_name', event.target.value)} />
            <input className={`rounded-md border border-gray-200 px-3 py-3 text-[14px] ${FOCUS_RING}`} required type="email" placeholder={fields.email} value={form.email} onChange={(event) => setField('email', event.target.value)} />
            <input className={`rounded-md border border-gray-200 px-3 py-3 text-[14px] ${FOCUS_RING}`} placeholder={fields.phone} value={form.phone} onChange={(event) => setField('phone', event.target.value)} />
            <input className={`rounded-md border border-gray-200 px-3 py-3 text-[14px] ${FOCUS_RING}`} required min={1} type="number" placeholder={fields.studentCount} value={form.student_count} onChange={(event) => setField('student_count', event.target.value)} />
            <select className={`rounded-md border border-gray-200 px-3 py-3 text-[14px] ${FOCUS_RING}`} value={form.level} onChange={(event) => setField('level', event.target.value)}>
              {LEVELS.map((level) => (
                <option key={level} value={level}>{copy?.levels?.[level] || level}</option>
              ))}
            </select>
            <input className={`rounded-md border border-gray-200 px-3 py-3 text-[14px] ${FOCUS_RING}`} placeholder={fields.city} value={form.city} onChange={(event) => setField('city', event.target.value)} />
            <input className={`rounded-md border border-gray-200 px-3 py-3 text-[14px] ${FOCUS_RING}`} placeholder={fields.district} value={form.district} onChange={(event) => setField('district', event.target.value)} />
          </div>
          <textarea className={`min-h-28 rounded-md border border-gray-200 px-3 py-3 text-[14px] ${FOCUS_RING}`} placeholder={fields.message} value={form.message} onChange={(event) => setField('message', event.target.value)} />
          <label className="flex items-start gap-3 text-[13px] leading-5 text-gray-600">
            <input className={`mt-1 h-4 w-4 accent-[var(--gm-primary)] ${FOCUS_RING}`} type="checkbox" required checked={form.kvkk_accepted} onChange={(event) => setField('kvkk_accepted', event.target.checked)} />
            <span>{copy?.kvkkLabel}</span>
          </label>
          <button type="submit" disabled={status === 'loading'} className={`min-h-12 rounded-md bg-[var(--gm-primary)] px-5 text-[14px] font-bold text-white transition hover:bg-[var(--gm-primary-dark)] disabled:opacity-70 ${FOCUS_RING}`}>
            {copy?.submit}
          </button>
          {status === 'success' ? <p className="text-[13px] font-semibold text-green-700">{copy?.success}</p> : null}
          {status === 'error' ? <p className="text-[13px] font-semibold text-red-700">{copy?.error}</p> : null}
        </form>
      </div>
    </section>
  );
}
