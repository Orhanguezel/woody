'use client';

import * as React from 'react';
import { Eye, Heading2, Heading3, Link2, List, MessageCircleQuestion, Pencil, Pilcrow } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

const FAQ_SNIPPET =
  '<h2>Sıkça Sorulan Sorular</h2>\n<h3>Soru 1?</h3>\n<p>Cevap 1.</p>\n<h3>Soru 2?</h3>\n<p>Cevap 2.</p>\n';

const PREVIEW_PROSE = cn(
  'max-w-none text-sm leading-relaxed text-gm-text',
  '[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gm-text',
  '[&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:font-semibold [&_h3]:text-base [&_h3]:text-gm-text',
  '[&_p]:my-2.5 [&_p]:text-gm-muted',
  '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6',
  '[&_li]:my-1 [&_li]:text-gm-muted',
  '[&_a]:text-gm-gold [&_a]:underline [&_a]:underline-offset-2',
  '[&_strong]:font-semibold [&_strong]:text-gm-text',
);

export default function BlogContentEditor({ value, onChange, className }: Props) {
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = React.useState<'edit' | 'preview'>('edit');

  function surround(before: string, after: string, placeholder: string) {
    const ta = ref.current;
    const start = ta?.selectionStart ?? value.length;
    const end = ta?.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || placeholder;
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      const node = ref.current;
      if (!node) return;
      node.focus();
      const pos = start + before.length;
      node.setSelectionRange(pos, pos + selected.length);
    });
  }

  function insertBlock(snippet: string) {
    const ta = ref.current;
    const start = ta?.selectionStart ?? value.length;
    const prefix = start > 0 && value[start - 1] !== '\n' ? '\n' : '';
    const next = value.slice(0, start) + prefix + snippet + value.slice(start);
    onChange(next);
    requestAnimationFrame(() => ref.current?.focus());
  }

  const tools: { key: string; label: string; icon: React.ReactNode; run: () => void }[] = [
    { key: 'h2', label: 'H2', icon: <Heading2 className="size-3.5" />, run: () => surround('<h2>', '</h2>', 'Ara başlık') },
    { key: 'h3', label: 'H3', icon: <Heading3 className="size-3.5" />, run: () => surround('<h3>', '</h3>', 'Alt başlık') },
    { key: 'p', label: 'Paragraf', icon: <Pilcrow className="size-3.5" />, run: () => surround('<p>', '</p>', 'Paragraf metni') },
    { key: 'ul', label: 'Liste', icon: <List className="size-3.5" />, run: () => insertBlock('<ul>\n  <li>Madde</li>\n  <li>Madde</li>\n</ul>\n') },
    { key: 'a', label: 'Bağlantı', icon: <Link2 className="size-3.5" />, run: () => surround('<a href="/tr/">', '</a>', 'bağlantı metni') },
    { key: 'strong', label: 'Kalın', icon: <span className="text-[11px] font-black">B</span>, run: () => surround('<strong>', '</strong>', 'kalın metin') },
    { key: 'faq', label: 'SSS', icon: <MessageCircleQuestion className="size-3.5" />, run: () => insertBlock(FAQ_SNIPPET) },
  ];

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        {tools.map((tool) => (
          <Button
            key={tool.key}
            type="button"
            variant="outline"
            size="sm"
            disabled={mode === 'preview'}
            onClick={tool.run}
            className="h-8 gap-1.5 rounded-xl border-gm-border-soft bg-gm-surface/30 px-2.5 text-[11px] font-semibold text-gm-muted hover:text-gm-text disabled:opacity-40"
          >
            {tool.icon}
            <span className="hidden sm:inline">{tool.label}</span>
          </Button>
        ))}
        <div className="ml-auto inline-flex rounded-xl border border-gm-border-soft bg-gm-surface/30 p-0.5">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11px] font-bold tracking-wide uppercase transition-all',
              mode === 'edit' ? 'bg-gm-gold text-gm-bg shadow' : 'text-gm-muted hover:text-gm-text',
            )}
          >
            <Pencil className="size-3.5" />
            Düzenle
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11px] font-bold tracking-wide uppercase transition-all',
              mode === 'preview' ? 'bg-gm-gold text-gm-bg shadow' : 'text-gm-muted hover:text-gm-text',
            )}
          >
            <Eye className="size-3.5" />
            Önizleme
          </button>
        </div>
      </div>

      {mode === 'edit' ? (
        <Textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="min-h-[28rem] rounded-2xl border-gm-border-soft bg-gm-surface/40 font-mono text-[13px] leading-relaxed focus:ring-gm-gold/50"
        />
      ) : (
        <div className="min-h-[28rem] overflow-auto rounded-2xl border border-gm-border-soft bg-gm-surface/40 p-6">
          {value.trim() ? (
            <div className={PREVIEW_PROSE} dangerouslySetInnerHTML={{ __html: value }} />
          ) : (
            <p className="text-sm italic text-gm-muted/60">Önizlenecek içerik yok.</p>
          )}
        </div>
      )}
    </div>
  );
}
