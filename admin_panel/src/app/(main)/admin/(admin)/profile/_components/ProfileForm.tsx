'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Camera, Loader2, Save } from 'lucide-react';

import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import { useStatusQuery, useAuthUpdateMutation } from '@/integrations/hooks';
import { useGetMyProfileQuery, useUpsertMyProfileMutation } from '@/integrations/hooks';
import { useCreateAssetAdminMutation } from '@/integrations/endpoints/admin/storage_admin.endpoints';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

export function ProfileForm() {
  const t = useAdminT();
  const { data: statusData } = useStatusQuery();
  const { data: profileData, isLoading: isProfileLoading } = useGetMyProfileQuery();
  const [upsertProfile, { isLoading: isUpdatingProfile }] = useUpsertMyProfileMutation();
  const [updateAuthUser, { isLoading: isUpdatingAuth }] = useAuthUpdateMutation();
  const [createAsset, { isLoading: isUploading }] = useCreateAssetAdminMutation();

  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState('');

  React.useEffect(() => {
    if (profileData) {
      setFullName(profileData.full_name || '');
      setAvatarUrl(profileData.avatar_url || '');
    }
  }, [profileData]);

  React.useEffect(() => {
    if (statusData?.user) {
      setEmail(statusData.user.email || '');
    }
  }, [statusData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const asset = await createAsset({
        file,
        bucket: 'avatars',
        folder: 'profiles',
      }).unwrap();

      if (asset.url) {
        setAvatarUrl(asset.url);
        toast.success(t('admin.profile.avatarUploaded') || 'Profil resmi yüklendi.');
      }
    } catch (err) {
      toast.error(t('admin.profile.avatarUploadFailed') || 'Resim yüklenemedi.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. Update Profile (Full Name, Avatar)
      await upsertProfile({
        profile: {
          full_name: fullName,
          avatar_url: avatarUrl,
        }
      }).unwrap();

      // 2. Update Auth User (Email)
      if (email !== statusData?.user?.email) {
        await updateAuthUser({
          email,
        }).unwrap();
      }

      toast.success(t('admin.profile.updated') || 'Profil başarıyla güncellendi.');
    } catch (err) {
      toast.error(t('admin.profile.updateFailed') || 'Profil güncellenemedi.');
    }
  };

  const isAnyLoading = isProfileLoading || isUpdatingProfile || isUpdatingAuth || isUploading;

  return (
    <form onSubmit={handleSubmit}>
      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardHeader className="bg-gm-surface/40 p-6 border-b border-gm-border-soft">
          <CardTitle className="font-serif text-2xl text-gm-text">{t('admin.profile.personalInfo') || 'Kişisel Bilgiler'}</CardTitle>
          <CardDescription className="text-gm-muted font-serif italic opacity-80">
            {t('admin.profile.personalInfoDesc') || 'Adınız, e-posta adresiniz ve profil resminiz.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative group">
              <Avatar className="h-20 w-20 border-2 border-gm-gold/30">
                <AvatarImage src={avatarUrl || undefined} alt={fullName} />
                <AvatarFallback className="text-xl">{getInitials(fullName || email || 'A')}</AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
              >
                {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
              </label>
              <input 
                id="avatar-upload" 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
                disabled={isAnyLoading}
              />
            </div>
            <div className="flex-1 space-y-1 text-center sm:text-left">
              <h4 className="font-serif text-lg text-gm-text">{fullName || email || 'Admin'}</h4>
              <p className="text-sm text-gm-muted opacity-70">
                {avatarUrl ? (t('admin.profile.avatarSet') || 'Özel profil resmi ayarlandı') : (t('admin.profile.noAvatar') || 'Varsayılan avatar kullanılıyor')}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name" className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">{t('admin.profile.name') || 'Tam Ad'}</Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                disabled={isAnyLoading}
                className="h-12 bg-gm-surface/40 border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">{t('admin.profile.email') || 'E-posta'}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                disabled={isAnyLoading}
                className="h-12 bg-gm-surface/40 border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 text-sm"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Button type="submit" disabled={isAnyLoading} className="rounded-full px-8 h-12 font-bold tracking-widest uppercase text-[10px] w-full sm:w-auto">
            {isUpdatingProfile || isUpdatingAuth ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('admin.common.saving') || 'Kaydediliyor...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t('admin.common.save') || 'Kaydet'}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
