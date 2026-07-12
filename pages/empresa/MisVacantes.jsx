import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Users, Eye, MoreVertical, Pause, Play, XCircle, Edit2, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const statusConfig = {
  activo: { label: 'Activa', color: 'bg-green-100 text-green-700' },
  pausado: { label: 'Pausada', color: 'bg-yellow-100 text-yellow-700' },
  cerrado: { label: 'Cerrada', color: 'bg-gray-100 text-gray-700' },
};

export default function MisVacantes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const [jobList, appList] = await Promise.all([
        base44.entities.Job.filter({ created_by_id: user.id }, '-created_date', 50),
        base44.entities.Application.list('-created_date', 100),
      ]);
      setJobs(jobList);
      setApps(appList);
      setLoading(false);
    }
    load();
  }, [user]);

  const getApplicantCount = (jobId) => apps.filter(a => a.job_id === jobId).length;

  const updateStatus = async (jobId, newStatus) => {
    try {
      await base44.entities.Job.update(jobId, { status: newStatus });
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
      toast({ title: 'Estado actualizado' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mis Vacantes</h1>
          <p className="text-sm text-muted-foreground mt-1">{jobs.length} empleos publicados</p>
        </div>
        <Link to="/empresa/publish-job">
          <Button className="rounded-xl">Nueva vacante</Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
          </div>
          <p className="text-sm text-muted-foreground mb-4">Aún no has publicado ninguna vacante</p>
          <Link to="/empresa/publish-job">
            <Button className="rounded-xl">Publicar primera vacante</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => {
            const applicantCount = getApplicantCount(job.id);
            const config = statusConfig[job.status] || statusConfig.activo;
            return (
              <div key={job.id} className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-foreground truncate">{job.title}</h3>
                      <Badge className={`text-[10px] ${config.color}`}>{config.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{job.location} · {job.modality}</p>
                    {job.salary_min && (
                      <p className="text-xs text-muted-foreground mt-0.5">S/ {job.salary_min}{job.salary_max ? ` - S/ ${job.salary_max}` : ''}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {applicantCount} postulantes
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" /> {new Date(job.created_date).toLocaleDateString('es-PE')}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-xs gap-1"
                    onClick={() => navigate(`/empresa/postulantes/${job.id}`)}
                  >
                    <Users className="w-3.5 h-3.5" /> Ver candidatos ({applicantCount})
                  </Button>
                  {job.status === 'activo' ? (
                    <Button variant="outline" size="sm" className="rounded-lg text-xs gap-1" onClick={() => updateStatus(job.id, 'pausado')}>
                      <Pause className="w-3.5 h-3.5" /> Pausar
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="rounded-lg text-xs gap-1" onClick={() => updateStatus(job.id, 'activo')}>
                      <Play className="w-3.5 h-3.5" /> Activar
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="rounded-lg text-xs gap-1" onClick={() => updateStatus(job.id, 'cerrado')}>
                    <XCircle className="w-3.5 h-3.5" /> Cerrar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}