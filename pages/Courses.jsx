import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CourseCard from '@/components/shared/CourseCard';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  useEffect(() => {
    async function load() {
      const data = await base44.entities.Course.list('-created_date', 50);
      setCourses(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = courses.filter(c => {
    if (tab === 'free' && !c.is_free) return false;
    if (tab === 'premium' && c.is_free) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return c.title?.toLowerCase().includes(q) || c.instructor?.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Capacitaciones</h1>
        <p className="text-sm text-muted-foreground mt-1">Desarrolla nuevas habilidades y obtén certificados</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar cursos..."
          className="h-11 pl-10 rounded-xl bg-card"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="rounded-xl bg-secondary h-10">
          <TabsTrigger value="all" className="rounded-lg text-xs">Todos</TabsTrigger>
          <TabsTrigger value="free" className="rounded-lg text-xs">Gratuitos</TabsTrigger>
          <TabsTrigger value="premium" className="rounded-lg text-xs">Premium</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-muted border-t-ciudad-blue rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No se encontraron cursos</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}