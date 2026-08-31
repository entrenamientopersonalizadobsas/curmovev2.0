import React, { useState, useMemo } from 'react';
import { StudentProfile, DailyWorkout, ExerciseItem, SetDetail, MuscleGroup, MovementPattern } from '../../types';
import { EXERCISE_DATABASE } from '../../data/mockData';
import { 
  BarChart3, 
  TrendingUp, 
  Dumbbell, 
  Calendar, 
  Edit3, 
  Check, 
  Plus, 
  Trash2, 
  Search, 
  ArrowRight, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  Layers, 
  Clock, 
  Filter,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  FolderKanban,
  BookOpen
} from 'lucide-react';

interface GlobalExerciseProgressComparisonProps {
  student: StudentProfile;
  onUpdateWorkout?: (date: string, workout: DailyWorkout) => void;
  onUpdateStudent?: (student: StudentProfile) => void;
}

interface ExerciseOccurrence {
  date: string;
  dayName: string;
  workoutTitle: string;
  workoutCompleted: boolean;
  exercise: ExerciseItem;
  weekIndex: number; // 1, 2, 3...
  monthIndex: number; // 1, 2, 3...
  totalActualVolumeKg: number;
  maxActualWeightKg: number;
  totalTargetVolumeKg: number;
  avgActualRpe: number;
  avgActualRir: number;
  completedSetsCount: number;
  totalSetsCount: number;
}

interface GlobalExerciseAggregation {
  name: string;
  muscleGroup: MuscleGroup;
  movementPattern: MovementPattern;
  equipment?: string;
  occurrences: ExerciseOccurrence[];
  totalSetsLogged: number;
  maxWeightOverall: number;
  totalTonnageOverall: number;
  avgRpeOverall: number;
  uniqueWeeks: Set<number>;
  isFromTemplateOnly?: boolean;
}

export const PREDEFINED_TEMPLATES_CATALOG = [
  {
    id: 'torso',
    name: 'Torso Hipertrofia',
    icon: '🏋️',
    description: 'Pectoral, Espalda, Hombros y Brazos',
    exercises: [
      'Press de Banca Plano',
      'Remo con Barra 45°',
      'Elevaciones Laterales con Mancuernas',
      'Press Inclinado con Mancuernas',
      'Jalón al Pecho en Polea',
      'Extensión de Tríceps en Polea Alta',
      'Curl de Bíceps con Barra Z'
    ]
  },
  {
    id: 'pierna',
    name: 'Pierna & Glúteos',
    icon: '🦵',
    description: 'Cuádriceps, Isquios, Glúteos y Gemelos',
    exercises: [
      'Sentadilla Trasera con Barra (Back Squat)',
      'Prensa Inclinada 45°',
      'Sentadilla Búlgara con Mancuernas',
      'Peso Muerto Rumano (RDL)',
      'Extensión de Cuádriceps',
      'Elevación de Talones en Máquina (De Pie)',
      'Elevación de Talones Sentado (Sóleo)'
    ]
  },
  {
    id: 'tiron',
    name: 'Tirón & Espalda',
    icon: '💪',
    description: 'Dorsales, Romboides, Bíceps y Trapecio',
    exercises: [
      'Dominadas Pronas / Neutras',
      'Remo con Barra 45°',
      'Jalón al Pecho en Polea',
      'Remo Gironda en Polea Baja',
      'Face Pull en Polea',
      'Curl de Bíceps con Barra Z',
      'Curl Martillo con Mancuernas'
    ]
  },
  {
    id: 'empuje',
    name: 'Empuje & Deltoides',
    icon: '🔥',
    description: 'Pecho, Hombro Anterior/Lateral y Tríceps',
    exercises: [
      'Press de Banca Plano',
      'Press Inclinado con Mancuernas',
      'Press Militar con Barra',
      'Fondos en Paralelas (Pecho)',
      'Press Arnold con Mancuernas',
      'Aperturas / Cruces en Polea',
      'Press Francés con Mancuernas',
      'Extensión de Tríceps en Polea Alta'
    ]
  },
  {
    id: 'core',
    name: 'Core & Estabilidad',
    icon: '🛡️',
    description: 'Anti-Extensión, Anti-Rotación y Cinturón Abdominal',
    exercises: [
      'Plancha Abdominal RKC',
      'Rueda Abdominal / Ab Wheel',
      'Pallof Press en Polea',
      'Elevación de Piernas Colgado'
    ]
  }
];

