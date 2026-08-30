'use client';

import React, { useState, FormEvent } from 'react';
import { useClientSearchParams } from '@/lib/useClientSearchParams';
import { tUi } from '@/i18n/staticUi';

import Link from 'next/link';
import { useConfirmPasswordResetMutation } from '@/integrations/rtk/hooks';
import { useLocaleShort } from '@/i18n';
import { localizePath, normalizeError } from '@/integrations/shared';
import { AUTH_FIELD_CLS, FOCUS_RING } from '@/lib/a11y';

export default function PasswordResetPage() {
  const locale = useLocaleShort();
  const searchParams = useClientSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [confirmReset, { isLoading }] = useConfirmPasswordResetMutation();

  const loginHref = localizePath(locale, '/login');

  if (!token) {
    return (
      <section className="bg-bg-primary py-20 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-bg-card p-8 md:p-12 rounded-lg shadow-soft text-center">
            <div className="w-16 h-16 bg-warning/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif font-light text-text-primary mb-3">
              {locale === 'de' ? 'Ungültiger Link' : tUi(locale, 'Invalid Link')}
            </h2>
            <p className="text-text-secondary mb-6">
              {locale === 'de'
                ? 'Kein Zurücksetzungs-Token gefunden. Bitte fordern Sie einen neuen Link an.'
                : tUi(locale, 'No reset token found. Please request a new link.')}
            </p>
            <Link
              href={localizePath(locale, '/forgot-password')}
              className={`inline-block rounded-sm bg-brand-primary px-6 py-3 text-sm font-bold text-text-on-dark transition-all hover:bg-brand-hover ${FOCUS_RING}`}
            >
              {locale === 'de' ? 'Neuen Link anfordern' : tUi(locale, 'Request New Link')}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (success) {
    return (
      <section className="bg-bg-primary py-20 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-bg-card p-8 md:p-12 rounded-lg shadow-soft text-center">
            <div className="w-16 h-16 bg-success/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif font-light text-text-primary mb-3">
              {locale === 'de'
                ? 'Passwort aktualisiert!'
                : tUi(locale, 'Password Updated!')}
            </h2>
            <p className="text-text-secondary mb-6">
              {locale === 'de'
                ? 'Ihr Passwort wurde erfolgreich zurückgesetzt. Sie können sich jetzt anmelden.'
                : tUi(locale, 'Your password has been successfully reset. You can now sign in.')}
            </p>
            <Link
              href={loginHref}
              className={`inline-block rounded-sm bg-brand-primary px-6 py-3 text-sm font-bold uppercase tracking-widest text-text-on-dark transition-all hover:bg-brand-hover ${FOCUS_RING}`}
            >
              {locale === 'de' ? 'Zum Login' : tUi(locale, 'Sign In')}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password.length < 6) {
      setFormError(
        locale === 'de'
          ? 'Das Passwort muss mindestens 6 Zeichen lang sein.'
          : tUi(locale, 'Password must be at least 6 characters.'),
      );
      return;
    }

    if (password !== confirmPwd) {
      setFormError(
        locale === 'de'
          ? 'Die Passwörter stimmen nicht überein.'
          : tUi(locale, 'Passwords do not match.'),
      );
      return;
    }

    try {
      await confirmReset({ token, password }).unwrap();
      setSuccess(true);
    } catch (err) {
      const msg = normalizeError(err as any).message;
      setFormError(
        msg ||
        (locale === 'de'
          ? 'Fehler beim Zurücksetzen. Der Link ist möglicherweise abgelaufen.'
          : tUi(locale, 'Reset failed. The link may have expired.')),
      );
    }
  };

  return (
    <section className="bg-bg-primary py-20 min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-bg-card-hover/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-md mx-auto bg-bg-card p-8 md:p-12 rounded-lg shadow-soft">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-serif font-light text-text-primary mb-3">
              {locale === 'de'
                ? 'Neues Passwort festlegen'
                : tUi(locale, 'Set New Password')}
            </h3>
            <p className="text-text-secondary leading-relaxed">
              {locale === 'de'
                ? 'Geben Sie Ihr neues Passwort ein.'
                : tUi(locale, 'Enter your new password.')}
            </p>
          </div>

          {formError && (
            <div
              role="alert"
              className="bg-error/5 border border-error/20 text-error px-4 py-3 rounded-md mb-6 text-sm flex items-start gap-2"
            >
              <span className="font-medium">{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="new-password" className="block text-sm font-bold text-text-primary mb-2 uppercase tracking-wide">
                {locale === 'de' ? 'Neues Passwort' : tUi(locale, 'New Password')}
              </label>
              <input
                id="new-password"
                type="password"
                className={`${AUTH_FIELD_CLS} ${FOCUS_RING}`}
                placeholder="••••••••"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-bold text-text-primary mb-2 uppercase tracking-wide">
                {locale === 'de' ? 'Passwort bestätigen' : tUi(locale, 'Confirm Password')}
              </label>
              <input
                id="confirm-password"
                type="password"
                className={`${AUTH_FIELD_CLS} ${FOCUS_RING}`}
                placeholder="••••••••"
                autoComplete="new-password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className={`flex w-full items-center justify-center rounded-sm bg-brand-primary px-4 py-3.5 text-sm font-bold uppercase tracking-widest text-text-on-dark shadow-soft transition-all duration-300 hover:bg-brand-hover hover:shadow-medium disabled:cursor-not-allowed disabled:opacity-70 ${FOCUS_RING}`}
              disabled={isLoading}
            >
              {isLoading
                ? (locale === 'de' ? 'Wird gespeichert...' : tUi(locale, 'Saving...'))
                : (locale === 'de' ? 'Passwort speichern' : tUi(locale, 'Save Password'))}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href={loginHref}
              className={`rounded-sm text-sm text-text-secondary transition-all hover:text-brand-primary ${FOCUS_RING}`}
            >
              {locale === 'de' ? '← Zurück zum Login' : tUi(locale, '← Back to Login')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
