"use client";

import { Suspense } from "react";

import Image from "next/image";
import Link from "next/link";

import { BookOpenCheck, ShieldCheck, Sparkles } from "lucide-react";

import type { AdminBrandingConfig } from "@/config/app-config";
import { DEFAULT_BRANDING } from "@/config/app-config";
import { useLocaleContext } from "@/i18n";
import { FOCUS_RING } from "@/lib/a11y";
import { getAdminAppName } from "@/lib/admin-brand";

import { LoginForm } from "../_components/login-form";

function LoginFormFallback() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
    </div>
  );
}

export function LoginClient({ branding }: { branding: AdminBrandingConfig }) {
  const { t } = useLocaleContext();
  const b = { ...DEFAULT_BRANDING, ...branding };
  const leftHeading = (b.admin_login_heading || "").trim() || t("admin.auth.login.welcomeBack");
  const leftQuote = (b.admin_login_quote || "").trim() || t("admin.auth.login.heroTagline");
  const rawBgUrl = (b.admin_login_background_url || "").trim();
  const bgUrl =
    !rawBgUrl || rawBgUrl === "/img/admin_login_bg.png" ? DEFAULT_BRANDING.admin_login_background_url : rawBgUrl;
  const logoUrl = (b.logo_url || "").trim() || DEFAULT_BRANDING.logo_url;

  return (
    <div className="min-h-dvh bg-[#fff8e8] text-[#0b1f3a] lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
      <div className="relative hidden overflow-hidden bg-[#0b5cad] lg:block">
        <div
          className="absolute inset-0 bg-center bg-cover transition-transform duration-[10000ms] hover:scale-[1.04]"
          style={bgUrl ? { backgroundImage: `url("${bgUrl.replace(/"/g, "")}")` } : undefined}
          aria-hidden
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,31,58,0.72)_0%,rgba(11,92,173,0.30)_46%,rgba(255,248,232,0.05)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(0deg,rgba(11,31,58,0.82)_0%,rgba(11,31,58,0)_100%)]" />
        <div className="absolute top-8 right-8 rounded-full bg-[#f5c518] px-4 py-2 font-black text-[#0b1f3a] text-xs uppercase tracking-[0.18em] shadow-[0_14px_40px_rgba(245,197,24,0.32)]">
          Woody Admin
        </div>

        <div className="absolute right-10 bottom-10 left-10 z-10 max-w-2xl xl:bottom-14 xl:left-14">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-lg bg-[#ff6a00] text-white shadow-[0_12px_32px_rgba(255,106,0,0.36)]">
              <BookOpenCheck className="size-5" aria-hidden="true" />
            </span>
            <span className="rounded-lg border border-white/18 bg-white/12 px-4 py-2 font-bold text-white text-xs uppercase tracking-[0.18em] backdrop-blur">
              Preschool English
            </span>
          </div>
          <div className="max-w-xl">
            <h2 className="font-serif text-4xl text-white leading-tight xl:text-5xl">{leftHeading}</h2>
            <p className="mt-4 max-w-lg text-base text-white/82 leading-7 xl:text-lg">{leftQuote}</p>
          </div>
        </div>
      </div>

      <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden px-5 py-8 sm:px-8 lg:min-h-0">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,106,0,0.18),transparent_28%),radial-gradient(circle_at_84%_22%,rgba(33,150,243,0.16),transparent_30%),linear-gradient(180deg,#fffdf5_0%,#fff3cc_100%)]"
          aria-hidden
        />
        <div className="reveal relative w-full max-w-md space-y-8">
          <div className="space-y-5 text-center">
            <div className="mx-auto flex min-h-20 items-center justify-center">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={b.app_name}
                  width={256}
                  height={80}
                  className="h-auto max-h-20 w-auto max-w-64 object-contain"
                  priority
                />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-lg border border-[#ffd24b]/60 bg-white shadow-[0_18px_45px_rgba(255,106,0,0.16)]">
                  <ShieldCheck className="size-10 text-[#ff6a00]" aria-hidden="true" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="mx-auto flex w-fit items-center gap-2 rounded-lg border border-[#2196f3]/20 bg-[#2196f3]/8 px-3 py-1.5 font-black text-[#0b5cad] text-[10px] uppercase tracking-[0.16em]">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Woody and Friends
              </div>
              <h1 className="font-serif text-3xl text-[#0b1f3a] tracking-tight">{t("admin.auth.login.title")}</h1>
              <p className="text-[#555] text-sm leading-6">{t("admin.auth.login.description")}</p>
            </div>
          </div>

          <div className="space-y-6 rounded-lg border border-[#ffd24b]/45 bg-white/82 p-6 shadow-[0_26px_80px_rgba(11,31,58,0.14)] backdrop-blur sm:p-8">
            <Suspense fallback={<LoginFormFallback />}>
              <LoginForm />
            </Suspense>

            <div className="border-[#ffd24b]/55 border-t pt-4">
              <p className="text-center text-[#555] text-[10px] uppercase tracking-[0.18em]">
                {t("admin.auth.login.noAccess")}{" "}
                <Link
                  prefetch={false}
                  href="#"
                  className={`rounded-sm font-black text-[#ff6a00] transition-opacity hover:opacity-80 ${FOCUS_RING}`}
                  aria-label={t("admin.auth.login.contactAdmin")}
                >
                  {t("admin.auth.login.contactAdmin")}
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center font-mono text-[#0b5cad]/60 text-[10px]">
            {t("admin.auth.login.copyrightLine", {
              year: new Date().getFullYear(),
              app: getAdminAppName(),
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
