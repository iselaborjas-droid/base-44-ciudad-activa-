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

export default function PublishCourse() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    instructor: '',
    description: '',
    category: '',
    duration_hours: '',
    modality: 'virtual',
    is_free: true,
    price: '0',
    has_certificate: true,
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.instructor || !form.description) {
      toast({ title: 'Completa los campos requeridos', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await base44.entities.Course.create({
        ...form,
        duration_hours: form.duration_hours ? Number(form.duration_hours) : undefined,
        price: form.is_free ? 0 : Number(form.price),
        status: 'activo',
      });
      toast({ title: 'Curso publicado', description: 'Tu curso ya está disponible para los trabajadores.' });
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
        <h1 className="text-2xl font-bold text-foreground">Publicar Curso</h1>
        <p className="text-sm text-muted-foreground mt-1">Crea capacitaciones y relacionalas con tus vacantes</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Título del curso *</Label>
          <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ej: Atención al cliente para retail" className="h-11" required />
        </div>

        <div className="space-y-2">
          <Label>Instructor *</Label>
          <Input value={form.instructor} onChange={e => set('instructor', e.target.value)} placeholder="Nombre del instructor" className="h-11" required />
        </div>

        <div className="space-y-2">
          <Label>Descripción *</Label>
          <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe el contenido, objetivos y temario..." className="min-h-[100px]" required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Input value={form.category} onChange={e => set('category', e.target.value)} placeholder="Ej: Ventas, Tecnología" className="h-11" />
          </div>
          <div className="space-y-2">
            <Label>Duración (horas)</Label>
            <Input type="number" value={form.duration_hours} onChange={e => set('duration_hours', e.target.value)} placeholder="10" className="h-11" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Modalidad</Label>
            <Select value={form.modality} onValueChange={v => set('modality', v)}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="presencial">Presencial</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="hibrido">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>¿Es gratuito?</Label>
            <Select value={form.is_free ? 'si' : 'no'} onValueChange={v => set('is_free', v === 'si')}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="si">Sí, gratuito</SelectItem>
                <SelectItem value="no">No, de pago</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {!form.is_free && (
          <div className="space-y-2">
            <Label>Precio (S/)</Label>
            <Input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="50" className="h-11" />
          </div>
        )}

        <div className="space-y-2">
          <Label>¿Incluye certificado?</Label>
          <Select value={form.has_certificate ? 'si' : 'no'} onValueChange={v => set('has_certificate', v === 'si')}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="si">Sí</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full h-12 rounded-xl" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publicando...</> : 'Publicar curso'}
        </Button>
      </form>
    </div>
  );
}