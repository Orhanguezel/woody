// =============================================================
// (root) grubunun ROOT LAYOUT'u (2026-08-30 lang refactor).
// Yalniz locale'siz rotalar icin: kok "/" (proxy zaten /tr'ye 308'ler) ve
// eslesmeyen yollarin global not-found'u. Varsayilan dil tr.
// =============================================================
import '../globals.css';
import type { Metadata, Viewport } from 'next';

import { RootHtmlShell, buildRootMetadata, buildRootViewport } from '../root-shell';

export async function generateViewport(): Promise<Viewport> {
  return buildRootViewport();
}

export async function generateMetadata(): Promise<Metadata> {
  return buildRootMetadata();
}

export default function RootGroupLayout({ children }: { children: React.ReactNode }) {
  return <RootHtmlShell lang="tr">{children}</RootHtmlShell>;
}
