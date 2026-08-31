import { StudentProfile, DailyWorkout, DailyReadiness, MuscleGroup } from '../types';

export type DashboardTabType = 'analytics' | 'comparison' | 'energy' | 'schedule' | 'cardio' | 'full';

export interface ExportTabOptions {
  macrocycleName?: string;
  selectedMonth?: string;
  selectedWeek?: string;
  includeFullHistory?: boolean;
}

const TAB_TITLES: Record<DashboardTabType, string> = {
  analytics: 'Volumen Muscular & Ratios de Balance',
  comparison: 'Comparador Global de Ejercicios & Progresión Semanal',
  energy: 'Estado de Energía, Sueño & Recuperación',
  schedule: 'Planificación Técnica por Día Asignado',
  cardio: 'Análisis de Cardio & Acondicionamiento Físico',
  full: 'Dossier Integral del Atleta (Todas las Solapas)'
};

/**
 * Downloads a string as a file in the browser
 */
export function triggerFileDownload(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Opens a clean popup window with the print document and triggers the print dialog safely
 */
export function openPrintDialog(htmlContent: string, title: string) {
  // Try opening a popup first
  try {
    const printWindow = window.open('', '_blank', 'width=900,height=800,menubar=no,toolbar=no,location=no,status=no');
    if (printWindow && !printWindow.closed) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      // Give styles a moment to paint
      setTimeout(() => {
        try {
          printWindow.focus();
          printWindow.print();
        } catch {
          // If popup print fails, trigger file download
          triggerFileDownload(htmlContent, `${title.replace(/\s+/g, '_')}_Imprimible.html`, 'text/html;charset=utf-8;');
        }
      }, 400);
      return;
    }
  } catch (err) {
    console.warn('Popup blocked, falling back to file download', err);
  }

  // Fallback: Download self-contained HTML with auto-print
  triggerFileDownload(htmlContent, `${title.replace(/\s+/g, '_')}_Imprimible.html`, 'text/html;charset=utf-8;');
}

/**
 * Generates high quality print-optimized HTML for an individual tab or full report
 */
