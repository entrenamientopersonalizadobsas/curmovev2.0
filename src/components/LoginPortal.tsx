import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Dumbbell, 
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Flame,
  Utensils
} from 'lucide-react';

interface LoginPortalProps {
  students: StudentProfile[];
  onLoginSuccess: (role: 'trainer' | 'student', studentId?: string) => void;
  coachPassword?: string;
}

type LoginStep = 'select_role' | 'student_login' | 'coach_login';

export const LoginPortal: React.FC<LoginPortalProps> = ({
  students,
  onLoginSuccess,
  coachPassword = 'coach123'
}) => {
  const [step, setStep] = useState<LoginStep>('select_role');
  
  // Student Login State
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [studentPassword, setStudentPassword] = useState<string>('');
  const [showStudentPassword, setShowStudentPassword] = useState<boolean>(false);
  const [studentError, setStudentError] = useState<string>('');

  // Coach Login State
  const [coachPasswordInput, setCoachPasswordInput] = useState<string>('');
  const [showCoachPassword, setShowCoachPassword] = useState<boolean>(false);
  const [coachError, setCoachError] = useState<string>('');

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');

    if (!selectedStudent) {
      setStudentError('Selecciona un alumno para continuar.');
      return;
    }

    const correctPassword = selectedStudent.password || '1234';
    if (studentPassword.trim() === correctPassword.trim() || studentPassword.trim() === '1234') {
      onLoginSuccess('student', selectedStudent.id);
    } else {
      setStudentError('Contraseña incorrecta. Utiliza "1234" o solicita tu clave a tu entrenador.');
    }
  };

  const handleQuickStudentLogin = (studentId: string) => {
    onLoginSuccess('student', studentId);
  };

  const handleCoachSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCoachError('');

    if (
      coachPasswordInput.trim() === coachPassword.trim() || 
      coachPasswordInput.trim() === 'coach123' || 
      coachPasswordInput.trim() === '1234'
    ) {
      onLoginSuccess('trainer');
    } else {
      setCoachError('Contraseña de entrenador incorrecta. Clave de acceso demo: "1234" o "coach123".');
    }
  };

  const handleQuickCoachLogin = () => {
    onLoginSuccess('trainer');
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-[#f2f2f2] flex flex-col items-center justify-center p-4 selection:bg-[#ff6b00] selection:text-[#ffffff] relative overflow-hidden">
      
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-[#ff6b00]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-[#ff6b00]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-lg z-10 space-y-6">
        
        {/* ========================================================= */}
        {/* 1) LOGO DE CURMOVE SIEMPRE VISIBLE Y DESTACADO */}
        {/* ========================================================= */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#141417] border border-[rgba(242,242,242,0.12)] text-[#ff6b00] shadow-lg mb-0.5">
            <Dumbbell className="w-7 h-7 text-[#ff6b00]" />
          </div>
          
          <div className="flex items-center justify-center font-display text-3xl font-black tracking-tight">
            <span className="text-[#f2f2f2]">CUR</span>
            <span className="bg-[#ff6b00] text-[#ffffff] px-2.5 py-1 rounded-[4px] text-sm font-black ml-1.5 tracking-wider shadow-sm">
              MOVE
            </span>
          </div>

          <p className="text-xs text-[rgba(242,242,242,0.6)] font-medium max-w-sm mx-auto">
            Plataforma de Entrenamiento de Fuerza, Periodización y Rutina Alimentaria
          </p>
        </div>

        {/* ========================================================= */}
        {/* PASO 1: PEDIR INGRESAR COMO ALUMNO / COACH */}
        {/* ========================================================= */}
        {step === 'select_role' && (
          <div className="bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 backdrop-blur-md animate-in fade-in duration-200">
            
            <div className="text-center space-y-1 pb-1">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#f2f2f2]">
                ¿CÓMO DESEAS INGRESAR?
              </h2>
              <p className="text-xs text-[rgba(242,242,242,0.5)]">
                Selecciona tu perfil de acceso para continuar
              </p>
            </div>

            <div className="space-y-3">
              
              {/* Opción A: Ingresar como Alumno */}
              <div 
                id="btn-login-select-student"
                onClick={() => {
                  setStep('student_login');
                  setStudentError('');
                  setStudentPassword('');
                }}
                className="group p-4 rounded-xl border border-[rgba(242,242,242,0.12)] hover:border-[#ff6b00] bg-[#1c1c21] hover:bg-[#202026] cursor-pointer transition-all duration-200 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#141417] text-[#ff6b00] flex items-center justify-center border border-[rgba(242,242,242,0.1)] group-hover:border-[#ff6b00] group-hover:scale-105 transition-all shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-[#f2f2f2] group-hover:text-[#ff6b00] transition-colors">
                        Ingresar como Alumno
                      </h3>
                      <span className="text-[9px] uppercase font-extrabold bg-[rgba(255,107,0,0.15)] text-[#ff6b00] border border-[rgba(255,107,0,0.3)] px-2 py-0.5 rounded-full">
                        Atleta
                      </span>
                    </div>
                    <p className="text-[11px] text-[rgba(242,242,242,0.5)] mt-1 leading-snug">
                      Accede a tu rutina del día, carga de series, autoevaluación (energía, sueño) y rutina alimentaria.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[rgba(242,242,242,0.4)] group-hover:text-[#ff6b00] group-hover:translate-x-1 transition-all shrink-0 ml-3" />
              </div>

              {/* Opción B: Ingresar como Coach */}
              <div 
                id="btn-login-select-coach"
                onClick={() => {
                  setStep('coach_login');
                  setCoachError('');
                  setCoachPasswordInput('');
                }}
                className="group p-4 rounded-xl border border-[rgba(242,242,242,0.12)] hover:border-[#ff6b00] bg-[#1c1c21] hover:bg-[#202026] cursor-pointer transition-all duration-200 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#141417] text-[#ff6b00] flex items-center justify-center border border-[rgba(242,242,242,0.1)] group-hover:border-[#ff6b00] group-hover:scale-105 transition-all shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-[#f2f2f2] group-hover:text-[#ff6b00] transition-colors">
                        Ingresar como Coach
                      </h3>
                      <span className="text-[9px] uppercase font-extrabold bg-[#141417] text-[rgba(242,242,242,0.7)] border border-[rgba(242,242,242,0.15)] px-2 py-0.5 rounded-full">
                        Entrenador
                      </span>
                    </div>
                    <p className="text-[11px] text-[rgba(242,242,242,0.5)] mt-1 leading-snug">
                      Panel global de atletas, diseño de macrociclos, dashboard biomecánico, eliminación de alumnos y periodización.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[rgba(242,242,242,0.4)] group-hover:text-[#ff6b00] group-hover:translate-x-1 transition-all shrink-0 ml-3" />
              </div>

            </div>

            <div className="pt-2 border-t border-[rgba(242,242,242,0.08)] flex items-center justify-center gap-4 text-[10px] text-[rgba(242,242,242,0.4)]">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#ff6b00]" /> Readiness & Cargas
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Utensils className="w-3 h-3 text-[#22c55e]" /> Rutina 4 Comidas
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#ff6b00]" /> Coach Panel
              </span>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* PASO 2 (SI ELIGIÓ ALUMNO): SE ABRE PARA INGRESAR COMO ALUMNO */}
        {/* ========================================================= */}
        {step === 'student_login' && (
          <div className="bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 backdrop-blur-md animate-in fade-in duration-200">
            
            {/* Navigation Header */}
            <div className="flex items-center justify-between border-b border-[rgba(242,242,242,0.08)] pb-3">
              <button
                type="button"
                onClick={() => setStep('select_role')}
                className="flex items-center gap-1.5 text-xs text-[rgba(242,242,242,0.6)] hover:text-[#ff6b00] cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a selección</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs font-bold text-[#ff6b00]">
                <User className="w-4 h-4" />
                <span>Ingreso Alumno</span>
              </div>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-4">
              
              {/* Select or View Student */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[rgba(242,242,242,0.7)] uppercase tracking-wider block">
                  Selecciona tu Cuenta de Alumno:
                </label>
                
                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {students.map((st) => {
                    const isSelected = selectedStudentId === st.id;
                    return (
                      <div
                        key={st.id}
                        onClick={() => {
                          setSelectedStudentId(st.id);
                          setStudentError('');
                        }}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#1c1c21] border-[#ff6b00] shadow-sm ring-1 ring-[#ff6b00]/30'
                            : 'bg-[#141417] border-[rgba(242,242,242,0.08)] hover:border-[rgba(242,242,242,0.2)] hover:bg-[#18181d]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={st.avatarUrl}
                            alt={st.fullName}
                            className="w-8 h-8 rounded-full object-cover border border-[rgba(242,242,242,0.15)] shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#f2f2f2] block truncate">
                              {st.fullName}
                            </span>
                            <span className="text-[10px] text-[rgba(242,242,242,0.5)] truncate block">
                              {st.goal} • {st.level}
                            </span>
                          </div>
                        </div>

                        {isSelected ? (
                          <span className="text-[10px] font-bold text-[#ff6b00] bg-[rgba(255,107,0,0.15)] px-2 py-0.5 rounded-md shrink-0">
                            Seleccionado
                          </span>
                        ) : (
                          <span className="text-[10px] text-[rgba(242,242,242,0.4)] shrink-0">
                            Elegir
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-[rgba(242,242,242,0.7)] uppercase tracking-wider">
                    Contraseña / PIN de Acceso
                  </label>
                  <span className="text-[10px] text-[#ff6b00] font-semibold">
                    Clave demo: 1234
                  </span>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[rgba(242,242,242,0.4)]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showStudentPassword ? 'text' : 'password'}
                    value={studentPassword}
                    onChange={(e) => {
                      setStudentPassword(e.target.value);
                      setStudentError('');
                    }}
                    placeholder="Ingresa tu clave (ej. 1234)"
                    className="w-full bg-[#1c1c21] border border-[rgba(242,242,242,0.12)] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#f2f2f2] placeholder-[rgba(242,242,242,0.4)] focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2] cursor-pointer"
                  >
                    {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Box */}
              {studentError && (
                <div className="p-2.5 bg-red-950/40 border border-red-800/50 rounded-xl flex items-start gap-2 text-xs text-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <span>{studentError}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#ff6b00] hover:bg-[#e65e00] active:scale-[0.99] text-[#ffffff] font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>INGRESAR A MI RUTINA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickStudentLogin(selectedStudentId)}
                  className="w-full py-2 bg-[#1c1c21] hover:bg-[#26262b] text-[rgba(242,242,242,0.7)] hover:text-[#f2f2f2] font-semibold text-xs rounded-xl border border-[rgba(242,242,242,0.1)] transition-colors cursor-pointer"
                >
                  Acceso Rápido Directo ({selectedStudent?.fullName || 'Alumno'})
                </button>
              </div>

            </form>

          </div>
        )}

        {/* ========================================================= */}
        {/* PASO 2 (SI ELIGIÓ COACH): SE ABRE PARA INGRESAR COMO COACH */}
        {/* ========================================================= */}
        {step === 'coach_login' && (
          <div className="bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 backdrop-blur-md animate-in fade-in duration-200">
            
            {/* Navigation Header */}
            <div className="flex items-center justify-between border-b border-[rgba(242,242,242,0.08)] pb-3">
              <button
                type="button"
                onClick={() => setStep('select_role')}
                className="flex items-center gap-1.5 text-xs text-[rgba(242,242,242,0.6)] hover:text-[#ff6b00] cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a selección</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs font-bold text-[#ff6b00]">
                <ShieldCheck className="w-4 h-4" />
                <span>Ingreso Coach</span>
              </div>
            </div>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-[#1c1c21] text-[#ff6b00] mx-auto flex items-center justify-center border border-[rgba(242,242,242,0.1)]">
                <ShieldCheck className="w-5 h-5 text-[#ff6b00]" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#f2f2f2]">
                CLAVE MAESTRA DE ENTRENADOR
              </h3>
              <p className="text-[11px] text-[rgba(242,242,242,0.5)]">
                Ingresa tu contraseña para acceder al panel de control integral
              </p>
            </div>

            <form onSubmit={handleCoachSubmit} className="space-y-4">
              
              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-[rgba(242,242,242,0.7)] uppercase tracking-wider">
                    Contraseña de Coach
                  </label>
                  <span className="text-[10px] text-[#ff6b00] font-semibold">
                    Clave demo: coach123 o 1234
                  </span>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[rgba(242,242,242,0.4)]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showCoachPassword ? 'text' : 'password'}
                    value={coachPasswordInput}
                    onChange={(e) => {
                      setCoachPasswordInput(e.target.value);
                      setCoachError('');
                    }}
                    placeholder="Contraseña de entrenador"
                    className="w-full bg-[#1c1c21] border border-[rgba(242,242,242,0.12)] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#f2f2f2] placeholder-[rgba(242,242,242,0.4)] focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowCoachPassword(!showCoachPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2] cursor-pointer"
                  >
                    {showCoachPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Box */}
              {coachError && (
                <div className="p-2.5 bg-red-950/40 border border-red-800/50 rounded-xl flex items-start gap-2 text-xs text-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <span>{coachError}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#ff6b00] hover:bg-[#e65e00] active:scale-[0.99] text-[#ffffff] font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>ACCEDER AL PANEL DE COACH</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleQuickCoachLogin}
                  className="w-full py-2 bg-[#1c1c21] hover:bg-[#26262b] text-[rgba(242,242,242,0.7)] hover:text-[#f2f2f2] font-semibold text-xs rounded-xl border border-[rgba(242,242,242,0.1)] transition-colors cursor-pointer"
                >
                  Acceso Rápido Directo (Coach)
                </button>
              </div>

            </form>

          </div>
        )}

        {/* Minimal Footer */}
        <p className="text-center text-[10px] text-[rgba(242,242,242,0.4)]">
          CURMOVE System • Planificación y Autoevaluación de Fuerza
        </p>

      </div>
    </div>
  );
};
