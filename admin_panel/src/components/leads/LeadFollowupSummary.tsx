'use client';
import Link from 'next/link';
import {useListLeadFollowupsQuery} from '@/integrations/hooks';
import {Card,CardHeader,CardTitle,CardDescription,CardContent} from '@/components/ui/card';
const names:Record<string,string>={new:'Yeni',contacted:'Ulaşıldı',qualified:'Nitelikli',demo:'Demo',quoted:'Teklif',won:'Kazanıldı',lost:'Kaybedildi'};
const purposeNames:Record<string,string>={institution:'Kurum',home:'Ev / özel ders',career:'Kariyer (satış değil)',other:'Diğer',unknown:'Belirsiz'};
export function LeadFollowupSummary(){
 const {data,isError}=useListLeadFollowupsQuery();
 if(isError)return <p role="status">Satış takip özeti alınamadı.</p>;
 if(!data)return null;
 const open=data.items.filter(i=>!['won','lost'].includes(i.stage));
 return <Card><CardHeader><CardTitle>Satış takip özeti</CardTitle><CardDescription>{data.scope}</CardDescription></CardHeader><CardContent className="flex flex-col gap-3">
 <div className="flex flex-wrap gap-4">{data.counts.map(c=><span key={c.stage}>{names[c.stage]||c.stage}: <strong>{c.count}</strong></span>)}{!data.counts.length?<p>Bir teklif veya iletişim kaydını açarak satış takibini başlatın.</p>:null}</div>
 {data.purposes?.length?<div className="flex flex-wrap gap-4 text-sm text-muted-foreground" data-testid="followup-purposes"><span>Açık takipte kullanım amacı:</span>{data.purposes.map(p=><span key={p.purpose}>{purposeNames[p.purpose]||p.purpose}: <strong>{p.count}</strong></span>)}</div>:null}
 <details><summary className="cursor-pointer">Açık takipleri göster ({open.length}{data.items.length===100?' — ilk 100 kayıt içinde':''})</summary><ul className="mt-3 flex flex-col gap-2">{open.map(i=><li key={`${i.record_kind}:${i.record_id}`}><Link className="underline" href={`/admin/${i.record_kind==='quote'?'quote-requests':'contacts'}/${i.record_id}`}>{i.record_kind==='quote'?'Teklif':'İletişim'} · {names[i.stage]} · {i.responsible||'Sorumlu atanmadı'}</Link> — {i.next_action_at?new Date(i.next_action_at).toLocaleString('tr-TR'):'İşlem tarihi yok'} {i.next_action_at&&new Date(i.next_action_at).getTime()<Date.now()?'· Gecikmiş':''}</li>)}</ul></details>
 </CardContent></Card>;
}