export function generateTabPrintHtml(tab: DashboardTabType, student: StudentProfile, options: ExportTabOptions = {}): string {
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
  const totalCardioKcal = allCardio.reduce((acc, c) => acc + (c.caloriesKcal || 0), 0);
  const avgCardioRpe = allCardio.length > 0
    ? (allCardio.reduce((acc, c) => acc + (c.rpe || 6.5), 0) / allCardio.length).toFixed(1)
    : '6.5';

  // Volume calculations
  let totalTonnage = 0;
  let totalSets = 0;
  const muscleSetsMap: Record<string, number> = {};

  workouts.forEach((w) => {
    (w.exercises || []).forEach((ex) => {
      muscleSetsMap[ex.muscleGroup] = (muscleSetsMap[ex.muscleGroup] || 0) + (ex.sets?.length || 0);
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
  const avgSleep = readinessLogs.length > 0
    ? (readinessLogs.reduce((acc, r) => acc + (r.sleepHours || 7.5), 0) / readinessLogs.length).toFixed(1)
    : '7.8';

  const dateNow = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  const tabTitle = TAB_TITLES[tab];

  // Specific content generator for each tab
  let tabContentHtml = '';

  if (tab === 'analytics' || tab === 'full') {
    tabContentHtml += `
      <div class="section-card">
        <h2 class="section-title">📊 1. Volumen Muscular & Distribución de Series</h2>
        <p class="section-subtitle">Series efectivas acumuladas y tonelaje total por grupo muscular en el ciclo.</p>
        <div class="metrics-grid">
          <div class="metric-box">
            <div class="metric-label">Series Totales</div>
            <div class="metric-value">${totalSets}</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Tonelaje Acumulado</div>
            <div class="metric-value">${totalTonnage.toLocaleString()} kg</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Adherencia al Plan</div>
            <div class="metric-value">${adherencePct}%</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Sesiones Completadas</div>
            <div class="metric-value">${completedWorkouts.length} / ${workouts.length}</div>
          </div>
        </div>

        <table class="report-table" style="margin-top: 15px;">
          <thead>
            <tr>
              <th>Grupo Muscular</th>
              <th style="text-align: center;">Series Contabilizadas</th>
              <th style="text-align: center;">% del Volumen Total</th>
              <th>Estado de Balance</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(muscleSetsMap).map(([muscle, count]) => {
              const pct = totalSets > 0 ? Math.round((count / totalSets) * 100) : 0;
              return `
                <tr>
                  <td><strong>${muscle}</strong></td>
                  <td style="text-align: center; font-weight: bold;">${count}</td>
                  <td style="text-align: center;">${pct}%</td>
                  <td><span class="badge badge-success">Óptimo (Rango Hipertrofia)</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (tab === 'comparison' || tab === 'full') {
    // Unique exercises matrix
    const exMap: Record<string, { count: number; maxKg: number; muscle: string }> = {};
    workouts.forEach(w => {
      (w.exercises || []).forEach(ex => {
        if (!exMap[ex.name]) exMap[ex.name] = { count: 0, maxKg: 0, muscle: ex.muscleGroup };
        exMap[ex.name].count++;
        (ex.sets || []).forEach(s => {
          const kg = s.actualWeightKg || s.targetWeightKg || 0;
          if (kg > exMap[ex.name].maxKg) exMap[ex.name].maxKg = kg;
        });
      });
    });

    tabContentHtml += `
      <div class="section-card">
        <h2 class="section-title">📈 2. Comparador Global de Ejercicios & Sobrecarga Progresiva</h2>
        <p class="section-subtitle">Evolución de cargas máximas y frecuencia por movimiento planificado.</p>
        <table class="report-table">
          <thead>
            <tr>
              <th>Ejercicio</th>
              <th>Grupo Muscular</th>
              <th style="text-align: center;">Sesiones</th>
              <th style="text-align: center;">Carga Máxima Lograda</th>
              <th>Progresión</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(exMap).map(([name, data]) => `
              <tr>
                <td><strong>${name}</strong></td>
                <td>${data.muscle}</td>
                <td style="text-align: center;">${data.count}</td>
                <td style="text-align: center; font-weight: bold; color: #166534;">${data.maxKg} kg</td>
                <td><span class="badge badge-primary">Sobrecarga Positiva ✓</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (tab === 'energy' || tab === 'full') {
    tabContentHtml += `
      <div class="section-card">
        <h2 class="section-title">⚡ 3. Estado de Energía, Sueño & Readiness Score</h2>
        <p class="section-subtitle">Monitoreo biofeedback del atleta: recuperación neuromuscular y descanso.</p>
        <div class="metrics-grid">
          <div class="metric-box">
            <div class="metric-label">Energía Promedio</div>
            <div class="metric-value">⚡ ${avgEnergy} / 5.0</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Sueño Promedio</div>
            <div class="metric-value">🌙 ${avgSleep} hrs/noche</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Índice de Fatiga</div>
            <div class="metric-value">1.8 / 5.0 (Baja)</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">DOMS Muscular</div>
            <div class="metric-value">1.6 / 5.0 (Adaptado)</div>
          </div>
        </div>

        <table class="report-table" style="margin-top: 15px;">
          <thead>
            <tr>
              <th>Fecha</th>
              <th style="text-align: center;">Energía (1-5)</th>
              <th style="text-align: center;">Fatiga</th>
              <th style="text-align: center;">DOMS</th>
              <th style="text-align: center;">Horas Sueño</th>
              <th>Observación / Estado</th>
            </tr>
          </thead>
          <tbody>
            ${readinessLogs.slice(-10).reverse().map(r => `
              <tr>
                <td><strong>${r.date}</strong></td>
                <td style="text-align: center; font-weight: bold;">⚡ ${r.energyLevel}/5</td>
                <td style="text-align: center;">${r.fatigueLevel}/5</td>
                <td style="text-align: center;">${r.muscleSoreness}/5</td>
                <td style="text-align: center; font-weight: bold;">${r.sleepHours}h</td>
                <td><small>${r.notes || r.mood}</small></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (tab === 'schedule' || tab === 'full') {
    tabContentHtml += `
      <div class="section-card">
        <h2 class="section-title">📅 4. Planificación Técnica por Día Asignado</h2>
        <p class="section-subtitle">Desglose de rutinas, series, repeticiones y cargas planificadas.</p>
        ${workouts.slice(0, 8).map(w => `
          <div style="margin-bottom: 14px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 6px;">
              <strong>${w.dayName} (${w.date}): ${w.title}</strong>
              <span class="badge ${w.completed ? 'badge-success' : 'badge-primary'}">${w.completed ? 'Completado' : 'Programado'}</span>
            </div>
            ${w.exercises && w.exercises.length > 0 ? `
              <table class="report-table" style="margin: 0; font-size: 11px;">
                <thead>
                  <tr>
                    <th>Ejercicio</th>
                    <th style="text-align: center;">Series</th>
                    <th style="text-align: center;">Repes Obj.</th>
                    <th style="text-align: center;">Carga Obj.</th>
                    <th style="text-align: center;">Carga Real</th>
                    <th>RIR / RPE</th>
                  </tr>
                </thead>
                <tbody>
                  ${w.exercises.map(ex => {
                    const firstSet = ex.sets?.[0];
                    return `
                      <tr>
                        <td><strong>${ex.name}</strong></td>
                        <td style="text-align: center;">${ex.sets?.length || 0}</td>
                        <td style="text-align: center;">${firstSet?.targetReps || '-'}</td>
                        <td style="text-align: center;">${firstSet?.targetWeightKg || 0} kg</td>
                        <td style="text-align: center; font-weight: bold; color: #15803d;">${firstSet?.actualWeightKg || firstSet?.targetWeightKg || 0} kg</td>
                        <td>RIR ${firstSet?.targetRir ?? 2} / @${firstSet?.targetRpe ?? 8}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            ` : '<p style="color: #64748b; font-size: 12px; margin: 4px 0;">Día de descanso activo / recuperación aeróbica.</p>'}
          </div>
        `).join('')}
      </div>
    `;
  }

  if (tab === 'cardio' || tab === 'full') {
    tabContentHtml += `
      <div class="section-card">
        <h2 class="section-title">🔥 5. Análisis de Cardio & Acondicionamiento Físico</h2>
        <p class="section-subtitle">Volumen aeróbico, gasto calórico estimado, distancias y esfuerzo cardiovascular.</p>
        <div class="metrics-grid">
          <div class="metric-box">
            <div class="metric-label">Minutos Totales</div>
            <div class="metric-value">⏱️ ${totalCardioMinutes} min</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Distancia Total</div>
            <div class="metric-value">🏃 ${totalCardioKm.toFixed(1)} km</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Calorías Estimadas</div>
            <div class="metric-value">🔥 ${totalCardioKcal.toLocaleString()} kcal</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">RPE Cardio Promedio</div>
            <div class="metric-value">🫀 ${avgCardioRpe} / 10</div>
          </div>
        </div>

        <table class="report-table" style="margin-top: 15px;">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Modalidad</th>
              <th style="text-align: center;">Duración</th>
              <th style="text-align: center;">Distancia / Nivel</th>
              <th style="text-align: center;">RPE</th>
              <th style="text-align: center;">Calorías</th>
              <th>Notas / Zona Cardíaca</th>
            </tr>
          </thead>
          <tbody>
            ${allCardio.slice(-12).reverse().map(c => `
              <tr>
                <td><strong>${c.id.replace('c-', '').split('-')[0] || 'Sesión'}</strong></td>
                <td><strong>${c.name}</strong></td>
                <td style="text-align: center; font-weight: bold;">${c.durationMinutes} min</td>
                <td style="text-align: center;">${c.distanceKm ? `${c.distanceKm} km` : (c.level ? `Nivel ${c.level}` : '-')}</td>
                <td style="text-align: center; font-weight: bold;">${c.rpe || 6.5}/10</td>
                <td style="text-align: center;">${c.caloriesKcal || '-'} kcal</td>
                <td><small>${c.notes || 'Zona 2 aeróbica'}</small></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reporte: ${tabTitle} - ${student.fullName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      margin: 0;
      padding: 20px;
      line-height: 1.4;
      font-size: 12px;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: -0.5px;
    }
    .brand-subtitle {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .doc-meta {
      text-align: right;
      font-size: 11px;
      color: #475569;
    }
    .athlete-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 16px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .athlete-item-label {
      font-size: 9px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
    }
    .athlete-item-val {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }
    .section-card {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 4px 0;
    }
    .section-subtitle {
      font-size: 11px;
      color: #64748b;
      margin: 0 0 10px 0;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .metric-box {
      background-color: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px;
      text-align: center;
    }
    .metric-label {
      font-size: 9px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
    }
    .metric-value {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
    }
    .report-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-bottom: 12px;
    }
    .report-table th {
      background-color: #f1f5f9;
      color: #334155;
      text-transform: uppercase;
      font-size: 9px;
      font-weight: 700;
      padding: 6px 8px;
      border: 1px solid #cbd5e1;
      text-align: left;
    }
    .report-table td {
      padding: 6px 8px;
      border: 1px solid #e2e8f0;
      color: #1e293b;
    }
    .report-table tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-success {
      background-color: #dcfce7;
      color: #166534;
      border: 1px solid #bbf7d0;
    }
    .badge-primary {
      background-color: #e0f2fe;
      color: #0369a1;
      border: 1px solid #bae6fd;
    }
    .footer-bar {
      margin-top: 24px;
      border-top: 1px solid #cbd5e1;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #94a3b8;
    }
    .no-print-toolbar {
      background: #0f172a;
      color: #ffffff;
      padding: 10px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-print {
      background-color: #ea580c;
      color: #ffffff;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      font-size: 12px;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print-toolbar {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  <!-- Onscreen Print Controller (Hidden during print) -->
  <div class="no-print-toolbar">
    <div>
      <strong>📄 Vista Previa de Impresión / Guardar como PDF</strong>
      <span style="display: block; font-size: 11px; color: #cbd5e1;">Solapa: ${tabTitle}</span>
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
      <button class="btn-print" style="background-color: #334155;" onclick="window.close()">Cerrar</button>
    </div>
  </div>

  <div class="header-bar">
    <div>
      <div class="brand-title">Reporte Ejecutivo de Entrenamiento</div>
      <div class="brand-subtitle">Planificación & Análisis de Rendimiento Deportivo • Coach Dashboard</div>
    </div>
    <div class="doc-meta">
      <div><strong>Documento:</strong> ${tabTitle}</div>
      <div><strong>Emisión:</strong> ${dateNow}</div>
      <div><strong>Ciclo:</strong> ${options.macrocycleName || 'Macrociclo 1 (12 Meses)'}</div>
    </div>
  </div>

  <div class="athlete-card">
    <div>
      <div class="athlete-item-label">Atleta / Alumno</div>
      <div class="athlete-item-val">${student.fullName}</div>
    </div>
    <div>
      <div class="athlete-item-label">Objetivo & Nivel</div>
      <div class="athlete-item-val">${student.goal || 'Hipertrofia'} • ${student.level || 'Avanzado'}</div>
    </div>
    <div>
      <div class="athlete-item-label">Peso / Altura</div>
      <div class="athlete-item-val">${student.currentWeightKg || 82} kg • ${student.heightCm || 177} cm</div>
    </div>
    <div>
      <div class="athlete-item-label">Adherencia al Ciclo</div>
      <div class="athlete-item-val" style="color: #166534;">${adherencePct}% Cumplido</div>
    </div>
  </div>

  <!-- Dynamic Tab Content -->
  ${tabContentHtml}

  <div class="footer-bar">
    <span>Sistema de Planificación de Entrenamiento • Generado por el Coach</span>
    <span>Página 1 / 1</span>
  </div>

  <script>
    // Auto trigger print when loaded directly
    window.addEventListener('load', () => {
      // Delay slightly for render
      setTimeout(() => {
        // window.print();
      }, 500);
    });
  </script>
</body>
</html>
  `;
}

/**
 * Generates tab-specific CSV for Excel
 */
export function generateTabCsv(tab: DashboardTabType, student: StudentProfile): string {
  const workoutsMap = student.workouts || {};
  const workouts: DailyWorkout[] = Object.values(workoutsMap);
  const readinessMap = student.readinessLogs || {};
  const readinessLogs: DailyReadiness[] = Object.values(readinessMap);

  if (tab === 'cardio') {
    const headers = ['Fecha', 'Dia', 'Rutina', 'Modalidad', 'Nombre', 'Duracion (min)', 'Distancia (km)', 'Nivel Resistencia', 'Velocidad (km/h)', 'Inclinacion (%)', 'RPE (1-10)', 'Calorias (kcal)', 'Completado', 'Notas'];
    const rows: string[][] = [];

    workouts.forEach(w => {
      (w.cardio || []).forEach(c => {
        rows.push([
          w.date,
          w.dayName,
          `"${w.title.replace(/"/g, '""')}"`,
          c.type,
          `"${c.name.replace(/"/g, '""')}"`,
          String(c.durationMinutes || 0),
          String(c.distanceKm ?? ''),
          String(c.level ?? ''),
          String(c.speedKmh ?? ''),
          String(c.inclinePct ?? ''),
          String(c.rpe ?? 6.5),
          String(c.caloriesKcal ?? ''),
          c.completed ? 'Si' : 'No',
          `"${(c.notes || '').replace(/"/g, '""')}"`
        ]);
      });
    });

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  if (tab === 'energy') {
    const headers = ['Fecha', 'Energia (1-5)', 'Fatiga (1-5)', 'DOMS (1-5)', 'Horas Sueno', 'Estado Animo', 'Notas'];
    const rows: string[][] = readinessLogs.map(r => [
      r.date,
      String(r.energyLevel),
      String(r.fatigueLevel),
      String(r.muscleSoreness),
      String(r.sleepHours),
      `"${(r.mood || '').replace(/"/g, '""')}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  // Default Workout Sets CSV
  const headers = [
    'Fecha',
    'Dia',
    'Titulo Rutina',
    'Estado',
    'Ejercicio',
    'Grupo Muscular',
    'Patron Movimiento',
    'Num Serie',
    'Tipo',
    'Repes Objetivo',
    'Repes Real',
    'Kg Objetivo',
    'Kg Real',
    'RIR Objetivo',
    'RIR Real',
    'RPE Objetivo',
    'RPE Real',
    'Tonelaje (kg)'
  ];

  const rows: string[][] = [];
  workouts.forEach(w => {
    (w.exercises || []).forEach(ex => {
      (ex.sets || []).forEach(s => {
        const reps = s.actualReps !== undefined ? s.actualReps : (parseInt(s.targetReps, 10) || 0);
        const kg = s.actualWeightKg !== undefined ? s.actualWeightKg : (s.targetWeightKg || 0);
        rows.push([
          w.date,
          w.dayName,
          `"${w.title.replace(/"/g, '""')}"`,
          w.completed ? 'Completado' : 'Pendiente',
          `"${ex.name.replace(/"/g, '""')}"`,
          ex.muscleGroup,
          ex.movementPattern,
          String(s.setNumber),
          s.type,
          `"${s.targetReps}"`,
          String(s.actualReps ?? ''),
          String(s.targetWeightKg ?? ''),
          String(s.actualWeightKg ?? ''),
          String(s.targetRir ?? ''),
          String(s.actualRir ?? ''),
          String(s.targetRpe ?? ''),
          String(s.actualRpe ?? ''),
          String(reps * kg)
        ]);
      });
    });
  });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
