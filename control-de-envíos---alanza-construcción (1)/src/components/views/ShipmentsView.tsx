import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Shipment } from '../../types';
import { 
  Plus, 
  Truck, 
  Calendar, 
  MapPin, 
  User, 
  Layers, 
  Scale, 
  MoreVertical,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Printer,
  FileText
} from 'lucide-react';
import { playFeedbackSound } from '../../utils/audioFeedback';

export const ShipmentsView: React.FC = () => {
  const { 
    shipments, 
    setIsNewShipmentModalOpen, 
    setSelectedShipmentForPrint,
    selectedProjectFilter,
    setActiveTab, 
    globalSearch,
    exportToCSV 
  } = useApp();

  const [projectFilter, setProjectFilter] = useState(selectedProjectFilter || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('');
  const [selectedShipmentDetail, setSelectedShipmentDetail] = useState<Shipment | null>(null);

  // Sync with global project filter
  useEffect(() => {
    if (selectedProjectFilter) {
      setProjectFilter(selectedProjectFilter);
    }
  }, [selectedProjectFilter]);

  const filteredShipments = shipments.filter(ship => {
    const term = globalSearch.toLowerCase();
    const matchesSearch = 
      ship.id.toLowerCase().includes(term) ||
      ship.project.toLowerCase().includes(term) ||
      ship.carrier.toLowerCase().includes(term) ||
      ship.manager.toLowerCase().includes(term);
    const matchesProj = !projectFilter || ship.project === projectFilter;
    const matchesStatus = !statusFilter || ship.status === statusFilter;
    const matchesCarrier = !carrierFilter || ship.carrier === carrierFilter;
    return matchesSearch && matchesProj && matchesStatus && matchesCarrier;
  });

  const handlePrintManifest = (ship: Shipment, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playFeedbackSound('click');
    setSelectedShipmentForPrint(ship);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[26px] md:text-[30px] font-bold text-[#151c27] tracking-tight font-['Inter']">
              Gestión de Envíos
            </h1>
            {projectFilter && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#dbe1ff] text-[#002b75] border border-[#adc6ff]">
                {projectFilter}
              </span>
            )}
          </div>
          <p className="text-[14px] text-[#434655] mt-0.5">
            Control logístico, remisiones de carga y despacho de piezas a obra.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playFeedbackSound('click');
              exportToCSV('Manifiestos_Envios_Alanza', filteredShipments.map(s => ({
                ID_Envio: s.id,
                Proyecto: s.project,
                Fecha: s.date,
                Piezas: s.piecesCount,
                Peso_Toneladas: s.totalWeightTons,
                Transportista: s.carrier,
                Responsable: s.manager,
                Estado: s.status,
                Destino: s.destination
              })));
            }}
            className="bg-white border border-[#c3c6d7] text-[#151c27] hover:bg-[#f0f3ff] text-[13px] font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-[#004ac6]" />
            <span className="hidden sm:inline">Exportar Manifiestos</span>
          </button>

          <button
            id="new-shipment-btn"
            onClick={() => {
              playFeedbackSound('click');
              setIsNewShipmentModalOpen(true);
            }}
            className="bg-[#004ac6] text-white hover:bg-[#2563eb] text-[13px] font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Envío</span>
          </button>
        </div>
      </div>

      {/* Filters Grid */}
      <div className="bg-white rounded-xl border border-[#c3c6d7] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shadow-xs">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
            Proyecto
          </label>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-[#f0f3ff] border border-transparent focus:border-[#004ac6] focus:bg-white rounded-lg text-[13px] text-[#151c27] h-10 px-3 outline-none cursor-pointer"
          >
            <option value="">Todos los proyectos</option>
            <option value="Torre Mítica">Torre Mítica</option>
            <option value="Mhotivo">Mhotivo</option>
            <option value="Torre A">Torre A</option>
            <option value="Nave Industrial Alfa">Nave Industrial Alfa</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
            Estado
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#f0f3ff] border border-transparent focus:border-[#004ac6] focus:bg-white rounded-lg text-[13px] text-[#151c27] h-10 px-3 outline-none cursor-pointer"
          >
            <option value="">Todos los estados</option>
            <option value="En preparación">En preparación</option>
            <option value="En tránsito">En tránsito</option>
            <option value="Recibido">Recibido</option>
            <option value="Con incidencia">Con incidencia</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
            Transportista
          </label>
          <select
            value={carrierFilter}
            onChange={(e) => setCarrierFilter(e.target.value)}
            className="bg-[#f0f3ff] border border-transparent focus:border-[#004ac6] focus:bg-white rounded-lg text-[13px] text-[#151c27] h-10 px-3 outline-none cursor-pointer"
          >
            <option value="">Todos los transportistas</option>
            <option value="Transportes Rápidos S.A.">Transportes Rápidos S.A.</option>
            <option value="Carga Pesada del Norte">Carga Pesada del Norte</option>
            <option value="Logística Industrial">Logística Industrial</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              playFeedbackSound('click');
              setProjectFilter('');
              setStatusFilter('');
              setCarrierFilter('');
            }}
            className="w-full bg-white border border-[#c3c6d7] hover:border-[#004ac6] hover:bg-[#f0f3ff] text-[#151c27] text-[13px] font-semibold h-10 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Filter className="w-4 h-4 text-[#004ac6]" />
            <span>Limpiar Filtros</span>
          </button>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white border border-[#c3c6d7] rounded-xl overflow-hidden shadow-xs flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-[#f9fafb] border-b border-[#c3c6d7] text-[11px] font-bold text-[#434655] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">ID Envío</th>
                <th className="py-3 px-4">Proyecto</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Piezas</th>
                <th className="py-3 px-4">Peso</th>
                <th className="py-3 px-4">Transportista</th>
                <th className="py-3 px-4">Responsable</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f8] text-[13px]">
              {filteredShipments.map((ship) => {
                return (
                  <tr
                    key={ship.id}
                    onClick={() => setSelectedShipmentDetail(ship)}
                    className="hover:bg-[#f3f4f6] cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#004ac6]">
                      {ship.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#151c27]">
                      {ship.project}
                    </td>
                    <td className="py-3 px-4 text-[#555f6f]">
                      {ship.date}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#151c27]">
                      {ship.piecesCount} pzs
                    </td>
                    <td className="py-3 px-4 font-mono text-[#555f6f]">
                      {ship.totalWeightTons} Ton
                    </td>
                    <td className="py-3 px-4 text-[#434655]">
                      {ship.carrier}
                    </td>
                    <td className="py-3 px-4 text-[#151c27]">
                      {ship.manager}
                    </td>
                    <td className="py-3 px-4">
                      {ship.status === 'En preparación' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#d6e0f3] text-[#596373]">
                          En preparación
                        </span>
                      )}
                      {ship.status === 'En tránsito' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ffdbcd] text-[#7d2d00]">
                          En tránsito
                        </span>
                      )}
                      {ship.status === 'Recibido' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#d1fae5] text-[#065f46]">
                          Recibido
                        </span>
                      )}
                      {ship.status === 'Con incidencia' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ffdad6] text-[#93000a]">
                          Con incidencia
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => handlePrintManifest(ship, e)}
                          className="px-2.5 py-1 bg-white border border-[#c3c6d7] hover:border-[#004ac6] hover:bg-[#f0f3ff] text-[#004ac6] font-semibold rounded-md text-[12px] flex items-center gap-1 transition-colors shadow-2xs"
                          title="Imprimir Manifiesto / Hoja de Ruta"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Manifiesto</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedShipmentDetail(ship);
                          }}
                          className="px-2.5 py-1 bg-[#f0f3ff] hover:bg-[#dbe1ff] border border-[#adc6ff] text-[#002b75] font-semibold rounded-md text-[12px] flex items-center gap-1 transition-colors shadow-2xs"
                          title="Ver detalle completo"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#004ac6]" />
                          <span>Detalle</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white border-t border-[#c3c6d7] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px]">
          <span className="text-[#555f6f]">
            Mostrando <strong className="text-[#151c27]">{filteredShipments.length}</strong> envíos registrados
          </span>
          <div className="flex items-center gap-1.5">
            <button disabled className="px-3 py-1.5 border border-[#c3c6d7] rounded-lg text-[#737686] opacity-50 cursor-not-allowed text-[12px] font-semibold">
              Anterior
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#004ac6] text-white font-bold text-[12px] shadow-xs">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#c3c6d7] bg-white hover:bg-[#f0f3ff] text-[#151c27] font-semibold text-[12px] transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 border border-[#c3c6d7] bg-white hover:bg-[#f0f3ff] text-[#151c27] font-semibold rounded-lg text-[12px] transition-colors">
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Shipment Quick Detail Modal */}
      {selectedShipmentDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#c3c6d7] shadow-2xl p-6 animate-in zoom-in-95 space-y-4">
            <div className="flex justify-between items-start border-b border-[#e2e8f8] pb-3">
              <div>
                <span className="text-[11px] font-bold text-[#004ac6] font-mono">
                  {selectedShipmentDetail.id}
                </span>
                <h3 className="text-[18px] font-bold text-[#151c27]">
                  {selectedShipmentDetail.project}
                </h3>
              </div>
              <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase ${
                selectedShipmentDetail.status === 'Recibido' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {selectedShipmentDetail.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div className="p-3 bg-[#f0f3ff] rounded-lg">
                <span className="text-[#555f6f] text-[11px] block">Transportista</span>
                <span className="font-semibold text-[#151c27]">{selectedShipmentDetail.carrier}</span>
              </div>
              <div className="p-3 bg-[#f0f3ff] rounded-lg">
                <span className="text-[#555f6f] text-[11px] block">Conductor / Placas</span>
                <span className="font-semibold text-[#151c27]">
                  {selectedShipmentDetail.driverName || 'Roberto Mendoza'} ({selectedShipmentDetail.truckPlates || 'HN-8842-TR'})
                </span>
              </div>
              <div className="p-3 bg-[#f0f3ff] rounded-lg">
                <span className="text-[#555f6f] text-[11px] block">Piezas Despachadas</span>
                <span className="font-semibold text-[#151c27]">{selectedShipmentDetail.piecesCount} unidades ({selectedShipmentDetail.totalWeightTons} Ton)</span>
              </div>
              <div className="p-3 bg-[#f0f3ff] rounded-lg">
                <span className="text-[#555f6f] text-[11px] block">Responsable Alanza</span>
                <span className="font-semibold text-[#151c27]">{selectedShipmentDetail.manager}</span>
              </div>
            </div>

            <div className="p-3 bg-white border border-[#e2e8f8] rounded-lg">
              <span className="text-[11px] font-bold text-[#434655] uppercase block mb-1.5">
                Piezas Incluidas en Manifiesto:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedShipmentDetail.pieces.map((pc) => (
                  <span key={pc} className="px-2 py-0.5 bg-[#dbe1ff] text-[#00174b] rounded font-mono text-[12px] font-semibold">
                    {pc}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handlePrintManifest(selectedShipmentDetail);
                    setSelectedShipmentDetail(null);
                  }}
                  className="px-3.5 py-2 bg-white border border-[#c3c6d7] text-[#151c27] hover:bg-[#f0f3ff] rounded-lg font-semibold text-[13px] flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-[#004ac6]" />
                  <span>Imprimir Manifiesto</span>
                </button>

                {selectedShipmentDetail.status === 'En tránsito' && (
                  <button
                    onClick={() => {
                      setSelectedShipmentDetail(null);
                      setActiveTab('recepcion');
                    }}
                    className="px-4 py-2 bg-[#004ac6] text-white rounded-lg font-semibold text-[13px] hover:bg-[#2563eb]"
                  >
                    Recepción en Campo →
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedShipmentDetail(null)}
                className="px-4 py-2 bg-[#f0f3ff] text-[#151c27] rounded-lg font-semibold text-[13px] hover:bg-[#e2e8f8]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
