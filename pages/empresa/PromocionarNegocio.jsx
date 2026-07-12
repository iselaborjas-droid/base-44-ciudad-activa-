import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Tag, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function PromocionarNegocio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });

  useEffect(() => {
    async function load() {
      if (!user) return;
      const data = await base44.entities.Product.filter({ created_by_id: user.id, is_promotion: true }, '-created_date', 50);
      setPromotions(data);
      setLoadingList(false);
    }
    load();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast({ title: 'Completa los campos', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const newPromo = await base44.entities.Product.create({
        ...form,
        price: Number(form.price),
        business_name: user?.full_name || 'Mi Empresa',
        business_id: 'self',
        is_promotion: true,
      });
      setPromotions(prev => [newPromo, ...prev]);
      setForm({ name: '', description: '', price: '', category: '' });
      toast({ title: 'Promoción creada', description: 'Tu oferta ya está visible para los clientes.' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const deletePromo = async (id) => {
    try {
      await base44.entities.Product.delete(id);
      setPromotions(prev => prev.filter(p => p.id !== id));
      toast({ title: 'Promoción eliminada' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      <Link to="/empresa/publicaciones" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Promocionar Negocio</h1>
        <p className="text-sm text-muted-foreground mt-1">Crea descuentos, ofertas y campañas promocionales</p>
      </div>

      {/* Create Form */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-ciudad-orange" />
          <h3 className="text-sm font-semibold">Nueva promoción</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label>Título de la promoción *</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: 20% de descuento en pollos" className="h-11" required />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe la oferta, condiciones, vigencia..." className="min-h-[80px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Precio / Oferta (S/) *</Label>
              <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="15.90" className="h-11" required />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Comida, Servicio..." className="h-11" />
            </div>
          </div>
          <Button type="submit" className="w-full h-11 rounded-xl" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creando...</> : <><Plus className="w-4 h-4 mr-2" /> Crear promoción</>}
          </Button>
        </form>
      </div>

      {/* Existing Promotions */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Promociones activas ({promotions.length})</h3>
        {loadingList ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-4 border-muted border-t-foreground rounded-full animate-spin" />
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">No tienes promociones activas</div>
        ) : (
          <div className="space-y-2">
            {promotions.map(promo => (
              <div key={promo.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-ciudad-orange-light flex items-center justify-center flex-shrink-0">
                  <Tag className="w-5 h-5 text-ciudad-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{promo.name}</p>
                  <p className="text-xs text-muted-foreground">S/ {promo.price}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deletePromo(promo.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}