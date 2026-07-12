import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, MapPin, GraduationCap, Briefcase, Eye, MessageSquare, Bookmark, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const districtLabels = {
  collique: 'Collique',
  comas: 'Comas',
  lima_norte: 'Lima Norte',
  otros: 'Otros',
};

const availabilityLabels = {
  inmediata: 'Inmediata',
  '1_semana': '1 semana',
  '2_semanas': '2 semanas',
  '1_mes': '1 mes',
};

export default function Talento() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('all');
  const [availability, setAvailability] = useState('all');

  useEffect(() => {
    async function load() {
      const data = await base44.entities.TalentProfile.filter({ is_visible: true }, '-created_date', 50);
      setProfiles(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = profiles.filter(p => {
    const matchSearch = !search ||
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.skills?.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
      p.experience_summary?.toLowerCase().includes(search.toLowerCase());
    const matchDistrict = district === 'all' || p.district === district;
    const matchAvail = availability === 'all' || p.availability === availability;
    return matchSearch && matchDistrict && matchAvail;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Buscar Talento</h1>
        <p className="text-sm text-muted-foreground mt-1">Encuentra trabajadores ideales para tu empresa</p>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, habilidad o experiencia..."
            className="h-12 pl-12 rounded-2xl bg-card border-border"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Distrito" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los distritos</SelectItem>
              <SelectItem value="collique">Collique</SelectItem>
              <SelectItem value="comas">Comas</SelectItem>
              <SelectItem value="lima_norte">Lima Norte</SelectItem>
              <SelectItem value="otros">Otros</SelectItem>
            </SelectContent>
          </Select>
          <Select value={availability} onValueChange={setAvailability}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Disponibilidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toda disponibilidad</SelectItem>
              <SelectItem value="inmediata">Inmediata</SelectItem>
              <SelectItem value="1_semana">1 semana</SelectItem>
              <SelectItem value="2_semanas">2 semanas</SelectItem>
              <SelectItem value="1_mes">1 mes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="text-sm text-muted-foreground">{filtered.length} candidatos encontrados</div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
          </div>
          <p className="text-sm text-muted-foreground">No se encontraron candidatos con esos criterios</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map(profile => (
            <div key={profile.id} className="bg-card rounded-2xl border border-border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-ciudad-blue-light flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-ciudad-blue">
                    {profile.full_name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">{profile.full_name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.district && (
                      <Badge variant="secondary" className="text-[10px] gap-1">
                        <MapPin className="w-2.5 h-2.5" /> {districtLabels[profile.district] || profile.district}
                      </Badge>
                    )}
                    {profile.availability && (
                      <Badge variant="outline" className="text-[10px]">
                        {availabilityLabels[profile.availability] || profile.availability}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {profile.experience_summary && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{profile.experience_summary}</p>
              )}

              {profile.experience_years > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <Briefcase className="w-3.5 h-3.5" /> {profile.experience_years} años de experiencia
                </div>
              )}

              {profile.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {profile.skills.slice(0, 4).map((skill, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">{skill}</Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" className="flex-1 rounded-lg text-xs gap-1">
                  <Eye className="w-3.5 h-3.5" /> Ver perfil
                </Button>
                <Button size="sm" className="flex-1 rounded-lg text-xs gap-1">
                  <UserPlus className="w-3.5 h-3.5" /> Invitar
                </Button>
                <Button variant="ghost" size="sm" className="rounded-lg px-2">
                  <Bookmark className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-lg px-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}