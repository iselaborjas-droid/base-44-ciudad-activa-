import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Users, Download, MessageSquare, Check, X, CalendarClock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const statusConfig = {
  enviada: { label: 'Enviada', color: 'bg-blue-100 text-blue-700' },
  revisada: { label: 'Revisada', color: 'bg-yellow-100 text-yellow-700' },
  entrevista: { label: 'Entrevista', color: 'bg-purple-100 text-purple-700' },
  aceptada: { label: 'Aceptada', color: 'bg-green-100 text-green-700' },
  rechazada: { label: 'Rechazada', color: 'bg-red-100 text-red-700' },
};

export default function Postulantes() {
  const { jobId } = useParams();
  const { toast } = useToast();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    async function load() {
      const [jobData, allApps] = await Promise.all([
        jobId ? base44.entities.Job.get(jobId) : null,
        base44.entities.Application.list('-created_date', 100),
      ]);
      setJob(jobData);
      const filtered = jobId ? allApps.filter(a => a.job_id === jobId) : allApps;
      setApplications(filtered);
      setLoading(false);
    }
    load();
  }, [jobId]);

  const updateAppStatus = async (appId, newStatus, applicantName) => {
    try {
      await base44.entities.Application.update(appId, { status: newStatus });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      const labels = { aceptada: 'aceptado', rechazada: 'rechazado', entrevista: 'convocado a entrevista' };
      toast({ title: `Candidato ${labels[newStatus] || 'actualizado'}`, description: applicantName });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const toggleSelect = (appId) => {
    setSelected(prev => prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]);
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
      <Link to="/empresa/mis-vacantes" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Volver a vacantes
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">{job?.title || 'Postulantes'}</h1>
        <p className="text-sm text-muted-foreground mt-1">{applications.length} candidatos para esta vacante</p>
      </div>

      {selected.length > 0 && (
        <div className="bg-secondary rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm font-medium">{selected.length} seleccionados</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-lg text-xs gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> Enviar mensaje
            </Button>
            <Button variant="destructive" size="sm" className="rounded-lg text-xs gap-1" onClick={() => { selected.forEach(id => updateAppStatus(id, 'rechazada', '')); setSelected([]); }}>
              <X className="w-3.5 h-3.5" /> Rechazar todos
            </Button>
          </div>
        </div>
      )}

      {applications.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
          </div>
          <p className="text-sm text-muted-foreground">Aún no hay postulantes para esta vacante</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map(app => {
            const config = statusConfig[app.status] || statusConfig.enviada;
            return (
              <div key={app.id} className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(app.id)}
                    onChange={() => toggleSelect(app.id)}
                    className="mt-1 w-4 h-4 rounded accent-foreground"
                  />
                  <div className="w-11 h-11 rounded-xl bg-ciudad-blue-light flex items-center justify-center flex-shrink-0">
                    <span className="text-base font-bold text-ciudad-blue">U</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground">Candidato</h3>
                      <Badge className={`text-[10px] ${config.color}`}>{config.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{app.job_title}</p>
                    {app.cover_letter && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{app.cover_letter}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Postuló el {new Date(app.created_date).toLocaleDateString('es-PE')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                  <Button variant="outline" size="sm" className="rounded-lg text-xs gap-1">
                    <Download className="w-3.5 h-3.5" /> CV
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg text-xs gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> Mensaje
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg text-xs gap-1" onClick={() => updateAppStatus(app.id, 'entrevista', 'Candidato')}>
                    <CalendarClock className="w-3.5 h-3.5" /> Entrevista
                  </Button>
                  <Button size="sm" className="rounded-lg text-xs gap-1 bg-ciudad-green hover:bg-ciudad-green/90" onClick={() => updateAppStatus(app.id, 'aceptada', 'Candidato')}>
                    <Check className="w-3.5 h-3.5" /> Aceptar
                  </Button>
                  <Button variant="destructive" size="sm" className="rounded-lg text-xs gap-1" onClick={() => updateAppStatus(app.id, 'rechazada', 'Candidato')}>
                    <X className="w-3.5 h-3.5" /> Rechazar
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