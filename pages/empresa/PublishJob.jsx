import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

export default function PublishJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    company_name: user?.full_name || '',
    description: '',
    requirements: '',
    benefits: '',
    location: '',
    district: 'collique',
    modality: 'presencial',
    salary_min: '',
    salary_max: '',
    category: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.location) {
      toast({ title: 'Completa los campos requeridos', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await base44.entities.Job.create({
        ...form,
        salary_min: form.salary_min ? Number(form.salary_min) : undefined,
        salary_max: form.salary_max ? Number(form.salary_max) : undefined,
        status: 'activo',
      });
      toast({ title: 'Vacante publicada', description: 'Tu empleo ya está visible para los trabajadores.' });
      navigate('/empresa/mis-vacantes');
    } catch (err) {
      toast({ title: 'Error al publicar', description: err.message, variant: 'destructive' });
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
        <h1 className="text-2xl font-bold text-foreground">Publicar Empleo</h1>
        <p className="text-sm text-muted-foreground mt-1">Completa los datos de la vacante</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Cargo / Título *</Label>
          <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ej: Asistente administrativo" className="h-11" required />
        </div>

        <div className="space-y-2">
          <Label>Empresa</Label>
          <Input value={form.company_name} onChange={e => set('company_name', e.target.value)} placeholder="Nombre de tu empresa" className="h-11" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Salario mínimo (S/)</Label>
            <Input type="number" value={form.salary_min} onChange={e => set('salary_min', e.target.value)} placeholder="1200" className="h-11" />
          </div>
          <div className="space-y-2">
            <Label>Salario máximo (S/)</Label>
            <Input type="number" value={form.salary_max} onChange={e => set('salary_max', e.target.value)} placeholder="2000" className="h-11" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Modalidad</Label>
            <Select value={form.modality} onValueChange={v => set('modality', v)}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="presencial">Presencial</SelectItem>
                <SelectItem value="remoto">Remoto</SelectItem>
                <SelectItem value="hibrido">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Distrito</Label>
            <Select value={form.district} onValueChange={v => set('district', v)}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="collique">Collique</SelectItem>
                <SelectItem value="comas">Comas</SelectItem>
                <SelectItem value="lima_norte">Lima Norte</SelectItem>
                <SelectItem value="otros">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Ubicación *</Label>
          <Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Dirección o zona" className="h-11" required />
        </div>

        <div className="space-y-2">
          <Label>Categoría</Label>
          <Input value={form.category} onChange={e => set('category', e.target.value)} placeholder="Ej: Ventas, Tecnología, Comida" className="h-11" />
        </div>

        <div className="space-y-2">
          <Label>Descripción del cargo *</Label>
          <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe las responsabilidades y tareas del puesto..." className="min-h-[100px]" required />
        </div>

        <div className="space-y-2">
          <Label>Requisitos</Label>
          <Textarea value={form.requirements} onChange={e => set('requirements', e.target.value)} placeholder="Experiencia, educación, habilidades necesarias..." className="min-h-[80px]" />
        </div>

        <div className="space-y-2">
          <Label>Beneficios</Label>
          <Textarea value={form.benefits} onChange={e => set('benefits', e.target.value)} placeholder="Seguro, horario flexible, capacitaciones..." className="min-h-[80px]" />
        </div>

        <Button type="submit" className="w-full h-12 rounded-xl" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publicando...</> : 'Publicar vacante'}
        </Button>
      </form>
    </div>
  );
}