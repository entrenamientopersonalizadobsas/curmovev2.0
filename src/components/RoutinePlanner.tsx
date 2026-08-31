import React, { useState } from 'react';
import { 
  DailyWorkout, 
  ExerciseItem, 
  MuscleGroup, 
  MovementPattern, 
  ViewMode,
  ExerciseDbEntry,
  CardioSession
} from '../types';
import { 
  EXERCISE_DATABASE, 
  MUSCLE_GROUPS_LIST, 
  DEFAULT_TEMPLATES 
} from '../data/mockData';
import { CardioTracker } from './CardioTracker';
import { 
  Dumbbell, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Layers, 
  CheckCircle2, 
  Sparkles,
  Calendar,
  MoreVertical,
  Activity,
  Footprints,
  Bike,
  Flame,
  Search
} from 'lucide-react';

interface RoutinePlannerProps {
  workout?: DailyWorkout;
  selectedDate: string;
  selectedExerciseId: string | null;
  onSelectExercise: (exerciseId: string) => void;
  onUpdateWorkout: (workout: DailyWorkout) => void;
  viewMode: ViewMode;
  exerciseDb?: ExerciseDbEntry[];
  onOpenSaveSession?: () => void;
}

export const RoutinePlanner: React.FC<RoutinePlannerProps> = ({
  workout,
  selectedDate,
  selectedExerciseId,
  onSelectExercise,
  onUpdateWorkout,
  viewMode,
  exerciseDb,
  onOpenSaveSession
}) => {
  const [plannerTab, setPlannerTab] = useState<'strength' | 'cardio'>('strength');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showTemplates, setShowTemplates] = useState<boolean>(false);

  // Use provided exerciseDb or fallback to default
  const fullDb = exerciseDb && exerciseDb.length > 0 ? exerciseDb : (EXERCISE_DATABASE as ExerciseDbEntry[]);

  // Add Exercise Form State
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup>('Pecho');
  const [selectedPattern, setSelectedPattern] = useState<MovementPattern>('Empuje Horizontal');
  const [selectedExerciseName, setSelectedExerciseName] = useState<string>('Press de Banca Plano');
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState<string>('');
  const [customSetsCount, setCustomSetsCount] = useState<number>(4);
  const [customReps, setCustomReps] = useState<string>('8-10');
  const [customWeight, setCustomWeight] = useState<number>(80);
  const [customRir, setCustomRir] = useState<number>(2);
  const [customRpe, setCustomRpe] = useState<number>(8);

  // Filter available exercises based on selected Muscle Group and search term
  const availableExercises = fullDb.filter((ex) => {
    if (ex.muscleGroup !== selectedMuscle) return false;
    if (exerciseSearchTerm.trim()) {
      return ex.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase());
    }
    return true;
  });

  // Update selected exercise when available list changes
  React.useEffect(() => {
    if (availableExercises.length > 0) {
      const exists = availableExercises.some((e) => e.name === selectedExerciseName);
      if (!exists) {
        setSelectedExerciseName(availableExercises[0].name);
        setSelectedPattern(availableExercises[0].movementPattern);
      }
    }
  }, [selectedMuscle, fullDb, exerciseSearchTerm]);

  // Current list of exercises & cardio
  const exercises = workout?.exercises || [];
  const cardioSessions = workout?.cardio || [];
  const workoutTitle = workout?.title || (exercises.length === 0 && cardioSessions.length > 0 ? 'SESIÓN DE CARDIO' : 'DÍA DE ENTRENAMIENTO');

  // Handler: Add Exercise (Both Trainer & Student can use)
  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    const dbEntry = fullDb.find((e) => e.name === selectedExerciseName) || availableExercises[0];

    const newExercise: ExerciseItem = {
      id: `ex-${Date.now()}`,
      name: selectedExerciseName,
      muscleGroup: selectedMuscle,
      movementPattern: selectedPattern,
      equipment: dbEntry?.equipment || 'Barra',
      videoUrl: dbEntry?.videoUrl || 'https://www.youtube.com/embed/rT7DgCr-3pg',
      coachCues: dbEntry?.coachCues || ['Retracción escapular', 'Control excéntrico 3s'],
      order: exercises.length + 1,
      sets: Array.from({ length: customSetsCount }, (_, i) => ({
        id: `set-${Date.now()}-${i}`,
        setNumber: i + 1,
        type: i === 0 && customSetsCount > 3 ? 'warmup' : 'work',
        targetReps: customReps,
        targetWeightKg: customWeight,
        targetRir: customRir,
        targetRpe: customRpe,
        completed: false,
        restSeconds: 90
      }))
    };

    const updatedWorkout: DailyWorkout = {
      id: workout?.id || `workout-${selectedDate}`,
      date: selectedDate,
      dayName: workout?.dayName || 'Entrenamiento',
      title: workout?.title && workout.title !== 'Día de Descanso Activo' ? workout.title : (viewMode === 'student' ? 'ENTRENAMIENTO LIBRE' : 'DÍA DE ENTRENAMIENTO'),
      exercises: [...exercises, newExercise],
      cardio: cardioSessions,
      isRestDay: false,
      completed: false
    };

    onUpdateWorkout(updatedWorkout);
    onSelectExercise(newExercise.id);
    setShowAddForm(false);
  };

  // Handler: Remove Exercise
  const handleRemoveExercise = (exerciseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = exercises.filter((ex) => ex.id !== exerciseId);
    onUpdateWorkout({
      id: workout?.id || `workout-${selectedDate}`,
      date: selectedDate,
      dayName: workout?.dayName || 'Entrenamiento',
      title: workoutTitle,
      exercises: filtered,
      cardio: cardioSessions,
      isRestDay: filtered.length === 0 && cardioSessions.length === 0,
      completed: workout?.completed || false
    });
  };

  // Handler: Move Exercise Up / Down
  const handleMove = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= exercises.length) return;

    const list = [...exercises];
    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;

    onUpdateWorkout({
      id: workout?.id || `workout-${selectedDate}`,
      date: selectedDate,
      dayName: workout?.dayName || 'Entrenamiento',
      title: workoutTitle,
      exercises: list,
      cardio: cardioSessions,
      isRestDay: false,
      completed: workout?.completed || false
    });
  };

  // Handler: Apply Template
  const handleApplyTemplate = (templateKey: keyof typeof DEFAULT_TEMPLATES) => {
    const tpl = DEFAULT_TEMPLATES[templateKey];
    onUpdateWorkout({
      id: `workout-${selectedDate}`,
      date: selectedDate,
      dayName: workout?.dayName || 'Entrenamiento',
      title: tpl.title,
      exercises: tpl.exercises.map((e, idx) => ({ ...e, id: `ex-tpl-${Date.now()}-${idx}` })),
      cardio: cardioSessions,
      isRestDay: false,
      completed: false
    });
    setShowTemplates(false);
  };

  // Handler: Toggle Rest Day
  const handleToggleRestDay = () => {
    const isCurrentlyRest = workout?.isRestDay;
    onUpdateWorkout({
      id: workout?.id || `workout-${selectedDate}`,
      date: selectedDate,
      dayName: workout?.dayName || 'Entrenamiento',
      title: isCurrentlyRest ? 'Sesión de Entrenamiento' : 'Día de Descanso Activo',
      exercises: isCurrentlyRest ? [] : [],
      cardio: isCurrentlyRest ? [] : [],
      isRestDay: !isCurrentlyRest,
      completed: false
    });
  };

  // Handler: Update Cardio Sessions
  const handleUpdateCardio = (newCardio: CardioSession[]) => {
    onUpdateWorkout({
      id: workout?.id || `workout-${selectedDate}`,
      date: selectedDate,
      dayName: workout?.dayName || 'Entrenamiento',
      title: workout?.title || (exercises.length === 0 ? 'SESIÓN DE CARDIO' : workoutTitle),
      exercises,
      cardio: newCardio,
      isRestDay: false,
      completed: workout?.completed || false
    });
  };

  // Calculate session progress
  const totalSets = exercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0);
  const completedSets = exercises.reduce(
    (acc, ex) => acc + (ex.sets?.filter((s) => s.completed).length || 0),
    0
  );
  const progressPercent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : (cardioSessions.some(c => c.completed) ? 100 : 0);

  return (
    <div id="column-routine-planner" className="bg-[#141417] rounded-xl border border-[rgba(242,242,242,0.1)] shadow-xs flex flex-col h-full overflow-hidden text-[#f2f2f2]">
      
      {/* Column Header */}
      <div className="px-4 py-3 border-b border-[rgba(242,242,242,0.1)] flex flex-wrap justify-between items-center bg-[#141417] shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-display font-bold text-[#f2f2f2] text-xs flex items-center gap-2 truncate">
            <span>PLANIFICACIÓN</span>
            <span className="bg-[#1c1c21] text-[#ff6b00] font-mono-code text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-[rgba(242,242,242,0.1)] truncate max-w-[160px]">
              {workoutTitle}
            </span>
          </h3>
        </div>

        {/* Action Controls for both Trainer & Student */}
        <div className="flex items-center gap-1.5">
          <button
            id="btn-add-exercise-toggle"
            onClick={() => {
              setPlannerTab('strength');
              setShowAddForm(!showAddForm);
            }}
            className="text-xs font-bold bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>EJERCICIO</span>
          </button>

          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="p-1 rounded-lg text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2] hover:bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] transition-colors cursor-pointer"
            title="Plantillas rápidas"
          >
            <Layers className="w-4 h-4" />
          </button>

          {viewMode === 'student' && (
            <span className="text-[11px] font-mono-code font-bold text-[#ff6b00] bg-[#1c1c21] px-2 py-0.5 rounded border border-[rgba(242,242,242,0.1)]">
              {completedSets}/{totalSets} series
            </span>
          )}
        </div>
      </div>

      {/* Switcher Tab: Fuerza vs Cardio */}
      <div className="flex border-b border-[rgba(242,242,242,0.1)] bg-[#0c0c0e] px-2 pt-1 gap-1">
        <button
          onClick={() => setPlannerTab('strength')}
          className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            plannerTab === 'strength'
              ? 'bg-[#141417] text-[#f2f2f2] border-t border-x border-[rgba(242,242,242,0.1)]'
              : 'text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2]'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5 text-[#ff6b00]" />
          <span>Fuerza ({exercises.length})</span>
        </button>

        <button
          onClick={() => setPlannerTab('cardio')}
          className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            plannerTab === 'cardio'
              ? 'bg-[#141417] text-[#f2f2f2] border-t border-x border-[rgba(242,242,242,0.1)]'
              : 'text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2]'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-[#ff6b00]" />
          <span>Cardio ({cardioSessions.length})</span>
          {cardioSessions.length > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b00]" />
          )}
        </button>
      </div>

      {/* Progress Bar (Student View) */}
      {viewMode === 'student' && totalSets > 0 && (
        <div className="w-full bg-[#0c0c0e] h-1">
          <div
            className="bg-[#ff6b00] h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Template Chooser Drawer */}
      {showTemplates && (
        <div className="p-3 bg-[#1c1c21] border-b border-[rgba(242,242,242,0.1)] text-xs space-y-2">
          <div className="flex justify-between items-center text-[#f2f2f2] font-bold text-[10px] uppercase tracking-wider font-mono-code">
            <span>Cargar Plantilla Prediseñada</span>
            <button onClick={() => setShowTemplates(false)} className="text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2] font-bold cursor-pointer">
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleApplyTemplate('torso')}
              className="p-2 bg-[#141417] hover:bg-[#26262b] border border-[rgba(242,242,242,0.1)] rounded-lg text-left text-[#f2f2f2] font-medium transition-colors cursor-pointer"
            >
              Torso Hipertrofia (5 ejer.)
            </button>
            <button
              onClick={() => handleApplyTemplate('pierna')}
              className="p-2 bg-[#141417] hover:bg-[#26262b] border border-[rgba(242,242,242,0.1)] rounded-lg text-left text-[#f2f2f2] font-medium transition-colors cursor-pointer"
            >
              Pierna & Glúteos (5 ejer.)
            </button>
            <button
              onClick={() => handleApplyTemplate('tiron')}
              className="p-2 bg-[#141417] hover:bg-[#26262b] border border-[rgba(242,242,242,0.1)] rounded-lg text-left text-[#f2f2f2] font-medium transition-colors cursor-pointer"
            >
              Tirón & Espalda (4 ejer.)
            </button>
            <button
              onClick={handleToggleRestDay}
              className="p-2 bg-[#141417] hover:bg-[#26262b] border border-[rgba(242,242,242,0.1)] rounded-lg text-left text-[rgba(242,242,242,0.6)] font-medium transition-colors cursor-pointer"
            >
              Marcar Día de Descanso
            </button>
          </div>
        </div>
      )}

      {/* Add Exercise Form (Available to Both Student and Trainer) */}
      {showAddForm && (
        <form onSubmit={handleAddExercise} className="p-3.5 bg-[#1c1c21] border-b border-[rgba(242,242,242,0.1)] text-xs space-y-3">
          <div className="flex justify-between items-center text-[#f2f2f2] font-bold uppercase text-[10px] tracking-wider font-mono-code">
            <span>
              {viewMode === 'student' ? 'Agregar Ejercicio a tu Entrenamiento' : 'Configurar Nuevo Ejercicio'}
            </span>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2] cursor-pointer">
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Muscle Group */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-[rgba(242,242,242,0.5)] mb-1">Grupo Muscular</label>
              <select
                value={selectedMuscle}
                onChange={(e) => setSelectedMuscle(e.target.value as MuscleGroup)}
                className="w-full p-2 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg text-xs font-medium text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
              >
                {MUSCLE_GROUPS_LIST.map((m) => (
                  <option key={m} value={m} className="bg-[#141417] text-[#f2f2f2]">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Movement Pattern */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-[rgba(242,242,242,0.5)] mb-1">Patrón de Movimiento</label>
              <select
                value={selectedPattern}
                onChange={(e) => setSelectedPattern(e.target.value as MovementPattern)}
                className="w-full p-2 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg text-xs font-medium text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
              >
                {[
                  'Empuje Horizontal',
                  'Empuje Vertical',
                  'Tracción Horizontal',
                  'Tracción Vertical',
                  'Dominante de Rodilla',
                  'Dominante de Cadera',
                  'Aislamiento',
                  'Anti-Extensión / Core',
                  'Anti-Rotación'
                ].map((p) => (
                  <option key={p} value={p} className="bg-[#141417] text-[#f2f2f2]">
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Exercise Name + Quick Search */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase font-bold text-[rgba(242,242,242,0.5)]">Ejercicio</label>
            <div className="relative mb-1">
              <Search className="w-3 h-3 text-[rgba(242,242,242,0.5)] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por nombre..."
                value={exerciseSearchTerm}
                onChange={(e) => setExerciseSearchTerm(e.target.value)}
                className="w-full pl-7 pr-2 py-1 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg text-[11px] text-[#f2f2f2] placeholder-[rgba(242,242,242,0.4)] focus:outline-none focus:border-[#ff6b00]"
              />
            </div>
            <select
              value={selectedExerciseName}
              onChange={(e) => {
                setSelectedExerciseName(e.target.value);
                const found = fullDb.find((ex) => ex.name === e.target.value);
                if (found) setSelectedPattern(found.movementPattern);
              }}
              className="w-full p-2 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg text-xs font-medium text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
            >
              {availableExercises.map((ex) => (
                <option key={ex.name} value={ex.name} className="bg-[#141417] text-[#f2f2f2]">
                  {ex.name} ({ex.equipment})
                </option>
              ))}
            </select>
          </div>

          {/* Sets, Reps, Kg, RIR, RPE inputs */}
          <div className="grid grid-cols-5 gap-1.5 text-center font-mono-code">
            <div>
              <label className="block text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] mb-1">Series</label>
              <input
                type="number"
                min="1"
                max="10"
                value={customSetsCount}
                onChange={(e) => setCustomSetsCount(Number(e.target.value))}
                className="w-full p-1.5 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg text-center text-xs font-bold text-[#f2f2f2]"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] mb-1">Repes</label>
              <input
                type="text"
                value={customReps}
                onChange={(e) => setCustomReps(e.target.value)}
                className="w-full p-1.5 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg text-center text-xs font-bold text-[#f2f2f2]"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] mb-1">Kilos</label>
              <input
                type="number"
                value={customWeight}
                onChange={(e) => setCustomWeight(Number(e.target.value))}
                className="w-full p-1.5 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg text-center text-xs font-bold text-[#ff6b00]"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] mb-1">RIR</label>
              <input
                type="number"
                min="0"
                max="5"
                value={customRir}
                onChange={(e) => setCustomRir(Number(e.target.value))}
                className="w-full p-1.5 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg text-center text-xs font-bold text-[#f2f2f2]"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] mb-1">RPE</label>
              <input
                type="number"
                min="5"
                max="10"
                value={customRpe}
                onChange={(e) => setCustomRpe(Number(e.target.value))}
                className="w-full p-1.5 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg text-center text-xs font-bold text-[#ff6b00]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 bg-[#141417] hover:bg-[#26262b] text-[rgba(242,242,242,0.6)] rounded-lg text-xs font-bold border border-[rgba(242,242,242,0.1)] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Guardar Ejercicio
            </button>
          </div>
        </form>
      )}

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        
        {/* CARDIO TAB CONTENT */}
        {plannerTab === 'cardio' ? (
          <CardioTracker
            cardioSessions={cardioSessions}
            onUpdateCardio={handleUpdateCardio}
            viewMode={viewMode}
            dateStr={selectedDate}
          />
        ) : workout?.isRestDay ? (
          /* REST DAY VIEW */
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-[rgba(242,242,242,0.5)] space-y-2">
            <div className="w-10 h-10 rounded bg-[#1c1c21] flex items-center justify-center text-[rgba(242,242,242,0.5)] border border-[rgba(242,242,242,0.1)]">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-[#f2f2f2]">Día de Descanso Programado</p>
            <p className="text-[11px] text-[rgba(242,242,242,0.5)] max-w-xs">
              Recuperación activa recomendada: caminata ligera, movilidad o descanso.
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleToggleRestDay}
                className="px-3 py-1.5 bg-[#1c1c21] hover:bg-[#26262b] text-[#f2f2f2] text-xs font-bold rounded-lg cursor-pointer border border-[rgba(242,242,242,0.1)]"
              >
                Activar Entrenamiento
              </button>
              <button
                onClick={() => {
                  setPlannerTab('cardio');
                }}
                className="px-3 py-1.5 bg-[#1c1c21] hover:bg-[#26262b] text-[#ff6b00] text-xs font-bold rounded-lg cursor-pointer border border-[rgba(242,242,242,0.1)]"
              >
                + Registrar Cardio
              </button>
            </div>
          </div>
        ) : exercises.length === 0 ? (
          /* EMPTY DAY VIEW (FREE TRAINING CAPABILITY FOR STUDENT & TRAINER) */
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[rgba(242,242,242,0.5)] space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#1c1c21] flex items-center justify-center text-[#ff6b00] border border-[rgba(242,242,242,0.1)] shadow-xs">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#f2f2f2]">No hay rutina programada para este día</p>
              <p className="text-[11px] text-[rgba(242,242,242,0.5)] max-w-xs mt-1">
                {viewMode === 'student'
                  ? '¿Fuiste a entrenar por tu cuenta? ¡Podés agregar tus ejercicios libres o registrar cardio aquí!'
                  : 'Agrega ejercicios personalizados o carga una de las plantillas predefinidas.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center pt-1">
              <button
                onClick={() => setShowAddForm(true)}
                className="px-3.5 py-2 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] text-xs font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Agregar Ejercicio</span>
              </button>
              
              <button
                onClick={() => setPlannerTab('cardio')}
                className="px-3.5 py-2 bg-[#1c1c21] hover:bg-[#26262b] text-[#ff6b00] text-xs font-bold rounded-lg border border-[rgba(242,242,242,0.1)] cursor-pointer flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>+ Registrar Cardio</span>
              </button>

              <button
                onClick={() => setShowTemplates(true)}
                className="px-3 py-2 bg-[#1c1c21] hover:bg-[#26262b] text-[#f2f2f2] text-xs font-bold rounded-lg border border-[rgba(242,242,242,0.1)] cursor-pointer"
              >
                Usar Plantilla
              </button>
            </div>
          </div>
        ) : (
          /* LIST OF STRENGTH EXERCISES */
          exercises.map((exercise, index) => {
            const isSelected = exercise.id === selectedExerciseId;
            const completedCount = exercise.sets?.filter((s) => s.completed).length || 0;
            const totalCount = exercise.sets?.length || 0;
            const isAllCompleted = totalCount > 0 && completedCount === totalCount;

            return (
              <div
                key={exercise.id}
                id={`exercise-item-${exercise.id}`}
                onClick={() => onSelectExercise(exercise.id)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#1c1c21] border-[#ff6b00] shadow-xs'
                    : 'bg-[#141417] border-[rgba(242,242,242,0.08)] hover:border-[rgba(242,242,242,0.2)] hover:bg-[#1c1c21]'
                }`}
              >
                {/* Left: Number & Main Info */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs shrink-0 ${
                      isAllCompleted
                        ? 'bg-[#1c1c21] text-[#ff6b00] border border-[#ff6b00]'
                        : isSelected
                        ? 'bg-[#ff6b00] text-[#ffffff]'
                        : 'bg-[#1c1c21] text-[rgba(242,242,242,0.5)] border border-[rgba(242,242,242,0.1)]'
                    }`}
                  >
                    {isAllCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#f2f2f2] truncate">
                        {exercise.name}
                      </h4>
                      {isAllCompleted && (
                        <span className="text-[9px] bg-[#1c1c21] text-[#ff6b00] font-mono-code font-bold px-1.5 py-0.2 rounded border border-[#ff6b00] shrink-0">
                          ✓ Guardado
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px]">
                      <span className="text-[#f2f2f2] font-medium bg-[#1c1c21] px-1.5 py-0.2 rounded border border-[rgba(242,242,242,0.1)]">
                        {exercise.muscleGroup}
                      </span>
                      <span className="text-[rgba(242,242,242,0.5)] truncate">
                        • {exercise.movementPattern}
                      </span>
                      <span className="text-[rgba(242,242,242,0.5)] font-mono-code">
                        • {completedCount}/{totalCount} series
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Quick Target Info & Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right font-mono-code">
                    <span className="text-[11px] font-medium text-[#f2f2f2] block">
                      {exercise.sets?.[0]?.targetReps || '8-10'} reps
                    </span>
                    <span className="text-[10px] text-[#ff6b00] font-medium">
                      RIR {exercise.targetRir ?? 2} / @{exercise.targetRpe ?? 8}
                    </span>
                  </div>

                  {/* Re-order / delete controls */}
                  <div className="flex items-center gap-0.5 border-l border-[rgba(242,242,242,0.1)] pl-2">
                    <div className="flex flex-col">
                      <button
                        onClick={(e) => handleMove(index, 'up', e)}
                        disabled={index === 0}
                        className="p-0.5 text-[rgba(242,242,242,0.4)] hover:text-[#f2f2f2] disabled:opacity-20 cursor-pointer"
                        title="Subir"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleMove(index, 'down', e)}
                        disabled={index === exercises.length - 1}
                        className="p-0.5 text-[rgba(242,242,242,0.4)] hover:text-[#f2f2f2] disabled:opacity-20 cursor-pointer"
                        title="Bajar"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={(e) => handleRemoveExercise(exercise.id, e)}
                      className="p-1 text-[rgba(242,242,242,0.4)] hover:text-[#ff5555] rounded transition-colors ml-0.5 cursor-pointer"
                      title="Eliminar Ejercicio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Mini Cardio Banner in strength tab if cardio exists */}
        {plannerTab === 'strength' && cardioSessions.length > 0 && (
          <div
            onClick={() => setPlannerTab('cardio')}
            className="p-2.5 bg-[#1c1c21] border border-[#ff6b00] rounded-lg flex items-center justify-between cursor-pointer hover:bg-[#26262b] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#ff6b00]" />
              <span className="text-xs font-bold text-[#ff6b00]">
                {cardioSessions.length} Bloque(s) de Cardio Registrado(s)
              </span>
            </div>
            <span className="text-[10px] text-[#f2f2f2] font-bold">Ver Cardio →</span>
          </div>
        )}
      </div>

      {/* Session Completion & Guardar Sesión Action Footer */}
      {(exercises.length > 0 || cardioSessions.length > 0) && !workout?.isRestDay && (
        <div className="p-3 bg-[#141417] border-t border-[rgba(242,242,242,0.1)] shrink-0 space-y-2">
          {workout?.completed ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-[#1c1c21] border border-[#ff6b00] rounded-lg p-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#141417] flex items-center justify-center text-[#ff6b00] shrink-0 border border-[#ff6b00]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-display font-bold text-[#ff6b00] block">
                    SESIÓN REGISTRADA
                  </span>
                  <p className="text-[10px] text-[rgba(242,242,242,0.6)]">
                    {workout?.sessionEnergyLevel ? `Energía: ${workout.sessionEnergyLevel}/5 • ` : ''}
                    Completada en el Dashboard
                  </p>
                </div>
              </div>

              <button
                id="btn-update-saved-session"
                onClick={onOpenSaveSession}
                className="px-2.5 py-1 bg-[#141417] hover:bg-[#26262b] text-[#ff6b00] font-bold text-xs rounded border border-[#ff6b00] cursor-pointer transition-colors"
              >
                Editar
              </button>
            </div>
          ) : (
            <button
              id="btn-save-workout-session"
              onClick={onOpenSaveSession}
              className="w-full py-2.5 px-3 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] font-display font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>GUARDAR SESIÓN DE ENTRENAMIENTO</span>
              <span className="text-[10px] font-mono-code bg-[#000000] text-[#ff6b00] px-1.5 py-0.2 rounded font-bold">
                {progressPercent}%
              </span>
            </button>
          )}
        </div>
      )}

    </div>
  );
};
