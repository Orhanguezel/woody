'use client';

import * as React from 'react';
import {
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  LinkIcon,
  Plus,
  RefreshCcw,
  Save,
  School,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import type {
  DigitalAssetType,
  DigitalAssetView,
  SchoolLevel,
  SchoolRole,
  SchoolView,
  WoodyProduct,
} from '@/integrations/shared';
import {
  useAddSchoolUserAdminMutation,
  useCreateDigitalAssetAdminMutation,
  useCreateSchoolAdminMutation,
  useDeleteDigitalAssetAdminMutation,
  useDeleteSchoolAdminMutation,
  useGrantSchoolContentAccessAdminMutation,
  useListAssetsAdminQuery,
  useListDigitalAssetsAdminQuery,
  useListSchoolContentAccessAdminQuery,
  useListSchoolsAdminQuery,
  useListSchoolUsersAdminQuery,
  useRemoveSchoolUserAdminMutation,
  useRevokeSchoolContentAccessAdminMutation,
  useUpdateDigitalAssetAdminMutation,
  useUpdateSchoolAdminMutation,
} from '@/integrations/hooks';

const ASSET_TYPES: DigitalAssetType[] = ['pdf', 'video', 'audio', 'image', 'other'];
const LEVELS: SchoolLevel[] = ['basic', 'junior', 'senior'];
const PRODUCTS: WoodyProduct[] = ['storyland', 'movieland', 'musicland', 'library'];
const ROLES: SchoolRole[] = ['owner', 'teacher', 'student'];

type SchoolForm = {
  name: string;
  contact_email: string;
  contact_phone: string;
  city: string;
  is_active: boolean;
};

type AssetForm = {
  title: string;
  asset_type: DigitalAssetType;
  storage_asset_id: string;
  level: SchoolLevel | 'none';
  product: WoodyProduct | 'none';
  is_active: boolean;
};

const EMPTY_SCHOOL: SchoolForm = {
  name: '',
  contact_email: '',
  contact_phone: '',
  city: '',
  is_active: true,
};

const EMPTY_ASSET: AssetForm = {
  title: '',
  asset_type: 'pdf',
  storage_asset_id: '',
  level: 'none',
  product: 'none',
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

function assetToForm(asset: DigitalAssetView): AssetForm {
  return {
    title: asset.title,
    asset_type: asset.asset_type,
    storage_asset_id: asset.storage_asset_id ?? '',
    level: asset.level ?? 'none',
    product: asset.product ?? 'none',
    is_active: asset.is_active,
  };
}

function formatDate(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-md border px-2 py-0.5 text-[11px]',
        active ? 'border-primary/40 text-primary' : 'border-slate-300 text-slate-500',
      )}
    >
      {active ? 'Aktif' : 'Pasif'}
    </Badge>
  );
}

