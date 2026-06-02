'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Key, Loader2, Save } from 'lucide-react';

import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import { useAuthUpdateMutation } from '@/integrations/hooks';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PasswordForm() {
  const t = useAdminT();
  const [updateUser, { isLoading }] = useAuthUpdateMutation();

  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast.error(t('admin.profile.passwordRequired') || 'Yeni şifre gerekli.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t('admin.profile.passwordsDontMatch') || 'Şifreler uyuşmuyor.');
      return;
    }

    try {
      await updateUser({
        password,
      }).unwrap();

      setPassword('');
      setConfirmPassword('');
      toast.success(t('admin.profile.passwordUpdated') || 'Şifre başarıyla güncellendi.');
    } catch (err) {
      toast.error(t('admin.profile.passwordUpdateFailed') || 'Şifre güncellenemedi.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardHeader className="bg-gm-surface/40 p-6 border-b border-gm-border-soft">
          <CardTitle className="font-serif text-2xl text-gm-text">{t('admin.profile.security') || 'Güvenlik'}</CardTitle>
          <CardDescription className="text-gm-muted font-serif italic opacity-80">
            {t('admin.profile.securityDesc') || 'Hesap güvenliğiniz için şifrenizi güncelleyin.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="new-password" className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">{t('admin.profile.newPassword') || 'Yeni Şifre'}</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className="h-12 bg-gm-surface/40 border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 text-sm"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password" className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">{t('admin.profile.confirmPassword') || 'Şifreyi Onayla'}</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className="h-12 bg-gm-surface/40 border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 text-sm"
            />
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Button type="submit" disabled={isLoading} className="rounded-full px-8 h-12 font-bold tracking-widest uppercase text-[10px] w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('admin.common.saving') || 'Kaydediliyor...'}
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                {t('admin.profile.changePassword') || 'Şifre Değiştir'}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
