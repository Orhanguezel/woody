'use client';
import {useEffect,useState} from 'react';
import {Card,CardHeader,CardTitle,CardDescription,CardContent} from '@/components/ui/card';
import {Field,FieldGroup,FieldLabel} from '@/components/ui/field';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectGroup,SelectItem} from '@/components/ui/select';
import {useGetLeadFollowupQuery,useSaveLeadFollowupMutation} from '@/integrations/hooks';
import type {LeadKey,LeadFollowup} from '@/integrations/endpoints/admin/lead_followups_admin.endpoints';
const stages = {new:'Yeni',contacted:'Ulaşıldı',qualified:'Nitelikli',demo:'Demo',quoted:'Teklif',won:'Kazanıldı',lost:'Kaybedildi'};
const purposes = {unknown:'Henüz sınıflanmadı',institution:'Kurum',home:'Ev',career:'Kariyer / öğretmen başvurusu',other:'Diğer'};
function localDate(value:string|null) {
 if(!value)return '';const d=new Date(value);if(Number.isNaN(d.getTime()))return '';
 return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);
}
export function LeadFollowupCard({kind,id}:LeadKey) {
 const query=useGetLeadFollowupQuery({kind,id});const [save,state]=useSaveLeadFollowupMutation();
 const [form,setForm]=useState<LeadFollowup|null>(null);const [message,setMessage]=useState('');
 useEffect(()=>{setForm(query.currentData?{...query.currentData}:null);},[query.currentData]);
 function field(key:keyof LeadFollowup,value:string|null){setMessage('');setForm(f=>f?{...f,[key]:value}:f);}
 async function submit(e:React.FormEvent){e.preventDefault();if(!form||state.isLoading)return;
  try {const result=await save({kind,id,body:{version:form.version,stage:form.stage,responsible:form.responsible,purpose:form.purpose,next_action_at:form.next_action_at,loss_reason:form.loss_reason,note:form.note}}).unwrap();setForm(result);setMessage('Satış takibi kaydedildi.');}
  catch(error){setMessage((error as {status?:number}).status===409?'Kayıt başka oturumda değişti. Yenileyip tekrar düzenleyin.':'Kaydedilemedi. Alanları ve bağlantıyı kontrol edin.');}
 }
 return <Card><CardHeader><CardTitle>Satış takibi</CardTitle><CardDescription>İşlem durumu ve bir sonraki adım. Kazanıldı seçimi ödeme veya reklam dönüşümü oluşturmaz.</CardDescription></CardHeader><CardContent>
  {query.isError?<div role="alert">Takip bilgisi alınamadı. <Button variant="outline" onClick={()=>query.refetch()}>Yenile</Button></div>:!form?<p>Yükleniyor…</p>:<form onSubmit={submit} className="flex flex-col gap-4"><FieldGroup>
   <Field><FieldLabel htmlFor={`${kind}-stage`}>Satış aşaması</FieldLabel><Select value={form.stage} onValueChange={v=>{field('stage',v);if(v==='won'||v==='lost')field('next_action_at',null);}}><SelectTrigger id={`${kind}-stage`}><SelectValue/></SelectTrigger><SelectContent><SelectGroup>{Object.entries(stages).map(([v,t])=><SelectItem key={v} value={v}>{t}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
   <Field><FieldLabel htmlFor={`${kind}-purpose`}>Talep türü</FieldLabel><Select value={form.purpose} onValueChange={v=>field('purpose',v)}><SelectTrigger id={`${kind}-purpose`}><SelectValue/></SelectTrigger><SelectContent><SelectGroup>{Object.entries(purposes).map(([v,t])=><SelectItem key={v} value={v}>{t}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
   <Field><FieldLabel htmlFor={`${kind}-responsible`}>Sorumlu kişi / ekip</FieldLabel><Input id={`${kind}-responsible`} maxLength={180} value={form.responsible} onChange={e=>field('responsible',e.target.value)}/></Field>
   <Field><FieldLabel htmlFor={`${kind}-next`}>Sonraki işlem (bu cihazın yerel saati)</FieldLabel><Input id={`${kind}-next`} type="datetime-local" disabled={['won','lost'].includes(form.stage)} value={localDate(form.next_action_at)} onChange={e=>field('next_action_at',e.target.value?new Date(e.target.value).toISOString():null)}/></Field>
   <Field><FieldLabel htmlFor={`${kind}-loss`}>Kayıp nedeni {form.stage==='lost'?'(zorunlu)':''}</FieldLabel><Input id={`${kind}-loss`} required={form.stage==='lost'} maxLength={500} value={form.loss_reason} onChange={e=>field('loss_reason',e.target.value)}/></Field>
   <Field><FieldLabel htmlFor={`${kind}-note`}>Sonraki adım / takip notu</FieldLabel><Textarea id={`${kind}-note`} maxLength={3000} value={form.note} onChange={e=>field('note',e.target.value)}/></Field>
  </FieldGroup><div className="flex flex-wrap gap-2"><Button type="submit" disabled={state.isLoading}>Takibi kaydet</Button><Button type="button" variant="outline" onClick={()=>query.refetch()}>Yenile</Button></div><p className="text-sm text-muted-foreground">Takip kaydı otomatik e-posta veya mesaj göndermez.</p>{message?<p role="status">{message}</p>:null}</form>}
 </CardContent></Card>;
}
