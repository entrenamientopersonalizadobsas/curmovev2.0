import { StudentProfile, DailyWorkout } from '../types';

export function exportRoutineToHTML(student: StudentProfile, currentWorkout?: DailyWorkout): void {
  const workoutTitle = currentWorkout?.title || 'Rutina de Entrenamiento';
  const workoutDate = currentWorkout?.date || new Date().toISOString().split('T')[0];
  
  let exercisesHtml = '';
  if (currentWorkout?.exercises && currentWorkout.exercises.length > 0) {
    exercisesHtml = currentWorkout.exercises.map((ex, i) => `
      <div style="background:#18243c; border:1px solid #334155; border-radius:12px; padding:16px; margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h3 style="margin:0; color:#f8fafc; font-size:16px;">#${i + 1}. ${ex.name}</h3>
          <span style="background:#0f172a; color:#facc15; font-size:11px; padding:3px 8px; border-radius:6px; font-weight:bold;">${ex.muscleGroup} • ${ex.movementPattern}</span>
        </div>
        <p style="margin:0 0 12px 0; color:#94a3b8; font-size:12px;">Equipo: <strong>${ex.equipment}</strong></p>
        
        <table style="width:100%; border-collapse:collapse; text-align:center; font-size:13px; color:#e2e8f0;">
          <thead>
            <tr style="background:#0f172a; color:#94a3b8; font-size:11px; text-transform:uppercase;">
              <th style="padding:6px;">Serie</th>
              <th style="padding:6px;">Tipo</th>
              <th style="padding:6px;">Repeticiones</th>
              <th style="padding:6px;">Kilos (kg)</th>
              <th style="padding:6px;">RIR</th>
              <th style="padding:6px;">RPE</th>
              <th style="padding:6px;">Descanso</th>
            </tr>
          </thead>
          <tbody>
            ${ex.sets.map((s, sIdx) => `
              <tr style="border-bottom:1px solid #1e293b; background:${s.completed ? '#064e3b33' : 'transparent'};">
                <td style="padding:8px; font-weight:bold;">${sIdx + 1}</td>
                <td style="padding:8px; text-transform:capitalize;">${s.type === 'work' ? 'Efectiva' : s.type}</td>
                <td style="padding:8px; font-weight:bold; color:#facc15;">${s.actualReps || s.targetReps}</td>
                <td style="padding:8px; font-weight:bold; color:#fff;">${s.actualWeightKg !== undefined ? s.actualWeightKg : s.targetWeightKg} kg</td>
                <td style="padding:8px; color:#facc15;">RIR ${s.actualRir !== undefined ? s.actualRir : s.targetRir}</td>
                <td style="padding:8px; color:#d946ef;">@${s.actualRpe || s.targetRpe}</td>
                <td style="padding:8px; color:#94a3b8;">${s.restSeconds || 90}s</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${ex.coachCues && ex.coachCues.length > 0 ? `
          <div style="margin-top:12px; padding:8px 12px; background:#0f172a; border-radius:8px; border-left:3px solid #facc15;">
            <strong style="color:#facc15; font-size:11px; text-transform:uppercase;">Puntos Clave del Coach:</strong>
            <ul style="margin:4px 0 0 16px; padding:0; font-size:12px; color:#cbd5e1;">
              ${ex.coachCues.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `).join('');
  } else {
    exercisesHtml = '<p style="color:#94a3b8; text-align:center; padding:32px;">Día de descanso o sin ejercicios programados.</p>';
  }

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CURMOVE - Ficha de Entrenamiento (${student.fullName})</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #0f172a;
      color: #f8fafc;
      margin: 0;
      padding: 24px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #141f33;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #334155;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .logo {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .logo-cur { color: #facc15; }
    .logo-move { color: #d946ef; }
    .badge {
      background: #1e293b;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: bold;
      color: #38bdf8;
      border: 1px solid #334155;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <span class="logo-cur">CUR</span><span class="logo-move">MOVE</span>
      </div>
      <div>
        <span class="badge">Ficha de Entrenamiento</span>
      </div>
    </div>

    <div style="background:#18243c; border-radius:12px; padding:16px; margin-bottom:20px; border:1px solid #334155; display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:12px; font-size:13px;">
      <div><span style="color:#94a3b8;">Atleta:</span> <strong style="color:#fff;">${student.fullName}</strong></div>
      <div><span style="color:#94a3b8;">Objetivo:</span> <strong style="color:#facc15;">${student.goal}</strong></div>
      <div><span style="color:#94a3b8;">Nivel:</span> <strong style="color:#fff;">${student.level}</strong></div>
      <div><span style="color:#94a3b8;">Fecha Sesión:</span> <strong style="color:#38bdf8;">${workoutDate}</strong></div>
    </div>

    <h2 style="color:#facc15; font-size:18px; margin-bottom:16px; text-transform:uppercase;">
      ${workoutTitle}
    </h2>

    ${exercisesHtml}

    <div style="margin-top:24px; text-align:center; font-size:11px; color:#64748b; border-top:1px solid #1e293b; padding-top:16px;">
      Generado con CURMOVE • Plataforma de Planificación y Seguimiento Biomecánico
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `CURMOVE_${student.fullName.replace(/\s+/g, '_')}_${workoutDate}.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
