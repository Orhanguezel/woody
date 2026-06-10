'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  GraduationCap,
  LinkIcon,
  Mail,
  Phone,
  Save,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { SchoolRole, SchoolView } from '@/integrations/shared';
import {
  useAddSchoolUserAdminMutation,
  useCreateSchoolAdminMutation,
  useGrantSchoolContentAccessAdminMutation,
  useListDigitalAssetsAdminQuery,
  useListSchoolContentAccessAdminQuery,
  useListSchoolsAdminQuery,
  useListSchoolUsersAdminQuery,
  useRemoveSchoolUserAdminMutation,
  useRevokeSchoolContentAccessAdminMutation,
  useUpdateSchoolAdminMutation,
} from '@/integrations/hooks';

const ROLES: SchoolRole[] = ['owner', 'teacher', 'student'];

const INPUT_CLS =
  'bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm';
const LABEL_CLS = 'text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1';

type SchoolForm = {
  name: string;
  contact_email: string;
  contact_phone: string;
  city: string;
  is_active: boolean;
};

const EMPTY_SCHOOL: SchoolForm = {
  name: '',
  contact_email: '',
  contact_phone: '',
  city: '',
  is_active: true,
};

function apiErrorMessage(error: unknown) {
  const data = (error as { data?: { error?: { message?: string }; message?: string } })?.data;
  return data?.error?.message || data?.message || 'İşlem tamamlanamadı';
}

function schoolToForm(school: SchoolView): SchoolForm {
  return {
    name: school.name,
    contact_email: school.contact_email ?? '',
    contact_phone: school.contact_phone ?? '',
    city: school.city ?? '',
    is_active: school.is_active,
  };
}

