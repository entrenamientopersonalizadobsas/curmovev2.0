import { StudentProfile, AnthropometryRecord, DailyWorkout, DailyReadiness, ExerciseItem, MuscleGroup, MovementPattern } from '../types';

// Helper to generate dates for 12 months (Months 1 to 12, each with 4 weeks of training)
export function generate12MonthStudent(): StudentProfile {
  const startDate = '2025-03-03';
  const workouts: Record<string, DailyWorkout> = {};
  const readinessLogs: Record<string, DailyReadiness> = {};
  const anthropometryHistory: AnthropometryRecord[] = [];

  const baseDate = new Date(startDate);

  // 12 Months Evolution Profile
  // Progression over 12 months:
  // Weight: 84.5kg -> 78.0kg (Cut) -> 82.5kg (Clean Bulk)
  // BodyFat: 20.5% -> 12.0%
  // MuscleMass: 35.8kg -> 41.5kg
  // Bench: 65kg -> 105kg
  // Squat: 80kg -> 140kg
  // RDL: 75kg -> 135kg
  // Military Press: 40kg -> 70kg

  for (let m = 1; m <= 12; m++) {
    // Generate Anthropometry record for each month
    const monthDate = new Date(baseDate);
    monthDate.setDate(baseDate.getDate() + (m - 1) * 28);
    const monthDateStr = monthDate.toISOString().split('T')[0];

    const weightKg = Number((84.5 - (m <= 6 ? m * 1.1 : 6.6 - (m - 6) * 0.75)).toFixed(1));
    const bodyFatPct = Number((20.5 - (m * 0.7)).toFixed(1));
    const muscleMassKg = Number((35.8 + (m * 0.48)).toFixed(1));
    const chestCm = Number((98 + (m * 0.8)).toFixed(1));
    const waistCm = Number((86 - (m * 0.65)).toFixed(1));
    const armCm = Number((35.0 + (m * 0.45)).toFixed(1));
    const thighCm = Number((57.0 + (m * 0.35)).toFixed(1));

    anthropometryHistory.push({
      id: `anthro-12m-m${m}`,
      date: monthDateStr,
      weightKg,
      heightCm: 177,
      bodyFatPct: Math.max(12.0, bodyFatPct),
      muscleMassKg,
      chestCm,
      waistCm,
      hipCm: 96,
      armRightCm: armCm,
      thighRightCm: thighCm,
      calfRightCm: 38.0,
      notes: `Evaluación Mes ${m}: Progresión continua. Adherencia del 95% y notable ganancia de fuerza e hipertrofia.`
    });

    // Generate 4 Weeks for this Month
    for (let w = 1; w <= 4; w++) {
      const weekIndex = (m - 1) * 4 + (w - 1);
      const weekStart = new Date(baseDate);
      weekStart.setDate(baseDate.getDate() + weekIndex * 7);

      // Overload factor for this week
      const weightFactor = 1 + (weekIndex * 0.012); // Steady progressive overload

      // Days of the week
      const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

      for (let d = 0; d < 7; d++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + d);
        const dayDateStr = dayDate.toISOString().split('T')[0];
        const dayName = dayNames[d];

        // Readiness log for each day
        const energyLvl = d === 0 ? 5 : d === 1 ? 4 : d === 3 ? 4 : d === 4 ? 4 : 3;
        const fatigueLvl = d === 4 ? 3 : d === 1 ? 2 : 1;
        const sorenessLvl = d === 2 ? 3 : d === 5 ? 2 : 1;
        const sleepHours = 7.5 + (d % 2 === 0 ? 0.5 : -0.2);

        readinessLogs[dayDateStr] = {
          date: dayDateStr,
          energyLevel: energyLvl,
          fatigueLevel: fatigueLvl,
          muscleSoreness: sorenessLvl,
          sleepHours,
          mood: energyLvl >= 4 ? 'Excelente' : 'Bueno',
          notes: `Mes ${m} • Sem ${w} (${dayName}): Buen descanso (${sleepHours}h). Nivel de energía ⚡ ${energyLvl}/5.`
        };

        // Workouts on Mon, Tue, Thu, Fri (Rest on Wed, Sat, Sun)
        if (d === 0) {
          // LUNES: Torso Empuje & Pecho / Hombros
          const benchKg = Math.round(65 * weightFactor);
          const incDumbbellKg = Math.round(24 * weightFactor);
          const lateralKg = Math.min(18, Math.round(10 + (m * 0.6)));

          workouts[dayDateStr] = {
            id: `w-${dayDateStr}`,
            date: dayDateStr,
            dayName: 'Lunes',
            title: `Mes ${m} • Sem ${w} - Torso: Empuje & Pecho`,
            isRestDay: false,
            completed: true,
            sessionEnergyLevel: energyLvl,
            sessionRpe: 8.5,
            sessionDurationMin: 65,
            studentFeedback: `Mes ${m} Sem ${w}: Gran control en Press Banca a ${benchKg}kg. RIR 1 sólido.`,
            cardio: [
              {
                id: `c-${dayDateStr}-1`,
                type: 'caminadora',
                name: 'Caminadora / Caminata Inclinada LISS',
                durationMinutes: 15 + (m >= 6 ? 5 : 0),
                speedKmh: 5.5,
                inclinePct: 6.5,
                distanceKm: parseFloat((( (15 + (m >= 6 ? 5 : 0)) * 5.5) / 60).toFixed(2)),
                rpe: 6,
                caloriesKcal: Math.round((15 + (m >= 6 ? 5 : 0)) * 7.5),
                completed: true,
                notes: 'Zona 2 aeróbica para recuperación y flujo sanguíneo.'
              }
            ],
            exercises: [
              {
                id: `ex-${dayDateStr}-1`,
                name: 'Press de Banca Plano',
                muscleGroup: 'Pecho',
                movementPattern: 'Empuje Horizontal',
                equipment: 'Barra',
                videoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg',
                coachCues: ['Retracción escapular firme', 'Pausa en el pecho', 'Leg drive constante'],
                order: 1,
                sets: [
                  { id: `s-${dayDateStr}-1-1`, setNumber: 1, type: 'warmup', targetReps: '10', actualReps: 10, targetWeightKg: Math.round(benchKg * 0.6), actualWeightKg: Math.round(benchKg * 0.6), targetRir: 4, actualRir: 4, targetRpe: 6, actualRpe: 6, completed: true, restSeconds: 90 },
                  { id: `s-${dayDateStr}-1-2`, setNumber: 2, type: 'work', targetReps: '8', actualReps: 8, targetWeightKg: benchKg, actualWeightKg: benchKg, targetRir: 2, actualRir: 2, targetRpe: 8, actualRpe: 8, completed: true, restSeconds: 120 },
                  { id: `s-${dayDateStr}-1-3`, setNumber: 3, type: 'work', targetReps: '8', actualReps: 8, targetWeightKg: benchKg, actualWeightKg: benchKg, targetRir: 1, actualRir: 1, targetRpe: 8.5, actualRpe: 8.5, completed: true, restSeconds: 150 },
                  { id: `s-${dayDateStr}-1-4`, setNumber: 4, type: 'work', targetReps: '6', actualReps: 6, targetWeightKg: benchKg + 2.5, actualWeightKg: benchKg + 2.5, targetRir: 1, actualRir: 1, targetRpe: 9, actualRpe: 9, completed: true, restSeconds: 150 }
                ]
              },
              {
                id: `ex-${dayDateStr}-2`,
                name: 'Press Inclinado con Mancuernas',
                muscleGroup: 'Pecho',
                movementPattern: 'Empuje Horizontal',
                equipment: 'Mancuernas',
                videoUrl: 'https://www.youtube.com/embed/8iPEnn-ltC8',
                coachCues: ['Inclinación a 30°', 'Control excéntrico de 3s'],
                order: 2,
                sets: [
                  { id: `s-${dayDateStr}-2-1`, setNumber: 1, type: 'work', targetReps: '10', actualReps: 10, targetWeightKg: incDumbbellKg, actualWeightKg: incDumbbellKg, targetRir: 2, actualRir: 2, targetRpe: 8, actualRpe: 8, completed: true, restSeconds: 90 },
                  { id: `s-${dayDateStr}-2-2`, setNumber: 2, type: 'work', targetReps: '10', actualReps: 10, targetWeightKg: incDumbbellKg, actualWeightKg: incDumbbellKg, targetRir: 1, actualRir: 1, targetRpe: 8.5, actualRpe: 8.5, completed: true, restSeconds: 90 },
                  { id: `s-${dayDateStr}-2-3`, setNumber: 3, type: 'work', targetReps: '8', actualReps: 8, targetWeightKg: incDumbbellKg + 2, actualWeightKg: incDumbbellKg + 2, targetRir: 0, actualRir: 0, targetRpe: 9.5, actualRpe: 9.5, completed: true, restSeconds: 90 }
                ]
              },
              {
                id: `ex-${dayDateStr}-3`,
                name: 'Elevaciones Laterales con Mancuernas',
                muscleGroup: 'Hombros',
                movementPattern: 'Aislamiento',
                equipment: 'Mancuernas',
                videoUrl: 'https://www.youtube.com/embed/3VcKaXpzqRo',
                coachCues: ['Plano escapular 30°', 'Control en la bajada'],
                order: 3,
                sets: [
                  { id: `s-${dayDateStr}-3-1`, setNumber: 1, type: 'work', targetReps: '15', actualReps: 15, targetWeightKg: lateralKg, actualWeightKg: lateralKg, targetRir: 2, actualRir: 2, targetRpe: 8, actualRpe: 8, completed: true, restSeconds: 60 },
                  { id: `s-${dayDateStr}-3-2`, setNumber: 2, type: 'work', targetReps: '15', actualReps: 14, targetWeightKg: lateralKg, actualWeightKg: lateralKg, targetRir: 1, actualRir: 1, targetRpe: 8.5, actualRpe: 8.5, completed: true, restSeconds: 60 }
                ]
              },
              {
                id: `ex-${dayDateStr}-4`,
                name: 'Extensión de Tríceps en Polea Alta',
                muscleGroup: 'Brazos',
                movementPattern: 'Aislamiento',
                equipment: 'Polea',
                videoUrl: 'https://www.youtube.com/embed/2-LAMcpzODU',
                coachCues: ['Fijar codos', 'Apertura al final'],
                order: 4,
                sets: [
                  { id: `s-${dayDateStr}-4-1`, setNumber: 1, type: 'work', targetReps: '12', actualReps: 12, targetWeightKg: Math.round(25 + (m * 1.5)), actualWeightKg: Math.round(25 + (m * 1.5)), targetRir: 2, actualRir: 2, targetRpe: 8, actualRpe: 8, completed: true, restSeconds: 60 },
                  { id: `s-${dayDateStr}-4-2`, setNumber: 2, type: 'work', targetReps: '12', actualReps: 12, targetWeightKg: Math.round(25 + (m * 1.5)), actualWeightKg: Math.round(25 + (m * 1.5)), targetRir: 1, actualRir: 1, targetRpe: 8.5, actualRpe: 8.5, completed: true, restSeconds: 60 }
                ]
              }
            ]
          };
        } else if (d === 1) {
          // MARTES: Pierna Dominante Cuádriceps & Pantorrillas
          const squatKg = Math.round(80 * weightFactor);
          const pressLegKg = Math.round(160 * weightFactor);

          workouts[dayDateStr] = {
            id: `w-${dayDateStr}`,
            date: dayDateStr,
            dayName: 'Martes',
            title: `Mes ${m} • Sem ${w} - Pierna: Cuádriceps & Fuerza`,
            isRestDay: false,
            completed: true,
            sessionEnergyLevel: energyLvl,
            sessionRpe: 9.0,
            sessionDurationMin: 70,
            studentFeedback: `Mes ${m} Sem ${w}: Sentadilla pesada a ${squatKg}kg completada con excelente profundidad.`,
            cardio: [
              {
                id: `c-${dayDateStr}-2`,
                type: 'bici',
                name: 'Bicicleta / Spinning Aeróbico',
                durationMinutes: 15,
                level: 6 + (m % 4),
                rpe: 6.5,
                caloriesKcal: Math.round(15 * 8.2),
                completed: true,
                notes: 'Cadencia constante 85-90 RPM para oxigenación sin interferencia de fuerza.'
              }
            ],
            exercises: [
              {
                id: `ex-${dayDateStr}-1`,
                name: 'Sentadilla Trasera con Barra (Back Squat)',
                muscleGroup: 'Cuádriceps',
                movementPattern: 'Dominante de Rodilla',
                equipment: 'Barra',
                videoUrl: 'https://www.youtube.com/embed/bEv6CCg2BC8',
                coachCues: ['Bracing 360°', 'Romper paralelo', 'Cadencia 3-1-X-0'],
                order: 1,
                sets: [
                  { id: `s-${dayDateStr}-1-1`, setNumber: 1, type: 'warmup', targetReps: '8', actualReps: 8, targetWeightKg: Math.round(squatKg * 0.5), actualWeightKg: Math.round(squatKg * 0.5), targetRir: 4, actualRir: 4, targetRpe: 6, actualRpe: 6, completed: true, restSeconds: 120 },
                  { id: `s-${dayDateStr}-1-2`, setNumber: 2, type: 'work', targetReps: '6', actualReps: 6, targetWeightKg: squatKg, actualWeightKg: squatKg, targetRir: 2, actualRir: 2, targetRpe: 8, actualRpe: 8, completed: true, restSeconds: 150 },
                  { id: `s-${dayDateStr}-1-3`, setNumber: 3, type: 'work', targetReps: '6', actualReps: 6, targetWeightKg: squatKg + 5, actualWeightKg: squatKg + 5, targetRir: 1, actualRir: 1, targetRpe: 8.5, actualRpe: 8.5, completed: true, restSeconds: 180 },
                  { id: `s-${dayDateStr}-1-4`, setNumber: 4, type: 'work', targetReps: '5', actualReps: 5, targetWeightKg: squatKg + 7.5, actualWeightKg: squatKg + 7.5, targetRir: 1, actualRir: 1, targetRpe: 9, actualRpe: 9, completed: true, restSeconds: 180 }
                ]
              },
              {
                id: `ex-${dayDateStr}-2`,
                name: 'Prensa Inclinada 45°',
                muscleGroup: 'Cuádriceps',
                movementPattern: 'Dominante de Rodilla',
                equipment: 'Máquina',
                videoUrl: 'https://www.youtube.com/embed/IZxyjW7MPJQ',
                coachCues: ['Pies ancho de hombros', 'Profundidad sin despegar pelvis'],
                order: 2,
                sets: [
                  { id: `s-${dayDateStr}-2-1`, setNumber: 1, type: 'work', targetReps: '12', actualReps: 12, targetWeightKg: pressLegKg, actualWeightKg: pressLegKg, targetRir: 2, actualRir: 2, targetRpe: 8, actualRpe: 8, completed: true, restSeconds: 90 },
                  { id: `s-${dayDateStr}-2-2`, setNumber: 2, type: 'work', targetReps: '10', actualReps: 10, targetWeightKg: pressLegKg + 20, actualWeightKg: pressLegKg + 20, targetRir: 1, actualRir: 1, targetRpe: 8.5, actualRpe: 8.5, completed: true, restSeconds: 120 }
                ]
              },
              {
                id: `ex-${dayDateStr}-3`,
                name: 'Extensión de Cuádriceps',
                muscleGroup: 'Cuádriceps',
                movementPattern: 'Aislamiento',
                equipment: 'Máquina',
                videoUrl: 'https://www.youtube.com/embed/YyvSfVjQeL0',
                coachCues: ['Pausa isométrica 1s', 'Bajar lento'],
                order: 3,
                sets: [
                  { id: `s-${dayDateStr}-3-1`, setNumber: 1, type: 'work', targetReps: '15', actualReps: 15, targetWeightKg: Math.round(50 + (m * 2)), actualWeightKg: Math.round(50 + (m * 2)), targetRir: 1, actualRir: 1, targetRpe: 8.5, actualRpe: 8.5, completed: true, restSeconds: 60 },
                  { id: `s-${dayDateStr}-3-2`, setNumber: 2, type: 'work', targetReps: '12', actualReps: 12, targetWeightKg: Math.round(55 + (m * 2)), actualWeightKg: Math.round(55 + (m * 2)), targetRir: 0, actualRir: 0, targetRpe: 9.5, actualRpe: 9.5, completed: true, restSeconds: 60 }
                ]
              },
              {
                id: `ex-${dayDateStr}-4`,
                name: 'Elevación de Talones en Máquina',
                muscleGroup: 'Pantorrillas',
                movementPattern: 'Aislamiento',
                equipment: 'Máquina',
                videoUrl: 'https://www.youtube.com/embed/gwLzBJYoWlI',
                coachCues: ['Estiramiento abajo', 'Pausa arriba'],
                order: 4,
                sets: [
                  { id: `s-${dayDateStr}-4-1`, setNumber: 1, type: 'work', targetReps: '15', actualReps: 15, targetWeightKg: Math.round(40 + (m * 2.5)), actualWeightKg: Math.round(40 + (m * 2.5)), targetRir: 1, actualRir: 1, targetRpe: 8.5, actualRpe: 8.5, completed: true, restSeconds: 60 }
                ]
              }
            ]
          };
        } else if (d === 2) {
          // MIÉRCOLES: Descanso Activo
          workouts[dayDateStr] = {
            id: `w-${dayDateStr}`,
            date: dayDateStr,
            dayName: 'Miércoles',
            title: `Mes ${m} • Sem ${w} - Descanso Activo & Movilidad`,
            isRestDay: true,
            completed: true,
            exercises: []
          };
        } else if (d === 3) {
          // JUEVES: Torso Tirón & Espalda / Bíceps
          const rowKg = Math.round(65 * weightFactor);
          const pullupExtraKg = Math.max(0, Math.round((m - 3) * 1.5));

          workouts[dayDateStr] = {
            id: `w-${dayDateStr}`,
            date: dayDateStr,
            dayName: 'Jueves',
            title: `Mes ${m} • Sem ${w} - Torso: Tirón & Espalda / Bíceps`,
            isRestDay: false,
            completed: true,
            sessionEnergyLevel: energyLvl,
            sessionRpe: 8.5,
            sessionDurationMin: 65,
            studentFeedback: `Mes ${m} Sem ${w}: Dominadas estrictas con ${pullupExtraKg > 0 ? `+${pullupExtraKg}kg` : 'peso corporal'}. Remo 45° a ${rowKg}kg sin balanceo.`,
            cardio: [
              {
                id: `c-${dayDateStr}-3`,
                type: 'eliptico',
                name: 'Elíptico / Cross-Trainer Zona 2',
                durationMinutes: 18,
                level: 5 + (m % 3),
                rpe: 6.5,
                caloriesKcal: Math.round(18 * 8),
                completed: true,
                notes: 'Trabajo aeróbico de bajo impacto articular post-espalda.'
              }
            ],
            exercises: [
              {
                id: `ex-${dayDateStr}-1`,
                name: 'Dominadas Pronas / Neutras',
                muscleGroup: 'Espalda',
                movementPattern: 'Tirón Vertical',
                equipment: 'Peso Corporal',
                videoUrl: 'https://www.youtube.com/embed/eGo4IYlbE5g',
                coachCues: ['Pecho a la barra', 'Depresión escapular'],
                order: 1,
                sets: [
                  { id: `s-${dayDateStr}-1-1`, setNumber: 1, type: 'work', targetReps: '8', actualReps: 8, targetWeightKg: pullupExtraKg, actualWeightKg: pullupExtraKg, targetRir: 2, actualRir: 2, targetRpe: 8, actualRpe: 8, completed: true, restSeconds: 120 },
                  { id: `s-${dayDateStr}-1-2`, setNumber: 2, type: 'work', targetReps: '8', actualReps: 8, targetWeightKg: pullupExtraKg, actualWeightKg: pullupExtraKg, targetRir: 1, actualRir: 1, targetRpe: 8.5, actualRpe: 8.5, completed: true, restSeconds: 120 },
                  { id: `s-${dayDateStr}-1-3`, setNumber: 3, type: 'work', targetReps: '6', actualReps: 6, targetWeightKg: pullupExtraKg + 2.5, actualWeightKg: pullupExtraKg + 2.5, targetRir: 1, actualRir: 1, targetRpe: 9, actualRpe: 9, completed: true, restSeconds: 150 }
                ]
              },
              {
                id: `ex-${dayDateStr}-2`,
                name: 'Remo con Barra 45°',
                muscleGroup: 'Espalda',
                movementPattern: 'Tirón Horizontal',
                equipment: 'Barra',
                videoUrl: 'https://www.youtube.com/embed/G8l_8chR5BE',
                coachCues: ['Tronco en 45° firme', 'Codos hacia la cadera'],
                order: 2,
                sets: [
                  { id: `s-${dayDateStr}-2-1`, setNumber: 1, type: 'work', targetReps: '10', actualReps: 10, targetWeightKg: rowKg, actualWeightKg: rowKg, targetRir: 2, actualRir: 2, targetRpe: 8, actualRpe: 8, completed: true, restSeconds: 90 },
                  { id: `s-${dayDateStr}-2-2`, setNumber: 2, type: 'work', targetReps: '8', actualReps: 8, targetWeightKg: rowKg + 5, actualWeightKg: rowKg + 5, targetRir: 1, actualRir: 1, targetRpe: 8.5, actualRpe: 8.5, completed: true, restSeconds: 90 }
                ]
              },
              {
                id: `ex-${dayDateStr}-3`,
                name: 'Curl de Bíceps con Barra Z',
                muscleGroup: 'Brazos',
                movementPattern: 'Aislamiento',
                equipment: 'Barra',
                videoUrl: 'https://www.youtube.com/embed/in7PaeYlhrM',
                coachCues: ['Codos inmóviles a los lados', 'Apretar bíceps arriba'],
                order: 3,
                sets: [
                  { id: `s-${dayDateStr}-3-1`, setNumber: 1, type: 'work', targetReps: '12', actualReps: 12, targetWeightKg: Math.round(28 + (m * 1.2)), actualWeightKg: Math.round(28 + (m * 1.2)), targetRir: 2, actualRir: 2, targetRpe: 8, actualRpe: 8, completed: true, restSeconds: 60 },
                  { id: `s-${dayDateStr}-3-2`, setNumber: 2, type: 'work', targetReps: '10', actualReps: 10, targetWeightKg: Math.round(30 + (m * 1.2)), actualWeightKg: Math.round(30 + (m * 1.2)), targetRir: 1, actualRir: 1, targetRpe: 8.5, actualRpe: 8.5, completed: true, restSeconds: 60 }
                ]
              }
            ]
          };
        } else if (d === 4) {
          // VIERNES: Pierna Isquios & Glúteos + Core
          const rdlKg = Math.round(75 * weightFactor);
          const hipThrustKg = Math.round(110 * weightFactor);

          workouts[dayDateStr] = {
            id: `w-${dayDateStr}`,
            date: dayDateStr,
            dayName: 'Viernes',
            title: `Mes ${m} • Sem ${w} - Pierna: Isquios & Glúteo + Core`,
            isRestDay: false,
            completed: true,
            sessionEnergyLevel: energyLvl,
            sessionRpe: 8.5,
            sessionDurationMin: 60,
            studentFeedback: `Mes ${m} Sem ${w}: Peso Muerto Rumano a ${rdlKg}kg con máxima tensión en isquiotibiales.`,
            exercises: [
              {
                id: `ex-${dayDateStr}-1`,
                name: 'Peso Muerto Rumano (RDL)',
                muscleGroup: 'Isquios / Glúteo',
                movementPattern: 'Bisagra de Cadera',
                equipment: 'Barra',
                videoUrl: 'https://www.youtube.com/embed/JCXUYuzwNrM',
                coachCues: ['Cadera atrás', 'Espalda recta', 'Estiramiento en isquios'],
                order: 1,
                sets: [
                  { id: `s-${dayDateStr}-1-1`, setNumber: 1, type: 'work', targetReps: '10', actualReps: 10, targetWeightKg: rdlKg, actualWeightKg: rdlKg, targetRir: 2, actualRir: 2, targetRpe: 8, actualRpe: 8, completed: true, restSeconds: 120 },
                  { id: `s-${dayDateStr}-1-2`, setNumber: 2, type: 'work', targetReps: '8', actualReps: 8, targetWeightKg: rdlKg + 7.5, actualWeightKg: rdlKg + 7.5, targetRir: 1, actualRir: 1, targetRpe: 8.5, actualRpe: 8.5, completed: true, restSeconds: 150 }
                ]
              },
              {
                id: `ex-${dayDateStr}-2`,
                name: 'Hip Thrust con Barra',
                muscleGroup: 'Isquios / Glúteo',
                movementPattern: 'Bisagra de Cadera',
                equipment: 'Barra',
                videoUrl: 'https://www.youtube.com/embed/SEdqd1n0cvg',
                coachCues: ['Pausa 2s arriba', 'Tibia vertical'],
                order: 2,
                sets: [
                  { id: `s-${dayDateStr}-2-1`, setNumber: 1, type: 'work', targetReps: '12', actualReps: 12, targetWeightKg: hipThrustKg, actualWeightKg: hipThrustKg, targetRir: 2, actualRir: 2, targetRpe: 8, actualRpe: 8, completed: true, restSeconds: 90 },
                  { id: `s-${dayDateStr}-2-2`, setNumber: 2, type: 'work', targetReps: '10', actualReps: 10, targetWeightKg: hipThrustKg + 10, actualWeightKg: hipThrustKg + 10, targetRir: 1, actualRir: 1, targetRpe: 8.5, actualRpe: 8.5, completed: true, restSeconds: 90 }
                ]
              },
              {
                id: `ex-${dayDateStr}-3`,
                name: 'Plancha Abdominal RKC',
                muscleGroup: 'Core / Abdomen',
                movementPattern: 'Anti-Extensión / Core',
                equipment: 'Peso Corporal',
                videoUrl: 'https://www.youtube.com/embed/ynUw0YsRM4s',
                coachCues: ['Tensión 360°', 'Respiración diafragmática'],
                order: 3,
                sets: [
                  { id: `s-${dayDateStr}-3-1`, setNumber: 1, type: 'work', targetReps: '45 seg', actualReps: 45, targetWeightKg: 0, actualWeightKg: 0, targetRir: 1, actualRir: 1, targetRpe: 8, actualRpe: 8, completed: true, restSeconds: 45 },
                  { id: `s-${dayDateStr}-3-2`, setNumber: 2, type: 'work', targetReps: '45 seg', actualReps: 45, targetWeightKg: 0, actualWeightKg: 0, targetRir: 0, actualRir: 0, targetRpe: 9, actualRpe: 9, completed: true, restSeconds: 45 }
                ]
              }
            ]
          };
        } else {
          // SÁBADO & DOMINGO: Descanso / Sábado Cardio LISS al aire libre o cinta
          const isSat = d === 5;
          workouts[dayDateStr] = {
            id: `w-${dayDateStr}`,
            date: dayDateStr,
            dayName: dayName,
            title: isSat 
              ? `Mes ${m} • Sem ${w} - Cardio LISS & Movilidad Activa`
              : `Mes ${m} • Sem ${w} - Descanso Total & Recuperación SNC`,
            isRestDay: !isSat,
            completed: true,
            cardio: isSat ? [
              {
                id: `c-${dayDateStr}-sat`,
                type: 'caminadora',
                name: 'Running / Trote Continuo Zona 2',
                durationMinutes: 25 + (m * 2),
                distanceKm: parseFloat(((25 + m * 2) * 0.16).toFixed(2)),
                speedKmh: 9.5,
                inclinePct: 1.0,
                rpe: 7,
                caloriesKcal: Math.round((25 + m * 2) * 11),
                completed: true,
                notes: 'Cardio aeróbico de fin de semana para mantener capacidad VO2Max.'
              }
            ] : undefined,
            exercises: []
          };
        }
      }
    }
  }

  return {
    id: 'student-12m',
    fullName: 'Rodrigo Silva (12 Meses - Pro)',
    email: 'rodrigo.silva@email.com',
    password: '1234',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    age: 29,
    heightCm: 177,
    currentWeightKg: 82.5,
    goal: 'Hipertrofia',
    level: 'Avanzado',
    targetDaysPerWeek: 4,
    injuriesOrNotes: 'Macrociclo completo de 12 meses completado. Excelente tolerancia al volumen en torso y piernas.',
    startDate: startDate,
    anthropometryHistory,
    readinessLogs,
    workouts
  };
}
