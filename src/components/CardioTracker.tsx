import React, { useState, useEffect } from 'react';
import { CardioSession, CardioType, ViewMode } from '../types';
import { 
  Bike, 
  Footprints, 
  Activity, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Flame, 
  Gauge, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp,
  Sparkles
} from 'lucide-react';

interface CardioTrackerProps {
  cardioSessions?: CardioSession[];
  onUpdateCardio: (sessions: CardioSession[]) => void;
  viewMode: ViewMode;
  dateStr?: string;
}

export const CardioTracker: React.FC<CardioTrackerProps> = ({
  cardioSessions = [],
  onUpdateCardio,
  viewMode,
  dateStr
}) => {
  const [isAddingOpen, setIsAddingOpen] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<CardioType>('bici');
  
  // Form state
  const [formDuration, setFormDuration] = useState<number>(20);
  const [formLevel, setFormLevel] = useState<number>(8); // For Bici & Elíptico
  const [formDistance, setFormDistance] = useState<number>(3.0); // For Caminadora
  const [formRpe, setFormRpe] = useState<number>(7); // 1-10
  const [formIncline, setFormIncline] = useState<number>(2); // % for Caminadora
  const [formNotes, setFormNotes] = useState<string>('');

  // Active live timer state for an in-progress cardio session
  const [activeTimerSessionId, setActiveTimerSessionId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Interval for live timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && activeTimerSessionId) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          const next = prev + 1;
          // Every full minute, sync with session duration
          if (next % 60 === 0) {
            const minutes = Math.floor(next / 60);
            onUpdateCardio(
              cardioSessions.map((s) =>
                s.id === activeTimerSessionId ? { ...s, durationMinutes: minutes } : s
              )
            );
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, activeTimerSessionId, cardioSessions, onUpdateCardio]);

  // Handler: Add Cardio Session
  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();

    let name = 'Bicicleta / Spinning';
    if (selectedType === 'caminadora') name = 'Caminadora / Cinta';
    if (selectedType === 'eliptico') name = 'Elíptico';

    const newSession: CardioSession = {
      id: `cardio-${Date.now()}`,
      type: selectedType,
      name,
      durationMinutes: Math.max(1, formDuration),
      level: selectedType === 'bici' || selectedType === 'eliptico' ? formLevel : undefined,
      distanceKm: selectedType === 'caminadora' ? formDistance : undefined,
      rpe: formRpe,
      inclinePct: selectedType === 'caminadora' ? formIncline : undefined,
      notes: formNotes.trim() || undefined,
      completed: false
    };

    onUpdateCardio([...cardioSessions, newSession]);
    setIsAddingOpen(false);
    setFormNotes('');
  };

  // Handler: Update specific cardio session
  const handleUpdateSession = (updated: CardioSession) => {
    onUpdateCardio(cardioSessions.map((s) => (s.id === updated.id ? updated : s)));
  };

  // Handler: Delete cardio session
  const handleDeleteSession = (id: string) => {
    if (activeTimerSessionId === id) {
      setIsTimerRunning(false);
      setActiveTimerSessionId(null);
    }
    onUpdateCardio(cardioSessions.filter((s) => s.id !== id));
  };

  // Start live timer for a card
  const handleStartTimer = (session: CardioSession) => {
    if (activeTimerSessionId === session.id) {
      setIsTimerRunning(!isTimerRunning);
    } else {
      setActiveTimerSessionId(session.id);
      setTimerSeconds(session.durationMinutes * 60);
      setIsTimerRunning(true);
    }
  };

  const handleStopAndSaveTimer = (session: CardioSession) => {
    setIsTimerRunning(false);
    const finalMinutes = Math.max(1, Math.round(timerSeconds / 60));
    handleUpdateSession({
      ...session,
      durationMinutes: finalMinutes,
      completed: true
    });
    setActiveTimerSessionId(null);
    setTimerSeconds(0);
  };

  // Quick helper to format seconds mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Total cardio minutes & stats
  const totalCardioMinutes = cardioSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalKm = cardioSessions.reduce((acc, s) => acc + (s.distanceKm || 0), 0);

  return (
    <div className="bg-[#141417] rounded-xl border border-[rgba(242,242,242,0.1)] shadow-xs overflow-hidden text-[#f2f2f2]">
      {/* Header */}
      <div className="px-4 py-3 bg-[#141417] border-b border-[rgba(242,242,242,0.1)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#1c1c21] text-[#ff6b00] border border-[rgba(242,242,242,0.1)] flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-display font-bold uppercase tracking-wider text-[#f2f2f2]">
                Sección de Cardio
              </h4>
              {cardioSessions.length > 0 && (
                <span className="text-[10px] font-mono-code bg-[#1c1c21] text-[#ff6b00] font-bold px-2 py-0.5 rounded border border-[#ff6b00]">
                  {totalCardioMinutes} min {totalKm > 0 ? `• ${totalKm.toFixed(1)} km` : ''}
                </span>
              )}
            </div>
            <p className="text-[10px] text-[rgba(242,242,242,0.5)]">
              Bici (min/nivel/RPE) • Caminadora (min/km) • Elíptico (min/nivel/RPE)
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddingOpen(!isAddingOpen)}
          className="text-xs font-bold bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>AGREGAR CARDIO</span>
        </button>
      </div>

      {/* Add Cardio Modal / Form */}
      {isAddingOpen && (
        <form onSubmit={handleAddSession} className="p-4 bg-[#1c1c21] border-b border-[rgba(242,242,242,0.1)] space-y-3.5">
          <div className="flex items-center justify-between border-b border-[rgba(242,242,242,0.1)] pb-2">
            <span className="text-xs font-mono-code font-bold text-[#f2f2f2] uppercase">Nuevo Bloque de Cardio</span>
            <button
              type="button"
              onClick={() => setIsAddingOpen(false)}
              className="text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2] text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Machine Type Selector */}
          <div>
            <label className="text-[10px] uppercase font-bold text-[rgba(242,242,242,0.5)] block mb-1.5">
              Tipo de Máquina / Actividad
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedType('bici')}
                className={`p-2.5 rounded-lg border flex flex-col items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                  selectedType === 'bici'
                    ? 'bg-[#141417] border-[#ff6b00] text-[#ff6b00]'
                    : 'bg-[#141417] border-[rgba(242,242,242,0.1)] text-[rgba(242,242,242,0.6)] hover:text-[#f2f2f2]'
                }`}
              >
                <Bike className="w-4 h-4 text-[#ff6b00]" />
                <span>BICI</span>
                <span className="text-[9px] font-normal text-[rgba(242,242,242,0.4)]">Min, Nivel, RPE</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('caminadora')}
                className={`p-2.5 rounded-lg border flex flex-col items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                  selectedType === 'caminadora'
                    ? 'bg-[#141417] border-[#ff6b00] text-[#ff6b00]'
                    : 'bg-[#141417] border-[rgba(242,242,242,0.1)] text-[rgba(242,242,242,0.6)] hover:text-[#f2f2f2]'
                }`}
              >
                <Footprints className="w-4 h-4 text-[#ff6b00]" />
                <span>CAMINADORA</span>
                <span className="text-[9px] font-normal text-[rgba(242,242,242,0.4)]">Min y Km</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('eliptico')}
                className={`p-2.5 rounded-lg border flex flex-col items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                  selectedType === 'eliptico'
                    ? 'bg-[#141417] border-[#ff6b00] text-[#ff6b00]'
                    : 'bg-[#141417] border-[rgba(242,242,242,0.1)] text-[rgba(242,242,242,0.6)] hover:text-[#f2f2f2]'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-[#ff6b00]" />
                <span>ELÍPTICO</span>
                <span className="text-[9px] font-normal text-[rgba(242,242,242,0.4)]">Min, Nivel, RPE</span>
              </button>
            </div>
          </div>

          {/* Form Inputs based on Machine */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono-code">
            {/* 1. CONTADOR DE MINUTOS (ALL MACHINES) */}
            <div className="bg-[#141417] p-3 rounded-lg border border-[rgba(242,242,242,0.1)]">
              <label className="text-[10px] uppercase font-bold text-[rgba(242,242,242,0.5)] block mb-1 flex items-center justify-between">
                <span>⏱ Minutos (Duración)</span>
                <span className="text-[#ff6b00] font-black">{formDuration} min</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormDuration(Math.max(1, formDuration - 5))}
                  className="w-8 h-8 rounded bg-[#1c1c21] hover:bg-[#26262b] text-[#f2f2f2] font-bold text-sm border border-[rgba(242,242,242,0.1)] cursor-pointer"
                >
                  -5
                </button>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={formDuration}
                  onChange={(e) => setFormDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded py-1 text-center font-bold text-sm text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                />
                <button
                  type="button"
                  onClick={() => setFormDuration(formDuration + 5)}
                  className="w-8 h-8 rounded bg-[#1c1c21] hover:bg-[#26262b] text-[#f2f2f2] font-bold text-sm border border-[rgba(242,242,242,0.1)] cursor-pointer"
                >
                  +5
                </button>
              </div>
            </div>

            {/* 2. BICI & ELIPTICO: CONTADOR DE NIVELES (LEVEL) */}
            {(selectedType === 'bici' || selectedType === 'eliptico') && (
              <div className="bg-[#141417] p-3 rounded-lg border border-[rgba(242,242,242,0.1)]">
                <label className="text-[10px] uppercase font-bold text-[rgba(242,242,242,0.5)] block mb-1 flex items-center justify-between">
                  <span>⚡ Nivel Resistencia</span>
                  <span className="text-[#ff6b00] font-black">Nivel {formLevel}</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormLevel(Math.max(1, formLevel - 1))}
                    className="w-8 h-8 rounded bg-[#1c1c21] hover:bg-[#26262b] text-[#f2f2f2] font-bold text-sm border border-[rgba(242,242,242,0.1)] cursor-pointer"
                  >
                    -1
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formLevel}
                    onChange={(e) => setFormLevel(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded py-1 text-center font-bold text-sm text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                  />
                  <button
                    type="button"
                    onClick={() => setFormLevel(Math.min(30, formLevel + 1))}
                    className="w-8 h-8 rounded bg-[#1c1c21] hover:bg-[#26262b] text-[#f2f2f2] font-bold text-sm border border-[rgba(242,242,242,0.1)] cursor-pointer"
                  >
                    +1
                  </button>
                </div>
              </div>
            )}

            {/* 2. CAMINADORA: CONTADOR DE KM (DISTANCIA) */}
            {selectedType === 'caminadora' && (
              <div className="bg-[#141417] p-3 rounded-lg border border-[rgba(242,242,242,0.1)]">
                <label className="text-[10px] uppercase font-bold text-[rgba(242,242,242,0.5)] block mb-1 flex items-center justify-between">
                  <span>📍 Distancia Recorrida</span>
                  <span className="text-[#ff6b00] font-black">{formDistance.toFixed(1)} km</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormDistance(Math.max(0.1, parseFloat((formDistance - 0.5).toFixed(1))))}
                    className="w-8 h-8 rounded bg-[#1c1c21] hover:bg-[#26262b] text-[#f2f2f2] font-bold text-xs border border-[rgba(242,242,242,0.1)] cursor-pointer"
                  >
                    -0.5
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="50"
                    value={formDistance}
                    onChange={(e) => setFormDistance(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                    className="w-full bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded py-1 text-center font-bold text-sm text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                  />
                  <button
                    type="button"
                    onClick={() => setFormDistance(parseFloat((formDistance + 0.5).toFixed(1)))}
                    className="w-8 h-8 rounded bg-[#1c1c21] hover:bg-[#26262b] text-[#f2f2f2] font-bold text-xs border border-[rgba(242,242,242,0.1)] cursor-pointer"
                  >
                    +0.5
                  </button>
                </div>
              </div>
            )}

            {/* 3. RPE / ESFUERZO (1-10) */}
            <div className="bg-[#141417] p-3 rounded-lg border border-[rgba(242,242,242,0.1)]">
              <label className="text-[10px] uppercase font-bold text-[rgba(242,242,242,0.5)] block mb-1 flex items-center justify-between">
                <span>🔥 Esfuerzo RPE</span>
                <span className="text-[#ff6b00] font-black">@{formRpe}/10</span>
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={formRpe}
                  onChange={(e) => setFormRpe(parseInt(e.target.value, 10))}
                  className="w-full bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded py-1.5 px-2 text-xs font-bold text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                >
                  <option value={5}>RPE 5 (Muy Ligero)</option>
                  <option value={6}>RPE 6 (Ligero / Calentamiento)</option>
                  <option value={7}>RPE 7 (Moderado / Zona 2)</option>
                  <option value={8}>RPE 8 (Vigoroso / Ritmo Alto)</option>
                  <option value={9}>RPE 9 (Muy Duro / Umbral)</option>
                  <option value={10}>RPE 10 (Esfuerzo Máximo / HIIT)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes / Incline */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Notas opcionales (ej: intervalos de 1 min, inclinación 3%, cadencia 85rpm...)"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="flex-1 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg px-3 py-2 text-xs text-[#f2f2f2] placeholder-[rgba(242,242,242,0.4)] focus:outline-none focus:border-[#ff6b00]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] font-bold text-xs rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar Cardio</span>
            </button>
          </div>
        </form>
      )}

      {/* List of Cardio Sessions for this workout */}
      <div className="p-3.5 space-y-2.5">
        {cardioSessions.length === 0 ? (
          <div className="text-center py-5 text-[rgba(242,242,242,0.5)] space-y-1">
            <p className="text-xs font-semibold text-[#f2f2f2]">No hay bloques de cardio registrados hoy</p>
            <p className="text-[11px] text-[rgba(242,242,242,0.5)]">
              Hacé click en <strong className="text-[#ff6b00]">+ AGREGAR CARDIO</strong> para registrar tu sesión de Bici, Caminadora o Elíptico.
            </p>
          </div>
        ) : (
          cardioSessions.map((session) => {
            const isThisTimerActive = activeTimerSessionId === session.id;

            return (
              <div
                key={session.id}
                className={`p-3 rounded-lg border transition-all ${
                  session.completed
                    ? 'bg-[#1c1c21] border-[#ff6b00]'
                    : isThisTimerActive
                    ? 'bg-[#1c1c21] border-[#ff6b00] ring-1 ring-[#ff6b00]'
                    : 'bg-[#141417] border-[rgba(242,242,242,0.1)]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  {/* Left: Icon, Name & Key Stats */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                      session.type === 'bici'
                        ? 'bg-[#1c1c21] text-[#ff6b00] border-[#ff6b00]'
                        : session.type === 'caminadora'
                        ? 'bg-[#1c1c21] text-[#ff6b00] border-[#ff6b00]'
                        : 'bg-[#1c1c21] text-[#ff6b00] border-[#ff6b00]'
                    }`}>
                      {session.type === 'bici' ? (
                        <Bike className="w-5 h-5" />
                      ) : session.type === 'caminadora' ? (
                        <Footprints className="w-5 h-5" />
                      ) : (
                        <TrendingUp className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-[#f2f2f2]">{session.name}</span>
                        {session.completed && (
                          <span className="text-[9px] bg-[#1c1c21] text-[#ff6b00] font-mono-code font-bold px-1.5 py-0.2 rounded border border-[#ff6b00]">
                            ✓ Completado
                          </span>
                        )}
                      </div>

                      {/* Machine Stats Badges */}
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-mono-code">
                        {/* ⏱ CONTADOR DE MINUTOS */}
                        <div className="flex items-center gap-1 bg-[#1c1c21] px-2 py-0.5 rounded border border-[rgba(242,242,242,0.1)]">
                          <Timer className="w-3.5 h-3.5 text-[#ff6b00]" />
                          <span className="font-bold text-[#f2f2f2]">{session.durationMinutes} min</span>
                        </div>

                        {/* ⚡ BICI & ELÍPTICO: CONTADOR DE NIVELES */}
                        {(session.type === 'bici' || session.type === 'eliptico') && session.level !== undefined && (
                          <div className="flex items-center gap-1 bg-[#1c1c21] px-2 py-0.5 rounded border border-[rgba(242,242,242,0.1)]">
                            <Gauge className="w-3.5 h-3.5 text-[#ff6b00]" />
                            <span className="font-bold text-[#f2f2f2]">Nivel {session.level}</span>
                          </div>
                        )}

                        {/* 📍 CAMINADORA: CONTADOR DE KM */}
                        {session.type === 'caminadora' && session.distanceKm !== undefined && (
                          <div className="flex items-center gap-1 bg-[#1c1c21] px-2 py-0.5 rounded border border-[rgba(242,242,242,0.1)]">
                            <Footprints className="w-3.5 h-3.5 text-[#ff6b00]" />
                            <span className="font-bold text-[#ff6b00]">{session.distanceKm} km</span>
                          </div>
                        )}

                        {/* 🔥 RPE */}
                        {session.rpe !== undefined && (
                          <div className="flex items-center gap-1 bg-[#1c1c21] px-2 py-0.5 rounded border border-[rgba(242,242,242,0.1)]">
                            <Flame className="w-3.5 h-3.5 text-[#ff6b00]" />
                            <span className="font-bold text-[#ff6b00]">@{session.rpe} RPE</span>
                          </div>
                        )}
                      </div>

                      {session.notes && (
                        <p className="text-[10px] text-[rgba(242,242,242,0.5)] italic mt-1 truncate">
                          "{session.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Live Interactive Timer & Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    
                    {/* Live Timer Controls */}
                    {isThisTimerActive ? (
                      <div className="flex items-center gap-1.5 bg-[#1c1c21] px-2.5 py-1 rounded-lg border border-[#ff6b00]">
                        <span className="font-mono-code font-bold text-xs text-[#ff6b00] animate-pulse">
                          {formatTime(timerSeconds)}
                        </span>
                        <button
                          onClick={() => setIsTimerRunning(!isTimerRunning)}
                          className="p-1 rounded bg-[#141417] text-[#f2f2f2] hover:bg-[#26262b] cursor-pointer"
                          title={isTimerRunning ? 'Pausar' : 'Reanudar'}
                        >
                          {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleStopAndSaveTimer(session)}
                          className="px-2 py-0.5 rounded bg-[#ff6b00] text-[#ffffff] font-bold text-[10px] hover:bg-[#e65e00] cursor-pointer"
                          title="Finalizar y Guardar Tiempo"
                        >
                          Listo
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartTimer(session)}
                        className="px-2.5 py-1 rounded-lg bg-[#1c1c21] hover:bg-[#26262b] text-[#f2f2f2] text-[11px] font-bold border border-[rgba(242,242,242,0.1)] flex items-center gap-1 cursor-pointer transition-colors"
                        title="Cronómetro en vivo"
                      >
                        <Play className="w-3 h-3 text-[#ff6b00]" />
                        <span>Iniciar</span>
                      </button>
                    )}

                    {/* Checkbox Complete */}
                    <button
                      onClick={() => handleUpdateSession({ ...session, completed: !session.completed })}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        session.completed
                          ? 'bg-[#1c1c21] text-[#ff6b00] border-[#ff6b00]'
                          : 'bg-[#141417] text-[rgba(242,242,242,0.4)] border-[rgba(242,242,242,0.1)] hover:text-[#f2f2f2]'
                      }`}
                      title={session.completed ? 'Marcar pendiente' : 'Marcar completado'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-1.5 text-[rgba(242,242,242,0.4)] hover:text-[#ff5555] rounded-lg transition-colors cursor-pointer"
                      title="Eliminar Cardio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