function formatDate(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

export default function SchoolDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const isNew = id === 'new';

  const schoolsQ = useListSchoolsAdminQuery();
  const school = React.useMemo(
    () => (isNew ? null : (schoolsQ.data ?? []).find((s) => s.id === id) ?? null),
    [isNew, id, schoolsQ.data],
  );

  const [form, setForm] = React.useState<SchoolForm>(EMPTY_SCHOOL);
  const hydratedFor = React.useRef<string>('');

  React.useEffect(() => {
    if (isNew || !school) return;
    if (hydratedFor.current === school.id) return;
    hydratedFor.current = school.id;
    setForm(schoolToForm(school));
  }, [isNew, school]);

  const [createSchool, createState] = useCreateSchoolAdminMutation();
  const [updateSchool, updateState] = useUpdateSchoolAdminMutation();
  const saving = createState.isLoading || updateState.isLoading;

  async function save() {
    const name = form.name.trim();
    if (!name) {
      toast.error('Okul adı gerekli');
      return;
    }
    const body = {
      name,
      contact_email: form.contact_email.trim() || null,
      contact_phone: form.contact_phone.trim() || null,
      city: form.city.trim() || null,
      is_active: form.is_active ? 1 : 0,
    };
    try {
      if (isNew) {
        const created = await createSchool(body).unwrap();
        toast.success('Okul oluşturuldu');
        router.replace(`/admin/schools/${created.id}`);
      } else {
        await updateSchool({ id, body }).unwrap();
        toast.success('Okul güncellendi');
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  // Edit modunda okul bulunamadı
  if (!isNew && !schoolsQ.isLoading && !school) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/schools')}
          className="rounded-full hover:bg-gm-surface transition-all"
        >
          <ArrowLeft className="mr-2 size-4" />
          Okullar
        </Button>
        <Card className="bg-gm-error/5 border-gm-error/20 rounded-[32px] p-12 text-center">
          <h2 className="font-serif text-2xl text-gm-error mb-2">Okul bulunamadı</h2>
          <Button
            variant="outline"
            onClick={() => router.push('/admin/schools')}
            className="rounded-full border-gm-error/30 text-gm-error hover:bg-gm-error/10 transition-all"
          >
            Listeye dön
          </Button>
        </Card>
      </div>
    );
  }

  const loading = !isNew && schoolsQ.isLoading && !school;

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/schools')}
              className="rounded-full -ml-3 hover:bg-gm-surface group transition-all"
            >
              <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            </Button>
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">
              Woody School
            </span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-4xl text-gm-text">
              {isNew ? 'Yeni Okul' : school?.name || 'Okul'}
            </h1>
            {!isNew && school ? (
              <Badge
                className={cn(
                  'rounded-full px-4 py-1 text-[10px] font-bold tracking-widest uppercase border',
                  school.is_active
                    ? 'bg-gm-success/10 text-gm-success border-gm-success/20'
                    : 'bg-gm-error/10 text-gm-error border-gm-error/20',
                )}
              >
                {school.is_active ? 'Aktif' : 'Pasif'}
              </Badge>
            ) : null}
          </div>
          {!isNew && school ? (
            <p className="text-gm-muted text-sm font-serif italic opacity-70">ID: {school.id}</p>
          ) : (
            <p className="text-gm-muted text-sm font-serif italic opacity-70">
              Yeni bir okul hesabı oluşturun.
            </p>
          )}
        </div>
      </div>

      {/* Okul bilgileri */}
      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardHeader className="p-8 pb-4 bg-gm-surface/40 border-b border-gm-border-soft">
          <CardTitle className="font-serif text-2xl flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-gm-gold" />
            Okul Bilgileri
          </CardTitle>
          <CardDescription className="font-serif italic text-gm-muted opacity-70">
            Okul iletişim bilgileri ve durumu.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {loading ? (
            <Skeleton className="h-40 rounded-2xl bg-gm-surface/20" />
          ) : (
            <>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-3 md:col-span-2">
                  <Label htmlFor="school-name" className={LABEL_CLS}>
                    Okul adı
                  </Label>
                  <Input
                    id="school-name"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className={INPUT_CLS}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="school-email" className={LABEL_CLS}>
                    E-posta
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gm-muted/50" />
                    <Input
                      id="school-email"
                      value={form.contact_email}
                      onChange={(e) => setForm((p) => ({ ...p, contact_email: e.target.value }))}
                      className={cn(INPUT_CLS, 'pl-12 font-mono')}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="school-phone" className={LABEL_CLS}>
                    Telefon
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gm-muted/50" />
                    <Input
                      id="school-phone"
                      value={form.contact_phone}
                      onChange={(e) => setForm((p) => ({ ...p, contact_phone: e.target.value }))}
                      className={cn(INPUT_CLS, 'pl-12 font-mono')}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="school-city" className={LABEL_CLS}>
                    Şehir
                  </Label>
                  <Input
                    id="school-city"
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    className={INPUT_CLS}
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex h-12 w-full items-center justify-between px-6 bg-gm-surface/20 rounded-2xl border border-gm-border-soft">
                    <Label className="text-[10px] font-bold text-gm-muted tracking-widest uppercase cursor-pointer">
                      Aktif
                    </Label>
                    <Switch
                      checked={form.is_active}
                      onCheckedChange={(checked: boolean) =>
                        setForm((p) => ({ ...p, is_active: checked }))
                      }
                      className="data-[state=checked]:bg-gm-gold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => router.push('/admin/schools')}
                  className="rounded-full border-gm-border-soft px-8 h-12 hover:bg-gm-surface transition-all text-[10px] font-bold tracking-widest uppercase"
                >
                  İptal
                </Button>
                <Button
                  onClick={save}
                  disabled={saving}
                  className="rounded-full bg-gm-gold text-gm-bg hover:bg-gm-gold-dim px-10 h-12 font-bold tracking-widest uppercase text-[10px] shadow-lg shadow-gm-gold/20 transition-all active:scale-95"
                >
                  <Save className="mr-2 size-4" />
                  {isNew ? 'Oluştur' : 'Güncelle'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Kullanıcılar + İçerik Erişimi */}
      {!isNew && school ? <SchoolRelations schoolId={school.id} /> : null}
    </div>
  );
}

function SchoolRelations({ schoolId }: { schoolId: string }) {
  const usersQ = useListSchoolUsersAdminQuery({ schoolId });
  const accessQ = useListSchoolContentAccessAdminQuery({ schoolId });
  const assetsQ = useListDigitalAssetsAdminQuery();
  const assets = assetsQ.data ?? [];

  const [addUser, addUserState] = useAddSchoolUserAdminMutation();
  const [removeUser, removeUserState] = useRemoveSchoolUserAdminMutation();
  const [grantAccess, grantAccessState] = useGrantSchoolContentAccessAdminMutation();
  const [revokeAccess, revokeAccessState] = useRevokeSchoolContentAccessAdminMutation();

  const [userId, setUserId] = React.useState('');
  const [role, setRole] = React.useState<SchoolRole>('teacher');
  const [grantAssetId, setGrantAssetId] = React.useState('');

  const assignedAssetIds = new Set((accessQ.data ?? []).map((item) => item.digital_asset_id));
  const grantableAssets = assets.filter((asset) => !assignedAssetIds.has(asset.id));

  async function attachUser() {
    const trimmedUserId = userId.trim();
    if (!trimmedUserId) {
      toast.error('Kullanıcı ID gerekli');
      return;
    }
    try {
      await addUser({ schoolId, body: { user_id: trimmedUserId, role } }).unwrap();
      setUserId('');
      toast.success('Kullanıcı okula bağlandı');
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function detachUser(removedUserId: string) {
    try {
      await removeUser({ schoolId, userId: removedUserId }).unwrap();
      toast.success('Kullanıcı bağlantısı kaldırıldı');
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function grantSelectedAccess() {
    if (!grantAssetId) {
      toast.error('İçerik seçimi gerekli');
      return;
    }
    try {
      await grantAccess({ schoolId, digitalAssetId: grantAssetId }).unwrap();
      setGrantAssetId('');
      toast.success('İçerik erişimi verildi');
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function revokeSelectedAccess(digitalAssetId: string) {
    try {
      await revokeAccess({ schoolId, digitalAssetId }).unwrap();
      toast.success('İçerik erişimi kaldırıldı');
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  return (
    <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
      <CardHeader className="p-8 pb-4 bg-gm-surface/40 border-b border-gm-border-soft">
        <CardTitle className="font-serif text-2xl flex items-center gap-3">
          <Users className="h-5 w-5 text-gm-gold" />
          Kullanıcılar & İçerik Erişimi
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-gm-surface/40 rounded-2xl p-1">
            <TabsTrigger
              value="users"
              className="rounded-xl text-[10px] font-bold tracking-widest uppercase data-[state=active]:bg-gm-gold data-[state=active]:text-gm-bg"
            >
              Kullanıcılar
            </TabsTrigger>
            <TabsTrigger
              value="access"
              className="rounded-xl text-[10px] font-bold tracking-widest uppercase data-[state=active]:bg-gm-gold data-[state=active]:text-gm-bg"
            >
              İçerik Erişimi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-5">
            <div className="grid gap-3 md:grid-cols-[1fr_160px_auto]">
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Kullanıcı UUID"
                className={cn(INPUT_CLS, 'font-mono')}
              />
              <Select value={role} onValueChange={(v) => setRole(v as SchoolRole)}>
                <SelectTrigger className={INPUT_CLS}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                  {ROLES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={attachUser}
                disabled={addUserState.isLoading}
                className="rounded-full px-8 h-12 font-bold tracking-widest uppercase text-[10px]"
              >
                <UserPlus className="mr-2 size-4" />
                Ekle
              </Button>
            </div>

            <div className="rounded-2xl border border-gm-border-soft overflow-hidden">
              <Table>
                <TableHeader className="bg-gm-surface/40">
                  <TableRow className="border-gm-border-soft hover:bg-transparent">
                    <TableHead className="py-5 px-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                      Kullanıcı
                    </TableHead>
                    <TableHead className="py-5 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                      Rol
                    </TableHead>
                    <TableHead className="py-5 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                      Eklenme
                    </TableHead>
                    <TableHead className="py-5 px-6 w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersQ.isLoading ? (
                    <TableRow className="border-gm-border-soft">
                      <TableCell colSpan={4} className="py-5 px-6">
                        <Skeleton className="h-8 bg-gm-surface/20" />
                      </TableCell>
                    </TableRow>
                  ) : (usersQ.data ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-12 text-center text-gm-muted font-serif italic opacity-50">
                        Bu okula bağlı kullanıcı yok.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (usersQ.data ?? []).map((user) => (
                      <TableRow
                        key={user.id}
                        className="border-gm-border-soft hover:bg-gm-primary/[0.03] transition-colors group"
                      >
                        <TableCell className="py-5 px-6">
                          <div className="font-serif text-base text-gm-text">
                            {user.email ?? user.user_id}
                          </div>
                          {user.email ? (
                            <div className="text-[11px] text-gm-muted font-mono opacity-60">
                              {user.user_id}
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell className="py-5">
                          <Badge
                            variant="outline"
                            className="text-[9px] font-bold tracking-widest uppercase rounded border-gm-border-soft text-gm-muted"
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-5 text-xs text-gm-muted font-mono">
                          {formatDate(user.created_at)}
                        </TableCell>
                        <TableCell className="py-5 px-6 text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => detachUser(user.user_id)}
                            disabled={removeUserState.isLoading}
                            className="rounded-full opacity-30 group-hover:opacity-100 hover:bg-gm-error/10 hover:text-gm-error transition-all"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="access" className="space-y-5">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <Select value={grantAssetId} onValueChange={setGrantAssetId}>
                <SelectTrigger className={INPUT_CLS}>
                  <SelectValue placeholder="Dijital içerik seç" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-gm-border-soft rounded-2xl">
                  {grantableAssets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={grantSelectedAccess}
                disabled={grantAccessState.isLoading}
                className="rounded-full px-8 h-12 font-bold tracking-widest uppercase text-[10px]"
              >
                <CheckCircle2 className="mr-2 size-4" />
                Erişim Ver
              </Button>
            </div>

            <div className="rounded-2xl border border-gm-border-soft overflow-hidden">
              <Table>
                <TableHeader className="bg-gm-surface/40">
                  <TableRow className="border-gm-border-soft hover:bg-transparent">
                    <TableHead className="py-5 px-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                      İçerik
                    </TableHead>
                    <TableHead className="py-5 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                      Seviye
                    </TableHead>
                    <TableHead className="py-5 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                      Ürün
                    </TableHead>
                    <TableHead className="py-5 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
                      Verilme
                    </TableHead>
                    <TableHead className="py-5 px-6 w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessQ.isLoading ? (
                    <TableRow className="border-gm-border-soft">
                      <TableCell colSpan={5} className="py-5 px-6">
                        <Skeleton className="h-8 bg-gm-surface/20" />
                      </TableCell>
                    </TableRow>
                  ) : (accessQ.data ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center text-gm-muted font-serif italic opacity-50">
                        Bu okul için içerik erişimi yok.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (accessQ.data ?? []).map((access) => (
                      <TableRow
                        key={access.id}
                        className="border-gm-border-soft hover:bg-gm-primary/[0.03] transition-colors group"
                      >
                        <TableCell className="py-5 px-6">
                          <div className="flex items-center gap-2 font-serif text-base text-gm-text">
                            <FileText className="size-4 text-gm-gold" />
                            {access.title}
                          </div>
                          <div className="text-[11px] text-gm-muted font-mono opacity-60">
                            {access.asset_type}
                          </div>
                          {access.storage_url ? (
                            <a
                              href={access.storage_url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-flex items-center gap-1 text-gm-gold text-xs hover:underline"
                            >
                              <LinkIcon className="size-3" />
                              Dosyayı aç
                            </a>
                          ) : null}
                        </TableCell>
                        <TableCell className="py-5 text-sm text-gm-muted">{access.level ?? '-'}</TableCell>
                        <TableCell className="py-5 text-sm text-gm-muted">{access.product ?? '-'}</TableCell>
                        <TableCell className="py-5 text-xs text-gm-muted font-mono">
                          {formatDate(access.granted_at)}
                        </TableCell>
                        <TableCell className="py-5 px-6 text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => revokeSelectedAccess(access.digital_asset_id)}
                            disabled={revokeAccessState.isLoading}
                            className="rounded-full opacity-30 group-hover:opacity-100 hover:bg-gm-error/10 hover:text-gm-error transition-all"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
