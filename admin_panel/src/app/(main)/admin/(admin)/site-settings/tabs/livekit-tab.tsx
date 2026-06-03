"use client";

import * as React from "react";

import { RadioTower, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGetLiveKitAdminStatusQuery,
  useGetSiteSettingAdminByKeyQuery,
  useUpdateSiteSettingAdminMutation,
} from "@/integrations/hooks";
import { toBool } from "@/integrations/shared";

function StatusBadge({ ok }: { ok: boolean }) {
  return ok ? (
    <Badge className="bg-gm-gold text-gm-bg border-transparent">Aktif</Badge>
  ) : (
    <Badge className="bg-gm-error/15 text-gm-error border-gm-error/30">Eksik</Badge>
  );
}

export function LiveKitTab() {
  const { data, isLoading, isFetching, refetch } = useGetLiveKitAdminStatusQuery();
  const {
    data: featureSetting,
    isLoading: isFeatureLoading,
    isFetching: isFeatureFetching,
    refetch: refetchFeature,
  } = useGetSiteSettingAdminByKeyQuery("feature_video_enabled");
  const [updateFeatureSetting, { isLoading: isSavingFeature }] = useUpdateSiteSettingAdminMutation();

  const [featureVideoEnabled, setFeatureVideoEnabled] = React.useState<boolean>(false);
  const [featureVideoDraft, setFeatureVideoDraft] = React.useState<boolean>(false);
  const [featureChanged, setFeatureChanged] = React.useState<boolean>(false);

  const featureBusy = isFeatureLoading || isFeatureFetching || isSavingFeature;
  const busy = isLoading || isFetching;

  React.useEffect(() => {
    const parsed = toBool(featureSetting?.value, false);
    setFeatureVideoEnabled(parsed);
    setFeatureVideoDraft(parsed);
    setFeatureChanged(false);
  }, [featureSetting?.value]);

  const saveFeatureEnabled = async () => {
    try {
      await updateFeatureSetting({
        key: "feature_video_enabled",
        value: featureVideoDraft,
        locale: "*",
      }).unwrap();

      setFeatureVideoEnabled(featureVideoDraft);
      setFeatureChanged(false);
      toast.success("Video görüşme flagi güncellendi.");
      await refetchFeature();
    } catch {
      toast.error("Video görüşme flagi kaydedilemedi.");
      setFeatureVideoDraft(featureVideoEnabled);
      setFeatureChanged(false);
    }
  };

  const handleFeatureToggle = (checked: boolean | "indeterminate") => {
    const next = checked === "indeterminate" ? !featureVideoDraft : checked;
    setFeatureVideoDraft(next);
    setFeatureChanged(next !== featureVideoEnabled);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardHeader className="bg-gm-surface/40 p-8 border-b border-gm-border-soft flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle className="font-serif text-2xl text-gm-text flex items-center gap-2">
              <RadioTower className="size-4 text-gm-gold" />
              LiveKit Durumu
            </CardTitle>
            <CardDescription className="text-gm-muted font-serif italic opacity-80">
              LiveKit değerleri backend .env dosyasından okunur. Secret alanlar admin panelde sadece maskeleme ve
              yapılandırma durumu olarak gösterilir.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={busy}
            className="rounded-full border-gm-border-soft hover:bg-gm-surface/40 hover:text-gm-text text-[10px] font-bold tracking-widest uppercase"
          >
            <RefreshCcw className="mr-2 size-4" />
            Yenile
          </Button>
        </CardHeader>
        <CardContent className="p-8 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge ok={Boolean(data?.configured)} />
            <Badge className="border-gm-gold/30 bg-gm-gold/5 text-gm-gold">
              Aktif oda: {data?.active_rooms === null || data?.active_rooms === undefined ? "-" : data.active_rooms}
            </Badge>
            {data?.rooms_error ? (
              <Badge className="bg-gm-error/15 text-gm-error border-gm-error/30">Room API hata</Badge>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block">
                LIVEKIT_URL
              </Label>
              <Input
                className="h-12 bg-gm-bg-deep border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 focus:border-gm-gold/50 text-sm text-gm-text transition-all"
                value={data?.livekit_url ?? ""}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block">
                LIVEKIT_API_KEY
              </Label>
              <Input
                className="h-12 bg-gm-bg-deep border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 focus:border-gm-gold/50 text-sm text-gm-text transition-all"
                value={data?.api_key_masked ?? ""}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block">
                Webhook Signing Key
              </Label>
              <Input
                className="h-12 bg-gm-bg-deep border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 focus:border-gm-gold/50 text-sm text-gm-text transition-all"
                value={data?.webhook_signing_key_configured ? "Tanımlı" : "Eksik"}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.15em] uppercase ml-1 block">
                Aktif Oda Sayısı
              </Label>
              <Input
                className="h-12 bg-gm-bg-deep border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 focus:border-gm-gold/50 text-sm text-gm-text transition-all"
                value={
                  data?.active_rooms === null || data?.active_rooms === undefined ? "-" : String(data.active_rooms)
                }
                readOnly
              />
            </div>
          </div>

          {data?.rooms_error ? (
            <div className="rounded-2xl border border-gm-error/30 bg-gm-error/10 p-3 text-gm-error text-sm">
              {data.rooms_error}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardHeader className="bg-gm-surface/40 p-8 border-b border-gm-border-soft flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle className="font-serif text-2xl text-gm-text">Video Görüşme Özelliği</CardTitle>
            <CardDescription className="text-gm-muted font-serif italic opacity-80">
              `feature_video_enabled` ile video akışı global olarak açılır/kapatılır. Sistem sadece bu bayrağın true
              olduğu durumlarda video akışını aktive etmeye hazırdır.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetchFeature()}
            disabled={featureBusy}
            className="rounded-full border-gm-border-soft hover:bg-gm-surface/40 hover:text-gm-text text-[10px] font-bold tracking-widest uppercase"
          >
            <RefreshCcw className="mr-2 size-4" />
            {featureBusy ? "Yükleniyor..." : "Yenile"}
          </Button>
        </CardHeader>
        <CardContent className="p-8 space-y-4">
          {featureBusy ? <div className="text-gm-muted text-sm">Ayar yükleniyor...</div> : null}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="feature-video-enabled"
                checked={featureVideoDraft}
                onCheckedChange={handleFeatureToggle}
                disabled={featureBusy}
              />
              <Label htmlFor="feature-video-enabled" className="text-sm text-gm-text">
                Video görüşmeleri aktif
              </Label>
            </div>
            <Button
              type="button"
              onClick={saveFeatureEnabled}
              disabled={featureBusy || !featureChanged}
              className="rounded-full bg-gm-gold text-gm-bg hover:bg-gm-gold-light h-12 px-8 text-[10px] font-bold tracking-widest uppercase transition-all"
            >
              {isSavingFeature ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              className={
                featureVideoEnabled
                  ? "bg-gm-gold text-gm-bg border-transparent"
                  : "border-gm-gold/30 bg-gm-gold/5 text-gm-gold"
              }
            >
              {featureVideoEnabled ? "Aktif" : "Pasif"}
            </Badge>
            <Badge className="bg-gm-bg-deep text-gm-text border-gm-border-soft">
              Kayıtlı değer: {featureVideoEnabled ? "1" : "0"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
