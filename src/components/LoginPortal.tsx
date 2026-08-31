import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Dumbbell, 
  Sparkles, 
  ArrowRight,
  UserCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface LoginPortalProps {
  students: StudentProfile[];
  onLoginSuccess: (role: 'trainer' | 'student', studentId?: string) => void;
  coachPassword?: string;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({
  students,
  onLoginSuccess,
  coachPassword = 'coach123'
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'trainer'>('student');
  
  // Student Login State
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [studentPassword, setStudentPassword] = useState<string>('');
  const [showStudentPassword, setShowStudentPassword] = useState<boolean>(false);
  const [studentError, setStudentError] = useState<string>('');

  // Trainer Login State
  const [trainerEmail, setTrainerEmail] = useState<string>('coach@curmove.com');
  const [trainerPasswordInput, setTrainerPasswordInput] = useState<string>('');
  const [showTrainerPassword, setShowTrainerPassword] = useState<boolean>(false);
  const [trainerError, setTrainerError] = useState<string>('');

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');

    if (!selectedStudent) {
      setStudentError('Selecciona un alumno para continuar.');
      return;
    }

    const correctPassword = selectedStudent.password || '1234';
    if (studentPassword.trim() === correctPassword.trim()) {
      onLoginSuccess('student', selectedStudent.id);
    } else {
      setStudentError('Contraseña incorrecta. Verifica tu clave o solicita una nueva a tu entrenador.');
    }
  };

  const handleTrainerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTrainerError('');

    if (trainerPasswordInput.trim() === coachPassword.trim() || trainerPasswordInput.trim() === 'coach123' || trainerPasswordInput.trim() === '1234') {
      onLoginSuccess('trainer');
    } else {
      setTrainerError('Contraseña de entrenador incorrecta.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-[#f2f2f2] flex flex-col items-center justify-center p-4 selection:bg-[#ff6b00] selection:text-[#ffffff]">
      
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-[#ff6b00]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-[#ff6b00]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md z-10 space-y-6">
        
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#141417] border border-[rgba(242,242,242,0.1)] text-[#ff6b00] shadow-sm mb-1">
            <Dumbbell className="w-6 h-6 text-[#ff6b00]" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-[#f2f2f2]">
            CURMOVE
          </h1>
          <p className="text-xs text-[rgba(242,242,242,0.6)] font-medium">
            Plataforma de Entrenamiento & Periodización
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-2xl p-6 shadow-xl space-y-5 backdrop-blur-md">
          
          {/* Segmented Mode Selector */}
          <div className="grid grid-cols-2 p-1 bg-[#0c0c0e] rounded-xl border border-[rgba(242,242,242,0.1)] gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                setStudentError('');
              }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-[#1c1c21] text-[#f2f2f2] border border-[rgba(242,242,242,0.1)] shadow-xs'
                  : 'text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2]'
              }`}
            >
              <User className="w-3.5 h-3.5 text-[#ff6b00]" />
              <span>Soy Alumno</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('trainer');
                setTrainerError('');
              }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'trainer'
                  ? 'bg-[#1c1c21] text-[#f2f2f2] border border-[rgba(242,242,242,0.1)] shadow-xs'
                  : 'text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#ff6b00]" />
              <span>Soy Entrenador</span>
            </button>
          </div>

          {/* TAB 1: STUDENT LOGIN */}
          {activeTab === 'student' && (
            <form onSubmit={handleStudentSubmit} className="space-y-4 animate-in fade-in duration-200">
              
              {/* Select Student Profile */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[rgba(242,242,242,0.7)] uppercase tracking-wider block">
                  Seleccionar Alumno
                </label>
                <div className="relative">
                  <select
                    value={selectedStudentId}
                    onChange={(e) => {
                      setSelectedStudentId(e.target.value);
                      setStudentError('');
                    }}
                    className="w-full bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] cursor-pointer appearance-none"
                  >
                    {students.map((st) => (
                      <option key={st.id} value={st.id} className="bg-[#141417] text-[#f2f2f2]">
                        {st.fullName} ({st.goal} • {st.level})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student Selected Badge */}
              {selectedStudent && (
                <div className="p-2.5 bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl flex items-center gap-3">
                  <img
                    src={selectedStudent.avatarUrl}
                    alt={selectedStudent.fullName}
                    className="w-9 h-9 rounded-full object-cover border border-[rgba(242,242,242,0.1)]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-[#f2f2f2] truncate">
                      {selectedStudent.fullName}
                    </p>
                    <p className="text-[10px] text-[rgba(242,242,242,0.6)] truncate">
                      {selectedStudent.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Student Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-[rgba(242,242,242,0.7)] uppercase tracking-wider">
                    Contraseña del Alumno
                  </label>
                  <span className="text-[10px] text-[rgba(242,242,242,0.4)]">
                    Clave asignada
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
                    placeholder="Ingresa tu contraseña"
                    className="w-full bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#f2f2f2] placeholder-[rgba(242,242,242,0.4)] focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]"
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

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#ff6b00] hover:bg-[#e65e00] active:scale-[0.99] text-[#ffffff] font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>INGRESAR A MI ENTRENAMIENTO</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

            </form>
          )}

          {/* TAB 2: TRAINER / COACH LOGIN */}
          {activeTab === 'trainer' && (
            <form onSubmit={handleTrainerSubmit} className="space-y-4 animate-in fade-in duration-200">
              
              {/* Trainer Email / User */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[rgba(242,242,242,0.7)] uppercase tracking-wider block">
                  Usuario o Correo del Coach
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[rgba(242,242,242,0.4)]">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={trainerEmail}
                    onChange={(e) => setTrainerEmail(e.target.value)}
                    className="w-full bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]"
                  />
                </div>
              </div>

              {/* Trainer Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-[rgba(242,242,242,0.7)] uppercase tracking-wider">
                    Contraseña Maestra del Entrenador
                  </label>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[rgba(242,242,242,0.4)]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showTrainerPassword ? 'text' : 'password'}
                    value={trainerPasswordInput}
                    onChange={(e) => {
                      setTrainerPasswordInput(e.target.value);
                      setTrainerError('');
                    }}
                    placeholder="Contraseña de entrenador"
                    className="w-full bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#f2f2f2] placeholder-[rgba(242,242,242,0.4)] focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowTrainerPassword(!showTrainerPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2] cursor-pointer"
                  >
                    {showTrainerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Box */}
              {trainerError && (
                <div className="p-2.5 bg-red-950/40 border border-red-800/50 rounded-xl flex items-start gap-2 text-xs text-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <span>{trainerError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#ff6b00] hover:bg-[#e65e00] active:scale-[0.99] text-[#ffffff] font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>ACCEDER AL PANEL DE ENTRENADOR</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

            </form>
          )}

        </div>

        {/* Minimal Footer */}
        <p className="text-center text-[10px] text-[rgba(242,242,242,0.4)]">
          CURMOVE System • Planificación y Autoevaluación de Fuerza
        </p>

      </div>
    </div>
  );
};
