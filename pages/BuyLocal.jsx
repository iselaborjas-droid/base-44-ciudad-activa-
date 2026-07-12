import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ShoppingBag, Tag } from 'lucide-react';
import ProductCard from '@/components/shared/ProductCard';

export default function BuyLocal() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPromos, setShowPromos] = useState(false);

  useEffect(() => {
    base44.entities.Product.list('-created_date', 50).then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const filtered = showPromos ? products.filter(p => p.is_promotion) : products;
  const promos = products.filter(p => p.is_promotion);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Compra Local</h1>
        <p className="text-sm text-muted-foreground mt-1">Apoya a los negocios de Collique comprando cerca de ti</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setShowPromos(false)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium ${!showPromos ? 'bg-ciudad-blue text-white' : 'bg-secondary text-muted-foreground'}`}
        >
          Todos
        </button>
        <button
          onClick={() => setShowPromos(true)}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium ${showPromos ? 'bg-ciudad-green text-white' : 'bg-secondary text-muted-foreground'}`}
        >
          <Tag className="w-3.5 h-3.5" /> Ofertas
        </button>
      </div>

      {!showPromos && promos.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Tag className="w-4 h-4 text-ciudad-green" /> Ofertas destacadas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {promos.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-muted border-t-ciudad-green rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-semibold text-sm">{showPromos ? 'Ofertas' : 'Todos los productos'}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      ) : (
        <div className="text-center py-16 space-y-2">
          <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground text-sm">No hay productos disponibles</p>
        </div>
      )}
    </div>
  );
}