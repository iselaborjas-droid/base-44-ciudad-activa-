import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Heart, MessageCircle, Lightbulb, GraduationCap, Briefcase, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const postTypes = [
  { key: 'all', label: 'Todos', icon: null },
  { key: 'experiencia', label: 'Experiencias', icon: Lightbulb },
  { key: 'capacitacion', label: 'Capacitaciones', icon: GraduationCap },
  { key: 'oportunidad', label: 'Oportunidades', icon: Briefcase },
];

export default function EntrepreneurCommunity() {
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ content: '', author_name: '', post_type: 'experiencia' });

  useEffect(() => {
    base44.entities.EntrepreneurPost.list('-created_date', 50).then(data => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  const filtered = posts.filter(p => activeType === 'all' || p.post_type === activeType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content || !form.author_name) {
      toast({ title: 'Completa todos los campos', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const created = await base44.entities.EntrepreneurPost.create(form);
      setPosts(prev => [created, ...prev]);
      setForm({ content: '', author_name: '', post_type: 'experiencia' });
      setShowForm(false);
      toast({ title: 'Publicación creada' });
    } catch {
      toast({ title: 'Error al publicar', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  const typeLabel = (t) => postTypes.find(p => p.key === t)?.label || t;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Comunidad de Emprendedores</h1>
          <p className="text-sm text-muted-foreground mt-1">Comparte experiencias, capacitaciones y oportunidades</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-ciudad-green hover:bg-ciudad-green/90 flex-shrink-0">
          <Plus className="w-4 h-4" /> Publicar
        </Button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {postTypes.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveType(t.key)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${activeType === t.key ? 'bg-ciudad-green text-white' : 'bg-secondary text-muted-foreground'}`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />} {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-muted border-t-ciudad-green rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(p => (
            <div key={p.id} className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-ciudad-green-light flex items-center justify-center font-bold text-ciudad-green">
                  {p.author_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm">{p.author_name}</p>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-ciudad-green-light text-ciudad-green">
                    {typeLabel(p.post_type)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{p.content}</p>
              {p.image_url && <img src={p.image_url} alt="" className="w-full rounded-xl max-h-64 object-cover" />}
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                <button className="flex items-center gap-1 hover:text-ciudad-orange">
                  <Heart className="w-4 h-4" /> {p.likes_count || 0}
                </button>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" /> {p.comments_count || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-2">
          <Lightbulb className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground text-sm">Sé el primero en compartir</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl p-5 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">Nueva publicación</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input value={form.author_name} onChange={(e) => setForm(f => ({ ...f, author_name: e.target.value }))} placeholder="Tu nombre" />
              <select
                value={form.post_type}
                onChange={(e) => setForm(f => ({ ...f, post_type: e.target.value }))}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="experiencia">Experiencia</option>
                <option value="capacitacion">Capacitación</option>
                <option value="oportunidad">Oportunidad</option>
              </select>
              <Textarea value={form.content} onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Comparte tu experiencia..." rows={4} />
              <Button type="submit" disabled={submitting} className="w-full bg-ciudad-green hover:bg-ciudad-green/90">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publicar'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}