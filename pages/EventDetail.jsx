import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, MapPin, CalendarDays, Users, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import moment from 'moment';

const typeLabels = { feria_laboral: 'Feria Laboral', charla: 'Charla', taller: 'Taller', actividad_comunitaria: 'Actividad Comunitaria' };

export default function EventDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await base44.entities.Event.get(id);
      setEvent(data);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleRegister = async () => {
    setRegistering(true);
    await base44.entities.EventRegistration.create({
      event_id: event.id,
      event_title: event.title,
      event_date: event.date,
    });
    setRegistered(true);
    setRegistering(false);
    toast({ title: '¡Inscripción confirmada!', description: 'Recibirás un recordatorio antes del evento.' });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-muted border-t-ciudad-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">Evento no encontrado</p>
        <Link to="/events" className="text-ciudad-blue text-sm mt-2 inline-block">← Volver a eventos</Link>
      </div>
    );
  }

  const eventDate = moment(event.date);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
      <Link to="/events" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver a eventos
      </Link>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="h-48 md:h-64 bg-gradient-to-br from-[#0FA36B] to-[#0B7A51] relative">
          {event.image_url ? (
            <img src={event.image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <CalendarDays className="w-16 h-16 text-white/20" />
            </div>
          )}
          <Badge className="absolute top-4 left-4 bg-white/20 text-white rounded-full backdrop-blur">
            {typeLabels[event.event_type] || event.event_type}
          </Badge>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">{event.title}</h1>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary rounded-xl p-4">
              <CalendarDays className="w-5 h-5 text-ciudad-blue mb-1.5" />
              <p className="text-sm font-semibold">{eventDate.format('DD MMM YYYY')}</p>
              <p className="text-xs text-muted-foreground">{eventDate.format('HH:mm')} hrs</p>
            </div>
            <div className="bg-secondary rounded-xl p-4">
              <MapPin className="w-5 h-5 text-ciudad-orange mb-1.5" />
              <p className="text-sm font-semibold">{event.location}</p>
              <p className="text-xs text-muted-foreground">{event.organizer || 'Organizador'}</p>
            </div>
          </div>

          {event.max_attendees && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {event.attendees_count || 0} / {event.max_attendees} asistentes
            </div>
          )}

          <div>
            <h2 className="text-sm font-semibold text-foreground mb-2">Descripción</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{event.description}</p>
          </div>

          {registered ? (
            <Button disabled className="w-full h-12 rounded-xl bg-ciudad-green text-white gap-2">
              <CheckCircle className="w-5 h-5" /> Inscrito
            </Button>
          ) : (
            <Button
              onClick={handleRegister}
              disabled={registering}
              className="w-full h-12 rounded-xl bg-ciudad-blue hover:bg-[#0E254A] text-white text-sm font-semibold"
            >
              {registering ? 'Inscribiendo...' : 'Inscribirme al evento'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}