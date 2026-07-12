import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Recycle, Leaf, Trophy, MapPin, Plus, Navigation, Search, Share2, CheckCircle2, TreePine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import moment from 'moment';

import RecyclingMap from '@/components/trabajador/RecyclingMap';
import RecyclingPointCard from '@/components/trabajador/RecyclingPointCard';
import ReportPointDialog from '@/components/trabajador/ReportPointDialog';
import { CATEGORY_CONFIG, calculateDistance, isOpenNow, fetchRecyclingPoints, getReportedPoints, saveReportedPoint } from '@/lib/recyclingUtils';

const typeLabels = { recoleccion: 'Recolección', separacion: 'Separación', entrega: 'Punto Ecológico', limpieza: 'Limpieza' };
const typeIcons = { recoleccion: Recycle, separacion: Leaf, entrega: MapPin, limpieza: TreePine };

export default function Recycling() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [form, setForm] = useState({ activity_type: 'recoleccion', description: '', location: '' });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [points, setPoints] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [selectedPointId, setSelectedPointId] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [openOnly, setOpenOnly] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await base44.entities.RecyclingActivity.list('-created_date', 30);
      setActivities(data);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    async function initMap() {
      const fallbackLoc = [-11.9333, -77.0667];
      const startLoc = (loc) => {
        loadPoints(loc);
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = [pos.coords.latitude, pos.coords.longitude];
            setUserLocation(loc);
            loadPoints(loc);
          },
          () => loadPoints(fallbackLoc),
          { timeout: 10000 }
        );
      } else {
        loadPoints(fallbackLoc);
      }
    }

    async function loadPoints(loc) {
      try {
        const osmPoints = await fetchRecyclingPoints(loc[0], loc[1], 5000);
        const reportedPoints = getReportedPoints();
        const allPoints = [...osmPoints, ...reportedPoints].map(p => ({
          ...p,
          distance: calculateDistance(loc[0], loc[1], p.lat, p.lon),
          isOpen: isOpenNow(p.hours),
        }));
        setPoints(allPoints);
      } catch (err) {
        const reportedPoints = getReportedPoints();
        setPoints(reportedPoints.map(p => ({ ...p, distance: null, isOpen: null })));
        if (reportedPoints.length === 0) {
          toast({ title: 'No se pudieron cargar los puntos', description: 'Intenta de más tarde o reporta un nuevo punto', variant: 'destructive' });
        }
      }
      setMapLoading(false);
    }

    initMap();
  }, []);

  const filteredPoints = useMemo(() => {
    let result = [...points];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q) ||
        p.district?.toLowerCase().includes(q)
      );
    }

    if (activeCategory) {
      result = result.filter(p => p.materials?.includes(activeCategory));
    }

    if (openOnly) {
      result = result.filter(p => p.isOpen === true);
    }

    if (sortByDistance) {
      result.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
    }

    return result;
  }, [points, search, activeCategory, openOnly, sortByDistance]);

  const nearestPoint = useMemo(() => {
    return points.filter(p => p.distance != null).sort((a, b) => a.distance - b.distance)[0];
  }, [points]);

  const totalPoints = activities.reduce((sum, a) => sum + (a.points_earned || 0), 0);

  const handleSave = async () => {
    setSaving(true);
    const activity = await base44.entities.RecyclingActivity.create({
      ...form,
      points_earned: Math.floor(Math.random() * 20) + 5,
      date: new Date().toISOString().split('T')[0],
    });
    setActivities([activity, ...activities]);
    setShowDialog(false);
    setForm({ activity_type: 'recoleccion', description: '', location: '' });
    setSaving(false);
    toast({ title: '¡Actividad registrada!', description: `Ganaste ${activity.points_earned} puntos ecológicos` });
  };

  const handleReportSubmit = (formData) => {
    const baseLoc = userLocation || [-11.9333, -77.0667];
    const offset = (Math.random() - 0.5) * 0.01;
    const newPoint = saveReportedPoint({
      ...formData,
      lat: baseLoc[0] + offset,
      lon: baseLoc[1] + offset,
    });
    setPoints(prev => [...prev, {
      ...newPoint,
      distance: calculateDistance(baseLoc[0], baseLoc[1], newPoint.lat, newPoint.lon),
      isOpen: isOpenNow(newPoint.hours),
    }]);
    setShowReportDialog(false);
    toast({ title: '¡Punto reportado!', description: 'Gracias por contribuir a la comunidad' });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Puntos de reciclaje en Collique',
          text: 'Encuentra puntos de reciclaje cerca de ti',
          url: window.location.href,
        });
      } catch (e) {}
    } else {
      navigator.clipboard?.writeText(window.location.href);
      toast({ title: 'Enlace copiado al portapapeles' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reciclaje</h1>
          <p className="text-sm text-muted-foreground mt-1">Encuentra puntos de reciclaje cerca de ti</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare} className="rounded-xl h-10 px-3">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button onClick={() => setShowDialog(true)} className="rounded-xl bg-ciudad-green hover:bg-[#0B7A51] text-white gap-2 h-10">
            <Plus className="w-4 h-4" /> Registrar
          </Button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#0FA36B] to-[#0B7A51] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm opacity-80">Tus puntos ecológicos</p>
            <p className="text-3xl font-bold">{totalPoints}</p>
          </div>
        </div>
        <p className="text-xs opacity-70">{activities.length} actividades registradas</p>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="h-[400px] relative">
          {mapLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary">
              <div className="w-8 h-8 border-4 border-muted border-t-ciudad-green rounded-full animate-spin" />
            </div>
          ) : (
            <RecyclingMap
              points={filteredPoints}
              userLocation={userLocation}
              selectedId={selectedPointId}
              onSelect={setSelectedPointId}
            />
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-4 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar punto de reciclaje..."
              className="pl-10 rounded-xl"
            />
          </div>
          <Button
            variant={openOnly ? 'default' : 'outline'}
            onClick={() => setOpenOnly(!openOnly)}
            className={`rounded-xl h-9 ${openOnly ? 'bg-ciudad-green text-white' : ''}`}
          >
            <CheckCircle2 className="w-4 h-4" /> Abiertos
          </Button>
          <Button
            variant={sortByDistance ? 'default' : 'outline'}
            onClick={() => setSortByDistance(!sortByDistance)}
            className={`rounded-xl h-9 ${sortByDistance ? 'bg-ciudad-blue text-white' : ''}`}
          >
            <Navigation className="w-4 h-4" /> Cercanía
          </Button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${!activeCategory ? 'bg-ciudad-blue text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
          >
            Todos
          </button>
          {CATEGORY_CONFIG.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(activeCategory === cat.key ? null : cat.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === cat.key ? 'bg-ciudad-green text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {nearestPoint && (
        <div className="bg-ciudad-blue-light rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ciudad-blue flex items-center justify-center">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-ciudad-blue">Punto más cercano</p>
              <p className="text-sm font-semibold text-foreground">{nearestPoint.name}</p>
              <p className="text-xs text-muted-foreground">{nearestPoint.distance} km de tu ubicación</p>
            </div>
          </div>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${nearestPoint.lat},${nearestPoint.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-ciudad-blue hover:underline flex items-center gap-1 flex-shrink-0"
          >
            Cómo llegar →
          </a>
        </div>
      )}

      <button
        onClick={() => setShowReportDialog(true)}
        className="w-full bg-card rounded-2xl border-2 border-dashed border-border p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:border-ciudad-green hover:text-ciudad-green transition-colors"
      >
        <Plus className="w-4 h-4" /> Reportar un nuevo punto de reciclaje
      </button>

      <div className="space-y-3">
        {filteredPoints.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center shadow-sm">
            <MapPin className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">No se encontraron puntos de reciclaje</p>
            <p className="text-xs text-muted-foreground mt-1">Intenta cambiar los filtros o reportar un nuevo punto</p>
          </div>
        ) : (
          filteredPoints.map(point => (
            <RecyclingPointCard
              key={point.id}
              point={point}
              isSelected={selectedPointId === point.id}
              onSelect={setSelectedPointId}
            />
          ))
        )}
      </div>

      {!loading && activities.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Mis actividades</h2>
          <div className="space-y-3">
            {activities.map(a => {
              const TypeIcon = typeIcons[a.activity_type] || Recycle;
              return (
                <div key={a.id} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-ciudad-green-light flex items-center justify-center flex-shrink-0">
                    <TypeIcon className="w-6 h-6 text-ciudad-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{typeLabels[a.activity_type]}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.description}</p>
                    {a.location && <p className="text-xs text-muted-foreground mt-0.5">📍 {a.location}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-ciudad-green">+{a.points_earned}</p>
                    <p className="text-[10px] text-muted-foreground">{moment(a.created_date).fromNow()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Registrar actividad ecológica</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Tipo de actividad</label>
              <Select value={form.activity_type} onValueChange={v => setForm({ ...form, activity_type: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Descripción</label>
              <Textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe tu actividad..."
                rows={3}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Ubicación</label>
              <Input
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="¿Dónde realizaste la actividad?"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} className="rounded-xl">Cancelar</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.description}
              className="rounded-xl bg-ciudad-green hover:bg-[#0B7A51] text-white"
            >
              {saving ? 'Guardando...' : 'Registrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReportPointDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
}