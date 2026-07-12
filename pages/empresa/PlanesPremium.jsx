import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Crown, Building2, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Gratuito',
    price: 'S/ 0',
    period: 'para siempre',
    icon: Building2,
    color: 'border-border',
    accent: 'bg-secondary text-secondary-foreground',
    features: [
      '1 vacante activa',
      'Hasta 10 postulantes por mes',
      'Perfil de empresa básico',
      '1 promoción activa',
      'Acceso al directorio',
    ],
    cta: 'Plan actual',
    disabled: true,
  },
  {
    name: 'Pro',
    price: 'S/ 29',
    period: '/ mes',
    icon: Zap,
    color: 'border-ciudad-blue',
    accent: 'bg-ciudad-blue text-white',
    features: [
      '5 vacantes activas',
      'Postulantes ilimitados',
      'Búsqueda de talento avanzada',
      '5 promociones activas',
      'Estadísticas básicas',
      'Soporte por correo',
    ],
    cta: 'Empezar Pro',
    disabled: false,
    popular: false,
  },
  {
    name: 'Premium',
    price: 'S/ 59',
    period: '/ mes',
    icon: Star,
    color: 'border-ciudad-orange',
    accent: 'bg-ciudad-orange text-white',
    features: [
      'Vacantes ilimitadas',
      'Postulantes ilimitados',
      'Búsqueda de talento avanzada',
      'Promociones ilimitadas',
      'Estadísticas avanzadas con gráficos',
      'Destacado en búsquedas',
      'Soporte prioritario',
    ],
    cta: 'Empezar Premium',
    disabled: false,
    popular: true,
  },
  {
    name: 'Empresarial',
    price: 'S/ 149',
    period: '/ mes',
    icon: Crown,
    color: 'border-foreground',
    accent: 'bg-foreground text-background',
    features: [
      'Todo lo de Premium',
      'Múltiples usuarios',
      'API de integración',
      'Gestor de cuenta dedicado',
      'Reportes personalizados',
      'Capacitaciones privadas',
    ],
    cta: 'Contactar ventas',
    disabled: false,
  },
];

export default function PlanesPremium() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Planes para empresas</h1>
        <p className="text-sm text-muted-foreground mt-2">Elige el plan que mejor se adapte a tu negocio</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan, i) => (
          <div
            key={i}
            className={`bg-card rounded-2xl border-2 ${plan.color} p-5 relative ${plan.popular ? 'shadow-lg scale-[1.02]' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-ciudad-orange text-white text-[10px] font-bold px-3 py-1 rounded-full">
                MÁS POPULAR
              </div>
            )}
            <div className={`w-12 h-12 rounded-xl ${plan.accent} flex items-center justify-center mb-4`}>
              <plan.icon className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
            <div className="mt-2 mb-4">
              <span className="text-2xl font-bold text-foreground">{plan.price}</span>
              <span className="text-xs text-muted-foreground ml-1">{plan.period}</span>
            </div>
            <ul className="space-y-2 mb-5">
              {plan.features.map((feat, j) => (
                <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Check className="w-3.5 h-3.5 text-ciudad-green flex-shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            <Button
              className={`w-full rounded-xl ${plan.disabled ? 'opacity-60' : ''}`}
              variant={plan.popular ? 'default' : 'outline'}
              disabled={plan.disabled}
            >
              {plan.cta}
            </Button>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground pt-4">
        ¿Necesitas algo personalizado?{' '}
        <Link to="/empresa/mi-empresa" className="text-primary font-medium hover:underline">
          Contáctanos
        </Link>
      </div>
    </div>
  );
}