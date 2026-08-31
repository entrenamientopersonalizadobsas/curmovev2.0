import React from 'react';
import { DailyWorkout, ViewMode } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Dumbbell, 
  Coffee 
} from 'lucide-react';

interface CalendarStripProps {
  currentDates: string[]; // 7 dates of the selected week (YYYY-MM-DD)
  selectedDate: string;
  onSelectDate: (date: string) => void;
  workouts: Record<string, DailyWorkout>;
  viewMode: ViewMode;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

const DAY_NAMES_ES = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

export const CalendarStrip: React.FC<CalendarStripProps> = ({
  currentDates,
  selectedDate,
  onSelectDate,
  workouts,
  viewMode,
  onPrevWeek,
  onNextWeek,
  onToday
}) => {
  return (
    <div id="curmove-calendar" className="bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-xl px-3 py-2.5 shadow-xs text-[#f2f2f2]">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Title and Quick Week Nav */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2 text-[#f2f2f2]">
            <div className="w-6 h-6 rounded bg-[#1c1c21] flex items-center justify-center text-[#ff6b00] border border-[rgba(242,242,242,0.1)]">
              <CalendarIcon className="w-3.5 h-3.5" />
            </div>
            <span className="font-display font-bold text-xs uppercase tracking-wider text-[#f2f2f2]">
              Semana
            </span>
          </div>

          <div className="flex items-center gap-1 bg-[#1c1c21] rounded-lg p-0.5 border border-[rgba(242,242,242,0.1)]">
            <button
              id="btn-prev-week"
              onClick={onPrevWeek}
              className="p-1 rounded text-[rgba(242,242,242,0.6)] hover:text-[#f2f2f2] hover:bg-[#141417] transition-colors cursor-pointer"
              title="Semana Anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-today"
              onClick={onToday}
              className="px-2.5 py-0.5 text-xs font-mono-code font-bold bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] rounded transition-colors cursor-pointer"
            >
              HOY
            </button>
            <button
              id="btn-next-week"
              onClick={onNextWeek}
              className="p-1 rounded text-[rgba(242,242,242,0.6)] hover:text-[#f2f2f2] hover:bg-[#141417] transition-colors cursor-pointer"
              title="Semana Siguiente"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Calendar Days Strip (7 columns) */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 w-full flex-1 max-w-4xl">
          {currentDates.map((dateStr, index) => {
            const isSelected = dateStr === selectedDate;
            const workout = workouts[dateStr];
            const hasExercises = workout && workout.exercises && workout.exercises.length > 0;
            const isRest = workout?.isRestDay;
            const isCompleted = workout?.completed;
            const dayNum = dateStr.split('-')[2];
            const dayName = DAY_NAMES_ES[index];

            return (
              <button
                key={dateStr}
                id={`cal-day-${dateStr}`}
                onClick={() => onSelectDate(dateStr)}
                className={`relative flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-xl transition-all text-left border cursor-pointer ${
                  isSelected
                    ? 'bg-[#1c1c21] border-[#ff6b00] shadow-sm ring-1 ring-[#ff6b00]'
                    : 'bg-[#141417] border-[rgba(242,242,242,0.08)] hover:border-[rgba(242,242,242,0.2)] hover:bg-[#1c1c21]'
                }`}
              >
                {/* Day Header */}
                <div className="w-full flex items-center justify-between gap-1">
                  <span className={`text-[10px] sm:text-[11px] font-mono-code font-bold tracking-tight whitespace-nowrap ${
                    isSelected ? 'text-[#ff6b00]' : 'text-[rgba(242,242,242,0.5)]'
                  }`}>
                    {dayName}
                  </span>
                  <span className={`text-xs font-bold font-mono-code min-w-[20px] h-5 flex items-center justify-center rounded px-1 ${
                    isSelected ? 'bg-[#ff6b00] text-[#ffffff]' : 'text-[#f2f2f2]'
                  }`}>
                    {dayNum}
                  </span>
                </div>

                {/* Workout Status Badge */}
                <div className="w-full mt-1.5 flex flex-col items-center justify-center min-h-[22px] gap-0.5">
                  {isRest ? (
                    <div className="flex items-center gap-1 text-[9px] text-[rgba(242,242,242,0.5)] bg-[#1c1c21] px-1.5 py-0.5 rounded font-medium border border-[rgba(242,242,242,0.1)] whitespace-nowrap">
                      <Coffee className="w-2.5 h-2.5 text-[rgba(242,242,242,0.5)] shrink-0" />
                      <span>Descanso</span>
                    </div>
                  ) : hasExercises ? (
                    <div className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${
                      isCompleted
                        ? 'bg-[rgba(34,197,94,0.12)] text-[#22c55e] border-[rgba(34,197,94,0.25)]'
                        : isSelected
                        ? 'bg-[#141417] text-[#ff6b00] border-[#ff6b00]'
                        : 'bg-[#1c1c21] text-[#f2f2f2] border-[rgba(242,242,242,0.1)]'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-2.5 h-2.5 text-[#22c55e] shrink-0" />
                      ) : (
                        <Dumbbell className="w-2.5 h-2.5 text-[#ff6b00] shrink-0" />
                      )}
                      <span>{workout.exercises.length} ej.</span>
                    </div>
                  ) : workout?.cardio && workout.cardio.length > 0 ? (
                    <div className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#1c1c21] text-[#ff6b00] border border-[rgba(242,242,242,0.1)] whitespace-nowrap">
                      <span>🏃 Cardio</span>
                    </div>
                  ) : (
                    <div className="text-[10px] font-medium text-[rgba(242,242,242,0.35)]">
                      {viewMode === 'trainer' ? 'Vacío' : 'Libre'}
                    </div>
                  )}
                </div>

                {/* Indicator line */}
                {isSelected && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#ff6b00]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

