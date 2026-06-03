// =============================================================
// FILE: src/app/(main)/admin/(admin)/db/_components/admin-db-client.tsx
// FINAL — App Router + shadcn standards
// ✅ Genel kabuk: woody orders/payment-settings standardı (gm-theme)
// ✅ No Bootstrap classes, no inline styles
// ✅ shadcn Card / UI components
// =============================================================
"use client";

import type React from "react";

import { Database, Lightbulb } from "lucide-react";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { FullDbHeader } from "../fullDb/full-db-header";
import { FullDbImportPanel } from "../fullDb/full-db-import-panel";
import { SnapshotsPanel } from "../fullDb/snapshots-panel";
import { ModuleTabs } from "../modules/module-tabs";
import { AdminDbAuthGate } from "./admin-db-auth-gate";

const SECTION_CARD = "bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl";
const SECTION_HEADER = "bg-gm-surface/40 p-8 border-b border-gm-border-soft";
const SECTION_TITLE = "font-serif text-2xl text-gm-text";

export const AdminDbClient: React.FC = () => {
  const t = useAdminT("admin.db");

  return (
    <AdminDbAuthGate>
      {({ adminSkip }) => (
        <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Header — gm-theme standardı */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-px bg-gm-gold" />
                <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">{t("title")}</span>
              </div>
              <h1 className="font-serif text-4xl text-gm-text flex items-center gap-3">
                <Database className="w-7 h-7 text-gm-gold" />
                {t("title")}
              </h1>
              <p className="text-gm-muted text-sm font-serif italic opacity-70">{t("description")}</p>
            </div>

            {/* Yardım Popover — gm-theme kutusunda */}
            <div className="flex items-center bg-gm-surface/20 px-6 py-4 rounded-[24px] border border-gm-border-soft backdrop-blur-sm shadow-lg">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-gm-border-soft hover:bg-gm-surface h-10 px-5 text-[10px] font-bold tracking-widest uppercase transition-all"
                  >
                    <Lightbulb className="mr-2 size-4 text-gm-gold" />
                    {t("help.pageTitle")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 bg-gm-surface border-gm-border-soft rounded-2xl">
                  <div className="space-y-3">
                    <p className="font-serif font-semibold text-sm text-gm-text">{t("help.dbAdmin")}</p>
                    <ul className="space-y-2 text-gm-muted text-sm">
                      <li>
                        <span className="font-medium text-gm-text">Full DB</span>: {t("help.fullDbDesc")}
                      </li>
                      <li>
                        <span className="font-medium text-gm-text">Snapshot</span>: {t("help.snapshotDesc")}
                      </li>
                      <li>
                        <span className="font-medium text-gm-text">Module Export/Import</span>: {t("help.moduleDesc")}
                      </li>
                      <li>
                        <span className="font-medium text-gm-text">UI (site_settings ui_*)</span>: {t("help.uiDesc")}
                      </li>
                    </ul>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Full DB Operations */}
          <Card className={SECTION_CARD}>
            <CardHeader className={SECTION_HEADER}>
              <CardTitle className={SECTION_TITLE}>Full DB</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <FullDbHeader />
              <FullDbImportPanel />
            </CardContent>
          </Card>

          {/* Snapshots */}
          <Card className={SECTION_CARD}>
            <CardHeader className={SECTION_HEADER}>
              <CardTitle className={SECTION_TITLE}>Snapshots</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <SnapshotsPanel adminSkip={adminSkip} />
            </CardContent>
          </Card>

          {/* Module Operations */}
          <Card className={SECTION_CARD}>
            <CardHeader className={SECTION_HEADER}>
              <CardTitle className={SECTION_TITLE}>Module Export / Import</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <ModuleTabs adminSkip={adminSkip} />
            </CardContent>
          </Card>
        </div>
      )}
    </AdminDbAuthGate>
  );
};
