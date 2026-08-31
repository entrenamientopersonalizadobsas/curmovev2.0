import React, { useState } from 'react';
import { DailyReadiness, ViewMode } from '../types';
import { 
  Zap, 
  Square, 
  ArrowDown, 
  Moon, 
  Smile, 
  Save, 
  CheckCircle 
} from 'lucide-react';

interface ReadinessWidgetProps {
  selectedDate: string;
  readiness?: DailyReadiness;
  viewMode: ViewMode;
  onSaveReadiness: (date: string, data: DailyReadiness) => void;
}

export const ReadinessWidget: React.FC<ReadinessWidgetProps> = ({
  selectedDate,
  readiness,
  viewMode,
  onSaveReadiness
}) => {
  const [energy, setEnergy] = useState<number>(readiness?.energyLevel ?? 4);
  const [fatigue, setFatigue] = useState<number>(readiness?.fatigueLevel ?? 2);
  const [soreness, setSoreness] = useState<number>(readiness?.muscleSoreness ?? 1);
  const [sleep, setSleep] = useState<number>(readiness?.sleepHours ?? 7.5);
  const [mood, setMood] = useState<DailyReadiness['mood']>(readiness?.mood ?? 'Excelente');
  const [notes, setNotes] = useState<string>(readiness?.notes ?? '');
  const [savedToast, setSavedToast] = useState<boolean>(false);

  React.useEffect(() => {
    setEnergy(readiness?.energyLevel ?? 4);
    setFatigue(readiness?.fatigueLevel ?? 2);
    setSoreness(readiness?.muscleSoreness ?? 1);
    setSleep(readiness?.sleepHours ?? 7.5);
    setMood(readiness?.mood ?? 'Excelente');
    setNotes(readiness?.notes ?? '');
  }, [selectedDate, readiness]);

  const handleSave = () => {
    onSaveReadiness(selectedDate, {
      date: selectedDate,
      energyLevel: energy,
      fatigueLevel: fatigue,
      muscleSoreness: soreness,
      sleepHours: sleep,
      mood,
      notes
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const getEnergyLabel = (val: number) => {
    if (val >= 5) return 'Energía Máxima (100%)';
    if (val === 4) return 'Buena Energía (80%)';
    if (val === 3) return 'Moderada (60%)';
    if (val === 2) return 'Baja (40%)';
    return 'Muy Agotado (20%)';
  };

  const getFatigueLabel = (val: number) => {
    if (val <= 1) return 'Fatiga Nula / Fresco';
    if (val === 2) return 'Fatiga Leve';
    if (val === 3) return 'Fatiga Moderada';
    if (val === 4) return 'Fatiga Alta';
    return 'Sobrecarga Severa';
  };

  const getSorenessLabel = (val: number) => {
    if (val <= 1) return 'Sin Dolor / Recuperado';
    if (val === 2) return 'Agujetas Leves';
    if (val === 3) return 'Molestia Moderada';
    if (val === 4) return 'Dolor Articular/Muscular';
    return 'Dolor Agudo (Atención)';
  };

  return (
    <div id="widget-readiness" className="bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col gap-3 text-[#f2f2f2]">
      
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-[rgba(242,242,242,0.1)] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-display font-bold uppercase tracking-wider text-[#f2f2f2]">
            ¿Cómo te sentís hoy?
          </span>
          <span className="text-xs text-[rgba(242,242,242,0.5)] font-mono-code">
            ({selectedDate})
          </span>
        </div>
        {readiness && (
          <span className="text-[10px] bg-[#1c1c21] text-[#ff6b00] font-mono-code font-bold px-2 py-0.5 rounded border border-[#ff6b00]">
            REGISTRADO
          </span>
        )}
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        
        {/* 1. Energy */}
        <div className="bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl p-3 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#141417] border border-[rgba(242,242,242,0.1)] flex items-center justify-center text-[#ff6b00]">
                <Zap className="w-3.5 h-3.5 fill-[#ff6b00]" />
              </div>
              <span className="text-xs font-bold text-[#f2f2f2] uppercase">Energía</span>
            </div>
            <span className="text-xs font-mono-code font-bold text-[#ff6b00] bg-[#141417] px-2 py-0.5 rounded border border-[rgba(242,242,242,0.1)]">{energy} / 5</span>
          </div>

          <div className="mt-2">
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={energy}
              disabled={viewMode === 'trainer' && !readiness}
              onChange={(e) => setEnergy(Number(e.target.value))}
              className="w-full accent-[#ff6b00] cursor-pointer h-1.5 bg-[#141417] rounded-lg"
            />
            <p className="text-[10px] text-[#ff6b00] mt-1 font-medium truncate">
              ⚡ {getEnergyLabel(energy)}
            </p>
          </div>
        </div>

        {/* 2. Fatigue */}
        <div className="bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl p-3 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#141417] border border-[rgba(242,242,242,0.1)] flex items-center justify-center text-[#f2f2f2]">
                <Square className="w-3.5 h-3.5 fill-[#f2f2f2] text-[#f2f2f2]" />
              </div>
              <span className="text-xs font-bold text-[#f2f2f2] uppercase">Fatiga</span>
            </div>
            <span className="text-xs font-mono-code font-bold text-[#f2f2f2] bg-[#141417] px-2 py-0.5 rounded border border-[rgba(242,242,242,0.1)]">{fatigue} / 5</span>
          </div>

          <div className="mt-2">
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={fatigue}
              disabled={viewMode === 'trainer' && !readiness}
              onChange={(e) => setFatigue(Number(e.target.value))}
              className="w-full accent-[#f2f2f2] cursor-pointer h-1.5 bg-[#141417] rounded-lg"
            />
            <p className="text-[10px] text-[rgba(242,242,242,0.7)] mt-1 font-medium truncate">
              {getFatigueLabel(fatigue)}
            </p>
          </div>
        </div>

        {/* 3. Pain / Soreness */}
        <div className="bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl p-3 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#141417] border border-[rgba(242,242,242,0.1)] flex items-center justify-center text-[rgba(242,242,242,0.7)]">
                <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold text-[#f2f2f2] uppercase">Molestia</span>
            </div>
            <span className="text-xs font-mono-code font-bold text-[rgba(242,242,242,0.7)] bg-[#141417] px-2 py-0.5 rounded border border-[rgba(242,242,242,0.1)]">{soreness} / 5</span>
          </div>

          <div className="mt-2">
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={soreness}
              disabled={viewMode === 'trainer' && !readiness}
              onChange={(e) => setSoreness(Number(e.target.value))}
              className="w-full accent-[#8a8a93] cursor-pointer h-1.5 bg-[#141417] rounded-lg"
            />
            <p className="text-[10px] text-[rgba(242,242,242,0.6)] mt-1 font-medium truncate">
              {getSorenessLabel(soreness)}
            </p>
          </div>
        </div>

      </div>

      {/* Sleep, Mood & Notes */}
      <div className="flex flex-wrap items-center gap-2 text-xs bg-[#1c1c21] p-2.5 rounded-xl border border-[rgba(242,242,242,0.1)]">
        
        {/* Sleep Hours */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 h-9 bg-[#141417] rounded-lg border border-[rgba(242,242,242,0.1)]">
          <Moon className="w-3.5 h-3.5 text-[#ff6b00] shrink-0" />
          <span className="text-[rgba(242,242,242,0.6)] font-medium text-xs whitespace-nowrap">Sueño:</span>
          <select
            value={sleep}
            onChange={(e) => setSleep(Number(e.target.value))}
            className="bg-transparent text-[#f2f2f2] font-mono-code font-bold text-xs focus:outline-none cursor-pointer pr-1"
          >
            {[4, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 10].map((h) => (
              <option key={h} value={h} className="bg-[#141417] text-[#f2f2f2]">
                {h} hrs
              </option>
            ))}
          </select>
        </div>

        {/* Mood */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 h-9 bg-[#141417] rounded-lg border border-[rgba(242,242,242,0.1)]">
          <Smile className="w-3.5 h-3.5 text-[#ff6b00] shrink-0" />
          <span className="text-[rgba(242,242,242,0.6)] font-medium text-xs whitespace-nowrap">Ánimo:</span>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value as DailyReadiness['mood'])}
            className="bg-transparent text-[#f2f2f2] font-bold text-xs focus:outline-none cursor-pointer pr-1"
          >
            {['Excelente', 'Bueno', 'Regular', 'Cansado', 'Con Dolor'].map((m) => (
              <option key={m} value={m} className="bg-[#141417] text-[#f2f2f2]">
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Quick notes */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder={viewMode === 'student' ? 'Notas del día (ej. bien descansado, leve molestia)...' : 'Comentarios del atleta...'}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-9 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg px-3 text-xs text-[#f2f2f2] placeholder-[rgba(242,242,242,0.35)] focus:outline-none focus:border-[#ff6b00]"
          />
        </div>

        {/* Save button */}
        <button
          id="btn-save-readiness"
          onClick={handleSave}
          className="h-9 px-4 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer"
        >
          {savedToast ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-[#ffffff]" />
              <span>¡Guardado!</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 text-[#ffffff]" />
              <span>Guardar Estado</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
