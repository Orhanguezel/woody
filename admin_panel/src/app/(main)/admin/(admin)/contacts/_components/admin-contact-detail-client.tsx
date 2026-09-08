"use client";

import { LeadFollowupCard } from '@/components/leads/LeadFollowupCard';
import * as React from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useDeleteContactAdminMutation,
  useGetContactAdminQuery,
  useUpdateContactAdminMutation,
} from "@/integrations/hooks";
import type { ContactStatus } from "@/integrations/shared";

function formatDate(value: string | Date) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("tr-TR");
}

function errorMessage(error: unknown) {
  const data = (error as { data?: { error?: { message?: string }; message?: string } })?.data;
  return data?.error?.message || data?.message || "İşlem tamamlanamadı";
}

export default function AdminContactDetailClient({ id }: { id: string }) {
  const t = useAdminT("contacts");
  const router = useRouter();
  const query = useGetContactAdminQuery(id);
  const [update, updateState] = useUpdateContactAdminMutation();
  const [remove, removeState] = useDeleteContactAdminMutation();
  const [status, setStatus] = React.useState<ContactStatus>("new");
  const [resolved, setResolved] = React.useState(false);
  const [adminNote, setAdminNote] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  React.useEffect(() => {
    if (!query.data) return;
    setStatus(query.data.status);
    setResolved(query.data.is_resolved);
    setAdminNote(query.data.admin_note ?? "");
  }, [query.data]);

  async function save() {
    try {
      await update({ id, patch: { status, is_resolved: resolved, admin_note: adminNote } }).unwrap();
      toast.success(t("messages.saved"));
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  async function deleteMessage() {
    try {
      await remove(id).unwrap();
      toast.success(t("messages.deleted"));
      router.replace("/admin/contacts");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  const item = query.data;
  if (query.isLoading)
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  if (!item)
    return (
      <Card>
        <CardContent className="py-12 text-center text-gm-muted">Kayıt bulunamadı</CardContent>
      </Card>
    );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Button asChild variant="ghost" className="-ml-3 mb-2">
            <Link href="/admin/contacts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Link>
          </Button>
          <h1 className="font-bold text-2xl text-gm-text tracking-tight">{t("details.title")}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{item.status}</Badge>
          {item.is_resolved ? <Badge>Çözüldü</Badge> : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card className="border-gm-border-soft bg-gm-surface shadow-sm">
          <CardHeader>
            <CardTitle>{item.subject || "İletişim mesajı"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                [t("details.name"), item.name],
                [t("details.email"), item.email],
                [t("details.phone"), item.phone || "-"],
                [t("details.createdAt"), formatDate(item.created_at)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-gm-border-soft p-3">
                  <div className="text-gm-muted text-xs">{label}</div>
                  <div className="mt-1 break-words font-medium text-sm">{value}</div>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-gm-border-soft p-4">
              <div className="mb-2 text-gm-muted text-xs">{t("details.message")}</div>
              <p className="whitespace-pre-wrap text-sm leading-6">{item.message}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gm-border-soft bg-gm-surface shadow-sm">
          <CardHeader>
            <CardTitle>{t("editDialog.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="contact-status">{t("editDialog.statusLabel")}</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as ContactStatus)}>
                <SelectTrigger id="contact-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">{t("status.new")}</SelectItem>
                  <SelectItem value="in_progress">{t("status.inProgress")}</SelectItem>
                  <SelectItem value="closed">{t("status.closed")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label
              htmlFor="contact-resolved"
              className="flex items-center justify-between gap-4 rounded-lg border border-gm-border-soft p-3 text-sm"
            >
              <span>{t("editDialog.resolvedLabel")}</span>
              <Switch id="contact-resolved" checked={resolved} onCheckedChange={setResolved} />
            </label>
            <div className="space-y-2">
              <Label htmlFor="contact-admin-note">{t("editDialog.adminNoteLabel")}</Label>
              <Textarea
                id="contact-admin-note"
                className="min-h-36"
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                placeholder={t("editDialog.adminNotePlaceholder")}
              />
            </div>
            <Button className="w-full" onClick={save} disabled={updateState.isLoading}>
              {updateState.isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Kaydet
            </Button>
            <Button
              className="w-full"
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
              disabled={removeState.isLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Sil
            </Button>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>İletişim mesajı silinsin mi?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. {item.name} kişisine ait mesaj kalıcı olarak silinecek.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction onClick={deleteMessage} className="bg-destructive text-white hover:bg-destructive/90">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {item ? <LeadFollowupCard key={id} kind="contact" id={id} /> : null}
    </div>
  );
}
