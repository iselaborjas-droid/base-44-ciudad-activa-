import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, MapPin, Briefcase, Building2, Bookmark, Share2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const modalityLabels = { presencial: 'Presencial', remoto: 'Remoto', hibrido: 'Híbrido' };

export default function JobDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await base44.entities.Job.get(id);
      setJob(data);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    await base44.entities.Application.create({
      job_id: job.id,
      job_title: job.title,
      company_name: job.company_name,
      cover_letter: coverLetter,
    });
    setApplying(false);
    setShowDialog(false);
    setApplied(true);
    toast({ title: '¡Postulación enviada!', description: 'La empresa revisará tu perfil.' });
  };

  const handleSave = async () => {
    await base44.entities.SavedJob.create({
      job_id: job.id,
      job_title: job.title,
      company_name: job.company_name,
    });
    setSaved(true);
    toast({ title: 'Empleo guardado' });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-muted border-t-ciudad-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">Empleo no encontrado</p>
        <Link to="/jobs" className="text-ciudad-blue text-sm mt-2 inline-block">← Volver a empleos</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver a empleos
      </Link>

      <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-ciudad-blue-light flex items-center justify-center flex-shrink-0">
            {job.company_logo ? (
              <img src={job.company_logo} alt="" className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <Building2 className="w-8 h-8 text-ciudad-blue" strokeWidth={1.5} />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">{job.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{job.company_name}</p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <Badge variant="secondary" className="rounded-full text-xs gap-1">
                <MapPin className="w-3 h-3" /> {job.location}
              </Badge>
              {job.modality && (
                <Badge variant="secondary" className="rounded-full text-xs gap-1">
                  <Briefcase className="w-3 h-3" /> {modalityLabels[job.modality]}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {(job.salary_min || job.salary_max) && (
          <div className="bg-ciudad-green-light rounded-xl p-4 mb-6">
            <p className="text-sm text-muted-foreground">Rango salarial</p>
            <p className="text-lg font-bold text-ciudad-green">
              {job.currency || 'S/.'} {job.salary_min?.toLocaleString()}{job.salary_max ? ` - ${job.salary_max.toLocaleString()}` : ''} /mes
            </p>
          </div>
        )}

        <div className="space-y-6">
          {job.description && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2">Descripción</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{job.description}</p>
            </div>
          )}
          {job.requirements && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2">Requisitos</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{job.requirements}</p>
            </div>
          )}
          {job.benefits && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2">Beneficios</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{job.benefits}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-8 pt-6 border-t border-border">
          {applied ? (
            <Button disabled className="flex-1 h-12 rounded-xl bg-ciudad-green text-white gap-2">
              <CheckCircle className="w-5 h-5" /> Postulación enviada
            </Button>
          ) : (
            <Button
              onClick={() => setShowDialog(true)}
              className="flex-1 h-12 rounded-xl bg-ciudad-blue hover:bg-[#0E254A] text-white text-sm font-semibold"
            >
              Postular ahora
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-xl"
            onClick={handleSave}
            disabled={saved}
          >
            <Bookmark className={`w-5 h-5 ${saved ? 'fill-ciudad-blue text-ciudad-blue' : ''}`} />
          </Button>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Postular a {job.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{job.company_name}</p>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Carta de presentación (opcional)</label>
              <Textarea
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                placeholder="Cuéntale a la empresa por qué eres el candidato ideal..."
                rows={4}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button
              onClick={handleApply}
              disabled={applying}
              className="rounded-xl bg-ciudad-blue hover:bg-[#0E254A] text-white"
            >
              {applying ? 'Enviando...' : 'Enviar postulación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}