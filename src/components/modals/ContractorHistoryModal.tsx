import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  HardHat, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layers, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Calendar,
  ExternalLink,
  Search
} from 'lucide-react';
import { playFeedbackSound } from '../../utils/audioFeedback';

export const ContractorHistoryModal: React.FC = () => {
  const { 
    selectedContractorForHistory, 
    setSelectedContractorForHistory,
    pieces,
    setSelectedPieceForDetail,
    setSelectedPieceForTraceability
  } = useApp();

  if (!selectedContractorForHistory) return null;

  const contractor = selectedContractorForHistory;

  // Find all pieces where this contractor is assigned (either as welder or painter)
  const assignedPieces = pieces.filter(
    p => p.welderId === contractor.id || p.painterId === contractor.id
  );

  const completedCount = assignedPieces.filter(p => {
    if (contractor.type === 'Soldador') return p.weldingStatus === 'Completado';
    return p.paintingStatus === 'Completado';
  }).length;

  const inProgressCount = assignedPieces.filter(p => {
    if (contractor.type === 'Soldador') return p.weldingStatus === 'En proceso' || p.weldingStatus === 'Asignado';
    return p.paintingStatus === 'En proceso' || p.paintingStatus === 'Asignado';
  }).length;

  const qcAprovedCount = assignedPieces.filter(p => p.qcStatus === 'Aprobada').length;

  const handleClose = () => {
    playFeedbackSound('click');
    setSelectedContractorForHistory(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-[#c3c6d7] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#e2e8f8] bg-[#f9fafb] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${
              contractor.type === 'Soldador' ? 'bg-[#2563eb]' : 'bg-[#7c3aed]'
            }`}>
              <span className="material-symbols-outlined text-[22px]">
                {contractor.type === 'Soldador' ? 'build' : 'format_paint'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[17px] text-[#151c27]">
                  {contractor.name}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  contractor.type === 'Soldador' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {contractor.type}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  contractor.status === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {contractor.status}
                </span>
              </div>
              <p className="text-[12px] text-[#555f6f]">
                ID: {contractor.id} {contractor.identification ? `• DNI: ${contractor.identification}` : ''} • Registrado el {contractor.createdAt}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-[#737686] hover:text-[#151c27] p-1.5 rounded-lg hover:bg-[#e2e8f8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contact info bar */}
        <div className="px-6 py-2.5 bg-[#f0f3ff] border-b border-[#dbe1ff] flex flex-wrap items-center justify-between gap-4 text-[12px] text-[#434655]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#004ac6]" />
              <strong>{contractor.phone}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#004ac6]" />
              <strong>{contractor.email}</strong>
            </span>
          </div>

          {contractor.notes && (
            <span className="text-[11px] text-[#555f6f] italic truncate max-w-md">
              Nota: {contractor.notes}
            </span>
          )}
        </div>

        {/* Summary Metrics */}
        <div className="p-6 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#f9fafb] p-3.5 rounded-xl border border-[#e2e8f8]">
            <span className="text-[11px] font-bold text-[#555f6f] uppercase tracking-wider block">
              Total Vigas Asignadas
            </span>
            <span className="text-[24px] font-bold text-[#151c27]">
              {assignedPieces.length}
            </span>
          </div>

          <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-200">
            <span className="text-[11px] font-bold text-[#004ac6] uppercase tracking-wider block">
              En Proceso / Asignadas
            </span>
            <span className="text-[24px] font-bold text-[#004ac6]">
              {inProgressCount}
            </span>
          </div>

          <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Completadas
            </span>
            <span className="text-[24px] font-bold text-emerald-800">
              {completedCount}
            </span>
          </div>

          <div className="bg-purple-50/50 p-3.5 rounded-xl border border-purple-200">
            <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">
              Aprobadas en QC
            </span>
            <span className="text-[24px] font-bold text-purple-800">
              {qcAprovedCount}
            </span>
          </div>
        </div>

        {/* Pieces Table */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <h4 className="font-bold text-[13px] text-[#151c27] mb-2 uppercase tracking-wider flex items-center justify-between">
            <span>Listado de Vigas y Trazabilidad QC ({assignedPieces.length})</span>
            <span className="text-[11px] text-[#737686] font-normal lowercase">
              relación directa contratista - pieza - inspección
            </span>
          </h4>

          {assignedPieces.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-[#e2e8f8]">
              <Layers className="w-8 h-8 text-[#737686] mx-auto mb-2 opacity-50" />
              <p className="text-[13px] text-[#737686]">
                Este contratista aún no cuenta con vigas asignadas.
              </p>
            </div>
          ) : (
            <div className="border border-[#c3c6d7] rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse whitespace-nowrap text-[12px]">
                <thead>
                  <tr className="bg-[#f9fafb] border-b border-[#c3c6d7] text-[#434655] font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Marca Viga</th>
                    <th className="py-2.5 px-3">Proyecto</th>
                    <th className="py-2.5 px-3">Perfil / Peso</th>
                    <th className="py-2.5 px-3">Proceso</th>
                    <th className="py-2.5 px-3">Estado Asignación</th>
                    <th className="py-2.5 px-3">Fecha Asig.</th>
                    <th className="py-2.5 px-3">Estado QC</th>
                    <th className="py-2.5 px-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f8]">
                  {assignedPieces.map(piece => {
                    const isWelder = piece.welderId === contractor.id;
                    const status = isWelder ? piece.weldingStatus : piece.paintingStatus;
                    const date = isWelder ? piece.weldingAssignedDate : piece.paintingAssignedDate;

                    return (
                      <tr key={piece.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 font-mono font-bold text-[#151c27]">
                          {piece.mark}
                        </td>
                        <td className="py-2 px-3 text-[#151c27]">
                          {piece.project}
                        </td>
                        <td className="py-2 px-3 font-mono text-[#555f6f]">
                          {piece.profile} ({piece.weight} kg)
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isWelder ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {isWelder ? 'Soldadura' : 'Pintura'}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            status === 'Completado' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : status === 'En proceso' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-slate-100 text-slate-800'
                          }`}>
                            {status || 'Asignado'}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-[#737686]">
                          {date || '-'}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            piece.qcStatus === 'Aprobada'
                              ? 'bg-emerald-100 text-emerald-800'
                              : piece.qcStatus === 'Rechazada'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                          }`}>
                            {piece.qcStatus}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedPieceForTraceability(piece);
                              setSelectedContractorForHistory(null);
                            }}
                            className="px-2 py-1 text-[11px] font-semibold text-[#004ac6] hover:bg-blue-50 rounded transition-colors"
                          >
                            Trazabilidad
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-[#e2e8f8] bg-[#f9fafb] flex justify-end">
          <button
            onClick={handleClose}
            className="px-5 py-2 bg-white border border-[#c3c6d7] text-[#434655] hover:bg-slate-100 font-semibold text-[13px] rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
