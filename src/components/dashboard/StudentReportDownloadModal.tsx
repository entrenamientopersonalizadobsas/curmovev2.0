import React, { useState } from 'react';
import { StudentProfile, DailyWorkout, DailyReadiness } from '../../types';
import { 
  Download, 
  Printer, 
  FileSpreadsheet, 
  FileCode, 
  FileText, 
  X, 
  Check, 
  Sparkles, 
  User, 
  Calendar, 
  Activity, 
  Zap, 
  Dumbbell, 
  TrendingUp,
  Award,
  Layers,
  HeartPulse,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { 
  DashboardTabType, 
  generateTabPrintHtml, 
  generateTabCsv, 
  openPrintDialog, 
  triggerFileDownload 
} from '../../utils/dashboardExportUtils';

interface StudentReportDownloadModalProps {
  isOpen?: boolean;
  student: StudentProfile;
  macrocycleName?: string;
  selectedMonth?: string;
  selectedWeek?: string;
  initialTab?: DashboardTabType;
  onClose: () => void;
}

export const StudentReportDownloadModal: React.FC<StudentReportDownloadModalProps> = ({
  isOpen = true,
  student,
  macrocycleName = 'Macrociclo 1 (12 Meses)',
  selectedMonth = 'all',
  selectedWeek = 'all',
  initialTab = 'full',
  onClose
}) => {
  const [selectedTargetTab, setSelectedTargetTab] = useState<DashboardTabType>(initialTab);
  const [downloadFormat, setDownloadFormat] = useState<'print_pdf' | 'csv' | 'json'>('print_pdf');
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const workoutsMap = student.workouts || {};
  const workouts: DailyWorkout[] = Object.values(workoutsMap);
  const readinessMap = student.readinessLogs || {};
  const readinessLogs: DailyReadiness[] = Object.values(readinessMap);
  const completedWorkouts = workouts.filter((w) => !!w.completed);
  const adherencePct = workouts.length > 0 ? Math.round((completedWorkouts.length / workouts.length) * 100) : 0;

  // Cardio summary
  const allCardio = workouts.flatMap(w => w.cardio || []);
  const totalCardioMinutes = allCardio.reduce((acc, c) => acc + (c.durationMinutes || 0), 0);
  const totalCardioKm = allCardio.reduce((acc, c) => acc + (c.distanceKm || 0), 0);

  // Volume calculations
  let totalTonnage = 0;
  let totalSets = 0;
  workouts.forEach((w) => {
    (w.exercises || []).forEach((ex) => {
      (ex.sets || []).forEach((s) => {
        totalSets++;
        const reps = s.actualReps !== undefined ? s.actualReps : (parseInt(s.targetReps, 10) || 8);
        const kg = s.actualWeightKg !== undefined ? s.actualWeightKg : (s.targetWeightKg || 0);
        totalTonnage += reps * kg;
      });
    });
  });

  const avgEnergy = readinessLogs.length > 0 
    ? (readinessLogs.reduce((acc, r) => acc + (r.energyLevel || 3), 0) / readinessLogs.length).toFixed(1)
    : '4.2';

  // Master Download Execution
  const handleExecuteDownload = () => {
    if (downloadFormat === 'print_pdf') {
      const html = generateTabPrintHtml(selectedTargetTab, student, { macrocycleName });
      openPrintDialog(html, `Reporte_${selectedTargetTab}_${student.fullName}`);
      setDownloadSuccessMessage('¡Documento de impresión generado con éxito!');
    } else if (downloadFormat === 'csv') {
      const csv = generateTabCsv(selectedTargetTab, student);
      triggerFileDownload(csv, `Planilla_${selectedTargetTab}_${student.fullName.replace(/\s+/g, '_')}.csv`, 'text/csv;charset=utf-8;');
      setDownloadSuccessMessage('¡Planilla CSV descargada para Excel!');
    } else if (downloadFormat === 'json') {
      const jsonStr = JSON.stringify(student, null, 2);
      triggerFileDownload(jsonStr, `Respaldo_${student.fullName.replace(/\s+/g, '_')}.json`, 'application/json;charset=utf-8;');
      setDownloadSuccessMessage('¡Respaldo JSON descargado con éxito!');
    }

    setTimeout(() => {
      setDownloadSuccessMessage(null);
    }, 3000);
  };

  const TAB_OPTIONS: Array<{ id: DashboardTabType; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }> = [
    { id: 'full', label: 'Dossier Integral Completo', icon: Layers, desc: 'Informe ejecutivo de todas las solapas consolidadas' },
    { id: 'analytics', label: '1. Volumen & Ratios Musculares', icon: Dumbbell, desc: 'Series efectivas, balance agonista/antagonista y distribución' },
    { id: 'comparison', label: '2. Comparador de Ejercicios', icon: TrendingUp, desc: 'Progresión semana a semana, cargas máximas y tonelaje' },
    { id: 'energy', label: '3. Energía & Recuperación', icon: Zap, desc: 'Sueño, fatiga, DOMS y readiness score' },
    { id: 'schedule', label: '4. Planificación por Días', icon: Calendar, desc: 'Rutinas, ejercicios, series, repeticiones y cues técnicos' },
    { id: 'cardio', label: '5. Análisis de Cardio', icon: HeartPulse, desc: 'Minutos, distancias, zonas cardíacas, RPE y gasto calórico' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[rgba(242,242,242,0.1)] flex items-center justify-between bg-[#141417] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(255,107,0,0.15)] text-[#ff6b00] border border-[rgba(255,107,0,0.3)] flex items-center justify-center shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#f2f2f2] tracking-tight flex items-center gap-2">
                <span>Centro de Descarga & Reportes del Alumno</span>
                <span className="text-[10px] bg-[#1c1c21] text-[#ff6b00] font-bold px-2 py-0.5 rounded-full border border-[rgba(242,242,242,0.1)]">
                  PDF / CSV / JSON
                </span>
              </h3>
              <p className="text-xs text-[rgba(242,242,242,0.6)]">
                {student.fullName} • {macrocycleName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#1c1c21] text-[rgba(242,242,242,0.6)] hover:text-[#f2f2f2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-5">
          
          {/* Athlete Quick Profile Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] text-center text-xs">
            <div>
              <span className="text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] block">Adherencia</span>
              <span className="font-black text-[#22c55e]">{adherencePct}%</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] block">Tonelaje Total</span>
              <span className="font-black text-[#f2f2f2]">{(totalTonnage / 1000).toFixed(1)}k kg</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] block">Energía ⚡</span>
              <span className="font-black text-[#ff6b00]">{avgEnergy}/5</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] block">Cardio Acumulado</span>
              <span className="font-black text-[#ff6b00]">{totalCardioMinutes} min</span>
            </div>
          </div>

          {/* STEP 1: SELECT SPECIFIC TAB OR FULL DOSSIER */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-[#f2f2f2] flex items-center justify-between">
              <span>1. Selecciona la Solapa que deseas descargar:</span>
              <span className="text-[10px] text-[rgba(242,242,242,0.5)] font-normal">Descarga individual o completa</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TAB_OPTIONS.map((opt) => {
                const isSelected = selectedTargetTab === opt.id;
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedTargetTab(opt.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#1c1c21] border-[#ff6b00] text-[#f2f2f2] shadow-xs ring-1 ring-[#ff6b00]/30'
                        : 'bg-[#1c1c21] border-[rgba(242,242,242,0.1)] text-[rgba(242,242,242,0.6)] hover:text-[#f2f2f2] hover:bg-[#26262b]'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      isSelected ? 'bg-[#ff6b00] text-[#ffffff]' : 'bg-[#0c0c0e] text-[rgba(242,242,242,0.6)]'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#f2f2f2] truncate flex items-center gap-1.5">
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#ff6b00]" />}
                      </div>
                      <p className="text-[10px] text-[rgba(242,242,242,0.5)] line-clamp-1 mt-0.5">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: SELECT EXPORT FORMAT */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-[#f2f2f2] block">
              2. Selecciona el Formato de Descarga:
            </label>

            <div className="grid grid-cols-3 gap-2.5">
              
              {/* PDF / Print */}
              <button
                onClick={() => setDownloadFormat('print_pdf')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  downloadFormat === 'print_pdf'
                    ? 'bg-[#1c1c21] border-[#ff6b00] text-[#f2f2f2] shadow-xs ring-1 ring-[#ff6b00]/30'
                    : 'bg-[#1c1c21] border-[rgba(242,242,242,0.1)] text-[rgba(242,242,242,0.6)] hover:text-[#f2f2f2] hover:bg-[#26262b]'
                }`}
              >
                <Printer className={`w-5 h-5 mx-auto mb-1.5 ${downloadFormat === 'print_pdf' ? 'text-[#ff6b00]' : 'text-[rgba(242,242,242,0.5)]'}`} />
                <div className="text-xs font-bold text-[#f2f2f2]">Imprimir / PDF</div>
                <div className="text-[9px] text-[rgba(242,242,242,0.5)] mt-0.5">A4 formateado</div>
              </button>

              {/* CSV Excel */}
              <button
                onClick={() => setDownloadFormat('csv')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  downloadFormat === 'csv'
                    ? 'bg-[#1c1c21] border-[#22c55e] text-[#f2f2f2] shadow-xs ring-1 ring-[#22c55e]/30'
                    : 'bg-[#1c1c21] border-[rgba(242,242,242,0.1)] text-[rgba(242,242,242,0.6)] hover:text-[#f2f2f2] hover:bg-[#26262b]'
                }`}
              >
                <FileSpreadsheet className={`w-5 h-5 mx-auto mb-1.5 ${downloadFormat === 'csv' ? 'text-[#22c55e]' : 'text-[rgba(242,242,242,0.5)]'}`} />
                <div className="text-xs font-bold text-[#f2f2f2]">Planilla CSV</div>
                <div className="text-[9px] text-[rgba(242,242,242,0.5)] mt-0.5">Para Excel / Sheets</div>
              </button>

              {/* JSON Backup */}
              <button
                onClick={() => setDownloadFormat('json')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  downloadFormat === 'json'
                    ? 'bg-[#1c1c21] border-[#ff6b00] text-[#f2f2f2] shadow-xs ring-1 ring-[#ff6b00]/30'
                    : 'bg-[#1c1c21] border-[rgba(242,242,242,0.1)] text-[rgba(242,242,242,0.6)] hover:text-[#f2f2f2] hover:bg-[#26262b]'
                }`}
              >
                <FileCode className={`w-5 h-5 mx-auto mb-1.5 ${downloadFormat === 'json' ? 'text-[#ff6b00]' : 'text-[rgba(242,242,242,0.5)]'}`} />
                <div className="text-xs font-bold text-[#f2f2f2]">Respaldo JSON</div>
                <div className="text-[9px] text-[rgba(242,242,242,0.5)] mt-0.5">Datos estructurados</div>
              </button>

            </div>
          </div>

          {/* Success Banner */}
          {downloadSuccessMessage && (
            <div className="p-3 bg-[rgba(34,197,94,0.12)] rounded-xl border border-[rgba(34,197,94,0.25)] text-xs text-[#22c55e] flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{downloadSuccessMessage}</span>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[rgba(242,242,242,0.1)] bg-[#141417] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1c1c21] hover:bg-[#26262b] text-[rgba(242,242,242,0.7)] hover:text-[#f2f2f2] font-bold text-xs rounded-xl border border-[rgba(242,242,242,0.1)] cursor-pointer"
          >
            Cancelar
          </button>

          <button
            id="btn-confirm-download"
            onClick={handleExecuteDownload}
            className="px-6 py-2 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] font-black text-xs rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition-all hover:scale-[1.02]"
          >
            {downloadFormat === 'print_pdf' ? (
              <>
                <Printer className="w-4 h-4" />
                <span>Generar Documento / Imprimir</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Descargar Archivo ({downloadFormat.toUpperCase()})</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
