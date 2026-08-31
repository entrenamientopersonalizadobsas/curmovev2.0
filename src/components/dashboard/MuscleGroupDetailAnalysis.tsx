import React, { useState } from 'react';
import { MuscleGroupHierarchyData } from './types';
import { MUSCLE_TO_PATTERNS_MAP } from '../TrainerDashboardView';
import { 
  Dumbbell, 
  Scale, 
  Flame, 
  CheckCircle, 
  Info,
  TrendingUp
} from 'lucide-react';

interface MuscleGroupDetailAnalysisProps {
  hierarchyData: MuscleGroupHierarchyData[];
  selectedMuscle: string;
  onSelectMuscle: (muscle: string) => void;
  selectedPeriodTitle: string;
  periodMultiplier: number;
}

export const MuscleGroupDetailAnalysis: React.FC<MuscleGroupDetailAnalysisProps> = ({
  hierarchyData,
  selectedMuscle,
  onSelectMuscle,
  selectedPeriodTitle,
  periodMultiplier
}) => {
  const activeMuscle = selectedMuscle !== 'all' ? selectedMuscle : 'Pecho';
  const currentMuscleData = hierarchyData.find(m => m.muscleGroup === activeMuscle) || hierarchyData[0];
  const biomechanicalInfo = currentMuscleData ? MUSCLE_TO_PATTERNS_MAP[currentMuscleData.muscleGroup] : null;

  // Find antagonist muscle data for direct ratio calculation
  const antagonistMuscleName = biomechanicalInfo?.antagonistMuscle || 'Espalda';
  const antagonistData = hierarchyData.find(m => m.muscleGroup === antagonistMuscleName);

  const agonistSets = currentMuscleData ? currentMuscleData.totalSets : 14 * periodMultiplier;
  const antagonistSets = antagonistData ? antagonistData.totalSets : 16 * periodMultiplier;
  const computedRatio = antagonistSets > 0 ? (agonistSets / antagonistSets).toFixed(2) : '1.00';

  const totalTonnageDisplay = ((currentMuscleData?.totalTonnageKg || 0) / 1000).toFixed(1);

  return (
    <div className="space-y-4">
      
      {/* Selector Rápido de Grupo Muscular para Análisis Detallado */}
      <div className="bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.1)] p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[rgba(255,107,0,0.15)] text-[#ff6b00] rounded-lg border border-[rgba(255,107,0,0.3)]">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#f2f2f2]">
              ANÁLISIS PROFUNDO POR GRUPO MUSCULAR
            </h4>
            <p className="text-[10px] text-[rgba(242,242,242,0.6)]">
              Seleccioná un grupo para sincronizar su volumen, patrones motores, ratio antagonista e intensidad RPE/RIR.
            </p>
          </div>
        </div>

        {/* Quick Muscle Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          {hierarchyData.map((group) => {
            const isSelected = activeMuscle === group.muscleGroup;
            return (
              <button
                key={group.muscleGroup}
                type="button"
                onClick={() => onSelectMuscle(group.muscleGroup)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#ff6b00] text-[#ffffff] font-black shadow-xs ring-1 ring-[#ff6b00]/40'
                    : 'bg-[#1c1c21] text-[rgba(242,242,242,0.7)] hover:text-[#f2f2f2] hover:bg-[#26262b] border border-[rgba(242,242,242,0.1)]'
                }`}
              >
                <span>{group.muscleGroup}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isSelected ? 'bg-black/20 text-[#ffffff]' : 'bg-[#141417] text-[#ff6b00]'
                }`}>
                  {group.totalSets}s
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PANELS 2, 3 & 4 IN SIDE-BY-SIDE 2-COLUMN QUADRANTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        
        {/* ======================================================== */}
        {/* QUADRANT A (LEFT): VOLUMEN, SERIES Y PATRONES DE MOVIMIENTO */}
        {/* ======================================================== */}
        <div className="bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.1)] p-4 sm:p-5 shadow-sm space-y-4 h-full flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(242,242,242,0.1)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[rgba(255,107,0,0.15)] text-[#ff6b00] border border-[rgba(255,107,0,0.3)] flex items-center justify-center shrink-0">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#f2f2f2]">
                    Volumen & Patrones: {currentMuscleData?.muscleGroup}
                  </h4>
                  <p className="text-[11px] text-[rgba(242,242,242,0.6)] mt-0.5">
                    Series efectivas y patrones motores en {selectedPeriodTitle}.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-[#1c1c21] px-2.5 py-1.5 rounded-xl border border-[rgba(242,242,242,0.1)] self-start sm:self-auto shrink-0">
                <div>
                  <span className="text-[8px] uppercase font-bold text-[rgba(242,242,242,0.5)] block leading-none">Series</span>
                  <span className="text-xs font-black text-[#f2f2f2]">{currentMuscleData?.totalSets}s</span>
                </div>
                <div className="border-l border-[rgba(242,242,242,0.1)] pl-2.5">
                  <span className="text-[8px] uppercase font-bold text-[rgba(242,242,242,0.5)] block leading-none">Tonelaje</span>
                  <span className="text-xs font-black text-[#ff6b00]">{totalTonnageDisplay}k kg</span>
                </div>
              </div>
            </div>

            {/* Desglose de Patrones de Movimiento para este Grupo */}
            <div className="space-y-2.5">
              {currentMuscleData?.patterns.map((pat) => {
                const patternPct = currentMuscleData.totalSets > 0 
                  ? Math.round((pat.totalSets / currentMuscleData.totalSets) * 100) 
                  : 0;

                return (
                  <div key={pat.patternName} className="p-3 bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#f2f2f2] text-xs">{pat.patternName}</span>
                        <span className="text-[9px] bg-[rgba(255,107,0,0.1)] text-[#ff6b00] font-bold px-1.5 py-0.2 rounded-full border border-[rgba(255,107,0,0.25)]">
                          {pat.exercises.length} {pat.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs text-[#f2f2f2]">{pat.totalSets}s</span>
                        <span className="text-[10px] text-[#ff6b00] font-bold bg-[rgba(255,107,0,0.15)] px-1.5 py-0.2 rounded border border-[rgba(255,107,0,0.3)]">
                          {patternPct}%
                        </span>
                      </div>
                    </div>

                    {/* High-visibility Pattern Progress Bar */}
                    <div className="w-full bg-[#141417] h-2 rounded-full overflow-hidden my-1 border border-[rgba(242,242,242,0.1)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#e65e00] via-[#ff6b00] to-[#ff8533] transition-all duration-500 shadow-xs"
                        style={{ width: `${patternPct}%` }}
                      />
                    </div>

                    {/* Ejercicios individuales bajo este patrón */}
                    <div className="pt-0.5 flex flex-wrap gap-1 text-[11px]">
                      {pat.exercises.map((ex) => (
                        <span
                          key={ex.exerciseName}
                          className="bg-[#141417] text-[rgba(242,242,242,0.7)] px-2 py-0.5 rounded-lg border border-[rgba(242,242,242,0.1)] flex items-center gap-1 text-[10px]"
                        >
                          <strong className="text-[#f2f2f2] font-semibold">{ex.exerciseName}</strong>
                          <span className="text-[#ff6b00] font-bold">({ex.completedSets}s • {ex.maxWeightKg}kg)</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* QUADRANT B (RIGHT): RATIOS CON ANTAGONISTA & INTENSIDAD RPE/RIR */}
        {/* ======================================================== */}
        <div className="space-y-4">
          
          {/* PANEL 3: RATIOS CON SU ANTAGONISTA */}
          <div className="bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.1)] p-4 sm:p-5 shadow-sm space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(242,242,242,0.1)] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[rgba(255,107,0,0.15)] text-[#ff6b00] border border-[rgba(255,107,0,0.3)] flex items-center justify-center shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#f2f2f2]">
                    Ratio: {currentMuscleData?.muscleGroup} vs {antagonistMuscleName}
                  </h4>
                  <p className="text-[10px] text-[rgba(242,242,242,0.6)]">
                    Equilibrio de volumen agonista vs antagonista.
                  </p>
                </div>
              </div>

              <span className="text-[9px] bg-[rgba(34,197,94,0.1)] text-[#22c55e] font-bold px-2 py-0.5 rounded-md border border-[rgba(34,197,94,0.25)] flex items-center gap-1 self-start sm:self-auto shrink-0">
                <CheckCircle className="w-2.5 h-2.5" /> En Equilibrio
              </span>
            </div>

            {biomechanicalInfo ? (
              <div className="p-3 bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] block">Par Biomecánico:</span>
                    <span className="text-xs font-bold text-[#f2f2f2]">{biomechanicalInfo.balanceName}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="text-right">
                      <span className="text-[8px] uppercase font-bold text-[rgba(242,242,242,0.5)] block">Calculado</span>
                      <span className="text-xs font-black text-[#ff6b00]">{computedRatio} : 1</span>
                    </div>
                    <div className="text-right border-l border-[rgba(242,242,242,0.1)] pl-2.5">
                      <span className="text-[8px] uppercase font-bold text-[rgba(242,242,242,0.5)] block">Ideal</span>
                      <span className="text-xs font-black text-[#22c55e]">{biomechanicalInfo.idealRatio}</span>
                    </div>
                  </div>
                </div>

                {/* Visual Ratio Balance Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-[#f2f2f2]">{currentMuscleData?.muscleGroup} ({agonistSets}s)</span>
                    <span className="text-[#ff6b00]">{antagonistMuscleName} ({antagonistSets}s)</span>
                  </div>
                  <div className="w-full bg-[#141417] h-2.5 rounded-full overflow-hidden flex border border-[rgba(242,242,242,0.1)]">
                    <div 
                      className="bg-gradient-to-r from-[#26262b] to-[#404048] h-full transition-all duration-500" 
                      style={{ width: `${Math.round((agonistSets / (agonistSets + antagonistSets || 1)) * 100)}%` }} 
                      title={`${currentMuscleData?.muscleGroup}: ${agonistSets} series`}
                    />
                    <div 
                      className="bg-gradient-to-r from-[#e65e00] to-[#ff6b00] h-full transition-all duration-500" 
                      style={{ width: `${Math.round((antagonistSets / (agonistSets + antagonistSets || 1)) * 100)}%` }} 
                      title={`${antagonistMuscleName}: ${antagonistSets} series`}
                    />
                  </div>
                </div>

                {/* Clinical / Postural Recommendation */}
                <div className="pt-1.5 border-t border-[rgba(242,242,242,0.1)] flex items-start gap-1.5 text-[10px] text-[rgba(242,242,242,0.6)]">
                  <Info className="w-3.5 h-3.5 text-[#ff6b00] shrink-0 mt-0.5" />
                  <p className="leading-tight">
                    <strong className="text-[#f2f2f2]">Criterio Postural: </strong> 
                    {biomechanicalInfo.recommendation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[rgba(242,242,242,0.5)] italic py-3 text-center">
                Seleccioná un grupo muscular para ver el análisis de ratio.
              </div>
            )}
          </div>

          {/* PANEL 4: INTENSIDAD DE ESFUERZO (RPE & RIR POR EJERCICIO) */}
          <div className="bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.1)] p-4 sm:p-5 shadow-sm space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(242,242,242,0.1)] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[rgba(255,107,0,0.15)] text-[#ff6b00] border border-[rgba(255,107,0,0.3)] flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#f2f2f2]">
                    Intensidad: RPE & RIR de {currentMuscleData?.muscleGroup}
                  </h4>
                  <p className="text-[10px] text-[rgba(242,242,242,0.6)]">
                    Monitoreo del esfuerzo real por ejercicio.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-[#1c1c21] px-2.5 py-1 rounded-xl border border-[rgba(242,242,242,0.1)] self-start sm:self-auto shrink-0">
                <div>
                  <span className="text-[8px] uppercase font-bold text-[rgba(242,242,242,0.5)] block leading-none">RPE Prom.</span>
                  <span className="text-xs font-black text-[#ff6b00]">
                    @{currentMuscleData?.avgRpe > 0 ? currentMuscleData.avgRpe.toFixed(1) : '8.2'}
                  </span>
                </div>
                <div className="border-l border-[rgba(242,242,242,0.1)] pl-2.5">
                  <span className="text-[8px] uppercase font-bold text-[rgba(242,242,242,0.5)] block leading-none">RIR Prom.</span>
                  <span className="text-xs font-black text-[#22c55e]">
                    RIR {currentMuscleData?.avgRir > 0 ? currentMuscleData.avgRir.toFixed(1) : '1.8'}
                  </span>
                </div>
              </div>
            </div>

            {/* Exercise-by-Exercise Intensity Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentMuscleData?.allExercises.map((ex) => (
                <div
                  key={ex.exerciseName}
                  className="p-2.5 bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-[#f2f2f2] block text-xs truncate">{ex.exerciseName}</span>
                    <span className="text-[9px] text-[rgba(242,242,242,0.5)] block truncate">
                      {ex.completedSets}s • máx <strong className="text-[#f2f2f2]">{ex.maxWeightKg}kg</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] bg-[rgba(255,107,0,0.15)] text-[#ff6b00] font-bold px-1.5 py-0.5 rounded-lg border border-[rgba(255,107,0,0.3)]">
                      @{ex.avgRpe.toFixed(1)}
                    </span>
                    <span className="text-[10px] bg-[rgba(34,197,94,0.1)] text-[#22c55e] font-bold px-1.5 py-0.5 rounded-lg border border-[rgba(34,197,94,0.25)]">
                      RIR {ex.avgRir.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
