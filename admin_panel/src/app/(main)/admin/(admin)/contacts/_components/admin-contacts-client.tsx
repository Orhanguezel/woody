"use client";

import * as React from "react";

import Link from "next/link";

import { Eye, Inbox, Loader2, RefreshCcw, Search } from "lucide-react";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useListContactsAdminQuery } from "@/integrations/hooks";
import type { ContactStatus } from "@/integrations/shared";

type StatusFilter = ContactStatus | "all";

function formatDate(value: string | Date) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("tr-TR");
}

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
  const rows = query.data?.data ?? [];

  const statusLabel = (value: ContactStatus) => {
    if (value === "in_progress") return t("status.inProgress");
    return t(`status.${value}`);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-bold text-2xl text-gm-text tracking-tight">{t("header.title")}</h1>
          <p className="text-gm-muted text-sm">{t("header.subtitle")}</p>
        </div>
        <Button variant="outline" onClick={() => query.refetch()} disabled={query.isFetching}>
          {query.isFetching ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="mr-2 h-4 w-4" />
          )}
          Yenile
        </Button>
      </div>

      <Card className="border-gm-border-soft bg-gm-surface shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("filters.title")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1fr_220px_auto] lg:items-center">
          <div className="relative">
            <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-4 w-4 text-gm-muted" />
            <Input
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("filters.searchPlaceholder")}
            />
          </div>
          <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.statusAll")}</SelectItem>
              <SelectItem value="new">{t("filters.statusNew")}</SelectItem>
              <SelectItem value="in_progress">{t("filters.statusInProgress")}</SelectItem>
              <SelectItem value="closed">{t("filters.statusClosed")}</SelectItem>
            </SelectContent>
          </Select>
          <label htmlFor="contacts-only-unresolved" className="flex items-center gap-3 text-gm-text text-sm">
            <Switch id="contacts-only-unresolved" checked={onlyUnresolved} onCheckedChange={setOnlyUnresolved} />
            {t("filters.onlyUnresolved")}
          </label>
        </CardContent>
      </Card>

      <Card className="border-gm-border-soft bg-gm-surface shadow-sm">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">{t("list.title")}</CardTitle>
          <Badge variant="outline">{query.data?.total ?? 0}</Badge>
        </CardHeader>
        <CardContent className="p-0">
          {query.isError ? (
            <div className="p-8 text-center text-destructive text-sm">{t("messages.loadError")}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.name")}</TableHead>
                  <TableHead>{t("columns.subject")}</TableHead>
                  <TableHead>{t("columns.status")}</TableHead>
                  <TableHead>{t("columns.createdAt")}</TableHead>
                  <TableHead className="text-right">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : rows.length ? (
                  rows.map((item) => (
                    <TableRow key={item.id} className={item.is_resolved ? "opacity-70" : undefined}>
                      <TableCell className="font-medium">
                        {item.name}
                        <div className="text-gm-muted text-xs">{item.email}</div>
                      </TableCell>
                      <TableCell className="max-w-[360px] truncate">{item.subject || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{statusLabel(item.status)}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(item.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/contacts/${item.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Aç
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-gm-muted">
                      <Inbox className="mx-auto mb-3 h-8 w-8" />
                      {t("list.empty")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
