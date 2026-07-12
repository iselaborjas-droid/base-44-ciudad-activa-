import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { businessCategories } from '@/lib/businessConfig';

export default function PublishBusiness() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '', category: 'restaurante', description: '', history: '',
    location: '', district: 'collique', contact_phone: '', contact_email: '',
    social_facebook: '', social_instagram: '', hours: '', logo_url: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.category || !form.location) {
      toast({ title: 'Completa los campos obligatorios', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.Business.create({ ...form, plan: 'gratis' });
      setSuccess(true);
    } catch {
      toast({ title: 'Error al publicar el negocio', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-ciudad-green mx-auto" />
        <h1 className="text-xl font-bold">¡Negocio publicado!</h1>
        <p className="text-sm text-muted-foreground">Tu negocio ya está en el directorio de Collique. Los vecinos podrán descubrirlo pronto.</p>
        <div className="flex gap-3 justify-center pt-2">
          <Button onClick={() => navigate('/businesses')} className="bg-ciudad-blue">Ver directorio</Button>
          <Button variant="outline" onClick={() => { setSuccess(false); setForm({ name: '', category: 'restaurante', description: '', history: '', location: '', district: 'collique', contact_phone: '', contact_email: '', social_facebook: '', social_instagram: '', hours: '', logo_url: '' }); }}>
            Publicar otro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Publica tu negocio</h1>
        <p className="text-sm text-muted-foreground mt-1">Crea el perfil de tu emprendimiento para que la comunidad lo descubra</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-2xl p-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Nombre del negocio *</label>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ej. Pollería El Sabor" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Categoría *</label>
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            {businessCategories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Descripción *</label>
          <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="¿Qué ofreces?" rows={3} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Historia del negocio</label>
          <Textarea value={form.history} onChange={(e) => set('history', e.target.value)} placeholder="Cuéntanos cómo empezó tu emprendimiento..." rows={3} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Ubicación *</label>
            <Input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Dirección" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Distrito</label>
            <select
              value={form.district}
              onChange={(e) => set('district', e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="collique">Collique</option>
              <option value="comas">Comas</option>
              <option value="lima_norte">Lima Norte</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Teléfono</label>
            <Input value={form.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} placeholder="999 999 999" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Horario</label>
            <Input value={form.hours} onChange={(e) => set('hours', e.target.value)} placeholder="Lun-Dom 9am-10pm" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email</label>
          <Input type="email" value={form.contact_email} onChange={(e) => set('contact_email', e.target.value)} placeholder="negocio@email.com" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Facebook</label>
            <Input value={form.social_facebook} onChange={(e) => set('social_facebook', e.target.value)} placeholder="URL" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Instagram</label>
            <Input value={form.social_instagram} onChange={(e) => set('social_instagram', e.target.value)} placeholder="URL" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Logo (URL)</label>
          <Input value={form.logo_url} onChange={(e) => set('logo_url', e.target.value)} placeholder="https://..." />
        </div>

        <Button type="submit" disabled={submitting} className="w-full bg-ciudad-orange hover:bg-ciudad-orange/90 h-11">
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Publicando...</> : 'Publicar negocio'}
        </Button>
      </form>
    </div>
  );
}