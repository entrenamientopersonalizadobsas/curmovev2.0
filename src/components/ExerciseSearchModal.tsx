import React, { useState } from 'react';
import { EXERCISE_DATABASE } from '../data/mockData';
import { 
  Search, 
  Dumbbell, 
  X, 
  Play, 
  Filter
} from 'lucide-react';

interface ExerciseSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExerciseToView?: (exerciseName: string) => void;
}

export const ExerciseSearchModal: React.FC<ExerciseSearchModalProps> = ({
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('all');

  if (!isOpen) return null;

  const filteredExercises = EXERCISE_DATABASE.filter((ex) => {
    const matchesQuery = 
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.movementPattern.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMuscle = selectedMuscleFilter === 'all' || ex.muscleGroup === selectedMuscleFilter;

    return matchesQuery && matchesMuscle;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-[#f2f2f2]">
        
        {/* Search Header */}
        <div className="p-4 bg-[#1c1c21] border-b border-[rgba(242,242,242,0.1)] flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#141417] border border-[rgba(242,242,242,0.1)] text-[#ff6b00] flex items-center justify-center">
            <Search className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por ejercicio (ej. Press banca, Sentadilla), músculo, patrón..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-xl px-3 py-2 text-xs text-[#f2f2f2] placeholder-[rgba(242,242,242,0.4)] focus:border-[#ff6b00] focus:outline-none"
            />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#141417] hover:bg-[#26262b] text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2] cursor-pointer border border-[rgba(242,242,242,0.1)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 bg-[#0c0c0e] border-b border-[rgba(242,242,242,0.1)] flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[rgba(242,242,242,0.5)] font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#ff6b00]" />
            <span>Filtro:</span>
          </span>
          {['all', 'Pecho', 'Espalda', 'Cuádriceps', 'Isquios / Glúteo', 'Hombros', 'Brazos', 'Core / Abdomen'].map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMuscleFilter(m)}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors text-xs font-bold cursor-pointer ${
                selectedMuscleFilter === m
                  ? 'bg-[#ff6b00] text-[#ffffff] shadow-xs'
                  : 'bg-[#1c1c21] text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2] border border-[rgba(242,242,242,0.1)]'
              }`}
            >
              {m === 'all' ? 'Todos' : m}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 custom-scrollbar">
          {filteredExercises.length === 0 ? (
            <div className="text-center py-12 text-[rgba(242,242,242,0.4)] text-xs">
              No se encontraron ejercicios con "{searchTerm}".
            </div>
          ) : (
            filteredExercises.map((ex) => (
              <div
                key={ex.name}
                className="bg-[#1c1c21] p-3 rounded-xl border border-[rgba(242,242,242,0.1)] hover:border-[rgba(242,242,242,0.2)] transition-all flex items-center justify-between gap-3 shadow-xs group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#141417] flex items-center justify-center text-[#ff6b00] shrink-0 border border-[rgba(242,242,242,0.1)]">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#f2f2f2] group-hover:text-[#ff6b00] transition-colors">{ex.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#ff6b00] font-bold bg-[#141417] px-1.5 py-0.2 rounded border border-[rgba(242,242,242,0.1)]">
                        {ex.muscleGroup}
                      </span>
                      <span className="text-[10px] text-[rgba(242,242,242,0.6)] font-medium">
                        {ex.movementPattern}
                      </span>
                      <span className="text-[10px] text-[rgba(242,242,242,0.4)]">
                        • {ex.equipment}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={ex.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-[rgba(255,107,0,0.15)] hover:bg-[#ff6b00] text-[#ff6b00] hover:text-[#ffffff] text-xs font-bold flex items-center gap-1 border border-[rgba(255,107,0,0.3)] cursor-pointer shadow-xs transition-colors"
                    title="Ver video en nueva pestaña"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span className="hidden sm:inline">Ver Video</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
