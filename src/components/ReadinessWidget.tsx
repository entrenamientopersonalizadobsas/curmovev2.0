import React, { useState } from 'react';
import { DailyReadiness, ViewMode, NutritionMeals } from '../types';
import { evaluateNutritionMeals } from '../utils/nutritionUtils';
import { 
  Zap, 
  Square, 
  ArrowDown, 
  Moon, 
  Smile, 
  Save, 
  CheckCircle,
  Utensils,
  Coffee,
  Sun,
  Sunset,
  Check,
  X,
  MessageSquare,
  Info
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
  
  // Rutina Alimentaria state (4 meals + sensations comments)
  const [nutritionMeals, setNutritionMeals] = useState<NutritionMeals>(
    readiness?.nutritionMeals ?? {
      breakfast: false,
      lunch: false,
      snack: false,
      dinner: false
    }
  );
  const [nutritionNotes, setNutritionNotes] = useState<string>(readiness?.nutritionNotes ?? '');

  const [savedToast, setSavedToast] = useState<boolean>(false);

  React.useEffect(() => {
    setEnergy(readiness?.energyLevel ?? 4);
    setFatigue(readiness?.fatigueLevel ?? 2);
    setSoreness(readiness?.muscleSoreness ?? 1);
    setSleep(readiness?.sleepHours ?? 7.5);
    setMood(readiness?.mood ?? 'Excelente');
    setNotes(readiness?.notes ?? '');
    setNutritionMeals(
      readiness?.nutritionMeals ?? {
        breakfast: false,
        lunch: false,
        snack: false,
        dinner: false
      }
    );
    setNutritionNotes(readiness?.nutritionNotes ?? '');
  }, [selectedDate, readiness]);

  const handleToggleMeal = (mealKey: keyof NutritionMeals) => {
    setNutritionMeals((prev) => ({
      ...prev,
      [mealKey]: !prev[mealKey]
    }));
  };

  const handleSave = () => {
    onSaveReadiness(selectedDate, {
      date: selectedDate,
      energyLevel: energy,
      fatigueLevel: fatigue,
      muscleSoreness: soreness,
      sleepHours: sleep,
      mood,
      notes,
      nutritionMeals,
      nutritionNotes
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  // Nutrition status evaluation according to the 4 meals rules
  const nutritionEval = evaluateNutritionMeals(nutritionMeals);

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

  const MEAL_CONFIG: Array<{
    key: keyof NutritionMeals;
    label: string;
    sublabel: string;
    isPrimary: boolean;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { key: 'breakfast', label: 'Desayuno', sublabel: 'Inicio del día', isPrimary: false, icon: Coffee },
    { key: 'lunch', label: 'Almuerzo', sublabel: 'Comida Principal ★', isPrimary: true, icon: Sun },
    { key: 'snack', label: 'Merienda', sublabel: 'Media Tarde', isPrimary: false, icon: Sunset },
    { key: 'dinner', label: 'Cena', sublabel: 'Comida Principal ★', isPrimary: true, icon: Moon }
  ];

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

      {/* Sleep, Mood & General Notes */}
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

        {/* Quick general notes */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder={viewMode === 'student' ? 'Notas generales del día (ej. bien descansado, leve molestia)...' : 'Comentarios del atleta...'}
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
              <span>Guardar Todo</span>
            </>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* RUTINA ALIMENTARIA: 4 COMIDAS & SENSACIONES AL COMER     */}
      {/* ======================================================== */}
      <div className="bg-[#1c1c21] p-3 rounded-xl border border-[rgba(242,242,242,0.1)] flex flex-col gap-3">
        
        {/* Header Rutina Alimentaria */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(242,242,242,0.08)] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#141417] border border-[rgba(242,242,242,0.1)] flex items-center justify-center text-[#ff6b00]">
              <Utensils className="w-3.5 h-3.5 text-[#ff6b00]" />
            </div>
            <div>
              <span className="text-xs font-display font-bold uppercase tracking-wider text-[#f2f2f2]">
                Rutina Alimentaria
              </span>
              <span className="text-[10px] text-[rgba(242,242,242,0.5)] block sm:inline sm:ml-2">
                (Control de las 4 comidas del día y sensaciones)
              </span>
            </div>
          </div>

          {/* Dynamic Evaluation Badge */}
          <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${nutritionEval.badgeBg} ${nutritionEval.badgeText} ${nutritionEval.badgeBorder}`}>
            <span className={`w-2 h-2 rounded-full ${nutritionEval.badgeDot}`} />
            <span>{nutritionEval.label}</span>
          </div>
        </div>

        {/* The 4 Meals Interactive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MEAL_CONFIG.map(({ key, label, sublabel, isPrimary, icon: MealIcon }) => {
            const isChecked = Boolean(nutritionMeals[key]);

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleToggleMeal(key)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 relative overflow-hidden group ${
                  isChecked
                    ? 'bg-[#141417] border-[#22c55e]/60 ring-1 ring-[#22c55e]/30 shadow-xs'
                    : 'bg-[#141417] border-[rgba(242,242,242,0.08)] hover:border-[rgba(242,242,242,0.18)] opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                    isChecked
                      ? 'bg-[rgba(34,197,94,0.15)] text-[#22c55e] border-[rgba(34,197,94,0.3)]'
                      : 'bg-[#1c1c21] text-[rgba(242,242,242,0.4)] border-[rgba(242,242,242,0.08)]'
                  }`}>
                    <MealIcon className="w-3.5 h-3.5" />
                  </div>

                  {/* Status chip */}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                    isChecked
                      ? 'bg-[rgba(34,197,94,0.2)] text-[#22c55e]'
                      : 'bg-[#1c1c21] text-[rgba(242,242,242,0.4)]'
                  }`}>
                    {isChecked ? (
                      <>
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        <span>Realizada</span>
                      </>
                    ) : (
                      <>
                        <X className="w-2.5 h-2.5" />
                        <span>No realizada</span>
                      </>
                    )}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold ${isChecked ? 'text-[#f2f2f2]' : 'text-[rgba(242,242,242,0.6)]'}`}>
                      {label}
                    </span>
                    {isPrimary && (
                      <span className="text-[8px] font-black uppercase text-[#ff6b00] bg-[rgba(255,107,0,0.1)] px-1 rounded border border-[rgba(255,107,0,0.25)]">
                        Clave
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[rgba(242,242,242,0.4)] mt-0.5">
                    {sublabel}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sensations / Comments about eating */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <div className="relative flex-1 w-full">
            <div className="absolute left-3 top-2.5 text-[rgba(242,242,242,0.4)]">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Comentarios acerca de cómo te sentiste comiendo (ej: digestión ligera, saciado, pesadez, ansiedad, apetito alto/bajo...)"
              value={nutritionNotes}
              onChange={(e) => setNutritionNotes(e.target.value)}
              className="w-full h-9 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg pl-8 pr-3 text-xs text-[#f2f2f2] placeholder-[rgba(242,242,242,0.35)] focus:outline-none focus:border-[#ff6b00]"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="h-9 px-3.5 bg-[#141417] hover:bg-[#26262b] text-[#f2f2f2] border border-[rgba(242,242,242,0.12)] hover:border-[rgba(242,242,242,0.25)] font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
          >
            <Save className="w-3 h-3 text-[#ff6b00]" />
            <span>Guardar Rutina Alimentaria</span>
          </button>
        </div>

        {/* Nutritional Rule Explanatory Banner */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] pt-1.5 border-t border-[rgba(242,242,242,0.06)] text-[rgba(242,242,242,0.5)]">
          <div className="flex items-center gap-1.5">
            <Info className="w-3 h-3 text-[#ff6b00] shrink-0" />
            <span className="text-[#f2f2f2] font-medium">{nutritionEval.description}</span>
          </div>
          <div className="flex items-center gap-2 text-[9px]">
            <span className="text-[#22c55e] font-semibold">🟢 4 comidas (Verde)</span>
            <span>•</span>
            <span className="text-[#eab308] font-semibold">🟡 3 o 2 comidas con Alm+Cena (Amarillo)</span>
            <span>•</span>
            <span className="text-[#ef4444] font-semibold">🔴 Faltan principales o &lt;2 (Rojo)</span>
          </div>
        </div>

      </div>

    </div>
  );
};

