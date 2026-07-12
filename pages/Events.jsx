import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EventCard from '@/components/shared/EventCard';

const typeLabels = { all: 'Todos', feria_laboral: 'Ferias', charla: 'Charlas', taller: 'Talleres', actividad_comunitaria: 'Comunitario' };

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  useEffect(() => {
    async function load() {
      const data = await base44.entities.Event.list('-date', 50);
      setEvents(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = events.filter(e => {
    if (tab !== 'all' && e.event_type !== tab) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return e.title?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Eventos</h1>
        <p className="text-sm text-muted-foreground mt-1">Ferias laborales, charlas, talleres y más</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar eventos..."
          className="h-11 pl-10 rounded-xl bg-card"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="rounded-xl bg-secondary h-10">
            {Object.entries(typeLabels).map(([key, label]) => (
              <TabsTrigger key={key} value={key} className="rounded-lg text-xs whitespace-nowrap">{label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-muted border-t-ciudad-blue rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No se encontraron eventos</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}