export type ViewMode = 'trainer' | 'student';

export type MuscleGroup = 
  | 'Pecho' 
  | 'Espalda' 
  | 'Cuádriceps' 
  | 'Isquios / Glúteo' 
  | 'Hombros' 
  | 'Brazos' 
  | 'Core / Abdomen' 
  | 'Pantorrillas';

export type MovementPattern = 
  | 'Empuje Horizontal' 
  | 'Empuje Vertical' 
  | 'Empuje Diagonal'
  | 'Empuje Inclinado / Diagonal'
  | 'Empuje Declinado'
  | 'Tirón Horizontal' 
  | 'Tirón Vertical' 
  | 'Dominante de Rodilla' 
  | 'Bisagra de Cadera' 
  | 'Aislamiento' 
  | 'Anti-Extensión / Core' 
  | 'Transporte / Carga'
  | 'Rotación / Anti-Rotación'
  | 'Flexión Plantar'
  | string;

export interface SetDetail {
  id: string;
  setNumber: number;
  type: 'warmup' | 'feeder' | 'work' | 'dropset';
  targetReps: string;
  actualReps?: number;
  targetWeightKg: number;
  actualWeightKg?: number;
  targetRir: number; // 0 to 4+
  actualRir?: number;
  targetRpe: number; // 6 to 10
  actualRpe?: number;
  completed: boolean;
  restSeconds?: number;
  notes?: string;
}

export type CardioType = 'bici' | 'caminadora' | 'eliptico' | 'otro';

export interface CardioSession {
  id: string;
  type: CardioType;
  name: string; // 'Bicicleta / Spinning' | 'Caminadora / Cinta' | 'Elíptico' | string
  durationMinutes: number; // Contador de minutos
  level?: number; // Bici & Elíptico: contador de niveles (1-20+)
  distanceKm?: number; // Caminadora: contador de km
  rpe?: number; // Bici, Elíptico & Cinta: RPE 1-10
  speedKmh?: number; // velocidad km/h opcional
  inclinePct?: number; // inclinación % opcional
  caloriesKcal?: number;
  notes?: string;
  completed?: boolean;
}

export interface ExerciseItem {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  movementPattern: MovementPattern;
  equipment: 'Barra' | 'Mancuernas' | 'Polea' | 'Máquina' | 'Peso Corporal' | 'Kettlebell';
  videoUrl: string;
  videoTitle?: string;
  coachCues: string[];
  sets: SetDetail[];
  notes?: string;
  order: number;
}

export interface DailyWorkout {
  id: string;
  date: string; // YYYY-MM-DD
  dayName: string; // Lunes, Martes, etc.
  title: string;
  isRestDay: boolean;
  exercises: ExerciseItem[];
  cardio?: CardioSession[];
  completed: boolean;
  studentFeedback?: string;
  sessionRpe?: number; // 6 to 10
  sessionDurationMin?: number;
  sessionEnergyLevel?: number; // 1 to 5
  completedAt?: string;
}

export interface DailyReadiness {
  date: string;
  energyLevel: number; // 1 to 5 (⚡)
  fatigueLevel: number; // 1 to 5 (Pink block)
  muscleSoreness: number; // 1 to 5 (Red arrow 🔻)
  sleepHours: number;
  mood: 'Excelente' | 'Bueno' | 'Regular' | 'Cansado' | 'Con Dolor';
  notes: string;
}

export interface AnthropometryRecord {
  id: string;
  date: string;
  weightKg: number;
  heightCm: number;
  bodyFatPct?: number;
  muscleMassKg?: number;
  chestCm: number;
  waistCm: number;
  hipCm: number;
  armRightCm: number;
  thighRightCm: number;
  calfRightCm: number;
  notes?: string;
}

export interface ExerciseDbEntry {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  movementPattern: MovementPattern;
  equipment: 'Barra' | 'Mancuernas' | 'Polea' | 'Máquina' | 'Peso Corporal' | 'Kettlebell';
  videoUrl: string;
  coachCues: string[];
  isCustom?: boolean;
}

export interface WorkoutTemplateExercise {
  id?: string;
  name: string;
  muscleGroup: MuscleGroup;
  movementPattern: MovementPattern;
  equipment: 'Barra' | 'Mancuernas' | 'Polea' | 'Máquina' | 'Peso Corporal' | 'Kettlebell';
  setsCount: number;
  targetReps: string;
  targetWeightKg: number;
  targetRir: number;
  targetRpe: number;
  restSeconds?: number;
  coachCues?: string[];
  videoUrl?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  focus: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  exercises: WorkoutTemplateExercise[];
  isCustom?: boolean;
}

export type DashboardPeriod = 
  | 'week' 
  | 'month-weeks' 
  | '1-3months' 
  | '3-6months' 
  | '6-12months';

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  avatarUrl: string;
  age: number;
  heightCm: number;
  currentWeightKg: number;
  goal: 'Hipertrofia' | 'Fuerza Máxima' | 'Pérdida de Grasa' | 'Recomposición' | 'Rendimiento Deportivo';
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  targetDaysPerWeek: number;
  injuriesOrNotes: string;
  startDate: string;
  workouts: Record<string, DailyWorkout>; // date -> DailyWorkout
  readinessLogs: Record<string, DailyReadiness>; // date -> DailyReadiness
  anthropometryHistory: AnthropometryRecord[];
}
