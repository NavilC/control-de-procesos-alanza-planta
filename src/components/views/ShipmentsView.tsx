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
  FileText,
  Building2,
  ShieldCheck,
  Mail,
  Send
} from 'lucide-react';
import { playFeedbackSound } from '../../utils/audioFeedback';
import { ShipmentEmailModal } from '../modals/ShipmentEmailModal';

export const ShipmentsView: React.FC = () => {
  const { 
    shipments, 
    setIsNewShipmentModalOpen, 
    setSelectedShipmentForPrint,
    selectedShipmentForEmail,
    setSelectedShipmentForEmail,
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
            Control logístico, remisiones de carga y operaciones del Departamento de Despacho.
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
                Unidad_Despacho: s.carrier,
                Chofer: s.driverName || 'Roberto Mendoza',
                Responsable_Despacho: s.manager,
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
            className="bg-[#004ac6] text-white hover:bg-[#2563eb] text-[13px] font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Envío</span>
          </button>
        </div>
      </div>

      {/* Corporate Dispatch Department Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#004ac6] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13.5px] font-bold text-[#151c27]">
                Departamento de Despacho y Logística ALANZA
              </span>
              <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-100 text-[#004ac6] border border-blue-200">
                Logística de Entrega
              </span>
            </div>
            <p className="text-[11.5px] text-[#555f6f] mt-0.5">
              Control y emisión de manifiestos de despacho y remisiones para proyectos en ejecución.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-lg text-[12px] font-semibold bg-white text-[#151c27] border border-blue-200/90 shadow-2xs flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#004ac6]" />
            <span>4 Unidades de Flota</span>
          </span>
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
            <option value="Nave Industrial SUR">Nave Industrial SUR</option>
            <option value="Puente San Juan">Puente San Juan</option>
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
            Unidad de Despacho
          </label>
          <select
            value={carrierFilter}
            onChange={(e) => setCarrierFilter(e.target.value)}
            className="bg-[#f0f3ff] border border-transparent focus:border-[#004ac6] focus:bg-white rounded-lg text-[13px] text-[#151c27] h-10 px-3 outline-none cursor-pointer"
          >
            <option value="">Todas las unidades</option>
            {Array.from(new Set(shipments.map(s => s.carrier))).map(carrierName => (
              <option key={carrierName} value={carrierName}>{carrierName}</option>
            ))}
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
            className="w-full bg-white border border-[#c3c6d7] hover:border-[#004ac6] hover:bg-[#f0f3ff] text-[#151c27] text-[13px] font-semibold h-10 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
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
                <th className="py-3 px-4">Unidad de Despacho</th>
                <th className="py-3 px-4">Coordinador Despacho</th>
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
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#151c27] text-[12.5px] leading-tight">{ship.carrier}</span>
                        <span className="text-[11px] text-[#555f6f] mt-0.5">
                          {ship.driverName || 'Roberto Mendoza'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#151c27] font-medium">
                      {ship.manager}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 items-start">
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

                        {/* Email notification status badge */}
                        {ship.emailNotification ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playFeedbackSound('click');
                              setSelectedShipmentForEmail(ship);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 cursor-pointer transition-colors shadow-2xs"
                            title={`Correo enviado: ${ship.emailNotification.recipients.length} personas involucradas notificados`}
                          >
                            <Mail className="w-2.5 h-2.5 text-[#004ac6]" />
                            <span>{ship.emailNotification.recipients.length} notificados</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playFeedbackSound('click');
                              setSelectedShipmentForEmail(ship);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                            title="Enviar aviso por correo"
                          >
                            <Mail className="w-2.5 h-2.5" />
                            <span>Enviar aviso</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playFeedbackSound('click');
                            setSelectedShipmentForEmail(ship);
                          }}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#004ac6] font-semibold rounded-md text-[12px] flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                          title="Ver / Reenviar notificación por correo"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span className="hidden xl:inline">Correo</span>
                        </button>
                        <button
                          onClick={(e) => handlePrintManifest(ship, e)}
                          className="px-2.5 py-1 bg-white border border-[#c3c6d7] hover:border-[#004ac6] hover:bg-[#f0f3ff] text-[#004ac6] font-semibold rounded-md text-[12px] flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
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
                <span className="text-[#555f6f] text-[11px] block font-bold uppercase">Unidad de Despacho</span>
                <span className="font-semibold text-[#151c27]">{selectedShipmentDetail.carrier}</span>
              </div>
              <div className="p-3 bg-[#f0f3ff] rounded-lg">
                <span className="text-[#555f6f] text-[11px] block font-bold uppercase">Conductor Asignado</span>
                <span className="font-semibold text-[#151c27]">
                  {selectedShipmentDetail.driverName || 'Roberto Mendoza'}
                </span>
              </div>
              <div className="p-3 bg-[#f0f3ff] rounded-lg">
                <span className="text-[#555f6f] text-[11px] block font-bold uppercase">Piezas Despachadas</span>
                <span className="font-semibold text-[#151c27]">{selectedShipmentDetail.piecesCount} unidades ({selectedShipmentDetail.totalWeightTons} Ton)</span>
              </div>
              <div className="p-3 bg-[#f0f3ff] rounded-lg">
                <span className="text-[#555f6f] text-[11px] block font-bold uppercase">Coordinador de Despacho</span>
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

            {/* Email Notification Information */}
            <div className="p-3 bg-gradient-to-r from-blue-50/90 to-indigo-50/70 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#004ac6]" />
                  <span className="font-bold text-[12.5px] text-[#151c27]">
                    Notificación por Correo a Involucrados
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-100 text-[#004ac6] border border-blue-200">
                  {selectedShipmentDetail.emailNotification?.status || 'Disponible'}
                </span>
              </div>
              <p className="text-[11.5px] text-[#555f6f]">
                {selectedShipmentDetail.emailNotification 
                  ? `Enviado el ${selectedShipmentDetail.emailNotification.sentAt} a ${selectedShipmentDetail.emailNotification.recipients.length} personas (Residente, Despacho, QC y Chofer).`
                  : 'Este despacho tiene disponible la plantilla de notificación para todas las personas involucradas.'}
              </p>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedShipmentDetail;
                    setSelectedShipmentDetail(null);
                    setSelectedShipmentForEmail(target);
                  }}
                  className="px-3 py-1 bg-white border border-[#004ac6] hover:bg-blue-50 text-[#004ac6] font-bold text-[11.5px] rounded-lg flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Ver Correo / Reenviar</span>
                </button>
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
      {/* Email Notification Modal */}
      {selectedShipmentForEmail && (
        <ShipmentEmailModal
          shipment={selectedShipmentForEmail}
          onClose={() => setSelectedShipmentForEmail(null)}
        />
      )}
    </div>
  );
};
