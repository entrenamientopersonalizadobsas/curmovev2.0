import React, { useState } from 'react';
import { MuscleGroup, MovementPattern } from '../../types';
import { MuscleGroupHierarchyData, PatternMetricDetail, ExerciseMetricDetail } from './types';
import { 
  Dumbbell, 
  Layers, 
  ChevronDown, 
  ChevronRight, 
  Activity, 
  Flame, 
  TrendingUp, 
  Sparkles, 
  CheckCircle, 
  Search, 
  Filter, 
  Maximize2, 
  Minimize2,
  Info,
  Calendar
} from 'lucide-react';

interface MusclePatternHierarchyViewProps {
  hierarchyData: MuscleGroupHierarchyData[];
  selectedMuscleFilter: string;
  onSelectMuscleFilter: (muscle: string) => void;
  selectedPeriodTitle: string;
  periodMultiplier?: number;
}

export const MusclePatternHierarchyView: React.FC<MusclePatternHierarchyViewProps> = ({
  hierarchyData,
  selectedMuscleFilter,
  onSelectMuscleFilter,
  selectedPeriodTitle,
  periodMultiplier = 1
}) => {
  // State for expanded muscle groups (set of muscle names)
  const [expandedMuscles, setExpandedMuscles] = useState<Record<string, boolean>>({
    'Pecho': true,
    'Espalda': true,
    'Cuádriceps': true,
    'Isquios / Glúteo': true,
    'Hombros': true,
    'Brazos': true,
    'Core / Abdomen': true,
    'Pantorrillas': true
  });

  // State for expanded patterns (key: "Muscle_Pattern")
  const [expandedPatterns, setExpandedPatterns] = useState<Record<string, boolean>>({});

  // Search query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Pattern Filter
  const [patternFilter, setPatternFilter] = useState<string>('all');

  const toggleMuscle = (muscle: string) => {
    setExpandedMuscles(prev => ({
      ...prev,
      [muscle]: !prev[muscle]
    }));
  };

  const togglePattern = (muscle: string, pattern: string) => {
    const key = `${muscle}_${pattern}`;
    setExpandedPatterns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const expandAll = () => {
    const allM: Record<string, boolean> = {};
    const allP: Record<string, boolean> = {};
    hierarchyData.forEach(m => {
      allM[m.muscleGroup] = true;
      m.patterns.forEach(p => {
        allP[`${m.muscleGroup}_${p.patternName}`] = true;
      });
    });
    setExpandedMuscles(allM);
    setExpandedPatterns(allP);
  };

  const collapseAll = () => {
    setExpandedMuscles({});
    setExpandedPatterns({});
  };

  // Filtered Hierarchy based on search and selected filters
  const filteredData = hierarchyData
    .filter(m => selectedMuscleFilter === 'all' || m.muscleGroup === selectedMuscleFilter)
    .map(m => {
      // Filter patterns
      const matchingPatterns = m.patterns
        .filter(p => patternFilter === 'all' || p.patternName === patternFilter)
        .map(p => {
          // Filter exercises
          const matchingExercises = p.exercises.filter(ex => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
              ex.exerciseName.toLowerCase().includes(q) ||
              p.patternName.toLowerCase().includes(q) ||
              m.muscleGroup.toLowerCase().includes(q)
            );
          });
          return {
            ...p,
            exercises: matchingExercises
          };
        })
        .filter(p => p.exercises.length > 0 || !searchQuery.trim());

      return {
        ...m,
        patterns: matchingPatterns
      };
    })
    .filter(m => m.patterns.length > 0 || !searchQuery.trim());

  return (
    <div className="bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.1)] p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[rgba(242,242,242,0.1)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[rgba(255,107,0,0.15)] text-[#ff6b00] border border-[rgba(255,107,0,0.3)]">
              <Layers className="w-4 h-4" />
            </span>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#f2f2f2]">
              DESGLOSE JERÁRQUICO: GRUPO MUSCULAR ➔ PATRÓN DE MOVIMIENTO ➔ EJERCICIOS
            </h3>
          </div>
          <p className="text-[11px] text-[rgba(242,242,242,0.6)] mt-0.5">
            Indexación individual por patrón motor y contabilización exacta de ejercicios ejecutados ({selectedPeriodTitle}).
          </p>
        </div>

        {/* Global Action & Filter Tools */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[rgba(242,242,242,0.4)] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar ejercicio o patrón..."
              className="pl-8 pr-3 py-1.5 bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl text-xs text-[#f2f2f2] placeholder-[rgba(242,242,242,0.4)] focus:outline-none focus:border-[#ff6b00] w-48 sm:w-56"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Muscle Group Filter Dropdown */}
          <select
            value={selectedMuscleFilter}
            onChange={(e) => onSelectMuscleFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl text-xs font-bold text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00] cursor-pointer"
          >
            <option value="all" className="bg-[#141417] text-[#f2f2f2]">Todos los Grupos</option>
            {hierarchyData.map((m) => (
              <option key={m.muscleGroup} value={m.muscleGroup} className="bg-[#141417] text-[#f2f2f2]">
                {m.muscleGroup}
              </option>
            ))}
          </select>

          {/* Expand / Collapse All Buttons */}
          <div className="flex items-center gap-1 bg-[#1c1c21] p-1 rounded-xl border border-[rgba(242,242,242,0.1)]">
            <button
              onClick={expandAll}
              title="Expandir todos los grupos y patrones"
              className="p-1 rounded-lg text-[rgba(242,242,242,0.7)] hover:text-[#f2f2f2] hover:bg-[#26262b] text-[10px] font-bold flex items-center gap-1 px-1.5"
            >
              <Maximize2 className="w-3 h-3" />
              <span className="hidden sm:inline">Expandir</span>
            </button>
            <span className="text-[rgba(242,242,242,0.2)]">|</span>
            <button
              onClick={collapseAll}
              title="Contraer todos los grupos y patrones"
              className="p-1 rounded-lg text-[rgba(242,242,242,0.7)] hover:text-[#f2f2f2] hover:bg-[#26262b] text-[10px] font-bold flex items-center gap-1 px-1.5"
            >
              <Minimize2 className="w-3 h-3" />
              <span className="hidden sm:inline">Contraer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Hierarchical Tree */}
      {filteredData.length === 0 ? (
        <div className="text-center py-10 bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] text-[rgba(242,242,242,0.5)] text-xs">
          No se encontraron ejercicios o patrones con los filtros seleccionados.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredData.map((group) => {
            const isMuscleExpanded = expandedMuscles[group.muscleGroup] ?? true;
            const adherence = group.targetSets > 0 ? Math.round((group.completedSets / group.targetSets) * 100) : 100;
            const mavPct = Math.min(100, Math.round((group.totalSets / group.mavTargetSets) * 100));

            return (
              <div
                key={group.muscleGroup}
                className="bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] overflow-hidden transition-all shadow-xs"
              >
                {/* 1. LEVEL 1: GRUPO MUSCULAR HEADER */}
                <div
                  onClick={() => toggleMuscle(group.muscleGroup)}
                  className={`p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none transition-colors ${
                    isMuscleExpanded ? 'bg-[#26262b] border-b border-[rgba(242,242,242,0.1)]' : 'bg-[#1c1c21] hover:bg-[#26262b]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="p-1 rounded-lg bg-[#141417] text-[#f2f2f2] border border-[rgba(242,242,242,0.1)]"
                    >
                      {isMuscleExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-[#ff6b00]" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-[rgba(242,242,242,0.5)]" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#f2f2f2] tracking-tight">
                          {group.muscleGroup}
                        </span>
                        <span className="text-[10px] bg-[rgba(255,107,0,0.15)] text-[#ff6b00] font-bold px-2 py-0.5 rounded-full border border-[rgba(255,107,0,0.3)]">
                          {group.patterns.length} Patrones Motor
                        </span>
                        <span className="text-[10px] bg-[#141417] text-[rgba(242,242,242,0.7)] font-medium px-2 py-0.5 rounded-full border border-[rgba(242,242,242,0.1)]">
                          {group.allExercises.length} Ejercicios
                        </span>
                      </div>
                      <p className="text-[10px] text-[rgba(242,242,242,0.5)] mt-0.5">
                        Rango MAV semanal: <strong className="text-[#f2f2f2]">{group.totalSets} series</strong> ({mavPct}%) • Tonelaje: <strong className="text-[#ff6b00]">{(group.totalTonnageKg / 1000).toFixed(1)}k kg</strong>
                      </p>
                    </div>
                  </div>

                  {/* Summary Badges on Header */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="px-2.5 py-1 bg-[#141417] rounded-lg border border-[rgba(242,242,242,0.1)] text-right">
                      <span className="text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] block">Series</span>
                      <span className="text-xs font-black text-[#f2f2f2]">
                        {group.completedSets} <span className="text-[10px] font-normal text-[rgba(242,242,242,0.5)]">/ {group.targetSets}</span>
                      </span>
                    </div>

                    <div className="px-2.5 py-1 bg-[#141417] rounded-lg border border-[rgba(242,242,242,0.1)] text-right">
                      <span className="text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] block">Intensidad</span>
                      <span className="text-xs font-black text-[#ff6b00]">
                        RPE @{group.avgRpe > 0 ? group.avgRpe.toFixed(1) : '8.0'}
                      </span>
                    </div>

                    <div className="px-2.5 py-1 bg-[#141417] rounded-lg border border-[rgba(242,242,242,0.1)] text-right">
                      <span className="text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] block">RIR</span>
                      <span className="text-xs font-black text-[#22c55e]">
                        RIR {group.avgRir > 0 ? group.avgRir.toFixed(1) : '1.5'}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                      adherence >= 90
                        ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e] border-[rgba(34,197,94,0.25)]'
                        : 'bg-[rgba(255,107,0,0.1)] text-[#ff6b00] border-[rgba(255,107,0,0.25)]'
                    }`}>
                      {adherence}% Adherencia
                    </span>
                  </div>
                </div>

                {/* LEVEL 2: PATRONES DE MOVIMIENTO FOR THIS MUSCLE GROUP */}
                {isMuscleExpanded && (
                  <div className="p-3 sm:p-4 space-y-3 bg-[#141417]">
                    {group.patterns.length === 0 ? (
                      <div className="text-xs text-[rgba(242,242,242,0.5)] italic py-2">
                        No hay patrones activos registrados para este grupo muscular.
                      </div>
                    ) : (
                      group.patterns.map((pattern) => {
                        const patternKey = `${group.muscleGroup}_${pattern.patternName}`;
                        // Default to expanded so coach sees exercises directly
                        const isPatternExpanded = expandedPatterns[patternKey] ?? true;

                        return (
                          <div
                            key={pattern.patternName}
                            className="bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] overflow-hidden"
                          >
                            {/* Pattern Sub-header */}
                            <div
                              onClick={() => togglePattern(group.muscleGroup, pattern.patternName)}
                              className="p-2.5 sm:p-3 bg-[#26262b] flex flex-wrap items-center justify-between gap-2 cursor-pointer hover:bg-[#303036] transition-colors border-b border-[rgba(242,242,242,0.1)]"
                            >
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className="p-0.5 rounded text-[rgba(242,242,242,0.5)]"
                                >
                                  {isPatternExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-[#ff6b00]" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-[rgba(242,242,242,0.5)]" />
                                  )}
                                </button>
                                <span className="w-2 h-2 rounded-full bg-[#ff6b00]" />
                                <span className="text-xs font-bold text-[#f2f2f2]">
                                  Patrón: <strong className="text-[#ff6b00]">{pattern.patternName}</strong>
                                </span>
                                <span className="text-[10px] bg-[#141417] text-[rgba(242,242,242,0.6)] px-2 py-0.5 rounded font-medium border border-[rgba(242,242,242,0.1)]">
                                  {pattern.exercises.length} {pattern.exercises.length === 1 ? 'Ejercicio' : 'Ejercicios'}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-xs">
                                <span className="text-[11px] text-[rgba(242,242,242,0.7)]">
                                  <strong className="text-[#f2f2f2]">{pattern.totalSets}</strong> series ({pattern.completedSets} comp.)
                                </span>
                                <span className="text-[11px] text-[rgba(242,242,242,0.5)]">
                                  Tonelaje: <strong className="text-[#ff6b00]">{(pattern.totalTonnageKg / 1000).toFixed(1)}k kg</strong>
                                </span>
                                <span className="text-[10px] bg-[#141417] text-[rgba(242,242,242,0.8)] font-bold px-1.5 py-0.5 rounded border border-[rgba(242,242,242,0.1)]">
                                  RPE @{pattern.avgRpe > 0 ? pattern.avgRpe.toFixed(1) : '8.0'}
                                </span>
                              </div>
                            </div>

                            {/* LEVEL 3: INDIVIDUAL EXERCISES PERFORMED BY THE PERSON */}
                            {isPatternExpanded && (
                              <div className="p-2 sm:p-3 space-y-2">
                                {pattern.exercises.length === 0 ? (
                                  <div className="text-[11px] text-[rgba(242,242,242,0.5)] italic py-1 px-2">
                                    No hay ejercicios específicos registrados en este patrón.
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 gap-2">
                                    {pattern.exercises.map((ex) => {
                                      return (
                                        <div
                                          key={ex.exerciseName}
                                          className="bg-[#141417] rounded-xl border border-[rgba(242,242,242,0.1)] p-3 hover:border-[rgba(255,107,0,0.3)] transition-all space-y-2"
                                        >
                                          {/* Exercise Name & Badges */}
                                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                              <div className="w-6 h-6 rounded-lg bg-[rgba(255,107,0,0.15)] text-[#ff6b00] border border-[rgba(255,107,0,0.3)] flex items-center justify-center shrink-0">
                                                <Dumbbell className="w-3 h-3" />
                                              </div>
                                              <div>
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                  <span className="text-xs font-bold text-[#f2f2f2]">
                                                    {ex.exerciseName}
                                                  </span>
                                                  {ex.equipment && (
                                                    <span className="text-[9px] bg-[#1c1c21] text-[rgba(242,242,242,0.6)] px-1.5 py-0.2 rounded border border-[rgba(242,242,242,0.1)]">
                                                      {ex.equipment}
                                                    </span>
                                                  )}
                                                  <span className="text-[9px] bg-[rgba(255,107,0,0.1)] text-[#ff6b00] px-1.5 py-0.2 rounded font-bold border border-[rgba(255,107,0,0.25)]">
                                                    {group.muscleGroup} • {pattern.patternName}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Micro KPIs for this specific individual exercise */}
                                            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                                              <div className="text-right px-2 py-0.5 bg-[#1c1c21] rounded-md border border-[rgba(242,242,242,0.1)]">
                                                <span className="text-[8px] uppercase text-[rgba(242,242,242,0.5)] block">Carga Máx</span>
                                                <span className="text-xs font-black text-[#f2f2f2]">
                                                  {ex.maxWeightKg} <span className="text-[9px] font-normal text-[rgba(242,242,242,0.5)]">kg</span>
                                                </span>
                                              </div>

                                              <div className="text-right px-2 py-0.5 bg-[#1c1c21] rounded-md border border-[rgba(242,242,242,0.1)]">
                                                <span className="text-[8px] uppercase text-[rgba(242,242,242,0.5)] block">Series</span>
                                                <span className="text-xs font-black text-[#f2f2f2]">
                                                  {ex.completedSets} / {ex.totalSets}
                                                </span>
                                              </div>

                                              <div className="text-right px-2 py-0.5 bg-[#1c1c21] rounded-md border border-[rgba(242,242,242,0.1)]">
                                                <span className="text-[8px] uppercase text-[rgba(242,242,242,0.5)] block">Tonelaje</span>
                                                <span className="text-xs font-black text-[#ff6b00]">
                                                  {(ex.totalTonnageKg / 1000).toFixed(1)}k kg
                                                </span>
                                              </div>

                                              <div className="text-right px-2 py-0.5 bg-[#1c1c21] rounded-md border border-[rgba(242,242,242,0.1)]">
                                                <span className="text-[8px] uppercase text-[rgba(242,242,242,0.5)] block">RIR / RPE</span>
                                                <span className="text-xs font-bold text-[#22c55e]">
                                                  RIR {ex.avgRir.toFixed(1)} @{ex.avgRpe.toFixed(1)}
                                                </span>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Session Details / Dates where athlete performed this exercise */}
                                          {ex.sessionDates.length > 0 && (
                                            <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-[rgba(242,242,242,0.1)] text-[10px] text-[rgba(242,242,242,0.5)]">
                                              <span className="flex items-center gap-1 text-[#ff6b00] font-bold">
                                                <Calendar className="w-3 h-3" /> Sesiones:
                                              </span>
                                              {ex.sessionDates.slice(0, 4).map((d) => (
                                                <span
                                                  key={d}
                                                  className="bg-[#1c1c21] text-[#f2f2f2] px-1.5 py-0.2 rounded border border-[rgba(242,242,242,0.1)]"
                                                >
                                                  {d}
                                                </span>
                                              ))}
                                              {ex.sessionDates.length > 4 && (
                                                <span className="text-[9px] text-[rgba(242,242,242,0.5)]">
                                                  +{ex.sessionDates.length - 4} más
                                                </span>
                                              )}
                                              {ex.lastSessionFeedback && (
                                                <span className="text-[rgba(242,242,242,0.6)] italic truncate max-w-xs ml-auto">
                                                  "{ex.lastSessionFeedback}"
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
