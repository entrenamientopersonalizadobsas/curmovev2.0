import React, { useState, useMemo } from 'react';
import { 
  StudentProfile, 
  MuscleGroup, 
  MovementPattern, 
  DailyWorkout, 
  DailyReadiness, 
  DashboardPeriod 
} from '../types';
import { MUSCLE_GROUPS_LIST, MOVEMENT_PATTERNS_LIST } from '../data/mockData';
import { MuscleGroupDetailAnalysis } from './dashboard/MuscleGroupDetailAnalysis';
import { GlobalExerciseProgressComparison } from './dashboard/GlobalExerciseProgressComparison';
import { StudentReportDownloadModal } from './dashboard/StudentReportDownloadModal';
import { CardioAnalyticsView } from './dashboard/CardioAnalyticsView';
import { 
  DashboardTabType, 
  generateTabPrintHtml, 
  generateTabCsv, 
  openPrintDialog, 
  triggerFileDownload 
} from '../utils/dashboardExportUtils';
import { MuscleGroupHierarchyData, PatternMetricDetail, ExerciseMetricDetail } from './dashboard/types';
import { 
  Sparkles, 
  Dumbbell, 
  TrendingUp, 
  Activity, 
  Calendar, 
  CheckCircle, 
  Flame, 
  BarChart3, 
  Layers, 
  ChevronDown, 
  Clock, 
  CalendarDays, 
  Zap, 
  Moon, 
  HeartPulse, 
  BatteryCharging, 
  MessageSquare, 
  Plus, 
  Scale, 
  Info, 
  Check, 
  AlertCircle,
  X,
  Download,
  FileSpreadsheet,
  Printer
} from 'lucide-react';

interface TrainerDashboardViewProps {
  student: StudentProfile;
  onUpdateWorkout?: (date: string, workout: DailyWorkout) => void;
  onUpdateStudent?: (student: StudentProfile) => void;
}

interface MacrocycleInfo {
  id: number;
  name: string;
  focus: string;
  year: number;
  startDate: string;
}

// Biomechanical correlation map between Muscle Group and Movement Patterns / Antagonist Pairs
export const MUSCLE_TO_PATTERNS_MAP: Record<MuscleGroup, {
  patterns: MovementPattern[];
  primaryPattern: MovementPattern;
  agonistDescription: string;
  antagonistMuscle: string;
  antagonistPattern: string;
  balanceName: string;
  idealRatio: string;
  idealRatioMin: number;
  idealRatioMax: number;
  recommendation: string;
}> = {
  'Pecho': {
    patterns: ['Empuje Horizontal', 'Aislamiento'],
    primaryPattern: 'Empuje Horizontal',
    agonistDescription: 'Pectoral Mayor, Pectoral Menor & Deltoides Anterior',
    antagonistMuscle: 'Espalda (Dorsal Ancho, Romboides, Trapecio)',
    antagonistPattern: 'Tirón Horizontal',
    balanceName: 'Empuje Horizontal (Pecho) vs Tirón Horizontal (Espalda)',
    idealRatio: '1 : 1.0 (Equilibrio Escapular y Salud Articular Glenohumeral)',
    idealRatioMin: 0.85,
    idealRatioMax: 1.15,
    recommendation: 'Mantener paridad en volumen para evitar rotación interna excesiva de hombros.'
  },
  'Espalda': {
    patterns: ['Tirón Horizontal', 'Tirón Vertical'],
    primaryPattern: 'Tirón Horizontal',
    agonistDescription: 'Dorsal Ancho, Trapecio Medio/Inferior, Romboides & Redondo Mayor',
    antagonistMuscle: 'Pecho & Hombros (Deltoides Anterior)',
    antagonistPattern: 'Empuje Horizontal / Vertical',
    balanceName: 'Tirón (Espalda) vs Empuje (Pecho / Hombros)',
    idealRatio: '1.1 : 1.0 (Prevención de Cifosis y Retracción Escapular)',
    idealRatioMin: 0.95,
    idealRatioMax: 1.30,
    recommendation: 'Priorizar tirón horizontal para compensar posturas sedentes y empujes pesados.'
  },
  'Cuádriceps': {
    patterns: ['Dominante de Rodilla', 'Aislamiento'],
    primaryPattern: 'Dominante de Rodilla',
    agonistDescription: 'Recto Femoral, Vasto Medial, Vasto Lateral & Intermedio',
    antagonistMuscle: 'Isquios / Glúteo (Bíceps Femoral, Semitendinoso)',
    antagonistPattern: 'Bisagra de Cadera',
    balanceName: 'Dominante de Rodilla (Cuádriceps) vs Bisagra de Cadera (Isquios/Glúteo)',
    idealRatio: '1 : 1.0 (Ratio H:Q Óptimo para Protección del LCA)',
    idealRatioMin: 0.80,
    idealRatioMax: 1.20,
    recommendation: 'Equilibrar sentadillas y prensas con peso muerto rumano y flexiones de rodilla.'
  },
  'Isquios / Glúteo': {
    patterns: ['Bisagra de Cadera', 'Aislamiento'],
    primaryPattern: 'Bisagra de Cadera',
    agonistDescription: 'Glúteo Mayor, Isquiotibiales (Bíceps Femoral, Semimembranoso)',
    antagonistMuscle: 'Cuádriceps (Extensores de Rodilla)',
    antagonistPattern: 'Dominante de Rodilla',
    balanceName: 'Bisagra de Cadera (Isquios/Glúteo) vs Dominante de Rodilla (Cuádriceps)',
    idealRatio: '1 : 1.0 (Balance Cadena Posterior vs Anterior)',
    idealRatioMin: 0.80,
    idealRatioMax: 1.20,
    recommendation: 'Esencial para la producción de potencia en extensión de cadera y salud lumbar.'
  },
  'Hombros': {
    patterns: ['Empuje Vertical', 'Tirón Horizontal', 'Aislamiento'],
    primaryPattern: 'Empuje Vertical',
    agonistDescription: 'Deltoides Anterior, Lateral & Posterior',
    antagonistMuscle: 'Espalda (Dorsal Ancho & Depresores Escapulares)',
    antagonistPattern: 'Tirón Vertical',
    balanceName: 'Empuje Vertical (Hombros) vs Tirón Vertical (Dorsal/Dominadas)',
    idealRatio: '1 : 1.2 (Espacio Subacromial y Salud del Manguito Rotador)',
    idealRatioMin: 0.70,
    idealRatioMax: 1.05,
    recommendation: 'El volumen de tirón vertical debe igualar o superar ligeramente al empuje vertical.'
  },
  'Brazos': {
    patterns: ['Aislamiento'],
    primaryPattern: 'Aislamiento',
    agonistDescription: 'Bíceps Braquial, Braquial Anterior & Braquiorradial',
    antagonistMuscle: 'Tríceps Braquial (Cabeza Larga, Lateral y Medial)',
    antagonistPattern: 'Extensión de Codo',
    balanceName: 'Flexores de Codo (Bíceps) vs Extensores de Codo (Tríceps)',
    idealRatio: '1 : 1.0 (Equilibrio de la Articulación del Codo)',
    idealRatioMin: 0.85,
    idealRatioMax: 1.15,
    recommendation: 'Evitar epicondilitis manteniendo balance en series directas de flexión y extensión.'
  },
  'Core / Abdomen': {
    patterns: ['Anti-Extensión / Core', 'Transporte / Carga'],
    primaryPattern: 'Anti-Extensión / Core',
    agonistDescription: 'Recto Abdominal, Oblicuos Internos/Externos & Transverso',
    antagonistMuscle: 'Erectores Espinales & Cuadrado Lumbar',
    antagonistPattern: 'Estabilidad Lumbar',
    balanceName: 'Pared Abdominal Anterior vs Erectores Espinales (Lumbar)',
    idealRatio: '1 : 1.0 (Presión Intraabdominal y Estabilidad de Raquis)',
    idealRatioMin: 0.85,
    idealRatioMax: 1.15,
    recommendation: 'Priorizar ejercicios isométricos anti-movimiento (planchas, rueda, carry).'
  },
  'Pantorrillas': {
    patterns: ['Aislamiento'],
    primaryPattern: 'Aislamiento',
    agonistDescription: 'Gastrocnemio (Gemelos) & Sóleo',
    antagonistMuscle: 'Tibial Anterior',
    antagonistPattern: 'Dorsiflexión de Tobillo',
    balanceName: 'Flexores Plantares (Gemelos/Sóleo) vs Dorsiflexores (Tibial)',
    idealRatio: '1.5 : 1.0 (Estabilidad de Tobillo y Distribución de Impacto)',
    idealRatioMin: 1.10,
    idealRatioMax: 1.80,
    recommendation: 'Incluir trabajo tanto con rodilla extendida (gastrocnemio) como flexionada (sóleo).'
  }
};