export const GlobalExerciseProgressComparison: React.FC<GlobalExerciseProgressComparisonProps> = ({
  student,
  onUpdateWorkout,
  onUpdateStudent
}) => {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeGroupMode, setActiveGroupMode] = useState<'templates' | 'muscles' | 'all'>('templates');
  const [selectedTemplateFilter, setSelectedTemplateFilter] = useState<string>('all');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('all');
  const [selectedExerciseName, setSelectedExerciseName] = useState<string>('');
  
  // Week comparison selector: 'timeline' or 'pair'
  const [comparisonMode, setComparisonMode] = useState<'timeline' | 'pair'>('timeline');
  const [compareWeekA, setCompareWeekA] = useState<number>(1);
  const [compareWeekB, setCompareWeekB] = useState<number>(2);

  // Coach Edit Mode state
  const [isEditingProgram, setIsEditingProgram] = useState<boolean>(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    targetWeightKg: number;
    targetReps: string;
    targetRir: number;
    targetRpe: number;
    setsCount: number;
    notes?: string;
  }>({
    targetWeightKg: 0,
    targetReps: '8-10',
    targetRir: 2,
    targetRpe: 8,
    setsCount: 4,
    notes: ''
  });

  const baseStartDate = useMemo(() => {
    return new Date(student.startDate || '2025-03-03');
  }, [student.startDate]);

  // Extract all workouts
  const workoutsMap = student.workouts || {};
  const allWorkouts: DailyWorkout[] = useMemo(() => {
    return Object.values(workoutsMap);
  }, [workoutsMap]);

  // Build Global Map of every unique exercise (from workouts AND from exercise database)
  const exerciseGlobalMap = useMemo(() => {
    const map = new Map<string, GlobalExerciseAggregation>();

    // 1. Seed from student's logged workouts
    allWorkouts.forEach((w) => {
      if (w.isRestDay || !w.exercises) return;

      const wDate = new Date(w.date);
      const diffDays = Math.floor((wDate.getTime() - baseStartDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalWeekIndex = Math.max(0, Math.floor(diffDays / 7)) + 1;
      const monthNum = Math.floor((totalWeekIndex - 1) / 4) + 1;

      w.exercises.forEach((ex) => {
        const key = ex.name.trim();

        // Calculate occurrence stats
        const completedSets = (ex.sets || []).filter((s) => s.completed);
        const totalSets = ex.sets || [];
        
        let totalActualVol = 0;
        let maxActualWt = 0;
        let totalTargetVol = 0;
        let rpeSum = 0;
        let rpeCount = 0;
        let rirSum = 0;
        let rirCount = 0;

        totalSets.forEach((s) => {
          const tReps = parseInt(s.targetReps, 10) || 8;
          const tKg = s.targetWeightKg || 0;
          totalTargetVol += tReps * tKg;

          if (s.completed) {
            const aReps = s.actualReps !== undefined ? s.actualReps : tReps;
            const aKg = s.actualWeightKg !== undefined ? s.actualWeightKg : tKg;
            totalActualVol += aReps * aKg;
            if (aKg > maxActualWt) maxActualWt = aKg;

            if (s.actualRpe !== undefined) {
              rpeSum += s.actualRpe;
              rpeCount++;
            }
            if (s.actualRir !== undefined) {
              rirSum += s.actualRir;
              rirCount++;
            }
          }
        });

        const occ: ExerciseOccurrence = {
          date: w.date,
          dayName: w.dayName,
          workoutTitle: w.title,
          workoutCompleted: !!w.completed,
          exercise: ex,
          weekIndex: totalWeekIndex,
          monthIndex: monthNum,
          totalActualVolumeKg: totalActualVol,
          maxActualWeightKg: maxActualWt > 0 ? maxActualWt : (ex.sets?.[0]?.targetWeightKg || 0),
          totalTargetVolumeKg: totalTargetVol,
          avgActualRpe: rpeCount > 0 ? Math.round((rpeSum / rpeCount) * 10) / 10 : (ex.sets?.[0]?.targetRpe || 8),
          avgActualRir: rirCount > 0 ? Math.round((rirSum / rirCount) * 10) / 10 : (ex.sets?.[0]?.targetRir ?? 2),
          completedSetsCount: completedSets.length,
          totalSetsCount: totalSets.length
        };

        if (!map.has(key)) {
          map.set(key, {
            name: ex.name,
            muscleGroup: ex.muscleGroup,
            movementPattern: ex.movementPattern,
            equipment: ex.equipment,
            occurrences: [occ],
            totalSetsLogged: completedSets.length,
            maxWeightOverall: occ.maxActualWeightKg,
            totalTonnageOverall: totalActualVol,
            avgRpeOverall: occ.avgActualRpe,
            uniqueWeeks: new Set([totalWeekIndex]),
            isFromTemplateOnly: false
          });
        } else {
          const entry = map.get(key)!;
          entry.occurrences.push(occ);
          entry.totalSetsLogged += completedSets.length;
          if (occ.maxActualWeightKg > entry.maxWeightOverall) {
            entry.maxWeightOverall = occ.maxActualWeightKg;
          }
          entry.totalTonnageOverall += totalActualVol;
          entry.uniqueWeeks.add(totalWeekIndex);
        }
      });
    });

    // 2. Also populate from EXERCISE_DATABASE so trainer can select any template exercise
    EXERCISE_DATABASE.forEach((dbEx) => {
      const key = dbEx.name.trim();
      if (!map.has(key)) {
        map.set(key, {
          name: dbEx.name,
          muscleGroup: dbEx.muscleGroup,
          movementPattern: dbEx.movementPattern,
          equipment: dbEx.equipment,
          occurrences: [],
          totalSetsLogged: 0,
          maxWeightOverall: 0,
          totalTonnageOverall: 0,
          avgRpeOverall: 8,
          uniqueWeeks: new Set(),
          isFromTemplateOnly: true
        });
      }
    });

    return map;
  }, [allWorkouts, baseStartDate]);

  // List of all unique exercises
  const allUniqueExercisesList: GlobalExerciseAggregation[] = useMemo(() => {
    const list: GlobalExerciseAggregation[] = [];
    exerciseGlobalMap.forEach((val) => list.push(val));
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [exerciseGlobalMap]);

  // Filtered exercises for search & filters
  const filteredExercisesList = useMemo(() => {
    return allUniqueExercisesList.filter((item) => {
      // Template filter if active
      if (selectedTemplateFilter !== 'all') {
        const tpl = PREDEFINED_TEMPLATES_CATALOG.find(t => t.id === selectedTemplateFilter);
        if (tpl && !tpl.exercises.includes(item.name)) {
          return false;
        }
      }

      // Muscle filter
      if (selectedMuscleFilter !== 'all' && item.muscleGroup !== selectedMuscleFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.muscleGroup.toLowerCase().includes(q) ||
          item.movementPattern.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allUniqueExercisesList, selectedTemplateFilter, selectedMuscleFilter, searchQuery]);

  // Auto-select first exercise if none selected
  React.useEffect(() => {
    if (!selectedExerciseName && filteredExercisesList.length > 0) {
      // Prefer an exercise with occurrences
      const withOcc = filteredExercisesList.find(e => e.occurrences.length > 0);
      setSelectedExerciseName(withOcc ? withOcc.name : filteredExercisesList[0].name);
    } else if (selectedExerciseName && !allUniqueExercisesList.some(e => e.name === selectedExerciseName)) {
      if (filteredExercisesList.length > 0) {
        setSelectedExerciseName(filteredExercisesList[0].name);
      }
    }
  }, [filteredExercisesList, selectedExerciseName, allUniqueExercisesList]);

  // Get active selected exercise details
  const activeExerciseData = useMemo(() => {
    if (!selectedExerciseName) return null;
    return exerciseGlobalMap.get(selectedExerciseName) || null;
  }, [selectedExerciseName, exerciseGlobalMap]);

  // Sorted occurrences for selected exercise (chronological)
  const sortedOccurrences = useMemo(() => {
    if (!activeExerciseData) return [];
    return [...activeExerciseData.occurrences].sort((a, b) => a.date.localeCompare(b.date));
  }, [activeExerciseData]);

  // List of available weeks for comparison
  const availableWeeks = useMemo(() => {
    if (!sortedOccurrences.length) return [1, 2, 3, 4];
    const weeksSet = new Set<number>();
    sortedOccurrences.forEach(o => weeksSet.add(o.weekIndex));
    return Array.from(weeksSet).sort((a, b) => a - b);
  }, [sortedOccurrences]);

  // Handler: Start editing programmed values for a specific workout occurrence
  const handleStartEditProgram = (occ: ExerciseOccurrence) => {
    setEditingDate(occ.date);
    const firstSet = occ.exercise.sets?.[0];
    setEditFormData({
      targetWeightKg: firstSet?.targetWeightKg || 0,
      targetReps: firstSet?.targetReps || '8-10',
      targetRir: firstSet?.targetRir ?? 2,
      targetRpe: firstSet?.targetRpe ?? 8,
      setsCount: occ.exercise.sets?.length || 4,
      notes: occ.exercise.notes || ''
    });
    setIsEditingProgram(true);
  };

  // Handler: Save edited programmed values
  const handleSaveProgramChanges = (date: string) => {
    const workoutToUpdate = workoutsMap[date];
    if (!workoutToUpdate || !workoutToUpdate.exercises) return;

    const updatedExercises = workoutToUpdate.exercises.map((ex) => {
      if (ex.name === selectedExerciseName) {
        // Re-generate or update sets
        const newSets: SetDetail[] = Array.from({ length: editFormData.setsCount }, (_, i) => {
          const existingSet = ex.sets?.[i];
          return {
            id: existingSet?.id || `set-${Date.now()}-${i}`,
            setNumber: i + 1,
            type: existingSet?.type || (i === 0 && editFormData.setsCount > 3 ? 'warmup' : 'work'),
            targetReps: editFormData.targetReps,
            targetWeightKg: editFormData.targetWeightKg,
            targetRir: editFormData.targetRir,
            targetRpe: editFormData.targetRpe,
            actualReps: existingSet?.actualReps,
            actualWeightKg: existingSet?.actualWeightKg,
            actualRir: existingSet?.actualRir,
            actualRpe: existingSet?.actualRpe,
            completed: existingSet?.completed || false,
            restSeconds: existingSet?.restSeconds || 90
          };
        });

        return {
          ...ex,
          notes: editFormData.notes,
          sets: newSets
        };
      }
      return ex;
    });

    const updatedWorkout: DailyWorkout = {
      ...workoutToUpdate,
      exercises: updatedExercises
    };

    if (onUpdateWorkout) {
      onUpdateWorkout(date, updatedWorkout);
    } else if (onUpdateStudent) {
      onUpdateStudent({
        ...student,
        workouts: {
          ...student.workouts,
          [date]: updatedWorkout
        }
      });
    }

    setIsEditingProgram(false);
    setEditingDate(null);
  };

  // Find info from EXERCISE_DATABASE if available
  const exerciseDbInfo = useMemo(() => {
    if (!selectedExerciseName) return null;
    return EXERCISE_DATABASE.find(e => e.name === selectedExerciseName) || null;
  }, [selectedExerciseName]);

  return (
    <div className="bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.1)] p-4 sm:p-5 shadow-sm space-y-5 text-[#f2f2f2]">
      
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[rgba(242,242,242,0.1)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[rgba(255,107,0,0.15)] text-[#ff6b00] border border-[rgba(255,107,0,0.3)] flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#f2f2f2] flex items-center gap-2">
                <span>Panel Global de Ejercicios & Comparador Semanal</span>
                <span className="text-[10px] bg-[rgba(255,107,0,0.15)] text-[#ff6b00] font-bold px-2 py-0.5 rounded-full border border-[rgba(255,107,0,0.3)]">
                  {allUniqueExercisesList.length} Ejercicios Agrupados
                </span>
              </h3>
              <p className="text-[11px] text-[rgba(242,242,242,0.6)]">
                Navegá por <strong>plantillas preagrupadas</strong> o grupos musculares para auditar sobrecarga progresiva y prescribir objetivos.
              </p>
            </div>
          </div>
        </div>

        {/* Global Search and Muscle Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[rgba(242,242,242,0.4)] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar ejercicio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#f2f2f2] placeholder-[rgba(242,242,242,0.4)] focus:outline-none focus:border-[#ff6b00]/60 w-40 sm:w-48"
            />
          </div>

          <select
            value={selectedMuscleFilter}
            onChange={(e) => setSelectedMuscleFilter(e.target.value)}
            className="bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]/60"
          >
            <option value="all">Todos los Músculos</option>
            <option value="Pecho">Pecho</option>
            <option value="Espalda">Espalda</option>
            <option value="Cuádriceps">Cuádriceps</option>
            <option value="Isquios / Glúteo">Isquios / Glúteo</option>
            <option value="Hombros">Hombros</option>
            <option value="Brazos">Brazos</option>
            <option value="Core / Abdomen">Core</option>
            <option value="Pantorrillas">Pantorrillas</option>
          </select>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. SELECTOR PREAGRUPADO POR PLANTILLAS DE ENTRENAMIENTO */}
      {/* ======================================================== */}
      <div className="bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] p-3.5 space-y-3.5">
        
        {/* Plantillas Preagrupadas Quick Buttons */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[rgba(242,242,242,0.7)] flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5 text-[#ff6b00]" />
              <span>Filtrar por Plantilla Preagrupada:</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveGroupMode('templates')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                  activeGroupMode === 'templates' ? 'bg-[#ff6b00] text-white font-bold' : 'text-[rgba(242,242,242,0.6)] hover:text-white'
                }`}
              >
                Por Plantillas
              </button>
              <button
                onClick={() => setActiveGroupMode('muscles')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                  activeGroupMode === 'muscles' ? 'bg-[#ff6b00] text-white font-bold' : 'text-[rgba(242,242,242,0.6)] hover:text-white'
                }`}
              >
                Por Músculo
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedTemplateFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTemplateFilter === 'all'
                  ? 'bg-[#ff6b00] text-white shadow-xs'
                  : 'bg-[#141417] text-[rgba(242,242,242,0.6)] hover:text-[#f2f2f2] border border-[rgba(242,242,242,0.1)]'
              }`}
            >
              ⭐ Todas las Plantillas ({filteredExercisesList.length})
            </button>
            {PREDEFINED_TEMPLATES_CATALOG.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => {
                  setSelectedTemplateFilter(tpl.id);
                  // Also select first exercise from this template if available
                  const firstTplEx = filteredExercisesList.find(e => tpl.exercises.includes(e.name));
                  if (firstTplEx) setSelectedExerciseName(firstTplEx.name);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedTemplateFilter === tpl.id
                    ? 'bg-[#ff6b00] text-white shadow-xs'
                    : 'bg-[#141417] text-[rgba(242,242,242,0.7)] hover:text-[#f2f2f2] border border-[rgba(242,242,242,0.1)]'
                }`}
              >
                <span>{tpl.icon}</span>
                <span>{tpl.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Desplegable Agrupado con <optgroup> */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[rgba(242,242,242,0.1)]">
          <div className="flex-1">
            <label htmlFor="select-exercise-comparison" className="text-[10px] uppercase font-bold text-[rgba(242,242,242,0.6)] block mb-1">
              Desplegable: Seleccionar Ejercicio para Analizar
            </label>
            <select
              id="select-exercise-comparison"
              value={selectedExerciseName}
              onChange={(e) => setSelectedExerciseName(e.target.value)}
              className="w-full bg-[#141417] border border-[rgba(242,242,242,0.15)] rounded-xl p-2.5 text-xs sm:text-sm font-bold text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
            >
              {activeGroupMode === 'templates' ? (
                <>
                  {PREDEFINED_TEMPLATES_CATALOG.map((tpl) => {
                    const tplExercises = filteredExercisesList.filter((ex) => tpl.exercises.includes(ex.name));
                    if (tplExercises.length === 0) return null;
                    return (
                      <optgroup key={tpl.id} label={`📋 Plantilla: ${tpl.name} (${tpl.description})`} className="bg-[#1c1c21] text-[#ff6b00] font-bold">
                        {tplExercises.map((item) => (
                          <option key={`${tpl.id}-${item.name}`} value={item.name} className="bg-[#141417] text-[#f2f2f2] font-normal">
                            {item.name} — [{item.muscleGroup}] {item.occurrences.length > 0 ? `(${item.occurrences.length} sesiones • Máx: ${item.maxWeightOverall}kg)` : '(Plantilla predefinida)'}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                  {/* Additional exercises logged by student not strictly in predefined templates */}
                  {(() => {
                    const allTplNames = new Set(PREDEFINED_TEMPLATES_CATALOG.flatMap(t => t.exercises));
                    const otherExercises = filteredExercisesList.filter(ex => !allTplNames.has(ex.name));
                    if (otherExercises.length === 0) return null;
                    return (
                      <optgroup label="✨ Otros Ejercicios en el Plan" className="bg-[#1c1c21] text-[#f2f2f2] font-bold">
                        {otherExercises.map((item) => (
                          <option key={`other-${item.name}`} value={item.name} className="bg-[#141417] text-[#f2f2f2] font-normal">
                            {item.name} — [{item.muscleGroup}] ({item.occurrences.length} sesiones registradas)
                          </option>
                        ))}
                      </optgroup>
                    );
                  })()}
                </>
              ) : (
                <>
                  {['Pecho', 'Espalda', 'Cuádriceps', 'Isquios / Glúteo', 'Hombros', 'Brazos', 'Core / Abdomen', 'Pantorrillas'].map((muscle) => {
                    const muscleExercises = filteredExercisesList.filter((ex) => ex.muscleGroup === muscle);
                    if (muscleExercises.length === 0) return null;
                    return (
                      <optgroup key={muscle} label={`🏋️ Grupo: ${muscle}`} className="bg-[#1c1c21] text-[#ff6b00] font-bold">
                        {muscleExercises.map((item) => (
                          <option key={`${muscle}-${item.name}`} value={item.name} className="bg-[#141417] text-[#f2f2f2] font-normal">
                            {item.name} — [{item.movementPattern}] {item.occurrences.length > 0 ? `(${item.occurrences.length} sesiones • Máx: ${item.maxWeightOverall}kg)` : '(Base de datos)'}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </>
              )}
            </select>
          </div>

          {/* Quick Metrics of Selected Exercise */}
          {activeExerciseData && (
            <div className="flex flex-wrap items-center gap-2 self-end sm:self-center shrink-0">
              <div className="bg-[#141417] px-3 py-1.5 rounded-xl border border-[rgba(242,242,242,0.1)] text-center min-w-[70px]">
                <span className="text-[9px] uppercase font-medium text-[rgba(242,242,242,0.5)] block">Carga Máx.</span>
                <span className="text-xs font-black text-[#ff6b00]">{activeExerciseData.maxWeightOverall} kg</span>
              </div>
              <div className="bg-[#141417] px-3 py-1.5 rounded-xl border border-[rgba(242,242,242,0.1)] text-center min-w-[70px]">
                <span className="text-[9px] uppercase font-medium text-[rgba(242,242,242,0.5)] block">Series Tot.</span>
                <span className="text-xs font-black text-[#22c55e]">{activeExerciseData.totalSetsLogged} s</span>
              </div>
              <div className="bg-[#141417] px-3 py-1.5 rounded-xl border border-[rgba(242,242,242,0.1)] text-center min-w-[80px]">
                <span className="text-[9px] uppercase font-medium text-[rgba(242,242,242,0.5)] block">Tonelaje</span>
                <span className="text-xs font-black text-[#f2f2f2]">{activeExerciseData.totalTonnageOverall.toLocaleString()} kg</span>
              </div>
            </div>
          )}
        </div>

        {/* Comparison Modes: Timeline vs Pair Compare */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[rgba(242,242,242,0.1)] text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[rgba(242,242,242,0.5)] uppercase">Modo de Comparación:</span>
            <button
              onClick={() => setComparisonMode('timeline')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                comparisonMode === 'timeline'
                  ? 'bg-[#ff6b00] text-white'
                  : 'bg-[#141417] text-[rgba(242,242,242,0.6)] hover:text-[#f2f2f2]'
              }`}
            >
              Línea de Tiempo (Todas las Semanas)
            </button>
            <button
              onClick={() => setComparisonMode('pair')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                comparisonMode === 'pair'
                  ? 'bg-[#ff6b00] text-white'
                  : 'bg-[#141417] text-[rgba(242,242,242,0.6)] hover:text-[#f2f2f2]'
              }`}
            >
              Comparar 2 Semanas Específicas
            </button>
          </div>

          {comparisonMode === 'pair' && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[rgba(242,242,242,0.6)]">Comparar:</span>
              <select
                value={compareWeekA}
                onChange={(e) => setCompareWeekA(parseInt(e.target.value, 10))}
                className="bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg px-2 py-1 text-xs font-bold text-[#f2f2f2]"
              >
                {availableWeeks.map((w) => (
                  <option key={`a-${w}`} value={w}>Semana {w}</option>
                ))}
              </select>
              <ArrowRight className="w-3.5 h-3.5 text-[rgba(242,242,242,0.5)]" />
              <select
                value={compareWeekB}
                onChange={(e) => setCompareWeekB(parseInt(e.target.value, 10))}
                className="bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg px-2 py-1 text-xs font-bold text-[#ff6b00]"
              >
                {availableWeeks.map((w) => (
                  <option key={`b-${w}`} value={w}>Semana {w}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TABLA COMPARATIVA SEMANA A SEMANA (PROGRAMADO VS GUARDADO) */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#f2f2f2] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#22c55e]" />
            <span>Desglose Comparativo por Semanas: {selectedExerciseName}</span>
          </h4>
          <span className="text-[10px] text-[rgba(242,242,242,0.5)]">
            Comparación directa entre lo planificado por el coach y lo guardado por el alumno
          </span>
        </div>

        {sortedOccurrences.length === 0 ? (
          <div className="bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[rgba(255,107,0,0.15)] text-[#ff6b00] border border-[rgba(255,107,0,0.3)] flex items-center justify-center mx-auto">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#f2f2f2]">Ejercicio de Plantilla: {selectedExerciseName}</h5>
              <p className="text-[11px] text-[rgba(242,242,242,0.6)] max-w-md mx-auto mt-0.5">
                {exerciseDbInfo ? `${exerciseDbInfo.muscleGroup} • ${exerciseDbInfo.movementPattern} (${exerciseDbInfo.equipment})` : 'Ejercicio catalogado en plantillas'}
              </p>
            </div>
            {exerciseDbInfo?.coachCues && (
              <div className="max-w-md mx-auto bg-[#141417] p-3 rounded-xl border border-[rgba(242,242,242,0.1)] text-left">
                <span className="text-[9px] uppercase font-bold text-[#ff6b00] block mb-1">Cues Técnicos del Coach:</span>
                <ul className="text-[10px] text-[rgba(242,242,242,0.8)] space-y-1 list-disc list-inside">
                  {exerciseDbInfo.coachCues.map((cue, idx) => (
                    <li key={idx}>{cue}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-[10px] text-[rgba(242,242,242,0.5)] italic">
              Este ejercicio está disponible en las plantillas y se registrará automáticamente en cuanto el alumno complete su primera sesión programada.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {sortedOccurrences
              .filter((occ) => {
                if (comparisonMode === 'pair') {
                  return occ.weekIndex === compareWeekA || occ.weekIndex === compareWeekB;
                }
                return true;
              })
              .map((occ, idx, arr) => {
                const isEditingThis = isEditingProgram && editingDate === occ.date;
                const prevOcc = idx > 0 ? arr[idx - 1] : null;
                const weightDelta = prevOcc ? occ.maxActualWeightKg - prevOcc.maxActualWeightKg : 0;
                const volumeDelta = prevOcc ? occ.totalActualVolumeKg - prevOcc.totalActualVolumeKg : 0;

                return (
                  <div
                    key={occ.date}
                    className="bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] overflow-hidden transition-all hover:border-[rgba(242,242,242,0.2)]"
                  >
                    {/* Header of Week / Day */}
                    <div className="p-3 bg-[#141417] border-b border-[rgba(242,242,242,0.1)] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-black bg-[rgba(255,107,0,0.15)] text-[#ff6b00] px-2.5 py-1 rounded-lg border border-[rgba(255,107,0,0.3)]">
                          Semana {occ.weekIndex}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#f2f2f2]">
                              {occ.dayName} • {occ.date}
                            </span>
                            <span className="text-[10px] text-[rgba(242,242,242,0.5)]">({occ.workoutTitle})</span>
                          </div>
                          <span className="text-[10px] text-[rgba(242,242,242,0.6)]">
                            Mes {occ.monthIndex} • {occ.completedSetsCount}/{occ.totalSetsCount} Series Realizadas
                          </span>
                        </div>
                      </div>

                      {/* Coach Edit Button & Progression Badges */}
                      <div className="flex items-center gap-2">
                        {prevOcc && (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                                weightDelta >= 0
                                  ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e] border-[rgba(34,197,94,0.25)]'
                                  : 'bg-[rgba(255,107,0,0.15)] text-[#ff6b00] border-[rgba(255,107,0,0.3)]'
                              }`}
                            >
                              {weightDelta >= 0 ? `+${weightDelta} kg` : `${weightDelta} kg`} vs sem. ant.
                            </span>
                          </div>
                        )}

                        <button
                          onClick={() => handleStartEditProgram(occ)}
                          className="px-2.5 py-1 rounded-lg bg-[#26262b] hover:bg-[#323238] text-[#f2f2f2] border border-[rgba(242,242,242,0.15)] text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3 text-[#ff6b00]" />
                          <span>Editar Programación</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Inline Coach Editor if active */}
                    {isEditingThis && (
                      <div className="p-3.5 bg-[#26262b]/80 border-b border-[rgba(242,242,242,0.15)] space-y-3 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#ff6b00] flex items-center gap-1.5">
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Modificar Prescripción Técnica para Semana {occ.weekIndex} ({occ.date})</span>
                          </span>
                          <button
                            onClick={() => setIsEditingProgram(false)}
                            className="text-[10px] text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2]"
                          >
                            Cancelar
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                          <div>
                            <label className="text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] block mb-1">
                              Peso Objetivo (kg)
                            </label>
                            <input
                              type="number"
                              value={editFormData.targetWeightKg}
                              onChange={(e) => setEditFormData({ ...editFormData, targetWeightKg: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-[#141417] border border-[rgba(242,242,242,0.15)] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] block mb-1">
                              Repes Objetivo
                            </label>
                            <input
                              type="text"
                              value={editFormData.targetReps}
                              onChange={(e) => setEditFormData({ ...editFormData, targetReps: e.target.value })}
                              className="w-full bg-[#141417] border border-[rgba(242,242,242,0.15)] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] block mb-1">
                              RIR Objetivo
                            </label>
                            <input
                              type="number"
                              value={editFormData.targetRir}
                              onChange={(e) => setEditFormData({ ...editFormData, targetRir: parseInt(e.target.value, 10) || 0 })}
                              className="w-full bg-[#141417] border border-[rgba(242,242,242,0.15)] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] block mb-1">
                              RPE Objetivo
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              value={editFormData.targetRpe}
                              onChange={(e) => setEditFormData({ ...editFormData, targetRpe: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-[#141417] border border-[rgba(242,242,242,0.15)] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] block mb-1">
                              Cant. de Series
                            </label>
                            <input
                              type="number"
                              value={editFormData.setsCount}
                              onChange={(e) => setEditFormData({ ...editFormData, setsCount: parseInt(e.target.value, 10) || 1 })}
                              className="w-full bg-[#141417] border border-[rgba(242,242,242,0.15)] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => handleSaveProgramChanges(occ.date)}
                            className="px-4 py-1.5 bg-[#ff6b00] hover:bg-[#e65e00] text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Guardar Nueva Prescripción</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Detailed Comparison Columns: TARGET (COACH) VS ACTUAL (ALUMNO) */}
                    <div className="p-3.5 grid grid-cols-1 md:grid-cols-2 gap-3">
                      
                      {/* Left: Programmed by Coach */}
                      <div className="bg-[#141417] rounded-xl border border-[rgba(242,242,242,0.1)] p-3 space-y-2">
                        <div className="flex items-center justify-between border-b border-[rgba(242,242,242,0.1)] pb-1.5">
                          <span className="text-[10px] font-bold uppercase text-[rgba(242,242,242,0.6)]">
                            📋 Prescrito por el Coach
                          </span>
                          <span className="text-[10px] text-[rgba(242,242,242,0.4)]">
                            {occ.exercise.sets?.length || 0} series programadas
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {(occ.exercise.sets || []).map((s, sIdx) => (
                            <div
                              key={s.id || sIdx}
                              className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[#1c1c21] border border-[rgba(242,242,242,0.1)]"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-[#141417] text-[rgba(242,242,242,0.5)] font-bold text-[10px] flex items-center justify-center">
                                  #{s.setNumber}
                                </span>
                                <span className="font-bold text-[#f2f2f2]">
                                  {s.targetWeightKg ? `${s.targetWeightKg} kg` : 'Sin carga'} × {s.targetReps} reps
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-[10px] text-[rgba(242,242,242,0.6)]">
                                <span>RIR {s.targetRir ?? 2}</span>
                                <span>•</span>
                                <span>RPE {s.targetRpe ?? 8}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Logged by Student */}
                      <div className="bg-[#141417] rounded-xl border border-[rgba(242,242,242,0.1)] p-3 space-y-2">
                        <div className="flex items-center justify-between border-b border-[rgba(242,242,242,0.1)] pb-1.5">
                          <span className="text-[10px] font-bold uppercase text-[#22c55e] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#22c55e]" />
                            <span>Guardado por el Alumno</span>
                          </span>
                          <span className="text-[10px] font-bold text-[#ff6b00]">
                            Tonelaje: {occ.totalActualVolumeKg.toLocaleString()} kg
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {(occ.exercise.sets || []).map((s, sIdx) => {
                            const isDone = s.completed;
                            return (
                              <div
                                key={`act-${s.id || sIdx}`}
                                className={`flex items-center justify-between text-xs py-1 px-2 rounded-lg border ${
                                  isDone
                                    ? 'bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.25)]'
                                    : 'bg-[#1c1c21] border-[rgba(242,242,242,0.1)] opacity-60'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center ${
                                      isDone ? 'bg-[rgba(34,197,94,0.2)] text-[#22c55e]' : 'bg-[#141417] text-[rgba(242,242,242,0.5)]'
                                    }`}
                                  >
                                    #{s.setNumber}
                                  </span>
                                  <span className="font-bold text-[#f2f2f2]">
                                    {s.actualWeightKg !== undefined ? `${s.actualWeightKg} kg` : `${s.targetWeightKg || 0} kg`} × {s.actualReps !== undefined ? `${s.actualReps} reps` : s.targetReps}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-[10px]">
                                  {isDone ? (
                                    <>
                                      <span className="text-[#ff6b00] font-bold">RIR {s.actualRir ?? s.targetRir ?? 2}</span>
                                      <span className="text-[rgba(242,242,242,0.4)]">•</span>
                                      <span className="text-[#f2f2f2] font-bold">RPE {s.actualRpe ?? s.targetRpe ?? 8}</span>
                                      <span className="text-[9px] bg-[rgba(34,197,94,0.2)] text-[#22c55e] px-1 rounded font-bold">OK</span>
                                    </>
                                  ) : (
                                    <span className="text-[rgba(242,242,242,0.4)] italic text-[10px]">Pendiente</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. MATRIZ CONSOLIDADA DE TODOS LOS EJERCICIOS DEL PLAN */}
      {/* ======================================================== */}
      <div className="bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(242,242,242,0.1)] pb-2.5">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#f2f2f2] flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#ff6b00]" />
              <span>Matriz Resumen de Ejercicios del Macrociclo</span>
            </h4>
            <p className="text-[10px] text-[rgba(242,242,242,0.5)]">
              Resumen acumulado de todos los ejercicios registrados y su rendimiento
            </p>
          </div>
          <span className="text-[10px] font-bold text-[rgba(242,242,242,0.5)]">
            Total {allUniqueExercisesList.length} ejercicios registrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[rgba(242,242,242,0.1)] text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)]">
                <th className="pb-2">Ejercicio</th>
                <th className="pb-2">Grupo Muscular</th>
                <th className="pb-2">Patrón</th>
                <th className="pb-2 text-center">Semanas</th>
                <th className="pb-2 text-center">Series Tot.</th>
                <th className="pb-2 text-right">Carga Máx.</th>
                <th className="pb-2 text-right">Tonelaje Total</th>
                <th className="pb-2 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(242,242,242,0.1)]">
              {allUniqueExercisesList.slice(0, 15).map((ex) => (
                <tr
                  key={ex.name}
                  onClick={() => setSelectedExerciseName(ex.name)}
                  className={`hover:bg-[#26262b] cursor-pointer transition-colors ${
                    selectedExerciseName === ex.name ? 'bg-[#26262b] text-[#f2f2f2]' : 'text-[rgba(242,242,242,0.7)]'
                  }`}
                >
                  <td className="py-2.5 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ff6b00]" />
                    <span>{ex.name}</span>
                  </td>
                  <td className="py-2.5 text-[11px] text-[rgba(242,242,242,0.6)]">{ex.muscleGroup}</td>
                  <td className="py-2.5 text-[11px] text-[rgba(242,242,242,0.5)]">{ex.movementPattern}</td>
                  <td className="py-2.5 text-center font-bold text-[#ff6b00]">
                    {ex.uniqueWeeks.size} sem
                  </td>
                  <td className="py-2.5 text-center font-bold text-[#22c55e]">
                    {ex.totalSetsLogged}
                  </td>
                  <td className="py-2.5 text-right font-black text-[#f2f2f2]">
                    {ex.maxWeightOverall > 0 ? `${ex.maxWeightOverall} kg` : '-'}
                  </td>
                  <td className="py-2.5 text-right font-bold text-[#f2f2f2]">
                    {ex.totalTonnageOverall > 0 ? `${ex.totalTonnageOverall.toLocaleString()} kg` : '-'}
                  </td>
                  <td className="py-2.5 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExerciseName(ex.name);
                      }}
                      className="px-2 py-0.5 rounded bg-[#141417] hover:bg-[#ff6b00] hover:text-white text-[10px] text-[#ff6b00] font-bold border border-[rgba(242,242,242,0.1)] transition-colors"
                    >
                      Analizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
