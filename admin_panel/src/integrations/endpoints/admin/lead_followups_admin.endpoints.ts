import { baseApi } from '@/integrations/baseApi';
export type LeadKey = {kind:'quote'|'contact';id:string};
export type LeadFollowup = {version:number;stage:string;responsible:string;purpose:string;next_action_at:string|null;loss_reason:string;note:string};
const api = baseApi.injectEndpoints({endpoints:(build)=>({
  listLeadFollowups:build.query<{items:(LeadFollowup & {record_kind:'quote'|'contact';record_id:string})[];counts:{stage:string;count:number}[];purposes?:{purpose:string;count:number}[];scope:string},void>({query:()=>'/admin/lead-followups',providesTags:[{type:'Contacts',id:'followups:LIST'}]}),
  getLeadFollowup:build.query<LeadFollowup,LeadKey>({
    query:({kind,id})=>`/admin/lead-followups/${kind}/${encodeURIComponent(id)}`,
    providesTags:(_r,_e,{kind,id})=>[{type:'Contacts',id:`followup:${kind}:${id}`}],
  }),
  saveLeadFollowup:build.mutation<LeadFollowup,LeadKey & {body:LeadFollowup}>({
    query:({kind,id,body})=>({url:`/admin/lead-followups/${kind}/${encodeURIComponent(id)}`,method:'PUT',body}),
    invalidatesTags:(_r,_e,{kind,id})=>[{type:'Contacts',id:`followup:${kind}:${id}`},{type:'Contacts',id:'followups:LIST'}],
  }),
}),overrideExisting:false});
export const {useGetLeadFollowupQuery,useSaveLeadFollowupMutation,useListLeadFollowupsQuery}=api;
