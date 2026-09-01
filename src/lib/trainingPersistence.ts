import { supabase } from './supabase'
import type { AnthropometryRecord, DailyReadiness, DailyWorkout } from '../types'

export async function saveReadiness(userId: string, data: DailyReadiness) {
  if (!supabase) return
  const { error } = await supabase.from('readiness_logs').upsert({
    user_id: userId,
    log_date: data.date,
    energy_level: data.energyLevel,
    fatigue_level: data.fatigueLevel,
    muscle_soreness: data.muscleSoreness,
    sleep_hours: data.sleepHours,
    mood: data.mood,
    notes: data.notes || null,
  }, { onConflict: 'user_id,log_date' })
  if (error) throw error
}

export async function saveWorkout(userId: string, workout: DailyWorkout) {
  if (!supabase) return
  const { data: session, error: sessionError } = await supabase.from('workout_sessions').upsert({
    user_id: userId, workout_key: workout.id, session_date: workout.date, day_name: workout.dayName,
    title: workout.title, is_rest_day: workout.isRestDay, completed: workout.completed,
    completed_at: workout.completedAt || null, session_rpe: workout.sessionRpe || null,
    session_duration_min: workout.sessionDurationMin || null, session_energy_level: workout.sessionEnergyLevel || null,
    student_feedback: workout.studentFeedback || null,
  }, { onConflict: 'user_id,workout_key' }).select('id').single()
  if (sessionError) throw sessionError

  for (const [exerciseOrder, exercise] of (workout.exercises || []).entries()) {
    const { data: exerciseRow, error: exerciseError } = await supabase.from('workout_exercises').upsert({
      session_id: session.id, exercise_key: exercise.id, name: exercise.name, muscle_group: exercise.muscleGroup,
      movement_pattern: exercise.movementPattern, equipment: exercise.equipment, video_url: exercise.videoUrl,
      video_title: exercise.videoTitle || null, coach_cues: exercise.coachCues, exercise_notes: exercise.notes || null,
      exercise_order: exerciseOrder + 1,
    }, { onConflict: 'session_id,exercise_key' }).select('id').single()
    if (exerciseError) throw exerciseError

    const sets = (exercise.sets || []).map((set) => ({
      exercise_id: exerciseRow.id, set_key: set.id, set_number: set.setNumber, set_type: set.type,
      target_reps: set.targetReps, actual_reps: set.actualReps ?? null, target_weight_kg: set.targetWeightKg,
      actual_weight_kg: set.actualWeightKg ?? null, target_rir: set.targetRir, actual_rir: set.actualRir ?? null,
      target_rpe: set.targetRpe, actual_rpe: set.actualRpe ?? null, completed: set.completed,
      rest_seconds: set.restSeconds ?? null, notes: set.notes || null,
    }))
    if (sets.length) {
      const { error } = await supabase.from('workout_sets').upsert(sets, { onConflict: 'exercise_id,set_key' })
      if (error) throw error
    }
  }

  const cardio = (workout.cardio || []).map((item) => ({
    session_id: session.id, cardio_key: item.id, cardio_type: item.type, name: item.name,
    duration_minutes: item.durationMinutes, level: item.level ?? null, distance_km: item.distanceKm ?? null,
    rpe: item.rpe ?? null, speed_kmh: item.speedKmh ?? null, incline_pct: item.inclinePct ?? null,
    calories_kcal: item.caloriesKcal ?? null, notes: item.notes || null, completed: item.completed ?? false,
  }))
  if (cardio.length) {
    const { error } = await supabase.from('cardio_sessions').upsert(cardio, { onConflict: 'session_id,cardio_key' })
    if (error) throw error
  }
}

export async function saveAnthropometry(userId: string, record: AnthropometryRecord) {
  if (!supabase) return
  const { error } = await supabase.from('anthropometry_records').insert({
    user_id: userId, record_date: record.date, weight_kg: record.weightKg, height_cm: record.heightCm,
    body_fat_pct: record.bodyFatPct ?? null, muscle_mass_kg: record.muscleMassKg ?? null, chest_cm: record.chestCm,
    waist_cm: record.waistCm, hip_cm: record.hipCm, arm_right_cm: record.armRightCm,
    thigh_right_cm: record.thighRightCm, calf_right_cm: record.calfRightCm, notes: record.notes || null,
  })
  if (error) throw error
}
