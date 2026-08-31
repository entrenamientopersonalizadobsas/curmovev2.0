import React, { useState } from 'react';
import { 
  ExerciseDbEntry, 
  WorkoutTemplate, 
  WorkoutTemplateExercise, 
  MuscleGroup, 
  MovementPattern 
} from '../types';
import { MUSCLE_GROUPS_LIST, MOVEMENT_PATTERNS_LIST } from '../data/mockData';
import { 
  Database, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Play, 
  Sparkles, 
  Dumbbell,
  CheckCircle,
  Layers,
  FileSpreadsheet,
  Zap,
  Clock,
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface ExerciseDatabaseViewProps {
  exerciseDb: ExerciseDbEntry[];
  templates: WorkoutTemplate[];
  onAddExercise: (exercise: ExerciseDbEntry) => void;
  onUpdateExercise: (exercise: ExerciseDbEntry) => void;
  onDeleteExercise: (id: string) => void;
  onAddTemplate: (template: WorkoutTemplate) => void;
  onUpdateTemplate: (template: WorkoutTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onApplyTemplateToCurrentDay?: (template: WorkoutTemplate) => void;
}

export const ExerciseDatabaseView: React.FC<ExerciseDatabaseViewProps> = ({
  exerciseDb,
  templates,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onApplyTemplateToCurrentDay
}) => {
  // Main Sub-Tab: 'exercises' | 'templates'
  const [activeSubTab, setActiveSubTab] = useState<'exercises' | 'templates'>('templates');

  // Exercise Search & Filter
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedPattern, setSelectedPattern] = useState<string>('all');
  
  // Exercise Form State
  const [isExerciseFormOpen, setIsExerciseFormOpen] = useState<boolean>(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [exName, setExName] = useState<string>('');
  const [exMuscle, setExMuscle] = useState<MuscleGroup>('Pecho');
  const [exPattern, setExPattern] = useState<MovementPattern>('Empuje Horizontal');
  const [exEquipment, setExEquipment] = useState<ExerciseDbEntry['equipment']>('Barra');
  const [exVideoUrl, setExVideoUrl] = useState<string>('');
  const [exCuesText, setExCuesText] = useState<string>('');

  // Template Form State
  const [isTemplateFormOpen, setIsTemplateFormOpen] = useState<boolean>(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [tmplName, setTmplName] = useState<string>('');
  const [tmplDescription, setTmplDescription] = useState<string>('');
  const [tmplFocus, setTmplFocus] = useState<string>('Torso / Empuje');
  const [tmplDifficulty, setTmplDifficulty] = useState<WorkoutTemplate['difficulty']>('Intermedio');
  const [tmplExercises, setTmplExercises] = useState<WorkoutTemplateExercise[]>([
    {
      name: 'Press de Banca Plano',
      muscleGroup: 'Pecho',
      movementPattern: 'Empuje Horizontal',
      equipment: 'Barra',
      setsCount: 4,
      targetReps: '8-10',
      targetWeightKg: 75,
      targetRir: 2,
      targetRpe: 8,
      restSeconds: 90
    }
  ]);

  // Reset Exercise Form
  const resetExerciseForm = () => {
    setExName('');
    setExMuscle('Pecho');
    setExPattern('Empuje Horizontal');
    setExEquipment('Barra');
    setExVideoUrl('');
    setExCuesText('');
    setEditingExerciseId(null);
    setIsExerciseFormOpen(false);
  };

  const handleOpenEditExercise = (ex: ExerciseDbEntry) => {
    setEditingExerciseId(ex.id);
    setExName(ex.name);
    setExMuscle(ex.muscleGroup);
    setExPattern(ex.movementPattern);
    setExEquipment(ex.equipment);
    setExVideoUrl(ex.videoUrl);
    setExCuesText(ex.coachCues.join('\n'));
    setIsExerciseFormOpen(true);
  };

  const handleSubmitExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exName.trim()) return;

    const cuesArray = exCuesText
      .split('\n')
      .map((c) => c.trim())
      .filter(Boolean);

    if (editingExerciseId) {
      onUpdateExercise({
        id: editingExerciseId,
        name: exName.trim(),
        muscleGroup: exMuscle,
        movementPattern: exPattern,
        equipment: exEquipment,
        videoUrl: exVideoUrl.trim() || 'https://www.youtube.com/embed/rT7DgCr-3pg',
        coachCues: cuesArray.length > 0 ? cuesArray : ['Control del movimiento'],
        isCustom: true
      });
    } else {
      onAddExercise({
        id: `custom-ex-${Date.now()}`,
        name: exName.trim(),
        muscleGroup: exMuscle,
        movementPattern: exPattern,
        equipment: exEquipment,
        videoUrl: exVideoUrl.trim() || 'https://www.youtube.com/embed/rT7DgCr-3pg',
        coachCues: cuesArray.length > 0 ? cuesArray : ['Control del movimiento'],
        isCustom: true
      });
    }

    resetExerciseForm();
  };

  // Reset Template Form
  const resetTemplateForm = () => {
    setTmplName('');
    setTmplDescription('');
    setTmplFocus('Torso / Empuje');
    setTmplDifficulty('Intermedio');
    setTmplExercises([
      {
        name: 'Press de Banca Plano',
        muscleGroup: 'Pecho',
        movementPattern: 'Empuje Horizontal',
        equipment: 'Barra',
        setsCount: 4,
        targetReps: '8-10',
        targetWeightKg: 75,
        targetRir: 2,
        targetRpe: 8,
        restSeconds: 90
      }
    ]);
    setEditingTemplateId(null);
    setIsTemplateFormOpen(false);
  };

  const handleOpenAddTemplate = () => {
    resetTemplateForm();
    setIsTemplateFormOpen(true);
  };

  const handleOpenEditTemplate = (tmpl: WorkoutTemplate) => {
    setEditingTemplateId(tmpl.id);
    setTmplName(tmpl.name);
    setTmplDescription(tmpl.description);
    setTmplFocus(tmpl.focus);
    setTmplDifficulty(tmpl.difficulty);
    setTmplExercises(tmpl.exercises);
    setIsTemplateFormOpen(true);
  };

  // Add exercise row inside template editor
  const handleAddRowToTemplate = () => {
    setTmplExercises((prev) => [
      ...prev,
      {
        name: 'Sentadilla Trasera con Barra (Squat)',
        muscleGroup: 'Cuádriceps',
        movementPattern: 'Dominante de Rodilla',
        equipment: 'Barra',
        setsCount: 3,
        targetReps: '8-10',
        targetWeightKg: 80,
        targetRir: 2,
        targetRpe: 8,
        restSeconds: 120
      }
    ]);
  };

  const handleRemoveRowFromTemplate = (index: number) => {
    setTmplExercises((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateTemplateExerciseField = (
    index: number,
    field: keyof WorkoutTemplateExercise,
    value: unknown
  ) => {
    setTmplExercises((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: value };
      
      // If name changed, auto-update muscleGroup and movementPattern
      if (field === 'name') {
        const found = exerciseDb.find((e) => e.name === value);
        if (found) {
          current.muscleGroup = found.muscleGroup;
          current.movementPattern = found.movementPattern;
          current.equipment = found.equipment;
          current.videoUrl = found.videoUrl;
          current.coachCues = found.coachCues;
        }
      }
      updated[index] = current;
      return updated;
    });
  };

  const handleSubmitTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmplName.trim()) return;

    if (editingTemplateId) {
      onUpdateTemplate({
        id: editingTemplateId,
        name: tmplName.trim(),
        description: tmplDescription.trim(),
        focus: tmplFocus.trim(),
        difficulty: tmplDifficulty,
        exercises: tmplExercises,
        isCustom: true
      });
    } else {
      onAddTemplate({
        id: `template-${Date.now()}`,
        name: tmplName.trim(),
        description: tmplDescription.trim(),
        focus: tmplFocus.trim(),
        difficulty: tmplDifficulty,
        exercises: tmplExercises,
        isCustom: true
      });
    }

    resetTemplateForm();
  };

  // Filtered exercises for the library view
  const filteredExercises = exerciseDb.filter((ex) => {
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
    <div id="exercise-database-page" className="space-y-5 animate-in fade-in text-[#f2f2f2]">
      
      {/* Top Banner */}
      <div className="bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-2xl p-5 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(242,242,242,0.1)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] flex items-center justify-center text-[#ff6b00]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#f2f2f2] uppercase tracking-tight">
                  BASE DE DATOS & PLANTILLAS DE ENTRENAMIENTO
                </h2>
                <span className="text-[10px] bg-[rgba(255,107,0,0.15)] text-[#ff6b00] font-bold px-2 py-0.5 rounded-full border border-[rgba(255,107,0,0.3)]">
                  SOLO COACH
                </span>
              </div>
              <p className="text-xs text-[rgba(242,242,242,0.5)] font-medium mt-0.5">
                Gestiona plantillas de rutinas y administra la biblioteca biomecánica de ejercicios.
              </p>
            </div>
          </div>

          {/* Sub-Tabs: Plantillas vs Ejercicios */}
          <div className="flex items-center bg-[#0c0c0e] p-1 rounded-xl gap-1 border border-[rgba(242,242,242,0.1)]">
            <button
              onClick={() => {
                setActiveSubTab('templates');
                setIsExerciseFormOpen(false);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'templates'
                  ? 'bg-[#ff6b00] text-[#ffffff] shadow-xs'
                  : 'text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2]'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Plantillas</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                activeSubTab === 'templates' ? 'bg-[#ffffff]/20 text-[#ffffff]' : 'bg-[rgba(255,107,0,0.15)] text-[#ff6b00]'
              }`}>
                {templates.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveSubTab('exercises');
                setIsTemplateFormOpen(false);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'exercises'
                  ? 'bg-[#ff6b00] text-[#ffffff] shadow-xs'
                  : 'text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2]'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Biblioteca</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                activeSubTab === 'exercises' ? 'bg-[#ffffff]/20 text-[#ffffff]' : 'bg-[rgba(255,107,0,0.15)] text-[#ff6b00]'
              }`}>
                {exerciseDb.length}
              </span>
            </button>
          </div>
        </div>

        {/* Action Button for current active sub-tab */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[rgba(242,242,242,0.5)]">
            {activeSubTab === 'templates' 
              ? 'Plantillas preconfiguradas y personalizadas listas para aplicar a cualquier alumno.'
              : 'Lista de ejercicios con patrones de movimiento, videos de técnica y cues para el atleta.'}
          </span>

          {activeSubTab === 'templates' && !isTemplateFormOpen && (
            <button
              onClick={handleOpenAddTemplate}
              className="px-3.5 py-1.5 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nueva Plantilla</span>
            </button>
          )}

          {activeSubTab === 'exercises' && !isExerciseFormOpen && (
            <button
              onClick={() => {
                resetExerciseForm();
                setIsExerciseFormOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Agregar Ejercicio Manual</span>
            </button>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 1. PLANTILLAS DE ENTRENAMIENTO (TEMPLATES) */}
      {/* ========================================================================= */}
      {activeSubTab === 'templates' && (
        <div className="space-y-4">
          
          {/* Builder Form to Create / Edit Template */}
          {isTemplateFormOpen && (
            <form onSubmit={handleSubmitTemplate} className="bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-2xl p-5 shadow-md space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-[rgba(242,242,242,0.1)] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ff6b00]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#f2f2f2]">
                    {editingTemplateId ? 'Editar Plantilla de Entrenamiento' : 'Armar Nueva Plantilla de Entrenamiento'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={resetTemplateForm}
                  className="text-xs text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2] font-medium cursor-pointer"
                >
                  ✕ Cancelar
                </button>
              </div>

              {/* Template Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[rgba(242,242,242,0.6)] mb-1">
                    Nombre de la Plantilla *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Torso: Hipertrofia & Empuje..."
                    value={tmplName}
                    onChange={(e) => setTmplName(e.target.value)}
                    className="w-full p-2 bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl font-medium text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[rgba(242,242,242,0.6)] mb-1">
                    Enfoque / Grupo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Torso / Empuje, Pierna Completa..."
                    value={tmplFocus}
                    onChange={(e) => setTmplFocus(e.target.value)}
                    className="w-full p-2 bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl font-medium text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[rgba(242,242,242,0.6)] mb-1">
                    Nivel de Dificultad
                  </label>
                  <select
                    value={tmplDifficulty}
                    onChange={(e) => setTmplDifficulty(e.target.value as WorkoutTemplate['difficulty'])}
                    className="w-full p-2 bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl font-medium text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
                  >
                    <option value="Principiante" className="bg-[#1c1c21] text-[#f2f2f2]">Principiante</option>
                    <option value="Intermedio" className="bg-[#1c1c21] text-[#f2f2f2]">Intermedio</option>
                    <option value="Avanzado" className="bg-[#1c1c21] text-[#f2f2f2]">Avanzado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[rgba(242,242,242,0.6)] mb-1">
                  Descripción / Instrucciones
                </label>
                <input
                  type="text"
                  placeholder="Ej. Rutina enfocada en sobrecarga progresiva en rango 8-10..."
                  value={tmplDescription}
                  onChange={(e) => setTmplDescription(e.target.value)}
                  className="w-full p-2 bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl text-xs text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
                />
              </div>

              {/* Template Exercises Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#f2f2f2]">
                    Ejercicios de la Plantilla ({tmplExercises.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddRowToTemplate}
                    className="px-2.5 py-1 bg-[#1c1c21] hover:bg-[#26262b] text-[#f2f2f2] border border-[rgba(242,242,242,0.1)] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-[#ff6b00]" />
                    <span>Agregar Fila</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] border-b border-[rgba(242,242,242,0.1)]">
                        <th className="pb-2 w-8">#</th>
                        <th className="pb-2 min-w-[200px]">Ejercicio</th>
                        <th className="pb-2 w-28">Grupo</th>
                        <th className="pb-2 w-32">Patrón</th>
                        <th className="pb-2 text-center w-16">Series</th>
                        <th className="pb-2 text-center w-20">Repes</th>
                        <th className="pb-2 text-center w-20">Kg Obj.</th>
                        <th className="pb-2 text-center w-16">RIR</th>
                        <th className="pb-2 text-center w-16">RPE</th>
                        <th className="pb-2 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(242,242,242,0.1)] font-medium text-[rgba(242,242,242,0.7)]">
                      {tmplExercises.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#1c1c21]">
                          <td className="py-2 text-[rgba(242,242,242,0.4)] font-bold">{idx + 1}</td>
                          
                          {/* Exercise Selector */}
                          <td className="py-2 pr-2">
                            <select
                              value={row.name}
                              onChange={(e) => handleUpdateTemplateExerciseField(idx, 'name', e.target.value)}
                              className="w-full p-1.5 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg font-bold text-[#f2f2f2] text-xs focus:outline-none focus:border-[#ff6b00]"
                            >
                              {exerciseDb.map((ex) => (
                                <option key={ex.id || ex.name} value={ex.name} className="bg-[#141417] text-[#f2f2f2]">
                                  {ex.name} ({ex.muscleGroup})
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Muscle Group */}
                          <td className="py-2 pr-2">
                            <span className="text-[10px] bg-[#141417] text-[#ff6b00] font-bold px-1.5 py-0.5 rounded border border-[rgba(242,242,242,0.1)]">
                              {row.muscleGroup}
                            </span>
                          </td>

                          {/* Pattern */}
                          <td className="py-2 pr-2 text-[11px] text-[rgba(242,242,242,0.6)]">
                            {row.movementPattern}
                          </td>

                          {/* Sets */}
                          <td className="py-2 pr-2 text-center">
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={row.setsCount}
                              onChange={(e) => handleUpdateTemplateExerciseField(idx, 'setsCount', parseInt(e.target.value, 10) || 1)}
                              className="w-12 p-1 text-center bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg font-bold text-[#f2f2f2]"
                            />
                          </td>

                          {/* Target Reps */}
                          <td className="py-2 pr-2 text-center">
                            <input
                              type="text"
                              value={row.targetReps}
                              onChange={(e) => handleUpdateTemplateExerciseField(idx, 'targetReps', e.target.value)}
                              className="w-16 p-1 text-center bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg font-bold text-[#f2f2f2]"
                            />
                          </td>

                          {/* Weight */}
                          <td className="py-2 pr-2 text-center">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={row.targetWeightKg}
                              onChange={(e) => handleUpdateTemplateExerciseField(idx, 'targetWeightKg', parseFloat(e.target.value) || 0)}
                              className="w-16 p-1 text-center bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg font-bold text-[#ff6b00]"
                            />
                          </td>

                          {/* RIR */}
                          <td className="py-2 pr-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max="5"
                              value={row.targetRir}
                              onChange={(e) => handleUpdateTemplateExerciseField(idx, 'targetRir', parseInt(e.target.value, 10) || 0)}
                              className="w-12 p-1 text-center bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg font-bold text-[#f2f2f2]"
                            />
                          </td>

                          {/* RPE */}
                          <td className="py-2 pr-2 text-center">
                            <input
                              type="number"
                              min="5"
                              max="10"
                              step="0.5"
                              value={row.targetRpe}
                              onChange={(e) => handleUpdateTemplateExerciseField(idx, 'targetRpe', parseFloat(e.target.value) || 8)}
                              className="w-12 p-1 text-center bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg font-bold text-[#ff6b00]"
                            />
                          </td>

                          {/* Delete Row */}
                          <td className="py-2 text-center">
                            {tmplExercises.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveRowFromTemplate(idx)}
                                className="text-[rgba(242,242,242,0.4)] hover:text-[#ff6b00] p-1 rounded cursor-pointer transition-colors"
                                title="Eliminar fila"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[rgba(242,242,242,0.1)]">
                <button
                  type="button"
                  onClick={resetTemplateForm}
                  className="px-4 py-2 bg-[#1c1c21] hover:bg-[#26262b] text-[rgba(242,242,242,0.6)] rounded-xl font-bold text-xs cursor-pointer border border-[rgba(242,242,242,0.1)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {editingTemplateId ? 'Guardar Cambios en Plantilla' : 'Guardar Plantilla'}
                </button>
              </div>
            </form>
          )}

          {/* Grid of Available Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tmpl) => {
              const totalSets = tmpl.exercises.reduce((acc, ex) => acc + ex.setsCount, 0);

              return (
                <div
                  key={tmpl.id}
                  className="bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-2xl p-4 sm:p-5 shadow-sm hover:border-[rgba(242,242,242,0.2)] transition-all flex flex-col justify-between gap-4 group"
                >
                  <div>
                    {/* Template Card Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-[rgba(242,242,242,0.1)] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#f2f2f2] text-sm group-hover:text-[#ff6b00] transition-colors">
                            {tmpl.name}
                          </h4>
                          {tmpl.isCustom && (
                            <span className="text-[9px] bg-[rgba(255,107,0,0.15)] text-[#ff6b00] font-bold px-2 py-0.5 rounded-full border border-[rgba(255,107,0,0.3)]">
                              Personalizada
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[rgba(242,242,242,0.5)] mt-1 font-medium line-clamp-2">
                          {tmpl.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditTemplate(tmpl)}
                          className="p-1.5 text-[rgba(242,242,242,0.4)] hover:text-[#f2f2f2] hover:bg-[#1c1c21] rounded-lg cursor-pointer transition-colors"
                          title="Editar plantilla"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {tmpl.isCustom && (
                          <button
                            onClick={() => onDeleteTemplate(tmpl.id)}
                            className="p-1.5 text-[rgba(242,242,242,0.4)] hover:text-[#ff6b00] hover:bg-[#1c1c21] rounded-lg cursor-pointer transition-colors"
                            title="Eliminar plantilla"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap gap-1.5 my-3">
                      <span className="text-[10px] bg-[#1c1c21] text-[#f2f2f2] font-medium px-2 py-0.5 rounded-md border border-[rgba(242,242,242,0.1)]">
                        {tmpl.focus}
                      </span>
                      <span className="text-[10px] bg-[#1c1c21] text-[rgba(242,242,242,0.5)] font-medium px-2 py-0.5 rounded-md border border-[rgba(242,242,242,0.1)]">
                        {tmpl.difficulty}
                      </span>
                      <span className="text-[10px] bg-[rgba(255,107,0,0.15)] text-[#ff6b00] font-medium px-2 py-0.5 rounded-md border border-[rgba(255,107,0,0.3)]">
                        {tmpl.exercises.length} ejercicios • {totalSets} series
                      </span>
                    </div>

                    {/* Exercises Preview List */}
                    <div className="space-y-1.5 bg-[#1c1c21] p-2.5 rounded-xl border border-[rgba(242,242,242,0.1)] text-xs">
                      {tmpl.exercises.map((ex, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[rgba(242,242,242,0.7)]">
                          <span className="font-medium truncate max-w-[200px] text-[#f2f2f2]">
                            {idx + 1}. {ex.name}
                          </span>
                          <span className="text-[11px] text-[rgba(242,242,242,0.5)] font-medium shrink-0">
                            {ex.setsCount}x{ex.targetReps} @{ex.targetWeightKg}kg (RIR {ex.targetRir})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Apply Template Button */}
                  {onApplyTemplateToCurrentDay && (
                    <div className="pt-3 border-t border-[rgba(242,242,242,0.1)] flex items-center justify-between">
                      <span className="text-[11px] text-[rgba(242,242,242,0.5)]">
                        Aplica a la fecha activa
                      </span>
                      <button
                        onClick={() => onApplyTemplateToCurrentDay(tmpl)}
                        className="px-3 py-1.5 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>⚡ Aplicar a la Rutina</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. BIBLIOTECA DE EJERCICIOS */}
      {/* ========================================================================= */}
      {activeSubTab === 'exercises' && (
        <div className="space-y-4">
          
          {/* Add / Edit Exercise Form Card */}
          {isExerciseFormOpen && (
            <form onSubmit={handleSubmitExercise} className="bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-2xl p-5 shadow-md space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-[rgba(242,242,242,0.1)] pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#f2f2f2] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ff6b00]" />
                  <span>{editingExerciseId ? 'Editar Ejercicio de la Base de Datos' : 'Nuevo Ejercicio para el Entrenador'}</span>
                </h3>
                <button
                  type="button"
                  onClick={resetExerciseForm}
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
                    placeholder="Ej. Press Banca con Mancuernas en Suelo, Hack Squat..."
                    value={exName}
                    onChange={(e) => setExName(e.target.value)}
                    className="w-full p-2 bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl font-medium text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
                  />
                </div>

                {/* Muscle Group */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[rgba(242,242,242,0.6)] mb-1">
                    Grupo Muscular Principal *
                  </label>
                  <select
                    value={exMuscle}
                    onChange={(e) => setExMuscle(e.target.value as MuscleGroup)}
                    className="w-full p-2 bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl font-medium text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
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
                    value={exPattern}
                    onChange={(e) => setExPattern(e.target.value as MovementPattern)}
                    className="w-full p-2 bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl font-medium text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
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
                    value={exEquipment}
                    onChange={(e) => setExEquipment(e.target.value as ExerciseDbEntry['equipment'])}
                    className="w-full p-2 bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl font-medium text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
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
                    Video de Técnica (YouTube Embed / Enlace)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/embed/..."
                    value={exVideoUrl}
                    onChange={(e) => setExVideoUrl(e.target.value)}
                    className="w-full p-2 bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
                  />
                </div>

                {/* Coach Cues */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-[rgba(242,242,242,0.6)] mb-1">
                    Indicaciones Biomecánicas / Cues para el Alumno (1 por línea)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Mantener costillas bajas y core activo&#10;Descenso controlado en 3 segundos&#10;Pausa isométrica de 1s"
                    value={exCuesText}
                    onChange={(e) => setExCuesText(e.target.value)}
                    className="w-full p-2 bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[rgba(242,242,242,0.1)]">
                <button
                  type="button"
                  onClick={resetExerciseForm}
                  className="px-4 py-2 bg-[#1c1c21] hover:bg-[#26262b] text-[rgba(242,242,242,0.6)] rounded-xl font-bold text-xs cursor-pointer border border-[rgba(242,242,242,0.1)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {editingExerciseId ? 'Guardar Cambios' : 'Guardar en Base de Datos'}
                </button>
              </div>
            </form>
          )}

          {/* Search & Filter Controls */}
          <div className="bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-2xl p-3.5 shadow-sm flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Buscar por nombre, grupo muscular, patrón o equipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl text-xs font-medium text-[#f2f2f2] placeholder-[rgba(242,242,242,0.4)] focus:border-[#ff6b00] focus:outline-none"
              />
              <Search className="w-4 h-4 text-[rgba(242,242,242,0.4)] absolute left-3 top-2.5 pointer-events-none" />
            </div>

            <select
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
              className="w-full sm:w-auto p-2 bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl text-xs font-bold text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
            >
              <option value="all" className="bg-[#1c1c21] text-[#f2f2f2]">Todos los Músculos</option>
              {MUSCLE_GROUPS_LIST.map((m) => (
                <option key={m} value={m} className="bg-[#1c1c21] text-[#f2f2f2]">
                  {m}
                </option>
              ))}
            </select>

            <select
              value={selectedPattern}
              onChange={(e) => setSelectedPattern(e.target.value)}
              className="w-full sm:w-auto p-2 bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl text-xs font-bold text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
            >
              <option value="all" className="bg-[#1c1c21] text-[#f2f2f2]">Todos los Patrones</option>
              {MOVEMENT_PATTERNS_LIST.map((p) => (
                <option key={p} value={p} className="bg-[#1c1c21] text-[#f2f2f2]">
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Exercise Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredExercises.map((ex) => (
              <div
                key={ex.id}
                className="bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-xl p-3.5 shadow-sm hover:border-[rgba(242,242,242,0.2)] transition-all flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#1c1c21] text-[#ff6b00] flex items-center justify-center shrink-0 border border-[rgba(242,242,242,0.1)]">
                        <Dumbbell className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-[#f2f2f2] text-xs truncate group-hover:text-[#ff6b00] transition-colors">
                          {ex.name}
                        </h4>
                        <span className="text-[10px] text-[rgba(242,242,242,0.4)] font-medium">
                          {ex.equipment}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditExercise(ex)}
                        className="p-1 text-[rgba(242,242,242,0.4)] hover:text-[#f2f2f2] hover:bg-[#1c1c21] rounded cursor-pointer transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {ex.isCustom && (
                        <button
                          onClick={() => onDeleteExercise(ex.id)}
                          className="p-1 text-[rgba(242,242,242,0.4)] hover:text-[#ff6b00] hover:bg-[#1c1c21] rounded cursor-pointer transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    <span className="bg-[#1c1c21] text-[#ff6b00] text-[10px] font-bold px-2 py-0.5 rounded border border-[rgba(242,242,242,0.1)]">
                      {ex.muscleGroup}
                    </span>
                    <span className="bg-[#1c1c21] text-[rgba(242,242,242,0.6)] text-[10px] font-medium px-2 py-0.5 rounded border border-[rgba(242,242,242,0.1)]">
                      {ex.movementPattern}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[rgba(242,242,242,0.1)] flex items-center justify-between text-[10px] text-[rgba(242,242,242,0.5)]">
                  <span className="truncate max-w-[180px]">
                    💡 {ex.coachCues?.[0] || 'Técnica estricta'}
                  </span>
                  {ex.videoUrl && (
                    <a
                      href={ex.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#ff6b00] hover:underline font-bold"
                    >
                      <Play className="w-3 h-3 fill-[#ff6b00]" />
                      <span>Video</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
