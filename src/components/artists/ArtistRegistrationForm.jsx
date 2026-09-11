import React,{useState} from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import PortfolioUpload from '@/components/artists/PortfolioUpload';
const initial={name:'',email:'',bio:'',instagram:'',website:'',pix_key:'',portfolio_files:[]};
export default function ArtistRegistrationForm(){
 const [form,setForm]=useState(initial),[saving,setSaving]=useState(false),[done,setDone]=useState(false),[error,setError]=useState('');
 const field=(key,value)=>setForm(current=>({...current,[key]:value}));
 const submit=async e=>{e.preventDefault();setSaving(true);setError('');try{await base44.entities.ArtistApplication.create({...form,status:'pending',applied_at:new Date().toISOString()});setDone(true);setForm(initial);}catch(err){setError(err.message||'Não foi possível enviar seu cadastro.');}finally{setSaving(false);}};
 if(done)return <div className="rounded-3xl border bg-card p-10 text-center"><h2 className="text-2xl font-bold">Cadastro recebido</h2><p className="mt-3 text-muted-foreground">Sua conta está pendente de aprovação. Tamo junto — nossa equipe vai analisar seu portfólio.</p></div>;
 return <form onSubmit={submit} className="space-y-5 rounded-3xl border bg-card p-6 shadow-sm sm:p-8"><div className="grid gap-5 sm:grid-cols-2"><Input required placeholder="Nome completo" value={form.name} onChange={e=>field('name',e.target.value)}/><Input required type="email" placeholder="E-mail" value={form.email} onChange={e=>field('email',e.target.value)}/></div><Textarea required placeholder="Conte sobre sua arte" value={form.bio} onChange={e=>field('bio',e.target.value)}/><div className="grid gap-5 sm:grid-cols-2"><Input placeholder="Instagram" value={form.instagram} onChange={e=>field('instagram',e.target.value)}/><Input type="url" placeholder="Site ou portfólio online" value={form.website} onChange={e=>field('website',e.target.value)}/></div><Input required placeholder="Chave PIX para comissões" value={form.pix_key} onChange={e=>field('pix_key',e.target.value)}/><PortfolioUpload value={form.portfolio_files} onChange={files=>field('portfolio_files',files)}/>{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}<Button disabled={saving} className="h-12 w-full rounded-xl">{saving?'Enviando cadastro...':'Quero ser artista'}</Button></form>;
}