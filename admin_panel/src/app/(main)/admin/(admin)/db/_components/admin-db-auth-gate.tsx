// =============================================================
// FILE: src/app/(main)/admin/(admin)/db/_components/admin-db-auth-gate.tsx
// =============================================================
"use client";

import type React from "react";
import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { Loader2 } from "lucide-react";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";
import { Card, CardContent } from "@/components/ui/card";
import { useStatusQuery } from "@/integrations/hooks";

export type AdminDbAuthGateProps = {
  children: (ctx: { authed: boolean; adminSkip: boolean }) => React.ReactNode;
};

export const AdminDbAuthGate: React.FC<AdminDbAuthGateProps> = ({ children }) => {
  const router = useRouter();
  const t = useAdminT("admin.db");

  const { data: statusData, isLoading: statusLoading, isError: statusError } = useStatusQuery();

  const authed = !!statusData?.authenticated;

  // status bitmeden VEYA authed değilken admin endpoint'leri skip edilecek
  const adminSkip = statusLoading || !authed;

  useEffect(() => {
    if (statusLoading) return;
    if (statusError || !authed) router.push("/login");
  }, [statusLoading, statusError, authed, router]);

  // Loading state
  if (statusLoading || !statusData) {
    return (
      <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center py-12">
            <Loader2 className="mb-4 size-8 animate-spin text-gm-gold" />
            <p className="animate-pulse font-serif italic text-sm text-gm-muted">{t("auth.loading")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not authenticated — redirect handled by useEffect, render nothing
  if (!authed) return null;

  return <>{children({ authed, adminSkip })}</>;
};
