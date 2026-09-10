import { supabase } from './supabase';
import type { 
  AnthropometryRecord, 
  DailyReadiness, 
  DailyWorkout, 
  ExerciseDbEntry, 
  StudentProfile 
} from '../types';

/**
 * Maps a raw row from Supabase (from 'students', 'alumnos', or 'coach_students')
 * to the strongly-typed StudentProfile interface.
 */
export function mapRowToStudent(row: any): StudentProfile {
  return {
    id: String(row.id || `student-${Date.now()}`),
    fullName: row.full_name || row.fullName || row.nombre || row.name || 'Alumno',
    email: row.email || row.correo || '',
    password: row.password || row.access_password || '1234',
    avatarUrl: row.avatar_url || row.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    age: Number(row.age || row.edad || 25),
    heightCm: Number(row.height_cm || row.heightCm || row.altura || 175),
    currentWeightKg: Number(row.current_weight_kg || row.currentWeightKg || row.peso || 75),
    goal: row.goal || row.objetivo || 'Hipertrofia',
    level: row.level || row.nivel || 'Intermedio',
    targetDaysPerWeek: Number(row.target_days_per_week || row.targetDaysPerWeek || row.dias_por_semana || 4),
    injuriesOrNotes: row.injuries_or_notes || row.injuriesOrNotes || row.observaciones || '',
    startDate: row.start_date || row.startDate || new Date().toISOString().split('T')[0],
    workouts: (row.workouts && typeof row.workouts === 'object') ? row.workouts : (row.app_data?.workouts || {}),
    readinessLogs: (row.readiness_logs && typeof row.readiness_logs === 'object') ? row.readiness_logs : (row.readinessLogs || row.app_data?.readinessLogs || {}),
    anthropometryHistory: Array.isArray(row.anthropometry_history) 
      ? row.anthropometry_history 
      : (Array.isArray(row.anthropometryHistory) ? row.anthropometryHistory : (row.app_data?.anthropometryHistory || []))
  };
}

/**
 * 1. Inserts a new student into the Supabase students table with .insert(),
 * then loads the updated list with .select() as requested.
 */
export async function insertNewStudent(student: StudentProfile): Promise<StudentProfile[] | null> {
  if (!supabase) return null;

  const candidateTables = ['students', 'alumnos', 'coach_students'];
  let successfulTable: string | null = null;
  let lastError: any = null;

  const fullRow = {
    id: student.id,
    full_name: student.fullName,
    email: student.email,
    password: student.password || '1234',
    avatar_url: student.avatarUrl,
    age: student.age,
    height_cm: student.heightCm,
    current_weight_kg: student.currentWeightKg,
    goal: student.goal,
    level: student.level,
    target_days_per_week: student.targetDaysPerWeek,
    injuries_or_notes: student.injuriesOrNotes,
    start_date: student.startDate,
    workouts: student.workouts || {},
    readiness_logs: student.readinessLogs || {},
    anthropometry_history: student.anthropometryHistory || []
  };

  // Try candidate tables with .insert()
  for (const table of candidateTables) {
    try {
      const { error } = await supabase.from(table).insert(fullRow);
      if (!error) {
        successfulTable = table;
        break;
      }
      lastError = error;

      // If the schema requires fewer columns or app_data
      if (table === 'coach_students') {
        const { error: coachErr } = await supabase.from(table).insert({
          id: student.id.startsWith('student-') ? undefined : student.id,
          full_name: student.fullName,
          email: student.email,
          access_password: student.password || '1234',
          avatar_url: student.avatarUrl,
          age: student.age,
          height_cm: student.heightCm,
          current_weight_kg: student.currentWeightKg,
          goal: student.goal,
          level: student.level,
          target_days_per_week: student.targetDaysPerWeek,
          injuries_or_notes: student.injuriesOrNotes,
          start_date: student.startDate,
          app_data: { 
            anthropometryHistory: student.anthropometryHistory, 
            readinessLogs: student.readinessLogs, 
            workouts: student.workouts 
          },
        });
        if (!coachErr) {
          successfulTable = table;
          break;
        }
        lastError = coachErr;
      }
    } catch (err) {
      lastError = err;
    }
  }

  // Load the list of students with .select() as requested
  if (successfulTable) {
    try {
      const { data, error: selectErr } = await supabase.from(successfulTable).select('*');
      if (!selectErr && data && data.length > 0) {
        return data.map(mapRowToStudent);
      }
    } catch (err) {
      console.warn('Error reloading students after insert:', err);
    }
  } else {
    console.warn('[Supabase] Could not insert student into remote tables, falling back to local state:', lastError);
  }

  return null;
}

