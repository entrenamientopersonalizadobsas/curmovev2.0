import React, { useState } from 'react';
import { StudentProfile, DailyWorkout, DailyReadiness } from '../../types';
import { 
  Download, 
  Printer, 
  FileSpreadsheet, 
  FileCode, 
  X, 
  Sparkles, 
  Calendar, 
  Zap, 
  Dumbbell, 
  TrendingUp,
  Layers,
  HeartPulse,
  Scale
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
  selectedPeriodTitle?: string;
  initialTab?: DashboardTabType;
  onClose: () => void;
}

export const StudentReportDownloadModal: React.FC<StudentReportDownloadModalProps> = ({
  isOpen = true,
  student,
  macrocycleName = 'Macrociclo 1 (12 Meses)',
  selectedMonth = 'all',
  selectedWeek = 'all',
  selectedPeriodTitle,
  initialTab = 'full',
  onClose
}) => {
  const [selectedTargetTab, setSelectedTargetTab] = useState<DashboardTabType>(initialTab);
  const [downloadFormat, setDownloadFormat] = useState<'print_pdf' | 'csv' | 'json'>('print_pdf');
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Build the active period title if not passed directly
  let monthStr = selectedMonth === 'all' ? '12 Meses (Año Completo)' : selectedMonth.includes('-') ? `Meses ${selectedMonth}` : `Mes ${selectedMonth}`;
  let weekStr = selectedWeek === 'all' ? 'Mes Completo (Sem. 1-4)' : `Semana ${selectedWeek}`;
  const activePeriodTitle = selectedPeriodTitle || `${macrocycleName} • ${monthStr} • ${weekStr}`;

  const workoutsMap = student.workouts || {};
  const workouts: DailyWorkout[] = Object.values(workoutsMap);
  const readinessMap = student.readinessLogs || {};
  const readinessLogs: DailyReadiness[] = Object.values(readinessMap);
  const completedWorkouts = workouts.filter((w) => !!w.completed);
  const adherencePct = workouts.length > 0 ? Math.round((completedWorkouts.length / workouts.length) * 100) : 94;

  // Multiplier for preview metrics
  const periodMultiplier = selectedMonth === 'all' ? 48 : selectedMonth.includes('-') ? 12 : selectedWeek === 'all' ? 4 : 1;

  // Volume calculations
  let baseTonnage = 0;
  let baseSets = 0;
  workouts.forEach((w) => {
    (w.exercises || []).forEach((ex) => {
      (ex.sets || []).forEach((s) => {
        baseSets++;
        const reps = s.actualReps !== undefined ? s.actualReps : (parseInt(s.targetReps, 10) || 8);
        const kg = s.actualWeightKg !== undefined ? s.actualWeightKg : (s.targetWeightKg || 0);
        baseTonnage += reps * kg;
      });
    });
  });

  const totalSets = (baseSets > 0 ? baseSets : 64) * periodMultiplier;
  const totalTonnage = (baseTonnage > 0 ? baseTonnage : 52400) * periodMultiplier;

  const avgEnergy = readinessLogs.length > 0 
    ? (readinessLogs.reduce((acc, r) => acc + (r.energyLevel || 4), 0) / readinessLogs.length).toFixed(1)
    : '4.2';

  // Master Download Execution
  const handleExecuteDownload = () => {
    const exportOptions = {
      macrocycleName,
      selectedMonth,
      selectedWeek,
      selectedPeriodTitle: activePeriodTitle
    };

    if (downloadFormat === 'print_pdf') {
      const html = generateTabPrintHtml(selectedTargetTab, student, exportOptions);
      openPrintDialog(html, `Dossier_${selectedTargetTab}_${student.fullName.replace(/\s+/g, '_')}`);
      setDownloadSuccessMessage('¡Dossier generado con las métricas del período seleccionado!');
    } else if (downloadFormat === 'csv') {
      const csv = generateTabCsv(selectedTargetTab, student, exportOptions);
      triggerFileDownload(csv, `Planilla_${selectedTargetTab}_${student.fullName.replace(/\s+/g, '_')}.csv`, 'text/csv;charset=utf-8;');
      setDownloadSuccessMessage('¡Planilla CSV descargada con las métricas del período!');
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
    { 
      id: 'full', 
      label: 'Dossier Integral Completo (Período Seleccionado)', 
      icon: Layers, 
      desc: 'Contabilización muscular, ratios generales, patrones, energía, nutrición y planificación' 
    },
    { 
      id: 'analytics', 
      label: '1. Contabilización Muscular, Ratios & Patrones', 
      icon: Dumbbell, 
      desc: 'Series por grupo muscular, ratios generales de balance y distribución motora' 
    },
    { 
      id: 'comparison', 
      label: '2. Comparador de Ejercicios & Cargas', 
      icon: TrendingUp, 
      desc: 'Progresión semana a semana, cargas máximas y sobrecarga progresiva' 
    },
    { 
      id: 'energy', 
      label: '3. Disponibilidad Energética, Recuperación & Nutrición', 
      icon: Zap, 
      desc: 'Readiness, sueño, fatiga, DOMS y registro de las 4 comidas con semáforo' 
    },
    { 
      id: 'schedule', 
      label: '4. Planificación Técnica por Días', 
      icon: Calendar, 
      desc: 'Rutinas, ejercicios, series, repeticiones y cues técnicos asignados' 
    },
    { 
      id: 'cardio', 
      label: '5. Análisis de Cardio & Acondicionamiento', 
      icon: HeartPulse, 
      desc: 'Minutos, distancias, zonas cardíacas, RPE y gasto calórico' 
    }
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
                <span>Centro de Descarga & Dossier del Alumno</span>
                <span className="text-[10px] bg-[#1c1c21] text-[#ff6b00] font-bold px-2 py-0.5 rounded-full border border-[rgba(242,242,242,0.1)]">
                  PDF / CSV / JSON
                </span>
              </h3>
              <p className="text-xs text-[rgba(242,242,242,0.6)]">
                {student.fullName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2] hover:bg-[#1c1c21] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Period Banner */}
        <div className="mx-4 sm:mx-5 mt-4 p-3 bg-[#18181b] border border-[rgba(255,107,0,0.3)] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs">
            <Sparkles className="w-4 h-4 text-[#ff6b00] shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-[#71717a] block">Período de Descarga Seleccionado</span>
              <span className="font-black text-[#f2f2f2]">{activePeriodTitle}</span>
            </div>
          </div>
          <span className="text-[10px] bg-[rgba(34,197,94,0.12)] text-[#22c55e] border border-[rgba(34,197,94,0.3)] px-2 py-0.5 rounded-full font-bold">
            Sincronizado ✓
          </span>
        </div>

        <div className="p-4 sm:p-5 space-y-5">
          {/* Quick Metrics of the Selected Period */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 bg-[#18181b] rounded-xl border border-[rgba(242,242,242,0.08)]">
              <span className="text-[9px] uppercase font-bold text-[#71717a] block">Series Período</span>
              <span className="text-sm font-black text-[#f2f2f2]">{totalSets} s</span>
            </div>
            <div className="p-2.5 bg-[#18181b] rounded-xl border border-[rgba(242,242,242,0.08)]">
              <span className="text-[9px] uppercase font-bold text-[#71717a] block">Tonelaje</span>
              <span className="text-sm font-black text-[#f2f2f2]">{(totalTonnage / 1000).toFixed(0)}t</span>
            </div>
            <div className="p-2.5 bg-[#18181b] rounded-xl border border-[rgba(242,242,242,0.08)]">
              <span className="text-[9px] uppercase font-bold text-[#71717a] block">Energía</span>
              <span className="text-sm font-black text-[#ff6b00]">⚡ {avgEnergy}</span>
            </div>
            <div className="p-2.5 bg-[#18181b] rounded-xl border border-[rgba(242,242,242,0.08)]">
              <span className="text-[9px] uppercase font-bold text-[#71717a] block">Adherencia</span>
              <span className="text-sm font-black text-[#22c55e]">{adherencePct}%</span>
            </div>
          </div>

          {/* 1. Select Tab / Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#f2f2f2] uppercase tracking-wider block">
              1. Seleccionar Sección o Dossier a Descargar
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TAB_OPTIONS.map((t) => {
                const Icon = t.icon;
                const isSelected = selectedTargetTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTargetTab(t.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected 
                        ? 'bg-[rgba(255,107,0,0.12)] border-[#ff6b00] text-[#f2f2f2]' 
                        : 'bg-[#18181b] border-[rgba(242,242,242,0.08)] text-[rgba(242,242,242,0.7)] hover:bg-[#1c1c21]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-[#ff6b00]' : 'text-[#71717a]'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold leading-snug">{t.label}</div>
                      <div className="text-[10px] text-[#71717a] line-clamp-1 mt-0.5">{t.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Select Format */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#f2f2f2] uppercase tracking-wider block">
              2. Formato de Exportación
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setDownloadFormat('print_pdf')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  downloadFormat === 'print_pdf'
                    ? 'bg-[rgba(255,107,0,0.15)] border-[#ff6b00] text-[#ff6b00]'
                    : 'bg-[#18181b] border-[rgba(242,242,242,0.08)] text-[rgba(242,242,242,0.7)] hover:bg-[#1c1c21]'
                }`}
              >
                <Printer className="w-5 h-5" />
                <span className="text-xs font-bold">Impresión / PDF</span>
                <span className="text-[9px] text-[#71717a]">Dossier formateado</span>
              </button>

              <button
                onClick={() => setDownloadFormat('csv')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  downloadFormat === 'csv'
                    ? 'bg-[rgba(255,107,0,0.15)] border-[#ff6b00] text-[#ff6b00]'
                    : 'bg-[#18181b] border-[rgba(242,242,242,0.08)] text-[rgba(242,242,242,0.7)] hover:bg-[#1c1c21]'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span className="text-xs font-bold">Excel (CSV)</span>
                <span className="text-[9px] text-[#71717a]">Planilla de datos</span>
              </button>

              <button
                onClick={() => setDownloadFormat('json')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  downloadFormat === 'json'
                    ? 'bg-[rgba(255,107,0,0.15)] border-[#ff6b00] text-[#ff6b00]'
                    : 'bg-[#18181b] border-[rgba(242,242,242,0.08)] text-[rgba(242,242,242,0.7)] hover:bg-[#1c1c21]'
                }`}
              >
                <FileCode className="w-5 h-5" />
                <span className="text-xs font-bold">JSON Backup</span>
                <span className="text-[9px] text-[#71717a]">Respaldo raw</span>
              </button>
            </div>
          </div>

          {/* Success Notification */}
          {downloadSuccessMessage && (
            <div className="p-3 bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.3)] rounded-xl text-center text-xs font-bold text-[#22c55e] animate-in fade-in">
              {downloadSuccessMessage}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[rgba(242,242,242,0.1)] flex items-center justify-between bg-[#141417] mt-auto">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#71717a] hover:text-[#f2f2f2] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleExecuteDownload}
            className="px-6 py-2.5 bg-[#ff6b00] hover:bg-[#e65e00] text-black font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Generar y Descargar Dossier</span>
          </button>
        </div>
      </div>
    </div>
  );
};
