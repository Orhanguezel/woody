'use client';

import * as React from 'react';
import { 
  Bot, Plus, RefreshCcw, 
  Trash2, Pencil, Search,
  Globe, Cpu, Zap, Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  useListLlmPromptsQuery,
  useUpdateLlmPromptMutation,
  useDeleteLlmPromptMutation,
} from '@/integrations/hooks';

export default function LlmPromptsClient() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const query = useListLlmPromptsQuery({ search: searchTerm });
  const [update] = useUpdateLlmPromptMutation();
  const [remove] = useDeleteLlmPromptMutation();

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await update({ id, body: { is_active: !current } }).unwrap();
      toast.success('Prompt status updated.');
    } catch {
      toast.error('Update failed.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt configuration?')) return;
    try {
      await remove(id).unwrap();
      toast.success('Prompt deleted.');
    } catch {
      toast.error('Delete failed.');
    }
  };

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header — gm-theme standardı */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">Yapay Zeka</span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text flex items-center gap-3">
            <Bot className="w-7 h-7 text-gm-gold" />
            LLM Prompts
          </h1>
          <p className="text-gm-muted text-sm font-serif italic opacity-70">
            Manage AI model configurations, prompts, and hyper-parameters.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-gm-surface/20 px-6 py-4 rounded-[24px] border border-gm-border-soft backdrop-blur-sm shadow-lg">
          <Button
            variant="outline"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
            className="rounded-full border-gm-border-soft px-6 h-12 hover:bg-gm-surface transition-all font-bold tracking-widest uppercase text-[10px]"
          >
            <RefreshCcw className={`mr-2 size-4${query.isFetching ? ' animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            asChild
            className="rounded-full bg-gm-gold text-gm-bg hover:bg-gm-gold-light h-12 px-6 font-bold tracking-widest uppercase text-[10px] shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all"
          >
            <Link href="/admin/llm-prompts/new">
              <Plus className="mr-2 size-4" />
              New Prompt
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search by key or content..." 
            className="pl-9 border-gm-border-soft"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gm-surface-high/50">
              <TableRow className="border-gm-border-soft hover:bg-transparent">
                <TableHead className="w-12">Active</TableHead>
                <TableHead>Key / Locale</TableHead>
                <TableHead>Model / Provider</TableHead>
                <TableHead>Parameters</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center">Loading...</TableCell>
                </TableRow>
              ) : query.data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No prompt configurations found.</TableCell>
                </TableRow>
              ) : (
                query.data?.items.map((item) => (
                  <TableRow key={item.id} className="border-gm-border-soft hover:bg-gm-surface-high/30 transition-colors">
                    <TableCell>
                      <Switch 
                        checked={item.is_active} 
                        onCheckedChange={() => handleToggleActive(item.id, item.is_active)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="font-bold text-gm-text flex items-center gap-2">
                          {item.key}
                          <Badge variant="outline" className="text-[10px] uppercase border-gm-primary/30 text-gm-primary">
                            {item.locale}
                          </Badge>
                        </div>
                        <div className="text-xs text-gm-muted truncate max-w-[200px]">
                          {item.notes || 'No notes provided'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium text-gm-text flex items-center gap-1.5">
                          <Cpu className="size-3 text-gm-info" />
                          {item.model}
                        </div>
                        <Badge variant="secondary" className="w-fit text-[10px] bg-gm-bg-deep text-gm-text-dim border-gm-border-soft uppercase">
                          {item.provider}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1 text-xs text-gm-text-dim">
                          <Zap className="size-3 text-gm-gold" />
                          <span>T: {item.temperature}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gm-text-dim">
                          <Activity className="size-3 text-gm-success" />
                          <span>M: {item.max_tokens}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gm-text-dim">
                      {format(new Date(item.updated_at), 'dd MMM yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button asChild size="icon" variant="ghost" className="hover:bg-gm-primary/10 hover:text-gm-primary">
                          <Link href={`/admin/llm-prompts/${item.id}`}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="text-gm-error hover:bg-gm-error/10 hover:text-gm-error"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
