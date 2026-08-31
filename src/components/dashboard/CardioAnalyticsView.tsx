import React, { useState, useMemo } from 'react';
import { StudentProfile, DailyWorkout, CardioSession, CardioType } from '../../types';
import { 
  Flame, 
  HeartPulse, 
  Timer, 
  Gauge, 
  Footprints, 
  Bike, 
  Zap, 
  TrendingUp, 
  Calendar, 
  Filter, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Activity,
  Info,
  Sparkles
} from 'lucide-react';
import { 
  generateTabPrintHtml, 
  generateTabCsv, 
  openPrintDialog, 
  triggerFileDownload 
} from '../../utils/dashboardExportUtils';

interface CardioAnalyticsViewProps {
  student: StudentProfile;
  selectedMonth?: string;
  selectedWeek?: string;
  onOpenDownloadModal?: () => void;
}

export const CardioAnalyticsView: React.FC<CardioAnalyticsViewProps> = ({
  student,
  selectedMonth = 'all',
  selectedWeek = 'all',
  onOpenDownloadModal
}) => {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<CardioType | 'all'>('all');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const workoutsMap = student.workouts || {};
  const allWorkouts: DailyWorkout[] = useMemo(() => Object.values(workoutsMap), [workoutsMap]);

  // Extract all cardio sessions with their associated workout date and title
  const rawCardioSessions = useMemo(() => {
    const list: Array<CardioSession & { workoutDate: string; dayName: string; workoutTitle: string; workoutCompleted: boolean }> = [];
    allWorkouts.forEach((w) => {
      if (w.cardio && w.cardio.length > 0) {
        w.cardio.forEach((c) => {
          list.push({
            ...c,
            workoutDate: w.date,
            dayName: w.dayName,
            workoutTitle: w.title,
            workoutCompleted: !!w.completed
          });
        });
      }
    });
    // Sort descending by date
    return list.sort((a, b) => b.workoutDate.localeCompare(a.workoutDate));
  }, [allWorkouts]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    let totalMinutes = 0;
    let totalKm = 0;
    let totalKcal = 0;
    let rpeSum = 0;
    let rpeCount = 0;
    let completedCount = 0;

    const byType: Record<CardioType, { minutes: number; count: number; km: number }> = {
      bici: { minutes: 0, count: 0, km: 0 },
      caminadora: { minutes: 0, count: 0, km: 0 },
      eliptico: { minutes: 0, count: 0, km: 0 },
      otro: { minutes: 0, count: 0, km: 0 }
    };

    const zones: Record<string, number> = {
      'Zona 1-2 (LISS)': 0,
      'Zona 3 (Tempo)': 0,
      'Zona 4-5 (HIIT)': 0
    };

    rawCardioSessions.forEach((s) => {
      totalMinutes += s.durationMinutes || 0;
      totalKm += s.distanceKm || 0;
      totalKcal += s.caloriesKcal || 0;
      if (s.completed) completedCount++;

      if (s.rpe) {
        rpeSum += s.rpe;
        rpeCount++;
      }

      const typeKey = s.type in byType ? s.type : 'otro';
      byType[typeKey].minutes += s.durationMinutes || 0;
      byType[typeKey].count += 1;
      byType[typeKey].km += s.distanceKm || 0;

      // Classify Zone based on RPE
      const rpe = s.rpe || 6;
      if (rpe <= 6.5) {
        zones['Zona 1-2 (LISS)'] += s.durationMinutes || 0;
      } else if (rpe <= 8) {
        zones['Zona 3 (Tempo)'] += s.durationMinutes || 0;
      } else {
        zones['Zona 4-5 (HIIT)'] += s.durationMinutes || 0;
      }
    });

    const avgRpe = rpeCount > 0 ? (rpeSum / rpeCount).toFixed(1) : '6.5';
    const adherence = rawCardioSessions.length > 0 ? Math.round((completedCount / rawCardioSessions.length) * 100) : 0;

    return {
      totalMinutes,
      totalKm: parseFloat(totalKm.toFixed(1)),
      totalKcal,
      avgRpe,
      adherence,
      completedCount,
      totalSessions: rawCardioSessions.length,
      byType,
      zones
    };
  }, [rawCardioSessions]);

  // Filtered Sessions List
  const filteredSessions = useMemo(() => {
    return rawCardioSessions.filter((s) => {
      if (selectedTypeFilter !== 'all' && s.type !== selectedTypeFilter) return false;
      if (selectedZoneFilter !== 'all') {
        const rpe = s.rpe || 6;
        if (selectedZoneFilter === 'liss' && rpe > 6.5) return false;
        if (selectedZoneFilter === 'tempo' && (rpe <= 6.5 || rpe > 8)) return false;
        if (selectedZoneFilter === 'hiit' && rpe <= 8) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchNotes = (s.notes || '').toLowerCase().includes(q);
        const matchDate = s.workoutDate.includes(q);
        if (!matchName && !matchNotes && !matchDate) return false;
      }
      return true;
    });
  }, [rawCardioSessions, selectedTypeFilter, selectedZoneFilter, searchQuery]);

  // Monthly / Weekly Evolution aggregation
  const weeklyAggregation = useMemo(() => {
    const weeksMap: Record<string, { weekLabel: string; minutes: number; km: number; sessions: number }> = {};
    
    // Sort ascending for chronology
    const sorted = [...rawCardioSessions].reverse();
    sorted.forEach((s, idx) => {
      const weekNum = Math.floor(idx / 4) + 1;
      const key = `Sem ${weekNum}`;
      if (!weeksMap[key]) {
        weeksMap[key] = { weekLabel: key, minutes: 0, km: 0, sessions: 0 };
      }
      weeksMap[key].minutes += s.durationMinutes || 0;
      weeksMap[key].km += s.distanceKm || 0;
      weeksMap[key].sessions += 1;
    });

    return Object.values(weeksMap).slice(-8); // last 8 weeks
  }, [rawCardioSessions]);

  // Download handlers
  const handlePrintCardio = () => {
    const html = generateTabPrintHtml('cardio', student);
    openPrintDialog(html, `Cardio_Reporte_${student.fullName}`);
  };

  const handleDownloadCsv = () => {
    const csv = generateTabCsv('cardio', student);
    triggerFileDownload(csv, `Cardio_${student.fullName.replace(/\s+/g, '_')}.csv`, 'text/csv;charset=utf-8;');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">

      {/* Top Header & Fast Action Toolbar */}
      <div className="bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.1)] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(255,107,0,0.12)] text-[#ff6b00] border border-[rgba(255,107,0,0.3)] flex items-center justify-center shrink-0">
            <HeartPulse className="w-5 h-5 fill-[#ff6b00]/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-[#f2f2f2] tracking-tight">
                Análisis de Cardio & Acondicionamiento Físico
              </h3>
              <span className="text-[10px] bg-[#1c1c21] text-[#ff6b00] font-bold px-2 py-0.5 rounded-full border border-[rgba(242,242,242,0.1)]">
                Aeróbico & LISS / HIIT
              </span>
            </div>
            <p className="text-xs text-[rgba(242,242,242,0.6)] mt-0.5">
              Control de volumen cardiovascular, distancias, gasto calórico y preservación de masa magra.
            </p>
          </div>
        </div>

        {/* Action Buttons: Individual Download & Print for this Tab */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-print-cardio-tab"
            onClick={handlePrintCardio}
            title="Imprimir o Guardar PDF de esta Solapa"
            className="px-3 py-1.5 bg-[#1c1c21] hover:bg-[#26262b] text-[rgba(242,242,242,0.8)] hover:text-[#f2f2f2] font-bold text-xs rounded-xl border border-[rgba(242,242,242,0.1)] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#ff6b00]" />
            <span>Imprimir Solapa</span>
          </button>

          <button
            id="btn-csv-cardio-tab"
            onClick={handleDownloadCsv}
            title="Descargar Planilla CSV de Cardio para Excel"
            className="px-3 py-1.5 bg-[#1c1c21] hover:bg-[#26262b] text-[rgba(242,242,242,0.8)] hover:text-[#f2f2f2] font-bold text-xs rounded-xl border border-[rgba(242,242,242,0.1)] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#22c55e]" />
            <span>Descargar CSV</span>
          </button>

          {onOpenDownloadModal && (
            <button
              onClick={onOpenDownloadModal}
              title="Abrir Centro de Descargas Global"
              className="px-3 py-1.5 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Dossier Completo</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. 4 CORE METRIC CARDS (MINUTOS, KM, KCAL, RPE) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Minutos Totales */}
        <div className="bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.1)] p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[rgba(242,242,242,0.5)] tracking-wider">Minutos Totales</span>
            <div className="w-7 h-7 rounded-lg bg-[#1c1c21] text-[#ff6b00] flex items-center justify-center">
              <Timer className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-[#f2f2f2] tracking-tight">
              {summaryMetrics.totalMinutes} <span className="text-xs font-bold text-[rgba(242,242,242,0.5)]">min</span>
            </div>
            <div className="text-[11px] text-[#22c55e] font-medium flex items-center gap-1 mt-0.5">
              <span>{Math.round(summaryMetrics.totalMinutes / 60)} hrs totales acumuladas</span>
            </div>
          </div>
        </div>

        {/* Distancia Total Km */}
        <div className="bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.1)] p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[rgba(242,242,242,0.5)] tracking-wider">Distancia Cinta / Running</span>
            <div className="w-7 h-7 rounded-lg bg-[#1c1c21] text-[#22c55e] flex items-center justify-center">
              <Footprints className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-[#22c55e] tracking-tight">
              {summaryMetrics.totalKm} <span className="text-xs font-bold text-[rgba(242,242,242,0.5)]">km</span>
            </div>
            <div className="text-[11px] text-[rgba(242,242,242,0.5)] font-medium mt-0.5">
              {summaryMetrics.byType.caminadora.count} sesiones en caminadora
            </div>
          </div>
        </div>

        {/* Gasto Calórico Estimado */}
        <div className="bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.1)] p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[rgba(242,242,242,0.5)] tracking-wider">Calorías Quemadas</span>
            <div className="w-7 h-7 rounded-lg bg-[#1c1c21] text-[#ff6b00] flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-[#ff6b00] tracking-tight">
              {summaryMetrics.totalKcal.toLocaleString()} <span className="text-xs font-bold text-[rgba(242,242,242,0.5)]">kcal</span>
            </div>
            <div className="text-[11px] text-[rgba(242,242,242,0.5)] font-medium mt-0.5">
              Promedio ~{Math.round(summaryMetrics.totalKcal / (summaryMetrics.totalSessions || 1))} kcal / sesión
            </div>
          </div>
        </div>

        {/* Intensidad Promedio RPE */}
        <div className="bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.1)] p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[rgba(242,242,242,0.5)] tracking-wider">Intensidad Cardio</span>
            <div className="w-7 h-7 rounded-lg bg-[#1c1c21] text-[#ff6b00] flex items-center justify-center">
              <Gauge className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-[#f2f2f2] tracking-tight">
              RPE {summaryMetrics.avgRpe} <span className="text-xs font-bold text-[rgba(242,242,242,0.5)]">/ 10</span>
            </div>
            <div className="text-[11px] text-[#22c55e] font-medium mt-0.5">
              {summaryMetrics.adherence}% Sesiones cumplidas
            </div>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 2. MODALITIES DISTRIBUTION & HEART RATE / INTENSITY ZONES */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Modalidades de Cardio (Col 7) */}
        <div className="lg:col-span-7 bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.1)] p-4 sm:p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[rgba(242,242,242,0.1)] pb-3">
            <div className="flex items-center gap-2">
              <Bike className="w-4 h-4 text-[#ff6b00]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-[#f2f2f2]">
                Desglose por Modalidad de Entrenamiento
              </h4>
            </div>
            <span className="text-[10px] text-[rgba(242,242,242,0.5)]">
              Total {summaryMetrics.totalSessions} sesiones
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Caminadora / Running */}
            <div className="bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[rgba(242,242,242,0.5)]">Caminadora / Cinta</span>
                <Footprints className="w-3.5 h-3.5 text-[#22c55e]" />
              </div>
              <div>
                <div className="text-base font-black text-[#f2f2f2]">
                  {summaryMetrics.byType.caminadora.minutes} min
                </div>
                <div className="text-[10px] text-[#22c55e] font-bold">
                  {summaryMetrics.byType.caminadora.km.toFixed(1)} km ({summaryMetrics.byType.caminadora.count} sesiones)
                </div>
              </div>
              <div className="w-full bg-[#141417] rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-[#22c55e] h-full rounded-full" 
                  style={{ width: `${summaryMetrics.totalMinutes > 0 ? (summaryMetrics.byType.caminadora.minutes / summaryMetrics.totalMinutes) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Bicicleta / Spinning */}
            <div className="bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[rgba(242,242,242,0.5)]">Bicicleta / Spinning</span>
                <Bike className="w-3.5 h-3.5 text-[#ff6b00]" />
              </div>
              <div>
                <div className="text-base font-black text-[#f2f2f2]">
                  {summaryMetrics.byType.bici.minutes} min
                </div>
                <div className="text-[10px] text-[#ff6b00] font-bold">
                  {summaryMetrics.byType.bici.count} sesiones aeróbicas
                </div>
              </div>
              <div className="w-full bg-[#141417] rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-[#ff6b00] h-full rounded-full" 
                  style={{ width: `${summaryMetrics.totalMinutes > 0 ? (summaryMetrics.byType.bici.minutes / summaryMetrics.totalMinutes) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Elíptico / Cross-Trainer */}
            <div className="bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[rgba(242,242,242,0.5)]">Elíptico / Cross</span>
                <Zap className="w-3.5 h-3.5 text-[#ff6b00]" />
              </div>
              <div>
                <div className="text-base font-black text-[#f2f2f2]">
                  {summaryMetrics.byType.eliptico.minutes} min
                </div>
                <div className="text-[10px] text-[#ff6b00] font-bold">
                  {summaryMetrics.byType.eliptico.count} sesiones (Bajo impacto)
                </div>
              </div>
              <div className="w-full bg-[#141417] rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-[#ff6b00] h-full rounded-full" 
                  style={{ width: `${summaryMetrics.totalMinutes > 0 ? (summaryMetrics.byType.eliptico.minutes / summaryMetrics.totalMinutes) * 100 : 0}%` }}
                />
              </div>
            </div>

          </div>

          <div className="p-2.5 bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] text-xs text-[rgba(242,242,242,0.7)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ff6b00] shrink-0" />
            <p className="text-[11px] leading-tight">
              <strong>Estrategia de Interferencia:</strong> El cardio se programa predominantemente en LISS Zona 2 (inclinación/bici) para elevar el gasto calórico sin comprometer la recuperación de la fuerza ni generar daño muscular.
            </p>
          </div>
        </div>

        {/* Zonas de Intensidad & Frecuencia Cardíaca (Col 5) */}
        <div className="lg:col-span-5 bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.1)] p-4 sm:p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[rgba(242,242,242,0.1)] pb-3">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#ff6b00]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-[#f2f2f2]">
                Distribución por Zonas de Intensidad
              </h4>
            </div>
            <span className="text-[10px] text-[#22c55e] font-bold">Biofeedback</span>
          </div>

          <div className="space-y-3">
            
            {/* Zona 1-2 LISS */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#22c55e] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                  Zona 1-2: LISS & Recuperación (RPE ≤ 6.5)
                </span>
                <span className="text-[#f2f2f2]">
                  {summaryMetrics.zones['Zona 1-2 (LISS)']} min ({summaryMetrics.totalMinutes > 0 ? Math.round((summaryMetrics.zones['Zona 1-2 (LISS)'] / summaryMetrics.totalMinutes) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-[#0c0c0e] rounded-full h-2 overflow-hidden border border-[rgba(242,242,242,0.1)]">
                <div 
                  className="bg-[#22c55e] h-full rounded-full transition-all" 
                  style={{ width: `${summaryMetrics.totalMinutes > 0 ? (summaryMetrics.zones['Zona 1-2 (LISS)'] / summaryMetrics.totalMinutes) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Zona 3 Tempo */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#ff6b00] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff6b00]" />
                  Zona 3: Tempo / Steady State (RPE 7-8)
                </span>
                <span className="text-[#f2f2f2]">
                  {summaryMetrics.zones['Zona 3 (Tempo)']} min ({summaryMetrics.totalMinutes > 0 ? Math.round((summaryMetrics.zones['Zona 3 (Tempo)'] / summaryMetrics.totalMinutes) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-[#0c0c0e] rounded-full h-2 overflow-hidden border border-[rgba(242,242,242,0.1)]">
                <div 
                  className="bg-[#ff6b00] h-full rounded-full transition-all" 
                  style={{ width: `${summaryMetrics.totalMinutes > 0 ? (summaryMetrics.zones['Zona 3 (Tempo)'] / summaryMetrics.totalMinutes) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Zona 4-5 HIIT */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#f7768e] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#f7768e]" />
                  Zona 4-5: HIIT / VO2Max (RPE 8.5-10)
                </span>
                <span className="text-[#f2f2f2]">
                  {summaryMetrics.zones['Zona 4-5 (HIIT)']} min ({summaryMetrics.totalMinutes > 0 ? Math.round((summaryMetrics.zones['Zona 4-5 (HIIT)'] / summaryMetrics.totalMinutes) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-[#0c0c0e] rounded-full h-2 overflow-hidden border border-[rgba(242,242,242,0.1)]">
                <div 
                  className="bg-[#f7768e] h-full rounded-full transition-all" 
                  style={{ width: `${summaryMetrics.totalMinutes > 0 ? (summaryMetrics.zones['Zona 4-5 (HIIT)'] / summaryMetrics.totalMinutes) * 100 : 0}%` }}
                />
              </div>
            </div>

          </div>

          <div className="pt-2 border-t border-[rgba(242,242,242,0.1)] flex items-center justify-between text-[10px] text-[rgba(242,242,242,0.5)]">
            <span>Ratio Aeróbico Óptimo</span>
            <span className="text-[#22c55e] font-bold">✓ Preserva Masa Muscular</span>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. EVOLUCIÓN SEMANAL & CRONOGRAMA DE CARDIO */}
      {/* ======================================================== */}
      {weeklyAggregation.length > 0 && (
        <div className="bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.1)] p-4 sm:p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[rgba(242,242,242,0.1)] pb-2.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#22c55e]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-[#f2f2f2]">
                Evolución de Minutos & Kilómetros por Semana
              </h4>
            </div>
            <span className="text-[10px] text-[rgba(242,242,242,0.5)]">Últimas semanas del ciclo</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 pt-2">
            {weeklyAggregation.map((w) => (
              <div key={w.weekLabel} className="bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] p-2.5 text-center flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[#ff6b00] uppercase">{w.weekLabel}</span>
                <div className="my-1.5">
                  <div className="text-sm font-black text-[#f2f2f2]">{w.minutes} <span className="text-[9px] text-[rgba(242,242,242,0.5)]">min</span></div>
                  {w.km > 0 && (
                    <div className="text-[10px] font-bold text-[#22c55e]">{w.km.toFixed(1)} km</div>
                  )}
                </div>
                <span className="text-[9px] text-[rgba(242,242,242,0.5)]">{w.sessions} sesiones</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. TABLA DETALLADA DE SESIONES DE CARDIO */}
      {/* ======================================================== */}
      <div className="bg-[#141417] rounded-2xl border border-[rgba(242,242,242,0.1)] p-4 sm:p-5 space-y-3.5 shadow-sm">
        
        {/* Table Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(242,242,242,0.1)] pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#ff6b00]" />
            <h4 className="text-xs font-black uppercase tracking-wider text-[#f2f2f2]">
              Registro Histórico de Sesiones de Cardio ({filteredSessions.length})
            </h4>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Modalidad Filter */}
            <div className="flex items-center bg-[#0c0c0e] rounded-lg border border-[rgba(242,242,242,0.1)] p-0.5">
              <button
                onClick={() => setSelectedTypeFilter('all')}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                  selectedTypeFilter === 'all' ? 'bg-[#ff6b00] text-[#ffffff]' : 'text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2]'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedTypeFilter('caminadora')}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                  selectedTypeFilter === 'caminadora' ? 'bg-[#ff6b00] text-[#ffffff]' : 'text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2]'
                }`}
              >
                Caminadora
              </button>
              <button
                onClick={() => setSelectedTypeFilter('bici')}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                  selectedTypeFilter === 'bici' ? 'bg-[#ff6b00] text-[#ffffff]' : 'text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2]'
                }`}
              >
                Bicicleta
              </button>
              <button
                onClick={() => setSelectedTypeFilter('eliptico')}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                  selectedTypeFilter === 'eliptico' ? 'bg-[#ff6b00] text-[#ffffff]' : 'text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2]'
                }`}
              >
                Elíptico
              </button>
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Buscar por fecha o ejercicio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-lg px-2.5 py-1 text-xs text-[#f2f2f2] placeholder-[rgba(242,242,242,0.4)] focus:outline-none focus:border-[#ff6b00] w-44"
            />

          </div>
        </div>

        {/* Sessions Table */}
        {filteredSessions.length === 0 ? (
          <div className="bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] p-8 text-center text-[rgba(242,242,242,0.5)] text-xs">
            No se encontraron registros de cardio con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[9px] uppercase font-bold text-[rgba(242,242,242,0.5)] border-b border-[rgba(242,242,242,0.1)]">
                  <th className="pb-2.5">Fecha / Día</th>
                  <th className="pb-2.5">Modalidad & Nombre</th>
                  <th className="pb-2.5 text-center">Duración</th>
                  <th className="pb-2.5 text-center">Distancia / Nivel</th>
                  <th className="pb-2.5 text-center">Inclinación / Vel</th>
                  <th className="pb-2.5 text-center">RPE</th>
                  <th className="pb-2.5 text-center">Calorías</th>
                  <th className="pb-2.5">Pautas del Coach / Notas</th>
                  <th className="pb-2.5 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(242,242,242,0.06)] font-medium text-[rgba(242,242,242,0.7)]">
                {filteredSessions.map((session) => {
                  const isComp = session.completed || session.workoutCompleted;
                  return (
                    <tr key={session.id} className="hover:bg-[#1c1c21] transition-colors">
                      
                      {/* Fecha / Día */}
                      <td className="py-2.5">
                        <div className="font-bold text-[#f2f2f2]">{session.workoutDate}</div>
                        <div className="text-[10px] text-[rgba(242,242,242,0.5)]">{session.dayName}</div>
                      </td>

                      {/* Modalidad & Nombre */}
                      <td className="py-2.5">
                        <div className="flex items-center gap-1.5 font-bold text-[#f2f2f2]">
                          {session.type === 'bici' && <Bike className="w-3.5 h-3.5 text-[#ff6b00]" />}
                          {session.type === 'caminadora' && <Footprints className="w-3.5 h-3.5 text-[#22c55e]" />}
                          {session.type === 'eliptico' && <Zap className="w-3.5 h-3.5 text-[#ff6b00]" />}
                          <span>{session.name}</span>
                        </div>
                        <div className="text-[10px] text-[rgba(242,242,242,0.5)] truncate max-w-[200px]">
                          {session.workoutTitle}
                        </div>
                      </td>

                      {/* Duración */}
                      <td className="py-2.5 text-center font-bold text-[#f2f2f2]">
                        {session.durationMinutes} min
                      </td>

                      {/* Distancia / Nivel */}
                      <td className="py-2.5 text-center">
                        {session.distanceKm ? (
                          <span className="font-bold text-[#22c55e]">{session.distanceKm} km</span>
                        ) : session.level ? (
                          <span className="font-bold text-[#ff6b00]">Nivel {session.level}</span>
                        ) : (
                          <span className="text-[rgba(242,242,242,0.4)]">-</span>
                        )}
                      </td>

                      {/* Inclinación / Vel */}
                      <td className="py-2.5 text-center text-[#f2f2f2]">
                        {session.inclinePct ? `${session.inclinePct}% Inc.` : ''}
                        {session.speedKmh ? ` @ ${session.speedKmh} km/h` : ''}
                        {!session.inclinePct && !session.speedKmh && <span className="text-[rgba(242,242,242,0.4)]">-</span>}
                      </td>

                      {/* RPE */}
                      <td className="py-2.5 text-center">
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          (session.rpe || 6) <= 6.5 
                            ? 'bg-[rgba(34,197,94,0.12)] text-[#22c55e] border border-[rgba(34,197,94,0.25)]' 
                            : (session.rpe || 6) <= 8 
                              ? 'bg-[rgba(255,107,0,0.15)] text-[#ff6b00] border border-[rgba(255,107,0,0.3)]' 
                              : 'bg-rose-950/50 text-rose-400 border border-rose-800/40'
                        }`}>
                          RPE {session.rpe || 6.5}
                        </span>
                      </td>

                      {/* Calorías */}
                      <td className="py-2.5 text-center font-bold text-[#ff6b00]">
                        {session.caloriesKcal ? `${session.caloriesKcal} kcal` : '-'}
                      </td>

                      {/* Notas */}
                      <td className="py-2.5 max-w-[240px]">
                        <p className="text-[11px] text-[rgba(242,242,242,0.6)] line-clamp-1 italic">
                          {session.notes || 'Zona 2 continua para oxigenación'}
                        </p>
                      </td>

                      {/* Estado */}
                      <td className="py-2.5 text-right">
                        {isComp ? (
                          <span className="text-[10px] bg-[rgba(34,197,94,0.12)] text-[#22c55e] font-bold px-2 py-0.5 rounded border border-[rgba(34,197,94,0.25)]">
                            ✓ Completado
                          </span>
                        ) : (
                          <span className="text-[10px] bg-[#1c1c21] text-[rgba(242,242,242,0.5)] font-medium px-2 py-0.5 rounded border border-[rgba(242,242,242,0.1)]">
                            Pendiente
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
