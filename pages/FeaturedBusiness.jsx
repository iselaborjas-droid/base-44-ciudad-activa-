import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Quote, ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCategoryInfo, districtLabels } from '@/lib/businessConfig';

export default function FeaturedBusiness() {
  const [featured, setFeatured] = useState(null);
  const [others, setOthers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      base44.entities.Business.filter({ is_featured: true }, '-created_date', 1),
      base44.entities.Business.list('-created_date', 10),
    ]).then(([f, all]) => {
      setFeatured(f[0] || all[0] || null);
      setOthers(all.filter(b => b.id !== (f[0]?.id || all[0]?.id)).slice(0, 4));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-muted border-t-ciudad-orange rounded-full animate-spin" />
      </div>
    );
  }

  if (!featured) {
    return (
      <div className="text-center py-24 space-y-2">
        <p className="text-muted-foreground">Próximamente un nuevo emprendimiento destacado</p>
        <Button onClick={() => navigate('/businesses')}>Ver negocios</Button>
      </div>
    );
  }

  const cat = getCategoryInfo(featured.category);

  return (
    <div className="max-w-3xl mx-auto pb-8 space-y-6">
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-1.5 bg-ciudad-orange-light text-ciudad-orange px-3 py-1 rounded-full text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Emprendimiento de la semana
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Historias que inspiran</h1>
      </div>

      <div className="rounded-3xl overflow-hidden bg-card border border-border shadow-lg">
        <div className="h-56 md:h-72 bg-gradient-to-br from-ciudad-orange to-ciudad-orange/60 relative">
          {featured.photos?.[0] ? (
            <img src={featured.photos[0]} alt={featured.name} className="w-full h-full object-cover" />
          ) : featured.logo_url ? (
            <img src={featured.logo_url} alt={featured.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-white/30">
              {featured.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="p-5 md:p-7 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl md:text-2xl font-bold">{featured.name}</h2>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-ciudad-blue-light text-ciudad-blue">{cat.label}</span>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> {districtLabels[featured.district] || featured.district}
          </p>

          {featured.history && (
            <div className="space-y-2">
              <Quote className="w-6 h-6 text-ciudad-orange/40" />
              <p className="text-base text-foreground/80 leading-relaxed italic">{featured.history}</p>
            </div>
          )}

          <p className="text-sm text-foreground/70 leading-relaxed">{featured.description}</p>

          <Button onClick={() => navigate(`/businesses/${featured.id}`)} className="bg-ciudad-orange hover:bg-ciudad-orange/90 w-full">
            Conocer el negocio <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {others.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Otros emprendimientos</h3>
          <div className="grid grid-cols-2 gap-3">
            {others.map(b => (
              <button
                key={b.id}
                onClick={() => navigate(`/businesses/${b.id}`)}
                className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 text-left hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-ciudad-blue-light flex items-center justify-center font-bold text-ciudad-blue flex-shrink-0 overflow-hidden">
                  {b.logo_url ? <img src={b.logo_url} alt="" className="w-full h-full object-cover" /> : b.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{b.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{getCategoryInfo(b.category).label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}