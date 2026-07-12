import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  User, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap, Award,
  Eye, Plus, Clock, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import moment from 'moment';

import ProfileHeader from '@/components/trabajador/ProfileHeader';
import ProfileStats from '@/components/trabajador/ProfileStats';

const districtLabels = { collique: 'Collique', comas: 'Comas', lima_norte: 'Lima Norte', otros: 'Otros' };
const availabilityLabels = { inmediata: 'Inmediata', '1_semana': '1 semana', '2_semanas': '2 semanas', '1_mes': '1 mes' };

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <div className="w-9 h-9 rounded-lg bg-ciudad-blue-light flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-ciudad-blue" strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value || '—'}</p>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, action, children }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-ciudad-blue" strokeWidth={1.8} />}
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="text-center py-8">
      <Icon className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" strokeWidth={1.5} />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

// Deterministic percentage for skill bars
function skillPercent(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  return 60 + Math.abs(hash % 40);
}

export default function Profile() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    const [me, apps, enrs, saved] = await Promise.all([
      base44.auth.me(),
      base44.entities.Application.list('-created_date', 20),
      base44.entities.Enrollment.list('-created_date', 20),
      base44.entities.SavedJob.list('-created_date', 20),
    ]);
    setUser(me);
    setApplications(apps);
    setEnrollments(enrs);
    setSavedJobs(saved);
    let tp = null;
    try {
      const tps = await base44.entities.TalentProfile.filter({ user_id: me.id });
      tp = tps[0] || null;
    } catch {}
    setProfile(tp);
  };

  useEffect(() => {
    async function init() {
      try { await loadAll(); } catch {}
      setLoading(false);
    }
    init();
  }, []);

  const handleAddSkill = () => {
    toast({ title: 'Próximamente', description: 'La edición de habilidades estará disponible pronto' });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-muted border-t-ciudad-blue rounded-full animate-spin" />
      </div>
    );
  }

  const skills = profile?.skills || [];
  const certificates = profile?.certificates || [];
  const completedCourses = enrollments.filter(e => e.completed).length;
  const interviews = applications.filter(a => a.status === 'entrevista').length;

  const checks = [
    { label: 'Nombre', done: !!user?.full_name },
    { label: 'Correo', done: !!user?.email },
    { label: 'Teléfono', done: !!profile?.phone },
    { label: 'Bio', done: !!profile?.bio },
    { label: 'Habilidades', done: skills.length > 0 },
    { label: 'CV', done: !!(profile?.cv_url || user?.cv_url) },
  ];
  const completeness = Math.round((checks.filter(c => c.done).length / checks.length) * 100);

  const p = profile || {};

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      <ProfileHeader
        user={user}
        profile={profile}
        completeness={completeness}
        onProfileUpdated={loadAll}
      />

      <ProfileStats
        applications={applications.length}
        interviews={interviews}
        savedJobs={savedJobs.length}
        completedCourses={completedCourses}
        certificates={certificates.length}
        completeness={completeness}
      />

      <Tabs defaultValue="personal">
        <TabsList className="rounded-xl bg-secondary h-auto w-full flex-wrap gap-1 p-1">
          <TabsTrigger value="personal" className="rounded-lg text-xs gap-1.5 flex-1">
            <User className="w-3.5 h-3.5" /> Personal
          </TabsTrigger>
          <TabsTrigger value="pro" className="rounded-lg text-xs gap-1.5 flex-1">
            <Briefcase className="w-3.5 h-3.5" /> Profesional
          </TabsTrigger>
          <TabsTrigger value="edu" className="rounded-lg text-xs gap-1.5 flex-1">
            <GraduationCap className="w-3.5 h-3.5" /> Formación
          </TabsTrigger>
          <TabsTrigger value="exp" className="rounded-lg text-xs gap-1.5 flex-1">
            <Clock className="w-3.5 h-3.5" /> Experiencia
          </TabsTrigger>
        </TabsList>

        {/* Información Personal */}
        <TabsContent value="personal" className="mt-4">
          <SectionCard title="Información Personal" icon={User}>
            <div className="grid md:grid-cols-2 gap-x-6">
              <InfoRow icon={User} label="Nombre completo" value={user?.full_name} />
              <InfoRow icon={Mail} label="Correo electrónico" value={user?.email} />
              <InfoRow icon={Phone} label="Teléfono" value={p.phone} />
              <InfoRow icon={Calendar} label="Fecha de nacimiento" value={p.birth_date ? moment(p.birth_date).format('DD MMM YYYY') : null} />
              <InfoRow icon={MapPin} label="Distrito" value={p.district ? districtLabels[p.district] : null} />
              <InfoRow icon={Calendar} label="Fecha de registro" value={user?.created_date ? moment(user.created_date).format('DD MMM YYYY') : null} />
            </div>
          </SectionCard>
        </TabsContent>

        {/* Perfil Profesional */}
        <TabsContent value="pro" className="mt-4 space-y-4">
          <SectionCard title="Perfil Profesional" icon={Briefcase}>
            <div className="grid md:grid-cols-2 gap-x-6">
              <InfoRow icon={Briefcase} label="Profesión" value={p.experience_summary?.split(',')[0]} />
              <InfoRow icon={Clock} label="Años de experiencia" value={p.experience_years != null ? `${p.experience_years} año(s)` : null} />
              <InfoRow icon={Calendar} label="Disponibilidad" value={p.availability ? availabilityLabels[p.availability] : null} />
              <InfoRow icon={MapPin} label="Distrito" value={p.district ? districtLabels[p.district] : null} />
            </div>
            {p.bio && (
              <div className="mt-4 p-4 rounded-xl bg-secondary/50">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Resumen profesional</p>
                <p className="text-sm text-foreground">{p.bio}</p>
              </div>
            )}
          </SectionCard>

          {/* Habilidades */}
          <SectionCard
            title="Habilidades"
            icon={Award}
            action={<Button variant="outline" size="sm" className="rounded-xl gap-1 text-xs" onClick={handleAddSkill}><Plus className="w-3 h-3" /> Agregar</Button>}
          >
            {skills.length > 0 ? (
              <div className="space-y-3">
                {skills.map((skill, i) => {
                  const pct = skillPercent(skill);
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{skill}</span>
                        <span className="text-xs font-bold text-ciudad-blue">{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-ciudad-blue to-[#2a5db0]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon={Award} text="Aún no has agregado habilidades" />
            )}
          </SectionCard>
        </TabsContent>

        {/* Formación Académica */}
        <TabsContent value="edu" className="mt-4 space-y-4">
          <SectionCard title="Formación Académica" icon={GraduationCap}>
            {p.education ? (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                <div className="w-9 h-9 rounded-lg bg-ciudad-orange-light flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4 text-ciudad-orange" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{p.education}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Nivel educativo</p>
                </div>
              </div>
            ) : (
              <EmptyState icon={GraduationCap} text="No has registrado tu formación académica" />
            )}
          </SectionCard>

          <SectionCard
            title="Cursos y Certificaciones"
            icon={Award}
            action={<Button variant="outline" size="sm" className="rounded-xl gap-1 text-xs" onClick={() => toast({ title: 'Próximamente' })}><Plus className="w-3 h-3" /> Agregar</Button>}
          >
            {enrollments.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {enrollments.map(enr => (
                  <div key={enr.id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:shadow-sm transition-shadow">
                    <div className="w-10 h-10 rounded-lg bg-ciudad-orange-light flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-ciudad-orange" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{enr.course_title}</p>
                      <p className="text-xs text-muted-foreground">Progreso: {enr.progress || 0}%</p>
                    </div>
                    {enr.completed && enr.certificate_url ? (
                      <a href={enr.certificate_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="rounded-lg gap-1 text-xs">
                          <Eye className="w-3 h-3" /> Ver
                        </Button>
                      </a>
                    ) : enr.completed ? (
                      <Badge className="bg-ciudad-green-light text-ciudad-green text-[10px] rounded-full gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Completado
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] rounded-full">En curso</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Award} text="Aún no te has inscrito en ningún curso" />
            )}
          </SectionCard>
        </TabsContent>

        {/* Experiencia Laboral */}
        <TabsContent value="exp" className="mt-4">
          <SectionCard title="Experiencia Laboral" icon={Clock}>
            {p.experience_summary ? (
              <div className="relative pl-6">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border" />
                <div className="relative">
                  <div className="absolute -left-[18px] top-1 w-3 h-3 rounded-full bg-ciudad-blue border-2 border-card" />
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <p className="text-sm font-semibold text-foreground">Experiencia profesional</p>
                    <p className="text-xs text-muted-foreground mt-1">{p.experience_summary}</p>
                    {p.experience_years != null && (
                      <p className="text-xs text-muted-foreground mt-1">{p.experience_years} año(s) de experiencia</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState icon={Briefcase} text="No has registrado experiencia laboral" />
            )}
          </SectionCard>
        </TabsContent>

      </Tabs>
    </div>
  );
}