export default function AdminSchoolsClient() {
  const schoolsQ = useListSchoolsAdminQuery();
  const assetsQ = useListDigitalAssetsAdminQuery();
  const storageQ = useListAssetsAdminQuery({ limit: 100, sort: 'created_at', order: 'desc' });
  const schools = schoolsQ.data ?? [];
  const assets = assetsQ.data ?? [];
  const storageAssets = storageQ.data?.items ?? [];

  const [selectedSchoolId, setSelectedSchoolId] = React.useState('');
  const selectedSchool = schools.find((school) => school.id === selectedSchoolId) ?? null;

  const usersQ = useListSchoolUsersAdminQuery(
    { schoolId: selectedSchoolId },
    { skip: !selectedSchoolId },
  );
  const accessQ = useListSchoolContentAccessAdminQuery(
    { schoolId: selectedSchoolId },
    { skip: !selectedSchoolId },
  );

  const [schoolForm, setSchoolForm] = React.useState<SchoolForm>(EMPTY_SCHOOL);
  const [editingSchoolId, setEditingSchoolId] = React.useState('');
  const [assetForm, setAssetForm] = React.useState<AssetForm>(EMPTY_ASSET);
  const [editingAssetId, setEditingAssetId] = React.useState('');
  const [userId, setUserId] = React.useState('');
  const [role, setRole] = React.useState<SchoolRole>('teacher');
  const [grantAssetId, setGrantAssetId] = React.useState('');

  const [createSchool, createSchoolState] = useCreateSchoolAdminMutation();
  const [updateSchool, updateSchoolState] = useUpdateSchoolAdminMutation();
  const [deleteSchool, deleteSchoolState] = useDeleteSchoolAdminMutation();
  const [addUser, addUserState] = useAddSchoolUserAdminMutation();
  const [removeUser, removeUserState] = useRemoveSchoolUserAdminMutation();
  const [createAsset, createAssetState] = useCreateDigitalAssetAdminMutation();
  const [updateAsset, updateAssetState] = useUpdateDigitalAssetAdminMutation();
  const [deleteAsset, deleteAssetState] = useDeleteDigitalAssetAdminMutation();
  const [grantAccess, grantAccessState] = useGrantSchoolContentAccessAdminMutation();
  const [revokeAccess, revokeAccessState] = useRevokeSchoolContentAccessAdminMutation();

  React.useEffect(() => {
    if (!selectedSchoolId && schools[0]?.id) setSelectedSchoolId(schools[0].id);
  }, [schools, selectedSchoolId]);

  const assignedAssetIds = new Set((accessQ.data ?? []).map((item) => item.digital_asset_id));
  const grantableAssets = assets.filter((asset) => !assignedAssetIds.has(asset.id));
  const isSavingSchool = createSchoolState.isLoading || updateSchoolState.isLoading;
  const isSavingAsset = createAssetState.isLoading || updateAssetState.isLoading;

  function resetSchoolForm() {
    setEditingSchoolId('');
    setSchoolForm(EMPTY_SCHOOL);
  }

  function resetAssetForm() {
    setEditingAssetId('');
    setAssetForm(EMPTY_ASSET);
  }

  async function saveSchool() {
    const name = schoolForm.name.trim();
    if (!name) {
      toast.error('Okul adı gerekli');
      return;
    }

    const body = {
      name,
      contact_email: schoolForm.contact_email.trim() || null,
      contact_phone: schoolForm.contact_phone.trim() || null,
      city: schoolForm.city.trim() || null,
      is_active: schoolForm.is_active ? 1 : 0,
    };

    try {
      if (editingSchoolId) {
        await updateSchool({ id: editingSchoolId, body }).unwrap();
        toast.success('Okul güncellendi');
      } else {
        const created = await createSchool(body).unwrap();
        setSelectedSchoolId(created.id);
        toast.success('Okul oluşturuldu');
      }
      resetSchoolForm();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function removeSchool(id: string) {
    try {
      await deleteSchool({ id }).unwrap();
      if (selectedSchoolId === id) setSelectedSchoolId('');
      if (editingSchoolId === id) resetSchoolForm();
      toast.success('Okul silindi');
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function attachUser() {
    const trimmedUserId = userId.trim();
    if (!selectedSchoolId || !trimmedUserId) {
      toast.error('Okul ve kullanıcı ID gerekli');
      return;
    }

    try {
      await addUser({ schoolId: selectedSchoolId, body: { user_id: trimmedUserId, role } }).unwrap();
      setUserId('');
      toast.success('Kullanıcı okula bağlandı');
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function detachUser(removedUserId: string) {
    if (!selectedSchoolId) return;
    try {
      await removeUser({ schoolId: selectedSchoolId, userId: removedUserId }).unwrap();
      toast.success('Kullanıcı bağlantısı kaldırıldı');
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function saveAsset() {
    const title = assetForm.title.trim();
    if (!title) {
      toast.error('İçerik başlığı gerekli');
      return;
    }

    const body = {
      title,
      asset_type: assetForm.asset_type,
      storage_asset_id: assetForm.storage_asset_id.trim() || null,
      level: assetForm.level === 'none' ? null : assetForm.level,
      product: assetForm.product === 'none' ? null : assetForm.product,
      is_active: assetForm.is_active ? 1 : 0,
    };

    try {
      if (editingAssetId) {
        await updateAsset({ id: editingAssetId, body }).unwrap();
        toast.success('Dijital içerik güncellendi');
      } else {
        await createAsset(body).unwrap();
        toast.success('Dijital içerik oluşturuldu');
      }
      resetAssetForm();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function removeAsset(id: string) {
    try {
      await deleteAsset({ id }).unwrap();
      if (editingAssetId === id) resetAssetForm();
      toast.success('Dijital içerik silindi');
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function grantSelectedAccess() {
    if (!selectedSchoolId || !grantAssetId) {
      toast.error('Okul ve içerik seçimi gerekli');
      return;
    }

    try {
      await grantAccess({ schoolId: selectedSchoolId, digitalAssetId: grantAssetId }).unwrap();
      setGrantAssetId('');
      toast.success('İçerik erişimi verildi');
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function revokeSelectedAccess(digitalAssetId: string) {
    if (!selectedSchoolId) return;
    try {
      await revokeAccess({ schoolId: selectedSchoolId, digitalAssetId }).unwrap();
      toast.success('İçerik erişimi kaldırıldı');
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-semibold text-muted-foreground text-xs uppercase">
            <School className="size-4 text-sky-600" />
            Woody School
          </div>
          <h1 className="font-semibold text-3xl text-foreground tracking-normal">Okullar</h1>
          <p className="max-w-2xl text-muted-foreground text-sm">
            Okul hesapları, kullanıcı bağlantıları ve dijital içerik erişimleri.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            schoolsQ.refetch();
            assetsQ.refetch();
            storageQ.refetch();
            if (selectedSchoolId) {
              usersQ.refetch();
              accessQ.refetch();
            }
          }}
          disabled={schoolsQ.isFetching || assetsQ.isFetching || storageQ.isFetching}
        >
          <RefreshCcw
            className={cn(
              'mr-2 size-4',
              (schoolsQ.isFetching || assetsQ.isFetching || storageQ.isFetching) && 'animate-spin',
            )}
          />
          Yenile
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(340px,420px)_1fr]">
        <Card className="rounded-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="size-5 text-sky-600" />
              Okul Kaydı
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="school-name">Okul adı</Label>
                <Input
                  id="school-name"
                  value={schoolForm.name}
                  onChange={(event) =>
                    setSchoolForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="school-email">E-posta</Label>
                  <Input
                    id="school-email"
                    value={schoolForm.contact_email}
                    onChange={(event) =>
                      setSchoolForm((prev) => ({ ...prev, contact_email: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-phone">Telefon</Label>
                  <Input
                    id="school-phone"
                    value={schoolForm.contact_phone}
                    onChange={(event) =>
                      setSchoolForm((prev) => ({ ...prev, contact_phone: event.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="space-y-2">
                  <Label htmlFor="school-city">Şehir</Label>
                  <Input
                    id="school-city"
                    value={schoolForm.city}
                    onChange={(event) =>
                      setSchoolForm((prev) => ({ ...prev, city: event.target.value }))
                    }
                  />
                </div>
                <div className="flex h-10 items-center gap-3">
                  <Switch
                    checked={schoolForm.is_active}
                    onCheckedChange={(checked: boolean) =>
                      setSchoolForm((prev) => ({ ...prev, is_active: checked }))
                    }
                  />
                  <Label>Aktif</Label>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={saveSchool} disabled={isSavingSchool}>
                <Save className="mr-2 size-4" />
                {editingSchoolId ? 'Güncelle' : 'Oluştur'}
              </Button>
              {editingSchoolId ? (
                <Button variant="ghost" onClick={resetSchoolForm}>
                  Yeni kayıt
                </Button>
              ) : null}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-muted-foreground text-sm">Okul listesi</h2>
                <Badge variant="secondary">{schools.length}</Badge>
              </div>
              <div className="space-y-2">
                {schoolsQ.isLoading ? (
                  ['school-skeleton-1', 'school-skeleton-2', 'school-skeleton-3', 'school-skeleton-4'].map((key) => (
                    <Skeleton key={key} className="h-16 rounded-lg" />
                  ))
                ) : schools.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground text-sm">
                    Henüz okul yok.
                  </div>
                ) : (
                  schools.map((school) => (
                    <button
                      key={school.id}
                      type="button"
                      onClick={() => setSelectedSchoolId(school.id)}
                      className={cn(
                        'w-full rounded-lg border p-4 text-left transition hover:bg-muted/50',
                        selectedSchoolId === school.id ? 'border-sky-500 bg-sky-50/50' : 'border-border',
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-medium">{school.name}</div>
                          <div className="mt-1 text-muted-foreground text-xs">
                            {[school.city, school.contact_email].filter(Boolean).join(' · ') || '-'}
                          </div>
                        </div>
                        <ActiveBadge active={school.is_active} />
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={(event) => {
                            event.stopPropagation();
                            setEditingSchoolId(school.id);
                            setSchoolForm(schoolToForm(school));
                          }}
                        >
                          Düzenle
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeSchool(school.id);
                          }}
                          disabled={deleteSchoolState.isLoading}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="size-5 text-orange-600" />
              {selectedSchool?.name ?? 'Okul seçimi'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSchool ? (
              <Tabs defaultValue="users" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
                  <TabsTrigger value="access">İçerik Erişimi</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-5">
                  <div className="grid gap-3 md:grid-cols-[1fr_160px_auto]">
                    <Input
                      value={userId}
                      onChange={(event) => setUserId(event.target.value)}
                      placeholder="Kullanıcı UUID"
                    />
                    <Select value={role} onValueChange={(value) => setRole(value as SchoolRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={attachUser} disabled={addUserState.isLoading}>
                      <UserPlus className="mr-2 size-4" />
                      Ekle
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kullanıcı</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Eklenme</TableHead>
                        <TableHead className="w-12" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersQ.isLoading ? (
                        <TableRow>
                          <TableCell colSpan={4}>
                            <Skeleton className="h-10" />
                          </TableCell>
                        </TableRow>
                      ) : (usersQ.data ?? []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="py-8 text-center text-muted-foreground text-sm">
                            Bu okula bağlı kullanıcı yok.
                          </TableCell>
                        </TableRow>
                      ) : (
                        (usersQ.data ?? []).map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="font-medium">{user.email ?? user.user_id}</div>
                              {user.email ? (
                                <div className="text-muted-foreground text-xs">{user.user_id}</div>
                              ) : null}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{user.role}</Badge>
                            </TableCell>
                            <TableCell>{formatDate(user.created_at)}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => detachUser(user.user_id)}
                                disabled={removeUserState.isLoading}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="access" className="space-y-5">
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <Select value={grantAssetId} onValueChange={setGrantAssetId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Dijital içerik seç" />
                      </SelectTrigger>
                      <SelectContent>
                        {grantableAssets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={grantSelectedAccess} disabled={grantAccessState.isLoading}>
                      <CheckCircle2 className="mr-2 size-4" />
                      Erişim Ver
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>İçerik</TableHead>
                        <TableHead>Seviye</TableHead>
                        <TableHead>Ürün</TableHead>
                        <TableHead>Verilme</TableHead>
                        <TableHead className="w-12" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accessQ.isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5}>
                            <Skeleton className="h-10" />
                          </TableCell>
                        </TableRow>
                      ) : (accessQ.data ?? []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="py-8 text-center text-muted-foreground text-sm">
                            Bu okul için içerik erişimi yok.
                          </TableCell>
                        </TableRow>
                      ) : (
                        (accessQ.data ?? []).map((access) => (
                          <TableRow key={access.id}>
                            <TableCell>
                              <div className="flex items-center gap-2 font-medium">
                                <FileText className="size-4 text-sky-600" />
                                {access.title}
                              </div>
                              <div className="text-muted-foreground text-xs">{access.asset_type}</div>
                              {access.storage_url ? (
                                <a
                                  href={access.storage_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-1 inline-flex items-center gap-1 text-sky-700 text-xs hover:underline"
                                >
                                  <LinkIcon className="size-3" />
                                  Dosyayı aç
                                </a>
                              ) : null}
                            </TableCell>
                            <TableCell>{access.level ?? '-'}</TableCell>
                            <TableCell>{access.product ?? '-'}</TableCell>
                            <TableCell>{formatDate(access.granted_at)}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => revokeSelectedAccess(access.digital_asset_id)}
                                disabled={revokeAccessState.isLoading}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground text-sm">
                Kullanıcı ve içerik atamak için önce bir okul seç.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="size-5 text-amber-600" />
            Dijital İçerikler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_160px_160px_160px_minmax(220px,1fr)_auto]">
            <Input
              value={assetForm.title}
              onChange={(event) => setAssetForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Başlık"
            />
            <Select
              value={assetForm.asset_type}
              onValueChange={(value) =>
                setAssetForm((prev) => ({ ...prev, asset_type: value as DigitalAssetType }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSET_TYPES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={assetForm.level}
              onValueChange={(value) =>
                setAssetForm((prev) => ({ ...prev, level: value as SchoolLevel | 'none' }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Seviye yok</SelectItem>
                {LEVELS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={assetForm.product}
              onValueChange={(value) =>
                setAssetForm((prev) => ({ ...prev, product: value as WoodyProduct | 'none' }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ürün yok</SelectItem>
                {PRODUCTS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={assetForm.storage_asset_id || 'none'}
              onValueChange={(value) =>
                setAssetForm((prev) => ({
                  ...prev,
                  storage_asset_id: value === 'none' ? '' : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Storage dosyası seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Dosya yok</SelectItem>
                {storageAssets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.name || asset.path || asset.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch
                checked={assetForm.is_active}
                onCheckedChange={(checked: boolean) =>
                  setAssetForm((prev) => ({ ...prev, is_active: checked }))
                }
              />
              <Label>Aktif</Label>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={saveAsset} disabled={isSavingAsset}>
              <Plus className="mr-2 size-4" />
              {editingAssetId ? 'Güncelle' : 'İçerik Ekle'}
            </Button>
            {editingAssetId ? (
              <Button variant="ghost" onClick={resetAssetForm}>
                Yeni içerik
              </Button>
            ) : null}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Başlık</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Seviye</TableHead>
                <TableHead>Ürün</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Güncelleme</TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {assetsQ.isLoading ? (
                ['asset-skeleton-1', 'asset-skeleton-2', 'asset-skeleton-3'].map((key) => (
                  <TableRow key={key}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-10" />
                    </TableCell>
                  </TableRow>
                ))
              ) : assets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground text-sm">
                    Henüz dijital içerik yok.
                  </TableCell>
                </TableRow>
              ) : (
                assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <div className="font-medium">{asset.title}</div>
                      <div className="text-muted-foreground text-xs">
                        {asset.storage_name || asset.storage_path || asset.storage_asset_id || '-'}
                      </div>
                      {asset.storage_url ? (
                        <a
                          href={asset.storage_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-sky-700 text-xs hover:underline"
                        >
                          <LinkIcon className="size-3" />
                          Dosyayı aç
                        </a>
                      ) : null}
                    </TableCell>
                    <TableCell>{asset.asset_type}</TableCell>
                    <TableCell>{asset.level ?? '-'}</TableCell>
                    <TableCell>{asset.product ?? '-'}</TableCell>
                    <TableCell>
                      <ActiveBadge active={asset.is_active} />
                    </TableCell>
                    <TableCell>{formatDate(asset.updated_at ?? asset.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingAssetId(asset.id);
                            setAssetForm(assetToForm(asset));
                          }}
                        >
                          Düzenle
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeAsset(asset.id)}
                          disabled={deleteAssetState.isLoading}
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
