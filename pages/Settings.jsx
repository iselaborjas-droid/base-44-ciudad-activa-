import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Globe, Shield, Trash2, LogOut, ChevronRight, Bell, User, ArrowLeftRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

export default function Settings() {
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [switching, setSwitching] = useState(false);
  const { toast } = useToast();

  const currentRole = user?.profile_type || 'trabajador';
  const targetRole = currentRole === 'trabajador' ? 'empresa' : 'trabajador';
  const targetLabel = currentRole === 'trabajador' ? 'Modo Empresa' : 'Modo Trabajador';

  const handleRoleSwitch = async () => {
    setSwitching(true);
    try {
      await base44.auth.updateMe({ profile_type: targetRole });
      toast({ title: `Cambiaste a ${targetLabel}`, description: 'Redirigiendo...' });
      setTimeout(() => {
        window.location.href = targetRole === 'empresa' ? '/empresa' : '/';
      }, 800);
    } catch (err) {
      toast({ title: 'Error al cambiar', description: err.message, variant: 'destructive' });
      setSwitching(false);
    }
  };

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  const SettingRow = ({ icon: Icon, label, description, action, destructive = false }) => (
    <div className={`flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors ${destructive ? 'text-destructive' : ''}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        destructive ? 'bg-red-50' : 'bg-secondary'
      }`}>
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestiona tu cuenta y preferencias</p>
      </div>

      <div className="bg-card rounded-2xl border border-border divide-y divide-border">
        <SettingRow
          icon={Bell}
          label="Notificaciones"
          description="Gestiona tus alertas y recordatorios"
          action={<ChevronRight className="w-5 h-5 text-muted-foreground" />}
        />
        <SettingRow
          icon={Globe}
          label="Idioma"
          description="Español"
          action={<ChevronRight className="w-5 h-5 text-muted-foreground" />}
        />
        <SettingRow
          icon={Shield}
          label="Privacidad"
          description="Controla la visibilidad de tu perfil"
          action={<ChevronRight className="w-5 h-5 text-muted-foreground" />}
        />
      </div>

      {/* Role Switching */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-ciudad-blue-light flex items-center justify-center flex-shrink-0">
            <ArrowLeftRight className="w-5 h-5 text-ciudad-blue" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Modo de la aplicación</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Actualmente en <span className="font-semibold capitalize">{currentRole === 'empresa' ? 'Empresa' : 'Trabajador'}</span>
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl text-xs gap-1.5"
            disabled={switching}
            onClick={handleRoleSwitch}
          >
            {switching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowLeftRight className="w-3.5 h-3.5" />}
            Cambiar a {targetLabel}
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border divide-y divide-border">
        <button onClick={handleLogout} className="w-full text-left">
          <SettingRow
            icon={LogOut}
            label="Cerrar sesión"
            description="Salir de tu cuenta"
            action={<ChevronRight className="w-5 h-5 text-muted-foreground" />}
          />
        </button>
        <button onClick={() => setShowDeleteDialog(true)} className="w-full text-left">
          <SettingRow
            icon={Trash2}
            label="Eliminar cuenta"
            description="Esta acción no se puede deshacer"
            action={<ChevronRight className="w-5 h-5 text-muted-foreground" />}
            destructive
          />
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground pt-4">
        Ciudad Activa v1.0 · Conectando oportunidades
      </p>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>¿Eliminar tu cuenta?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Esta acción es permanente. Se eliminarán todos tus datos, postulaciones, cursos y actividades.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button variant="destructive" className="rounded-xl" onClick={() => {
              toast({ title: 'Solicitud enviada', description: 'Tu cuenta será eliminada en 24 horas.' });
              setShowDeleteDialog(false);
            }}>
              Eliminar cuenta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}