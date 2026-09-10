import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ShieldX } from 'lucide-react';

export default function CuratorAccessGate({ children }) {
  const [user, setUser] = useState();
  useEffect(() => { base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin('/curadoria')); }, []);
  if (!user) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-9 w-9 animate-spin rounded-full border-4 border-muted border-t-primary"/></div>;
  if (!['admin', 'curator'].includes(user.role)) return <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center"><ShieldX className="h-12 w-12 text-destructive"/><h1 className="mt-4 text-2xl font-bold">Acesso restrito</h1><p className="mt-2 text-muted-foreground">Este painel é exclusivo da equipe de curadoria.</p></div>;
  return children;
}