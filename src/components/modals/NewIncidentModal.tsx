import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, AlertTriangle, Plus } from 'lucide-react';
import { Incident } from '../../types';

export const NewIncidentModal: React.FC = () => {
  const { isNewIncidentModalOpen, setIsNewIncidentModalOpen, addIncident } = useApp();

  const [shortDescription, setShortDescription] = useState('');
  const [severity, setSeverity] = useState<'Crítica' | 'Alta' | 'Media' | 'Baja'>('Alta');
  const [category, setCategory] = useState<'Calidad' | 'Logística' | 'Diseño'>('Calidad');
  const [origin, setOrigin] = useState('Pieza: VIG-A4-001');
  const [responsible, setResponsible] = useState('Control Calidad');
  const [details, setDetails] = useState('');

  if (!isNewIncidentModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortDescription.trim()) return;

    const newInc: Incident = {
      id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      severity,
      shortDescription: shortDescription.trim(),
      origin: origin.trim(),
      responsible: responsible.trim(),
      status: 'Abierta',
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      category,
      details: details.trim()
    };

    addIncident(newInc);
    setIsNewIncidentModalOpen(false);
    setShortDescription('');
    setDetails('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#c3c6d7] shadow-2xl overflow-hidden animate-in zoom-in-95 p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-[#e2e8f8] pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#ba1a1a]" />
            <h3 className="font-bold text-[17px] text-[#151c27]">Reportar Nueva Incidencia</h3>
          </div>
          <button
            onClick={() => setIsNewIncidentModalOpen(false)}
            className="text-[#737686] hover:text-[#151c27]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-[13px]">
          <div>
            <label className="block font-semibold text-[#434655] mb-1">Descripción Breve *</label>
            <input
              required
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Ej: Desviación dimensional en barrenado de placa"
              className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#434655] mb-1">Nivel de Gravedad</label>
              <select
                value={severity}
                onChange={(e: any) => setSeverity(e.target.value)}
                className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none font-semibold"
              >
                <option value="Crítica">Crítica (Detiene montaje)</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#434655] mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none"
              >
                <option value="Calidad">Calidad & Fabricación</option>
                <option value="Logística">Logística & Transporte</option>
                <option value="Diseño">Diseño & Planos</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#434655] mb-1">Elemento / Origen</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Pieza: C-104A / Envío: ENV-00286"
                className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#434655] mb-1">Responsable Asignado</label>
              <input
                type="text"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#434655] mb-1">Detalles y Hallazgos</label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describa la causa raíz aparente y el impacto en obra..."
              className="w-full p-2.5 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#e2e8f8]">
            <button
              type="button"
              onClick={() => setIsNewIncidentModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-[#151c27] rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#ba1a1a] hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Incidencia</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