/**
 * Loads all students from Supabase with .select()
 */
export async function fetchStudentsFromSupabase(): Promise<StudentProfile[] | null> {
  if (!supabase) return null;

  const candidateTables = ['students', 'alumnos', 'coach_students'];
  for (const table of candidateTables) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (!error && data && data.length > 0) {
        return data.map(mapRowToStudent);
      }
    } catch (err) {
      // Ignore and try next table
    }
  }
  return null;
}

/**
 * Updates a student profile in Supabase using .upsert()
 */
export async function updateStudentInSupabase(student: StudentProfile): Promise<boolean> {
  if (!supabase) return false;

  const candidateTables = ['students', 'alumnos', 'coach_students'];
  const row = {
    id: student.id,
    full_name: student.fullName,
    email: student.email,
    password: student.password || '1234',
    avatar_url: student.avatarUrl,
    age: student.age,
    height_cm: student.heightCm,
    current_weight_kg: student.currentWeightKg,
    goal: student.goal,
    level: student.level,
    target_days_per_week: student.targetDaysPerWeek,
    injuries_or_notes: student.injuriesOrNotes,
    start_date: student.startDate,
    workouts: student.workouts || {},
    readiness_logs: student.readinessLogs || {},
    anthropometry_history: student.anthropometryHistory || []
  };

  for (const table of candidateTables) {
    try {
      const { error } = await supabase.from(table).upsert(row, { onConflict: 'id' });
      if (!error) return true;
    } catch (err) {
      // Continue
    }
  }
  return false;
}

/**
 * 2. Loads exercises from Supabase with .select()
 */
export async function fetchExercisesFromSupabase(): Promise<ExerciseDbEntry[] | null> {
  if (!supabase) return null;

  const candidateTables = ['exercises', 'ejercicios', 'exercise_database'];
  for (const table of candidateTables) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (!error && data && data.length > 0) {
        return data.map((r: any) => ({
          id: String(r.id),
          name: r.name || r.nombre || 'Ejercicio',
          muscleGroup: r.muscle_group || r.muscleGroup || r.grupo_muscular || 'Pecho',
          movementPattern: r.movement_pattern || r.movementPattern || r.patron_movimiento || 'Empuje Horizontal',
          equipment: r.equipment || r.equipamiento || 'Barra',
          videoUrl: r.video_url || r.videoUrl || '',
          coachCues: Array.isArray(r.coach_cues) ? r.coach_cues : (Array.isArray(r.coachCues) ? r.coachCues : []),
          isCustom: Boolean(r.is_custom ?? r.isCustom ?? false)
        }));
      }
    } catch (err) {
      // Try next
    }
  }
  return null;
}

/**
 * Saves/inserts a custom exercise to Supabase using .upsert()
 */
export async function saveExerciseToSupabase(exercise: ExerciseDbEntry): Promise<boolean> {
  if (!supabase) return false;

  const candidateTables = ['exercises', 'ejercicios', 'exercise_database'];
  const row = {
    id: exercise.id,
    name: exercise.name,
    muscle_group: exercise.muscleGroup,
    movement_pattern: exercise.movementPattern,
    equipment: exercise.equipment,
    video_url: exercise.videoUrl,
    coach_cues: exercise.coachCues,
    is_custom: exercise.isCustom ?? true
  };

  for (const table of candidateTables) {
    try {
      const { error } = await supabase.from(table).upsert(row, { onConflict: 'id' });
      if (!error) return true;
    } catch (err) {
      // Try next
    }
  }
  return false;
}

/**
 * Deletes an exercise from Supabase
 */
