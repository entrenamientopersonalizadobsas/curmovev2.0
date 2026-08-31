import React, { useState } from 'react';
import { ExerciseItem, ViewMode } from '../types';
import { 
  Play, 
  Video, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  UploadCloud, 
  ExternalLink,
  Edit3,
  Lightbulb,
  Sparkles
} from 'lucide-react';

interface VideoSectionProps {
  exercise?: ExerciseItem;
  viewMode: ViewMode;
  onUpdateExercise: (exercise: ExerciseItem) => void;
}

export const VideoSection: React.FC<VideoSectionProps> = ({
  exercise,
  viewMode,
  onUpdateExercise
}) => {
  const [isEditingVideoUrl, setIsEditingVideoUrl] = useState<boolean>(false);
  const [videoUrlInput, setVideoUrlInput] = useState<string>('');
  const [newCue, setNewCue] = useState<string>('');
  const [studentVideoInput, setStudentVideoInput] = useState<string>('');
  const [showSubmittedToast, setShowSubmittedToast] = useState<boolean>(false);

  React.useEffect(() => {
    if (exercise) {
      setVideoUrlInput(exercise.videoUrl || '');
      setStudentVideoInput(exercise.studentVideoSubmissionUrl || '');
    }
  }, [exercise]);

  if (!exercise) {
    return (
      <div id="column-video-section" className="bg-[#141417] rounded-xl border border-[rgba(242,242,242,0.1)] shadow-xs flex flex-col h-full items-center justify-center p-8 text-center text-[rgba(242,242,242,0.5)]">
        <div className="w-10 h-10 rounded bg-[#1c1c21] flex items-center justify-center text-[#ff6b00] mb-3 border border-[rgba(242,242,242,0.1)]">
          <Video className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-display font-bold uppercase tracking-wider text-[#f2f2f2]">Demostración Audiovisual</h4>
        <p className="text-[11px] text-[rgba(242,242,242,0.5)] mt-1 max-w-xs">
          Selecciona un ejercicio para ver su ejecución técnica, indicaciones biomecánicas y videos de corrección.
        </p>
      </div>
    );
  }

  // Convert regular YouTube link into embed url if needed
  const getEmbedUrl = (url: string) => {
    if (!url) return 'https://www.youtube.com/embed/rT7DgCr-3pg';
    if (url.includes('youtube.com/embed/')) return url;
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('watch?v=')) {
      const id = url.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  const handleSaveVideoUrl = () => {
    onUpdateExercise({
      ...exercise,
      videoUrl: videoUrlInput
    });
    setIsEditingVideoUrl(false);
  };

  const handleAddCue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCue.trim()) return;
    const cues = exercise.coachCues || [];
    onUpdateExercise({
      ...exercise,
      coachCues: [...cues, newCue.trim()]
    });
    setNewCue('');
  };

  const handleRemoveCue = (index: number) => {
    const cues = (exercise.coachCues || []).filter((_, i) => i !== index);
    onUpdateExercise({
      ...exercise,
      coachCues: cues
    });
  };

  const handleSubmitStudentVideo = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateExercise({
      ...exercise,
      studentVideoSubmissionUrl: studentVideoInput
    });
    setShowSubmittedToast(true);
    setTimeout(() => setShowSubmittedToast(false), 3000);
  };

  const cues = exercise.coachCues || [
    'Retracción escapular antes de iniciar el descenso',
    'Control excéntrico continuo en 3 segundos',
    'Pausa isométrica de 1 segundo en el estiramiento máximo'
  ];

  return (
    <div id="column-video-section" className="bg-[#141417] rounded-xl border border-[rgba(242,242,242,0.1)] shadow-xs flex flex-col h-full overflow-hidden text-[#f2f2f2]">
      
      {/* Column Header */}
      <div className="px-4 py-3 border-b border-[rgba(242,242,242,0.1)] flex justify-between items-center bg-[#141417] shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-bold text-[#f2f2f2] text-xs uppercase tracking-wider flex items-center gap-2">
            <span>Material Audiovisual</span>
          </h3>
          <span className="bg-[#1c1c21] text-[#ff6b00] font-mono-code text-[9px] font-bold px-2 py-0.5 rounded border border-[#ff6b00]">
            TÉCNICA
          </span>
        </div>

        {viewMode === 'trainer' && (
          <button
            onClick={() => setIsEditingVideoUrl(!isEditingVideoUrl)}
            className="text-xs font-mono-code font-medium text-[rgba(242,242,242,0.5)] hover:text-[#ff6b00] flex items-center gap-1 cursor-pointer transition-colors"
            title="Cambiar Video"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingVideoUrl ? 'CERRAR' : 'EDITAR LINK'}</span>
          </button>
        )}
      </div>

      {/* Video Content & Cues */}
      <div className="p-4 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
        
        {/* Trainer Edit Video Input */}
        {isEditingVideoUrl && viewMode === 'trainer' && (
          <div className="p-3 bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-lg space-y-2 text-xs">
            <label className="block text-[rgba(242,242,242,0.5)] font-mono-code font-bold uppercase text-[10px]">
              URL del Video (YouTube o Vimeo)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                className="flex-1 p-1.5 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg text-[#f2f2f2] text-xs focus:border-[#ff6b00] focus:outline-none"
              />
              <button
                onClick={handleSaveVideoUrl}
                className="px-3 py-1.5 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] font-bold rounded-lg text-xs cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* Embedded Video Player */}
        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] shadow-xs">
          <iframe
            src={getEmbedUrl(exercise.videoUrl)}
            title={`Técnica ${exercise.name}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Coach Technique Cues */}
        <div className="bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-display font-bold text-[#f2f2f2] uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-[#ff6b00]" />
              <span>Puntos Clave del Coach</span>
            </h4>
          </div>

          <ul className="space-y-1.5 text-xs text-[#f2f2f2]">
            {cues.map((cue, idx) => (
              <li key={idx} className="flex items-start justify-between gap-2 group">
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b00] mt-1.5 shrink-0" />
                  <span className="font-normal text-[#f2f2f2]">{cue}</span>
                </div>
                {viewMode === 'trainer' && (
                  <button
                    onClick={() => handleRemoveCue(idx)}
                    className="opacity-0 group-hover:opacity-100 text-[rgba(242,242,242,0.4)] hover:text-[#ff5555] p-0.5 transition-opacity cursor-pointer"
                    title="Eliminar punto clave"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Trainer Add Cue Form */}
          {viewMode === 'trainer' && (
            <form onSubmit={handleAddCue} className="flex gap-2 pt-2 border-t border-[rgba(242,242,242,0.1)]">
              <input
                type="text"
                placeholder="Añadir indicación técnica..."
                value={newCue}
                onChange={(e) => setNewCue(e.target.value)}
                className="flex-1 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg px-2.5 py-1 text-xs text-[#f2f2f2] placeholder-[rgba(242,242,242,0.4)] focus:outline-none focus:border-[#ff6b00]"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-[#1c1c21] hover:bg-[#26262b] text-[#ff6b00] font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer border border-[#ff6b00]"
              >
                <Plus className="w-3 h-3 text-[#ff6b00]" />
                <span>Añadir</span>
              </button>
            </form>
          )}
        </div>

        {/* Student Video Upload / Feedback submission */}
        <div className="bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-[rgba(242,242,242,0.5)] flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5 text-[#ff6b00]" />
              <span>Feedback & Video del Alumno</span>
            </span>
            {exercise.studentVideoSubmissionUrl && (
              <span className="text-[9px] font-mono-code bg-[#141417] text-[#ff6b00] font-bold px-1.5 py-0.2 rounded border border-[#ff6b00]">
                ENVIADO
              </span>
            )}
          </div>

          <form onSubmit={handleSubmitStudentVideo} className="space-y-2 text-xs">
            <p className="text-[11px] text-[rgba(242,242,242,0.5)]">
              Pega el enlace de tu serie (Google Drive, YouTube oculto, Instagram o Dropbox) para revisión técnica.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://drive.google.com/..."
                value={studentVideoInput}
                onChange={(e) => setStudentVideoInput(e.target.value)}
                className="flex-1 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg p-1.5 text-[#f2f2f2] text-xs focus:border-[#ff6b00] focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] font-bold rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
              >
                Guardar
              </button>
            </div>
            {showSubmittedToast && (
              <p className="text-[11px] text-[#ff6b00] font-medium flex items-center gap-1 font-mono-code">
                <CheckCircle2 className="w-3 h-3 text-[#ff6b00]" />
                <span>Enlace de video guardado correctamente para revisión del coach.</span>
              </p>
            )}
          </form>
        </div>

      </div>

    </div>
  );
};
