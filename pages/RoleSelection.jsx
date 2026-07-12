import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { User, Building2, Loader2, ArrowRight } from 'lucide-react';

export default function RoleSelection() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSelect = async (profileType) => {
    setSelecting(true);
    try {
      await base44.auth.updateMe({ profile_type: profileType });
      window.location.href = profileType === 'empresa' ? '/empresa' : '/';
    } catch (err) {
      setSelecting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.profile_type) {
    window.location.href = user.profile_type === 'empresa' ? '/empresa' : '/';
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ciudad-blue-light to-ciudad-orange-light p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-ciudad-blue flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">¿Cómo deseas utilizar Ciudad Activa?</h1>
          <p className="text-sm text-muted-foreground mt-2">Elige tu perfil para personalizar tu experiencia</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Trabajador */}
          <button
            onClick={() => handleSelect('trabajador')}
            disabled={selecting}
            className="group bg-card rounded-3xl border-2 border-border p-6 text-left hover:border-ciudad-blue hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            <div className="w-16 h-16 rounded-2xl bg-ciudad-blue-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <User className="w-8 h-8 text-ciudad-blue" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1">Soy Trabajador</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Quiero encontrar empleo, capacitarme, asistir a eventos y mejorar mi desarrollo profesional.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-ciudad-blue">
              Continuar como Trabajador
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Empresa */}
          <button
            onClick={() => handleSelect('empresa')}
            disabled={selecting}
            className="group bg-card rounded-3xl border-2 border-border p-6 text-left hover:border-ciudad-orange hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            <div className="w-16 h-16 rounded-2xl bg-ciudad-orange-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Building2 className="w-8 h-8 text-ciudad-orange" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1">Soy Empresa o Emprendimiento</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Quiero contratar personal, publicar empleos, promocionar mi negocio y encontrar talento.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-ciudad-orange">
              Continuar como Empresa
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {selecting && (
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Configurando tu cuenta...
          </div>
        )}
      </div>
    </div>
  );
}