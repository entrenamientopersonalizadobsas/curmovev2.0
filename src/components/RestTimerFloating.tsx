import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Plus, Minus, X, Bell } from 'lucide-react';

interface RestTimerFloatingProps {
  initialSeconds: number;
  isOpen: boolean;
  onClose: () => void;
}

export const RestTimerFloating: React.FC<RestTimerFloatingProps> = ({
  initialSeconds,
  isOpen,
  onClose
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setTimeLeft(initialSeconds);
    setIsRunning(true);
  }, [initialSeconds, isOpen]);

  // Web Audio API beep sound for when timer completes
  const playBeep = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // 880 Hz
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Audio context might be restricted
    }
  };

  useEffect(() => {
    if (!isOpen || !isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          playBeep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isRunning]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed bottom-5 right-5 z-50 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-2xl p-3 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 text-[#f2f2f2]">
      
      {/* Timer Icon & Time */}
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
          timeLeft === 0 
            ? 'bg-[rgba(255,107,0,0.15)] text-[#ff6b00] border border-[rgba(255,107,0,0.4)] animate-bounce shadow-md' 
            : 'bg-[#1c1c21] text-[#ff6b00] border border-[rgba(242,242,242,0.1)]'
        }`}>
          {timeLeft === 0 ? <Bell className="w-4 h-4 text-[#ff6b00]" /> : <Timer className="w-4 h-4" />}
        </div>
        
        <div>
          <span className="text-[10px] font-bold uppercase text-[rgba(242,242,242,0.5)] block tracking-wider">
            {timeLeft === 0 ? '¡TIEMPO CUMPLIDO!' : 'DESCANSO ENTRE SERIES'}
          </span>
          <span className={`text-xl font-bold tabular-nums ${timeLeft === 0 ? 'text-[#ff6b00]' : 'text-[#f2f2f2]'}`}>
            {formattedTime}
          </span>
        </div>
      </div>

      {/* Quick Controls */}
      <div className="flex items-center gap-1 bg-[#0c0c0e] p-1 rounded-xl border border-[rgba(242,242,242,0.1)]">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="p-1.5 rounded-lg bg-[#1c1c21] hover:bg-[#26262b] text-[#f2f2f2] transition-colors cursor-pointer border border-[rgba(242,242,242,0.1)]"
          title={isRunning ? 'Pausar' : 'Reanudar'}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-[#ff6b00] text-[#ff6b00]" />}
        </button>

        <button
          onClick={() => {
            setTimeLeft(initialSeconds);
            setIsRunning(true);
          }}
          className="p-1.5 rounded-lg bg-[#1c1c21] hover:bg-[#26262b] text-[rgba(242,242,242,0.6)] hover:text-[#f2f2f2] transition-colors cursor-pointer border border-[rgba(242,242,242,0.1)]"
          title="Reiniciar"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setTimeLeft((prev) => prev + 30)}
          className="px-2 py-1 rounded-lg bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] text-xs font-bold transition-colors cursor-pointer shadow-xs"
          title="+30 segundos"
        >
          +30s
        </button>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2] p-1 cursor-pointer transition-colors"
        title="Cerrar temporizador"
      >
        <X className="w-4 h-4" />
      </button>

    </div>
  );
};
