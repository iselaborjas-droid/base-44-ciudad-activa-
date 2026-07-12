import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Sparkles, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';

const freeFeatures = [
  'Perfil de negocio en el directorio',
  'Hasta 3 fotos',
  'Información de contacto',
  'Apareces en búsquedas',
];

const premiumFeatures = [
  'Todo lo del plan gratis',
  'Fotos ilimitadas',
  'Sección de productos y ofertas',
  'Prioridad en búsquedas',
  'Sello de negocio Premium',
  'Emprendimiento destacado semanal',
  'Estadísticas de visitas',
];

export default function BusinessBenefits() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-ciudad-orange-light text-ciudad-orange px-3 py-1 rounded-full text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Beneficios para negocios
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Haz crecer tu emprendimiento</h1>
        <p className="text-sm text-muted-foreground">Elige el plan que mejor se adapte a tu negocio</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Free Plan */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-ciudad-blue-light flex items-center justify-center">
              <Store className="w-5 h-5 text-ciudad-blue" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Gratis</h2>
              <p className="text-xs text-muted-foreground">Para empezar</p>
            </div>
          </div>
          <p className="text-3xl font-bold">S/ 0<span className="text-sm font-normal text-muted-foreground">/mes</span></p>
          <ul className="space-y-2.5">
            {freeFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-ciudad-green flex-shrink-0 mt-0.5" /> {f}
              </li>
            ))}
          </ul>
          <Button onClick={() => navigate('/publish-business')} variant="outline" className="w-full">
            Publicar negocio gratis
          </Button>
        </div>

        {/* Premium Plan */}
        <div className="bg-gradient-to-br from-ciudad-orange to-ciudad-orange/80 rounded-2xl p-6 space-y-4 text-white relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            RECOMENDADO
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Premium</h2>
              <p className="text-xs text-white/70">Para crecer más rápido</p>
            </div>
          </div>
          <p className="text-3xl font-bold">S/ 19.90<span className="text-sm font-normal text-white/70">/mes</span></p>
          <ul className="space-y-2.5">
            {premiumFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 flex-shrink-0 mt-0.5" /> {f}
              </li>
            ))}
          </ul>
          <Button onClick={() => navigate('/publish-business')} className="w-full bg-white text-ciudad-orange hover:bg-white/90">
            Empezar Premium
          </Button>
        </div>
      </div>

      <div className="bg-ciudad-blue-light rounded-2xl p-5 text-center space-y-2">
        <p className="text-sm text-foreground/80">¿Tienes dudas sobre los planes?</p>
        <p className="text-xs text-muted-foreground">Contáctanos y te ayudamos a elegir el plan ideal para tu negocio en Collique.</p>
      </div>
    </div>
  );
}