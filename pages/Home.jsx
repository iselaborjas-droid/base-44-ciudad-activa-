import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

import HomeHeader from '@/components/trabajador/HomeHeader';
import OpportunityCarousel from '@/components/trabajador/OpportunityCarousel';
import NearbyJobsCard from '@/components/trabajador/NearbyJobsCard';
import LearnSection from '@/components/trabajador/LearnSection';
import HiringCompanies from '@/components/trabajador/HiringCompanies';
import NewsEvents from '@/components/trabajador/NewsEvents';
import { useToast } from '@/components/ui/use-toast';

export default function Home() {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [events, setEvents] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [me, j, c, e, biz, apps, saved] = await Promise.all([
        base44.auth.me(),
        base44.entities.Job.list('-created_date', 10),
        base44.entities.Course.list('-created_date', 6),
        base44.entities.Event.list('-created_date', 4),
        base44.entities.Business.list('-created_date', 20),
        base44.entities.Application.list('-created_date', 10),
        base44.entities.SavedJob.list('-created_date', 20),
      ]);
      setUserData(me);
      setJobs(j);
      setCourses(c);
      setEvents(e);
      setBusinesses(biz);
      setApplications(apps);
      setSavedJobs(saved);
      setLoading(false);
    }
    load();
  }, []);

  const user = userData || authUser;
  const savedJobIds = savedJobs.map(sj => sj.job_id);

  const notifications = [];
  applications.forEach(app => {
    if (app.status === 'entrevista') {
      notifications.push({ type: 'interview', title: `Entrevista: ${app.job_title}`, subtitle: app.company_name });
    } else if (app.status === 'aceptada') {
      notifications.push({ type: 'accepted', title: `¡Aceptado en ${app.job_title}!`, subtitle: app.company_name });
    } else if (app.status === 'revisada') {
      notifications.push({ type: 'review', title: `Postulación revisada: ${app.job_title}`, subtitle: app.company_name });
    }
  });
  if (jobs.length > 0) {
    notifications.push({ type: 'job', title: `${jobs.length} empleos disponibles`, subtitle: 'Nuevas oportunidades para ti' });
  }
  if (events.length > 0) {
    notifications.push({ type: 'event', title: 'Eventos próximos', subtitle: 'No te pierdas las actividades' });
  }

  const handleSaveJob = async (job) => {
    if (savedJobIds.includes(job.id)) return;
    try {
      await base44.entities.SavedJob.create({
        job_id: job.id,
        job_title: job.title,
        company_name: job.company_name,
      });
      setSavedJobs(prev => [...prev, { job_id: job.id, job_title: job.title, company_name: job.company_name }]);
      toast({ title: 'Empleo guardado', description: 'Lo encontrarás en tu perfil' });
    } catch {
      toast({ title: 'Error al guardar', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-muted border-t-ciudad-blue rounded-full animate-spin" />
      </div>
    );
  }

  const hiringBusinessCount = businesses.length > 0 ? businesses.length : jobs.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 md:px-8 md:py-8 space-y-6 md:space-y-8">
      <HomeHeader user={user} notifications={notifications} jobsCount={jobs.length} />
      <OpportunityCarousel jobs={jobs} savedJobIds={savedJobIds} onSave={handleSaveJob} />
      <NearbyJobsCard businessCount={hiringBusinessCount} />
      <LearnSection courses={courses} />
      <HiringCompanies businesses={businesses} jobs={jobs} />
      <NewsEvents events={events} />
    </div>
  );
}