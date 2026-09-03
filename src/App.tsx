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
import { RestTimerFloating } from './components/RestTimerFloating';
import { SaveSessionModal } from './components/SaveSessionModal';
import { exportRoutineToHTML } from './utils/exportHtml';
import { supabase } from './lib/supabase';
import { loadStudentsForUser, saveAnthropometry, saveCoachStudent, saveReadiness, saveWorkout } from './lib/trainingPersistence';

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(true);
  const [isSaveSessionOpen, setIsSaveSessionOpen] = useState<boolean>(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [studentSaveError, setStudentSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    const load = async (userId: string | null) => {
      setAuthUserId(userId);
      if (!userId) return;
      try {
        const remoteStudents = await loadStudentsForUser(userId);
        if (mounted && remoteStudents.length) {
          setStudents(remoteStudents);
          setActiveStudentId(remoteStudents[0].id);
        }
      } catch (error) { console.error('[v0] Error cargando alumnos desde Supabase:', error); }
    };
    supabase.auth.getUser().then(({ data }) => load(data.user?.id ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { load(session?.user?.id ?? null); });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

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

  // Handler: update workout for student
  const handleUpdateWorkout = (updatedWorkout: DailyWorkout) => {
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
    if (authUserId) {
      try { await saveReadiness(activeStudent.authUserId || authUserId, data); } catch (error) { console.error('[v0] Error guardando readiness:', error); }
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
        : (existingReadiness?.notes || 'Sesión guardada y registrada con éxito.')
    };

    if (authUserId) {
      try {
        await saveWorkout(activeStudent.authUserId || authUserId, completedWorkout);
        await saveReadiness(activeStudent.authUserId || authUserId, updatedReadiness);
      } catch (error) {
        console.error('[v0] Error guardando sesión:', error);
      }
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
    if (authUserId) {
      try { await saveAnthropometry(activeStudent.authUserId || authUserId, record); } catch (error) { console.error('[v0] Error guardando antropometría:', error); }
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
    if (authUserId && viewMode === 'trainer' && supabase) {
      try { await saveCoachStudent(authUserId, updatedStudent); }
      catch (error) { console.error('[v0] Error guardando perfil compartido:', error); return; }
    }
    setStudents((prev) => prev.map((st) => (st.id === updatedStudent.id ? updatedStudent : st)));
  };

  // Handler: add new student
  const handleAddStudent = async (newStudent: StudentProfile) => {
    setStudentSaveError(null);
    if (!authUserId || !supabase || viewMode !== 'trainer') {
      const message = 'Iniciá sesión como coach antes de agregar un alumno.';
      setStudentSaveError(message);
      throw new Error(message);
    }
    try {
      await saveCoachStudent(authUserId, newStudent);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar el alumno en Supabase.';
      console.error('[v0] Error guardando alumno:', error);
      setStudentSaveError(`No se guardó el alumno: ${message}`);
      throw error;
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

  // Exercise Database Handlers
  const handleAddCustomExercise = (newEx: ExerciseDbEntry) => {
    setExerciseDb((prev) => [newEx, ...prev]);
  };

  const handleUpdateCustomExercise = (updatedEx: ExerciseDbEntry) => {
    setExerciseDb((prev) =>
      prev.map((e) => (e.id === updatedEx.id ? updatedEx : e))
    );
  };

  const handleDeleteCustomExercise = (id: string) => {
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
        onLogout={() => setIsAuthModalOpen(true)}
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
        onLogout={() => setIsAuthModalOpen(true)}
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
