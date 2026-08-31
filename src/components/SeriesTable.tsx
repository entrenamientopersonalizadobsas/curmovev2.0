import React, { useState } from 'react';
import { ExerciseItem, SetDetail, ViewMode } from '../types';
import { 
  Plus, 
  Trash2, 
  Timer, 
  Check, 
  Sparkles, 
  Dumbbell, 
  Save,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SeriesTableProps {
  exercise?: ExerciseItem;
  viewMode: ViewMode;
  onUpdateExercise: (exercise: ExerciseItem) => void;
  onStartRestTimer: (seconds: number) => void;
  onOpenSaveSession?: () => void;
  onSaveExercise?: (exerciseId: string) => void;
}

export const SeriesTable: React.FC<SeriesTableProps> = ({
  exercise,
  viewMode,
  onUpdateExercise,
  onStartRestTimer,
  onOpenSaveSession,
  onSaveExercise
}) => {
  const [savedSuccessToast, setSavedSuccessToast] = useState<boolean>(false);

  if (!exercise) {
    return (
      <div id="column-series-table" className="bg-[#141417] rounded-xl border border-[rgba(242,242,242,0.1)] shadow-xs flex flex-col h-full items-center justify-center p-8 text-center text-[rgba(242,242,242,0.5)]">
        <div className="w-10 h-10 rounded bg-[#1c1c21] flex items-center justify-center text-[#ff6b00] mb-3 border border-[rgba(242,242,242,0.1)]">
          <Dumbbell className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-display font-bold uppercase tracking-wider text-[#f2f2f2]">Ningún ejercicio seleccionado</h4>
        <p className="text-[11px] text-[rgba(242,242,242,0.5)] mt-1 max-w-xs">
          Selecciona un ejercicio de la lista para registrar sus series, repeticiones, kilos, RIR y RPE.
        </p>
      </div>
    );
  }

  const sets = exercise.sets || [];
  const completedCount = sets.filter((s) => s.completed).length;
  const isAllCompleted = sets.length > 0 && completedCount === sets.length;

  // Handler: Save and complete this entire exercise
  const handleSaveThisExercise = () => {
    const updatedSets = sets.map((s) => ({
      ...s,
      completed: true,
      actualReps: s.actualReps !== undefined ? s.actualReps : (parseInt(s.targetReps, 10) || 10),
      actualWeightKg: s.actualWeightKg !== undefined ? s.actualWeightKg : (s.targetWeightKg || 0),
      actualRpe: s.actualRpe !== undefined ? s.actualRpe : (s.targetRpe || 8),
      actualRir: s.actualRir !== undefined ? s.actualRir : (s.targetRir ?? 2)
    }));

    const updatedExercise: ExerciseItem = {
      ...exercise,
      sets: updatedSets
    };

    onUpdateExercise(updatedExercise);
    if (onSaveExercise) {
      onSaveExercise(exercise.id);
    }

    // Confetti animation
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#ff6b00', '#ffffff', '#22c55e', '#1c1c21']
    });

    setSavedSuccessToast(true);
    setTimeout(() => {
      setSavedSuccessToast(false);
    }, 2800);
  };

  // Handler: Update specific set field
  const handleSetChange = (
    index: number,
    field: keyof SetDetail,
    value: unknown
  ) => {
    const updatedSets = [...sets];
    updatedSets[index] = {
      ...updatedSets[index],
      [field]: value
    };
    onUpdateExercise({
      ...exercise,
      sets: updatedSets
    });
  };

  // Handler: Toggle completion with Confetti & Rest Timer
  const handleToggleComplete = (index: number) => {
    const currentSet = sets[index];
    const willBeCompleted = !currentSet.completed;

    const updatedSets = [...sets];
    updatedSets[index] = {
      ...currentSet,
      completed: willBeCompleted,
      actualReps: willBeCompleted
        ? (currentSet.actualReps !== undefined ? currentSet.actualReps : parseInt(currentSet.targetReps, 10) || 10)
        : undefined,
      actualWeightKg: willBeCompleted
        ? (currentSet.actualWeightKg !== undefined ? currentSet.actualWeightKg : currentSet.targetWeightKg)
        : undefined
    };

    onUpdateExercise({
      ...exercise,
      sets: updatedSets
    });

    if (willBeCompleted) {
      // Trigger subtle celebratory confetti
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.75 },
        colors: ['#ff6b00', '#ffffff', '#22c55e', '#1c1c21']
      });

      // Auto start rest timer
      const restSec = currentSet.restSeconds || 90;
      onStartRestTimer(restSec);
    }
  };

  // Handler: Add new set
  const handleAddSet = () => {
    const lastSet = sets[sets.length - 1];
    const newSet: SetDetail = {
      id: `set-${Date.now()}-${sets.length + 1}`,
      setNumber: sets.length + 1,
      type: 'work',
      targetReps: lastSet?.targetReps || '8-10',
      targetWeightKg: lastSet?.targetWeightKg || 80,
      targetRir: lastSet?.targetRir ?? 2,
      targetRpe: lastSet?.targetRpe ?? 8,
      completed: false,
      restSeconds: lastSet?.restSeconds || 90
    };

    onUpdateExercise({
      ...exercise,
      sets: [...sets, newSet]
    });
  };

  // Handler: Remove set
  const handleRemoveSet = (index: number) => {
    const filtered = sets.filter((_, i) => i !== index).map((s, idx) => ({ ...s, setNumber: idx + 1 }));
    onUpdateExercise({
      ...exercise,
      sets: filtered
    });
  };

  return (
    <div id="column-series-table" className="bg-[#141417] rounded-xl border border-[rgba(242,242,242,0.1)] shadow-xs flex flex-col h-full overflow-hidden text-[#f2f2f2]">
      
      {/* Column Header */}
      <div className="px-4 py-3 border-b border-[rgba(242,242,242,0.1)] flex justify-between items-center bg-[#141417] shrink-0 gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-[#f2f2f2] text-xs uppercase tracking-wider truncate">
              {exercise.name}
            </h3>
            {isAllCompleted && (
              <span className="text-[9px] font-mono-code bg-[#1c1c21] text-[#ff6b00] font-bold px-2 py-0.5 rounded border border-[#ff6b00] flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3" /> GUARDADO
              </span>
            )}
          </div>
          <p className="text-[10px] text-[rgba(242,242,242,0.5)] font-mono-code uppercase tracking-wider mt-0.5 truncate">
            {exercise.muscleGroup} • {exercise.movementPattern} • {exercise.equipment}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Action: Guardar este Ejercicio */}
          <button
            id="btn-save-current-exercise"
            onClick={handleSaveThisExercise}
            className={`px-3 py-1 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
              isAllCompleted
                ? 'bg-[#1c1c21] hover:bg-[#26262b] text-[#ff6b00] border border-[#ff6b00]'
                : 'bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff]'
            }`}
            title="Guardar y registrar todas las series de este ejercicio"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isAllCompleted ? 'ACTUALIZAR' : 'GUARDAR EJERCICIO'}</span>
          </button>

          {viewMode === 'trainer' && (
            <button
              id="btn-add-set-row"
              onClick={handleAddSet}
              className="px-2.5 py-1 bg-[#1c1c21] hover:bg-[#26262b] text-[#f2f2f2] border border-[rgba(242,242,242,0.1)] font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#ff6b00]" />
              <span>AÑADIR SERIE</span>
            </button>
          )}
        </div>
      </div>

      {/* Saved Toast Notification */}
      {savedSuccessToast && (
        <div className="bg-[#1c1c21] border-b border-[#ff6b00] px-4 py-2 flex items-center justify-between text-xs text-[#ff6b00] animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2 font-bold font-mono-code">
            <CheckCircle2 className="w-4 h-4 text-[#ff6b00]" />
            <span>¡Ejercicio guardado correctamente en tu sesión!</span>
          </div>
          <span className="text-[10px] text-[#f2f2f2] font-medium">Series completadas ✓</span>
        </div>
      )}

      {/* Series Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          {/* Table Header */}
          <thead className="sticky top-0 bg-[#141417] border-b border-[rgba(242,242,242,0.1)] text-[rgba(242,242,242,0.5)] uppercase font-mono-code font-bold text-[9px] tracking-wider z-10">
            <tr>
              <th className="p-2.5 text-center w-10">#</th>
              <th className="p-2.5 w-20">Tipo</th>
              <th className="p-2.5 text-center w-20">Repes</th>
              <th className="p-2.5 text-center w-20">Kilos</th>
              <th className="p-2.5 text-center w-16">RIR</th>
              <th className="p-2.5 text-center w-16">RPE</th>
              <th className="p-2.5 text-center w-16">Pausa</th>
              <th className="p-2.5 text-center w-16">Hecho</th>
              {viewMode === 'trainer' && <th className="p-2.5 w-8"></th>}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[rgba(242,242,242,0.1)] text-xs font-mono-code">
            {sets.map((set, index) => {
              const isCompleted = set.completed;

              return (
                <tr
                  key={set.id || index}
                  className={`transition-colors ${
                    isCompleted
                      ? 'bg-[#1c1c21] text-[#ff6b00]'
                      : 'hover:bg-[#1c1c21]/50 text-[#f2f2f2]'
                  }`}
                >
                  {/* Set Number */}
                  <td className="p-2 text-center font-bold">
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold ${
                      isCompleted ? 'bg-[#141417] text-[#ff6b00] border border-[#ff6b00]' : 'bg-[#1c1c21] text-[rgba(242,242,242,0.6)] border border-[rgba(242,242,242,0.1)]'
                    }`}>
                      {index + 1}
                    </span>
                  </td>

                  {/* Set Type (Warmup, Prep, Work, Dropset) */}
                  <td className="p-2">
                    {viewMode === 'trainer' ? (
                      <select
                        value={set.type}
                        onChange={(e) => handleSetChange(index, 'type', e.target.value as SetDetail['type'])}
                        className="w-full bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded p-1 text-[11px] font-medium text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                      >
                        <option value="warmup" className="bg-[#141417] text-[#f2f2f2]">Calentam.</option>
                        <option value="feeder" className="bg-[#141417] text-[#f2f2f2]">Aproxim.</option>
                        <option value="work" className="bg-[#141417] text-[#f2f2f2]">Efectiva</option>
                        <option value="dropset" className="bg-[#141417] text-[#f2f2f2]">Dropset</option>
                        <option value="myoreps" className="bg-[#141417] text-[#f2f2f2]">Myo-reps</option>
                      </select>
                    ) : (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                        set.type === 'work' ? 'bg-[#1c1c21] text-[#ff6b00] border border-[#ff6b00]' : 'bg-[#1c1c21] text-[rgba(242,242,242,0.6)]'
                      }`}>
                        {set.type === 'work' ? 'Efectiva' : set.type}
                      </span>
                    )}
                  </td>

                  {/* Target Reps & Actual Reps */}
                  <td className="p-2 text-center">
                    {viewMode === 'trainer' ? (
                      <input
                        type="text"
                        value={set.targetReps}
                        onChange={(e) => handleSetChange(index, 'targetReps', e.target.value)}
                        className="w-16 p-1 text-center bg-[#1c1c21] rounded font-medium text-[#f2f2f2] border border-[rgba(242,242,242,0.1)] focus:border-[#ff6b00] focus:outline-none"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <input
                          type="number"
                          placeholder={String(set.targetReps)}
                          value={set.actualReps !== undefined ? set.actualReps : ''}
                          onChange={(e) => handleSetChange(index, 'actualReps', Number(e.target.value))}
                          className="w-14 p-1 text-center bg-[#1c1c21] rounded font-bold text-[#f2f2f2] border border-[rgba(242,242,242,0.1)] focus:border-[#ff6b00] focus:outline-none"
                        />
                        <span className="text-[9px] text-[rgba(242,242,242,0.4)] font-medium mt-0.5">
                          Obj: {set.targetReps}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Weight / Kilos */}
                  <td className="p-2 text-center">
                    {viewMode === 'trainer' ? (
                      <div className="inline-flex items-center justify-center gap-1">
                        <input
                          type="number"
                          value={set.targetWeightKg || ''}
                          onChange={(e) => handleSetChange(index, 'targetWeightKg', Number(e.target.value))}
                          className="w-14 p-1 text-center bg-[#1c1c21] rounded font-bold text-[#ff6b00] border border-[rgba(242,242,242,0.1)] focus:border-[#ff6b00] focus:outline-none"
                        />
                        <span className="text-[10px] text-[rgba(242,242,242,0.4)]">kg</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="inline-flex items-center gap-0.5">
                          <input
                            type="number"
                            placeholder={String(set.targetWeightKg || 0)}
                            value={set.actualWeightKg !== undefined ? set.actualWeightKg : ''}
                            onChange={(e) => handleSetChange(index, 'actualWeightKg', Number(e.target.value))}
                            className="w-14 p-1 text-center bg-[#1c1c21] rounded font-bold text-[#ff6b00] border border-[rgba(242,242,242,0.1)] focus:border-[#ff6b00] focus:outline-none"
                          />
                          <span className="text-[9px] text-[rgba(242,242,242,0.4)]">kg</span>
                        </div>
                        <span className="text-[9px] text-[rgba(242,242,242,0.4)] font-medium mt-0.5">
                          Obj: {set.targetWeightKg}kg
                        </span>
                      </div>
                    )}
                  </td>

                  {/* RIR */}
                  <td className="p-2 text-center">
                    {viewMode === 'trainer' ? (
                      <select
                        value={set.targetRir ?? 2}
                        onChange={(e) => handleSetChange(index, 'targetRir', Number(e.target.value))}
                        className="bg-[#1c1c21] rounded p-1 text-xs font-bold text-[#f2f2f2] border border-[rgba(242,242,242,0.1)] focus:outline-none focus:border-[#ff6b00]"
                      >
                        {[0, 1, 2, 3, 4, 5].map((r) => (
                          <option key={r} value={r} className="bg-[#141417] text-[#f2f2f2]">
                            RIR {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select
                        value={set.actualRir !== undefined ? set.actualRir : (set.targetRir ?? 2)}
                        onChange={(e) => handleSetChange(index, 'actualRir', Number(e.target.value))}
                        className="bg-[#1c1c21] rounded p-1 text-xs font-bold text-[#f2f2f2] border border-[rgba(242,242,242,0.1)] focus:outline-none focus:border-[#ff6b00]"
                      >
                        {[0, 1, 2, 3, 4, 5].map((r) => (
                          <option key={r} value={r} className="bg-[#141417] text-[#f2f2f2]">
                            RIR {r}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>

                  {/* RPE */}
                  <td className="p-2 text-center">
                    {viewMode === 'trainer' ? (
                      <select
                        value={set.targetRpe ?? 8}
                        onChange={(e) => handleSetChange(index, 'targetRpe', Number(e.target.value))}
                        className="bg-[#1c1c21] rounded p-1 text-xs font-bold text-[#ff6b00] border border-[rgba(242,242,242,0.1)] focus:outline-none focus:border-[#ff6b00]"
                      >
                        {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((r) => (
                          <option key={r} value={r} className="bg-[#141417] text-[#f2f2f2]">
                            @{r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select
                        value={set.actualRpe !== undefined ? set.actualRpe : (set.targetRpe ?? 8)}
                        onChange={(e) => handleSetChange(index, 'actualRpe', Number(e.target.value))}
                        className="bg-[#1c1c21] rounded p-1 text-xs font-bold text-[#ff6b00] border border-[rgba(242,242,242,0.1)] focus:outline-none focus:border-[#ff6b00]"
                      >
                        {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((r) => (
                          <option key={r} value={r} className="bg-[#141417] text-[#f2f2f2]">
                            @{r}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>

                  {/* Rest Seconds Button */}
                  <td className="p-2 text-center">
                    <button
                      onClick={() => onStartRestTimer(set.restSeconds || 90)}
                      className="p-1 rounded bg-[#1c1c21] hover:bg-[#26262b] text-[#ff6b00] transition-colors inline-flex items-center gap-0.5 text-[10px] font-bold border border-[rgba(242,242,242,0.1)] cursor-pointer"
                      title="Iniciar descanso"
                    >
                      <Timer className="w-3 h-3 text-[#ff6b00]" />
                      <span>{set.restSeconds || 90}s</span>
                    </button>
                  </td>

                  {/* Completed Checkbox */}
                  <td className="p-2 text-center">
                    <button
                      id={`chk-set-${index}`}
                      onClick={() => handleToggleComplete(index)}
                      className={`w-6 h-6 rounded flex items-center justify-center transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-[#ff6b00] text-[#ffffff]'
                          : 'bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] hover:border-[#ff6b00] text-transparent'
                      }`}
                      title={isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
                    >
                      <Check className={`w-3.5 h-3.5 stroke-[3] ${isCompleted ? 'text-[#ffffff]' : 'text-transparent'}`} />
                    </button>
                  </td>

                  {/* Trainer Delete Set */}
                  {viewMode === 'trainer' && (
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleRemoveSet(index)}
                        className="text-[rgba(242,242,242,0.4)] hover:text-[#ff5555] p-1 transition-colors cursor-pointer"
                        title="Eliminar serie"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Series Footer Summary & Quick Save Action */}
      <div className="px-4 py-2.5 bg-[#141417] border-t border-[rgba(242,242,242,0.1)] flex items-center justify-between shrink-0 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[rgba(242,242,242,0.5)] font-mono-code">
            Progreso:
          </span>
          <span className="text-xs font-mono-code font-bold text-[#ff6b00]">
            {sets.filter((s) => s.completed).length} / {sets.length} series
          </span>
        </div>

        {onOpenSaveSession && (
          <button
            onClick={onOpenSaveSession}
            className="text-[11px] font-mono-code font-bold text-[#f2f2f2] hover:text-[#ff6b00] flex items-center gap-1 cursor-pointer transition-colors bg-[#1c1c21] px-2.5 py-1 rounded border border-[rgba(242,242,242,0.1)] hover:border-[#ff6b00]"
          >
            <Sparkles className="w-3 h-3 text-[#ff6b00]" />
            <span>GUARDAR SESIÓN</span>
          </button>
        )}
      </div>

    </div>
  );
};
