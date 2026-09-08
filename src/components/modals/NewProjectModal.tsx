import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Building, Plus } from 'lucide-react';
import { Project } from '../../types';

export const NewProjectModal: React.FC = () => {
  const { isNewProjectModalOpen, setIsNewProjectModalOpen, addProject } = useApp();

  const [name, setName] = useState('');
  const [ov, setOv] = useState('OV-2026-');
  const [op, setOp] = useState('OP-2026-');
  const [location, setLocation] = useState('');
  const [siteManagerName, setSiteManagerName] = useState('');
  const [piecesCount, setPiecesCount] = useState(150);

  if (!isNewProjectModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initials = siteManagerName
      ? siteManagerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : 'AL';

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: name.trim(),
      ov: ov.trim(),
      op: op.trim(),
      siteManager: {
        name: siteManagerName || 'Ing. Juan Pérez',
        initials
      },
      usersCount: 3,
      piecesCount: Number(piecesCount) || 100,
      status: 'Activo',
      createdAt: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      location: location.trim()
    };

    addProject(newProj);
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
            className="text-[#737686] hover:text-[#151c27]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-[13px]">
          <div>
            <label className="block font-semibold text-[#434655] mb-1">Nombre del Proyecto *</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Torre Corporativa Helix"
              className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#434655] mb-1">Orden de Venta (OV)</label>
              <input
                type="text"
                value={ov}
                onChange={(e) => setOv(e.target.value)}
                className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#434655] mb-1">Orden de Producción (OP)</label>
              <input
                type="text"
                value={op}
                onChange={(e) => setOp(e.target.value)}
                className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#434655] mb-1">Residente de Campo</label>
              <input
                type="text"
                value={siteManagerName}
                onChange={(e) => setSiteManagerName(e.target.value)}
                placeholder="Ing. Carlos Ruiz"
                className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#434655] mb-1">Total Piezas Est.</label>
              <input
                type="number"
                value={piecesCount}
                onChange={(e) => setPiecesCount(Number(e.target.value))}
                className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#434655] mb-1">Ubicación / Ciudad</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="San Pedro Sula / Monterrey N.L."
              className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#e2e8f8]">
            <button
              type="button"
              onClick={() => setIsNewProjectModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-[#151c27] rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#004ac6] hover:bg-[#2563eb] text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
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
