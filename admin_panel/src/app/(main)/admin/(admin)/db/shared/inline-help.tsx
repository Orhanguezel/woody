// =============================================================
// FILE: src/components/admin/db/shared/InlineHelp.tsx
// =============================================================
"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";

export type InlineHelpProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export const InlineHelp: React.FC<InlineHelpProps> = ({ title = "Açıklama", children, className }) => {
  const t = useAdminT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement | null>(null);

  const close = () => setOpen(false);
  const toggle = () => setOpen((v) => !v);

  useEffect(() => {
    if (!open) return;

    const onDocMouseDown = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      const root = rootRef.current;
      if (root?.contains(t)) return;
      close();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("mousedown", onDocMouseDown, true);
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("mousedown", onDocMouseDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, close]);

  return (
    <span ref={rootRef} className={`inline-block ${className ?? ""}`}>
      <button
        type="button"
        className="inline-flex items-center ml-1 p-0 text-gm-muted hover:text-gm-gold transition-colors"
        title={title}
        onClick={toggle}
      >
        <span
          className="inline-flex justify-center items-center rounded-full border border-gm-border-soft text-gm-muted"
          style={{ width: 18, height: 18, fontSize: 12, userSelect: "none" }}
        >
          ?
        </span>
      </button>

      {open ? (
        <div className="mt-2">
          <div className="rounded-2xl border border-gm-border-soft bg-gm-surface backdrop-blur-sm shadow-xl px-3 py-2">
            <div className="flex justify-between gap-2 items-start">
              <div className="font-semibold text-xs text-gm-text">{title}</div>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-gm-border-soft text-gm-muted hover:bg-gm-surface/40 hover:text-gm-text"
                onClick={close}
                aria-label={t("admin.db.help.closeButton")}
                title={t("admin.db.help.closeButton")}
                style={{ padding: "0px 6px", lineHeight: 1.2 }}
              >
                ×
              </button>
            </div>

            <div className="text-xs mt-1 text-gm-muted">{children}</div>

            <div className="mt-2 text-gm-muted" style={{ fontSize: 11 }}>
              {t("admin.db.help.closeHint")}
            </div>
          </div>
        </div>
      ) : null}
    </span>
  );
};
