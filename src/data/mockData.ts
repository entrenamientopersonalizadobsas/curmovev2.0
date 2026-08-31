import { ExerciseItem, MuscleGroup, MovementPattern, StudentProfile, AnthropometryRecord } from '../types';
import { generate12MonthStudent } from './mock12MonthStudent';

export const EXERCISE_DATABASE: Array<{
  name: string;
  muscleGroup: MuscleGroup;
  movementPattern: MovementPattern;
  equipment: 'Barra' | 'Mancuernas' | 'Polea' | 'Máquina' | 'Peso Corporal' | 'Kettlebell';
  videoUrl: string;
  coachCues: string[];
}> = [
  // ── PECHO ──
  {
    name: 'Press de Banca Plano',
    muscleGroup: 'Pecho',
    movementPattern: 'Empuje Horizontal',
    equipment: 'Barra',
    videoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg',
    coachCues: [
      'Retracción escapular firme contra el banco',
      'Pies plantados en el suelo para leg drive',
      'Trayectoria ligeramente en arco hacia el esternón',
      'Pausa de 1 seg en el pecho sin rebotar'
    ]
  },
  {
    name: 'Press Inclinado con Mancuernas',
    muscleGroup: 'Pecho',
    movementPattern: 'Empuje Diagonal',
    equipment: 'Mancuernas',
    videoUrl: 'https://www.youtube.com/embed/8iPEnn-ltC8',
    coachCues: [
      'Inclinación de banco a 30° - 45°',
      'Codos a 45° del torso, no abrir a 90°',
      'Control excéntrico de 3 segundos',
      'Convergencia arriba sin chocar mancuernas'
    ]
  },
  {
    name: 'Press Declinado con Barra',
    muscleGroup: 'Pecho',
    movementPattern: 'Empuje Declinado',
    equipment: 'Barra',
    videoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg',
    coachCues: [
      'Fijación sólida en los rodillos del banco',
      'Énfasis en la porción costal/inferior del pectoral',
      'Recorrido controlado sin rebote'
    ]
  },
  {
    name: 'Aperturas / Cruces en Polea',
    muscleGroup: 'Pecho',
    movementPattern: 'Aislamiento',
    equipment: 'Polea',
    videoUrl: 'https://www.youtube.com/embed/taI4XduLpBe',
    coachCues: [
      'Ligera flexión fija en los codos',
      'Apretar el pectoral en la contracción máxima',
      'Estiramiento profundo sintiendo la fascia'
    ]
  },
  {
    name: 'Fondos en Paralelas (Pecho)',
    muscleGroup: 'Pecho',
    movementPattern: 'Empuje Vertical',
    equipment: 'Peso Corporal',
    videoUrl: 'https://www.youtube.com/embed/2z8JmcrW-As',
    coachCues: [
      'Torso inclinado hacia adelante 30°',
      'Codos ligeramente abiertos al bajar',
      'Rango completo respetando salud de hombros'
    ]
  },

  // ── CUÁDRICEPS ──
  {
    name: 'Sentadilla Trasera con Barra (Back Squat)',
    muscleGroup: 'Cuádriceps',
    movementPattern: 'Dominante de Rodilla',
    equipment: 'Barra',
    videoUrl: 'https://www.youtube.com/embed/bEv6CCg2BC8',
    coachCues: [
      'Bracing abdominal 360° antes de descender',
      'Romper paralelo manteniendo torso compacto',
      'Rodillas alineadas con la punta de los pies',
      'Empuje parejo desde el mediopié'
    ]
  },
  {
    name: 'Prensa Inclinada 45°',
    muscleGroup: 'Cuádriceps',
    movementPattern: 'Dominante de Rodilla',
    equipment: 'Máquina',
    videoUrl: 'https://www.youtube.com/embed/IZxyjW7MPJQ',
    coachCues: [
      'Glúteo pegado al respaldo, evitar retroversión',
      'Rango completo sin bloquear rodillas arriba',
      'Cadencia 3-0-1-0'
    ]
  },
  {
    name: 'Sentadilla Búlgara con Mancuernas',
    muscleGroup: 'Cuádriceps',
    movementPattern: 'Dominante de Rodilla',
    equipment: 'Mancuernas',
    videoUrl: 'https://www.youtube.com/embed/2C-uNgKwPLE',
    coachCues: [
      'Torso vertical para enfatizar cuádriceps',
      'Rodilla delantera busca sobrepasar suavemente la punta del pie',
      'Control excéntrico de 2 a 3 segundos'
    ]
  },
  {
    name: 'Extensión de Cuádriceps',
    muscleGroup: 'Cuádriceps',
    movementPattern: 'Aislamiento',
    equipment: 'Máquina',
    videoUrl: 'https://www.youtube.com/embed/YyvSfVjQeL0',
    coachCues: [
      'Pausa isométrica de 1 segundo en máxima extensión',
      'Mantener la cadera pegada al asiento sosteniendo las manijas'
    ]
  },

  // ── ISQUIOS / GLÚTEO ──
  {
    name: 'Peso Muerto Rumano (RDL)',
    muscleGroup: 'Isquios / Glúteo',
    movementPattern: 'Bisagra de Cadera',
    equipment: 'Barra',
    videoUrl: 'https://www.youtube.com/embed/JCXUYuzwNrM',
    coachCues: [
      'Empujar la cadera hacia atrás como tocando una pared',
      'Barra pegada a los muslos y espinillas',
      'Espalda neutra, cuello alineado',
      'Detener descenso al sentir máximo estiramiento en isquios'
    ]
  },
  {
    name: 'Hip Thrust con Barra',
    muscleGroup: 'Isquios / Glúteo',
    movementPattern: 'Bisagra de Cadera',
    equipment: 'Barra',
    videoUrl: 'https://www.youtube.com/embed/SEdqd1n0cvg',
    coachCues: [
      'Apoyo debajo de las escápulas en el banco',
      'Tibia perpendicular al suelo en la posición alta',
      'Apretar glúteos 2 segundos en el bloqueo',
      'Mirada hacia adelante para proteger zona lumbar'
    ]
  },
  {
    name: 'Curl Femoral Tumbado / Sentado',
    muscleGroup: 'Isquios / Glúteo',
    movementPattern: 'Aislamiento',
    equipment: 'Máquina',
    videoUrl: 'https://www.youtube.com/embed/1Tq3QdYUuHs',
    coachCues: [
      'Dorsiflexión en tobillos durante la flexión',
      'Bajar lento en 3 segundos sintiendo el estiramiento'
    ]
  },
  {
    name: 'Abducción de Cadera en Máquina',
    muscleGroup: 'Isquios / Glúteo',
    movementPattern: 'Aislamiento',
    equipment: 'Máquina',
    videoUrl: 'https://www.youtube.com/embed/1Tq3QdYUuHs',
    coachCues: [
      'Torso ligeramente inclinado al frente para mayor activación de glúteo medio',
      'Pausa de 1 segundo en máxima apertura'
    ]
  },

  // ── ESPALDA ──
  {
    name: 'Dominadas Pronas / Neutras',
    muscleGroup: 'Espalda',
    movementPattern: 'Tirón Vertical',
    equipment: 'Peso Corporal',
    videoUrl: 'https://www.youtube.com/embed/eGo4IYlbE5g',
    coachCues: [
      'Depresión escapular antes de flexionar brazos',
      'Pecho hacia la barra buscando tocar con la clavícula',
      'Control total en la bajada hasta extensión completa'
    ]
  },
  {
    name: 'Jalón al Pecho en Polea Alta',
    muscleGroup: 'Espalda',
    movementPattern: 'Tirón Vertical',
    equipment: 'Polea',
    videoUrl: 'https://www.youtube.com/embed/CAwf7n6Luuc',
    coachCues: [
      'Agarre algo más ancho que los hombros',
      'Llevar codos hacia los bolsillos traseros',
      'No balancear el torso exageradamente'
    ]
  },
  {
    name: 'Remo con Barra 45°',
    muscleGroup: 'Espalda',
    movementPattern: 'Tirón Horizontal',
    equipment: 'Barra',
    videoUrl: 'https://www.youtube.com/embed/G8l_8chR5BE',
    coachCues: [
      'Tronco estable en 45°, core activo',
      'Tirar de los codos hacia la cadera',
      'Apretar la espalda media en cada repetición'
    ]
  },
  {
    name: 'Remo Gironda en Polea Baja',
    muscleGroup: 'Espalda',
    movementPattern: 'Tirón Horizontal',
    equipment: 'Polea',
    videoUrl: 'https://www.youtube.com/embed/GZbfZ033fbo',
    coachCues: [
      'Espalda erguida, estirar escápulas adelante al ceder peso',
      'Retracción completa y toque en abdomen bajo'
    ]
  },
  {
    name: 'Pullover en Polea Alta con Cuerda',
    muscleGroup: 'Espalda',
    movementPattern: 'Aislamiento',
    equipment: 'Polea',
    videoUrl: 'https://www.youtube.com/embed/G8l_8chR5BE',
    coachCues: [
      'Brazos casi extendidos con codos ligeramente flexionados',
      'Empujar hacia abajo y hacia la cadera contrayendo el dorsal'
    ]
  },

  // ── HOMBROS ──
  {
    name: 'Press Militar con Barra',
    muscleGroup: 'Hombros',
    movementPattern: 'Empuje Vertical',
    equipment: 'Barra',
    videoUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI',
    coachCues: [
      'Glúteos y abdomen contraídos para base rígida',
      'Barra pasa cerca de la nariz',
      'Bloqueo sobre la cabeza pasando la cabeza al frente'
    ]
  },
  {
    name: 'Press Arnold con Mancuernas',
    muscleGroup: 'Hombros',
    movementPattern: 'Empuje Vertical',
    equipment: 'Mancuernas',
    videoUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI',
    coachCues: [
      'Rotación fluida desde supinación al inicio hasta pronación arriba',
      'Control del recorrido sin arquear la zona lumbar'
    ]
  },
  {
    name: 'Elevaciones Laterales con Mancuernas',
    muscleGroup: 'Hombros',
    movementPattern: 'Aislamiento',
    equipment: 'Mancuernas',
    videoUrl: 'https://www.youtube.com/embed/3VcKaXpzqRo',
    coachCues: [
      'Plano escapular (30° adelante del torso)',
      'Subir con los codos liderando hasta altura de hombros',
      'Evitar trampear con las piernas'
    ]
  },
  {
    name: 'Face Pull en Polea',
    muscleGroup: 'Hombros',
    movementPattern: 'Tirón Horizontal',
    equipment: 'Polea',
    videoUrl: 'https://www.youtube.com/embed/rep-qVOkqgk',
    coachCues: [
      'Cuerda a la altura de la frente o nariz',
      'Rotación externa de hombro al final del tirón',
      'Excelente para salud del manguito rotador'
    ]
  },
  {
    name: 'Pájaros / Elevaciones Posteriores',
    muscleGroup: 'Hombros',
    movementPattern: 'Aislamiento',
    equipment: 'Mancuernas',
    videoUrl: 'https://www.youtube.com/embed/3VcKaXpzqRo',
    coachCues: [
      'Torso paralelo al suelo',
      'Abrir en arco sintiendo el deltoides posterior'
    ]
  },

  // ── BRAZOS ──
  {
    name: 'Curl de Bíceps con Barra Z',
    muscleGroup: 'Brazos',
    movementPattern: 'Aislamiento',
    equipment: 'Barra',
    videoUrl: 'https://www.youtube.com/embed/in7PaeYlhrM',
    coachCues: [
      'Codos pegados a los costados',
      'Evitar balanceo lumbar',
      'Excéntrica controlada'
    ]
  },
  {
    name: 'Curl Martillo con Mancuernas',
    muscleGroup: 'Brazos',
    movementPattern: 'Aislamiento',
    equipment: 'Mancuernas',
    videoUrl: 'https://www.youtube.com/embed/in7PaeYlhrM',
    coachCues: [
      'Agarre neutro continuo para enfatizar braquiorradial y braquial',
      'Movimiento estricto sin impulso'
    ]
  },
  {
    name: 'Extensión de Tríceps en Polea Alta',
    muscleGroup: 'Brazos',
    movementPattern: 'Aislamiento',
    equipment: 'Polea',
    videoUrl: 'https://www.youtube.com/embed/2-LAMcpzODU',
    coachCues: [
      'Fijar la posición de los codos en el espacio',
      'Extensión completa abriendo la cuerda al final',
      'Controlar la subida a 90°'
    ]
  },
  {
    name: 'Press Francés con Mancuernas',
    muscleGroup: 'Brazos',
    movementPattern: 'Aislamiento',
    equipment: 'Mancuernas',
    videoUrl: 'https://www.youtube.com/embed/6SS6K3lAwZ8',
    coachCues: [
      'Codos apuntando ligeramente hacia atrás para tensión continua',
      'Bajar mancuernas a los lados de la cabeza'
    ]
  },

  // ── CORE / ABDOMEN ──
  {
    name: 'Plancha Abdominal RKC',
    muscleGroup: 'Core / Abdomen',
    movementPattern: 'Anti-Extensión / Core',
    equipment: 'Peso Corporal',
    videoUrl: 'https://www.youtube.com/embed/ynUw0YsRM4s',
    coachCues: [
      'Máxima contracción de glúteos, cuádriceps y abdomen',
      'Tirar los codos hacia las puntas de los pies activamente',
      'Respiraciones diafragmáticas cortas y potentes'
    ]
  },
  {
    name: 'Press Pallof en Polea',
    muscleGroup: 'Core / Abdomen',
    movementPattern: 'Rotación / Anti-Rotación',
    equipment: 'Polea',
    videoUrl: 'https://www.youtube.com/embed/ynUw0YsRM4s',
    coachCues: [
      'Resistir el torque de rotación con el core',
      'Extensión completa de brazos y pausa 2 segundos'
    ]
  },
  {
    name: 'Paseo del Granjero (Farmer Walk)',
    muscleGroup: 'Core / Abdomen',
    movementPattern: 'Transporte / Carga',
    equipment: 'Mancuernas',
    videoUrl: 'https://www.youtube.com/embed/ynUw0YsRM4s',
    coachCues: [
      'Torso rígido, hombros encajados atrás',
      'Pasos cortos y controlados manteniendo postura perfecta'
    ]
  },

  // ── PANTORRILLAS ──
  {
    name: 'Elevación de Talones en Máquina (De Pie)',
    muscleGroup: 'Pantorrillas',
    movementPattern: 'Flexión Plantar',
    equipment: 'Máquina',
    videoUrl: 'https://www.youtube.com/embed/gwLzBJYoWlI',
    coachCues: [
      'Pausa de 2 segundos en máximo estiramiento abajo',
      'Subir explosivo y apretar arriba 1 segundo con rodillas extendidas'
    ]
  },
  {
    name: 'Elevación de Talones Sentado (Sóleo)',
    muscleGroup: 'Pantorrillas',
    movementPattern: 'Flexión Plantar',
    equipment: 'Máquina',
    videoUrl: 'https://www.youtube.com/embed/gwLzBJYoWlI',
    coachCues: [
      'Rodillas flexionadas a 90° para aislar el sóleo',
      'Rango completo con pausa abajo'
    ]
  }
];

