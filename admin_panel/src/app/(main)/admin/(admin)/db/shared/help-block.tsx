// =============================================================
// FILE: src/components/admin/db/shared/HelpBlock.tsx
// =============================================================
"use client";

import type React from "react";

export type HelpBlockProps = {
  headline?: string;
  children: React.ReactNode;
};

export const HelpBlock: React.FC<HelpBlockProps> = ({ headline, children }) => {
  return (
    <div>
      {headline ? <div className="font-semibold text-xs mb-1 text-gm-text">{headline}</div> : null}
      <div className="text-xs text-gm-muted">{children}</div>
    </div>
  );
};
