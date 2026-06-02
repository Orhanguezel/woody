// =============================================================
// FILE: src/app/(main)/admin/(admin)/chat/components/ChatThreadsPanel.tsx
// Chat Threads list + inline message panel — gm standart kabuk
// =============================================================

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bot, Send, User, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import {
  useListChatThreadsAdminQuery,
  useListChatMessagesAdminQuery,
  usePostChatMessageAdminMutation,
  useTakeOverChatThreadAdminMutation,
  useReleaseToAiChatThreadAdminMutation,
  useSetAiProviderChatThreadAdminMutation,
  useGetMyProfileQuery,
} from '@/integrations/hooks';
import type {
  ChatThread,
  ChatHandoffMode,
  ChatAiProvider,
  ChatListThreadsParams,
} from '@/integrations/shared';

const CARD = 'bg-gm-surface/20 border-gm-border-soft rounded-[28px] backdrop-blur-sm shadow-xl';
const FIELD = 'bg-gm-surface/40 border-gm-border-soft rounded-2xl text-xs';

function toLocalDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString();
}

function ModePill({ admin, children }: { admin: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] border',
        admin ? 'bg-gm-gold/10 text-gm-gold border-gm-gold/20' : 'bg-gm-surface/40 text-gm-muted border-gm-border-soft'
      )}
    >
      {children}
    </span>
  );
}

// ─── Thread list ────────────────────────────────────────────

function ThreadItem({
  thread,
  isActive,
  onClick,
}: {
  thread: ChatThread;
  isActive: boolean;
  onClick: () => void;
}) {
  const t = useAdminT('admin.chat');

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-2xl border p-3 transition-colors',
        isActive
          ? 'border-gm-gold/40 bg-gm-gold/5'
          : 'border-gm-border-soft hover:border-gm-gold/30 hover:bg-gm-surface/40'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono font-medium truncate text-gm-text">
          {thread.context_type}/{thread.context_id?.slice(0, 8)}
        </span>
        <ModePill admin={thread.handoff_mode === 'admin'}>
          {thread.handoff_mode === 'admin' ? t('threads.modeAdmin') : t('threads.modeAi')}
        </ModePill>
      </div>
      <p className="text-[11px] text-gm-muted opacity-70 mt-1">{toLocalDate(thread.updated_at)}</p>
    </button>
  );
}

// ─── Message panel ──────────────────────────────────────────

