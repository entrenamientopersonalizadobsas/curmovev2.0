import React, { useState } from 'react';
import { DailyWorkout, DailyReadiness } from '../types';
import { 
  CheckCircle, 
  X, 
  Zap, 
  Flame, 
  Clock, 
  Sparkles, 
  MessageSquare, 
  TrendingUp,
  Dumbbell,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SaveSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout?: DailyWorkout | null;
  readiness?: DailyReadiness;
  currentReadiness?: DailyReadiness;
  onConfirmSave: (data: {
    workout: DailyWorkout;
    energyLevel: number;
    sessionRpe: number;
    sessionDurationMin: number;
    feedback: string;
    autoCompleteAllSets: boolean;
  }) => void;
}

export const SaveSessionModal: React.FC<SaveSessionModalProps> = ({
  isOpen,
  onClose,
  workout,
  readiness,
  currentReadiness,
  onConfirmSave
}) => {
  const effectiveReadiness = readiness || currentReadiness;
  const [energyLevel, setEnergyLevel] = useState<number>(
    workout?.sessionEnergyLevel || effectiveReadiness?.energyLevel || 4
  );
  const [sessionRpe, setSessionRpe] = useState<number>(workout?.sessionRpe || 8);
  const [durationMin, setDurationMin] = useState<number>(workout?.sessionDurationMin || 60);
  const [feedback, setFeedback] = useState<string>(workout?.studentFeedback || '');
  const [autoCompleteAllSets, setAutoCompleteAllSets] = useState<boolean>(true);

  React.useEffect(() => {
    if (workout) {
      setEnergyLevel(workout.sessionEnergyLevel || effectiveReadiness?.energyLevel || 4);
      setSessionRpe(workout.sessionRpe || 8);
      setDurationMin(workout.sessionDurationMin || 60);
      setFeedback(workout.studentFeedback || '');
    }
  }, [workout, effectiveReadiness, isOpen]);

  if (!isOpen || !workout) return null;

  // Calculate stats for preview
  const exercises = workout.exercises || [];
  const totalPlannedSets = exercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0);
  const currentlyCompletedSets = exercises.reduce(
    (acc, ex) => acc + (ex.sets?.filter((s) => s.completed).length || 0),
    0
  );

  let calculatedTonnage = 0;
  exercises.forEach((ex) => {
    ex.sets?.forEach((s) => {
      if (s.completed || autoCompleteAllSets) {
        const reps = s.actualReps !== undefined ? s.actualReps : parseInt(s.targetReps, 10) || 10;
        const weight = s.actualWeightKg !== undefined ? s.actualWeightKg : s.targetWeightKg || 0;
        calculatedTonnage += reps * weight;
      }
    });
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger celebratory confetti
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#f59e0b', '#10b981', '#3b82f6']
    });

    onConfirmSave({
      workout,
      energyLevel,
      sessionRpe,
      sessionDurationMin: durationMin,
      feedback,
      autoCompleteAllSets
    });

    onClose();
  };

  const getEnergyText = (lvl: number) => {
    switch (lvl) {
      case 5: return '100% Máxima Energía & Foco';
      case 4: return '80% Buena Energía';
      case 3: return '60% Energía Moderada';
      case 2: return '40% Fatiga / Baja Energía';
      case 1: return '20% Muy Agotado';
      default: return 'Energía Normal';
    }
  };

  const getRpeDescription = (rpe: number) => {
    if (rpe >= 9.5) return 'Esfuerzo Máximo / Al Fallo (RIR 0)';
    if (rpe >= 8.5) return 'Muy Intenso / RIR 1';
    if (rpe >= 7.5) return 'Intensidad Óptima de Hipertrofia / RIR 2';
    if (rpe >= 6.5) return 'Moderado / RIR 3-4';
    return 'Carga Ligera / Recuperación';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden my-4 text-[#f2f2f2]">
        
        {/* Header */}
        <div className="p-4 bg-[#141417] border-b border-[rgba(242,242,242,0.1)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[rgba(255,107,0,0.15)] flex items-center justify-center text-[#ff6b00] font-bold border border-[rgba(255,107,0,0.3)]">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#f2f2f2] flex items-center gap-2 uppercase tracking-wider">
                <span>Guardar Sesión de Entrenamiento</span>
              </h3>
              <p className="text-[11px] text-[rgba(242,242,242,0.6)]">
                {workout.title} • {workout.date} ({workout.dayName})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-xl bg-[#1c1c21] hover:bg-[#26262b] text-[rgba(242,242,242,0.6)] hover:text-[#f2f2f2] cursor-pointer border border-[rgba(242,242,242,0.1)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs overflow-y-auto max-h-[80vh] custom-scrollbar">
          
          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-3 gap-2.5 bg-[#1c1c21] p-3 rounded-xl border border-[rgba(242,242,242,0.1)] text-center">
            <div className="p-2 bg-[#141417] rounded-lg border border-[rgba(242,242,242,0.1)]">
              <span className="text-[10px] uppercase font-bold text-[rgba(242,242,242,0.5)] block">Ejercicios</span>
              <span className="text-sm font-bold text-[#f2f2f2]">{exercises.length}</span>
            </div>

            <div className="p-2 bg-[#141417] rounded-lg border border-[rgba(242,242,242,0.1)]">
              <span className="text-[10px] uppercase font-bold text-[rgba(242,242,242,0.5)] block">Series Totales</span>
              <span className="text-sm font-bold text-[#f2f2f2]">
                {autoCompleteAllSets ? totalPlannedSets : currentlyCompletedSets} / {totalPlannedSets}
              </span>
            </div>

            <div className="p-2 bg-[#141417] rounded-lg border border-[rgba(242,242,242,0.1)]">
              <span className="text-[10px] uppercase font-bold text-[rgba(242,242,242,0.5)] block">Tonelaje Est.</span>
              <span className="text-sm font-bold text-[#ff6b00]">
                {(calculatedTonnage / 1000).toFixed(1)}k <span className="text-[10px] text-[rgba(242,242,242,0.5)] font-normal">kg</span>
              </span>
            </div>
          </div>

          {/* Auto-Complete Remaining Sets Checkbox */}
          <div className="bg-[#1c1c21] p-3 rounded-xl border border-[rgba(242,242,242,0.1)] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#f2f2f2] block">
                Completar todas las series planificadas
              </span>
              <p className="text-[11px] text-[rgba(242,242,242,0.6)]">
                Guarda los kilos y repeticiones objetivo para las series pendientes.
              </p>
            </div>
            <input
              type="checkbox"
              id="checkbox-autocomplete-sets"
              checked={autoCompleteAllSets}
              onChange={(e) => setAutoCompleteAllSets(e.target.checked)}
              className="w-4 h-4 accent-[#ff6b00] rounded cursor-pointer"
            />
          </div>

          {/* 1. Estado de Energía (Readiness sync) */}
          <div className="bg-[#1c1c21] p-3.5 rounded-xl border border-[rgba(242,242,242,0.1)] space-y-2.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#ff6b00] uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#ff6b00] fill-[#ff6b00]" />
                <span>Estado de Energía en la Sesión</span>
              </label>
              <span className="text-xs font-bold bg-[rgba(255,107,0,0.15)] text-[#ff6b00] px-2 py-0.5 rounded-md border border-[rgba(255,107,0,0.3)]">
                ⚡ {energyLevel} / 5
              </span>
            </div>

            {/* Energy Slider */}
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="w-full accent-[#ff6b00] cursor-pointer h-1.5 bg-[#0c0c0e] rounded-lg"
            />

            {/* Energy Level buttons */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setEnergyLevel(lvl)}
                  className={`py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                    energyLevel === lvl
                      ? 'bg-[#ff6b00] text-[#ffffff] border-[#ff6b00]'
                      : 'bg-[#141417] text-[rgba(242,242,242,0.7)] border-[rgba(242,242,242,0.1)] hover:bg-[#26262b]'
                  }`}
                >
                  ⚡ {lvl}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-[#ff6b00] text-center font-medium">
              {getEnergyText(energyLevel)} • Se contabilizará en el Dashboard
            </p>
          </div>

          {/* 2. RPE General de la Sesión & Duración */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* RPE Selector */}
            <div className="bg-[#1c1c21] p-3 rounded-xl border border-[rgba(242,242,242,0.1)] space-y-1.5">
              <label className="block text-[10px] uppercase font-bold text-[rgba(242,242,242,0.6)]">
                Esfuerzo Percibido (RPE)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="10"
                  step="0.5"
                  value={sessionRpe}
                  onChange={(e) => setSessionRpe(Number(e.target.value))}
                  className="w-16 p-1.5 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-xl text-center text-xs font-bold text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
                />
                <span className="text-[11px] text-[rgba(242,242,242,0.6)] leading-tight">
                  @{sessionRpe} ({getRpeDescription(sessionRpe)})
                </span>
              </div>
            </div>

            {/* Duración */}
            <div className="bg-[#1c1c21] p-3 rounded-xl border border-[rgba(242,242,242,0.1)] space-y-1.5">
              <label className="block text-[10px] uppercase font-bold text-[rgba(242,242,242,0.6)]">
                Duración
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="15"
                    max="180"
                    step="5"
                    value={durationMin}
                    onChange={(e) => setDurationMin(Number(e.target.value))}
                    className="w-full p-1.5 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-xl text-left pl-7 text-xs font-bold text-[#f2f2f2] focus:border-[#ff6b00] focus:outline-none"
                  />
                  <Clock className="w-3.5 h-3.5 text-[rgba(242,242,242,0.5)] absolute left-2 top-2 pointer-events-none" />
                </div>
                <span className="text-xs text-[rgba(242,242,242,0.5)]">minutos</span>
              </div>
            </div>

          </div>

          {/* 3. Feedback / Comentarios para el Coach */}
          <div className="bg-[#1c1c21] p-3 rounded-xl border border-[rgba(242,242,242,0.1)] space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-[rgba(242,242,242,0.6)] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Feedback o Sensaciones (Opcional)</span>
            </label>
            <textarea
              rows={2}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Ej: Excelente sesión, pude aumentar 2.5kg en banca. Sin dolor."
              className="w-full p-2.5 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-xl text-xs text-[#f2f2f2] placeholder:text-[rgba(242,242,242,0.4)] focus:border-[#ff6b00] focus:outline-none resize-none"
            />
          </div>

          {/* Notice: Auto-completes in Dashboard */}
          <div className="p-2.5 bg-[rgba(255,107,0,0.1)] border border-[rgba(255,107,0,0.25)] rounded-xl flex items-center gap-2 text-[#f2f2f2]">
            <Sparkles className="w-4 h-4 text-[#ff6b00] shrink-0" />
            <p className="text-[11px] leading-tight">
              Al guardar, se actualizarán automáticamente las <strong className="text-[#ff6b00]">series efectivas, tonelaje y energía</strong> en el Dashboard.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-2 border-t border-[rgba(242,242,242,0.1)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-[#141417] hover:bg-[#26262b] text-[rgba(242,242,242,0.7)] font-bold text-xs rounded-xl transition-colors cursor-pointer border border-[rgba(242,242,242,0.1)]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              id="btn-confirm-save-session-submit"
              className="flex-2 py-2 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>CONFIRMAR Y GUARDAR</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