// Helper to generate current week dates
export function getWeekDates(baseDate = new Date()): string[] {
  const current = new Date(baseDate);
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(current.setDate(diff));

  const week: string[] = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    week.push(nextDay.toISOString().split('T')[0]);
  }
  return week;
}

const weekDates = getWeekDates();

export const INITIAL_STUDENTS: StudentProfile[] = [
  generate12MonthStudent(),
  {
    id: 'student-1',
    fullName: 'Martín Rossi',
    email: 'martin.rossi@email.com',
    password: '1234',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    age: 28,
    heightCm: 178,
    currentWeightKg: 81.4,
    goal: 'Hipertrofia',
    level: 'Intermedio',
    targetDaysPerWeek: 4,
    injuriesOrNotes: 'Ligera sobrecarga en hombro derecho al hacer press banca plano muy abierto. Preferir agarre neutro o mancuernas.',
    startDate: '2025-10-15',
    anthropometryHistory: [
      {
        id: 'anthro-1',
        date: '2025-10-15',
        weightKg: 85.2,
        heightCm: 178,
        bodyFatPct: 18.5,
        muscleMassKg: 38.0,
        chestCm: 102,
        waistCm: 86,
        hipCm: 99,
        armRightCm: 37.0,
        thighRightCm: 59.0,
        calfRightCm: 37.5,
        notes: 'Evaluación inicial. Objetivo bajar grasa y ganar 2kg masa magra.'
      },
      {
        id: 'anthro-2',
        date: '2025-12-01',
        weightKg: 83.0,
        heightCm: 178,
        bodyFatPct: 16.2,
        muscleMassKg: 38.8,
        chestCm: 103,
        waistCm: 83,
        hipCm: 97,
        armRightCm: 37.5,
        thighRightCm: 59.5,
        calfRightCm: 38.0,
        notes: 'Reducción de cintura notable, buena adherencia al plan.'
      },
      {
        id: 'anthro-3',
        date: '2026-02-10',
        weightKg: 81.4,
        heightCm: 178,
        bodyFatPct: 14.1,
        muscleMassKg: 39.5,
        chestCm: 105,
        waistCm: 80,
        hipCm: 96,
        armRightCm: 38.5,
        thighRightCm: 60.5,
        calfRightCm: 38.5,
        notes: 'Gran progreso en hipertrofia de torso y definición abdominal.'
      }
    ],
    readinessLogs: {
      [weekDates[0]]: {
        date: weekDates[0],
        energyLevel: 4,
        fatigueLevel: 2,
        muscleSoreness: 2,
        sleepHours: 7.5,
        mood: 'Excelente',
        notes: 'Descansé muy bien el fin de semana. Listo para empuje.'
      },
      [weekDates[1]]: {
        date: weekDates[1],
        energyLevel: 5,
        fatigueLevel: 1,
        muscleSoreness: 1,
        sleepHours: 8.0,
        mood: 'Excelente',
        notes: 'Energía al 100%. Las piernas responden de 10.'
      },
      [weekDates[2]]: {
        date: weekDates[2],
        energyLevel: 3,
        fatigueLevel: 3,
        muscleSoreness: 3,
        sleepHours: 6.5,
        mood: 'Regular',
        notes: 'Día de descanso activo, leve cansancio laboral.'
      }
    },
    workouts: {
      [weekDates[0]]: {
        id: `w-${weekDates[0]}`,
        date: weekDates[0],
        dayName: 'Lunes',
        title: 'Torso: Empuje & Pecho / Hombros',
        isRestDay: false,
        completed: true,
        studentFeedback: 'Salió muy sólido el press inclinado. Buenas sensaciones en RIR 2.',
        exercises: [
          {
            id: 'ex-1',
            name: 'Press de Banca Plano',
            muscleGroup: 'Pecho',
            movementPattern: 'Empuje Horizontal',
            equipment: 'Barra',
            videoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg',
            coachCues: ['Retracción escapular firme', 'Pies plantados', 'Pausa 1s abajo'],
            order: 1,
            sets: [
              {
                id: 's-1-1',
                setNumber: 1,
                type: 'warmup',
                targetReps: '12',
                actualReps: 12,
                targetWeightKg: 40,
                actualWeightKg: 40,
                targetRir: 4,
                actualRir: 4,
                targetRpe: 6,
                actualRpe: 6,
                completed: true,
                restSeconds: 90
              },
              {
                id: 's-1-2',
                setNumber: 2,
                type: 'work',
                targetReps: '8',
                actualReps: 8,
                targetWeightKg: 80,
                actualWeightKg: 80,
                targetRir: 2,
                actualRir: 2,
                targetRpe: 8,
                actualRpe: 8,
                completed: true,
                restSeconds: 120
              },
              {
                id: 's-1-3',
                setNumber: 3,
                type: 'work',
                targetReps: '8',
                actualReps: 8,
                targetWeightKg: 82.5,
                actualWeightKg: 82.5,
                targetRir: 1,
                actualRir: 1,
                targetRpe: 8.5,
                actualRpe: 8.5,
                completed: true,
                restSeconds: 150
              },
              {
                id: 's-1-4',
                setNumber: 4,
                type: 'work',
                targetReps: '6',
                actualReps: 6,
                targetWeightKg: 85,
                actualWeightKg: 85,
                targetRir: 1,
                actualRir: 1,
                targetRpe: 9,
                actualRpe: 9,
                completed: true,
                restSeconds: 150
              }
            ]
          },
          {
            id: 'ex-2',
            name: 'Press Inclinado con Mancuernas',
            muscleGroup: 'Pecho',
            movementPattern: 'Empuje Horizontal',
            equipment: 'Mancuernas',
            videoUrl: 'https://www.youtube.com/embed/8iPEnn-ltC8',
            coachCues: ['Banco a 30°', 'Control excéntrico 3s'],
            order: 2,
            sets: [
              {
                id: 's-2-1',
                setNumber: 1,
                type: 'work',
                targetReps: '10',
                actualReps: 10,
                targetWeightKg: 28,
                actualWeightKg: 28,
                targetRir: 2,
                actualRir: 2,
                targetRpe: 8,
                actualRpe: 8,
                completed: true,
                restSeconds: 90
              },
              {
                id: 's-2-2',
                setNumber: 2,
                type: 'work',
                targetReps: '10',
                actualReps: 9,
                targetWeightKg: 30,
                actualWeightKg: 30,
                targetRir: 1,
                actualRir: 1,
                targetRpe: 8.5,
                actualRpe: 9,
                completed: true,
                restSeconds: 90
              },
              {
                id: 's-2-3',
                setNumber: 3,
                type: 'work',
                targetReps: '10',
                actualReps: 8,
                targetWeightKg: 30,
                actualWeightKg: 30,
                targetRir: 0,
                actualRir: 0,
                targetRpe: 9.5,
                actualRpe: 9.5,
                completed: true,
                restSeconds: 90
              }
            ]
          },
          {
            id: 'ex-3',
            name: 'Elevaciones Laterales con Mancuernas',
            muscleGroup: 'Hombros',
            movementPattern: 'Aislamiento',
            equipment: 'Mancuernas',
            videoUrl: 'https://www.youtube.com/embed/3VcKaXpzqRo',
            coachCues: ['Plano escapular 30°', 'No balancear torso'],
            order: 3,
            sets: [
              {
                id: 's-3-1',
                setNumber: 1,
                type: 'work',
                targetReps: '15',
                actualReps: 15,
                targetWeightKg: 10,
                actualWeightKg: 10,
                targetRir: 2,
                actualRir: 2,
                targetRpe: 8,
                actualRpe: 8,
                completed: true,
                restSeconds: 60
              },
              {
                id: 's-3-2',
                setNumber: 2,
                type: 'work',
                targetReps: '15',
                actualReps: 14,
                targetWeightKg: 10,
                actualWeightKg: 10,
                targetRir: 1,
                actualRir: 1,
                targetRpe: 8.5,
                actualRpe: 8.5,
                completed: true,
                restSeconds: 60
              },
              {
                id: 's-3-3',
                setNumber: 3,
                type: 'dropset',
                targetReps: '12 + 8',
                actualReps: 12,
                targetWeightKg: 12,
                actualWeightKg: 12,
                targetRir: 0,
                actualRir: 0,
                targetRpe: 10,
                actualRpe: 10,
                completed: true,
                restSeconds: 60
              }
            ]
          },
          {
            id: 'ex-4',
            name: 'Extensión de Tríceps en Polea Alta',
            muscleGroup: 'Brazos',
            movementPattern: 'Aislamiento',
            equipment: 'Polea',
            videoUrl: 'https://www.youtube.com/embed/2-LAMcpzODU',
            coachCues: ['Fijar codos a los costados', 'Abrir cuerda al final'],
            order: 4,
            sets: [
              {
                id: 's-4-1',
                setNumber: 1,
                type: 'work',
                targetReps: '12',
                actualReps: 12,
                targetWeightKg: 25,
                actualWeightKg: 25,
                targetRir: 2,
                actualRir: 2,
                targetRpe: 8,
                actualRpe: 8,
                completed: true,
                restSeconds: 60
              },
              {
                id: 's-4-2',
                setNumber: 2,
                type: 'work',
                targetReps: '12',
                actualReps: 12,
                targetWeightKg: 27.5,
                actualWeightKg: 27.5,
                targetRir: 1,
                actualRir: 1,
                targetRpe: 8.5,
                actualRpe: 8.5,
                completed: true,
                restSeconds: 60
              }
            ]
          }
        ]
      },
      [weekDates[1]]: {
        id: `w-${weekDates[1]}`,
        date: weekDates[1],
        dayName: 'Martes',
        title: 'Pierna: Dominante Cuádriceps & Glúteo',
        isRestDay: false,
        completed: false,
        exercises: [
          {
            id: 'ex-2-1',
            name: 'Sentadilla Trasera con Barra (Back Squat)',
            muscleGroup: 'Cuádriceps',
            movementPattern: 'Dominante de Rodilla',
            equipment: 'Barra',
            videoUrl: 'https://www.youtube.com/embed/bEv6CCg2BC8',
            coachCues: ['Bracing profundo 360°', 'Romper paralelo', 'Cadencia 3-1-X-0'],
            order: 1,
            sets: [
              {
                id: 's-21-1',
                setNumber: 1,
                type: 'warmup',
                targetReps: '10',
                targetWeightKg: 60,
                targetRir: 4,
                targetRpe: 6,
                completed: false,
                restSeconds: 120
              },
              {
                id: 's-21-2',
                setNumber: 2,
                type: 'work',
                targetReps: '6',
                targetWeightKg: 100,
                targetRir: 2,
                targetRpe: 8,
                completed: false,
                restSeconds: 150
              },
              {
                id: 's-21-3',
                setNumber: 3,
                type: 'work',
                targetReps: '6',
                targetWeightKg: 105,
                targetRir: 2,
                targetRpe: 8,
                completed: false,
                restSeconds: 180
              },
              {
                id: 's-21-4',
                setNumber: 4,
                type: 'work',
                targetReps: '6',
                targetWeightKg: 110,
                targetRir: 1,
                targetRpe: 8.5,
                completed: false,
                restSeconds: 180
              }
            ]
          },
          {
            id: 'ex-2-2',
            name: 'Prensa Inclinada 45°',
            muscleGroup: 'Cuádriceps',
            movementPattern: 'Dominante de Rodilla',
            equipment: 'Máquina',
            videoUrl: 'https://www.youtube.com/embed/IZxyjW7MPJQ',
            coachCues: ['Pies al ancho de cadera', 'Rango profundo sin despegar pelvis'],
            order: 2,
            sets: [
              {
                id: 's-22-1',
                setNumber: 1,
                type: 'work',
                targetReps: '12',
                targetWeightKg: 180,
                targetRir: 2,
                targetRpe: 8,
                completed: false,
                restSeconds: 90
              },
              {
                id: 's-22-2',
                setNumber: 2,
                type: 'work',
                targetReps: '10',
                targetWeightKg: 200,
                targetRir: 1,
                targetRpe: 8.5,
                completed: false,
                restSeconds: 90
              },
              {
                id: 's-22-3',
                setNumber: 3,
                type: 'work',
                targetReps: '10',
                targetWeightKg: 210,
                targetRir: 0,
                targetRpe: 9.5,
                completed: false,
                restSeconds: 120
              }
            ]
          },
          {
            id: 'ex-2-3',
            name: 'Extensión de Cuádriceps',
            muscleGroup: 'Cuádriceps',
            movementPattern: 'Aislamiento',
            equipment: 'Máquina',
            videoUrl: 'https://www.youtube.com/embed/YyvSfVjQeL0',
            coachCues: ['Pausa isométrica 1s arriba', 'Bajar en 3s'],
            order: 3,
            sets: [
              {
                id: 's-23-1',
                setNumber: 1,
                type: 'work',
                targetReps: '15',
                targetWeightKg: 55,
                targetRir: 1,
                targetRpe: 8.5,
                completed: false,
                restSeconds: 60
              },
              {
                id: 's-23-2',
                setNumber: 2,
                type: 'dropset',
                targetReps: '12 + 10',
                targetWeightKg: 60,
                targetRir: 0,
                targetRpe: 10,
                completed: false,
                restSeconds: 60
              }
            ]
          },
          {
            id: 'ex-2-4',
            name: 'Elevación de Talones en Máquina',
            muscleGroup: 'Pantorrillas',
            movementPattern: 'Aislamiento',
            equipment: 'Máquina',
            videoUrl: 'https://www.youtube.com/embed/gwLzBJYoWlI',
            coachCues: ['Pausa de 2s abajo', 'Sin rebote'],
            order: 4,
            sets: [
              {
                id: 's-24-1',
                setNumber: 1,
                type: 'work',
                targetReps: '15',
                targetWeightKg: 40,
                targetRir: 1,
                targetRpe: 8.5,
                completed: false,
                restSeconds: 60
              },
              {
                id: 's-24-2',
                setNumber: 2,
                type: 'work',
                targetReps: '15',
                targetWeightKg: 45,
                targetRir: 0,
                targetRpe: 9.5,
                completed: false,
                restSeconds: 60
              }
            ]
          }
        ]
      },
      [weekDates[2]]: {
        id: `w-${weekDates[2]}`,
        date: weekDates[2],
        dayName: 'Miércoles',
        title: 'Descanso Activo / Movilidad',
        isRestDay: true,
        completed: false,
        exercises: []
      },
      [weekDates[3]]: {
        id: `w-${weekDates[3]}`,
        date: weekDates[3],
        dayName: 'Jueves',
        title: 'Torso: Tirón & Espalda / Bíceps',
        isRestDay: false,
        completed: false,
        exercises: [
          {
            id: 'ex-4-1',
            name: 'Dominadas Pronas / Neutras',
            muscleGroup: 'Espalda',
            movementPattern: 'Tirón Vertical',
            equipment: 'Peso Corporal',
            videoUrl: 'https://www.youtube.com/embed/eGo4IYlbE5g',
            coachCues: ['Pecho a la barra', 'Depresión escapular', 'Bajar hasta extensión completa'],
            order: 1,
            sets: [
              {
                id: 's-41-1',
                setNumber: 1,
                type: 'work',
                targetReps: '8',
                targetWeightKg: 0,
                targetRir: 2,
                targetRpe: 8,
                completed: false,
                restSeconds: 120
              },
              {
                id: 's-41-2',
                setNumber: 2,
                type: 'work',
                targetReps: '8',
                targetWeightKg: 0,
                targetRir: 1,
                targetRpe: 8.5,
                completed: false,
                restSeconds: 120
              },
              {
                id: 's-41-3',
                setNumber: 3,
                type: 'work',
                targetReps: '6',
                targetWeightKg: 5,
                targetRir: 1,
                targetRpe: 9,
                completed: false,
                restSeconds: 150
              }
            ]
          },
          {
            id: 'ex-4-2',
            name: 'Remo con Barra 45°',
            muscleGroup: 'Espalda',
            movementPattern: 'Tirón Horizontal',
            equipment: 'Barra',
            videoUrl: 'https://www.youtube.com/embed/G8l_8chR5BE',
            coachCues: ['Tronco en 45° firme', 'Codos hacia la cadera'],
            order: 2,
            sets: [
              {
                id: 's-42-1',
                setNumber: 1,
                type: 'work',
                targetReps: '10',
                targetWeightKg: 70,
                targetRir: 2,
                targetRpe: 8,
                completed: false,
                restSeconds: 90
              },
              {
                id: 's-42-2',
                setNumber: 2,
                type: 'work',
                targetReps: '8',
                targetWeightKg: 75,
                targetRir: 1,
                targetRpe: 8.5,
                completed: false,
                restSeconds: 90
              }
            ]
          },
          {
            id: 'ex-4-3',
            name: 'Curl de Bíceps con Barra Z',
            muscleGroup: 'Brazos',
            movementPattern: 'Aislamiento',
            equipment: 'Barra',
            videoUrl: 'https://www.youtube.com/embed/in7PaeYlhrM',
            coachCues: ['Codos inmóviles a los lados', 'Apretar bíceps arriba'],
            order: 3,
            sets: [
              {
                id: 's-43-1',
                setNumber: 1,
                type: 'work',
                targetReps: '12',
                targetWeightKg: 30,
                targetRir: 2,
                targetRpe: 8,
                completed: false,
                restSeconds: 60
              },
              {
                id: 's-43-2',
                setNumber: 2,
                type: 'work',
                targetReps: '10',
                targetWeightKg: 32.5,
                targetRir: 1,
                targetRpe: 8.5,
                completed: false,
                restSeconds: 60
              }
            ]
          }
        ]
      },
      [weekDates[4]]: {
        id: `w-${weekDates[4]}`,
        date: weekDates[4],
        dayName: 'Viernes',
        title: 'Pierna: Isquios & Glúteos + Core',
        isRestDay: false,
        completed: false,
        exercises: [
          {
            id: 'ex-5-1',
            name: 'Peso Muerto Rumano (RDL)',
            muscleGroup: 'Isquios / Glúteo',
            movementPattern: 'Bisagra de Cadera',
            equipment: 'Barra',
            videoUrl: 'https://www.youtube.com/embed/JCXUYuzwNrM',
            coachCues: ['Cadera hacia la pared', 'Barra rozando piernas', 'Columna neutra'],
            order: 1,
            sets: [
              {
                id: 's-51-1',
                setNumber: 1,
                type: 'work',
                targetReps: '10',
                targetWeightKg: 90,
                targetRir: 2,
                targetRpe: 8,
                completed: false,
                restSeconds: 120
              },
              {
                id: 's-51-2',
                setNumber: 2,
                type: 'work',
                targetReps: '8',
                targetWeightKg: 100,
                targetRir: 1,
                targetRpe: 8.5,
                completed: false,
                restSeconds: 150
              }
            ]
          },
          {
            id: 'ex-5-2',
            name: 'Hip Thrust con Barra',
            muscleGroup: 'Isquios / Glúteo',
            movementPattern: 'Bisagra de Cadera',
            equipment: 'Barra',
            videoUrl: 'https://www.youtube.com/embed/SEdqd1n0cvg',
            coachCues: ['Pausa de 2 segundos arriba', 'Tibia vertical'],
            order: 2,
            sets: [
              {
                id: 's-52-1',
                setNumber: 1,
                type: 'work',
                targetReps: '12',
                targetWeightKg: 120,
                targetRir: 2,
                targetRpe: 8,
                completed: false,
                restSeconds: 90
              },
              {
                id: 's-52-2',
                setNumber: 2,
                type: 'work',
                targetReps: '10',
                targetWeightKg: 130,
                targetRir: 1,
                targetRpe: 8.5,
                completed: false,
                restSeconds: 90
              }
            ]
          },
          {
            id: 'ex-5-3',
            name: 'Plancha Abdominal RKC',
            muscleGroup: 'Core / Abdomen',
            movementPattern: 'Anti-Extensión / Core',
            equipment: 'Peso Corporal',
            videoUrl: 'https://www.youtube.com/embed/ynUw0YsRM4s',
            coachCues: ['Tensión total en glúteos y abdomen', 'Series de 30-45 seg'],
            order: 3,
            sets: [
              {
                id: 's-53-1',
                setNumber: 1,
                type: 'work',
                targetReps: '45 seg',
                targetWeightKg: 0,
                targetRir: 1,
                targetRpe: 8,
                completed: false,
                restSeconds: 45
              },
              {
                id: 's-53-2',
                setNumber: 2,
                type: 'work',
                targetReps: '45 seg',
                targetWeightKg: 0,
                targetRir: 0,
                targetRpe: 9,
                completed: false,
                restSeconds: 45
              }
            ]
          }
        ]
      },
      [weekDates[5]]: {
        id: `w-${weekDates[5]}`,
        date: weekDates[5],
        dayName: 'Sábado',
        title: 'Descanso / Recuperación',
        isRestDay: true,
        completed: false,
        exercises: []
      },
      [weekDates[6]]: {
        id: `w-${weekDates[6]}`,
        date: weekDates[6],
        dayName: 'Domingo',
        title: 'Descanso / Planificación Semanal',
        isRestDay: true,
        completed: false,
        exercises: []
      }
    }
  },
  {
    id: 'student-2',
    fullName: 'Sofía Gómez',
    email: 'sofia.gomez@email.com',
    password: '1234',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    age: 24,
    heightCm: 165,
    currentWeightKg: 60.2,
    goal: 'Fuerza Máxima',
    level: 'Avanzado',
    targetDaysPerWeek: 4,
    injuriesOrNotes: 'Ninguna lesión reportada. Enfoque en powerlifting (Squat / Bench / Deadlift).',
    startDate: '2025-08-01',
    anthropometryHistory: [
      {
        id: 'anthro-s1',
        date: '2025-08-01',
        weightKg: 58.0,
        heightCm: 165,
        bodyFatPct: 21.0,
        muscleMassKg: 26.5,
        chestCm: 88,
        waistCm: 68,
        hipCm: 94,
        armRightCm: 28.0,
        thighRightCm: 53.0,
        calfRightCm: 34.0,
        notes: 'Inicio de preparación para torneo.'
      }
    ],
    readinessLogs: {},
    workouts: {}
  },
  {
    id: 'student-3',
    fullName: 'Lucas Benítez',
    email: 'lucas.benitez@email.com',
    password: '1234',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    age: 32,
    heightCm: 182,
    currentWeightKg: 90.0,
    goal: 'Pérdida de Grasa',
    level: 'Principiante',
    targetDaysPerWeek: 3,
    injuriesOrNotes: 'Molestia en rodilla izquierda en flexión profunda. Evitar sentadillas profundas sin calentar.',
    startDate: '2026-01-10',
    anthropometryHistory: [],
    readinessLogs: {},
    workouts: {}
  }
];

