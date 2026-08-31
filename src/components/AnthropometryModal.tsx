import React, { useState } from 'react';
import { StudentProfile, AnthropometryRecord } from '../types';
import { 
  Activity, 
  Plus, 
  Calendar, 
  TrendingDown, 
  TrendingUp, 
  Scale, 
  Ruler, 
  Percent, 
  X
} from 'lucide-react';

interface AnthropometryModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  onAddRecord: (record: AnthropometryRecord) => void;
}

export const AnthropometryModal: React.FC<AnthropometryModalProps> = ({
  isOpen,
  onClose,
  student,
  onAddRecord
}) => {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [weightKg, setWeightKg] = useState<number>(student.currentWeightKg || 80);
  const [heightCm, setHeightCm] = useState<number>(student.heightCm || 175);
  const [bodyFatPct, setBodyFatPct] = useState<number>(15.0);
  const [muscleMassKg, setMuscleMassKg] = useState<number>(38.0);
  const [chestCm, setChestCm] = useState<number>(100);
  const [waistCm, setWaistCm] = useState<number>(82);
  const [hipCm, setHipCm] = useState<number>(98);
  const [armCm, setArmCm] = useState<number>(37);
  const [thighCm, setThighCm] = useState<number>(59);
  const [calfCm, setCalfCm] = useState<number>(38);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const history = student.anthropometryHistory || [];
  const latestRecord = history[history.length - 1];
  const initialRecord = history[0];

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    const newRec: AnthropometryRecord = {
      id: `anthro-${Date.now()}`,
      date: formDate,
      weightKg,
      heightCm,
      bodyFatPct,
      muscleMassKg,
      chestCm,
      waistCm,
      hipCm,
      armRightCm: armCm,
      thighRightCm: thighCm,
      calfRightCm: calfCm,
      notes
    };
    onAddRecord(newRec);
    setShowAddForm(false);
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#f2f2f2]">
        
        {/* Modal Header */}
        <div className="p-4 bg-[#1c1c21] border-b border-[rgba(242,242,242,0.1)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#141417] border border-[rgba(242,242,242,0.1)] flex items-center justify-center text-[#ff6b00]">
              <Activity className="w-4 h-4 text-[#ff6b00]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#f2f2f2] flex items-center gap-2">
                <span>EVALUACIÓN ANTROPOMÉTRICA & EVOLUCIÓN</span>
              </h2>
              <p className="text-xs text-[rgba(242,242,242,0.6)] font-medium">
                Historial de: <span className="text-[#ff6b00] font-bold">{student.fullName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] font-bold text-xs rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Medición</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#141417] hover:bg-[#26262b] text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2] transition-colors cursor-pointer border border-[rgba(242,242,242,0.1)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar">
          
          {/* Latest Summary Cards */}
          {latestRecord && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#1c1c21] p-3.5 rounded-xl border border-[rgba(242,242,242,0.1)]">
                <span className="text-[11px] font-bold text-[rgba(242,242,242,0.6)] flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-[#ff6b00]" />
                  <span>Peso Actual</span>
                </span>
                <div className="mt-1">
                  <span className="text-xl font-bold text-[#f2f2f2]">{latestRecord.weightKg}</span>
                  <span className="text-xs text-[rgba(242,242,242,0.5)] ml-1">kg</span>
                </div>
                {initialRecord && initialRecord !== latestRecord && (
                  <span className={`text-[10px] font-bold mt-1 flex items-center gap-0.5 ${
                    latestRecord.weightKg < initialRecord.weightKg ? 'text-[#22c55e]' : 'text-[#ff6b00]'
                  }`}>
                    {latestRecord.weightKg < initialRecord.weightKg ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                    {(latestRecord.weightKg - initialRecord.weightKg).toFixed(1)} kg desde inicio
                  </span>
                )}
              </div>

              <div className="bg-[#1c1c21] p-3.5 rounded-xl border border-[rgba(242,242,242,0.1)]">
                <span className="text-[11px] font-bold text-[rgba(242,242,242,0.6)] flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-[#ff6b00]" />
                  <span>% Grasa Corporal</span>
                </span>
                <div className="mt-1">
                  <span className="text-xl font-bold text-[#ff6b00]">{latestRecord.bodyFatPct || 14.1}%</span>
                </div>
                <span className="text-[10px] text-[rgba(242,242,242,0.5)] mt-1 block font-medium">
                  Composición atlética
                </span>
              </div>

              <div className="bg-[#1c1c21] p-3.5 rounded-xl border border-[rgba(242,242,242,0.1)]">
                <span className="text-[11px] font-bold text-[rgba(242,242,242,0.6)] flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5 text-[#ff6b00]" />
                  <span>Cintura</span>
                </span>
                <div className="mt-1">
                  <span className="text-xl font-bold text-[#ff6b00]">{latestRecord.waistCm}</span>
                  <span className="text-xs text-[rgba(242,242,242,0.5)] ml-1">cm</span>
                </div>
                <span className="text-[10px] text-[#22c55e] font-bold mt-1 block">
                  Reducción controlada
                </span>
              </div>

              <div className="bg-[#1c1c21] p-3.5 rounded-xl border border-[rgba(242,242,242,0.1)]">
                <span className="text-[11px] font-bold text-[rgba(242,242,242,0.6)] flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-[#ff6b00]" />
                  <span>Brazo Contraído</span>
                </span>
                <div className="mt-1">
                  <span className="text-xl font-bold text-[#f2f2f2]">{latestRecord.armRightCm}</span>
                  <span className="text-xs text-[rgba(242,242,242,0.5)] ml-1">cm</span>
                </div>
                <span className="text-[10px] text-[#22c55e] font-bold mt-1 block">
                  Perímetro muscular
                </span>
              </div>
            </div>
          )}

          {/* New Measurement Form Drawer */}
          {showAddForm && (
            <form onSubmit={handleSubmitNew} className="p-4 bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] space-y-3">
              <div className="flex items-center justify-between border-b border-[rgba(242,242,242,0.1)] pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#f2f2f2]">
                  Registrar Nueva Evaluación Corporal
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2] cursor-pointer"
                >
                  Cerrar
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <label className="block text-[rgba(242,242,242,0.6)] font-medium mb-1">Fecha</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg p-2 text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                  />
                </div>
                <div>
                  <label className="block text-[rgba(242,242,242,0.6)] font-medium mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg p-2 text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                  />
                </div>
                <div>
                  <label className="block text-[rgba(242,242,242,0.6)] font-medium mb-1">% Grasa</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bodyFatPct}
                    onChange={(e) => setBodyFatPct(Number(e.target.value))}
                    className="w-full bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg p-2 text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                  />
                </div>
                <div>
                  <label className="block text-[rgba(242,242,242,0.6)] font-medium mb-1">Masa Magra (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={muscleMassKg}
                    onChange={(e) => setMuscleMassKg(Number(e.target.value))}
                    className="w-full bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg p-2 text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                  />
                </div>

                <div>
                  <label className="block text-[rgba(242,242,242,0.6)] font-medium mb-1">Pecho (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={chestCm}
                    onChange={(e) => setChestCm(Number(e.target.value))}
                    className="w-full bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg p-2 text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                  />
                </div>
                <div>
                  <label className="block text-[rgba(242,242,242,0.6)] font-medium mb-1">Cintura (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={waistCm}
                    onChange={(e) => setWaistCm(Number(e.target.value))}
                    className="w-full bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg p-2 text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                  />
                </div>
                <div>
                  <label className="block text-[rgba(242,242,242,0.6)] font-medium mb-1">Cadera (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={hipCm}
                    onChange={(e) => setHipCm(Number(e.target.value))}
                    className="w-full bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg p-2 text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                  />
                </div>
                <div>
                  <label className="block text-[rgba(242,242,242,0.6)] font-medium mb-1">Brazo (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={armCm}
                    onChange={(e) => setArmCm(Number(e.target.value))}
                    className="w-full bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg p-2 text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[rgba(242,242,242,0.6)] font-medium mb-1 text-xs">Notas y Observaciones</label>
                <input
                  type="text"
                  placeholder="Ej: Pliegues controlados, buena adherencia..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg p-2 text-xs text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Guardar Evaluación
                </button>
              </div>
            </form>
          )}

          {/* Historical Logs Table */}
          <div className="bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] overflow-hidden shadow-xs">
            <div className="p-3 bg-[#141417] border-b border-[rgba(242,242,242,0.1)] flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#f2f2f2]">
                Historial de Evaluaciones y Perímetros
              </span>
              <span className="text-xs text-[rgba(242,242,242,0.5)] font-medium">
                {history.length} registros
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#f2f2f2]">
                <thead className="bg-[#141417] text-[10px] font-bold text-[rgba(242,242,242,0.5)] uppercase border-b border-[rgba(242,242,242,0.1)] tracking-wider">
                  <tr>
                    <th className="p-2.5">Fecha</th>
                    <th className="p-2.5">Peso</th>
                    <th className="p-2.5">% Grasa</th>
                    <th className="p-2.5">Pecho</th>
                    <th className="p-2.5">Cintura</th>
                    <th className="p-2.5">Cadera</th>
                    <th className="p-2.5">Brazo</th>
                    <th className="p-2.5">Muslo</th>
                    <th className="p-2.5">Notas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(242,242,242,0.1)]">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-4 text-center text-[rgba(242,242,242,0.5)]">
                        No hay evaluaciones registradas aún.
                      </td>
                    </tr>
                  ) : (
                    history.map((rec) => (
                      <tr key={rec.id} className="hover:bg-[#141417] transition-colors">
                        <td className="p-2.5 font-bold text-[#f2f2f2] flex items-center gap-1 font-mono-code">
                          <Calendar className="w-3 h-3 text-[#ff6b00]" />
                          <span>{rec.date}</span>
                        </td>
                        <td className="p-2.5 font-bold text-[#f2f2f2]">{rec.weightKg} kg</td>
                        <td className="p-2.5 text-[#ff6b00] font-semibold">{rec.bodyFatPct ? `${rec.bodyFatPct}%` : '-'}</td>
                        <td className="p-2.5">{rec.chestCm} cm</td>
                        <td className="p-2.5 text-[#22c55e] font-semibold">{rec.waistCm} cm</td>
                        <td className="p-2.5">{rec.hipCm} cm</td>
                        <td className="p-2.5 text-[#ff6b00] font-semibold">{rec.armRightCm} cm</td>
                        <td className="p-2.5">{rec.thighRightCm} cm</td>
                        <td className="p-2.5 text-[11px] text-[rgba(242,242,242,0.5)] truncate max-w-xs">{rec.notes || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
