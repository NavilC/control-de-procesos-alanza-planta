import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  GitCommit, 
  Calendar, 
  CheckCircle2, 
  Truck, 
  Building, 
  ShieldCheck, 
  FileText,
  AlertTriangle,
  MapPin,
  Clock
} from 'lucide-react';

export const TraceabilityModal: React.FC = () => {
  const { selectedPieceForTraceability, setSelectedPieceForTraceability } = useApp();

  if (!selectedPieceForTraceability) return null;

  const p = selectedPieceForTraceability;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#c3c6d7] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#e2e8f8] bg-[#f9fafb] flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold text-[18px] text-[#004ac6]">
                {p.mark}
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                p.status === 'Recibida' ? 'bg-emerald-100 text-emerald-800' :
                p.status === 'Enviada' ? 'bg-orange-100 text-orange-800' :
                p.status === 'Incidencia' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {p.status}
              </span>
            </div>
            <p className="text-[13px] text-[#555f6f]">
              {p.type} {p.profile} • Proyecto: <strong className="text-[#151c27]">{p.project}</strong>
            </p>
          </div>

          <button
            onClick={() => setSelectedPieceForTraceability(null)}
            className="text-[#737686] hover:text-[#151c27] p-1 rounded-lg hover:bg-[#e2e8f8]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Technical Specs & Step-by-Step Timeline */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Specs Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
            <div className="p-3 bg-[#f0f3ff] rounded-lg">
              <span className="text-[#555f6f] block">Longitud / Peso</span>
              <span className="font-bold text-[#151c27] font-mono text-[13px]">
                {p.lengthMeters}m • {p.weightKg}kg
              </span>
            </div>
            <div className="p-3 bg-[#f0f3ff] rounded-lg">
              <span className="text-[#555f6f] block">Colada de Acero (Heat)</span>
              <span className="font-bold text-[#151c27] font-mono text-[13px]">
                {p.heatNumber || 'H-8821-ASTM'}
              </span>
            </div>
            <div className="p-3 bg-[#f0f3ff] rounded-lg">
              <span className="text-[#555f6f] block">Inspección QC</span>
              <span className="font-bold text-emerald-700 font-mono text-[13px]">
                {p.qcStatus}
              </span>
            </div>
            <div className="p-3 bg-[#f0f3ff] rounded-lg">
              <span className="text-[#555f6f] block">Referencia Enlace</span>
              <span className="font-bold text-[#004ac6] font-mono text-[13px]">
                {p.refId}
              </span>
            </div>
          </div>

          {/* Contratistas y Trazabilidad Operativa */}
          <div className="p-4 bg-slate-50 border border-[#c3c6d7] rounded-xl space-y-3">
            <span className="text-[11px] font-bold text-[#004ac6] uppercase tracking-wider block">
              Contratistas Responsables de Fabricación
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
              <div className="bg-white p-2.5 rounded-lg border border-[#e2e8f8]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase text-[#737686]">Soldador</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    {p.weldingStatus || 'Asignado'}
                  </span>
                </div>
                <p className="font-bold text-[#151c27]">{p.welderName || 'Sin soldador registrado'}</p>
                <span className="text-[11px] text-[#737686] font-mono block mt-0.5">
                  Fecha: {p.weldingAssignedDate || '-'}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-[#e2e8f8]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase text-[#737686]">Pintor</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                    {p.paintingStatus || 'Asignado'}
                  </span>
                </div>
                <p className="font-bold text-[#151c27]">{p.painterName || 'Sin pintor registrado'}</p>
                <span className="text-[11px] text-[#737686] font-mono block mt-0.5">
                  Fecha: {p.paintingAssignedDate || '-'}
                </span>
              </div>
            </div>

            {/* Reassignment audit trail */}
            {p.assignmentHistory && p.assignmentHistory.length > 0 && (
              <div className="pt-2 border-t border-[#e2e8f8]">
                <span className="text-[10px] font-bold text-[#737686] uppercase block mb-1">
                  Historial de Auditoría de Reasignaciones ({p.assignmentHistory.length}):
                </span>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {p.assignmentHistory.map(h => (
                    <div key={h.id} className="text-[11px] text-[#434655] bg-white p-1.5 rounded border border-[#e2e8f8]">
                      <strong>{h.process}:</strong> {h.contractorName} {h.previousContractorName && `(reemplazó a ${h.previousContractorName})`}
                      {h.reason && <span className="block text-[#737686] italic">Motivo: "{h.reason}" • {h.timestamp}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Vertical Timeline */}
          <div>
            <h4 className="font-bold text-[14px] text-[#151c27] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#004ac6]" />
              Línea de Vida & Trazabilidad
            </h4>

            <div className="relative pl-6 border-l-2 border-[#004ac6]/30 space-y-6">
              {p.traceabilityTimeline && p.traceabilityTimeline.length > 0 ? (
                p.traceabilityTimeline.map((step, idx) => (
                  <div key={idx} className="relative group">
                    {/* Circle marker */}
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#004ac6] border-2 border-white shadow-xs" />
                    
                    <div className="bg-[#f9fafb] p-3.5 rounded-xl border border-[#e2e8f8]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[13px] text-[#151c27]">{step.stage}</span>
                        <span className="text-[11px] font-mono text-[#737686]">{step.date}</span>
                      </div>
                      <p className="text-[12px] text-[#555f6f] mb-1.5">{step.details}</p>
                      <div className="flex items-center gap-3 text-[11px] text-[#434655]">
                        <span>👤 <strong>{step.responsible}</strong></span>
                        <span>📍 {step.location}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-4 text-[13px]">
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#004ac6] border-2 border-white" />
                    <div className="bg-[#f9fafb] p-3 rounded-lg border border-[#e2e8f8]">
                      <div className="flex justify-between font-bold text-[#151c27]">
                        <span>Corte & Habilitado de Acero</span>
                        <span className="font-mono text-[11px] text-[#737686]">10 Oct 2023 08:30</span>
                      </div>
                      <p className="text-[#555f6f] text-[12px] mt-0.5">Perfil cortado con sierra de cinta CNC y perforado conforme a plano D-104.</p>
                      <span className="text-[11px] text-[#004ac6] font-semibold block mt-1">Operador: Taller Planta 1</span>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#004ac6] border-2 border-white" />
                    <div className="bg-[#f9fafb] p-3 rounded-lg border border-[#e2e8f8]">
                      <div className="flex justify-between font-bold text-[#151c27]">
                        <span>Inspección de Calidad QC</span>
                        <span className="font-mono text-[11px] text-[#737686]">11 Oct 2023 14:15</span>
                      </div>
                      <p className="text-[#555f6f] text-[12px] mt-0.5">Inspección visual dimensional y prueba de tintas penetrantes en soldadura aprobada.</p>
                      <span className="text-[11px] text-emerald-700 font-semibold block mt-1">Inspector: Ing. Ana Gómez</span>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-white" />
                    <div className="bg-[#f9fafb] p-3 rounded-lg border border-[#e2e8f8]">
                      <div className="flex justify-between font-bold text-[#151c27]">
                        <span>Despacho Logístico</span>
                        <span className="font-mono text-[11px] text-[#737686]">12 Oct 2023 10:00</span>
                      </div>
                      <p className="text-[#555f6f] text-[12px] mt-0.5">Cargado en camión plataforma con manifiesto {p.refId}.</p>
                      <span className="text-[11px] text-amber-700 font-semibold block mt-1">Transporte: Trans. Rápidos</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#e2e8f8] bg-[#f9fafb] flex justify-end">
          <button
            onClick={() => setSelectedPieceForTraceability(null)}
            className="px-5 py-2 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-lg text-[13px] font-semibold transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
