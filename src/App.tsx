/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ViewMode, 
  StudentProfile, 
  DailyWorkout, 
  DailyReadiness, 
  AnthropometryRecord,
  ExerciseItem,
  ExerciseDbEntry,
  WorkoutTemplate
} from './types';
import { 
  INITIAL_STUDENTS, 
  EXERCISE_DATABASE,
  getWeekDates 
} from './data/mockData';
import { INITIAL_TEMPLATES } from './data/mockTemplates';
import { Header } from './components/Header';
import { CalendarStrip } from './components/CalendarStrip';
import { ReadinessWidget } from './components/ReadinessWidget';
import { RoutinePlanner } from './components/RoutinePlanner';
import { SeriesTable } from './components/SeriesTable';
import { VideoSection } from './components/VideoSection';
import { TrainerDashboardView } from './components/TrainerDashboardView';
import { ExerciseDatabaseView } from './components/ExerciseDatabaseView';
import { AnthropometryModal } from './components/AnthropometryModal';
import { ProfileModal } from './components/ProfileModal';
import { ExerciseSearchModal } from './components/ExerciseSearchModal';
import { AuthRoleModal } from './components/AuthRoleModal';
import { LoginPortal } from './components/LoginPortal';
import { RestTimerFloating } from './components/RestTimerFloating';
import { SaveSessionModal } from './components/SaveSessionModal';
import { exportRoutineToHTML } from './utils/exportHtml';
import { supabase } from './lib/supabase';
import { 
  saveAnthropometry, 
  saveCoachStudent, 
  saveReadiness, 
  saveWorkout,
  insertNewStudent,
  fetchStudentsFromSupabase,
  updateStudentInSupabase,
  fetchExercisesFromSupabase,
  saveExerciseToSupabase,
  deleteExerciseFromSupabase,
  subscribeToRealtimeSync
} from './lib/trainingPersistence';

