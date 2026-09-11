import React from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
export default function AccessDisabled(){return <div className="flex min-h-screen items-center justify-center bg-muted px-4 text-center"><div className="max-w-md rounded-3xl border bg-card p-10"><h1 className="text-2xl font-bold">Acesso desativado</h1><p className="mt-3 text-muted-foreground">Seu acesso foi pausado pela administração. Fale com a equipe responsável.</p><Button className="mt-6" onClick={()=>base44.auth.logout('/')}>Sair</Button></div></div>;}