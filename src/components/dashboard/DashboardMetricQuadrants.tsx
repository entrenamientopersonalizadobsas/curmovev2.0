import React, { useState } from 'react';
import { MuscleGroup, MovementPattern } from '../../types';
import { MuscleGroupHierarchyData } from './types';
import { MUSCLE_TO_PATTERNS_MAP } from '../TrainerDashboardView';
import { 
  Zap, 
  BarChart3, 
  TrendingUp, 
  Scale, 
  Flame, 
  Moon, 
  HeartPulse, 
  Activity, 
  CheckCircle, 
  Dumbbell, 
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';

interface DashboardMetricQuadrantsProps {
  hierarchyData: MuscleGroupHierarchyData[];
  selectedMuscleFilter: string;
  onSelectMuscleFilter: (muscle: string) => void;
  avgEnergy: string;
  avgFatigue: string;
  avgSoreness: string;
  avgSleep: string;
  energyPercent: number;
  totalTonnageKg: number;
  totalCompletedSets: number;
  totalTargetSets: number;
  adherencePct: number;
  avgRpe: string;
  avgRir: string;
  selectedPeriodTitle: string;
}

export const DashboardMetricQuadrants: React.FC<DashboardMetricQuadrantsProps> = ({
  hierarchyData,
  selectedMuscleFilter,
  onSelectMuscleFilter,
  avgEnergy,
  avgFatigue,
  avgSoreness,
  avgSleep,
  energyPercent,
  totalTonnageKg,
  totalCompletedSets,
  totalTargetSets,
  adherencePct,
  avgRpe,
  avgRir,
  selectedPeriodTitle
}) => {
  // Selected muscle for quadrant drill-down
  const [activeQuadrantMuscle, setActiveQuadrantMuscle] = useState<string>(
    selectedMuscleFilter !== 'all' ? selectedMuscleFilter : 'Pecho'
  );

  // Active muscle group item
  const currentMuscleData = hierarchyData.find(m => m.muscleGroup === activeQuadrantMuscle) || hierarchyData[0];
  const biomechanicalInfo = currentMuscleData ? MUSCLE_TO_PATTERNS_MAP[currentMuscleData.muscleGroup] : null;

  return (
    <div className="space-y-4">
      {/* Selector Bar to switch the active Muscle Group for all Quadrants */}
      <div className="bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.1)] p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[rgba(255,107,0,0.15)] text-[#ff6b00] rounded-lg border border-[rgba(255,107,0,0.3)]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#f2f2f2]">
              CUADRANTES DE ANÁLISIS REPRODUCIBLES POR GRUPO & PATRÓN
            </h4>
            <p className="text-[10px] text-[rgba(242,242,242,0.6)]">
              Seleccioná un grupo muscular para reproducir y sincronizar métricas, volumen, energía y balance biomecánico.
            </p>
          </div>
        </div>

        {/* Quick Muscle Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          {hierarchyData.map((group) => {
            const isSelected = activeQuadrantMuscle === group.muscleGroup;
            return (
              <button
                key={group.muscleGroup}
                type="button"
                onClick={() => {
                  setActiveQuadrantMuscle(group.muscleGroup);
                  onSelectMuscleFilter(group.muscleGroup);
                }}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#ff6b00] text-[#ffffff] font-black shadow-sm ring-1 ring-[#ff8533]'
                    : 'bg-[#1c1c21] text-[rgba(242,242,242,0.7)] hover:text-[#f2f2f2] hover:bg-[#26262b] border border-[rgba(242,242,242,0.1)]'
                }`}
              >
                <span>{group.muscleGroup}</span>
                <span className={`text-[9px] px-1 py-0.2 rounded-full font-black ${
                  isSelected ? 'bg-[#000000]/30 text-[#ffffff]' : 'bg-[#0c0c0e] text-[#ff6b00]'
                }`}>
                  {group.totalSets}s
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 MAIN REPRODUCIBLE QUADRANTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* ======================================================== */}
        {/* CUADRANTE 1: VOLUMEN & SERIES INDEXADO POR PATRÓN Y EJERCICIO */}
        {/* ======================================================== */}
        <div className="bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.1)] p-4 sm:p-5 shadow-sm space-y-3.5">
          <div className="flex justify-between items-start border-b border-[rgba(242,242,242,0.1)] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[rgba(255,107,0,0.15)] text-[#ff6b00] border border-[rgba(255,107,0,0.3)] flex items-center justify-center shrink-0">
                <Dumbbell className="w-4 h-4 text-[#ff6b00]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#ff6b00] block">Cuadrante 1</span>
                <h4 className="text-xs font-black uppercase tracking-tight text-[#f2f2f2] flex items-center gap-1.5">
                  <span>Volumen & Series: {currentMuscleData?.muscleGroup}</span>
                </h4>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-black text-[#ff6b00]">
                {currentMuscleData?.totalSets} Series
              </span>
              <span className="text-[10px] text-[rgba(242,242,242,0.5)] block">
                {((currentMuscleData?.totalTonnageKg || 0) / 1000).toFixed(1)}k kg acumulado
              </span>
            </div>
          </div>

          {/* Breakdown by specific Movement Patterns of this Muscle Group */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold uppercase text-[rgba(242,242,242,0.5)] block">
              Desglose de Patrones Motores para {currentMuscleData?.muscleGroup}:
            </span>

            {currentMuscleData?.patterns.map((pat) => {
              const patternPct = currentMuscleData.totalSets > 0 
                ? Math.round((pat.totalSets / currentMuscleData.totalSets) * 100) 
                : 0;

              return (
                <div key={pat.patternName} className="p-2.5 bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#ff6b00]" />
                      <span className="font-bold text-[#f2f2f2]">{pat.patternName}</span>
                      <span className="text-[9px] bg-[#0c0c0e] text-[#ff6b00] px-1.5 py-0.2 rounded border border-[rgba(242,242,242,0.1)]">
                        {pat.exercises.length} {pat.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#f2f2f2]">{pat.totalSets} series</span>
                      <span className="text-[10px] text-[rgba(242,242,242,0.5)]">({patternPct}%)</span>
                    </div>
                  </div>

                  {/* Volume Bar */}
                  <div className="w-full bg-[#0c0c0e] h-1.5 rounded-full overflow-hidden border border-[rgba(242,242,242,0.06)]">
                    <div
                      className="h-full rounded-full bg-[#ff6b00] transition-all duration-500"
                      style={{ width: `${patternPct}%` }}
                    />
                  </div>

                  {/* Individual Exercises list snippet under this pattern */}
                  <div className="pt-1 flex flex-wrap gap-1 text-[10px]">
                    {pat.exercises.map((ex) => (
                      <span
                        key={ex.exerciseName}
                        className="bg-[#0c0c0e] text-[rgba(242,242,242,0.7)] px-2 py-0.5 rounded border border-[rgba(242,242,242,0.1)] flex items-center gap-1"
                      >
                        <strong className="text-[#f2f2f2]">{ex.exerciseName}</strong>
                        <span className="text-[rgba(242,242,242,0.5)]">({ex.completedSets}s • {ex.maxWeightKg}kg)</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* CUADRANTE 2: ESTADO DE ENERGÍA ⚡ & DISPONIBILIDAD */}
        {/* ======================================================== */}
        <div className="bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.1)] p-4 sm:p-5 shadow-sm space-y-3.5">
          <div className="flex justify-between items-start border-b border-[rgba(242,242,242,0.1)] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[rgba(255,107,0,0.15)] text-[#ff6b00] border border-[rgba(255,107,0,0.3)] flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-[#ff6b00] fill-[#ff6b00]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#ff6b00] block">Cuadrante 2</span>
                <h4 className="text-xs font-black uppercase tracking-tight text-[#f2f2f2]">
                  Disponibilidad de Energía & Recuperación
                </h4>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-black text-[#ff6b00]">
                ⚡ {avgEnergy} / 5.0
              </span>
              <span className="text-[10px] text-[#22c55e] block font-bold">
                {energyPercent}% Capacidad Óptima
              </span>
            </div>
          </div>

          {/* 4-Stat Metric Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-[#1c1c21] p-2.5 rounded-xl border border-[rgba(242,242,242,0.1)] text-center">
              <span className="text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] block">Fatiga</span>
              <span className="text-base font-black text-[#f2f2f2]">{avgFatigue}/5</span>
              <span className="text-[9px] text-[#22c55e] block mt-0.5">Baja ✓</span>
            </div>

            <div className="bg-[#1c1c21] p-2.5 rounded-xl border border-[rgba(242,242,242,0.1)] text-center">
              <span className="text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] block">DOMS</span>
              <span className="text-base font-black text-[#f2f2f2]">{avgSoreness}/5</span>
              <span className="text-[9px] text-[#ff6b00] block mt-0.5">Adaptado</span>
            </div>

            <div className="bg-[#1c1c21] p-2.5 rounded-xl border border-[rgba(242,242,242,0.1)] text-center">
              <span className="text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] block">Sueño</span>
              <span className="text-base font-black text-[#f2f2f2]">{avgSleep}h</span>
              <span className="text-[9px] text-[#22c55e] block mt-0.5">Anabólico</span>
            </div>

            <div className="bg-[#1c1c21] p-2.5 rounded-xl border border-[rgba(242,242,242,0.1)] text-center">
              <span className="text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] block">Adherencia</span>
              <span className="text-base font-black text-[#ff6b00]">{adherencePct}%</span>
              <span className="text-[9px] text-[#22c55e] block mt-0.5 font-bold">Excelente</span>
            </div>
          </div>

          <div className="p-2.5 bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] text-[11px] text-[rgba(242,242,242,0.7)] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#f2f2f2]">
              <Activity className="w-3.5 h-3.5 text-[#ff6b00]" />
              <span>Correlación de Carga & Tolerancia:</span>
            </div>
            <p className="leading-tight text-[10px]">
              El atleta cuenta con suficiente reserva neuromuscular para sostener las series de <strong className="text-[#f2f2f2]">{currentMuscleData?.muscleGroup}</strong> en RIR 1-2 sin acumular sobreentrenamiento.
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CUADRANTE 3: BALANCE BIOMECÁNICO AGONISTA / ANTAGONISTA */}
        {/* ======================================================== */}
        <div className="bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.1)] p-4 sm:p-5 shadow-sm space-y-3.5">
          <div className="flex justify-between items-start border-b border-[rgba(242,242,242,0.1)] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[rgba(255,107,0,0.15)] text-[#ff6b00] border border-[rgba(255,107,0,0.3)] flex items-center justify-center shrink-0">
                <Scale className="w-4 h-4 text-[#ff6b00]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#ff6b00] block">Cuadrante 3</span>
                <h4 className="text-xs font-black uppercase tracking-tight text-[#f2f2f2]">
                  Balance Biomecánico & Salud Articular
                </h4>
              </div>
            </div>

            <span className="text-[10px] bg-[rgba(34,197,94,0.12)] text-[#22c55e] font-bold px-2 py-0.5 rounded-md border border-[rgba(34,197,94,0.25)] flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> En Rango Óptimo
            </span>
          </div>

          {biomechanicalInfo ? (
            <div className="space-y-2.5">
              <div className="p-3 bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[#ff6b00] block">
                  Par Biomecánico Analizado:
                </span>
                <p className="text-xs font-bold text-[#f2f2f2]">
                  {biomechanicalInfo.balanceName}
                </p>
                <div className="flex justify-between items-center text-[10px] text-[rgba(242,242,242,0.5)] pt-1">
                  <span>Antagonista: <strong className="text-[#f2f2f2]">{biomechanicalInfo.antagonistMuscle}</strong></span>
                  <span className="text-[#22c55e] font-bold">Ideal: {biomechanicalInfo.idealRatio}</span>
                </div>
              </div>

              <div className="p-3 bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#ff6b00] block">
                  Criterio Postural & Salud Escapular / Articular:
                </span>
                <p className="text-[11px] text-[rgba(242,242,242,0.7)] leading-relaxed">
                  {biomechanicalInfo.recommendation}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-xs text-[rgba(242,242,242,0.5)] italic py-4 text-center">
              Seleccioná un grupo muscular para ver el análisis de equilibrio biomecánico.
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* CUADRANTE 4: INTENSIDAD DE ESFUERZO (RIR & RPE) */}
        {/* ======================================================== */}
        <div className="bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.1)] p-4 sm:p-5 shadow-sm space-y-3.5">
          <div className="flex justify-between items-start border-b border-[rgba(242,242,242,0.1)] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[rgba(255,107,0,0.15)] text-[#ff6b00] border border-[rgba(255,107,0,0.3)] flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 text-[#ff6b00]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#ff6b00] block">Cuadrante 4</span>
                <h4 className="text-xs font-black uppercase tracking-tight text-[#f2f2f2]">
                  Intensidad Real: RPE & RIR por Ejercicio
                </h4>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-black text-[#ff6b00]">
                RPE Promedio @{currentMuscleData?.avgRpe > 0 ? currentMuscleData.avgRpe.toFixed(1) : avgRpe}
              </span>
              <span className="text-[10px] text-[#22c55e] block font-bold">
                RIR {currentMuscleData?.avgRir > 0 ? currentMuscleData.avgRir.toFixed(1) : avgRir}
              </span>
            </div>
          </div>

          {/* Exercise-by-Exercise Intensity Compliance */}
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {currentMuscleData?.allExercises.map((ex) => (
              <div
                key={ex.exerciseName}
                className="p-2.5 bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-[#f2f2f2] block">{ex.exerciseName}</span>
                  <span className="text-[10px] text-[rgba(242,242,242,0.5)]">
                    {ex.completedSets} series completadas • Carga máx: {ex.maxWeightKg}kg
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-[rgba(255,107,0,0.15)] text-[#ff6b00] font-bold px-2 py-0.5 rounded border border-[rgba(255,107,0,0.3)]">
                    @{ex.avgRpe.toFixed(1)}
                  </span>
                  <span className="text-[10px] bg-[rgba(34,197,94,0.12)] text-[#22c55e] font-bold px-2 py-0.5 rounded border border-[rgba(34,197,94,0.25)]">
                    RIR {ex.avgRir.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
