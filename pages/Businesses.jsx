import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Plus, Store } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import BusinessCard from '@/components/shared/BusinessCard';
import { businessCategories } from '@/lib/businessConfig';

export default function Businesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.Business.list('-created_date', 50).then(data => {
      setBusinesses(data);
      setLoading(false);
    });
  }, []);

  const filtered = businesses.filter(b => {
    const matchCat = activeCat === 'all' || b.category === activeCat;
    const matchSearch = !search ||
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Negocios de Collique</h1>
          <p className="text-sm text-muted-foreground mt-1">Descubre los emprendimientos de nuestra comunidad</p>
        </div>
        <Button onClick={() => navigate('/publish-business')} className="bg-ciudad-orange hover:bg-ciudad-orange/90 flex-shrink-0">
          <Plus className="w-4 h-4" /> Publicar
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar negocios..."
          className="h-12 pl-12 pr-4 rounded-2xl bg-card border-border"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setActiveCat('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCat === 'all' ? 'bg-ciudad-blue text-white' : 'bg-secondary text-muted-foreground'}`}
        >
          Todos
        </button>
        {businessCategories.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCat(cat.key)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCat === cat.key ? 'bg-ciudad-blue text-white' : 'bg-secondary text-muted-foreground'}`}
            >
              <Icon className="w-3.5 h-3.5" /> {cat.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-muted border-t-ciudad-blue rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(b => <BusinessCard key={b.id} business={b} />)}
        </div>
      ) : (
        <div className="text-center py-16 space-y-2">
          <Store className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground text-sm">No se encontraron negocios</p>
        </div>
      )}
    </div>
  );
}