export async function deleteExerciseFromSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;

  const candidateTables = ['exercises', 'ejercicios', 'exercise_database'];
  for (const table of candidateTables) {
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      // Try next
    }
  }
  return false;
}

/**
 * 2. Saves student workout training logs directly to Supabase using .upsert() / .insert()
 * This handles both granular tables (workout_sessions, workout_exercises, workout_sets, cardio_sessions)
 * and the student workouts payload for seamless cross-device synchronization.
 */
export async function saveWorkout(studentId: string, workout: DailyWorkout) {
  if (!supabase) return;

  // A. Try updating normalized workout tables
  try {
    const { data: session, error: sessionError } = await supabase
      .from('workout_sessions')
      .upsert({
        user_id: studentId,
        workout_key: workout.id,
        session_date: workout.date,
        day_name: workout.dayName,
        title: workout.title,
        is_rest_day: workout.isRestDay,
        completed: workout.completed,
        completed_at: workout.completedAt || null,
        session_rpe: workout.sessionRpe || null,
        session_duration_min: workout.sessionDurationMin || null,
        session_energy_level: workout.sessionEnergyLevel || null,
        student_feedback: workout.studentFeedback || null,
      }, { onConflict: 'user_id,workout_key' })
      .select('id')
      .single();

    if (!sessionError && session) {
      for (const [exerciseOrder, exercise] of (workout.exercises || []).entries()) {
        const { data: exerciseRow, error: exerciseError } = await supabase
          .from('workout_exercises')
          .upsert({
            session_id: session.id,
            exercise_key: exercise.id,
            name: exercise.name,
            muscle_group: exercise.muscleGroup,
            movement_pattern: exercise.movementPattern,
            equipment: exercise.equipment,
            video_url: exercise.videoUrl,
            video_title: exercise.videoTitle || null,
            coach_cues: exercise.coachCues,
            exercise_notes: exercise.notes || null,
            exercise_order: exerciseOrder + 1,
          }, { onConflict: 'session_id,exercise_key' })
          .select('id')
          .single();

        if (!exerciseError && exerciseRow) {
          const sets = (exercise.sets || []).map((set) => ({
            exercise_id: exerciseRow.id,
            set_key: set.id,
            set_number: set.setNumber,
            set_type: set.type,
            target_reps: set.targetReps,
            actual_reps: set.actualReps ?? null,
            target_weight_kg: set.targetWeightKg,
            actual_weight_kg: set.actualWeightKg ?? null,
            target_rir: set.targetRir,
            actual_rir: set.actualRir ?? null,
            target_rpe: set.targetRpe,
            actual_rpe: set.actualRpe ?? null,
            completed: set.completed,
            rest_seconds: set.restSeconds ?? null,
            notes: set.notes || null,
          }));

          if (sets.length) {
            await supabase.from('workout_sets').upsert(sets, { onConflict: 'exercise_id,set_key' });
          }
        }
      }

      if (workout.cardio && workout.cardio.length > 0) {
        const cardio = workout.cardio.map((item) => ({
          session_id: session.id,
          cardio_key: item.id,
          cardio_type: item.type,
          name: item.name,
          duration_minutes: item.durationMinutes,
          level: item.level ?? null,
          distance_km: item.distanceKm ?? null,
          rpe: item.rpe ?? null,
          speed_kmh: item.speedKmh ?? null,
          incline_pct: item.inclinePct ?? null,
          calories_kcal: item.caloriesKcal ?? null,
          notes: item.notes || null,
          completed: item.completed ?? false,
        }));
        await supabase.from('cardio_sessions').upsert(cardio, { onConflict: 'session_id,cardio_key' });
      }
    }
  } catch (err) {
    // Failures in normalized tables are non-blocking if user schema is structured differently
    console.debug('[Supabase] Normalized workout_sessions upsert:', err);
  }

  // B. Sync directly to student row (workouts dictionary) for instant retrieval across all views
  const candidateStudentTables = ['students', 'alumnos', 'coach_students'];
  for (const table of candidateStudentTables) {
    try {
      // First check if student exists in table
      const { data: existing } = await supabase.from(table).select('id, workouts').eq('id', studentId).maybeSingle();
      if (existing) {
        const updatedWorkouts = {
          ...(existing.workouts || {}),
          [workout.date]: workout
        };
        await supabase.from(table).update({ workouts: updatedWorkouts }).eq('id', studentId);
        break;
      }
    } catch (err) {
      // Try next
    }
  }
}

