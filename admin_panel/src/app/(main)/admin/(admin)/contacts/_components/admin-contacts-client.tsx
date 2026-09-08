"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Inbox,
  Mail,
  RefreshCcw,
  Search,
  ShieldAlert,
  User,
} from "lucide-react";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useListContactsAdminQuery } from "@/integrations/hooks";
import type { ContactStatus } from "@/integrations/shared";
import { cn } from "@/lib/utils";

type StatusFilter = ContactStatus | "all";

const statusStyles: Record<ContactStatus, string> = {
  new: "border-gm-gold/20 bg-gm-gold/5 text-gm-gold",
  in_progress: "border-gm-warning/20 bg-gm-warning/5 text-gm-warning",
  closed: "border-gm-muted/20 bg-gm-muted/5 text-gm-muted",
};

const statusDotStyles: Record<ContactStatus, string> = {
  new: "bg-gm-gold",
  in_progress: "bg-gm-warning",
  closed: "bg-gm-muted",
};

export default function AdminContactsClient() {
  const t = useAdminT("contacts");
  const [search, setSearch] = React.useState("");
  const deferredSearch = React.useDeferredValue(search.trim());
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [onlyUnresolved, setOnlyUnresolved] = React.useState(false);

  const query = useListContactsAdminQuery({
    search: deferredSearch || undefined,
    status: status === "all" ? undefined : status,
    resolved: onlyUnresolved ? false : undefined,
    limit: 100,
    offset: 0,
    orderBy: "created_at",
    order: "desc",
  });
  const overviewQuery = useListContactsAdminQuery({
    limit: 100,
    offset: 0,
    orderBy: "created_at",
    order: "desc",
  });

  const rows = query.data?.data ?? [];
  const overview = overviewQuery.data?.data ?? [];
  const openCount = overview.filter((item) => item.status !== "closed" && !item.is_resolved).length;
  const closedCount = overview.filter((item) => item.status === "closed" || item.is_resolved).length;
  const busy = query.isFetching || overviewQuery.isFetching;

  const statusLabel = (value: ContactStatus) => {
    if (value === "in_progress") return t("status.inProgress");
    return t(`status.${value}`);
  };

  const refresh = () => {
    query.refetch();
    overviewQuery.refetch();
  };

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gm-gold" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gm-gold">
              İletişim &amp; CRM
            </span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">{t("header.title")}</h1>
          <p className="font-serif text-sm italic text-gm-muted opacity-70">{t("header.subtitle")}</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="group relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gm-muted/50 transition-colors group-focus-within:text-gm-gold" />
            <Input
              className="h-12 rounded-2xl border-gm-border-soft bg-gm-surface/40 pl-12 text-sm transition-all focus:ring-gm-gold/50"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("filters.searchPlaceholder")}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={busy}
            className="h-12 rounded-full border-gm-border-soft bg-gm-surface/50 px-8 text-[10px] font-bold uppercase tracking-widest shadow-lg backdrop-blur-sm transition-all hover:bg-gm-primary/5"
          >
            <RefreshCcw className={cn("mr-2 size-4", busy && "animate-spin")} />
            Yenile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <StatCard
          label="Toplam Mesaj"
          value={overviewQuery.data?.total ?? 0}
          icon={Inbox}
          iconClassName="text-gm-gold"
          hoverClassName="hover:border-gm-gold/20"
        />
        <StatCard
          label="Yanıt Bekleyen"
          value={openCount}
          icon={ShieldAlert}
          iconClassName="text-gm-error"
          valueClassName="text-gm-error"
          hoverClassName="hover:border-gm-error/20"
        />
        <StatCard
          label="Çözülen"
          value={closedCount}
          icon={CheckCircle2}
          iconClassName="text-gm-success"
          valueClassName="text-gm-success"
          hoverClassName="hover:border-gm-success/20"
        />
      </div>

      <Card className="overflow-hidden rounded-[32px] border-gm-border-soft bg-gm-surface/20 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col gap-4 border-b border-gm-border-soft bg-gm-surface/20 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="font-serif text-xl text-gm-text">Gelen Mesajlar</h2>
            <p className="mt-1 text-xs text-gm-muted">{query.data?.total ?? 0} kayıt gösteriliyor</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
              <SelectTrigger className="h-10 w-full rounded-full border-gm-border-soft bg-gm-surface/50 px-4 text-xs sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.statusAll")}</SelectItem>
                <SelectItem value="new">{t("filters.statusNew")}</SelectItem>
                <SelectItem value="in_progress">{t("filters.statusInProgress")}</SelectItem>
                <SelectItem value="closed">{t("filters.statusClosed")}</SelectItem>
              </SelectContent>
            </Select>
            <label
              htmlFor="contacts-only-unresolved"
              className="flex h-10 items-center gap-3 rounded-full border border-gm-border-soft bg-gm-surface/50 px-4 text-xs text-gm-text"
            >
              <Switch id="contacts-only-unresolved" checked={onlyUnresolved} onCheckedChange={setOnlyUnresolved} />
              {t("filters.onlyUnresolved")}
            </label>
          </div>
        </div>

        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader className="bg-gm-surface/40">
              <TableRow className="border-gm-border-soft hover:bg-transparent">
                <TableHead className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t("columns.status")}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">Gönderen</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t("columns.subject")}</TableHead>
                <TableHead className="py-6 text-center text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t("columns.createdAt")}</TableHead>
                <TableHead className="px-8 py-6 text-right text-[10px] font-bold uppercase tracking-widest text-gm-muted">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} className="border-gm-border-soft">
                    <TableCell className="px-8 py-6"><Skeleton className="h-8 w-24 rounded-full bg-gm-surface/20" /></TableCell>
                    <TableCell className="py-6"><Skeleton className="h-10 w-40 bg-gm-surface/20" /></TableCell>
                    <TableCell className="py-6"><Skeleton className="h-10 w-64 bg-gm-surface/20" /></TableCell>
                    <TableCell className="py-6"><Skeleton className="mx-auto h-6 w-32 bg-gm-surface/20" /></TableCell>
                    <TableCell className="px-8 py-6"><Skeleton className="ml-auto h-10 w-24 rounded-full bg-gm-surface/20" /></TableCell>
                  </TableRow>
                ))
              ) : query.isError ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-24 text-center text-sm text-destructive">{t("messages.loadError")}</TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-30">
                      <Inbox className="size-20 text-gm-gold/50" />
                      <span className="font-serif text-xl italic text-gm-muted">{t("list.empty")}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((item) => (
                  <TableRow
                    key={item.id}
                    className={cn(
                      "group border-gm-border-soft transition-colors hover:bg-gm-primary/[0.03]",
                      item.is_resolved && "opacity-60",
                    )}
                  >
                    <TableCell className="px-8 py-6">
                      <div className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em]", statusStyles[item.status])}>
                        <span className={cn("size-1.5 rounded-full", statusDotStyles[item.status], item.status === "in_progress" && "animate-pulse")} />
                        {statusLabel(item.status)}
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-gm-border-soft bg-gm-surface/50 text-gm-muted">
                          <User className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="max-w-48 truncate font-serif text-base text-gm-text">{item.name}</div>
                          <div className="mt-0.5 flex max-w-52 items-center gap-1 truncate text-[10px] text-gm-muted">
                            <Mail className="size-3 shrink-0" />
                            {item.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="max-w-md truncate font-serif text-lg text-gm-text transition-colors group-hover:text-gm-primary">
                        {item.subject || "İletişim mesajı"}
                      </div>
                      <div className="mt-1 max-w-md truncate font-serif text-sm italic leading-relaxed text-gm-muted opacity-60">
                        {item.message}
                      </div>
                    </TableCell>
                    <TableCell className="py-6 text-center">
                      <div className="flex items-center justify-center gap-2 font-mono text-[10px] text-gm-muted opacity-70">
                        <Calendar className="size-3 text-gm-gold/60" />
                        {format(new Date(item.created_at), "dd MMM yyyy, HH:mm", { locale: tr })}
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      <Button asChild size="sm" variant="ghost" className="h-10 rounded-full px-6 text-[10px] font-bold uppercase tracking-widest hover:bg-gm-gold/10 hover:text-gm-gold">
                        <Link href={`/admin/contacts/${item.id}`}>
                          Mesajı Aç
                          <ChevronRight className="ml-2 size-4" />
                        </Link>
                      </Button>
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

function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  valueClassName,
  hoverClassName,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  iconClassName: string;
  valueClassName?: string;
  hoverClassName: string;
}) {
  return (
    <Card className={cn("group relative overflow-hidden rounded-[32px] border-gm-border-soft bg-gm-bg-deep/40 p-8 shadow-xl backdrop-blur-md transition-all", hoverClassName)}>
      <div className="absolute -right-4 -top-4 p-8 opacity-5 transition-all duration-700 group-hover:scale-125 group-hover:opacity-10">
        <Icon size={100} className={iconClassName} />
      </div>
      <div className="relative z-10 space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gm-muted">{label}</p>
        <div className={cn("font-serif text-5xl text-gm-text", valueClassName)}>{value}</div>
      </div>
    </Card>
  );
}