export default function App() {
  // Load students from localStorage or initialize with mockData
  const [students, setStudents] = useState<StudentProfile[]>(() => {
    const saved = localStorage.getItem('curmove_students');
    if (saved) {
      try {
        const parsed: StudentProfile[] = JSON.parse(saved);
        // Ensure the 12-month profile exists
        if (!parsed.some(s => s.id === 'student-12m')) {
          const fresh12m = INITIAL_STUDENTS.find(s => s.id === 'student-12m');
          if (fresh12m) {
            return [fresh12m, ...parsed];
          }
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved students', e);
      }
    }
    return INITIAL_STUDENTS;
  });

  const [activeStudentId, setActiveStudentId] = useState<string>(() => {
    return students[0]?.id || 'student-1';
  });

  // Current view mode ('trainer' | 'student')
  const [viewMode, setViewMode] = useState<ViewMode>('trainer');

  // Active Main Tab ('rutina' | 'dashboard' | 'database')
  const [activeMainTab, setActiveMainTab] = useState<string>('rutina');

  // Exercise Database state (persisted in localStorage)
  const [exerciseDb, setExerciseDb] = useState<ExerciseDbEntry[]>(() => {
    const saved = localStorage.getItem('curmove_exercise_db');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved exercises', e);
      }
    }
    return EXERCISE_DATABASE.map((ex, idx) => ({
      id: `db-default-${idx}`,
      ...ex,
      isCustom: false
    }));
  });

  // Training Templates state (persisted in localStorage)
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(() => {
    const saved = localStorage.getItem('curmove_training_templates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved templates', e);
      }
    }
    return INITIAL_TEMPLATES;
  });

  // Calendar dates
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const currentWeekDates = getWeekDates(baseDate);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date().toISOString().split('T')[0];
    return currentWeekDates.includes(today) ? today : currentWeekDates[0];
  });

  // Selected exercise for editing/viewing details in Col 2 & 3
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  // Modals state
  const [isAnthropometryOpen, setIsAnthropometryOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSaveSessionOpen, setIsSaveSessionOpen] = useState<boolean>(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setAuthUserId(data.user?.id ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUserId(session?.user?.id ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Load remote students and exercise database from Supabase with .select() on startup
  useEffect(() => {
    let isMounted = true;

    async function initializeSupabaseData() {
      // 1. Load students list with .select()
      try {
        const remoteStudents = await fetchStudentsFromSupabase();
        if (isMounted && remoteStudents && remoteStudents.length > 0) {
          setStudents((prev) => {
            const has12m = remoteStudents.some(s => s.id === 'student-12m');
            if (!has12m) {
              const fresh12m = prev.find(s => s.id === 'student-12m') || INITIAL_STUDENTS.find(s => s.id === 'student-12m');
              return fresh12m ? [fresh12m, ...remoteStudents] : remoteStudents;
            }
            return remoteStudents;
          });
        }
      } catch (err) {
        console.debug('[Supabase] Init students fetch notice:', err);
      }

      // 2. Load exercise database with .select()
      try {
        const remoteExercises = await fetchExercisesFromSupabase();
        if (isMounted && remoteExercises && remoteExercises.length > 0) {
          setExerciseDb(remoteExercises);
        }
      } catch (err) {
        console.debug('[Supabase] Init exercises fetch notice:', err);
      }
    }

    initializeSupabaseData();

    // 3. Realtime subscription to synchronize data in real-time across any device
    const unsubscribeRealtime = subscribeToRealtimeSync({
      onStudentsChange: async () => {
        const refreshed = await fetchStudentsFromSupabase();
        if (isMounted && refreshed && refreshed.length > 0) {
          setStudents(refreshed);
        }
      },
      onExercisesChange: async () => {
        const refreshed = await fetchExercisesFromSupabase();
        if (isMounted && refreshed && refreshed.length > 0) {
          setExerciseDb(refreshed);
        }
      },
      onWorkoutsChange: async () => {
        const refreshed = await fetchStudentsFromSupabase();
        if (isMounted && refreshed && refreshed.length > 0) {
          setStudents(refreshed);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribeRealtime();
    };
  }, []);

  // User Authentication & CURMOVE Login State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('curmove_session_active') === 'true';
  });

  // Floating Rest Timer
  const [restTimerSeconds, setRestTimerSeconds] = useState<number>(90);
  const [isRestTimerOpen, setIsRestTimerOpen] = useState<boolean>(false);

  // Persist students to localStorage
  useEffect(() => {
    localStorage.setItem('curmove_students', JSON.stringify(students));
  }, [students]);

  // Persist exercise DB to localStorage
  useEffect(() => {
    localStorage.setItem('curmove_exercise_db', JSON.stringify(exerciseDb));
  }, [exerciseDb]);

  // Persist templates to localStorage
  useEffect(() => {
    localStorage.setItem('curmove_training_templates', JSON.stringify(templates));
  }, [templates]);

  // When switching to student view, reset tab if was in coach-only tab
  useEffect(() => {
    if (viewMode === 'student' && (activeMainTab === 'dashboard' || activeMainTab === 'database')) {
      setActiveMainTab('rutina');
    }
  }, [viewMode]);

  // Active student object
  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

  // Current Workout for the selected date
  const currentWorkout: DailyWorkout | undefined = activeStudent.workouts?.[selectedDate];

  // Current Readiness for selected date
  const currentReadiness: DailyReadiness | undefined = activeStudent.readinessLogs?.[selectedDate];

  // Currently selected exercise item
  const activeExercise: ExerciseItem | undefined = currentWorkout?.exercises?.find(
    (ex) => ex.id === selectedExerciseId
  ) || currentWorkout?.exercises?.[0];

  // Auto-select first exercise when date or workout changes
  useEffect(() => {
    if (currentWorkout?.exercises && currentWorkout.exercises.length > 0) {
      const exists = currentWorkout.exercises.some((e) => e.id === selectedExerciseId);
      if (!exists) {
        setSelectedExerciseId(currentWorkout.exercises[0].id);
      }
    } else {
      setSelectedExerciseId(null);
    }
  }, [selectedDate, currentWorkout, selectedExerciseId]);

  // Handler: update workout for student (saves to Supabase in real-time)
  const handleUpdateWorkout = (updatedWorkout: DailyWorkout) => {
    // 1. Save directly to Supabase with .upsert()
    saveWorkout(activeStudent.id, updatedWorkout).catch((err) => {
      console.warn('[Supabase] Error guardando workout en Supabase:', err);
    });

    // 2. Update local state
    setStudents((prev) =>
      prev.map((st) => {
        if (st.id === activeStudent.id) {
          return {
            ...st,
            workouts: {
              ...st.workouts,
              [selectedDate]: updatedWorkout
            }
          };
        }
        return st;
      })
    );
  };

  // Handler: update specific exercise
  const handleUpdateExercise = (updatedEx: ExerciseItem) => {
    if (!currentWorkout) return;
    const updatedExercises = (currentWorkout.exercises || []).map((ex) =>
      ex.id === updatedEx.id ? updatedEx : ex
    );
    handleUpdateWorkout({
      ...currentWorkout,
      exercises: updatedExercises
    });
  };

  // Handler: save readiness logs (Energy, Fatigue, Soreness, Sleep, Mood, Notes)
  const handleSaveReadiness = async (date: string, data: DailyReadiness) => {
    try {
      await saveReadiness(activeStudent.id, data);
    } catch (error) {
      console.error('[Supabase] Error guardando readiness:', error);
    }
    setStudents((prev) =>
      prev.map((st) => {
        if (st.id === activeStudent.id) {
          return {
            ...st,
            readinessLogs: {
              ...st.readinessLogs,
              [date]: data
            }
          };
        }
        return st;
      })
    );
  };

  // Handler: Confirm and Save Workout Session (Autocompletes to Dashboard & saves energy)
  const handleConfirmSaveSession = async ({
    workout,
    energyLevel,
    sessionRpe,
    sessionDurationMin,
    feedback,
    autoCompleteAllSets
  }: {
    workout: DailyWorkout;
    energyLevel: number;
    sessionRpe: number;
    sessionDurationMin: number;
    feedback: string;
    autoCompleteAllSets: boolean;
  }) => {
    // 1. Process Exercises & Sets
    const updatedExercises = (workout.exercises || []).map((ex) => {
      const updatedSets = (ex.sets || []).map((s) => {
        if (autoCompleteAllSets || s.completed) {
          return {
            ...s,
            completed: true,
            actualReps: s.actualReps !== undefined ? s.actualReps : parseInt(s.targetReps, 10) || 10,
            actualWeightKg: s.actualWeightKg !== undefined ? s.actualWeightKg : s.targetWeightKg || 0,
            actualRpe: s.actualRpe !== undefined ? s.actualRpe : s.targetRpe || 8,
            actualRir: s.actualRir !== undefined ? s.actualRir : (s.targetRir ?? 2)
          };
        }
        return s;
      });
      return {
        ...ex,
        sets: updatedSets
      };
    });

    const completedWorkout: DailyWorkout = {
      ...workout,
      completed: true,
      completedAt: new Date().toISOString(),
      sessionRpe,
      sessionDurationMin,
      sessionEnergyLevel: energyLevel,
      studentFeedback: feedback,
      exercises: updatedExercises
    };

    // 2. Process / Update Readiness for that date (Estado de Energía)
    const existingReadiness = activeStudent.readinessLogs?.[selectedDate];
    const updatedReadiness: DailyReadiness = {
      date: selectedDate,
      energyLevel: energyLevel,
      fatigueLevel: existingReadiness?.fatigueLevel || (sessionRpe >= 9 ? 3 : 2),
      muscleSoreness: existingReadiness?.muscleSoreness || 2,
      sleepHours: existingReadiness?.sleepHours || 7.5,
      mood: existingReadiness?.mood || 'Excelente',
      notes: feedback
        ? `${existingReadiness?.notes ? existingReadiness.notes + ' • ' : ''}Post-sesión: ${feedback}`
        : (existingReadiness?.notes || 'Sesión guardada y registrada con éxito.'),
      nutritionMeals: existingReadiness?.nutritionMeals,
      nutritionNotes: existingReadiness?.nutritionNotes
    };

    // Save session directly to Supabase with .upsert()
    try {
      await saveWorkout(activeStudent.id, completedWorkout);
      await saveReadiness(activeStudent.id, updatedReadiness);
    } catch (error) {
      console.error('[Supabase] Error guardando sesión:', error);
    }

    // 3. Update student state
    setStudents((prev) =>
      prev.map((st) => {
        if (st.id === activeStudent.id) {
          return {
            ...st,
            workouts: {
              ...st.workouts,
              [selectedDate]: completedWorkout
            },
            readinessLogs: {
              ...st.readinessLogs,
              [selectedDate]: updatedReadiness
            }
          };
        }
        return st;
      })
    );
  };

  // Handler: add anthropometry evaluation
  const handleAddAnthropometryRecord = async (record: AnthropometryRecord) => {
    try { 
      await saveAnthropometry(activeStudent.id, record); 
    } catch (error) { 
      console.error('[Supabase] Error guardando antropometría:', error); 
    }
    setStudents((prev) =>
      prev.map((st) => {
        if (st.id === activeStudent.id) {
          return {
            ...st,
            currentWeightKg: record.weightKg,
            anthropometryHistory: [...(st.anthropometryHistory || []), record]
          };
        }
        return st;
      })
    );
  };

  // Handler: update student profile
  const handleUpdateStudent = async (updatedStudent: StudentProfile) => {
    try {
      await updateStudentInSupabase(updatedStudent);
    } catch (error) {
      console.error('[Supabase] Error actualizando perfil de alumno:', error);
    }
    setStudents((prev) =>
      prev.map((st) => (st.id === updatedStudent.id ? updatedStudent : st))
    );
  };

  // Handler: add new student (1. .insert() en tabla de alumnos de Supabase y carga con .select())
  const handleAddStudent = async (newStudent: StudentProfile) => {
    try {
      const refreshedList = await insertNewStudent(newStudent);
      if (refreshedList && refreshedList.length > 0) {
        setStudents(refreshedList);
        setActiveStudentId(newStudent.id);
        return;
      }
    } catch (error) {
      console.error('[Supabase] Error insertando alumno:', error);
    }

    setStudents((prev) => prev.some((student) => student.id === newStudent.id)
      ? prev.map((student) => student.id === newStudent.id ? newStudent : student)
      : [...prev, newStudent]);
    setActiveStudentId(newStudent.id);
  };

  // Handler: delete student (Coach profile only)
  const handleDeleteStudent = (studentId: string) => {
    if (students.length <= 1) return;
    const remaining = students.filter((s) => s.id !== studentId);
    setStudents(remaining);
    if (activeStudentId === studentId) {
      setActiveStudentId(remaining[0]?.id || '');
    }
  };

  // Exercise Database Handlers - Direct Supabase .insert() / .upsert()
  const handleAddCustomExercise = async (newEx: ExerciseDbEntry) => {
    try {
      await saveExerciseToSupabase(newEx);
    } catch (error) {
      console.error('[Supabase] Error guardando ejercicio:', error);
    }
    setExerciseDb((prev) => [newEx, ...prev]);
  };

  const handleUpdateCustomExercise = async (updatedEx: ExerciseDbEntry) => {
    try {
      await saveExerciseToSupabase(updatedEx);
    } catch (error) {
      console.error('[Supabase] Error actualizando ejercicio:', error);
    }
    setExerciseDb((prev) =>
      prev.map((e) => (e.id === updatedEx.id ? updatedEx : e))
    );
  };

  const handleDeleteCustomExercise = async (id: string) => {
    try {
      await deleteExerciseFromSupabase(id);
    } catch (error) {
      console.error('[Supabase] Error eliminando ejercicio:', error);
    }
    setExerciseDb((prev) => prev.filter((e) => e.id !== id));
  };

  // Template Handlers
  const handleAddTemplate = (newTmpl: WorkoutTemplate) => {
    setTemplates((prev) => [newTmpl, ...prev]);
  };

  const handleUpdateTemplate = (updatedTmpl: WorkoutTemplate) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === updatedTmpl.id ? updatedTmpl : t))
    );
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  // Handler: Apply Template directly to current day
  const handleApplyTemplateToCurrentDay = (tmpl: WorkoutTemplate) => {
    const newExercises: ExerciseItem[] = tmpl.exercises.map((ex, idx) => {
      const dbMatch = exerciseDb.find((e) => e.name === ex.name);
      return {
        id: `ex-${Date.now()}-${idx}`,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        movementPattern: ex.movementPattern,
        equipment: ex.equipment,
        videoUrl: ex.videoUrl || dbMatch?.videoUrl || 'https://www.youtube.com/embed/rT7DgCr-3pg',
        coachCues: ex.coachCues || dbMatch?.coachCues || ['Control excéntrico en 3s', 'Técnica estricta'],
        order: idx + 1,
        sets: Array.from({ length: ex.setsCount }, (_, sIdx) => ({
          id: `set-${Date.now()}-${idx}-${sIdx}`,
          setNumber: sIdx + 1,
          type: sIdx === 0 && ex.setsCount > 3 ? 'warmup' : 'work',
          targetReps: ex.targetReps,
          targetWeightKg: ex.targetWeightKg,
          targetRir: ex.targetRir,
          targetRpe: ex.targetRpe,
          completed: false,
          restSeconds: ex.restSeconds || 90
        }))
      };
    });

    const dayName = new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long' });
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);

    const newWorkout: DailyWorkout = {
      id: `workout-${Date.now()}`,
      date: selectedDate,
      dayName: capitalizedDay,
      title: tmpl.name.toUpperCase(),
      isRestDay: false,
      completed: false,
      exercises: newExercises
    };

    handleUpdateWorkout(newWorkout);
    setActiveMainTab('rutina');
  };

  // Role Switch Handler
  const handleSelectRole = (mode: ViewMode, studentId?: string) => {
    setViewMode(mode);
    if (studentId) {
      setActiveStudentId(studentId);
    }
  };

  const handleLoginSuccess = (role: 'trainer' | 'student', studentId?: string) => {
    setViewMode(role);
    if (studentId) {
      setActiveStudentId(studentId);
    }
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    localStorage.setItem('curmove_session_active', 'true');
    localStorage.setItem('curmove_session_role', role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAuthModalOpen(false);
    localStorage.removeItem('curmove_session_active');
  };

  const handleToggleModeWithSecurity = (newMode: ViewMode) => {
    if (newMode === 'trainer' && viewMode === 'student') {
      setIsAuthModalOpen(true);
    } else {
      setViewMode(newMode);
    }
  };

  // Navigation handlers for week
  const handlePrevWeek = () => {
    const prev = new Date(baseDate);
    prev.setDate(prev.getDate() - 7);
    setBaseDate(prev);
    const newDates = getWeekDates(prev);
    setSelectedDate(newDates[0]);
  };

  const handleNextWeek = () => {
    const next = new Date(baseDate);
    next.setDate(next.getDate() + 7);
    setBaseDate(next);
    const newDates = getWeekDates(next);
    setSelectedDate(newDates[0]);
  };

  const handleToday = () => {
    const now = new Date();
    setBaseDate(now);
    const newDates = getWeekDates(now);
    const todayStr = now.toISOString().split('T')[0];
    setSelectedDate(newDates.includes(todayStr) ? todayStr : newDates[0]);
  };

  // Rest timer launcher
  const handleStartRestTimer = (seconds: number) => {
    setRestTimerSeconds(seconds);
    setIsRestTimerOpen(true);
  };

  // Export routine to standalone HTML
  const handleExportHTML = () => {
    exportRoutineToHTML(activeStudent, currentWorkout);
  };

  // If user is not authenticated, show the CURMOVE Entry / Login Portal:
  // 1) LOGO DE CURMOVE + pedir ingresar como alumno / coach.
  // 2) dependiendo si es alumno o coach que se le abra así para ingresar.
  if (!isAuthenticated) {
    return (
      <LoginPortal
        students={students}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-[#f2f2f2] flex flex-col font-sans selection:bg-[#ff6b00] selection:text-[#ffffff]">
      
      {/* 1. Header with CURMOVE branding, Clean Unified Non-Redundant Navigation */}
      <Header
        viewMode={viewMode}
        onToggleViewMode={handleToggleModeWithSecurity}
        activeMainTab={activeMainTab}
        onSelectMainTab={setActiveMainTab}
        activeStudent={activeStudent}
        students={students}
        onSelectStudent={setActiveStudentId}
        onOpenAnthropometry={() => setIsAnthropometryOpen(true)}
        onOpenProfile={() => {
          if (viewMode === 'trainer') {
            setIsProfileOpen(true);
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onExportHTML={handleExportHTML}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="max-w-[1600px] w-full mx-auto p-4 flex-1 flex flex-col gap-4">
        
        {/* VIEW 1: DASHBOARD EXCLUSIVO DEL ENTRENADOR */}
        {activeMainTab === 'dashboard' && viewMode === 'trainer' ? (
          <TrainerDashboardView
            student={activeStudent}
            onUpdateWorkout={(_date, workout) => handleUpdateWorkout(workout)}
            onUpdateStudent={(updatedStudent) => {
              setStudents(students.map((s) => s.id === updatedStudent.id ? updatedStudent : s));
            }}
          />
        ) : activeMainTab === 'database' && viewMode === 'trainer' ? (
          /* VIEW 2: BASE DE DATOS & PLANTILLAS DE ENTRENAMIENTO */
          <ExerciseDatabaseView
            exerciseDb={exerciseDb}
            templates={templates}
            onAddExercise={handleAddCustomExercise}
            onUpdateExercise={handleUpdateCustomExercise}
            onDeleteExercise={handleDeleteCustomExercise}
            onAddTemplate={handleAddTemplate}
            onUpdateTemplate={handleUpdateTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onApplyTemplateToCurrentDay={handleApplyTemplateToCurrentDay}
          />
        ) : (
          /* VIEW 3: VISTA PRINCIPAL (CALENDARIO + "¿CÓMO TE SENTÍS?" + PLANIFICADOR 3 COLUMNAS) */
          <>
            {/* Top Weekly / Monthly Calendar Strip */}
            <CalendarStrip
              currentDates={currentWeekDates}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              workouts={activeStudent.workouts || {}}
              viewMode={viewMode}
              onPrevWeek={handlePrevWeek}
              onNextWeek={handleNextWeek}
              onToday={handleToday}
            />

            {/* "¿CÓMO TE SENTÍS HOY?" (Readiness Widget: Energy ⚡, Fatigue, Soreness 🔻, Sleep, Mood) */}
            <ReadinessWidget
              selectedDate={selectedDate}
              readiness={currentReadiness}
              viewMode={viewMode}
              onSaveReadiness={handleSaveReadiness}
            />

            {/* Three Main Columns Workspace matching exact User Mockup */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
              
              {/* Column 1: RUTINA / PLANIFICACIÓN (Columna Izquierda - 4 cols) */}
              <div className="lg:col-span-4 flex flex-col min-h-0">
                <RoutinePlanner
                  workout={currentWorkout}
                  selectedDate={selectedDate}
                  selectedExerciseId={selectedExerciseId || activeExercise?.id || null}
                  onSelectExercise={(id) => setSelectedExerciseId(id)}
                  onUpdateWorkout={handleUpdateWorkout}
                  viewMode={viewMode}
                  exerciseDb={exerciseDb}
                  onOpenSaveSession={() => setIsSaveSessionOpen(true)}
                />
              </div>

              {/* Column 2: SERIES & CARGAS (Columna Central - 4 cols) */}
              <div className="lg:col-span-4 flex flex-col min-h-0">
                <SeriesTable
                  exercise={activeExercise}
                  viewMode={viewMode}
                  onUpdateExercise={handleUpdateExercise}
                  onStartRestTimer={handleStartRestTimer}
                  onOpenSaveSession={() => setIsSaveSessionOpen(true)}
                />
              </div>

              {/* Column 3: VIDEOS & TÉCNICA (Columna Derecha - 4 cols) */}
              <div className="lg:col-span-4 flex flex-col min-h-0">
                <VideoSection
                  exercise={activeExercise}
                  viewMode={viewMode}
                  onUpdateExercise={handleUpdateExercise}
                />
              </div>

            </div>
          </>
        )}

      </main>

      {/* Modals & Drawers */}
      
      {/* Modal Guardar Sesión de Entrenamiento */}
      <SaveSessionModal
        isOpen={isSaveSessionOpen}
        onClose={() => setIsSaveSessionOpen(false)}
        workout={currentWorkout}
        currentReadiness={currentReadiness}
        onConfirmSave={handleConfirmSaveSession}
      />

      {/* Modal de Acceso / ¿Cómo Ingresar? & Seguridad por Rol */}
      <AuthRoleModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentRole={viewMode}
        students={students}
        activeStudent={activeStudent}
        onSelectRole={handleSelectRole}
        onLogout={handleLogout}
      />

      {/* Antropometría */}
      <AnthropometryModal
        isOpen={isAnthropometryOpen}
        onClose={() => setIsAnthropometryOpen(false)}
        student={activeStudent}
        onAddRecord={handleAddAnthropometryRecord}
      />

      {/* Perfil de Alumno / Coach */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        activeStudent={activeStudent}
        students={students}
        onSelectStudent={setActiveStudentId}
        onUpdateStudent={handleUpdateStudent}
        onAddStudent={handleAddStudent}
        onDeleteStudent={handleDeleteStudent}
      />

      {/* Buscador Rápido */}
      <ExerciseSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Floating Rest Stopwatch Timer */}
      <RestTimerFloating
        initialSeconds={restTimerSeconds}
        isOpen={isRestTimerOpen}
        onClose={() => setIsRestTimerOpen(false)}
      />

    </div>
  );
}
