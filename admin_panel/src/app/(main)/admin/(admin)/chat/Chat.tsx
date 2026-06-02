// =============================================================
// FILE: src/app/(main)/admin/(admin)/chat/Chat.tsx
// Admin Chat & AI Support — Threads + Messages + Knowledge
// orders standardi (gm-theme) sayfa kabugu
// =============================================================

'use client';

import { MessagesSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';

import ChatThreadsPanel from './components/ChatThreadsPanel';
import ChatKnowledgePanel from './components/ChatKnowledgePanel';
import ChatSettingsPanel from './components/ChatSettingsPanel';

export default function ChatAdminPage() {
  const t = useAdminT('admin.chat');

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">
              {t('header.badge', null, 'Sohbet & AI Destek')}
            </span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">{t('header.title')}</h1>
          <p className="text-gm-muted text-sm font-serif italic opacity-70">{t('header.description')}</p>
        </div>
        <div className="flex items-center justify-center size-14 rounded-full bg-gm-gold/10 border border-gm-gold/20 text-gm-gold shadow-inner">
          <MessagesSquare size={22} />
        </div>
      </div>

      <Tabs defaultValue="threads" className="w-full space-y-6">
        <TabsList className="bg-gm-surface/30 border border-gm-border-soft rounded-full p-1.5 h-auto">
          <TabsTrigger
            value="threads"
            className="rounded-full px-6 py-2 text-[11px] font-bold tracking-widest uppercase data-[state=active]:bg-gm-gold/15 data-[state=active]:text-gm-gold transition-all"
          >
            {t('tabs.threads')}
          </TabsTrigger>
          <TabsTrigger
            value="knowledge"
            className="rounded-full px-6 py-2 text-[11px] font-bold tracking-widest uppercase data-[state=active]:bg-gm-gold/15 data-[state=active]:text-gm-gold transition-all"
          >
            {t('tabs.knowledge')}
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-full px-6 py-2 text-[11px] font-bold tracking-widest uppercase data-[state=active]:bg-gm-gold/15 data-[state=active]:text-gm-gold transition-all"
          >
            {t('tabs.settings')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="threads" className="space-y-4">
          <ChatThreadsPanel />
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <ChatKnowledgePanel />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <ChatSettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
