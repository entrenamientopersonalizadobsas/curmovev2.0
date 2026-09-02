import React, { useEffect, useState } from 'react';
import { ViewMode, StudentProfile } from '../types';
import { signInWithPassword, signUpWithPassword, supabase } from '../lib/supabase';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  CheckCircle, 
  X, 
  ChevronRight, 
  KeyRound, 
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  LogOut,
  Dumbbell
} from 'lucide-react';

interface AuthRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: ViewMode;
  students: StudentProfile[];
  activeStudent: StudentProfile;
  onSelectRole: (role: ViewMode, studentId?: string) => void;
  onLogout?: () => void;
}

export const AuthRoleModal: React.FC<AuthRoleModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  students,
  activeStudent,
  onSelectRole,
  onLogout
}) => {
  const [step, setStep] = useState<'select' | 'coach_auth' | 'student_select' | 'student_auth'>('select');
  const [selectedStudentTarget, setSelectedStudentTarget] = useState<StudentProfile | null>(null);
  
  // Password inputs
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingCoach, setIsCreatingCoach] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setSelectedStudentTarget(null);
      setPasswordInput('');
      setEmailInput('');
      setAuthError(null);
      setIsCreatingCoach(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartTrainerAuth = () => {
    setStep('coach_auth');
    setPasswordInput('');
    setShowPassword(false);
    setAuthError(null);
  };

  const handleStartStudentSelect = () => {
    setStep('student_select');
    setPasswordInput('');
    setShowPassword(false);
    setAuthError(null);
  };

  const handleVerifyCoach = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const submittedEmail = String(formData.get('coach-email') || emailInput).trim();
      const submittedPassword = String(formData.get('coach-password') || passwordInput);
      if (!supabase) throw new Error('La conexión con Supabase no está disponible. Recargá la página.');
      if (!submittedEmail) throw new Error('Ingresá el email del coach.');
      const { error } = await (isCreatingCoach
        ? signUpWithPassword(submittedEmail, submittedPassword)
        : signInWithPassword(submittedEmail, submittedPassword));
      if (error) throw error;
      if (isCreatingCoach) {
        setAuthError('Cuenta creada. Confirmá tu email y luego ingresá.');
        setIsCreatingCoach(false);
        return;
      }
      onSelectRole('trainer');
      onClose();
      setStep('select');
    } catch (error) {
      console.error('[v0] Error de login coach:', error);
      setAuthError(error instanceof Error && (error.message === 'Ingresá el email del coach.' || error.message === 'La conexión con Supabase no está disponible. Recargá la página.') ? error.message : 'Email o contraseña incorrectos.');
    } finally { setIsSubmitting(false); }
  };

  const handleChooseStudentForAuth = (student: StudentProfile) => {
    // If student is already active and logged in
    if (currentRole === 'student' && activeStudent.id === student.id) {
      onClose();
      return;
    }
    setSelectedStudentTarget(student);
    setStep('student_auth');
    setPasswordInput('');
    setShowPassword(false);
    setAuthError(null);
  };

  const handleVerifyStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStudentTarget) return;
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const submittedEmail = String(formData.get('student-email') || selectedStudentTarget.email).trim();
      const submittedPassword = String(formData.get('student-password') || passwordInput);
      if (!supabase) throw new Error('Supabase no está configurado.');
      const { error } = await signInWithPassword(submittedEmail, submittedPassword);
      if (error) throw error;
      onSelectRole('student', selectedStudentTarget.id);
      onClose();
      setStep('select');
    } catch (error) {
      console.error('[v0] Error de login alumno:', error);
      setAuthError('Email o contraseña incorrectos. Verificá que tu cuenta esté confirmada.');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden text-[#f2f2f2]">
        
        {/* Header */}
        <div className="p-4 bg-[#1c1c21] border-b border-[rgba(242,242,242,0.1)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#141417] flex items-center justify-center text-[#ff6b00] font-black text-sm border border-[rgba(242,242,242,0.1)]">
              <Lock className="w-4 h-4 text-[#ff6b00]" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#f2f2f2]">
                ACCESO Y SEGURIDAD DE CUENTA
              </h3>
              <p className="text-[11px] text-[rgba(242,242,242,0.5)]">
                {step === 'select' && 'Cambiar de usuario o validar contraseña'}
                {step === 'coach_auth' && 'Cambiar de usuario o validar contraseña'}
                {step === 'student_select' && 'Selecciona tu cuenta de atleta'}
                {step === 'student_auth' && 'Cambiar de usuario o validar contraseña'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#141417] hover:bg-[#26262b] text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2] cursor-pointer border border-[rgba(242,242,242,0.1)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          {/* STEP 1: LOGO CURMOVE + Seleccionar Alumno / Coach */}
          {step === 'select' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Logo CURMOVE */}
              <div className="flex flex-col items-center justify-center pt-1 pb-1 text-center">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-[#1c1c21] flex items-center justify-center border border-[rgba(242,242,242,0.1)]">
                    <Dumbbell className="w-4 h-4 text-[#ff6b00]" />
                  </div>
                  <div className="flex items-center font-display text-2xl font-extrabold tracking-tight">
                    <span className="text-[#f2f2f2]">CUR</span>
                    <span className="bg-[#ff6b00] text-[#ffffff] px-1.5 py-0.5 rounded-[3px] text-xs font-black ml-1 tracking-wider">
                      MOVE
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[rgba(242,242,242,0.5)] font-medium">
                  ¿Cómo deseas ingresar al sistema?
                </p>
              </div>

              {/* Roles list */}
              <div className="space-y-2.5">
                
                {/* Option 1: Coach */}
                <div 
                  onClick={handleStartTrainerAuth}
                  className="p-3.5 rounded-xl border border-[rgba(242,242,242,0.1)] hover:border-[#ff6b00] hover:bg-[#1c1c21] cursor-pointer transition-all flex items-center justify-between group bg-[#141417]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1c1c21] text-[#ff6b00] flex items-center justify-center group-hover:bg-[#ff6b00] group-hover:text-[#ffffff] transition-colors border border-[rgba(242,242,242,0.1)]">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#f2f2f2] flex items-center gap-1.5">
                        <span>Ingreso como Entrenador / Coach</span>
                        {currentRole === 'trainer' && (
                          <span className="text-[9px] bg-[#ff6b00] text-[#ffffff] px-1.5 py-0.2 rounded-full font-bold">
                            Actual
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-[rgba(242,242,242,0.5)] mt-0.5">
                        Acceso a todos los alumnos, dashboard y base de datos
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[rgba(242,242,242,0.5)] group-hover:text-[#ff6b00] group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>

                {/* Option 2: Alumno */}
                <div 
                  onClick={handleStartStudentSelect}
                  className="p-3.5 rounded-xl border border-[rgba(242,242,242,0.1)] hover:border-[#ff6b00] hover:bg-[#1c1c21] cursor-pointer transition-all flex items-center justify-between group bg-[#141417]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1c1c21] text-[#ff6b00] flex items-center justify-center group-hover:bg-[#ff6b00] group-hover:text-[#ffffff] transition-colors border border-[rgba(242,242,242,0.1)]">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#f2f2f2] flex items-center gap-1.5">
                        <span>Ingreso como Alumno / Atleta</span>
                        {currentRole === 'student' && (
                          <span className="text-[9px] bg-[#ff6b00] text-[#ffffff] px-1.5 py-0.2 rounded-full font-bold">
                            Actual
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-[rgba(242,242,242,0.5)] mt-0.5">
                        Acceso a tu rutina personalizada y registro de cargas
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[rgba(242,242,242,0.5)] group-hover:text-[#ff6b00] group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>

              </div>

              {onLogout && (
                <div className="pt-2 border-t border-[rgba(242,242,242,0.1)]">
                  <button
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="w-full py-2 bg-[#1c1c21] hover:bg-[#26262b] text-[#ff6b00] text-xs font-bold rounded-xl border border-[rgba(242,242,242,0.1)] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* STEP 2 (Coach): CONTRASEÑA DE ENTRENADOR */}
          {step === 'coach_auth' && (
            <form onSubmit={handleVerifyCoach} className="space-y-4 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-xl bg-[#1c1c21] text-[#ff6b00] mx-auto flex items-center justify-center border border-[rgba(242,242,242,0.1)]">
                  <ShieldCheck className="w-5 h-5 text-[#ff6b00]" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#f2f2f2]">
                  CONTRASEÑA DE ENTRENADOR
                </h4>
                <p className="text-[11px] text-[rgba(242,242,242,0.5)]">
                  Ingresa tu clave maestra para acceder a la gestión global
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="email"
                  name="coach-email"
                  autoComplete="email"
                  required
                  placeholder="Email del coach"
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setAuthError(null); }}
                  className="w-full p-2.5 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-xl text-xs text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="coach-password"
                    autoComplete="current-password"
                    autoFocus
                    placeholder="Contraseña de entrenador"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setAuthError(null);
                    }}
                    className="w-full p-2.5 pl-9 pr-9 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-xl text-xs text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                  />
                  <KeyRound className="w-4 h-4 text-[rgba(242,242,242,0.5)] absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {authError && (
                  <div className="p-2 bg-[#2d171e] border border-[#592634] rounded-lg text-xs text-[#f7a8b8] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="flex-1 py-2.5 bg-[#1c1c21] hover:bg-[#26262b] text-[#f2f2f2] font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer border border-[rgba(242,242,242,0.1)]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Atrás</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Ingresando...' : (isCreatingCoach ? 'Crear cuenta' : 'Validar Acceso')}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2 (Alumno - Select Athlete): SELECCIONA LA CUENTA DEL ATLETA */}
          {step === 'student_select' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold text-[rgba(242,242,242,0.5)]">
                  SELECCIONA LA CUENTA DEL ATLETA:
                </label>
                <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar">
                  {students.map((student) => {
                    const isCurrent = currentRole === 'student' && activeStudent.id === student.id;

                    return (
                      <button
                        key={student.id}
                        onClick={() => handleChooseStudentForAuth(student)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-[#1c1c21] border-[#ff6b00] shadow-xs'
                            : 'bg-[#141417] border-[rgba(242,242,242,0.1)] hover:border-[#26262b] hover:bg-[#1c1c21]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={student.avatarUrl}
                            alt={student.fullName}
                            className="w-7 h-7 rounded-full object-cover border border-[rgba(242,242,242,0.1)]"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#f2f2f2] block truncate">
                              {student.fullName}
                            </span>
                            <span className="text-[10px] text-[rgba(242,242,242,0.5)] truncate block">
                              {student.goal}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-[#ffffff] bg-[#ff6b00] hover:bg-[#e65e00] px-2 py-0.5 rounded-md shrink-0">
                          {isCurrent ? 'Actual' : 'Ingresar'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="w-full py-2 bg-[#1c1c21] hover:bg-[#26262b] text-[#f2f2f2] font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer border border-[rgba(242,242,242,0.1)]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Atrás</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 (Alumno - Password Auth): CONTRASEÑA DE ALUMNO */}
          {step === 'student_auth' && selectedStudentTarget && (
            <form onSubmit={handleVerifyStudent} className="space-y-4 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-xl bg-[#1c1c21] text-[#ff6b00] mx-auto flex items-center justify-center border border-[rgba(242,242,242,0.1)] overflow-hidden">
                  {selectedStudentTarget.avatarUrl ? (
                    <img
                      src={selectedStudentTarget.avatarUrl}
                      alt={selectedStudentTarget.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-[#ff6b00]" />
                  )}
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#f2f2f2]">
                  CONTRASEÑA DE ALUMNO
                </h4>
                <p className="text-[11px] text-[rgba(242,242,242,0.5)]">
                  Ingresa tu clave para acceder a la rutina de <span className="text-[#f2f2f2] font-semibold">{selectedStudentTarget.fullName}</span>
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="email"
                  name="student-email"
                  autoComplete="email"
                  required
                  value={selectedStudentTarget.email}
                  readOnly
                  className="w-full p-2.5 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-xl text-xs text-[#f2f2f2]"
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="student-password"
                    autoComplete="current-password"
                    autoFocus
                    placeholder="Contraseña del alumno"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setAuthError(null);
                    }}
                    className="w-full p-2.5 pl-9 pr-9 bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-xl text-xs text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                  />
                  <KeyRound className="w-4 h-4 text-[rgba(242,242,242,0.5)] absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {authError && (
                  <div className="p-2 bg-[#2d171e] border border-[#592634] rounded-lg text-xs text-[#f7a8b8] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('student_select')}
                  className="flex-1 py-2.5 bg-[#1c1c21] hover:bg-[#26262b] text-[#f2f2f2] font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer border border-[rgba(242,242,242,0.1)]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Atrás</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
<<<<<<< HEAD
                  {isSubmitting ? 'Ingresando...' : 'Entrar a Mi Rutina'}
=======
                  Validar Acceso
>>>>>>> 8d7fddd8e429b1020428cbaa766573533bda0191
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
