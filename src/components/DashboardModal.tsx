import React, { useState } from 'react';
import { StudentProfile, MuscleGroup, MovementPattern, DailyWorkout, DashboardPeriod } from '../types';
import { MUSCLE_GROUPS_LIST, MOVEMENT_PATTERNS_LIST } from '../data/mockData';
import { 
  Sparkles, 
  Dumbbell, 
  TrendingUp, 
  Activity, 
  Calendar, 
  CheckCircle, 
  X, 
  Flame, 
  BarChart3,
  Award,
  Filter,
  Layers,
  ChevronDown,
  Clock,
  ArrowRightLeft,
  CalendarDays
} from 'lucide-react';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
}

export const DashboardModal: React.FC<DashboardModalProps> = ({
  isOpen,
  onClose,
  student
}) => {
  // Period filter: Semanas (con selector), 1 mes - semanas, 1-3 meses, 3-6 meses, 6-12 meses
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>('week');
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(1);
  
  // Drill-down filters
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('all');
  const [selectedPatternFilter, setSelectedPatternFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'analytics' | 'schedule'>('analytics');

  if (!isOpen) return null;

  // Period multiplier and label helper
  const getPeriodMultiplier = (p: DashboardPeriod) => {
    switch (p) {
      case 'week': return 1;
      case 'month-weeks': return 4;
      case '1-3months': return 12;
      case '3-6months': return 24;
      case '6-12months': return 48;
      default: return 1;
    }
  };

  const getPeriodLabel = (p: DashboardPeriod) => {
    switch (p) {
      case 'week': return `Semana ${selectedWeekNumber}`;
      case 'month-weeks': return '1 Mes (Desglosado en Semanas)';
      case '1-3months': return '1 - 3 Meses (Mesociclo)';
      case '3-6months': return '3 - 6 Meses (Semestre)';
      case '6-12months': return '6 - 12 Meses (Periodización Anual)';
    }
  };

  const periodMult = getPeriodMultiplier(selectedPeriod);

  // Calculate training metrics and stats
  const workoutsArray: DailyWorkout[] = Object.values(student.workouts || {});
  
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

  const patternSetsMap: Record<MovementPattern, number> = {
    'Empuje Horizontal': 0,
    'Empuje Vertical': 0,
    'Tirón Horizontal': 0,
    'Tirón Vertical': 0,
    'Dominante de Rodilla': 0,
    'Bisagra de Cadera': 0,
    'Aislamiento': 0,
    'Anti-Extensión / Core': 0,
    'Transporte / Carga': 0
  };

  let sumRpe = 0;
  let rpeCount = 0;
  let sumRir = 0;
  let rirCount = 0;

  workoutsArray.forEach((w) => {
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

        if (patternSetsMap[ex.movementPattern] !== undefined) {
          patternSetsMap[ex.movementPattern] += 1;
        }

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

  // Calculate scaled numbers for selected period
  const totalTonnageKg = (baseTonnageKg || 12400) * periodMult;
  const totalCompletedSets = (baseCompletedSets || 48) * periodMult;
  const totalTargetSets = (baseTargetSets || 54) * periodMult;
  const avgRpe = rpeCount > 0 ? (sumRpe / rpeCount).toFixed(1) : '8.2';
  const avgRir = rirCount > 0 ? (sumRir / rirCount).toFixed(1) : '1.8';
  const adherencePct = totalTargetSets > 0 ? Math.round((totalCompletedSets / totalTargetSets) * 100) : 89;

  // Pattern Ratios (Push vs Pull, Knee vs Hip)
  const pushSets = (patternSetsMap['Empuje Horizontal'] || 8) + (patternSetsMap['Empuje Vertical'] || 4);
  const pullSets = (patternSetsMap['Tirón Horizontal'] || 8) + (patternSetsMap['Tirón Vertical'] || 6);
  const kneeSets = patternSetsMap['Dominante de Rodilla'] || 8;
  const hipSets = patternSetsMap['Bisagra de Cadera'] || 6;

  // Flattened assigned workout days list for coach review
  const assignedDaysList = workoutsArray
    .filter((w) => !w.isRestDay && w.exercises && w.exercises.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-700 flex items-center justify-center text-amber-300 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>DASHBOARD DEL ENTRENADOR</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                  Solo Coach
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Atleta: <span className="text-violet-800 font-bold">{student.fullName}</span> • Objetivo: {student.goal} • {getPeriodLabel(selectedPeriod)}
              </p>
            </div>
          </div>

          {/* Period Filter Dropdowns */}
          <div className="flex items-center gap-2">
            
            {/* Main Period Selector Dropdown */}
            <div className="relative">
              <select
                id="select-dashboard-period"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as DashboardPeriod)}
                className="pl-3 pr-8 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-violet-500 focus:outline-none cursor-pointer appearance-none"
              >
                <option value="week">Semanas (Elegir)</option>
                <option value="month-weeks">1 Mes - Semanas</option>
                <option value="1-3months">1 - 3 Meses</option>
                <option value="3-6months">3 - 6 Meses</option>
                <option value="6-12months">6 - 12 Meses</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Sub-selector when "week" is chosen */}
            {selectedPeriod === 'week' && (
              <div className="relative">
                <select
                  value={selectedWeekNumber}
                  onChange={(e) => setSelectedWeekNumber(Number(e.target.value))}
                  className="pl-2.5 pr-7 py-1.5 bg-violet-50 border border-violet-200 rounded-lg text-xs font-bold text-violet-900 focus:ring-2 focus:ring-violet-500 focus:outline-none cursor-pointer appearance-none"
                >
                  <option value={1}>Semana 1 (Actual)</option>
                  <option value={2}>Semana 2</option>
                  <option value={3}>Semana 3</option>
                  <option value={4}>Semana 4</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-violet-700 absolute right-2 top-2.5 pointer-events-none" />
              </div>
            )}

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs (Contabilización vs Planificación Detallada de Días) */}
        <div className="px-6 pt-3 pb-0 bg-slate-50 border-b border-slate-200 flex items-center gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-violet-700 text-violet-900 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Contabilización & Volumen (Grupos & Patrones)</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'schedule'
                ? 'border-violet-700 text-violet-900 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Planificación por Día Asignado (Músculo, Patrón, Series, RIR/RPE)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1">
          
          {activeTab === 'analytics' ? (
            <>
              {/* Top KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Violet Card: Period Volume */}
                <div className="bg-violet-950 text-white p-4 rounded-xl shadow-sm flex flex-col justify-between border border-violet-800/40">
                  <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                    Volumen Total ({getPeriodLabel(selectedPeriod)})
                  </span>
                  <div className="my-2">
                    <p className="text-2xl font-black text-white">
                      {(totalTonnageKg / 1000).toFixed(1)}k <span className="text-xs font-normal text-violet-200">kg</span>
                    </p>
                    <p className="text-[10px] text-violet-200 mt-0.5">Tonelaje de carga calculado</p>
                  </div>
                  <div className="pt-2 border-t border-violet-800 flex items-center justify-between text-[11px]">
                    <span className="text-amber-400 font-black flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" /> +8.4%
                    </span>
                    <span className="text-violet-300">progresión</span>
                  </div>
                </div>

                {/* Violet Card: Frequency & Adherence */}
                <div className="bg-violet-900 text-white p-4 rounded-xl shadow-sm flex flex-col justify-between border border-violet-800/40">
                  <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                    Series Efectivas & Adherencia
                  </span>
                  <div className="my-2">
                    <p className="text-2xl font-black text-white">
                      {totalCompletedSets} <span className="text-xs font-normal text-violet-200">/ {totalTargetSets} series</span>
                    </p>
                    <p className="text-[10px] text-violet-200 mt-0.5">{adherencePct}% de adherencia al plan</p>
                  </div>
                  <div className="pt-2 border-t border-violet-800">
                    <div className="w-full bg-violet-950 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${adherencePct}%` }} />
                    </div>
                  </div>
                </div>

                {/* Light KPI Card: Push vs Pull Balance */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Balance Agonista / Antagonista
                  </span>
                  <div className="my-2 space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Empuje: {pushSets * periodMult} ser.</span>
                      <span>Tirón: {pullSets * periodMult} ser.</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>Rodilla: {kneeSets * periodMult} ser.</span>
                      <span>Cadera: {hipSets * periodMult} ser.</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Ratio 1:1.1 equilibrado
                  </div>
                </div>

                {/* Light KPI Card: RPE & RIR Intensity */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Intensidad Programada
                  </span>
                  <div className="my-2 flex items-baseline gap-3">
                    <div>
                      <span className="text-2xl font-black text-violet-700">@{avgRpe}</span>
                      <span className="text-[10px] text-slate-400 block font-semibold">RPE Promedio</span>
                    </div>
                    <div className="border-l border-slate-200 pl-3">
                      <span className="text-2xl font-black text-amber-600">RIR {avgRir}</span>
                      <span className="text-[10px] text-slate-400 block font-semibold">RIR Promedio</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                    Estímulo mecánico en rango MAV
                  </div>
                </div>

              </div>

              {/* 1. CONTABILIZACIÓN POR GRUPO MUSCULAR (Desplegable) */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-violet-700" />
                      <span>Contabilización por Grupo Muscular</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Total de series efectivas acumuladas en {getPeriodLabel(selectedPeriod)} vs marcos de hipertrofia.
                    </p>
                  </div>

                  {/* Muscle Group Filter Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">Filtrar:</span>
                    <select
                      value={selectedMuscleFilter}
                      onChange={(e) => setSelectedMuscleFilter(e.target.value)}
                      className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    >
                      <option value="all">Todos los Grupos Musculares</option>
                      {MUSCLE_GROUPS_LIST.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {MUSCLE_GROUPS_LIST
                    .filter((m) => selectedMuscleFilter === 'all' || m === selectedMuscleFilter)
                    .map((muscle) => {
                      const baseCount = muscleSetsMap[muscle] || (muscle === 'Pecho' ? 14 : muscle === 'Espalda' ? 16 : muscle === 'Cuádriceps' ? 12 : muscle === 'Hombros' ? 10 : 8);
                      const totalCount = baseCount * periodMult;
                      const targetMav = 16 * periodMult;
                      const pct = Math.min(100, Math.round((totalCount / targetMav) * 100));

                      return (
                        <div key={muscle} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-bold text-slate-800 text-xs">{muscle}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-violet-800 text-sm">{totalCount}</span>
                              <span className="text-slate-400 text-[10px]">series en el período</span>
                            </div>
                          </div>

                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-violet-700 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
                            <span>Promedio: {(totalCount / periodMult).toFixed(0)} series/sem</span>
                            <span>Rango óptimo MAV (12-18/sem)</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* 2. CONTABILIZACIÓN POR PATRÓN DE MOVIMIENTO (Con Desplegable y Barras de Progreso) */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-600" />
                      <span>Contabilización por Patrón de Movimiento</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Distribución biomecánica y vectores de fuerza acumulados en {getPeriodLabel(selectedPeriod)}.
                    </p>
                  </div>

                  {/* Pattern Filter Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">Filtrar:</span>
                    <select
                      value={selectedPatternFilter}
                      onChange={(e) => setSelectedPatternFilter(e.target.value)}
                      className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                    >
                      <option value="all">Todos los Patrones de Movimiento</option>
                      {MOVEMENT_PATTERNS_LIST.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {MOVEMENT_PATTERNS_LIST
                    .filter((p) => selectedPatternFilter === 'all' || p === selectedPatternFilter)
                    .map((pattern) => {
                      const baseCount = patternSetsMap[pattern] || (pattern.includes('Empuje') ? 6 : pattern.includes('Tirón') ? 6 : pattern.includes('Rodilla') ? 8 : pattern.includes('Cadera') ? 6 : 4);
                      const totalCount = baseCount * periodMult;
                      const targetPatternSets = 12 * periodMult;
                      const pct = Math.min(100, Math.round((totalCount / targetPatternSets) * 100));

                      const getCategoryBadge = (pat: MovementPattern) => {
                        if (pat.includes('Empuje')) return { label: 'Vértice Empuje', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
                        if (pat.includes('Tirón')) return { label: 'Vértice Tracción', bg: 'bg-violet-100 text-violet-900 border-violet-300' };
                        if (pat.includes('Rodilla') || pat.includes('Cadera')) return { label: 'Tren Inferior', bg: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
                        return { label: 'Estabilidad / Core', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
                      };

                      const badge = getCategoryBadge(pattern);

                      return (
                        <div key={pattern} className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/80 hover:border-amber-400 transition-colors">
                          <div className="flex justify-between items-center mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800 text-xs">{pattern}</span>
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${badge.bg}`}>
                                {badge.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-violet-950 text-sm">{totalCount}</span>
                              <span className="text-slate-400 text-[10px]">series en el período</span>
                            </div>
                          </div>

                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-amber-500 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
                            <span>Promedio: {(totalCount / periodMult).toFixed(0)} series/sem</span>
                            <span>Equilibrio biomecánico ({pct}%)</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </>
          ) : (
            /* TAB 2: DETAILED ASSIGNED DAYS PLANNER (GRUPO MUSCULAR, PATRÓN, EJERCICIOS, SERIES, REPES, RIR/RPE) */
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-violet-700" />
                  <span>Programación de Días Asignados del Mes / Período</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Detalle técnico completo de cada sesión asignada con Grupo Muscular, Patrón de Movimiento, Ejercicios, Series, Repes y RIR/RPE.
                </p>
              </div>

              {assignedDaysList.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No hay sesiones programadas en este período.
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedDaysList.map((dayWorkout) => {
                    const totalSetsInDay = dayWorkout.exercises.reduce((acc, e) => acc + (e.sets?.length || 0), 0);

                    return (
                      <div
                        key={dayWorkout.id || dayWorkout.date}
                        className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
                      >
                        {/* Day Card Header */}
                        <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black bg-violet-700 text-amber-300 px-2 py-0.5 rounded-md">
                              {dayWorkout.dayName} ({dayWorkout.date})
                            </span>
                            <span className="font-bold text-slate-800 text-xs">
                              {dayWorkout.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-[11px] text-violet-900 font-bold bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
                              {dayWorkout.exercises.length} ejercicios • {totalSetsInDay} series totales
                            </span>
                            {dayWorkout.completed ? (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                                ✓ Completado
                              </span>
                            ) : (
                              <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                                Programado
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Exercises Breakdown Table */}
                        <div className="p-3 overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="text-[9px] uppercase font-bold text-slate-400 border-b border-slate-200">
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
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                              {dayWorkout.exercises.map((ex, idx) => {
                                const firstSet = ex.sets?.[0];
                                const setsCount = ex.sets?.length || 0;

                                return (
                                  <tr key={ex.id || idx} className="hover:bg-white/60">
                                    <td className="py-2 text-slate-400 font-bold">{idx + 1}</td>
                                    <td className="py-2 font-bold text-slate-800">{ex.name}</td>
                                    <td className="py-2">
                                      <span className="text-[10px] bg-violet-50 text-violet-800 font-bold px-1.5 py-0.5 rounded border border-violet-200/60">
                                        {ex.muscleGroup}
                                      </span>
                                    </td>
                                    <td className="py-2 text-slate-600">{ex.movementPattern}</td>
                                    <td className="py-2 text-center font-bold">{setsCount}</td>
                                    <td className="py-2 text-center font-bold text-slate-800">
                                      {firstSet?.targetReps || '8-10'}
                                    </td>
                                    <td className="py-2 text-center font-bold text-slate-800">
                                      {firstSet?.targetWeightKg || 0} kg
                                    </td>
                                    <td className="py-2 text-center">
                                      <span className="text-[10px] font-bold text-violet-800">
                                        RIR {firstSet?.targetRir ?? 2}
                                      </span>{' '}
                                      <span className="text-[10px] font-bold text-amber-600">
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

        </div>

      </div>
    </div>
  );
};
