import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, X, Briefcase, CalendarDays, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import JobCard from '@/components/shared/JobCard';
import FilterPopover from '@/components/shared/FilterPopover';
import ViewSelector from '@/components/shared/ViewSelector';
import JobsMap from '@/components/jobs/JobsMap';
import moment from 'moment';

const modalityOptions = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'remoto', label: 'Remoto' },
  { value: 'hibrido', label: 'Híbrido' },
];

const employmentOptions = [
  { value: 'tiempo_completo', label: 'Tiempo completo' },
  { value: 'medio_tiempo', label: 'Medio tiempo' },
  { value: 'temporal', label: 'Temporal' },
  { value: 'practicas', label: 'Prácticas' },
  { value: 'freelance', label: 'Freelance' },
];

const dateOptions = [
  { value: 'today', label: 'Hoy' },
  { value: '3days', label: 'Últimos 3 días' },
  { value: 'week', label: 'Última semana' },
  { value: 'month', label: 'Último mes' },
];

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modality, setModality] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [view, setView] = useState('list');

  const urlParams = new URLSearchParams(window.location.search);
  const initialQ = urlParams.get('q') || '';

  useEffect(() => {
    if (initialQ) setSearch(initialQ);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const filter = { status: 'activo' };
      if (modality) filter.modality = modality;
      if (employmentType) filter.employment_type = employmentType;
      const data = await base44.entities.Job.filter(filter, '-created_date', 50);
      setJobs(data);
      setLoading(false);
    }
    load();
  }, [modality, employmentType]);

  const filtered = jobs.filter(j => {
    if (search) {
      const q = search.toLowerCase();
      if (!j.title?.toLowerCase().includes(q) &&
        !j.company_name?.toLowerCase().includes(q) &&
        !j.location?.toLowerCase().includes(q)) return false;
    }
    if (dateFilter) {
      const cutoff = moment().subtract(
        dateFilter === 'today' ? 0 : dateFilter === '3days' ? 3 : dateFilter === 'week' ? 7 : 30,
        'days'
      ).startOf('day');
      if (!moment(j.created_date).isAfter(cutoff)) return false;
    }
    return true;
  });

  const clearAll = () => {
    setSearch('');
    setModality('');
    setEmploymentType('');
    setDateFilter('');
  };
  const hasActiveFilters = modality || employmentType || dateFilter || search;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Empleos</h1>
          <p className="text-sm text-muted-foreground mt-1">Encuentra tu próxima oportunidad laboral</p>
        </div>
        <ViewSelector view={view} onChange={setView} />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por cargo, empresa o ciudad..."
          className="h-11 pl-10 rounded-xl bg-card"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <FilterPopover
          label="Modalidad"
          icon={Layers}
          options={modalityOptions}
          value={modality}
          onChange={setModality}
          onClear={() => setModality('')}
        />
        <FilterPopover
          label="Tipo de empleo"
          icon={Briefcase}
          options={employmentOptions}
          value={employmentType}
          onChange={setEmploymentType}
          onClear={() => setEmploymentType('')}
        />
        <FilterPopover
          label="Fecha de publicación"
          icon={CalendarDays}
          options={dateOptions}
          value={dateFilter}
          onChange={setDateFilter}
          onClear={() => setDateFilter('')}
        />
        {hasActiveFilters && (
          <button onClick={clearAll} className="text-sm text-muted-foreground hover:text-foreground ml-1 whitespace-nowrap">
            Limpiar todo
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-muted border-t-ciudad-blue rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No se encontraron empleos</p>
          {hasActiveFilters && (
            <Button variant="ghost" className="mt-2 text-ciudad-blue" onClick={clearAll}>
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : view === 'map' ? (
        <JobsMap jobs={filtered} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}