import React, { useState } from 'react';
import { ExerciseDbEntry, MuscleGroup, MovementPattern } from '../types';
import { MUSCLE_GROUPS_LIST, MOVEMENT_PATTERNS_LIST } from '../data/mockData';
import { 
  Database, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  X, 
  Play, 
  Check, 
  Layers, 
  Dumbbell,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface ExerciseDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseDb: ExerciseDbEntry[];
  onAddExercise: (exercise: ExerciseDbEntry) => void;
  onUpdateExercise: (exercise: ExerciseDbEntry) => void;
  onDeleteExercise: (id: string) => void;
}

export const ExerciseDatabaseModal: React.FC<ExerciseDatabaseModalProps> = ({
  isOpen,
  onClose,
  exerciseDb,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedPattern, setSelectedPattern] = useState<string>('all');
  
  // Form State for Adding / Editing
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('Pecho');
  const [movementPattern, setMovementPattern] = useState<MovementPattern>('Empuje Horizontal');
  const [equipment, setEquipment] = useState<ExerciseDbEntry['equipment']>('Barra');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [cuesText, setCuesText] = useState<string>('');

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setMuscleGroup('Pecho');
    setMovementPattern('Empuje Horizontal');
    setEquipment('Barra');
    setVideoUrl('');
    setCuesText('');
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (ex: ExerciseDbEntry) => {
    setEditingId(ex.id);
    setName(ex.name);
    setMuscleGroup(ex.muscleGroup);
    setMovementPattern(ex.movementPattern);
    setEquipment(ex.equipment);
    setVideoUrl(ex.videoUrl);
    setCuesText(ex.coachCues.join('\n'));
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cuesArray = cuesText
      .split('\n')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const formattedVideoUrl = videoUrl.trim() 
      ? (videoUrl.includes('watch?v=') ? videoUrl.replace('watch?v=', 'embed/') : videoUrl)
      : 'https://www.youtube.com/embed/rT7DgCr-3pg';

    if (editingId) {
      onUpdateExercise({
        id: editingId,
        name: name.trim(),
        muscleGroup,
        movementPattern,
        equipment,
        videoUrl: formattedVideoUrl,
        coachCues: cuesArray.length > 0 ? cuesArray : ['Control excéntrico', 'Buena postura'],
        isCustom: true
      });
    } else {
      const newEntry: ExerciseDbEntry = {
        id: `db-ex-${Date.now()}`,
        name: name.trim(),
        muscleGroup,
        movementPattern,
        equipment,
        videoUrl: formattedVideoUrl,
        coachCues: cuesArray.length > 0 ? cuesArray : ['Control excéntrico', 'Buena postura'],
        isCustom: true
      };
      onAddExercise(newEntry);
    }

    resetForm();
  };

  const filtered = exerciseDb.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.movementPattern.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMuscle = selectedMuscle === 'all' || ex.muscleGroup === selectedMuscle;
    const matchesPattern = selectedPattern === 'all' || ex.movementPattern === selectedPattern;

    return matchesSearch && matchesMuscle && matchesPattern;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#f2f2f2]">
        
        {/* Modal Header */}
        <div className="p-4 bg-[#1c1c21] border-b border-[rgba(242,242,242,0.1)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#141417] flex items-center justify-center text-[#ff6b00] border border-[rgba(242,242,242,0.1)]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#f2f2f2] flex items-center gap-2">
                <span>Base de Datos de Ejercicios</span>
                <span className="text-[10px] bg-[rgba(255,107,0,0.15)] text-[#ff6b00] font-bold px-2 py-0.5 rounded-full border border-[rgba(255,107,0,0.3)]">
                  Coach
                </span>
              </h2>
              <p className="text-xs text-[rgba(242,242,242,0.5)]">
                Gestiona y agrega ejercicios con sus patrones de movimiento y videos de técnica.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isFormOpen && (
              <button
                onClick={handleOpenAdd}
                className="px-3 py-1.5 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Ejercicio</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[#141417] hover:bg-[#26262b] text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2] transition-colors cursor-pointer border border-[rgba(242,242,242,0.1)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
          
          {isFormOpen && (
            <form onSubmit={handleSubmit} className="p-4 bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[rgba(242,242,242,0.1)] pb-2">
                <h3 className="text-xs font-bold uppercase text-[#f2f2f2] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#ff6b00]" />
                  <span>{editingId ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}</span>
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2] font-medium cursor-pointer"
                >
                  ✕ Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-[rgba(242,242,242,0.6)] mb-1">
                    Nombre del Ejercicio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Press Banca Plano con Pausa, Sentadilla Búlgara..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-xl font-normal text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
                  />
                </div>

                {/* Muscle Group */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[rgba(242,242,242,0.6)] mb-1">
                    Grupo Muscular Principal *
                  </label>
                  <select
                    value={muscleGroup}
                    onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}
                    className="w-full p-2 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-xl font-normal text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
                  >
                    {MUSCLE_GROUPS_LIST.map((m) => (
                      <option key={m} value={m} className="bg-[#1c1c21] text-[#f2f2f2]">
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Movement Pattern */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[rgba(242,242,242,0.6)] mb-1">
                    Patrón de Movimiento *
                  </label>
                  <select
                    value={movementPattern}
                    onChange={(e) => setMovementPattern(e.target.value as MovementPattern)}
                    className="w-full p-2 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-xl font-normal text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
                  >
                    {MOVEMENT_PATTERNS_LIST.map((p) => (
                      <option key={p} value={p} className="bg-[#1c1c21] text-[#f2f2f2]">
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Equipment */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[rgba(242,242,242,0.6)] mb-1">
                    Equipamiento
                  </label>
                  <select
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value as ExerciseDbEntry['equipment'])}
                    className="w-full p-2 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-xl font-normal text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
                  >
                    {['Barra', 'Mancuernas', 'Polea', 'Máquina', 'Peso Corporal', 'Kettlebell'].map((eq) => (
                      <option key={eq} value={eq} className="bg-[#1c1c21] text-[#f2f2f2]">
                        {eq}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[rgba(242,242,242,0.6)] mb-1">
                    Enlace de Video de Técnica (YouTube Embed / Link)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/embed/... o https://youtu.be/..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full p-2 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-xl text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
                  />
                </div>

                {/* Coach Biomechanical Cues */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-[rgba(242,242,242,0.6)] mb-1 flex items-center justify-between">
                    <span>Indicaciones / Cues Técnicas (1 por línea)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Retracción escapular firme&#10;Control de bajada en 3 segundos&#10;Pausa isométrica al fondo"
                    value={cuesText}
                    onChange={(e) => setCuesText(e.target.value)}
                    className="w-full p-2 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-xl text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none font-sans"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[rgba(242,242,242,0.1)]">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3.5 py-1.5 bg-[#141417] hover:bg-[#26262b] text-[#f2f2f2] rounded-xl text-xs font-medium cursor-pointer border border-[rgba(242,242,242,0.1)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {editingId ? 'Guardar Cambios' : 'Guardar en Base de Datos'}
                </button>
              </div>
            </form>
          )}

          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Buscar por nombre, músculo, patrón o equipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl text-xs text-[#f2f2f2] placeholder-[rgba(242,242,242,0.4)] focus:border-[#ff6b00] focus:outline-none"
              />
              <Search className="w-4 h-4 text-[rgba(242,242,242,0.4)] absolute left-3 top-2.5 pointer-events-none" />
            </div>

            {/* Filter Muscle */}
            <div className="w-full sm:w-auto">
              <select
                value={selectedMuscle}
                onChange={(e) => setSelectedMuscle(e.target.value)}
                className="w-full p-2 bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl text-xs font-medium text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
              >
                <option value="all" className="bg-[#1c1c21] text-[#f2f2f2]">Todos los Músculos</option>
                {MUSCLE_GROUPS_LIST.map((m) => (
                  <option key={m} value={m} className="bg-[#1c1c21] text-[#f2f2f2]">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Pattern */}
            <div className="w-full sm:w-auto">
              <select
                value={selectedPattern}
                onChange={(e) => setSelectedPattern(e.target.value)}
                className="w-full p-2 bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl text-xs font-medium text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
              >
                <option value="all" className="bg-[#1c1c21] text-[#f2f2f2]">Todos los Patrones</option>
                {MOVEMENT_PATTERNS_LIST.map((p) => (
                  <option key={p} value={p} className="bg-[#1c1c21] text-[#f2f2f2]">
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Exercises Count Header */}
          <div className="flex items-center justify-between text-xs text-[rgba(242,242,242,0.5)] border-b border-[rgba(242,242,242,0.1)] pb-2 font-medium">
            <span>
              Mostrando <strong className="text-[#f2f2f2]">{filtered.length}</strong> de <strong className="text-[#f2f2f2]">{exerciseDb.length}</strong> ejercicios
            </span>
            <span className="text-[10px] text-[#ff6b00] font-bold bg-[rgba(255,107,0,0.15)] px-2 py-0.5 rounded-full border border-[rgba(255,107,0,0.3)]">
              {exerciseDb.filter((e) => e.isCustom).length} Personalizados por Coach
            </span>
          </div>

          {/* Exercises Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.length === 0 ? (
              <div className="md:col-span-2 text-center py-12 text-[rgba(242,242,242,0.4)] text-xs">
                No se encontraron ejercicios con los filtros seleccionados.
              </div>
            ) : (
              filtered.map((ex) => (
                <div
                  key={ex.id || ex.name}
                  className="p-3.5 bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] hover:border-[rgba(242,242,242,0.2)] transition-all flex flex-col justify-between gap-2.5 shadow-xs group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#141417] text-[#ff6b00] flex items-center justify-center shrink-0 border border-[rgba(242,242,242,0.1)] mt-0.5">
                        <Dumbbell className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-[#f2f2f2] text-xs truncate group-hover:text-[#ff6b00] transition-colors">
                          {ex.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
                          <span className="bg-[#141417] text-[#ff6b00] font-bold px-1.5 py-0.2 rounded border border-[rgba(242,242,242,0.1)]">
                            {ex.muscleGroup}
                          </span>
                          <span className="text-[rgba(242,242,242,0.6)]">
                            {ex.movementPattern}
                          </span>
                          <span className="text-[rgba(242,242,242,0.4)]">
                            • {ex.equipment}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(ex)}
                        className="p-1 rounded-lg text-[rgba(242,242,242,0.4)] hover:text-[#f2f2f2] hover:bg-[#141417] transition-colors cursor-pointer"
                        title="Editar ejercicio"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {ex.isCustom && (
                        <button
                          onClick={() => onDeleteExercise(ex.id)}
                          className="p-1 rounded-lg text-[rgba(242,242,242,0.4)] hover:text-[#ff6b00] hover:bg-[#141417] transition-colors cursor-pointer"
                          title="Eliminar ejercicio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Coach Cues & Video Tag */}
                  <div className="pt-2 border-t border-[rgba(242,242,242,0.1)] flex items-center justify-between text-[10px] text-[rgba(242,242,242,0.5)]">
                    <span className="truncate max-w-[240px]">
                      💡 {ex.coachCues?.[0] || 'Técnica controlada'}
                    </span>
                    {ex.videoUrl && (
                      <a
                        href={ex.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#ff6b00] hover:text-[#ffffff] font-bold bg-[rgba(255,107,0,0.15)] px-1.5 py-0.5 rounded border border-[rgba(255,107,0,0.3)]"
                      >
                        <Play className="w-3 h-3 fill-[#ff6b00]" />
                        <span>Ver Video</span>
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
