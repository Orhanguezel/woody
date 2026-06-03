"use client";

import type React from "react";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLazyValidateModuleManifestQuery } from "@/integrations/hooks";

export type ModuleValidatePanelProps = {
  module: string;
  disabled: boolean;
};

export const ModuleValidatePanel: React.FC<ModuleValidatePanelProps> = ({ module, disabled }) => {
  const t = useAdminT("admin.db.modules.validate");
  const [trigger, { data, isLoading, isFetching }] = useLazyValidateModuleManifestQuery();

  const busy = isLoading || isFetching;

  const handleRun = () => {
    if (!disabled) trigger({ module: [module], includeDbTables: true });
  };

  const res = data?.results?.[0];
  const ok = res?.ok;

  return (
    <Card className="bg-gm-surface/30 border-gm-border-soft rounded-[20px] shadow-none">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="space-y-1">
            <div className="font-serif text-gm-text font-semibold text-sm">{t("title")}</div>
            <div className="text-gm-muted text-xs">{t("description")}</div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRun}
            disabled={disabled || busy}
            className="h-8 shrink-0 text-xs rounded-full"
          >
            {busy && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            {busy ? t("checking") : t("checkButton")}
          </Button>
        </div>

        <div className="mt-2">
          {!data ? (
            <div className="text-gm-muted text-xs italic">{t("noResult")}</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge
                  variant={ok ? "outline" : "destructive"}
                  className={ok ? "h-6 border-gm-success/30 bg-gm-success/10 text-gm-success" : "h-6"}
                >
                  {ok ? (
                    <>
                      <CheckCircle2 className="mr-1 size-3" />
                      {t("statusOk")}
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mr-1 size-3" />
                      {t("statusError")}
                    </>
                  )}
                </Badge>
                <span className="text-xs">
                  {t("module")}{" "}
                  <code className="rounded bg-gm-bg-deep px-1.5 py-0.5 font-mono text-[11px]">{module}</code>
                </span>
              </div>

              {/* Missing tables */}
              {!!res?.tables?.missing?.length && (
                <div className="space-y-2 rounded-md border border-gm-error/20 bg-gm-error/10 p-3 text-gm-error">
                  <div className="flex items-center gap-2 font-semibold text-xs">
                    <AlertCircle className="size-3.5" />
                    {t("errors")}
                  </div>
                  <ul className="ml-5 list-disc space-y-1 text-[11px]">
                    {res.tables.missing.map((tbl: string) => (
                      <li key={tbl}>
                        <code className="font-mono">{tbl}</code>
                        {res.suggestions?.[tbl]?.length ? (
                          <span className="ml-2 text-gm-muted">(did you mean: {res.suggestions[tbl].join(", ")}?)</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Present tables */}
              {!!res?.tables?.present?.length && (
                <div className="space-y-2 rounded-md border border-gm-success/30 bg-gm-success/10 p-3 text-gm-success">
                  <div className="flex items-center gap-2 font-semibold text-xs">
                    <CheckCircle2 className="size-3.5" />
                    Mevcut tablolar ({res.tables.present.length})
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {res.tables.present.map((tbl: string) => (
                      <code key={tbl} className="rounded bg-gm-success/10 px-1.5 py-0.5 font-mono text-[11px]">
                        {tbl}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-gm-border-soft pt-2 text-[11px] text-gm-muted">
                <div>
                  {t("declaredTables")} <strong className="text-gm-text">{res?.tables?.expected?.length ?? 0}</strong>
                </div>
                <div>
                  Mevcut: <strong className="text-gm-text">{res?.tables?.present?.length ?? 0}</strong>
                </div>
                <div>
                  Eksik: <strong className="text-gm-text">{res?.tables?.missing?.length ?? 0}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
