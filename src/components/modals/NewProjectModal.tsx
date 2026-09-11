import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Building, Plus, HardHat, ChevronDown, AlertCircle } from 'lucide-react';
import { Project } from '../../types';

export const NewProjectModal: React.FC = () => {
  const { 
    isNewProjectModalOpen, 
    setIsNewProjectModalOpen, 
    addProject, 
    users, 
    updateUser, 
    playFeedbackSound 
  } = useApp();

  const [name, setName] = useState('');
  const [ov, setOv] = useState('OV-2026-');
  const [op, setOp] = useState('OP-2026-');
  const [location, setLocation] = useState('');
  const [selectedResidentId, setSelectedResidentId] = useState('');

  // Filtrar únicamente los usuarios registrados con rol de campo / residente
  const fieldResidents = users.filter(u => 
    u.role === 'Residente de campo' || 
    (u.role as string).toLowerCase().includes('campo') || 
    (u.role as string).toLowerCase().includes('residente')
  );

  const selectedResident = users.find(u => u.id === selectedResidentId);

  // Seleccionar automáticamente al primer residente activo disponible cuando se abre el modal
  useEffect(() => {
    if (isNewProjectModalOpen && (!selectedResidentId || !users.some(u => u.id === selectedResidentId))) {
      const defaultResident = fieldResidents.find(u => u.status === 'Activo') || fieldResidents[0];
      if (defaultResident) {
        setSelectedResidentId(defaultResident.id);
      }
    }
  }, [isNewProjectModalOpen, fieldResidents, selectedResidentId, users]);

  if (!isNewProjectModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const residentName = selectedResident ? selectedResident.name : 'Ing. Residente de Campo';
    const initials = selectedResident?.initials || 
      residentName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: name.trim(),
      ov: ov.trim(),
      op: op.trim(),
      siteManager: {
        name: residentName,
        role: 'Residente de campo',
        avatarUrl: selectedResident?.avatarUrl,
        initials
      },
      usersCount: 1,
      piecesCount: 0,
      status: 'Activo',
      createdAt: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      location: location.trim()
    };

    addProject(newProj);

    // Asignar el nuevo proyecto a la lista de proyectos del residente de campo en el sistema
    if (selectedResident) {
      const currentProjects = selectedResident.projects || [];
      if (!currentProjects.includes(name.trim())) {
        updateUser(selectedResident.id, {
          projects: [...currentProjects, name.trim()]
        });
      }
    }

    playFeedbackSound('success');
    setIsNewProjectModalOpen(false);
    setName('');
    setLocation('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#c3c6d7] shadow-2xl overflow-hidden animate-in zoom-in-95 p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-[#e2e8f8] pb-3">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[#004ac6]" />
            <h3 className="font-bold text-[17px] text-[#151c27]">Crear Nuevo Proyecto</h3>
          </div>
          <button
            onClick={() => setIsNewProjectModalOpen(false)}
            className="text-[#737686] hover:text-[#151c27] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-[13px]">
          <div>
            <label className="block font-semibold text-[#434655] mb-1">Nombre del Proyecto *</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Torre Corporativa Helix"
              className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] focus:bg-white transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#434655] mb-1">Orden de Venta (OV)</label>
              <input
                type="text"
                value={ov}
                onChange={(e) => setOv(e.target.value)}
                className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none font-mono focus:border-[#004ac6] focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#434655] mb-1">Orden de Producción (OP)</label>
              <input
                type="text"
                value={op}
                onChange={(e) => setOp(e.target.value)}
                className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none font-mono focus:border-[#004ac6] focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Select con usuarios registrados con rol de campo */}
          <div>
            <label className="block font-semibold text-[#434655] mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <HardHat className="w-3.5 h-3.5 text-[#004ac6]" />
                <span>Residente de Campo *</span>
              </span>
              <span className="text-[11px] font-normal text-[#737686]">
                {fieldResidents.length} en sistema
              </span>
            </label>
            
            <div className="relative">
              <select
                required
                id="select-resident-user"
                value={selectedResidentId}
                onChange={(e) => setSelectedResidentId(e.target.value)}
                className="w-full h-10 pl-3 pr-8 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] focus:bg-white text-[13px] text-[#151c27] cursor-pointer appearance-none transition-colors"
              >
                {fieldResidents.length === 0 ? (
                  <option value="" disabled>No hay residentes de campo registrados</option>
                ) : (
                  <>
                    <option value="">-- Seleccionar Residente de Campo --</option>
                    {fieldResidents.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email}) {user.status === 'Inactivo' ? '• Inactivo' : ''}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-[#737686] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Ficha compacta del residente seleccionado */}
            {selectedResident ? (
              <div className="mt-2 p-2 rounded-lg bg-blue-50/90 border border-blue-200/80 flex items-center gap-2 text-[12px]">
                <div className="w-6 h-6 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden shadow-xs">
                  {selectedResident.avatarUrl ? (
                    <img src={selectedResident.avatarUrl} alt={selectedResident.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{selectedResident.initials || 'RC'}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#151c27] leading-tight truncate">{selectedResident.name}</p>
                  <p className="text-[10.5px] text-[#555f6f] leading-tight truncate">{selectedResident.email}</p>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-[#002f80] font-medium shrink-0 border border-blue-200">
                  {selectedResident.role}
                </span>
              </div>
            ) : fieldResidents.length === 0 ? (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-700">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Registra usuarios con rol "Residente de campo" en Usuarios y Roles.</span>
              </div>
            ) : null}
          </div>

          <div>
            <label className="block font-semibold text-[#434655] mb-1">Ubicación / Ciudad</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="San Pedro Sula / Monterrey N.L."
              className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] focus:bg-white transition-colors"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#e2e8f8]">
            <button
              type="button"
              onClick={() => setIsNewProjectModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#151c27] rounded-lg font-medium cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedResidentId && fieldResidents.length > 0}
              className="px-5 py-2 bg-[#004ac6] hover:bg-[#2563eb] text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Guardar Proyecto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
