import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function PublishEvent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_type: 'charla',
    date: '',
    location: '',
    organizer: '',
    max_attendees: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.date || !form.location) {
      toast({ title: 'Completa los campos requeridos', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await base44.entities.Event.create({
        ...form,
        date: new Date(form.date).toISOString(),
        max_attendees: form.max_attendees ? Number(form.max_attendees) : undefined,
        status: 'proximo',
      });
      toast({ title: 'Evento publicado', description: 'Tu evento ya está visible para la comunidad.' });
      navigate('/empresa');
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      <Link to="/empresa/publicaciones" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Publicar Evento</h1>
        <p className="text-sm text-muted-foreground mt-1">Organiza ferias, charlas, capacitaciones o inauguraciones</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Título del evento *</Label>
          <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ej: Feria laboral de Collique" className="h-11" required />
        </div>

        <div className="space-y-2">
          <Label>Tipo de evento</Label>
          <Select value={form.event_type} onValueChange={v => set('event_type', v)}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="feria_laboral">Feria laboral</SelectItem>
              <SelectItem value="charla">Charla</SelectItem>
              <SelectItem value="taller">Taller</SelectItem>
              <SelectItem value="actividad_comunitaria">Actividad comunitaria</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Descripción *</Label>
          <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe el evento, objetivos, agenda..." className="min-h-[100px]" required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Fecha y hora *</Label>
            <Input type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)} className="h-11" required />
          </div>
          <div className="space-y-2">
            <Label>Aforo máximo</Label>
            <Input type="number" value={form.max_attendees} onChange={e => set('max_attendees', e.target.value)} placeholder="50" className="h-11" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Ubicación *</Label>
          <Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Dirección o lugar del evento" className="h-11" required />
        </div>

        <div className="space-y-2">
          <Label>Organizador</Label>
          <Input value={form.organizer} onChange={e => set('organizer', e.target.value)} placeholder="Nombre de la empresa organizadora" className="h-11" />
        </div>

        <Button type="submit" className="w-full h-12 rounded-xl" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publicando...</> : 'Publicar evento'}
        </Button>
      </form>
    </div>
  );
}