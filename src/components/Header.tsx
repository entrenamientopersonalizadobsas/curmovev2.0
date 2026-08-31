import React from 'react';
import { ViewMode, StudentProfile } from '../types';
import { 
  Activity, 
  Sparkles, 
  UserCheck, 
  Search, 
  ChevronDown, 
  Download,
  Database,
  ShieldCheck,
  User,
  LogIn,
  Layers,
  CalendarDays,
  Dumbbell,
  LogOut
} from 'lucide-react';

interface HeaderProps {
  viewMode: ViewMode;
  onToggleViewMode: (mode: ViewMode) => void;
  activeMainTab: string;
  onSelectMainTab: (tab: string) => void;
  activeStudent: StudentProfile;
  students: StudentProfile[];
  onSelectStudent: (studentId: string) => void;
  onOpenAnthropometry: () => void;
  onOpenProfile: () => void;
  onOpenAuthModal: () => void;
  onOpenSearch: () => void;
  onExportHTML: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onToggleViewMode,
  activeMainTab,
  onSelectMainTab,
  activeStudent,
  students,
  onSelectStudent,
  onOpenAnthropometry,
  onOpenProfile,
  onOpenAuthModal,
  onOpenSearch,
  onExportHTML,
  onLogout
}) => {
  return (
    <header id="curmove-header" className="bg-[#141417] border-b border-[rgba(242,242,242,0.1)] sticky top-0 z-30 shrink-0 text-[#f2f2f2]">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Logo & Direct Main Tabs */}
        <div className="flex items-center gap-6">
          {/* Logo CURMOVE (Syne + Athletic Orange) */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none group" 
            onClick={() => onSelectMainTab('rutina')}
          >
            <div className="w-8 h-8 rounded-lg bg-[#1c1c21] flex items-center justify-center text-[#f2f2f2] border border-[rgba(242,242,242,0.1)] group-hover:border-[#ff6b00] transition-all">
              <Dumbbell className="w-4 h-4 text-[#ff6b00]" />
            </div>
            <div className="flex items-center font-display text-xl font-extrabold tracking-tight">
              <span className="text-[#f2f2f2]">CUR</span>
              <span className="bg-[#ff6b00] text-[#ffffff] px-1.5 py-0.5 rounded-[3px] text-xs font-black ml-1 tracking-wider">
                MOVE
              </span>
            </div>
          </div>

          {/* Unified Main Navigation Tabs */}
          <nav className="flex items-center gap-1.5 text-xs font-medium">
            {viewMode === 'trainer' ? (
              <>
                {/* 1. Planificador */}
                <button
                  id="nav-tab-rutina"
                  onClick={() => onSelectMainTab('rutina')}
                  title="Planificador de Rutinas"
                  aria-label="Planificador de Rutinas"
                  className={`p-2 rounded-lg transition-all flex items-center justify-center cursor-pointer border ${
                    activeMainTab === 'rutina'
                      ? 'bg-[#1c1c21] text-[#f2f2f2] border-[rgba(242,242,242,0.15)] shadow-xs'
                      : 'text-[rgba(242,242,242,0.5)] hover:bg-[#1c1c21] hover:text-[#f2f2f2] border-transparent'
                  }`}
                >
                  <CalendarDays className={`w-4 h-4 ${activeMainTab === 'rutina' ? 'text-[#ff6b00]' : 'text-[rgba(242,242,242,0.5)]'}`} />
                </button>

                {/* 2. Dashboard */}
                <button
                  id="nav-tab-dashboard"
                  onClick={() => onSelectMainTab('dashboard')}
                  title="Dashboard de Seguimiento, Macrociclos & Volumen (Coach)"
                  aria-label="Dashboard de Seguimiento y Macrociclos"
                  className={`p-2 rounded-lg transition-all flex items-center justify-center relative cursor-pointer border ${
                    activeMainTab === 'dashboard'
                      ? 'bg-[#1c1c21] text-[#f2f2f2] border-[rgba(242,242,242,0.15)] shadow-xs'
                      : 'text-[rgba(242,242,242,0.5)] hover:bg-[#1c1c21] hover:text-[#f2f2f2] border-transparent'
                  }`}
                >
                  <Sparkles className={`w-4 h-4 ${activeMainTab === 'dashboard' ? 'text-[#ff6b00]' : 'text-[rgba(242,242,242,0.5)]'}`} />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#ff6b00]" />
                </button>

                {/* 3. Base de Datos & Plantillas */}
                <button
                  id="nav-tab-database"
                  onClick={() => onSelectMainTab('database')}
                  title="Base de Datos de Ejercicios & Plantillas"
                  aria-label="Base de Datos de Ejercicios y Plantillas"
                  className={`p-2 rounded-lg transition-all flex items-center justify-center cursor-pointer border ${
                    activeMainTab === 'database'
                      ? 'bg-[#1c1c21] text-[#f2f2f2] border-[rgba(242,242,242,0.15)] shadow-xs'
                      : 'text-[rgba(242,242,242,0.5)] hover:bg-[#1c1c21] hover:text-[#f2f2f2] border-transparent'
                  }`}
                >
                  <Database className={`w-4 h-4 ${activeMainTab === 'database' ? 'text-[#ff6b00]' : 'text-[rgba(242,242,242,0.5)]'}`} />
                </button>

                {/* 4. Antropometría */}
                <button
                  id="nav-tab-antropometria"
                  onClick={onOpenAnthropometry}
                  title="Evaluación y Registro Antropométrico"
                  aria-label="Evaluación Antropométrica"
                  className="p-2 rounded-lg text-[rgba(242,242,242,0.5)] hover:bg-[#1c1c21] hover:text-[#f2f2f2] transition-all flex items-center justify-center cursor-pointer border border-transparent"
                >
                  <Activity className="w-4 h-4 text-[rgba(242,242,242,0.6)]" />
                </button>

                {/* 5. Ficha Atleta */}
                <button
                  id="nav-tab-perfil"
                  onClick={onOpenProfile}
                  title="Ficha y Perfil del Atleta"
                  aria-label="Ficha del Atleta"
                  className="p-2 rounded-lg text-[rgba(242,242,242,0.5)] hover:bg-[#1c1c21] hover:text-[#f2f2f2] transition-all flex items-center justify-center cursor-pointer border border-transparent"
                >
                  <UserCheck className="w-4 h-4 text-[rgba(242,242,242,0.6)]" />
                </button>
              </>
            ) : (
              <>
                {/* Student Tab 1: Mi Rutina */}
                <button
                  id="nav-tab-student-rutina"
                  onClick={() => onSelectMainTab('rutina')}
                  title="Mi Rutina de Entrenamiento"
                  aria-label="Mi Rutina"
                  className={`p-2 rounded-lg transition-all flex items-center justify-center cursor-pointer border ${
                    activeMainTab === 'rutina'
                      ? 'bg-[#1c1c21] text-[#f2f2f2] border-[rgba(242,242,242,0.15)] shadow-xs'
                      : 'text-[rgba(242,242,242,0.5)] hover:bg-[#1c1c21] hover:text-[#f2f2f2] border-transparent'
                  }`}
                >
                  <Dumbbell className={`w-4 h-4 ${activeMainTab === 'rutina' ? 'text-[#ff6b00]' : 'text-[rgba(242,242,242,0.5)]'}`} />
                </button>

                {/* Student Tab 2: Antropometría */}
                <button
                  id="nav-tab-student-anthropometry"
                  onClick={onOpenAnthropometry}
                  title="Mis Evaluaciones Antropométricas"
                  aria-label="Mis Evaluaciones"
                  className="p-2 rounded-lg text-[rgba(242,242,242,0.5)] hover:bg-[#1c1c21] hover:text-[#f2f2f2] transition-all flex items-center justify-center cursor-pointer border border-transparent"
                >
                  <Activity className="w-4 h-4 text-[rgba(242,242,242,0.6)]" />
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Right: Search, Athlete Selector, Mode Switcher & Tools */}
        <div className="flex items-center gap-3">
          
          {/* Quick Search */}
          <div className="relative hidden md:block w-44 lg:w-56">
            <button
              id="btn-open-search"
              onClick={onOpenSearch}
              className="w-full pl-8 pr-2.5 py-1.5 bg-[#1c1c21] hover:bg-[#26262b] border border-[rgba(242,242,242,0.1)] rounded-full text-xs text-[rgba(242,242,242,0.5)] flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="truncate">Buscar ejercicios o alumnos...</span>
              <kbd className="hidden lg:inline-block ml-1 text-[9px] font-mono-code bg-[#141417] px-1.5 py-0.5 rounded text-[rgba(242,242,242,0.5)] border border-[rgba(242,242,242,0.1)]">
                ⌘K
              </kbd>
            </button>
            <Search className="w-3.5 h-3.5 text-[#ff6b00] absolute left-2.5 top-2 pointer-events-none" />
          </div>

          {/* Student Selector / Athlete Badge */}
          {viewMode === 'trainer' ? (
            <div className="relative shrink-0">
              <select
                id="select-active-student"
                value={activeStudent.id}
                onChange={(e) => onSelectStudent(e.target.value)}
                className="py-1.5 pl-3 bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-lg text-xs font-semibold text-[#f2f2f2] pr-8 focus:border-[#ff6b00] focus:outline-none cursor-pointer appearance-none shadow-xs"
                title="Seleccionar Alumno"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#141417] text-[#f2f2f2]">
                    {s.fullName} ({s.goal})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[rgba(242,242,242,0.5)] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#1c1c21] border border-[rgba(242,242,242,0.1)] rounded-lg px-3 py-1.5 shrink-0">
              <img
                src={activeStudent.avatarUrl}
                alt={activeStudent.fullName}
                className="w-5 h-5 rounded-full object-cover border border-[#ff6b00]"
              />
              <span className="text-xs font-semibold text-[#f2f2f2] truncate max-w-[130px]">
                {activeStudent.fullName}
              </span>
            </div>
          )}

          {/* User Switcher Segmented Control (Coach / Alumno) */}
          <div className="flex bg-[#141417] p-1 rounded-lg gap-1 border border-[rgba(242,242,242,0.1)]">
            <button
              id="btn-trainer"
              onClick={() => onToggleViewMode('trainer')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'trainer'
                  ? 'bg-[#ff6b00] text-[#ffffff] shadow-xs'
                  : 'text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2]'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${viewMode === 'trainer' ? 'text-[#ffffff]' : 'text-[rgba(242,242,242,0.5)]'}`} />
              <span>Coach</span>
            </button>

            <button
              id="btn-student"
              onClick={() => onToggleViewMode('student')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'student'
                  ? 'bg-[#ff6b00] text-[#ffffff] shadow-xs'
                  : 'text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2]'
              }`}
            >
              <User className={`w-3.5 h-3.5 ${viewMode === 'student' ? 'text-[#ffffff]' : 'text-[rgba(242,242,242,0.5)]'}`} />
              <span>Alumno</span>
            </button>
          </div>

          {/* Access / Role Control Button */}
          <button
            onClick={onOpenAuthModal}
            className="px-3 py-1.5 rounded-lg bg-[#1c1c21] hover:bg-[#26262b] text-[#f2f2f2] font-semibold text-xs border border-[rgba(242,242,242,0.1)] shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Cambiar de usuario o ver seguridad de cuenta"
          >
            <LogIn className="w-3.5 h-3.5 text-[#ff6b00]" />
            <span className="hidden xl:inline">Cuenta</span>
          </button>

          {/* Export Routine HTML button */}
          <button
            id="btn-export-routine"
            onClick={onExportHTML}
            title="Exportar / Descargar Ficha"
            className="p-2 rounded-lg bg-[#1c1c21] hover:bg-[#26262b] text-[#f2f2f2] border border-[rgba(242,242,242,0.1)] transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Logout button */}
          {onLogout && (
            <button
              onClick={onLogout}
              title="Cerrar Sesión"
              className="p-2 rounded-lg bg-[#1c1c21] hover:bg-[#2e1a1e] text-[rgba(242,242,242,0.5)] hover:text-[#ff5555] border border-[rgba(242,242,242,0.1)] transition-colors shadow-xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
};