function MessagePanel({ thread }: { thread: ChatThread }) {
  const t = useAdminT('admin.chat');
  const { data: myProfile } = useGetMyProfileQuery();
  const [tabVisible, setTabVisible] = React.useState(true);
  const AI_ASSISTANT_USER_ID = '00000000-0000-0000-0000-00000000a11f';

  React.useEffect(() => {
    const handler = () => setTabVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  const { data, isFetching, refetch } = useListChatMessagesAdminQuery(
    { threadId: thread.id },
    { pollingInterval: tabVisible ? 10000 : 0 },
  );
  const [postMsg, { isLoading: sending }] = usePostChatMessageAdminMutation();
  const [takeover] = useTakeOverChatThreadAdminMutation();
  const [releaseToAi] = useReleaseToAiChatThreadAdminMutation();
  const [setProvider] = useSetAiProviderChatThreadAdminMutation();

  const [text, setText] = React.useState('');
  const bottomRef = React.useRef<HTMLDivElement>(null);

  const messages = data?.items ?? [];

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      await postMsg({
        threadId: thread.id,
        body: { text: trimmed, client_id: crypto.randomUUID() },
      }).unwrap();
      setText('');
    } catch {
      toast.error(t('messages.sendError'));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTakeover = async () => {
    try {
      await takeover({ threadId: thread.id }).unwrap();
      toast.success(t('threads.takeoverSuccess'));
    } catch {
      toast.error(t('threads.takeoverError'));
    }
  };

  const handleRelease = async () => {
    try {
      await releaseToAi({ threadId: thread.id }).unwrap();
      toast.success(t('threads.releaseSuccess'));
    } catch {
      toast.error(t('threads.releaseError'));
    }
  };

  const handleProviderChange = async (provider: string) => {
    try {
      await setProvider({
        threadId: thread.id,
        body: { provider: provider as ChatAiProvider },
      }).unwrap();
      toast.success(t('threads.providerChanged'));
    } catch {
      toast.error(t('threads.providerError'));
    }
  };

  return (
    <Card className={cn(CARD, 'flex flex-col h-full')}>
      {/* Header with actions */}
      <CardHeader className="pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono text-gm-text">
            {thread.context_type}/{thread.context_id?.slice(0, 8)}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isFetching} className="rounded-full hover:bg-gm-gold/10 hover:text-gm-gold">
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {thread.handoff_mode === 'ai' ? (
            <Button size="sm" variant="outline" onClick={handleTakeover} className="rounded-full border-gm-border-soft text-[10px] font-bold uppercase tracking-widest">
              {t('threads.takeover')}
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={handleRelease} className="rounded-full border-gm-border-soft text-[10px] font-bold uppercase tracking-widest">
              {t('threads.releaseToAi')}
            </Button>
          )}

          <Select value={thread.ai_provider_preference} onValueChange={handleProviderChange}>
            <SelectTrigger className={cn(FIELD, 'w-[130px] h-8')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
              <SelectItem value="grok">Grok</SelectItem>
            </SelectContent>
          </Select>

          <ModePill admin={thread.handoff_mode === 'admin'}>
            {thread.handoff_mode === 'admin' ? t('threads.modeAdmin') : t('threads.modeAi')}
          </ModePill>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 flex flex-col min-h-0 pt-0">
        <ScrollArea className="flex-1 pr-3 mb-3" style={{ maxHeight: 'calc(100vh - 420px)' }}>
          <div className="space-y-2">
            {messages.length === 0 ? (
              <p className="text-sm text-gm-muted italic font-serif text-center py-8 opacity-60">
                {t('messages.noMessages')}
              </p>
            ) : (
              messages.map((msg) => {
                const isAi = msg.sender_user_id === AI_ASSISTANT_USER_ID;
                const isMine = !!myProfile?.id && msg.sender_user_id === myProfile.id;
                const isLeft = isAi || !isMine;
                return (
                  <div key={msg.id} className={cn('flex gap-2', !isLeft && 'justify-end')}>
                    {isLeft && (
                      <div className="shrink-0 mt-1">
                        {isAi ? <Bot className="h-4 w-4 text-gm-gold" /> : <User className="h-4 w-4 text-gm-muted" />}
                      </div>
                    )}
                    <div
                      className={cn(
                        'rounded-2xl px-3 py-2 text-sm max-w-[80%] border',
                        isLeft
                          ? 'bg-gm-surface/50 text-gm-text border-gm-border-soft'
                          : 'bg-gm-gold/15 text-gm-text border-gm-gold/20'
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      <p className="text-[10px] opacity-50 mt-1 font-mono">{toLocalDate(msg.created_at)}</p>
                    </div>
                    {!isLeft && (
                      <div className="shrink-0 mt-1">
                        <User className="h-4 w-4 text-gm-muted" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('messages.placeholder')}
            disabled={sending}
            className="bg-gm-surface/40 border-gm-border-soft rounded-2xl h-11 focus:ring-gm-gold/50 text-sm"
          />
          <Button size="icon" onClick={handleSend} disabled={sending || !text.trim()} className="rounded-full size-11 shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main ───────────────────────────────────────────────────

export default function ChatThreadsPanel() {
  const t = useAdminT('admin.chat');

  const [handoffFilter, setHandoffFilter] = React.useState<ChatHandoffMode | 'all'>('all');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [tabVisible, setTabVisible] = React.useState(true);

  React.useEffect(() => {
    const handler = () => setTabVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  const params: ChatListThreadsParams = React.useMemo(() => {
    const p: ChatListThreadsParams = { limit: 50 };
    if (handoffFilter !== 'all') p.handoff_mode = handoffFilter;
    return p;
  }, [handoffFilter]);

  const { data, isFetching, refetch } = useListChatThreadsAdminQuery(params, {
    pollingInterval: tabVisible ? 15000 : 0,
  });

  const threads = data?.items ?? [];
  const selected = threads.find((th) => th.id === selectedId) ?? null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4" style={{ minHeight: '60vh' }}>
      {/* Left — Thread list */}
      <Card className={cn(CARD, 'flex flex-col')}>
        <CardHeader className="pb-3 space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[11px] font-bold tracking-[0.2em] uppercase text-gm-gold">{t('threads.title')}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isFetching} className="rounded-full hover:bg-gm-gold/10 hover:text-gm-gold">
              <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            </Button>
          </div>

          <Select value={handoffFilter} onValueChange={(v) => setHandoffFilter(v as ChatHandoffMode | 'all')}>
            <SelectTrigger className={cn(FIELD, 'h-9')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
              <SelectItem value="all">{t('threads.filterAll')}</SelectItem>
              <SelectItem value="ai">{t('threads.filterAi')}</SelectItem>
              <SelectItem value="admin">{t('threads.filterAdmin')}</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto">
          {threads.length === 0 ? (
            <p className="text-sm text-gm-muted italic font-serif text-center py-8 opacity-60">
              {t('threads.noThreads')}
            </p>
          ) : (
            <div className="space-y-2">
              {threads.map((thread) => (
                <ThreadItem
                  key={thread.id}
                  thread={thread}
                  isActive={thread.id === selectedId}
                  onClick={() => setSelectedId(thread.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right — Messages */}
      {selected ? (
        <MessagePanel thread={selected} />
      ) : (
        <Card className={cn(CARD, 'flex items-center justify-center')}>
          <p className="text-sm text-gm-muted italic font-serif opacity-60">{t('threads.selectThread')}</p>
        </Card>
      )}
    </div>
  );
}
