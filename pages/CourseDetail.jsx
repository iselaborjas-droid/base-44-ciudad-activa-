import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Clock, Award, Users, Monitor, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const modalityLabels = { presencial: 'Presencial', virtual: 'Virtual', hibrido: 'Híbrido' };

export default function CourseDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await base44.entities.Course.get(id);
      setCourse(data);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    await base44.entities.Enrollment.create({
      course_id: course.id,
      course_title: course.title,
    });
    setEnrolled(true);
    setEnrolling(false);
    toast({ title: '¡Inscripción exitosa!', description: 'Ya puedes acceder al curso.' });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-muted border-t-ciudad-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">Curso no encontrado</p>
        <Link to="/courses" className="text-ciudad-blue text-sm mt-2 inline-block">← Volver a cursos</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
      <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver a cursos
      </Link>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="h-48 md:h-64 bg-gradient-to-br from-[#183D7C] to-[#4A6DA8] relative">
          {course.image_url ? (
            <img src={course.image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Award className="w-16 h-16 text-white/20" />
            </div>
          )}
          <div className="absolute top-4 left-4 flex gap-2">
            {course.is_free ? (
              <Badge className="bg-ciudad-green text-white rounded-full">Gratuito</Badge>
            ) : (
              <Badge className="bg-ciudad-orange text-white rounded-full">S/. {course.price}</Badge>
            )}
            {course.has_certificate && (
              <Badge className="bg-white/20 text-white rounded-full backdrop-blur">Certificado</Badge>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">{course.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">por {course.instructor}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            {course.duration_hours && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" /> {course.duration_hours} horas
              </div>
            )}
            {course.modality && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Monitor className="w-4 h-4" /> {modalityLabels[course.modality]}
              </div>
            )}
            {course.enrolled_count > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" /> {course.enrolled_count} inscritos
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground mb-2">Descripción</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{course.description}</p>
          </div>

          {enrolled ? (
            <Button disabled className="w-full h-12 rounded-xl bg-ciudad-green text-white gap-2">
              <CheckCircle className="w-5 h-5" /> Inscrito
            </Button>
          ) : (
            <Button
              onClick={handleEnroll}
              disabled={enrolling}
              className="w-full h-12 rounded-xl bg-ciudad-blue hover:bg-[#0E254A] text-white text-sm font-semibold"
            >
              {enrolling ? 'Inscribiendo...' : 'Inscribirme al curso'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}