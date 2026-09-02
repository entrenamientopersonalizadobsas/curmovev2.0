import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { 
  UserCheck, 
  Target, 
  AlertTriangle, 
  Calendar, 
  Dumbbell, 
  X, 
  Plus, 
  Edit3, 
  Mail,
  ShieldAlert,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  AlertOctagon
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStudent: StudentProfile;
  students: StudentProfile[];
  onSelectStudent: (studentId: string) => void;
  onUpdateStudent: (updated: StudentProfile) => void;
  onAddStudent: (newStudent: StudentProfile) => void;
  onDeleteStudent?: (studentId: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  activeStudent,
  students,
  onSelectStudent,
  onUpdateStudent,
  onAddStudent,
  onDeleteStudent
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentProfile | null>(null);

  // Edit fields
  const [fullName, setFullName] = useState<string>(activeStudent.fullName);
  const [goal, setGoal] = useState<StudentProfile['goal']>(activeStudent.goal);
  const [level, setLevel] = useState<StudentProfile['level']>(activeStudent.level);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(activeStudent.targetDaysPerWeek);
  const [injuries, setInjuries] = useState<string>(activeStudent.injuriesOrNotes);
  const [studentPassword, setStudentPassword] = useState<string>(activeStudent.password || '1234');
  const [showEditPassword, setShowEditPassword] = useState<boolean>(false);

  // New Student fields
  const [newName, setNewName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('1234');
  const [newGoal, setNewGoal] = useState<StudentProfile['goal']>('Hipertrofia');
  const [newLevel, setNewLevel] = useState<StudentProfile['level']>('Intermedio');

  React.useEffect(() => {
    setFullName(activeStudent.fullName);
    setGoal(activeStudent.goal);
    setLevel(activeStudent.level);
    setDaysPerWeek(activeStudent.targetDaysPerWeek);
    setInjuries(activeStudent.injuriesOrNotes);
    setStudentPassword(activeStudent.password || '1234');
  }, [activeStudent]);

  if (!isOpen) return null;

  const handleSaveEdit = () => {
    onUpdateStudent({
      ...activeStudent,
      fullName,
      goal,
      level,
      targetDaysPerWeek: daysPerWeek,
      injuriesOrNotes: injuries,
      password: studentPassword.trim() || '1234'
    });
    setIsEditing(false);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newSt: StudentProfile = {
      id: `student-${Date.now()}`,
      fullName: newName.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      password: newPassword.trim() || '1234',
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      age: 26,
      heightCm: 175,
      currentWeightKg: 75,
      goal: newGoal,
      level: newLevel,
      targetDaysPerWeek: 4,
      injuriesOrNotes: 'Ninguna lesión reportada.',
      startDate: new Date().toISOString().split('T')[0],
      anthropometryHistory: [],
      readinessLogs: {},
      workouts: {}
    };

    onAddStudent(newSt);
    onSelectStudent(newSt.id);
    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
    setNewPassword('1234');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#f2f2f2]">
        
        {/* Modal Header */}
        <div className="p-4 bg-[#141417] border-b border-[rgba(242,242,242,0.1)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[rgba(255,107,0,0.15)] flex items-center justify-center text-[#ff6b00] border border-[rgba(255,107,0,0.3)]">
              <UserCheck className="w-5 h-5 text-[#ff6b00]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#f2f2f2] tracking-tight">GESTIÓN DE ALUMNOS</h2>
              <p className="text-xs text-[rgba(242,242,242,0.6)]">Atletas, credenciales de acceso y perfiles</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Alumno</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#1c1c21] hover:bg-[#26262b] text-[rgba(242,242,242,0.6)] hover:text-[#f2f2f2] transition-colors cursor-pointer border border-[rgba(242,242,242,0.1)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar">
          
          {/* Active Student Selector List */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[rgba(242,242,242,0.5)]">
              Seleccionar Atleta
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {students.map((st) => {
                const isSelected = st.id === activeStudent.id;
                return (
                  <div
                    key={st.id}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-all group ${
                      isSelected
                        ? 'bg-[#1c1c21] border-[#ff6b00] shadow-sm ring-1 ring-[#ff6b00]/40'
                        : 'bg-[#1c1c21] border-[rgba(242,242,242,0.1)] hover:border-[rgba(242,242,242,0.2)] hover:bg-[#26262b]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectStudent(st.id)}
                      className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                    >
                      <img
                        src={st.avatarUrl}
                        alt={st.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-[rgba(242,242,242,0.15)] shrink-0"
                      />
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-[#f2f2f2] truncate">{st.fullName}</h4>
                        <p className="text-[11px] text-[#ff6b00] font-medium">{st.goal}</p>
                        <p className="text-[10px] text-[rgba(242,242,242,0.5)]">{st.level}</p>
                      </div>
                    </button>

                    {onDeleteStudent && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStudentToDelete(st);
                        }}
                        title={`Eliminar a ${st.fullName}`}
                        className="p-1.5 rounded-lg text-[rgba(242,242,242,0.4)] hover:text-red-400 hover:bg-red-950/40 opacity-70 group-hover:opacity-100 transition-all cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Student Detailed Card */}
          <div className="bg-[#1c1c21] p-4 rounded-xl border border-[rgba(242,242,242,0.1)] space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(242,242,242,0.1)] pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={activeStudent.avatarUrl}
                  alt={activeStudent.fullName}
                  className="w-12 h-12 rounded-full object-cover border border-[rgba(255,107,0,0.3)]"
                />
                <div>
                  <h3 className="text-sm font-black text-[#f2f2f2]">{activeStudent.fullName}</h3>
                  <p className="text-xs text-[rgba(242,242,242,0.6)] flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[rgba(242,242,242,0.4)]" />
                    <span>{activeStudent.email}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onDeleteStudent && (
                  <button
                    type="button"
                    onClick={() => setStudentToDelete(activeStudent)}
                    className="px-3 py-1.5 bg-red-950/30 hover:bg-red-950/60 text-red-400 hover:text-red-300 text-xs font-bold rounded-lg border border-red-800/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Eliminar este alumno"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                )}

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 py-1.5 bg-[#141417] hover:bg-[#26262b] text-[#f2f2f2] text-xs font-bold rounded-lg border border-[rgba(242,242,242,0.1)] flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#ff6b00]" />
                  <span>{isEditing ? 'Cancelar' : 'Editar Datos & Clave'}</span>
                </button>
              </div>
            </div>

            {/* Profile fields */}
            {isEditing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[rgba(242,242,242,0.8)] font-bold mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg p-2 text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                    />
                  </div>

                  <div>
                    <label className="block text-[rgba(242,242,242,0.8)] font-bold mb-1">Contraseña del Alumno</label>
                    <div className="relative">
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        placeholder="Clave de acceso"
                        className="w-full bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg p-2 pr-8 text-[#f2f2f2] font-mono focus:outline-none focus:border-[#ff6b00]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[rgba(242,242,242,0.5)] hover:text-[#f2f2f2] cursor-pointer"
                      >
                        {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[rgba(242,242,242,0.8)] font-bold mb-1">Objetivo Principal</label>
                    <select
                      value={goal}
                      onChange={(e) => setGoal(e.target.value as StudentProfile['goal'])}
                      className="w-full bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg p-2 text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                    >
                      <option value="Hipertrofia">Hipertrofia</option>
                      <option value="Fuerza Máxima">Fuerza Máxima</option>
                      <option value="Pérdida de Grasa">Pérdida de Grasa</option>
                      <option value="Recomposición">Recomposición</option>
                      <option value="Rendimiento Deportivo">Rendimiento Deportivo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[rgba(242,242,242,0.8)] font-bold mb-1">Nivel</label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as StudentProfile['level'])}
                      className="w-full bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg p-2 text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                    >
                      <option value="Principiante">Principiante</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Avanzado">Avanzado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[rgba(242,242,242,0.8)] font-bold mb-1">Días Objetivo / Semana</label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={daysPerWeek}
                      onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                      className="w-full bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg p-2 text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[rgba(242,242,242,0.8)] font-bold mb-1 text-xs">
                    Historial de Lesiones / Observaciones
                  </label>
                  <textarea
                    rows={2}
                    value={injuries}
                    onChange={(e) => setInjuries(e.target.value)}
                    className="w-full bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg p-2 text-xs text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] font-black text-xs rounded-lg transition-all cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-[#141417] p-2.5 rounded-lg border border-[rgba(242,242,242,0.1)]">
                  <span className="text-[rgba(242,242,242,0.5)] text-[10px] uppercase font-bold block">Objetivo</span>
                  <span className="text-[#ff6b00] font-black text-xs">{activeStudent.goal}</span>
                </div>
                <div className="bg-[#141417] p-2.5 rounded-lg border border-[rgba(242,242,242,0.1)]">
                  <span className="text-[rgba(242,242,242,0.5)] text-[10px] uppercase font-bold block">Nivel</span>
                  <span className="text-[#f2f2f2] font-bold text-xs">{activeStudent.level}</span>
                </div>
                <div className="bg-[#141417] p-2.5 rounded-lg border border-[rgba(242,242,242,0.1)]">
                  <span className="text-[rgba(242,242,242,0.5)] text-[10px] uppercase font-bold block">Clave de Acceso</span>
                  <span className="text-[#f2f2f2] font-mono font-bold text-xs flex items-center gap-1 mt-0.5">
                    <KeyRound className="w-3 h-3 text-[#ff6b00]" />
                    <span>{activeStudent.password || '1234'}</span>
                  </span>
                </div>
                <div className="bg-[#141417] p-2.5 rounded-lg border border-[rgba(242,242,242,0.1)]">
                  <span className="text-[rgba(242,242,242,0.5)] text-[10px] uppercase font-bold block">Frecuencia</span>
                  <span className="text-[#f2f2f2] font-bold text-xs">{activeStudent.targetDaysPerWeek} días/sem</span>
                </div>
              </div>
            )}

            {/* Medical / Injury Notes */}
            <div className="p-3 bg-[rgba(255,107,0,0.08)] border border-[rgba(255,107,0,0.2)] rounded-lg flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#ff6b00] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-[#ff6b00] block">Atención Biomecánica / Lesiones:</span>
                <p className="text-[rgba(242,242,242,0.75)] mt-0.5">
                  {activeStudent.injuriesOrNotes || 'Sin limitaciones registradas.'}
                </p>
              </div>
            </div>
          </div>

          {/* New Student Form Modal */}
          {showAddModal && (
            <div className="p-4 bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.15)] space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#ff6b00]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#f2f2f2]">
                  Añadir Nuevo Alumno (Sin rutinas previas)
                </h3>
              </div>
              <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[rgba(242,242,242,0.8)] font-bold mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Carolina Fernández"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg p-2 text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                    />
                  </div>
                  <div>
                    <label className="block text-[rgba(242,242,242,0.8)] font-bold mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="carolina@email.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg p-2 text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                    />
                  </div>
                  <div>
                    <label className="block text-[rgba(242,242,242,0.8)] font-bold mb-1">Contraseña para el Alumno</label>
                    <input
                      type="text"
                      placeholder="Ej: 1234"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg p-2 text-[#f2f2f2] font-mono focus:outline-none focus:border-[#ff6b00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[rgba(242,242,242,0.8)] font-bold mb-1">Objetivo</label>
                    <select
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value as StudentProfile['goal'])}
                      className="w-full bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg p-2 text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                    >
                      <option value="Hipertrofia">Hipertrofia</option>
                      <option value="Fuerza Máxima">Fuerza Máxima</option>
                      <option value="Pérdida de Grasa">Pérdida de Grasa</option>
                      <option value="Recomposición">Recomposición</option>
                      <option value="Rendimiento Deportivo">Rendimiento Deportivo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[rgba(242,242,242,0.8)] font-bold mb-1">Nivel</label>
                    <select
                      value={newLevel}
                      onChange={(e) => setNewLevel(e.target.value as StudentProfile['level'])}
                      className="w-full bg-[#141417] border border-[rgba(242,242,242,0.1)] rounded-lg p-2 text-[#f2f2f2] focus:outline-none focus:border-[#ff6b00]"
                    >
                      <option value="Principiante">Principiante</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Avanzado">Avanzado</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 bg-[#141417] hover:bg-[#26262b] text-[rgba(242,242,242,0.7)] rounded-lg text-xs font-bold cursor-pointer border border-[rgba(242,242,242,0.1)]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#ff6b00] hover:bg-[#e65e00] text-[#ffffff] font-bold rounded-lg text-xs transition-all cursor-pointer"
                  >
                    Registrar Atleta
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* Confirmation Modal to Delete Student */}
      {studentToDelete && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#141417] border border-red-900/50 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 text-[#f2f2f2]">
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-400 shrink-0">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#f2f2f2] tracking-tight">
                  ¿ELIMINAR ALUMNO?
                </h3>
                <p className="text-xs text-[rgba(242,242,242,0.6)] mt-0.5">
                  Esta acción es permanente e irreversible.
                </p>
              </div>
            </div>

            {/* Student Preview Card */}
            <div className="p-3 bg-[#1c1c21] rounded-xl border border-[rgba(242,242,242,0.1)] flex items-center gap-3">
              <img
                src={studentToDelete.avatarUrl}
                alt={studentToDelete.fullName}
                className="w-10 h-10 rounded-full object-cover border border-red-500/40"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#f2f2f2] truncate">
                  {studentToDelete.fullName}
                </h4>
                <p className="text-[11px] text-[rgba(242,242,242,0.5)] truncate">
                  {studentToDelete.email} • {studentToDelete.goal}
                </p>
              </div>
            </div>

            {students.length <= 1 ? (
              <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-300 space-y-1">
                <p className="font-bold">⚠️ No es posible eliminar al único alumno</p>
                <p className="text-[11px] text-amber-200/80">
                  El sistema requiere tener al menos 1 alumno registrado. Añade un nuevo alumno antes de eliminar este perfil.
                </p>
              </div>
            ) : (
              <p className="text-xs text-[rgba(242,242,242,0.7)] leading-relaxed">
                Se eliminarán todas las planificaciones de entrenamiento, historial de cargas, mediciones corporales y logs de readiness asociados a <strong className="text-[#f2f2f2]">{studentToDelete.fullName}</strong>.
              </p>
            )}

            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 bg-[#1c1c21] hover:bg-[#26262b] text-[rgba(242,242,242,0.8)] text-xs font-bold rounded-xl border border-[rgba(242,242,242,0.1)] transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              {students.length > 1 && onDeleteStudent && (
                <button
                  type="button"
                  onClick={() => {
                    const idToDelete = studentToDelete.id;
                    setStudentToDelete(null);
                    onDeleteStudent(idToDelete);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-[#ffffff] text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Definitivamente</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