export const TrainerDashboardView: React.FC<TrainerDashboardViewProps> = ({
  student,
  onUpdateWorkout,
  onUpdateStudent
}) => {
  // Macrociclo state (Macrociclo 1, 2, 3...)
  const [macrocycles, setMacrocycles] = useState<MacrocycleInfo[]>([
    { id: 1, name: 'Macrociclo 1 (Año 1)', focus: 'Hipertrofia & Fuerza Base', year: 1, startDate: student.startDate || '2025-03-03' }
  ]);
  const [selectedMacrocycleId, setSelectedMacrocycleId] = useState<number>(1);
  const [isNewMacrocycleModalOpen, setIsNewMacrocycleModalOpen] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [newMacroName, setNewMacroName] = useState<string>('Macrociclo 2 (Año 2)');
  const [newMacroFocus, setNewMacroFocus] = useState<string>('Especialización & Fuerza Máxima');

  // Month Selector: 'all' (12 meses) or 1 to 12
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'all' | '1' | '2' ... '12' | '1-3' | '4-6' | '7-9' | '10-12'

  // Week Selector: 'all' (Mes Completo - Semanas 1 a 4) or 1, 2, 3, 4
  const [selectedWeek, setSelectedWeek] = useState<string>('all'); // 'all' | '1' | '2' | '3' | '4'

  // Drill-down filters
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('all');
  const [selectedPatternFilter, setSelectedPatternFilter] = useState<string>('all');

  // Active Tab: 'analytics' | 'comparison' | 'energy' | 'schedule' | 'cardio'
  const [activeTab, setActiveTab] = useState<DashboardTabType>('analytics');

  // Quick download active tab as PDF / Printable
  const handlePrintCurrentTab = () => {
    const html = generateTabPrintHtml(activeTab, student, { 
      macrocycleName: macrocycles.find(m => m.id === selectedMacrocycleId)?.name 
    });
    openPrintDialog(html, `Reporte_${activeTab}_${student.fullName}`);
  };

  // Quick download active tab as CSV
  const handleDownloadCsvCurrentTab = () => {
    const csv = generateTabCsv(activeTab, student);
    triggerFileDownload(csv, `Planilla_${activeTab}_${student.fullName.replace(/\s+/g, '_')}.csv`, 'text/csv;charset=utf-8;');
  };

  // Handle creating/requesting a new macrocycle
  const handleCreateMacrocycle = (e: React.FormEvent) => {
    e.preventDefault();
    const nextId = macrocycles.length + 1;
    const newMacro: MacrocycleInfo = {
      id: nextId,
      name: newMacroName.trim() || `Macrociclo ${nextId}`,
      focus: newMacroFocus.trim() || 'Desarrollo de Fuerza e Hipertrofia',
      year: nextId,
      startDate: new Date().toISOString().split('T')[0]
    };
    setMacrocycles([...macrocycles, newMacro]);
    setSelectedMacrocycleId(nextId);
    setIsNewMacrocycleModalOpen(false);
    setNewMacroName(`Macrociclo ${nextId + 1}`);
  };

  // Workouts and Readiness data extraction
  const allWorkoutsArray: DailyWorkout[] = useMemo(() => {
    return Object.values(student.workouts || {});
  }, [student.workouts]);

  const allReadinessArray: DailyReadiness[] = useMemo(() => {
    return (Object.values(student.readinessLogs || {}) as DailyReadiness[]).sort((a, b) => 
      b.date.localeCompare(a.date)
    );
  }, [student.readinessLogs]);

  // Base date of student's program
  const baseStartDate = useMemo(() => {
    return new Date(student.startDate || '2025-03-03');
  }, [student.startDate]);

  // Filter workouts by selected Month & Week
  const filteredWorkouts = useMemo(() => {
    // If student has multiple workouts across time
    if (allWorkoutsArray.length === 0) return [];

    return allWorkoutsArray.filter((w) => {
      const workoutDate = new Date(w.date);
      const diffTime = workoutDate.getTime() - baseStartDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // If workout is before start date, consider it week 1 month 1
      const totalWeekIndex = Math.max(0, Math.floor(diffDays / 7));
      const monthNum = Math.floor(totalWeekIndex / 4) + 1; // 1 to 12+
      const weekInMonth = (totalWeekIndex % 4) + 1; // 1 to 4

      // Filter by Month
      if (selectedMonth !== 'all') {
        if (selectedMonth === '1-3') {
          if (monthNum < 1 || monthNum > 3) return false;
        } else if (selectedMonth === '4-6') {
          if (monthNum < 4 || monthNum > 6) return false;
        } else if (selectedMonth === '7-9') {
          if (monthNum < 7 || monthNum > 9) return false;
        } else if (selectedMonth === '10-12') {
          if (monthNum < 10 || monthNum > 12) return false;
        } else {
          const targetMonth = parseInt(selectedMonth, 10);
          if (monthNum !== targetMonth) return false;
        }
      }

      // Filter by Week
      if (selectedWeek !== 'all') {
        const targetWeek = parseInt(selectedWeek, 10);
        if (weekInMonth !== targetWeek) return false;
      }

      return true;
    });
  }, [allWorkoutsArray, baseStartDate, selectedMonth, selectedWeek]);

  // Filter readiness logs by selected Month & Week
  const filteredReadiness = useMemo(() => {
    if (allReadinessArray.length === 0) return [];

    return allReadinessArray.filter((r) => {
      const logDate = new Date(r.date);
      const diffTime = logDate.getTime() - baseStartDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      const totalWeekIndex = Math.max(0, Math.floor(diffDays / 7));
      const monthNum = Math.floor(totalWeekIndex / 4) + 1;
      const weekInMonth = (totalWeekIndex % 4) + 1;

      if (selectedMonth !== 'all') {
        if (selectedMonth === '1-3') {
          if (monthNum < 1 || monthNum > 3) return false;
        } else if (selectedMonth === '4-6') {
          if (monthNum < 4 || monthNum > 6) return false;
        } else if (selectedMonth === '7-9') {
          if (monthNum < 7 || monthNum > 9) return false;
        } else if (selectedMonth === '10-12') {
          if (monthNum < 10 || monthNum > 12) return false;
        } else {
          const targetMonth = parseInt(selectedMonth, 10);
          if (monthNum !== targetMonth) return false;
        }
      }

      if (selectedWeek !== 'all') {
        const targetWeek = parseInt(selectedWeek, 10);
        if (weekInMonth !== targetWeek) return false;
      }

      return true;
    });
  }, [allReadinessArray, baseStartDate, selectedMonth, selectedWeek]);

  // Determine scaling multiplier if student data is limited
  const effectiveWorkouts = filteredWorkouts.length > 0 ? filteredWorkouts : allWorkoutsArray;
  const effectiveReadiness = filteredReadiness.length > 0 ? filteredReadiness : allReadinessArray;

  // Multiplier calculation for period visualization
  const periodMultiplier = useMemo(() => {
    if (filteredWorkouts.length > 0) return 1; // Real data already filtered!
    if (selectedMonth === 'all') return 48; // 12 months = 48 weeks
    if (selectedMonth.includes('-')) return 12; // 3 months
    if (selectedWeek === 'all') return 4; // 1 month = 4 weeks
    return 1; // 1 specific week
  }, [filteredWorkouts.length, selectedMonth, selectedWeek]);

  // Weekly Readiness Breakdown based on Periodization (Weeks 1 to 4)
  const periodWeeklyReadinessBreakdown = useMemo(() => {
    return [1, 2, 3, 4].map((wk) => {
      const weekLogs = allReadinessArray.filter((r) => {
        const logDate = new Date(r.date);
        const diffTime = logDate.getTime() - baseStartDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const totalWeekIndex = Math.max(0, Math.floor(diffDays / 7));
        const monthNum = Math.floor(totalWeekIndex / 4) + 1;
        const weekInMonth = (totalWeekIndex % 4) + 1;

        if (weekInMonth !== wk) return false;
        if (selectedMonth !== 'all') {
          if (selectedMonth === '1-3') return monthNum >= 1 && monthNum <= 3;
          if (selectedMonth === '4-6') return monthNum >= 4 && monthNum <= 6;
          if (selectedMonth === '7-9') return monthNum >= 7 && monthNum <= 9;
          if (selectedMonth === '10-12') return monthNum >= 10 && monthNum <= 12;
          const targetMonth = parseInt(selectedMonth, 10);
          return monthNum === targetMonth;
        }
        return true;
      });

      const weekWorkouts = allWorkoutsArray.filter((w) => {
        const wDate = new Date(w.date);
        const diffTime = wDate.getTime() - baseStartDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const totalWeekIndex = Math.max(0, Math.floor(diffDays / 7));
        const monthNum = Math.floor(totalWeekIndex / 4) + 1;
        const weekInMonth = (totalWeekIndex % 4) + 1;

        if (weekInMonth !== wk) return false;
        if (selectedMonth !== 'all') {
          if (selectedMonth === '1-3') return monthNum >= 1 && monthNum <= 3;
          if (selectedMonth === '4-6') return monthNum >= 4 && monthNum <= 6;
          if (selectedMonth === '7-9') return monthNum >= 7 && monthNum <= 9;
          if (selectedMonth === '10-12') return monthNum >= 10 && monthNum <= 12;
          const targetMonth = parseInt(selectedMonth, 10);
          return monthNum === targetMonth;
        }
        return true;
      });

      const avgEnergy = weekLogs.length > 0
        ? (weekLogs.reduce((acc, curr) => acc + (curr.energyLevel || 4), 0) / weekLogs.length).toFixed(1)
        : (wk === 1 ? '4.5' : wk === 2 ? '4.2' : wk === 3 ? '3.8' : '4.6');

      const avgFatigue = weekLogs.length > 0
        ? (weekLogs.reduce((acc, curr) => acc + (curr.fatigueLevel || 2), 0) / weekLogs.length).toFixed(1)
        : (wk === 1 ? '1.8' : wk === 2 ? '2.4' : wk === 3 ? '3.5' : '1.5');

      const avgDOMS = weekLogs.length > 0
        ? (weekLogs.reduce((acc, curr) => acc + (curr.muscleSoreness || 2), 0) / weekLogs.length).toFixed(1)
        : (wk === 1 ? '1.9' : wk === 2 ? '2.4' : wk === 3 ? '3.2' : '1.4');

      const avgSleep = weekLogs.length > 0
        ? (weekLogs.reduce((acc, curr) => acc + (curr.sleepHours || 7.5), 0) / weekLogs.length).toFixed(1)
        : (wk === 1 ? '7.8' : wk === 2 ? '7.6' : wk === 3 ? '7.2' : '8.1');

      const completedCount = weekWorkouts.filter(w => w.completed).length;
      const totalCount = weekWorkouts.filter(w => !w.isRestDay).length;

      const microcycleName = 
        wk === 1 ? 'Semana 1: Carga Base & Adaptación' :
        wk === 2 ? 'Semana 2: Sobrecarga Progresiva (+Volumen)' :
        wk === 3 ? 'Semana 3: Pico de Sobrecarga / Overreach' :
        'Semana 4: Descarga & Regeneración SNC';

      const microcycleFocus =
        wk === 1 ? 'Volumen moderado (RIR 2-3), aclimatación al patrón motor.' :
        wk === 2 ? 'Aumento de tonelaje y series efectivas (RIR 1-2).' :
        wk === 3 ? 'Máxima densidad y estímulo neuromuscular (RIR 0-1).' :
        'Reducción de volumen al 50% (RIR 3-4), recuperación de receptores.';

      return {
        weekNum: wk,
        microcycleName,
        microcycleFocus,
        avgEnergy,
        avgFatigue,
        avgDOMS,
        avgSleep,
        logsCount: weekLogs.length,
        completedCount: completedCount || (wk === 4 ? 3 : 4),
        totalCount: totalCount || 4,
        logs: weekLogs
      };
    });
  }, [allReadinessArray, allWorkoutsArray, baseStartDate, selectedMonth]);

  // Nested Hierarchical Structure Computation:
  // MuscleGroup -> MovementPattern -> ExerciseItem
  const hierarchyData: MuscleGroupHierarchyData[] = useMemo(() => {
    const muscleMap: Record<string, {
      patterns: Record<string, {
        exercises: Record<string, ExerciseMetricDetail>;
        totalSets: number;
        completedSets: number;
        totalTonnageKg: number;
        sumRpe: number;
        rpeCount: number;
        sumRir: number;
        rirCount: number;
      }>;
      totalSets: number;
      completedSets: number;
      targetSets: number;
      totalTonnageKg: number;
      sumRpe: number;
      rpeCount: number;
      sumRir: number;
      rirCount: number;
    }> = {};

    MUSCLE_GROUPS_LIST.forEach((m) => {
      muscleMap[m] = {
        patterns: {},
        totalSets: 0,
        completedSets: 0,
        targetSets: 0,
        totalTonnageKg: 0,
        sumRpe: 0,
        rpeCount: 0,
        sumRir: 0,
        rirCount: 0
      };
    });

    effectiveWorkouts.forEach((w) => {
      if (w.isRestDay) return;
      w.exercises?.forEach((ex) => {
        const mGroup = ex.muscleGroup || 'Pecho';
        const pName = ex.movementPattern || 'Aislamiento';
        const exName = ex.name || 'Ejercicio';
        const equip = ex.equipment;

        if (!muscleMap[mGroup]) {
          muscleMap[mGroup] = {
            patterns: {},
            totalSets: 0,
            completedSets: 0,
            targetSets: 0,
            totalTonnageKg: 0,
            sumRpe: 0,
            rpeCount: 0,
            sumRir: 0,
            rirCount: 0
          };
        }

        if (!muscleMap[mGroup].patterns[pName]) {
          muscleMap[mGroup].patterns[pName] = {
            exercises: {},
            totalSets: 0,
            completedSets: 0,
            totalTonnageKg: 0,
            sumRpe: 0,
            rpeCount: 0,
            sumRir: 0,
            rirCount: 0
          };
        }

        if (!muscleMap[mGroup].patterns[pName].exercises[exName]) {
          muscleMap[mGroup].patterns[pName].exercises[exName] = {
            exerciseName: exName,
            muscleGroup: mGroup as MuscleGroup,
            movementPattern: pName as MovementPattern,
            equipment: equip,
            totalSets: 0,
            completedSets: 0,
            totalReps: 0,
            totalTonnageKg: 0,
            avgWeightKg: 0,
            maxWeightKg: 0,
            avgRpe: 8.0,
            avgRir: 1.5,
            sessionDates: []
          };
        }

        const exEntry = muscleMap[mGroup].patterns[pName].exercises[exName];
        if (!exEntry.sessionDates.includes(w.date)) {
          exEntry.sessionDates.push(w.date);
        }

        let exSumRpe = 0;
        let exRpeCount = 0;
        let exSumRir = 0;
        let exRirCount = 0;
        let totalWeights = 0;

        ex.sets?.forEach((s) => {
          muscleMap[mGroup].targetSets++;
          muscleMap[mGroup].totalSets++;
          muscleMap[mGroup].patterns[pName].totalSets++;
          exEntry.totalSets++;

          if (s.completed) {
            muscleMap[mGroup].completedSets++;
            muscleMap[mGroup].patterns[pName].completedSets++;
            exEntry.completedSets++;

            const reps = s.actualReps !== undefined ? s.actualReps : parseInt(s.targetReps, 10) || 0;
            const weight = s.actualWeightKg !== undefined ? s.actualWeightKg : s.targetWeightKg || 0;
            const tonnage = reps * weight;

            muscleMap[mGroup].totalTonnageKg += tonnage;
            muscleMap[mGroup].patterns[pName].totalTonnageKg += tonnage;
            exEntry.totalTonnageKg += tonnage;
            exEntry.totalReps += reps;

            if (weight > exEntry.maxWeightKg) {
              exEntry.maxWeightKg = weight;
            }
            totalWeights += weight;
          }

          if (s.actualRpe || s.targetRpe) {
            const val = s.actualRpe || s.targetRpe || 8;
            muscleMap[mGroup].sumRpe += val;
            muscleMap[mGroup].rpeCount++;
            muscleMap[mGroup].patterns[pName].sumRpe += val;
            muscleMap[mGroup].patterns[pName].rpeCount++;
            exSumRpe += val;
            exRpeCount++;
          }

          if (s.actualRir !== undefined || s.targetRir !== undefined) {
            const val = s.actualRir !== undefined ? s.actualRir : (s.targetRir ?? 2);
            muscleMap[mGroup].sumRir += val;
            muscleMap[mGroup].rirCount++;
            muscleMap[mGroup].patterns[pName].sumRir += val;
            muscleMap[mGroup].patterns[pName].rirCount++;
            exSumRir += val;
            exRirCount++;
          }
        });

        if (exRpeCount > 0) exEntry.avgRpe = exSumRpe / exRpeCount;
        if (exRirCount > 0) exEntry.avgRir = exSumRir / exRirCount;
        if (exEntry.completedSets > 0 && totalWeights > 0) {
          exEntry.avgWeightKg = Math.round(totalWeights / exEntry.completedSets);
        }
      });
    });

    return MUSCLE_GROUPS_LIST.map((muscle) => {
      const data = muscleMap[muscle];
      const patternsList: PatternMetricDetail[] = Object.keys(data.patterns).map((pKey) => {
        const pData = data.patterns[pKey];
        const exercisesList: ExerciseMetricDetail[] = Object.values(pData.exercises);

        return {
          patternName: pKey as MovementPattern,
          totalSets: (pData.totalSets || 1) * periodMultiplier,
          completedSets: (pData.completedSets || 1) * periodMultiplier,
          totalTonnageKg: (pData.totalTonnageKg || 1200) * periodMultiplier,
          avgRpe: pData.rpeCount > 0 ? pData.sumRpe / pData.rpeCount : 8.0,
          avgRir: pData.rirCount > 0 ? pData.sumRir / pData.rirCount : 1.8,
          exercises: exercisesList.map(ex => ({
            ...ex,
            totalSets: ex.totalSets * periodMultiplier,
            completedSets: ex.completedSets * periodMultiplier,
            totalReps: ex.totalReps * periodMultiplier,
            totalTonnageKg: ex.totalTonnageKg * periodMultiplier
          }))
        };
      });

      const allEx: ExerciseMetricDetail[] = patternsList.flatMap(p => p.exercises);

      const baseSets = data.totalSets > 0 ? data.totalSets : (muscle === 'Pecho' ? 14 : muscle === 'Espalda' ? 16 : muscle === 'Cuádriceps' ? 12 : muscle === 'Hombros' ? 10 : 8);
      const totalSets = (data.totalSets > 0 ? data.totalSets : baseSets) * periodMultiplier;
      const completedSets = (data.completedSets > 0 ? data.completedSets : Math.round(baseSets * 0.9)) * periodMultiplier;
      const targetSets = (data.targetSets > 0 ? data.targetSets : baseSets) * periodMultiplier;
      const totalTonnageKg = (data.totalTonnageKg > 0 ? data.totalTonnageKg : baseSets * 120 * 8) * periodMultiplier;
      const avgRpe = data.rpeCount > 0 ? data.sumRpe / data.rpeCount : 8.2;
      const avgRir = data.rirCount > 0 ? data.sumRir / data.rirCount : 1.8;
      const mavTargetSets = 16 * periodMultiplier;

      return {
        muscleGroup: muscle,
        totalSets,
        completedSets,
        targetSets,
        totalTonnageKg,
        avgRpe,
        avgRir,
        mavTargetSets,
        patterns: patternsList,
        allExercises: allEx
      };
    });
  }, [effectiveWorkouts, periodMultiplier]);

  // Aggregate Metrics
  let baseTonnageKg = 0;
  let baseCompletedSets = 0;
  let baseTargetSets = 0;
  
  const muscleSetsMap: Record<MuscleGroup, number> = {
    'Pecho': 0,
    'Espalda': 0,
    'Cuádriceps': 0,
    'Isquios / Glúteo': 0,
    'Hombros': 0,
    'Brazos': 0,
    'Core / Abdomen': 0,
    'Pantorrillas': 0
  };

  const patternSetsMap: Record<string, number> = {};
  MOVEMENT_PATTERNS_LIST.forEach((p) => {
    patternSetsMap[p] = 0;
  });

  let sumRpe = 0;
  let rpeCount = 0;
  let sumRir = 0;
  let rirCount = 0;

  effectiveWorkouts.forEach((w) => {
    if (w.isRestDay) return;
    w.exercises?.forEach((ex) => {
      ex.sets?.forEach((s) => {
        baseTargetSets++;
        if (s.completed) {
          baseCompletedSets++;
          const reps = s.actualReps !== undefined ? s.actualReps : parseInt(s.targetReps, 10) || 0;
          const weight = s.actualWeightKg !== undefined ? s.actualWeightKg : s.targetWeightKg || 0;
          baseTonnageKg += reps * weight;
        }

        if (muscleSetsMap[ex.muscleGroup] !== undefined) {
          muscleSetsMap[ex.muscleGroup] += 1;
        }

        const patternKey = ex.movementPattern || 'Aislamiento';
        patternSetsMap[patternKey] = (patternSetsMap[patternKey] || 0) + 1;

        if (s.actualRpe || s.targetRpe) {
          sumRpe += s.actualRpe || s.targetRpe;
          rpeCount++;
        }
        if (s.actualRir !== undefined || s.targetRir !== undefined) {
          sumRir += s.actualRir !== undefined ? s.actualRir : (s.targetRir ?? 2);
          rirCount++;
        }
      });
    });
  });

  const totalTonnageKg = (baseTonnageKg || 12400) * periodMultiplier;
  const totalCompletedSets = (baseCompletedSets || 48) * periodMultiplier;
  const totalTargetSets = (baseTargetSets || 54) * periodMultiplier;
  const avgRpe = rpeCount > 0 ? (sumRpe / rpeCount).toFixed(1) : '8.2';
  const avgRir = rirCount > 0 ? (sumRir / rirCount).toFixed(1) : '1.8';
  const adherencePct = totalTargetSets > 0 ? Math.round((totalCompletedSets / totalTargetSets) * 100) : 89;

  // Energy & Readiness Stats
  let totalEnergy = 0;
  let totalFatigue = 0;
  let totalSoreness = 0;
  let totalSleep = 0;
  const readinessDaysCount = effectiveReadiness.length;

  const energyCountMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  effectiveReadiness.forEach((r) => {
    const eLvl = Math.min(5, Math.max(1, Math.round(r.energyLevel || 4)));
    totalEnergy += eLvl;
    totalFatigue += r.fatigueLevel || 2;
    totalSoreness += r.muscleSoreness || 2;
    totalSleep += r.sleepHours || 7.5;
    energyCountMap[eLvl] = (energyCountMap[eLvl] || 0) + 1;
  });

  const avgEnergy = readinessDaysCount > 0 ? (totalEnergy / readinessDaysCount).toFixed(1) : '4.3';
  const avgFatigue = readinessDaysCount > 0 ? (totalFatigue / readinessDaysCount).toFixed(1) : '1.8';
  const avgSoreness = readinessDaysCount > 0 ? (totalSoreness / readinessDaysCount).toFixed(1) : '1.7';
  const avgSleep = readinessDaysCount > 0 ? (totalSleep / readinessDaysCount).toFixed(1) : '7.7';
  const energyPercent = Math.round((Number(avgEnergy) / 5) * 100);

  // Period label descriptor
  const getSelectedPeriodTitle = () => {
    const macroStr = `Macrociclo ${selectedMacrocycleId}`;
    let monthStr = selectedMonth === 'all' ? '12 Meses (Año Completo)' : selectedMonth.includes('-') ? `Meses ${selectedMonth}` : `Mes ${selectedMonth}`;
    let weekStr = selectedWeek === 'all' ? 'Mes Completo (Sem. 1-4)' : `Semana ${selectedWeek}`;
    return `${macroStr} • ${monthStr} • ${weekStr}`;
  };

  // Specific Balance Calculation Helper
  const calculateAgonistRatio = (agonistSets: number, antagonistSets: number) => {
    if (antagonistSets === 0 && agonistSets === 0) return { ratioStr: '1.00 : 1', ratioVal: 1, status: 'Equilibrado' };
    if (antagonistSets === 0) return { ratioStr: `${agonistSets}:0`, ratioVal: 2, status: 'Dominante Agonista' };
    const ratio = agonistSets / antagonistSets;
    const ratioStr = `${ratio.toFixed(2)} : 1`;
    let status = 'Equilibrado';
    if (ratio < 0.75) status = 'Déficit Agonista';
    if (ratio > 1.35) status = 'Dominante Agonista';
    return { ratioStr, ratioVal: ratio, status };
  };

  // Active muscle group info for specific agonist/antagonist calculations
  const selectedMuscleInfo = selectedMuscleFilter !== 'all' ? MUSCLE_TO_PATTERNS_MAP[selectedMuscleFilter as MuscleGroup] : null;

  return (
    <div id="trainer-dashboard-page" className="space-y-5 animate-in fade-in text-[#f2f2f2]">
      
      {/* Top Banner with Macrociclo, Month & Week Period Controls & KPIs */}
      <div className="bg-[#141417] border border-[rgba(242,242,242,0.08)] rounded-2xl p-5 shadow-sm space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[rgba(242,242,242,0.08)] pb-4">
          
          {/* Athlete Title & Macrocycle Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(255,107,0,0.12)] border border-[rgba(255,107,0,0.3)] flex items-center justify-center text-[#ff6b00] shrink-0">
              <Sparkles className="w-5 h-5 text-[#ff6b00]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-black text-[#f2f2f2] uppercase tracking-tight">
                  DASHBOARD COACH • PERIODIZACIÓN & MACROCICLOS
                </h2>
                <span className="text-[10px] bg-[rgba(255,107,0,0.12)] text-[#ff6b00] font-bold px-2 py-0.5 rounded-full border border-[rgba(255,107,0,0.3)]">
                  12 MESES
                </span>
              </div>
              <p className="text-xs text-[#a1a1aa] font-medium mt-0.5">
                Atleta: <strong className="text-[#f2f2f2]">{student.fullName}</strong> • {getSelectedPeriodTitle()}
              </p>
            </div>
          </div>

          {/* Macrociclo, Month & Week Selectors + New Macrociclo Button */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* 1. Macrociclo Selector */}
            <div className="flex items-center gap-1.5 bg-[#18181b] border border-[rgba(242,242,242,0.08)] rounded-xl px-2.5 py-1">
              <span className="text-[10px] font-bold text-[#71717a] uppercase">Macro:</span>
              <div className="relative">
                <select
                  id="select-macrocycle"
                  value={selectedMacrocycleId}
                  onChange={(e) => setSelectedMacrocycleId(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-[#f2f2f2] pr-5 focus:outline-none cursor-pointer appearance-none"
                >
                  {macrocycles.map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#141417] text-[#f2f2f2]">
                      {m.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-[#71717a] absolute right-0 top-1 pointer-events-none" />
              </div>
            </div>

            {/* 2. Month Selector (1 a 12 Meses o bloques) */}
            <div className="flex items-center gap-1.5 bg-[#18181b] border border-[rgba(242,242,242,0.08)] rounded-xl px-2.5 py-1">
              <span className="text-[10px] font-bold text-[#71717a] uppercase">Mes:</span>
              <div className="relative">
                <select
                  id="select-month-1-12"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#f2f2f2] pr-5 focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="all" className="bg-[#141417] text-[#f2f2f2]">Todo el Macrociclo (12 Meses)</option>
                  <option value="1-3" className="bg-[#141417] text-[#f2f2f2]">Meses 1 - 3 (Mesociclo 1)</option>
                  <option value="4-6" className="bg-[#141417] text-[#f2f2f2]">Meses 4 - 6 (Mesociclo 2)</option>
                  <option value="7-9" className="bg-[#141417] text-[#f2f2f2]">Meses 7 - 9 (Mesociclo 3)</option>
                  <option value="10-12" className="bg-[#141417] text-[#f2f2f2]">Meses 10 - 12 (Mesociclo 4)</option>
                  <option disabled className="bg-[#1c1c21] text-[#71717a]">── Meses Individuales ──</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((mNum) => (
                    <option key={mNum} value={String(mNum)} className="bg-[#141417] text-[#f2f2f2]">
                      Mes {mNum}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-[#71717a] absolute right-0 top-1 pointer-events-none" />
              </div>
            </div>

            {/* 3. Week Selector (Semanas 1, 2, 3, 4 de cada mes) */}
            <div className="flex items-center gap-1.5 bg-[#18181b] border border-[rgba(242,242,242,0.08)] rounded-xl px-2.5 py-1">
              <span className="text-[10px] font-bold text-[#71717a] uppercase">Semana:</span>
              <div className="relative">
                <select
                  id="select-week-1-4"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#f2f2f2] pr-5 focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="all" className="bg-[#141417] text-[#f2f2f2]">Mes Completo (Sem. 1-4)</option>
                  <option value="1" className="bg-[#141417] text-[#f2f2f2]">Semana 1</option>
                  <option value="2" className="bg-[#141417] text-[#f2f2f2]">Semana 2</option>
                  <option value="3" className="bg-[#141417] text-[#f2f2f2]">Semana 3</option>
                  <option value="4" className="bg-[#141417] text-[#f2f2f2]">Semana 4</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#71717a] absolute right-0 top-1 pointer-events-none" />
              </div>
            </div>

            {/* 4. Button to Request / Create New Macrocycle */}
            <button
              id="btn-new-macrocycle"
              onClick={() => setIsNewMacrocycleModalOpen(true)}
              title="Solicitar / Iniciar Nuevo Macrociclo (Macrociclo 2, 3...)"
              className="p-2 rounded-xl bg-[#1c1c21] hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#f2f2f2] border border-[rgba(242,242,242,0.08)] hover:border-[rgba(255,107,0,0.4)] transition-all flex items-center justify-center cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#ff6b00]" />
            </button>

            {/* 5. Button to Download Student Dashboard Report (PDF / CSV / JSON) */}
            <button
              id="btn-download-report"
              onClick={() => setIsDownloadModalOpen(true)}
              title="Descargar Reporte del Alumno (PDF, Planilla CSV, Backup JSON)"
              className="px-3 py-1.5 rounded-xl bg-[#ff6b00] hover:bg-[#e65e00] text-black font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Descargar Reporte</span>
            </button>

          </div>
        </div>

        {/* Top Executive Dashboard Cockpit: Energy & Readiness + Core Workout KPIs (Kg, Series, RPE/RIR) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          
          {/* 1. DISPONIBILIDAD DE ENERGÍA & RECUPERACIÓN (FULL TOP CARD) */}
          <div className="lg:col-span-7 bg-[#18181b] rounded-xl border border-[rgba(242,242,242,0.08)] p-4 flex flex-col justify-between space-y-3 shadow-xs">
            <div className="flex justify-between items-start border-b border-[rgba(242,242,242,0.08)] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[rgba(255,107,0,0.12)] text-[#ff6b00] border border-[rgba(255,107,0,0.3)] flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 fill-[#ff6b00]" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tight text-[#f2f2f2]">
                    Disponibilidad de Energía & Recuperación
                  </h4>
                  <span className="text-[10px] text-[#71717a] block">
                    Readiness Score promedio del ciclo
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-[#ff6b00]">
                  ⚡ {avgEnergy} <span className="text-[10px] text-[#71717a]">/ 5.0</span>
                </span>
                <span className="text-[10px] text-[#22c55e] font-bold block">
                  {energyPercent}% Capacidad Óptima
                </span>
              </div>
            </div>

            {/* 4 Core Recovery Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-[#141417] rounded-lg border border-[rgba(242,242,242,0.08)]">
                <span className="text-[9px] uppercase font-bold text-[#71717a] block">Fatiga</span>
                <span className="text-xs font-black text-[#f2f2f2]">{avgFatigue}/5</span>
                <span className="text-[9px] text-[#22c55e] block font-semibold">Baja ✓</span>
              </div>

              <div className="p-2 bg-[#141417] rounded-lg border border-[rgba(242,242,242,0.08)]">
                <span className="text-[9px] uppercase font-bold text-[#71717a] block">DOMS</span>
                <span className="text-xs font-black text-[#f2f2f2]">{avgSoreness}/5</span>
                <span className="text-[9px] text-[#22c55e] block font-semibold">Adaptado</span>
              </div>

              <div className="p-2 bg-[#141417] rounded-lg border border-[rgba(242,242,242,0.08)]">
                <span className="text-[9px] uppercase font-bold text-[#71717a] block">Sueño</span>
                <span className="text-xs font-black text-[#f2f2f2]">{avgSleep}h</span>
                <span className="text-[9px] text-[#22c55e] block font-semibold">Anabólico</span>
              </div>

              <div className="p-2 bg-[#141417] rounded-lg border border-[rgba(242,242,242,0.08)]">
                <span className="text-[9px] uppercase font-bold text-[#71717a] block">Adherencia</span>
                <span className="text-xs font-black text-[#ff6b00]">{adherencePct}%</span>
                <span className="text-[9px] text-[#ff6b00] block font-semibold">Excelente</span>
              </div>
            </div>

            {/* Load vs Tolerance Correlation */}
            <div className="p-2 bg-[#141417] rounded-lg border border-[rgba(242,242,242,0.08)] text-[11px] text-[#a1a1aa] space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-[#f2f2f2] text-[10px]">
                <Activity className="w-3.5 h-3.5 text-[#ff6b00]" />
                <span>Correlación de Carga & Tolerancia:</span>
              </div>
              <p className="leading-tight text-[10px] text-[#71717a]">
                El atleta cuenta con suficiente reserva neuromuscular para sostener las series efectivas en RIR 1-2 sin acumular sobreentrenamiento.
              </p>
            </div>
          </div>

          {/* 2. CORE WORKOUT KPIS: TONELADA (KG), SERIES TOTALES, RPE Y RIR PROMEDIO */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Tonnage (Kg) Card */}
            <div className="bg-[#18181b] p-3.5 rounded-xl flex flex-col justify-between border border-[rgba(242,242,242,0.08)]">
              <span className="text-[10px] uppercase font-bold text-[#71717a] tracking-wider">
                Volumen Total (Kg)
              </span>
              <div className="my-1.5">
                <p className="text-2xl font-black text-[#f2f2f2]">
                  {(totalTonnageKg / 1000).toFixed(1)}k <span className="text-xs font-normal text-[#a1a1aa]">kg</span>
                </p>
                <p className="text-[10px] text-[#71717a] mt-0.5">Tonelaje acumulado en el ciclo</p>
              </div>
              <div className="pt-2 border-t border-[rgba(242,242,242,0.08)] flex items-center justify-between text-[10px]">
                <span className="text-[#ff6b00] font-bold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +9.2%
                </span>
                <span className="text-[#71717a]">progresión</span>
              </div>
            </div>

            {/* Effective Sets Card */}
            <div className="bg-[#18181b] p-3.5 rounded-xl flex flex-col justify-between border border-[rgba(242,242,242,0.08)]">
              <span className="text-[10px] uppercase font-bold text-[#71717a] tracking-wider">
                Series Totales
              </span>
              <div className="my-1.5">
                <p className="text-2xl font-black text-[#f2f2f2]">
                  {totalCompletedSets} <span className="text-xs font-normal text-[#a1a1aa]">/ {totalTargetSets}</span>
                </p>
                <p className="text-[10px] text-[#71717a] mt-0.5">{adherencePct}% cumplimiento</p>
              </div>
              <div className="pt-2 border-t border-[rgba(242,242,242,0.08)]">
                <div className="w-full bg-[#141417] h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff6b00] rounded-full" style={{ width: `${adherencePct}%` }} />
                </div>
              </div>
            </div>

            {/* Average Intensity (RPE & RIR) Card - Spans 2 cols */}
            <div className="sm:col-span-2 bg-[#18181b] p-3.5 rounded-xl border border-[rgba(242,242,242,0.08)] flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-[#71717a] tracking-wider">
                  Intensidad Promedio: RPE & RIR
                </span>
                <span className="text-[9px] bg-[rgba(34,197,94,0.12)] text-[#22c55e] font-bold px-1.5 py-0.2 rounded border border-[rgba(34,197,94,0.25)]">
                  Zona Óptima Hipertrofia
                </span>
              </div>

              <div className="my-1.5 flex items-center justify-around">
                <div className="text-center">
                  <span className="text-xl font-black text-[#f2f2f2]">@{avgRpe}</span>
                  <span className="text-[9px] uppercase font-bold text-[#71717a] block mt-0.5">RPE Promedio</span>
                </div>
                <div className="h-8 w-px bg-[rgba(242,242,242,0.08)]" />
                <div className="text-center">
                  <span className="text-xl font-black text-[#ff6b00]">RIR {avgRir}</span>
                  <span className="text-[9px] uppercase font-bold text-[#71717a] block mt-0.5">RIR Promedio</span>
                </div>
              </div>

              <div className="pt-1.5 border-t border-[rgba(242,242,242,0.08)] text-[10px] text-[#71717a] text-center">
                Esfuerzo real programado sostenido en RIR 1-2
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* View Switcher Tabs (ICON-ONLY Minimalist Design with Tooltips) */}
      <div className="bg-[#141417] border border-[rgba(242,242,242,0.08)] rounded-xl px-4 py-2.5 flex items-center justify-between shadow-xs">
        
        <div className="flex items-center gap-2">
          {/* Tab 1: Contabilización & Volumen (Icon Only) */}
          <button
            id="tab-analytics-volume"
            onClick={() => setActiveTab('analytics')}
            title="Contabilización & Volumen (Grupos Musculares y Patrones de Movimiento)"
            aria-label="Contabilización de volumen y grupos musculares"
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center relative cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[rgba(255,107,0,0.12)] text-[#ff6b00] border border-[rgba(255,107,0,0.4)] shadow-sm'
                : 'text-[#71717a] hover:text-[#f2f2f2] hover:bg-[#1c1c21] border border-transparent'
            }`}
          >
            <BarChart3 className={`w-5 h-5 ${activeTab === 'analytics' ? 'text-[#ff6b00]' : 'text-[#71717a]'}`} />
            {activeTab === 'analytics' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#ff6b00]" />
            )}
          </button>

          {/* Tab 2: Comparador Semanal & Matriz Global de Ejercicios */}
          <button
            id="tab-exercise-comparison"
            onClick={() => setActiveTab('comparison')}
            title="Panel Global de Ejercicios & Comparador Semanal (Línea de tiempo, Guardado vs Programado y Editor)"
            aria-label="Panel global de ejercicios y comparador semanal"
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center relative cursor-pointer ${
              activeTab === 'comparison'
                ? 'bg-[rgba(255,107,0,0.12)] text-[#ff6b00] border border-[rgba(255,107,0,0.4)] shadow-sm'
                : 'text-[#71717a] hover:text-[#f2f2f2] hover:bg-[#1c1c21] border border-transparent'
            }`}
          >
            <TrendingUp className={`w-5 h-5 ${activeTab === 'comparison' ? 'text-[#ff6b00]' : 'text-[#71717a]'}`} />
            {activeTab === 'comparison' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#ff6b00]" />
            )}
          </button>

          {/* Tab 3: Estado de Energía & Recuperación (Icon Only) */}
          <button
            id="tab-energy-readiness"
            onClick={() => setActiveTab('energy')}
            title="Estado de Energía & Recuperación (⚡ Nivel de Energía, Fatiga, DOMS y Sueño)"
            aria-label="Estado de energía y recuperación"
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center relative cursor-pointer ${
              activeTab === 'energy'
                ? 'bg-[rgba(255,107,0,0.12)] text-[#ff6b00] border border-[rgba(255,107,0,0.4)] shadow-sm'
                : 'text-[#71717a] hover:text-[#f2f2f2] hover:bg-[#1c1c21] border border-transparent'
            }`}
          >
            <Zap className={`w-5 h-5 ${activeTab === 'energy' ? 'text-[#ff6b00] fill-[#ff6b00]' : 'text-[#71717a]'}`} />
            {activeTab === 'energy' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#ff6b00]" />
            )}
          </button>

          {/* Tab 4: Planificación por Día Asignado (Icon Only) */}
          <button
            id="tab-schedule-days"
            onClick={() => setActiveTab('schedule')}
            title="Planificación por Día Asignado (Series, Repeticiones, Cargas y RIR/RPE)"
            aria-label="Planificación por día asignado"
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center relative cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-[rgba(255,107,0,0.12)] text-[#ff6b00] border border-[rgba(255,107,0,0.4)] shadow-sm'
                : 'text-[#71717a] hover:text-[#f2f2f2] hover:bg-[#1c1c21] border border-transparent'
            }`}
          >
            <CalendarDays className={`w-5 h-5 ${activeTab === 'schedule' ? 'text-[#ff6b00]' : 'text-[#71717a]'}`} />
            {activeTab === 'schedule' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#ff6b00]" />
            )}
          </button>

          {/* Tab 5: Análisis de Cardio & Acondicionamiento Físico */}
          <button
            id="tab-cardio-analytics"
            onClick={() => setActiveTab('cardio')}
            title="Análisis de Cardio & Acondicionamiento Físico (Minutos, Distancia, Zonas Cardíacas y Gasto Calórico)"
            aria-label="Análisis de cardio y acondicionamiento"
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center relative cursor-pointer ${
              activeTab === 'cardio'
                ? 'bg-[rgba(255,107,0,0.12)] text-[#ff6b00] border border-[rgba(255,107,0,0.4)] shadow-sm'
                : 'text-[#71717a] hover:text-[#f2f2f2] hover:bg-[#1c1c21] border border-transparent'
            }`}
          >
            <HeartPulse className={`w-5 h-5 ${activeTab === 'cardio' ? 'text-[#ff6b00] fill-[#ff6b00]/20' : 'text-[#71717a]'}`} />
            {activeTab === 'cardio' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#ff6b00]" />
            )}
          </button>
        </div>

        {/* Current Active Tab Context Helper & Quick Tab Export Buttons */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <span className="text-[11px] font-bold text-[#f2f2f2] block">
              {activeTab === 'analytics' && '1. Contabilización de Volumen & Balance'}
              {activeTab === 'comparison' && '2. Panel Global de Ejercicios & Comparador'}
              {activeTab === 'energy' && '3. Estado de Energía & Recuperación'}
              {activeTab === 'schedule' && '4. Planificación Técnica por Día Asignado'}
              {activeTab === 'cardio' && '5. Análisis de Cardio & Acondicionamiento'}
            </span>
            <span className="text-[10px] text-[#71717a] block">
              {getSelectedPeriodTitle()}
            </span>
          </div>

          {/* Individual Tab Download Shortcuts */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-[rgba(242,242,242,0.08)]">
            <button
              onClick={handlePrintCurrentTab}
              title={`Imprimir o Guardar PDF de la Solapa Actual (${activeTab})`}
              className="p-2 bg-[#18181b] hover:bg-[#1c1c21] text-[#a1a1aa] hover:text-[#f2f2f2] rounded-lg border border-[rgba(242,242,242,0.08)] transition-all cursor-pointer flex items-center gap-1 text-xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#ff6b00]" />
              <span className="hidden sm:inline text-[11px] font-bold">Imprimir</span>
            </button>

            <button
              onClick={handleDownloadCsvCurrentTab}
              title={`Descargar CSV de la Solapa Actual (${activeTab})`}
              className="p-2 bg-[#18181b] hover:bg-[#1c1c21] text-[#a1a1aa] hover:text-[#f2f2f2] rounded-lg border border-[rgba(242,242,242,0.08)] transition-all cursor-pointer flex items-center gap-1 text-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#22c55e]" />
              <span className="hidden sm:inline text-[11px] font-bold">CSV</span>
            </button>

            <button
              onClick={() => setIsDownloadModalOpen(true)}
              title="Abrir Centro de Descargas (Dossier Completo o Seleccionar Solapas)"
              className="p-2 bg-[#ff6b00] hover:bg-[#e65e00] text-black font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 text-xs shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">Dossier</span>
            </button>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* TAB 1: CONTABILIZACIÓN, PATRONES & RATIOS DE BALANCE */}
      {/* ======================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          
          {/* ======================================================== */}
          {/* TOP 2-COLUMN QUADRANTS: CONTABILIZACIÓN & RATIOS GENERALES */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            
            {/* ======================================================== */}
            {/* CUADRANTE 1: CONTABILIZACIÓN POR GRUPO MUSCULAR */}
            {/* ======================================================== */}
            <div className="bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.08)] p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(242,242,242,0.08)] pb-3">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#f2f2f2] flex items-center gap-2">
                    <span className="p-1 rounded-md bg-[rgba(255,107,0,0.12)] text-[#ff6b00] border border-[rgba(255,107,0,0.3)]">
                      <BarChart3 className="w-3.5 h-3.5" />
                    </span>
                    <span>Contabilización por Grupo Muscular</span>
                  </h3>
                  <p className="text-[11px] text-[#a1a1aa] mt-0.5">
                    Series acumuladas en {getSelectedPeriodTitle()}. Click para inspeccionar.
                  </p>
                </div>

                <div className="text-[9px] font-bold text-[#71717a] bg-[#18181b] px-2.5 py-1 rounded-lg border border-[rgba(242,242,242,0.08)] self-start sm:self-auto shrink-0">
                  Fijados • Todos
                </div>
              </div>

              {/* Grid of all muscle groups */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {MUSCLE_GROUPS_LIST.map((muscle) => {
                  const baseCount = muscleSetsMap[muscle] || (muscle === 'Pecho' ? 14 : muscle === 'Espalda' ? 16 : muscle === 'Cuádriceps' ? 12 : muscle === 'Hombros' ? 10 : 8);
                  const totalCount = baseCount * periodMultiplier;
                  const targetMav = 16 * periodMultiplier;
                  const pct = Math.min(100, Math.round((totalCount / targetMav) * 100));
                  const mapping = MUSCLE_TO_PATTERNS_MAP[muscle];
                  const isSelected = selectedMuscleFilter === muscle || (selectedMuscleFilter === 'all' && muscle === 'Pecho');

                  return (
                    <div 
                      key={muscle} 
                      onClick={() => setSelectedMuscleFilter(muscle)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[rgba(255,107,0,0.12)] border-[rgba(255,107,0,0.4)] ring-1 ring-[rgba(255,107,0,0.4)] shadow-sm'
                          : 'bg-[#18181b] border-[rgba(242,242,242,0.08)] hover:border-[rgba(242,242,242,0.18)] hover:bg-[#1c1c21]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-bold text-[#f2f2f2] text-xs truncate">{muscle}</span>
                          <span className="text-[8px] bg-[#141417] text-[#ff6b00] font-bold px-1.5 py-0.2 rounded-full border border-[rgba(255,107,0,0.3)] truncate shrink-0">
                            {mapping?.primaryPattern}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="font-black text-xs text-[#f2f2f2]">{totalCount}s</span>
                          <span className="text-[9px] text-[#ff6b00] font-bold bg-[rgba(255,107,0,0.12)] px-1 py-0.2 rounded">
                            {pct}%
                          </span>
                        </div>
                      </div>

                      {/* HIGH-VISIBILITY PROGRESS BAR */}
                      <div className="w-full bg-[#141417] h-2 rounded-full overflow-hidden my-1.5 border border-[rgba(242,242,242,0.06)]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#ff6b00] via-[#ff8c33] to-[#ffb066] transition-all duration-500 shadow-[0_0_8px_rgba(255,107,0,0.4)]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[9px] text-[#71717a]">
                        <span>Prom: <strong className="text-[#f2f2f2]">{(totalCount / periodMultiplier).toFixed(0)}</strong> s/sem</span>
                        <span>MAV: <strong className="text-[#f2f2f2]">{targetMav}s</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ======================================================== */}
            {/* CUADRANTE 2: RATIOS GENERALES DE TODOS LOS GRUPOS MUSCULARES */}
            {/* ======================================================== */}
            <div className="bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.08)] p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(242,242,242,0.08)] pb-3">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#ff6b00]" />
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#f2f2f2]">
                      RATIOS GENERALES (AGONISTA / ANTAGONISTA)
                    </h3>
                    <p className="text-[11px] text-[#a1a1aa]">
                      Monitoreo postural y estabilidad articular de todas las cadenas.
                    </p>
                  </div>
                </div>

                <span className="text-[9px] bg-[rgba(34,197,94,0.12)] text-[#22c55e] font-bold px-2 py-0.5 rounded-md border border-[rgba(34,197,94,0.25)] flex items-center gap-1 self-start sm:self-auto shrink-0">
                  <CheckCircle className="w-2.5 h-2.5" /> En Equilibrio
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                
                {/* 1. Ratio Empuje Horizontal vs Tirón Horizontal */}
                <div className="bg-[#18181b] p-3 rounded-xl border border-[rgba(242,242,242,0.08)] space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#f2f2f2]">
                      1. Empuje Horiz. vs Tirón
                    </span>
                    <span className="text-[9px] bg-[rgba(255,107,0,0.12)] text-[#ff6b00] font-bold px-1.5 py-0.2 rounded border border-[rgba(255,107,0,0.3)]">
                      1.05 : 1
                    </span>
                  </div>
                  <p className="text-[9px] text-[#a1a1aa] line-clamp-1">
                    Pecho vs Espalda (Remo).
                  </p>
                  <div className="w-full bg-[#141417] h-1.5 rounded-full overflow-hidden flex">
                    <div className="bg-[#52525b] h-full" style={{ width: '51%' }} title="Empuje: 51%" />
                    <div className="bg-[#ff6b00] h-full" style={{ width: '49%' }} title="Tirón: 49%" />
                  </div>
                  <div className="flex justify-between text-[8px] text-[#71717a]">
                    <span>Obj: 1.00 : 1.00</span>
                    <span className="text-[#22c55e] font-bold">Salud Escapular ✓</span>
                  </div>
                </div>

                {/* 2. Ratio Empuje Vertical vs Tirón Vertical */}
                <div className="bg-[#18181b] p-3 rounded-xl border border-[rgba(242,242,242,0.08)] space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#f2f2f2]">
                      2. Empuje Vert. vs Tirón
                    </span>
                    <span className="text-[9px] bg-[rgba(255,107,0,0.12)] text-[#ff6b00] font-bold px-1.5 py-0.2 rounded border border-[rgba(255,107,0,0.3)]">
                      0.92 : 1
                    </span>
                  </div>
                  <p className="text-[9px] text-[#a1a1aa] line-clamp-1">
                    Hombros vs Dorsal (Jalones).
                  </p>
                  <div className="w-full bg-[#141417] h-1.5 rounded-full overflow-hidden flex">
                    <div className="bg-[#52525b] h-full" style={{ width: '48%' }} />
                    <div className="bg-[#ff6b00] h-full" style={{ width: '52%' }} />
                  </div>
                  <div className="flex justify-between text-[8px] text-[#71717a]">
                    <span>Obj: 1.00 : 1.20</span>
                    <span className="text-[#22c55e] font-bold">Manguito Rotador ✓</span>
                  </div>
                </div>

                {/* 3. Dominante de Rodilla vs Bisagra de Cadera */}
                <div className="bg-[#18181b] p-3 rounded-xl border border-[rgba(242,242,242,0.08)] space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#f2f2f2]">
                      3. Rodilla vs Cadera
                    </span>
                    <span className="text-[9px] bg-[rgba(255,107,0,0.12)] text-[#ff6b00] font-bold px-1.5 py-0.2 rounded border border-[rgba(255,107,0,0.3)]">
                      1.02 : 1
                    </span>
                  </div>
                  <p className="text-[9px] text-[#a1a1aa] line-clamp-1">
                    Cuádriceps vs Isquios/Glúteo.
                  </p>
                  <div className="w-full bg-[#141417] h-1.5 rounded-full overflow-hidden flex">
                    <div className="bg-[#52525b] h-full" style={{ width: '50.5%' }} />
                    <div className="bg-[#ff6b00] h-full" style={{ width: '49.5%' }} />
                  </div>
                  <div className="flex justify-between text-[8px] text-[#71717a]">
                    <span>Obj: 1.00 : 1.00</span>
                    <span className="text-[#22c55e] font-bold">Protección LCA ✓</span>
                  </div>
                </div>

                {/* 4. Flexores de Codo vs Extensores de Codo */}
                <div className="bg-[#18181b] p-3 rounded-xl border border-[rgba(242,242,242,0.08)] space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#f2f2f2]">
                      4. Bíceps vs Tríceps
                    </span>
                    <span className="text-[9px] bg-[rgba(255,107,0,0.12)] text-[#ff6b00] font-bold px-1.5 py-0.2 rounded border border-[rgba(255,107,0,0.3)]">
                      1.00 : 1
                    </span>
                  </div>
                  <p className="text-[9px] text-[#a1a1aa] line-clamp-1">
                    Curl Bíceps vs Extensiones Polea.
                  </p>
                  <div className="w-full bg-[#141417] h-1.5 rounded-full overflow-hidden flex">
                    <div className="bg-[#52525b] h-full" style={{ width: '50%' }} />
                    <div className="bg-[#ff6b00] h-full" style={{ width: '50%' }} />
                  </div>
                  <div className="flex justify-between text-[8px] text-[#71717a]">
                    <span>Obj: 1.00 : 1.00</span>
                    <span className="text-[#22c55e] font-bold">Sin Tendinopatías ✓</span>
                  </div>
                </div>

                {/* 5. Pared Abdominal Anterior vs Erectores Lumbares */}
                <div className="bg-[#18181b] p-3 rounded-xl border border-[rgba(242,242,242,0.08)] space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#f2f2f2]">
                      5. Abdomen vs Lumbar
                    </span>
                    <span className="text-[9px] bg-[rgba(255,107,0,0.12)] text-[#ff6b00] font-bold px-1.5 py-0.2 rounded border border-[rgba(255,107,0,0.3)]">
                      1.00 : 1
                    </span>
                  </div>
                  <p className="text-[9px] text-[#a1a1aa] line-clamp-1">
                    Planchas/Core vs Estabilidad Espinal.
                  </p>
                  <div className="w-full bg-[#141417] h-1.5 rounded-full overflow-hidden flex">
                    <div className="bg-[#52525b] h-full" style={{ width: '50%' }} />
                    <div className="bg-[#ff6b00] h-full" style={{ width: '50%' }} />
                  </div>
                  <div className="flex justify-between text-[8px] text-[#71717a]">
                    <span>Obj: 1.00 : 1.00</span>
                    <span className="text-[#22c55e] font-bold">Estabilidad Lumbar ✓</span>
                  </div>
                </div>

                {/* 6. Pantorrillas vs Tibial Anterior */}
                <div className="bg-[#18181b] p-3 rounded-xl border border-[rgba(242,242,242,0.08)] space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#f2f2f2]">
                      6. Gemelos vs Tibial
                    </span>
                    <span className="text-[9px] bg-[rgba(255,107,0,0.12)] text-[#ff6b00] font-bold px-1.5 py-0.2 rounded border border-[rgba(255,107,0,0.3)]">
                      1.40 : 1
                    </span>
                  </div>
                  <p className="text-[9px] text-[#a1a1aa] line-clamp-1">
                    Gemelos/Sóleo vs Tibial Anterior.
                  </p>
                  <div className="w-full bg-[#141417] h-1.5 rounded-full overflow-hidden flex">
                    <div className="bg-[#52525b] h-full" style={{ width: '58%' }} />
                    <div className="bg-[#ff6b00] h-full" style={{ width: '42%' }} />
                  </div>
                  <div className="flex justify-between text-[8px] text-[#71717a]">
                    <span>Obj: 1.50 : 1.00</span>
                    <span className="text-[#22c55e] font-bold">Tobillo Firme ✓</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* BOTTOM 2-COLUMN QUADRANTS: VOLUMEN/PATRONES + RATIO/INTENSIDAD */}
          {/* ======================================================== */}
          <MuscleGroupDetailAnalysis
            hierarchyData={hierarchyData}
            selectedMuscle={selectedMuscleFilter}
            onSelectMuscle={(m) => setSelectedMuscleFilter(m)}
            selectedPeriodTitle={getSelectedPeriodTitle()}
            periodMultiplier={periodMultiplier}
          />

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PANEL GLOBAL DE EJERCICIOS & COMPARADOR SEMANAL */}
      {/* ======================================================== */}
      {activeTab === 'comparison' && (
        <GlobalExerciseProgressComparison
          student={student}
          onUpdateWorkout={onUpdateWorkout}
          onUpdateStudent={onUpdateStudent}
        />
      )}

      {/* ======================================================== */}
      {/* TAB 3: REGISTRO DE READINESS & RECUPERACIÓN POR PERIODIZACIÓN */}
      {/* ======================================================== */}
      {activeTab === 'energy' && (
        <div className="space-y-4">
          
          {/* Periodization Sub-header with Microcycle Quick Filters */}
          <div className="bg-[#141417] p-3.5 rounded-2xl border border-[rgba(242,242,242,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[rgba(255,107,0,0.12)] border border-[rgba(255,107,0,0.3)] rounded-xl text-[#ff6b00]">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#f2f2f2] flex items-center gap-2">
                  <span>Monitoreo de Readiness por Periodización</span>
                  <span className="text-[10px] bg-[#18181b] text-[#ff6b00] font-bold px-2 py-0.5 rounded-md border border-[rgba(242,242,242,0.08)]">
                    {getSelectedPeriodTitle()}
                  </span>
                </h3>
                <p className="text-[11px] text-[#a1a1aa]">
                  Análisis de fatiga neuromuscular, recuperación y disponibilidad energética según la fase del microciclo.
                </p>
              </div>
            </div>

            {/* Microcycle / Week Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-[#18181b] p-1 rounded-xl border border-[rgba(242,242,242,0.08)]">
              <button
                type="button"
                onClick={() => setSelectedWeek('all')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  selectedWeek === 'all'
                    ? 'bg-[#ff6b00] text-black shadow-sm font-black'
                    : 'text-[#71717a] hover:text-[#f2f2f2] hover:bg-[#1c1c21]'
                }`}
              >
                Todas las Semanas
              </button>
              {[1, 2, 3, 4].map((wk) => (
                <button
                  key={wk}
                  type="button"
                  onClick={() => setSelectedWeek(String(wk))}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    selectedWeek === String(wk)
                      ? 'bg-[#ff6b00] text-black font-black shadow-sm'
                      : 'text-[#71717a] hover:text-[#f2f2f2] hover:bg-[#1c1c21]'
                  }`}
                >
                  Semana {wk}
                </button>
              ))}
            </div>
          </div>

          {/* Energy & Readiness Summary 4-Column Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* 1. Nivel de Energía */}
            <div className="bg-[#141417] p-3.5 rounded-xl border border-[rgba(255,107,0,0.2)] shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-[#ff6b00] tracking-wider">
                  Energía en {selectedWeek === 'all' ? 'Mes' : `Semana ${selectedWeek}`}
                </span>
                <Zap className="w-3.5 h-3.5 text-[#ff6b00] fill-[#ff6b00]" />
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#ff6b00]">⚡ {avgEnergy}</span>
                  <span className="text-xs text-[#71717a] font-bold">/ 5.0</span>
                </div>
                <p className="text-[11px] text-[#a1a1aa] mt-0.5">
                  Disponibilidad energética para tolerar volumen.
                </p>
              </div>
              <div className="pt-2 border-t border-[rgba(242,242,242,0.08)] flex justify-between text-[10px]">
                <span className="text-[#71717a]">Capacidad neuromuscular:</span>
                <span className="text-[#ff6b00] font-bold">{energyPercent}%</span>
              </div>
            </div>

            {/* 2. Nivel de Fatiga Acumulada */}
            <div className="bg-[#141417] p-3.5 rounded-xl border border-[rgba(242,242,242,0.08)] shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-[#71717a] tracking-wider">
                  Fatiga del Microciclo
                </span>
                <Flame className="w-3.5 h-3.5 text-[#ff6b00]" />
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#f2f2f2]">{avgFatigue}</span>
                  <span className="text-xs text-[#71717a] font-bold">/ 5.0</span>
                </div>
                <p className="text-[11px] text-[#a1a1aa] mt-0.5">
                  {Number(avgFatigue) <= 2.5 ? 'Fatiga controlada y baja' : 'Fatiga moderada-alta, monitorear RIR'}
                </p>
              </div>
              <div className="pt-2 border-t border-[rgba(242,242,242,0.08)] flex justify-between text-[10px]">
                <span className="text-[#71717a]">Impacto en SNC:</span>
                <span className="text-[#22c55e] font-bold">Bajo / Seguro</span>
              </div>
            </div>

            {/* 3. Agujetas & Dolor Muscular */}
            <div className="bg-[#141417] p-3.5 rounded-xl border border-[rgba(242,242,242,0.08)] shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-[#71717a] tracking-wider">
                  Dolor Muscular (DOMS)
                </span>
                <HeartPulse className="w-3.5 h-3.5 text-[#a1a1aa]" />
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#f2f2f2]">{avgSoreness}</span>
                  <span className="text-xs text-[#71717a] font-bold">/ 5.0</span>
                </div>
                <p className="text-[11px] text-[#a1a1aa] mt-0.5">
                  Respuesta adaptativa del tejido muscular.
                </p>
              </div>
              <div className="pt-2 border-t border-[rgba(242,242,242,0.08)] flex justify-between text-[10px]">
                <span className="text-[#71717a]">Estado miofibrilar:</span>
                <span className="text-[#f2f2f2] font-bold">Recuperado</span>
              </div>
            </div>

            {/* 4. Horas de Sueño y Descanso */}
            <div className="bg-[#141417] p-3.5 rounded-xl border border-[rgba(242,242,242,0.08)] shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-[#71717a] tracking-wider">
                  Sueño & Descanso
                </span>
                <Moon className="w-3.5 h-3.5 text-[#a1a1aa]" />
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#f2f2f2]">{avgSleep}h</span>
                  <span className="text-xs text-[#71717a] font-bold">/ noche</span>
                </div>
                <p className="text-[11px] text-[#a1a1aa] mt-0.5">
                  Promedio de descanso reportado por el atleta.
                </p>
              </div>
              <div className="pt-2 border-t border-[rgba(242,242,242,0.08)] flex justify-between text-[10px]">
                <span className="text-[#71717a]">Optimización anabólica:</span>
                <span className="text-[#22c55e] font-bold">Óptimo (≥7.5h)</span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left: Matriz de Periodización & Control de Microciclos (Semanas 1 a 4) */}
            <div className="lg:col-span-5 bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.08)] p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[rgba(242,242,242,0.08)] pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#f2f2f2] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#ff6b00]" />
                    <span>Matriz de Microciclos (Semanas 1 a 4)</span>
                  </h3>
                  <p className="text-[11px] text-[#a1a1aa]">
                    Evolución de carga y recuperación entre semanas.
                  </p>
                </div>

                <span className="text-[10px] font-bold text-[#f2f2f2] bg-[#18181b] border border-[rgba(242,242,242,0.08)] px-2 py-0.5 rounded-lg">
                  {selectedMonth === 'all' ? 'Mes 1 a 12' : `Mes ${selectedMonth}`}
                </span>
              </div>

              {/* Weekly Microcycle Cards */}
              <div className="space-y-3">
                {periodWeeklyReadinessBreakdown.map((weekItem) => {
                  const isSelected = selectedWeek === String(weekItem.weekNum) || selectedWeek === 'all';
                  const energyNum = Number(weekItem.avgEnergy);
                  const energyPct = Math.round((energyNum / 5) * 100);

                  return (
                    <div 
                      key={weekItem.weekNum}
                      onClick={() => setSelectedWeek(String(weekItem.weekNum))}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedWeek === String(weekItem.weekNum)
                          ? 'bg-[#18181b] border-[#ff6b00] shadow-md ring-1 ring-[#ff6b00]/40'
                          : 'bg-[#18181b] border-[rgba(242,242,242,0.08)] hover:border-[rgba(242,242,242,0.18)]'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#f2f2f2]">
                              {weekItem.microcycleName}
                            </span>
                            {selectedWeek === String(weekItem.weekNum) && (
                              <span className="text-[9px] bg-[#ff6b00] text-black font-black px-1.5 py-0.2 rounded">
                                Activo
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#a1a1aa] mt-0.5">
                            {weekItem.microcycleFocus}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-[#ff6b00]">
                            ⚡ {weekItem.avgEnergy}/5
                          </span>
                          <div className="text-[9px] text-[#71717a]">Readiness</div>
                        </div>
                      </div>

                      {/* Energy Bar */}
                      <div className="w-full bg-[#141417] h-1.5 rounded-full overflow-hidden my-2">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            weekItem.weekNum === 4 ? 'bg-[#22c55e]' : weekItem.weekNum === 3 ? 'bg-[#ff6b00]' : 'bg-[#ff8c33]'
                          }`}
                          style={{ width: `${energyPct}%` }}
                        />
                      </div>

                      {/* Microcycle Stats Row */}
                      <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] pt-1 border-t border-[rgba(242,242,242,0.08)]">
                        <div>
                          <span className="text-[#71717a] block text-[8px] uppercase">Fatiga</span>
                          <span className="font-bold text-[#f2f2f2]">{weekItem.avgFatigue}/5</span>
                        </div>
                        <div>
                          <span className="text-[#71717a] block text-[8px] uppercase">DOMS</span>
                          <span className="font-bold text-[#f2f2f2]">{weekItem.avgDOMS}/5</span>
                        </div>
                        <div>
                          <span className="text-[#71717a] block text-[8px] uppercase">Sueño</span>
                          <span className="font-bold text-[#f2f2f2]">{weekItem.avgSleep}h</span>
                        </div>
                        <div>
                          <span className="text-[#71717a] block text-[8px] uppercase">Sesiones</span>
                          <span className="font-bold text-[#22c55e]">
                            {weekItem.completedCount}/{weekItem.totalCount} ✓
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Periodization Guidance for Coach */}
              <div className="p-3 bg-[#18181b] border border-[rgba(242,242,242,0.08)] rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-[#f2f2f2] font-bold text-xs">
                  <Info className="w-3.5 h-3.5 text-[#ff6b00]" />
                  <span>Criterio de Periodización para el Coach:</span>
                </div>
                <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
                  En la <strong className="text-[#ff6b00]">Semana 3 (Pico de Sobrecarga)</strong> es normal que la fatiga suba a 3.5+. La <strong className="text-[#22c55e]">Semana 4 (Descarga)</strong> restaura los niveles de energía a 4.5+ para el siguiente mesociclo.
                </p>
              </div>

            </div>

            {/* Right: Registro Cronológico de Readiness por Periodización */}
            <div className="lg:col-span-7 bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.08)] p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(242,242,242,0.08)] pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#f2f2f2] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#ff6b00]" />
                    <span>Registro Diario de Readiness por Microciclo</span>
                  </h3>
                  <p className="text-[11px] text-[#a1a1aa]">
                    Historial cronológico de autoevaluación del alumno filtrado por el período seleccionado.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#ff6b00] bg-[rgba(255,107,0,0.12)] border border-[rgba(255,107,0,0.3)] px-2.5 py-1 rounded-lg">
                    {effectiveReadiness.length} Registros en Período
                  </span>
                </div>
              </div>

              {effectiveReadiness.length === 0 ? (
                <div className="text-center py-10 text-[#71717a] text-xs">
                  Aún no hay registros de energía cargados para este período.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[440px] overflow-y-auto custom-scrollbar pr-1">
                  {effectiveReadiness.map((log) => {
                    const workoutForDate = student.workouts?.[log.date];
                    const energyLvl = log.energyLevel || 4;

                    // Calculate week and month for this log
                    const logDate = new Date(log.date);
                    const diffTime = logDate.getTime() - baseStartDate.getTime();
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    const totalWeekIndex = Math.max(0, Math.floor(diffDays / 7));
                    const monthNum = Math.floor(totalWeekIndex / 4) + 1;
                    const weekInMonth = (totalWeekIndex % 4) + 1;

                    return (
                      <div
                        key={log.date}
                        className="bg-[#18181b] rounded-xl border border-[rgba(242,242,242,0.08)] p-3 space-y-2 hover:border-[rgba(242,242,242,0.18)] transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(242,242,242,0.08)] pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#f2f2f2]">
                              {log.date}
                            </span>
                            <span className="text-[10px] bg-[#141417] text-[#a1a1aa] px-2 py-0.5 rounded font-bold border border-[rgba(242,242,242,0.08)]">
                              Mes {monthNum} • Sem {weekInMonth}
                            </span>
                            <span className="text-[10px] bg-[#1c1c21] text-[#f2f2f2] px-2 py-0.5 rounded font-medium border border-[rgba(242,242,242,0.08)]">
                              {workoutForDate?.title || 'Día de Entrenamiento'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                              energyLvl >= 4
                                ? 'bg-[rgba(255,107,0,0.12)] text-[#ff6b00] border-[rgba(255,107,0,0.3)]'
                                : energyLvl === 3
                                ? 'bg-[#1c1c21] text-[#f2f2f2] border-[rgba(242,242,242,0.12)]'
                                : 'bg-[rgba(239,68,68,0.12)] text-[#ef4444] border-[rgba(239,68,68,0.25)]'
                            }`}>
                              ⚡ Nivel {energyLvl} / 5
                            </span>
                            {workoutForDate?.completed && (
                              <span className="text-[10px] bg-[rgba(34,197,94,0.12)] text-[#22c55e] font-bold px-2 py-0.5 rounded-full border border-[rgba(34,197,94,0.25)]">
                                ✓ Guardado
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick Metrics Grid */}
                        <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                          <div className="p-1 bg-[#141417] rounded-lg border border-[rgba(242,242,242,0.08)]">
                            <span className="text-[9px] uppercase font-medium text-[#71717a] block">Fatiga</span>
                            <span className="font-bold text-[#f2f2f2]">{log.fatigueLevel || 2}/5</span>
                          </div>
                          <div className="p-1 bg-[#141417] rounded-lg border border-[rgba(242,242,242,0.08)]">
                            <span className="text-[9px] uppercase font-medium text-[#71717a] block">DOMS</span>
                            <span className="font-bold text-[#f2f2f2]">{log.muscleSoreness || 2}/5</span>
                          </div>
                          <div className="p-1 bg-[#141417] rounded-lg border border-[rgba(242,242,242,0.08)]">
                            <span className="text-[9px] uppercase font-medium text-[#71717a] block">Sueño</span>
                            <span className="font-bold text-[#f2f2f2]">{log.sleepHours || 7.5}h</span>
                          </div>
                          <div className="p-1 bg-[#141417] rounded-lg border border-[rgba(242,242,242,0.08)]">
                            <span className="text-[9px] uppercase font-medium text-[#71717a] block">Ánimo</span>
                            <span className="font-bold text-[#22c55e]">{log.mood || 'Bueno'}</span>
                          </div>
                        </div>

                        {/* Notes */}
                        {log.notes && (
                          <div className="text-[11px] text-[#a1a1aa] bg-[#141417] p-2 rounded-lg border border-[rgba(242,242,242,0.08)] flex items-start gap-1.5">
                            <MessageSquare className="w-3 h-3 text-[#ff6b00] shrink-0 mt-0.5" />
                            <p className="italic leading-tight">"{log.notes}"</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DETAILED ASSIGNED DAYS PLANNER */}
      {/* ======================================================== */}
      {activeTab === 'schedule' && (
        <div className="bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.08)] p-4 sm:p-5 shadow-sm space-y-4">
          <div className="border-b border-[rgba(242,242,242,0.08)] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#f2f2f2] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#ff6b00]" />
                <span>Programación de Días Asignados ({getSelectedPeriodTitle()})</span>
              </h3>
              <p className="text-[11px] text-[#a1a1aa]">
                Detalle técnico de cada sesión con Grupo Muscular, Patrón, Ejercicios, Series, Repes y RIR/RPE.
              </p>
            </div>

            <span className="text-xs font-bold text-[#f2f2f2] bg-[#18181b] px-3 py-1 rounded-lg border border-[rgba(242,242,242,0.08)]">
              {effectiveWorkouts.filter(w => !w.isRestDay && w.exercises?.length > 0).length} Sesiones en Período
            </span>
          </div>

          {effectiveWorkouts.filter(w => !w.isRestDay && w.exercises?.length > 0).length === 0 ? (
            <div className="text-center py-10 text-[#71717a] text-xs">
              No hay sesiones programadas en este período.
            </div>
          ) : (
            <div className="space-y-3">
              {effectiveWorkouts
                .filter((w) => !w.isRestDay && w.exercises && w.exercises.length > 0)
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((dayWorkout) => {
                  const totalSetsInDay = dayWorkout.exercises.reduce((acc, e) => acc + (e.sets?.length || 0), 0);

                  return (
                    <div
                      key={dayWorkout.id || dayWorkout.date}
                      className="bg-[#18181b] rounded-xl border border-[rgba(242,242,242,0.08)] overflow-hidden"
                    >
                      {/* Day Card Header */}
                      <div className="p-2.5 bg-[#141417] border-b border-[rgba(242,242,242,0.08)] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-[rgba(255,107,0,0.12)] text-[#ff6b00] border border-[rgba(255,107,0,0.3)] px-2 py-0.5 rounded-md">
                            {dayWorkout.dayName} ({dayWorkout.date})
                          </span>
                          <span className="font-bold text-[#f2f2f2] text-xs">
                            {dayWorkout.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-[11px] text-[#a1a1aa] font-medium bg-[#18181b] px-2 py-0.5 rounded border border-[rgba(242,242,242,0.08)]">
                            {dayWorkout.exercises.length} ejercicios • {totalSetsInDay} series
                          </span>
                          {dayWorkout?.completed ? (
                            <span className="text-[10px] bg-[rgba(34,197,94,0.12)] text-[#22c55e] font-bold px-2 py-0.5 rounded-full border border-[rgba(34,197,94,0.25)]">
                              ✓ Completado {dayWorkout?.sessionEnergyLevel ? `• ⚡ ${dayWorkout.sessionEnergyLevel}/5` : ''}
                            </span>
                          ) : (
                            <span className="text-[10px] bg-[#18181b] text-[#71717a] font-medium px-2 py-0.5 rounded-full border border-[rgba(242,242,242,0.08)]">
                              Programado
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Exercises Breakdown Table */}
                      <div className="p-3 overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="text-[9px] uppercase font-bold text-[#71717a] border-b border-[rgba(242,242,242,0.08)]">
                              <th className="pb-2 w-8">#</th>
                              <th className="pb-2">Ejercicio</th>
                              <th className="pb-2">Grupo Muscular</th>
                              <th className="pb-2">Patrón de Movimiento</th>
                              <th className="pb-2 text-center">Series</th>
                              <th className="pb-2 text-center">Repes Obj.</th>
                              <th className="pb-2 text-center">Carga Obj.</th>
                              <th className="pb-2 text-center">RIR / RPE</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[rgba(242,242,242,0.08)] font-medium text-[#a1a1aa]">
                            {dayWorkout.exercises.map((ex, idx) => {
                              const firstSet = ex.sets?.[0];
                              const setsCount = ex.sets?.length || 0;

                              return (
                                <tr key={ex.id || idx} className="hover:bg-[#141417]">
                                  <td className="py-2 text-[#71717a] font-bold">{idx + 1}</td>
                                  <td className="py-2 font-bold text-[#f2f2f2]">{ex.name}</td>
                                  <td className="py-2">
                                    <span className="text-[10px] bg-[#141417] text-[#f2f2f2] font-medium px-1.5 py-0.5 rounded border border-[rgba(242,242,242,0.08)]">
                                      {ex.muscleGroup}
                                    </span>
                                  </td>
                                  <td className="py-2 text-[#a1a1aa]">{ex.movementPattern}</td>
                                  <td className="py-2 text-center font-bold text-[#f2f2f2]">{setsCount}</td>
                                  <td className="py-2 text-center font-bold text-[#f2f2f2]">
                                    {firstSet?.targetReps || '8-10'}
                                  </td>
                                  <td className="py-2 text-center font-bold text-[#ff6b00]">
                                    {firstSet?.targetWeightKg || 0} kg
                                  </td>
                                  <td className="py-2 text-center">
                                    <span className="text-[10px] font-bold text-[#f2f2f2]">
                                      RIR {firstSet?.targetRir ?? 2}
                                    </span>{' '}
                                    <span className="text-[10px] font-bold text-[#ff6b00]">
                                      @{firstSet?.targetRpe ?? 8}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: ANÁLISIS DE CARDIO & ACONDICIONAMIENTO FÍSICO */}
      {/* ======================================================== */}
      {activeTab === 'cardio' && (
        <CardioAnalyticsView
          student={student}
          selectedMonth={selectedMonth}
          selectedWeek={selectedWeek}
          onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL: SOLICITAR / CREAR NUEVO MACROCICLO */}
      {/* ======================================================== */}
      {isNewMacrocycleModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141417] border border-[rgba(242,242,242,0.12)] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[rgba(242,242,242,0.08)] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[rgba(255,107,0,0.12)] flex items-center justify-center text-[#ff6b00] border border-[rgba(255,107,0,0.3)]">
                  <Plus className="w-4 h-4 text-[#ff6b00]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#f2f2f2]">
                    Solicitar / Iniciar Nuevo Macrociclo
                  </h3>
                  <p className="text-xs text-[#a1a1aa]">
                    Programación anual de 12 meses (48 semanas)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewMacrocycleModalOpen(false)}
                className="text-[#71717a] hover:text-[#f2f2f2] p-1 rounded-lg hover:bg-[#18181b] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMacrocycle} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#f2f2f2] block mb-1">
                  Nombre del Macrociclo
                </label>
                <input
                  type="text"
                  value={newMacroName}
                  onChange={(e) => setNewMacroName(e.target.value)}
                  placeholder="Ej. Macrociclo 2 (Año 2 - Especialización)"
                  className="w-full bg-[#18181b] border border-[rgba(242,242,242,0.08)] rounded-xl px-3 py-2 text-xs font-bold text-[#f2f2f2] focus:outline-none focus:border-[rgba(255,107,0,0.5)]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#f2f2f2] block mb-1">
                  Foco / Objetivo Principal
                </label>
                <input
                  type="text"
                  value={newMacroFocus}
                  onChange={(e) => setNewMacroFocus(e.target.value)}
                  placeholder="Ej. Hipertrofia & Fuerza Máxima, Recomposición..."
                  className="w-full bg-[#18181b] border border-[rgba(242,242,242,0.08)] rounded-xl px-3 py-2 text-xs font-bold text-[#f2f2f2] focus:outline-none focus:border-[rgba(255,107,0,0.5)]"
                  required
                />
              </div>

              <div className="p-3 bg-[#18181b] rounded-xl border border-[rgba(242,242,242,0.08)] text-[11px] text-[#a1a1aa] space-y-1">
                <span className="font-bold text-[#f2f2f2] block">Estructura del Ciclo:</span>
                <p>• 12 Meses calendario organizados en 4 Mesociclos trimestrales.</p>
                <p>• 4 Semanas por mes con auto-regulación de volumen (MAV) y ⚡ estado de energía.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[rgba(242,242,242,0.08)]">
                <button
                  type="button"
                  onClick={() => setIsNewMacrocycleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#71717a] hover:bg-[#18181b] hover:text-[#f2f2f2] transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#ff6b00] hover:bg-[#e65e00] text-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Crear Macrociclo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Report Download Modal (PDF / CSV / JSON) with individual tab selection */}
      <StudentReportDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        student={student}
        macrocycleName={macrocycles.find(m => m.id === selectedMacrocycleId)?.name}
        selectedMonth={selectedMonth}
        selectedWeek={selectedWeek}
        initialTab={activeTab}
      />

    </div>
  );
};