/**
 * Saves daily readiness logs ("¿Cómo te sentís hoy?") directly to Supabase with .upsert()
 */
export async function saveReadiness(studentId: string, data: DailyReadiness) {
  if (!supabase) return;

  // A. Granular readiness_logs table
  try {
    await supabase.from('readiness_logs').upsert({
      user_id: studentId,
      log_date: data.date,
      energy_level: data.energyLevel,
      fatigue_level: data.fatigueLevel,
      muscle_soreness: data.muscleSoreness,
      sleep_hours: data.sleepHours,
      mood: data.mood,
      notes: data.notes || null,
    }, { onConflict: 'user_id,log_date' });
  } catch (err) {
    console.debug('[Supabase] readiness_logs upsert:', err);
  }

  // B. Student readinessLogs dictionary sync
  const candidateStudentTables = ['students', 'alumnos', 'coach_students'];
  for (const table of candidateStudentTables) {
    try {
      const { data: existing } = await supabase.from(table).select('id, readiness_logs').eq('id', studentId).maybeSingle();
      if (existing) {
        const updatedLogs = {
          ...(existing.readiness_logs || {}),
          [data.date]: data
        };
        await supabase.from(table).update({ readiness_logs: updatedLogs }).eq('id', studentId);
        break;
      }
    } catch (err) {
      // Try next
    }
  }
}

/**
 * Saves anthropometry evaluation into Supabase with .insert()
 */
export async function saveAnthropometry(studentId: string, record: AnthropometryRecord) {
  if (!supabase) return;

  try {
    await supabase.from('anthropometry_records').insert({
      user_id: studentId,
      record_date: record.date,
      weight_kg: record.weightKg,
      height_cm: record.heightCm,
      body_fat_pct: record.bodyFatPct ?? null,
      muscle_mass_kg: record.muscleMassKg ?? null,
      chest_cm: record.chestCm,
      waist_cm: record.waistCm,
      hip_cm: record.hipCm,
      arm_right_cm: record.armRightCm,
      thigh_right_cm: record.thighRightCm,
      calf_right_cm: record.calfRightCm,
      notes: record.notes || null,
    });
  } catch (err) {
    console.debug('[Supabase] anthropometry_records insert:', err);
  }

  const candidateStudentTables = ['students', 'alumnos', 'coach_students'];
  for (const table of candidateStudentTables) {
    try {
      const { data: existing } = await supabase.from(table).select('id, anthropometry_history').eq('id', studentId).maybeSingle();
      if (existing) {
        const updatedHistory = [...(existing.anthropometry_history || []), record];
        await supabase.from(table).update({ anthropometry_history: updatedHistory }).eq('id', studentId);
        break;
      }
    } catch (err) {
      // Try next
    }
  }
}

/**
 * Backward compatible coach student save
 */
export async function saveCoachStudent(coachUserId: string, student: StudentProfile) {
  return insertNewStudent(student);
}

/**
 * Real-time listener across all devices:
 * Listens to postgres_changes on students, workouts, exercises, and readiness tables.
 */
export function subscribeToRealtimeSync(callbacks: {
  onStudentsChange?: () => void;
  onExercisesChange?: () => void;
  onWorkoutsChange?: () => void;
}) {
  if (!supabase) return () => {};

  try {
    const channel = supabase
      .channel('curmove-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        callbacks.onStudentsChange?.();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alumnos' }, () => {
        callbacks.onStudentsChange?.();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exercises' }, () => {
        callbacks.onExercisesChange?.();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ejercicios' }, () => {
        callbacks.onExercisesChange?.();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workout_sessions' }, () => {
        callbacks.onWorkoutsChange?.();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workout_sets' }, () => {
        callbacks.onWorkoutsChange?.();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'readiness_logs' }, () => {
        callbacks.onWorkoutsChange?.();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.debug('[Supabase] Error setting up realtime channel:', err);
    return () => {};
  }
}
