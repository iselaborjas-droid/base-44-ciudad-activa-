import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Megaphone, CalendarDays, GraduationCap, Newspaper, Bell, ArrowRight } from 'lucide-react';

const publicationTypes = [
  {
    title: 'Nueva Vacante',
    description: 'Publica una oferta de empleo y recibe postulaciones de candidatos calificados.',
    path: '/empresa/publish-job',
    icon: Briefcase,
    color: 'bg-ciudad-blue',
    lightColor: 'bg-ciudad-blue-light',
    iconColor: 'text-ciudad-blue',
  },
  {
    title: 'Nueva Promoción',
    description: 'Crea descuentos, ofertas y campañas para promocionar tu negocio.',
    path: '/empresa/promocionar',
    icon: Megaphone,
    color: 'bg-ciudad-orange',
    lightColor: 'bg-ciudad-orange-light',
    iconColor: 'text-ciudad-orange',
  },
  {
    title: 'Nuevo Evento',
    description: 'Organiza ferias, charlas, capacitaciones o inauguraciones.',
    path: '/empresa/publish-event',
    icon: CalendarDays,
    color: 'bg-ciudad-green',
    lightColor: 'bg-ciudad-green-light',
    iconColor: 'text-ciudad-green',
  },
  {
    title: 'Nuevo Curso',
    description: 'Crea cursos de capacitación y relacionalos con tus vacantes.',
    path: '/empresa/publish-course',
    icon: GraduationCap,
    color: 'bg-foreground',
    lightColor: 'bg-secondary',
    iconColor: 'text-foreground',
  },
  {
    title: 'Nueva Noticia',
    description: 'Comprime novedades y anuncios importantes de tu empresa.',
    path: '/empresa/mi-empresa',
    icon: Newspaper,
    color: 'bg-ciudad-blue',
    lightColor: 'bg-ciudad-blue-light',
    iconColor: 'text-ciudad-blue',
  },
  {
    title: 'Nuevo Anuncio',
    description: 'Envía notificaciones y mensajes a tu comunidad.',
    path: '/empresa/mi-empresa',
    icon: Bell,
    color: 'bg-ciudad-orange',
    lightColor: 'bg-ciudad-orange-light',
    iconColor: 'text-ciudad-orange',
  },
];

export default function Publicaciones() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Centro de Publicaciones</h1>
        <p className="text-sm text-muted-foreground mt-1">Crea y gestiona todo el contenido de tu empresa</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {publicationTypes.map((pub, i) => (
          <Link key={i} to={pub.path}>
            <div className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg hover:border-foreground/10 transition-all group">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl ${pub.lightColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <pub.icon className={`w-7 h-7 ${pub.iconColor}`} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-foreground mb-1">{pub.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pub.description}</p>
                  <div className="flex items-center gap-1 mt-3 text-sm font-medium text-primary">
                    Crear <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}