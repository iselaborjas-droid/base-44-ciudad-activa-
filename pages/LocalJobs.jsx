import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MapPin, Briefcase } from 'lucide-react';
import JobCard from '@/components/shared/JobCard';

const districts = [
  { key: 'all', label: 'Todos' },
  { key: 'collique', label: 'Collique' },
  { key: 'comas', label: 'Comas' },
  { key: 'lima_norte', label: 'Lima Norte' },
];

export default function LocalJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDistrict, setActiveDistrict] = useState('all');

  useEffect(() => {
    base44.entities.Job.filter({ status: 'activo' }, '-created_date', 50).then(data => {
      setJobs(data);
      setLoading(false);
    });
  }, []);

  const filtered = jobs.filter(j =>
    activeDistrict === 'all' || j.district === activeDistrict
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Bolsa Laboral Local</h1>
        <p className="text-sm text-muted-foreground mt-1">Empleos en Collique, Comas y Lima Norte</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {districts.map(d => (
          <button
            key={d.key}
            onClick={() => setActiveDistrict(d.key)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${activeDistrict === d.key ? 'bg-ciudad-blue text-white' : 'bg-secondary text-muted-foreground'}`}
          >
            {d.key !== 'all' && <MapPin className="w-3.5 h-3.5" />} {d.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-muted border-t-ciudad-blue rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map(job => <JobCard key={job.id} job={job} />)}
        </div>
      ) : (
        <div className="text-center py-16 space-y-2">
          <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground text-sm">No hay empleos en esta zona</p>
        </div>
      )}
    </div>
  );
}