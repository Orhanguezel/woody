// =============================================================
// FILE: src/components/admin/db/shared/HelpHint.tsx
// =============================================================
"use client";

import type React from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";

export type HelpHintProps = {
  /** Kısa tooltip / title */
  title?: string;

  /** Açılınca gösterilecek içerik */
  children: React.ReactNode;

  /** Popover hizası */
  align?: "start" | "end";

  /** İkon türü */
  icon?: "bulb" | "question";

  /** Varsayılan açık mı? */
  defaultOpen?: boolean;

  /** Ek class */
  className?: string;

  /** Popover genişliği (px) */
  minWidth?: number;
  maxWidth?: number;
};

export const HelpHint: React.FC<HelpHintProps> = ({
  title = "Açıklama",
  children,
  align = "start",
  icon = "question",
  defaultOpen = false,
  className = "",
  minWidth = 280,
  maxWidth = 420,
}) => {
  const t = useAdminT();
  const reactId = useId();
  const collapseId = useMemo(() => `help_${reactId.replace(/[:]/g, "_")}`, [reactId]);

  const [open, setOpen] = useState(defaultOpen);

  const rootRef = useRef<HTMLSpanElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const glyph = icon === "bulb" ? "i" : "?";

  // Close helpers
  const close = () => setOpen(false);
  const toggle = () => setOpen((v) => !v);

  // Click-outside + ESC
  useEffect(() => {
    if (!open) return;

    const onDocMouseDown = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!t) return;

      const root = rootRef.current;
      const pop = popoverRef.current;

      // tıklama root veya popover içindeyse kapatma
      if (root?.contains(t)) return;
      if (pop?.contains(t)) return;

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
    <span
      ref={rootRef}
      className={`inline-flex relative items-center ${className}`}
      style={{ verticalAlign: "middle" }}
    >
      <button
        type="button"
        className="inline-flex items-center ml-1 p-0 text-gm-muted hover:text-gm-gold transition-colors"
        aria-expanded={open}
        aria-controls={collapseId}
        title={title}
        onClick={toggle}
        style={{ lineHeight: 1 }}
      >
        <span
          className="inline-flex justify-center items-center rounded-full border border-gm-border-soft text-gm-muted"
          style={{
            width: 18,
            height: 18,
            fontSize: 12,
            userSelect: "none",
          }}
        >
          {glyph}
        </span>
      </button>

      {open ? (
        <div
          id={collapseId}
          ref={popoverRef}
          className="absolute"
          style={{
            zIndex: 1050,
            top: "100%",
            marginTop: 6,
            minWidth,
            maxWidth,
            ...(align === "end" ? { right: 0 } : { left: 0 }),
          }}
          role="dialog"
          aria-label={title}
        >
          <div className="rounded-2xl border border-gm-border-soft bg-gm-surface backdrop-blur-sm shadow-xl">
            <div className="px-3 py-2">
              <div className="flex justify-between mb-1 gap-2 items-start">
                <div className="font-semibold text-xs text-gm-text">{title}</div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-gm-border-soft text-gm-muted hover:bg-gm-surface/40 hover:text-gm-text"
                  onClick={close}
                  aria-label={t("admin.db.help.closeButton")}
                  title={t("admin.db.help.closeButton")}
                  style={{
                    padding: "0px 6px",
                    lineHeight: 1.2,
                  }}
                >
                  ×
                </button>
              </div>

              <div
                className="text-xs text-gm-muted"
                style={{
                  maxHeight: 220,
                  overflow: "auto",
                }}
              >
                {children}
              </div>

              <div className="mt-2 text-gm-muted" style={{ fontSize: 11 }}>
                {t("admin.db.help.closeHint")}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </span>
  );
};
