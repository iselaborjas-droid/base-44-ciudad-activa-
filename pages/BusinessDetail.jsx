import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Facebook, Instagram, Clock, Crown, Star, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCategoryInfo, districtLabels } from '@/lib/businessConfig';

export default function BusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    Promise.all([
      base44.entities.Business.get(id),
      base44.entities.Product.filter({ business_id: id }),
    ]).then(([b, p]) => {
      setBusiness(b);
      setProducts(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-muted border-t-ciudad-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-24 space-y-3">
        <p className="text-muted-foreground">Negocio no encontrado</p>
        <Button onClick={() => navigate('/businesses')}>Volver a negocios</Button>
      </div>
    );
  }

  const cat = getCategoryInfo(business.category);
  const photos = business.photos?.length ? business.photos : (business.logo_url ? [business.logo_url] : []);

  return (
    <div className="max-w-3xl mx-auto pb-8">
      <div className="h-56 md:h-72 bg-gradient-to-br from-ciudad-blue to-ciudad-blue/70 relative">
        {photos[activePhoto] ? (
          <img src={photos[activePhoto]} alt={business.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-white/30">
            {business.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        {business.plan === 'premium' && (
          <span className="absolute top-4 right-4 bg-ciudad-orange text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Crown className="w-3.5 h-3.5" /> Premium
          </span>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex gap-2 px-4 -mt-6 relative z-10 overflow-x-auto pb-2">
          {photos.map((url, i) => (
            <button
              key={i}
              onClick={() => setActivePhoto(i)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${activePhoto === i ? 'border-ciudad-orange' : 'border-transparent'}`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="px-4 md:px-8 space-y-5 pt-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{business.name}</h1>
            {business.rating > 0 && (
              <span className="flex items-center gap-1 text-sm text-ciudad-orange">
                <Star className="w-4 h-4 fill-current" /> {business.rating}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-ciudad-blue-light text-ciudad-blue">{cat.label}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" /> {districtLabels[business.district] || business.district}
            </span>
          </div>
        </div>

        <p className="text-sm text-foreground/80 leading-relaxed">{business.description}</p>

        {business.history && (
          <div className="bg-ciudad-orange-light rounded-2xl p-4 space-y-2">
            <h3 className="font-semibold text-sm text-ciudad-orange">Nuestra historia</h3>
            <p className="text-sm text-foreground/70 leading-relaxed italic">"{business.history}"</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {business.contact_phone && (
            <a href={`tel:${business.contact_phone}`} className="flex items-center gap-2 bg-card border border-border rounded-xl p-3 text-sm hover:bg-secondary">
              <Phone className="w-4 h-4 text-ciudad-blue" /> {business.contact_phone}
            </a>
          )}
          {business.hours && (
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-3 text-sm">
              <Clock className="w-4 h-4 text-ciudad-green" /> {business.hours}
            </div>
          )}
          {business.contact_email && (
            <a href={`mailto:${business.contact_email}`} className="flex items-center gap-2 bg-card border border-border rounded-xl p-3 text-sm hover:bg-secondary">
              <Mail className="w-4 h-4 text-ciudad-blue" /> {business.contact_email}
            </a>
          )}
          {business.location && (
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-3 text-sm">
              <MapPin className="w-4 h-4 text-ciudad-orange" /> {business.location}
            </div>
          )}
        </div>

        {(business.social_facebook || business.social_instagram) && (
          <div className="flex gap-3">
            {business.social_facebook && (
              <a href={business.social_facebook} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-ciudad-blue text-white rounded-xl px-4 py-2 text-sm font-medium">
                <Facebook className="w-4 h-4" /> Facebook
              </a>
            )}
            {business.social_instagram && (
              <a href={business.social_instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-ciudad-orange text-white rounded-xl px-4 py-2 text-sm font-medium">
                <Instagram className="w-4 h-4" /> Instagram
              </a>
            )}
          </div>
        )}

        {products.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-ciudad-green" />
              <h3 className="font-semibold">Productos y servicios</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {products.map(p => (
                <div key={p.id} className="bg-card border border-border rounded-xl p-3 space-y-1">
                  <p className="font-medium text-sm line-clamp-1">{p.name}</p>
                  {p.price != null && <p className="text-sm font-bold text-ciudad-blue">S/ {p.price.toFixed(2)}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <Link to="/businesses">
          <Button variant="outline" className="w-full">Ver más negocios</Button>
        </Link>
      </div>
    </div>
  );
}