export const MUSCLE_GROUPS_LIST: MuscleGroup[] = [
  'Pecho',
  'Espalda',
  'Cuádriceps',
  'Isquios / Glúteo',
  'Hombros',
  'Brazos',
  'Core / Abdomen',
  'Pantorrillas'
];

export const DEFAULT_TEMPLATES = {
  torso: {
    title: 'Torso: Hipertrofia & Fuerza',
    exercises: [
      {
        id: 'tpl-1',
        name: 'Press de Banca Plano',
        muscleGroup: 'Pecho' as MuscleGroup,
        movementPattern: 'Empuje Horizontal' as MovementPattern,
        equipment: 'Barra' as const,
        videoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg',
        coachCues: ['Retracción escapular', 'Pausa abajo'],
        order: 1,
        sets: [
          { id: 's1', setNumber: 1, type: 'work' as const, targetReps: '8', targetWeightKg: 80, targetRir: 2, targetRpe: 8, completed: false, restSeconds: 120 },
          { id: 's2', setNumber: 2, type: 'work' as const, targetReps: '8', targetWeightKg: 80, targetRir: 2, targetRpe: 8, completed: false, restSeconds: 120 },
          { id: 's3', setNumber: 3, type: 'work' as const, targetReps: '8', targetWeightKg: 80, targetRir: 1, targetRpe: 8.5, completed: false, restSeconds: 120 }
        ]
      },
      {
        id: 'tpl-2',
        name: 'Remo con Barra 45°',
        muscleGroup: 'Espalda' as MuscleGroup,
        movementPattern: 'Tirón Horizontal' as MovementPattern,
        equipment: 'Barra' as const,
        videoUrl: 'https://www.youtube.com/embed/G8l_8chR5BE',
        coachCues: ['Tronco en 45°', 'Codos hacia atrás'],
        order: 2,
        sets: [
          { id: 's4', setNumber: 1, type: 'work' as const, targetReps: '10', targetWeightKg: 70, targetRir: 2, targetRpe: 8, completed: false, restSeconds: 90 },
          { id: 's5', setNumber: 2, type: 'work' as const, targetReps: '10', targetWeightKg: 70, targetRir: 1, targetRpe: 8.5, completed: false, restSeconds: 90 }
        ]
      },
      {
        id: 'tpl-3',
        name: 'Elevaciones Laterales con Mancuernas',
        muscleGroup: 'Hombros' as MuscleGroup,
        movementPattern: 'Aislamiento' as MovementPattern,
        equipment: 'Mancuernas' as const,
        videoUrl: 'https://www.youtube.com/embed/3VcKaXpzqRo',
        coachCues: ['Plano escapular 30°'],
        order: 3,
        sets: [
          { id: 's6', setNumber: 1, type: 'work' as const, targetReps: '15', targetWeightKg: 10, targetRir: 1, targetRpe: 8.5, completed: false, restSeconds: 60 },
          { id: 's7', setNumber: 2, type: 'work' as const, targetReps: '15', targetWeightKg: 10, targetRir: 0, targetRpe: 9.5, completed: false, restSeconds: 60 }
        ]
      }
    ]
  },
  pierna: {
    title: 'Pierna: Cuádriceps & Isquios',
    exercises: [
      {
        id: 'tpl-p1',
        name: 'Sentadilla Trasera con Barra (Back Squat)',
        muscleGroup: 'Cuádriceps' as MuscleGroup,
        movementPattern: 'Dominante de Rodilla' as MovementPattern,
        equipment: 'Barra' as const,
        videoUrl: 'https://www.youtube.com/embed/bEv6CCg2BC8',
        coachCues: ['Bracing 360°', 'Romper paralelo'],
        order: 1,
        sets: [
          { id: 'sp1', setNumber: 1, type: 'work' as const, targetReps: '6', targetWeightKg: 100, targetRir: 2, targetRpe: 8, completed: false, restSeconds: 150 },
          { id: 'sp2', setNumber: 2, type: 'work' as const, targetReps: '6', targetWeightKg: 105, targetRir: 1, targetRpe: 8.5, completed: false, restSeconds: 180 }
        ]
      },
      {
        id: 'tpl-p2',
        name: 'Peso Muerto Rumano (RDL)',
        muscleGroup: 'Isquios / Glúteo' as MuscleGroup,
        movementPattern: 'Bisagra de Cadera' as MovementPattern,
        equipment: 'Barra' as const,
        videoUrl: 'https://www.youtube.com/embed/JCXUYuzwNrM',
        coachCues: ['Cadera atrás', 'Espalda recta'],
        order: 2,
        sets: [
          { id: 'sp3', setNumber: 1, type: 'work' as const, targetReps: '10', targetWeightKg: 90, targetRir: 2, targetRpe: 8, completed: false, restSeconds: 120 },
          { id: 'sp4', setNumber: 2, type: 'work' as const, targetReps: '8', targetWeightKg: 100, targetRir: 1, targetRpe: 8.5, completed: false, restSeconds: 150 }
        ]
      }
    ]
  },
  tiron: {
    title: 'Tirón: Espalda & Bíceps',
    exercises: [
      {
        id: 'tpl-t1',
        name: 'Dominadas Pronas / Neutras',
        muscleGroup: 'Espalda' as MuscleGroup,
        movementPattern: 'Tirón Vertical' as MovementPattern,
        equipment: 'Peso Corporal' as const,
        videoUrl: 'https://www.youtube.com/embed/eGo4IYlbE5g',
        coachCues: ['Pecho a la barra'],
        order: 1,
        sets: [
          { id: 'st1', setNumber: 1, type: 'work' as const, targetReps: '8', targetWeightKg: 0, targetRir: 2, targetRpe: 8, completed: false, restSeconds: 120 },
          { id: 'st2', setNumber: 2, type: 'work' as const, targetReps: '8', targetWeightKg: 0, targetRir: 1, targetRpe: 8.5, completed: false, restSeconds: 120 }
        ]
      }
    ]
  }
};

export const MOVEMENT_PATTERNS_LIST: MovementPattern[] = [
  'Empuje Horizontal',
  'Empuje Vertical',
  'Empuje Diagonal',
  'Empuje Declinado',
  'Tirón Horizontal',
  'Tirón Vertical',
  'Dominante de Rodilla',
  'Bisagra de Cadera',
  'Aislamiento',
  'Anti-Extensión / Core',
  'Rotación / Anti-Rotación',
  'Transporte / Carga',
  'Flexión Plantar'
];
