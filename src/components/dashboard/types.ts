import { MuscleGroup, MovementPattern } from '../../types';

export interface ExerciseMetricDetail {
  exerciseName: string;
  muscleGroup: MuscleGroup;
  movementPattern: MovementPattern;
  equipment?: string;
  totalSets: number;
  completedSets: number;
  totalReps: number;
  totalTonnageKg: number;
  avgWeightKg: number;
  maxWeightKg: number;
  avgRpe: number;
  avgRir: number;
  sessionDates: string[];
  lastSessionFeedback?: string;
}

export interface PatternMetricDetail {
  patternName: MovementPattern;
  totalSets: number;
  completedSets: number;
  totalTonnageKg: number;
  avgRpe: number;
  avgRir: number;
  exercises: ExerciseMetricDetail[];
}

export interface MuscleGroupHierarchyData {
  muscleGroup: MuscleGroup;
  totalSets: number;
  completedSets: number;
  targetSets: number;
  totalTonnageKg: number;
  avgRpe: number;
  avgRir: number;
  mavTargetSets: number;
  patterns: PatternMetricDetail[];
  allExercises: ExerciseMetricDetail[];
}
