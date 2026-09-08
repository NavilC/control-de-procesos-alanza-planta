import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Truck, Plus } from 'lucide-react';
import { Shipment } from '../../types';

export const NewShipmentModal: React.FC = () => {
  const { isNewShipmentModalOpen, setIsNewShipmentModalOpen, addShipment, projects, pieces } = useApp();

  const [project, setProject] = useState('Torre Mítica');
  const [carrier, setCarrier] = useState('Logística Rápida SA');
  const [manager, setManager] = useState('Carlos Gómez');
  const [driverName, setDriverName] = useState('Roberto Mendoza');
  const [truckPlates, setTruckPlates] = useState('HN-8842-TR');
  const [destination, setDestination] = useState('Sitio de Obra');
  const [selectedPieces, setSelectedPieces] = useState<string[]>(['C-104A', 'V-201B']);

  if (!isNewShipmentModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newShip: Shipment = {
      id: `ENV-${Math.floor(10000 + Math.random() * 90000).toString().substring(0, 5)}`,
      project,
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      piecesCount: selectedPieces.length || 15,
      totalWeightTons: Number((selectedPieces.length * 0.85 + 4.5).toFixed(1)),
      carrier,
      manager,
      driverName,
      truckPlates,
      destination,
      status: 'En preparación',
      pieces: selectedPieces
    };

    addShipment(newShip);
    setIsNewShipmentModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#c3c6d7] shadow-2xl overflow-hidden animate-in zoom-in-95 p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-[#e2e8f8] pb-3">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#004ac6]" />
            <h3 className="font-bold text-[17px] text-[#151c27]">Crear Manifiesto de Despacho / Envío</h3>
          </div>
          <button
            onClick={() => setIsNewShipmentModalOpen(false)}
            className="text-[#737686] hover:text-[#151c27]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-[13px]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#434655] mb-1">Proyecto Destino</label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none"
              >
                {projects.map(pr => (
                  <option key={pr.id} value={pr.name}>{pr.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#434655] mb-1">Empresa Transportista</label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none"
              >
                <option value="Logística Rápida SA">Logística Rápida SA</option>
                <option value="Transportes del Norte">Transportes del Norte</option>
                <option value="Cargas pesadas C.A.">Cargas pesadas C.A.</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#434655] mb-1">Nombre del Conductor</label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#434655] mb-1">Placas del Camión</label>
              <input
                type="text"
                value={truckPlates}
                onChange={(e) => setTruckPlates(e.target.value)}
                className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#434655] mb-1">Responsable de Carga (Alanza)</label>
            <input
              type="text"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#434655] mb-1">Piezas a Cargar (Aprobadas en QC)</label>
            <div className="p-3 bg-[#f0f3ff] rounded-lg border border-[#c3c6d7] flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {['2S-37A', '2S-38B', '1A-12C', 'C-104A', 'V-201B', 'P-045'].map(mark => {
                const isSelected = selectedPieces.includes(mark);
                return (
                  <button
                    key={mark}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedPieces(selectedPieces.filter(m => m !== mark));
                      } else {
                        setSelectedPieces([...selectedPieces, mark]);
                      }
                    }}
                    className={`px-2.5 py-1 rounded font-mono text-[11px] font-bold border transition-colors ${
                      isSelected
                        ? 'bg-[#004ac6] text-white border-[#004ac6]'
                        : 'bg-white text-[#151c27] border-[#c3c6d7] hover:bg-[#e2e8f8]'
                    }`}
                  >
                    {mark} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#e2e8f8]">
            <button
              type="button"
              onClick={() => setIsNewShipmentModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-[#151c27] rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#004ac6] hover:bg-[#2563eb] text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Generar Manifiesto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
