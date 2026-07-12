import React from 'react';
import { MessageSquare, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Mensajes() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mensajes</h1>
        <p className="text-sm text-muted-foreground mt-1">Comunícate con candidatos y tu equipo</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input placeholder="Buscar conversaciones..." className="h-12 pl-12 rounded-2xl bg-card border-border" />
      </div>

      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No tienes mensajes aún</p>
        <p className="text-xs text-muted-foreground">Las conversaciones con candidatos aparecerán aquí</p>
      </div>
    </div>
  );
}