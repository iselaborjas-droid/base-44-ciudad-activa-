import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useOutletContext } from 'react-router-dom';
import { Briefcase, Users, UserCheck, CalendarCheck, CircleSlash, TrendingUp, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

import EmpresaHeader from '@/components/empresa/EmpresaHeader';
import DashboardKpi from '@/components/empresa/DashboardKpi';
import DashboardActivity from '@/components/empresa/DashboardActivity';
import DashboardQuickActions from '@/components/empresa/DashboardQuickActions';
import DashboardCompanyPanel from '@/components/empresa/DashboardCompanyPanel';
import DashboardReminders from '@/components/empresa/DashboardReminders';
import DashboardMiniCalendar from '@/components/empresa/DashboardMiniCalendar';
import DashboardQuickStats from '@/components/empresa/DashboardQuickStats';

const pieColors = ['#183D7C', '#F57C21', '#0FA36B', '#94a3b8'];

export default function EmpresaDashboard() {
  const { user } = useAuth();
  const { company } = useOutletContext() || {};
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalJobs: 0,
    applications: 0,
    courses: 0,
    events: 0,
    promotions: 0,
    hired: 0,
    interviews: 0,
    closedJobs: 0,
    monthApps: 0,
    hireRate: 0,
  });
  const [activities, setActivities] = useState([]);
  const [jobChartData, setJobChartData] = useState([]);
  const [statusChartData, setStatusChartData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const [jobs, apps, courses, evts, products] = await Promise.all([
        base44.entities.Job.filter({ created_by_id: user.id }, '-created_date', 50),
        base44.entities.Application.list('-created_date', 30),
        base44.entities.Course.filter({ created_by_id: user.id }, '-created_date', 50),
        base44.entities.Event.filter({ created_by_id: user.id }, '-created_date', 50),
        base44.entities.Product.filter({ created_by_id: user.id }, '-created_date', 50),
      ]);

      const activeJobs = jobs.filter(j => j.status === 'activo');
      const closedJobs = jobs.filter(j => j.status === 'cerrado');
      const hired = apps.filter(a => a.status === 'aceptada');
      const interviews = apps.filter(a => a.status === 'entrevista');

      const now = new Date();
      const monthApps = apps.filter(a => a.created_date && new Date(a.created_date).getMonth() === now.getMonth()).length;
      const hireRate = apps.length > 0 ? Math.round((hired.length / apps.length) * 100) : 0;

      // Build activity feed
      const acts = [];
      jobs.slice(0, 3).forEach(j => {
        acts.push({
          id: j.id,
          type: 'job',
          iconEl: Briefcase,
          title: `Publicaste una vacante: ${j.title}`,
          subtitle: j.location || 'Sin ubicación',
          status: j.status,
          statusColor: j.status === 'activo' ? 'bg-ciudad-green-light text-ciudad-green' : 'bg-secondary text-muted-foreground',
          time: j.created_date ? formatDistanceToNow(new Date(j.created_date), { addSuffix: true, locale: es }) : '',
          date: j.created_date,
        });
      });
      apps.slice(0, 4).forEach(a => {
        const type = a.status === 'aceptada' ? 'hire' : a.status === 'entrevista' ? 'interview' : 'application';
        const iconEl = type === 'hire' ? UserCheck : type === 'interview' ? CalendarCheck : Users;
        acts.push({
          id: a.id,
          type,
          iconEl,
          title: type === 'hire' ? `Contrataste un postulante para ${a.job_title}` : type === 'interview' ? `Entrevista programada: ${a.job_title}` : `Nueva postulación: ${a.job_title}`,
          subtitle: a.company_name || '',
          status: a.status,
          statusColor: a.status === 'aceptada' ? 'bg-ciudad-green-light text-ciudad-green' : a.status === 'entrevista' ? 'bg-ciudad-orange-light text-ciudad-orange' : 'bg-secondary text-muted-foreground',
          time: a.created_date ? formatDistanceToNow(new Date(a.created_date), { addSuffix: true, locale: es }) : '',
          date: a.created_date,
        });
      });
      acts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      setActivities(acts.slice(0, 7));

      setJobChartData(jobs.slice(0, 6).map(j => ({
        name: j.title?.substring(0, 12) + '...',
        postulantes: apps.filter(a => a.job_id === j.id).length,
      })));

      const statusCounts = {
        activo: activeJobs.length,
        pausado: jobs.filter(j => j.status === 'pausado').length,
        cerrado: closedJobs.length,
      };
      setStatusChartData([
        { name: 'Activas', value: statusCounts.activo },
        { name: 'Pausadas', value: statusCounts.pausado },
        { name: 'Cerradas', value: statusCounts.cerrado },
      ].filter(d => d.value > 0));

      // Trend data (last 7 days)
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayApps = apps.filter(a => a.created_date && new Date(a.created_date).toDateString() === d.toDateString()).length;
        days.push({ day: d.toLocaleDateString('es-PE', { weekday: 'short' }), postulaciones: dayApps });
      }
      setTrendData(days);
      setEvents(evts);

      setStats({
        activeJobs: activeJobs.length,
        totalJobs: jobs.length,
        applications: apps.length,
        courses: courses.length,
        events: evts.length,
        promotions: products.length,
        hired: hired.length,
        interviews: interviews.length,
        closedJobs: closedJobs.length,
        monthApps,
        hireRate,
      });
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-muted border-t-ciudad-blue rounded-full animate-spin" />
      </div>
    );
  }

  const kpiCards = [
    { label: 'Vacantes activas', value: stats.activeJobs, icon: Briefcase, color: 'blue', variation: 12, growth: true },
    { label: 'Postulaciones recibidas', value: stats.applications, icon: Users, color: 'orange', variation: 8, growth: true },
    { label: 'Trabajadores contratados', value: stats.hired, icon: UserCheck, color: 'green', variation: 5, growth: true },
    { label: 'Entrevistas programadas', value: stats.interviews, icon: CalendarCheck, color: 'orange', variation: 0, growth: null },
    { label: 'Vacantes cerradas', value: stats.closedJobs, icon: CircleSlash, color: 'dark', variation: 0, growth: null },
  ];

  return (
    <div>
      <EmpresaHeader user={user} company={company} />

      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {kpiCards.map((card, i) => (
            <DashboardKpi key={i} {...card} index={i} />
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trend Chart */}
            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">Postulaciones (últimos 7 días)</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Tendencia de recepción</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-ciudad-blue-light flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-ciudad-blue" strokeWidth={1.8} />
                </div>
              </div>
              {trendData.some(d => d.postulaciones > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#183D7C" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#183D7C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip cursor={{ stroke: '#183D7C', strokeWidth: 1 }} contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                    <Area type="monotone" dataKey="postulaciones" stroke="#183D7C" strokeWidth={2} fill="url(#colorApps)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex flex-col items-center justify-center text-center">
                  <BarChart3 className="w-8 h-8 text-muted-foreground/40 mb-2" strokeWidth={1.5} />
                  <p className="text-sm text-muted-foreground">Aún no hay postulaciones esta semana</p>
                </div>
              )}
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-ciudad-orange-light flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-ciudad-orange" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Postulantes por vacante</h3>
                </div>
                {jobChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={jobChartData}>
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" height={50} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                      <Bar dataKey="postulantes" fill="#183D7C" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">
                    Aún no tienes vacantes publicadas
                  </div>
                )}
              </div>

              {/* Pie Chart */}
              <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-ciudad-green-light flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-ciudad-green" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Estado de vacantes</h3>
                </div>
                {statusChartData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                          {statusChartData.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-3 justify-center mt-2">
                      {statusChartData.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: pieColors[i] }} />
                          <span className="text-muted-foreground">{d.name}: {d.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">
                    Sin datos para mostrar
                  </div>
                )}
              </div>
            </div>

            {/* Activity */}
            <DashboardActivity activities={activities} />

            {/* Quick Actions */}
            <DashboardQuickActions />
          </div>

          {/* Right Column - Side Panel */}
          <div className="space-y-6">
            <DashboardCompanyPanel company={company} user={user} activeJobs={stats.activeJobs} totalWorkers={stats.hired} />

            <DashboardQuickStats
              stats={{
                hireRate: stats.hireRate,
                avgTime: 14,
                monthApps: stats.monthApps,
                partners: 3,
                level: 'Activo',
              }}
            />

            <DashboardReminders interviews={stats.interviews} expiringJobs={0} />

            <DashboardMiniCalendar events={events} />
          </div>
        </div>
      </div>
    </div>
  );
}