import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, FileText } from 'lucide-react';

export const QCInspectionModal: React.FC = () => {
  const { selectedInspectionForQC, setSelectedInspectionForQC, submitQCInspection, pieces } = useApp();

  const [status, setStatus] = useState<'Aprobada' | 'Rechazada' | 'Con Observaciones'>('Aprobada');
  const [inspectorName, setInspectorName] = useState('Ing. Ana Gómez');
  const [notes, setNotes] = useState('');
  const [dimensionCheck, setDimensionCheck] = useState(true);
  const [weldCheck, setWeldCheck] = useState(true);
  const [paintCheck, setPaintCheck] = useState(true);

  if (!selectedInspectionForQC) return null;

  const insp = selectedInspectionForQC;
  const relatedPiece = pieces.find(p => p.mark === insp.pieceMark);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQCInspection(insp.id, status, notes, inspectorName);
    setSelectedInspectionForQC(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#c3c6d7] shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-[#e2e8f8] bg-[#f9fafb] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#004ac6]" />
            <h3 className="font-bold text-[17px] text-[#151c27]">
              Hoja de Inspección QC: {insp.pieceMark}
            </h3>
          </div>
          <button
            onClick={() => setSelectedInspectionForQC(null)}
            className="text-[#737686] hover:text-[#151c27]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-[13px]">
          <div className="p-3 bg-[#f0f3ff] rounded-xl flex justify-between items-center">
            <div>
              <span className="text-[11px] text-[#555f6f] block uppercase font-bold">Elemento</span>
              <span className="font-mono font-bold text-[#151c27]">{insp.type} {insp.profile}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#555f6f] block uppercase font-bold">Proyecto</span>
              <span className="font-semibold text-[#151c27]">{insp.project}</span>
            </div>
          </div>

          {/* Contratistas Responsables (Auditoría de Calidad) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-[#e2e8f8] space-y-2">
            <span className="text-[10px] font-bold text-[#004ac6] uppercase tracking-wider block">
              Trazabilidad de Contratistas Ejecutores (QC Audit)
            </span>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div className="bg-white p-2 rounded-lg border border-[#e2e8f8]">
                <span className="text-[10px] uppercase font-bold text-[#737686] block">Soldadura</span>
                <span className="font-semibold text-[#151c27] block truncate">
                  {relatedPiece?.welderName || 'Sin soldador asignado'}
                </span>
                <span className="text-[10px] text-[#555f6f]">
                  Estado: <strong>{relatedPiece?.weldingStatus || 'Pendiente'}</strong>
                </span>
              </div>

              <div className="bg-white p-2 rounded-lg border border-[#e2e8f8]">
                <span className="text-[10px] uppercase font-bold text-[#737686] block">Pintura</span>
                <span className="font-semibold text-[#151c27] block truncate">
                  {relatedPiece?.painterName || 'Sin pintor asignado'}
                </span>
                <span className="text-[10px] text-[#555f6f]">
                  Estado: <strong>{relatedPiece?.paintingStatus || 'Pendiente'}</strong>
                </span>
              </div>
            </div>

            {relatedPiece?.assignmentHistory && relatedPiece.assignmentHistory.length > 0 && (
              <div className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                ⚠️ Esta viga cuenta con <strong>{relatedPiece.assignmentHistory.length}</strong> eventos de reasignación previa en su historial.
              </div>
            )}
          </div>

          {/* Quality Checklist */}
          <div>
            <label className="block font-bold text-[#434655] uppercase text-[11px] mb-2">
              Criterios de Aceptación Técnica:
            </label>
            <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-[#e2e8f8]">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dimensionCheck}
                  onChange={(e) => setDimensionCheck(e.target.checked)}
                  className="rounded text-[#004ac6] h-4 w-4"
                />
                <span>Tolerancias dimensionales AISC (longitud, alabeo, diagonales)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={weldCheck}
                  onChange={(e) => setWeldCheck(e.target.checked)}
                  className="rounded text-[#004ac6] h-4 w-4"
                />
                <span>Soldadura e inspección visual AWS D1.1 (sin poros ni socavaciones)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paintCheck}
                  onChange={(e) => setPaintCheck(e.target.checked)}
                  className="rounded text-[#004ac6] h-4 w-4"
                />
                <span>Espesor de película seca de pintura / imprimación anticorrosiva</span>
              </label>
            </div>
          </div>

          {/* Verdict Selection */}
          <div>
            <label className="block font-bold text-[#434655] uppercase text-[11px] mb-2">
              Dictamen Final del Inspector:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('Aprobada')}
                className={`py-2 px-3 rounded-lg border font-semibold text-[12px] flex items-center justify-center gap-1.5 transition-colors ${
                  status === 'Aprobada'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white border-[#c3c6d7] text-[#151c27] hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" /> Aprobada
              </button>

              <button
                type="button"
                onClick={() => setStatus('Con Observaciones')}
                className={`py-2 px-3 rounded-lg border font-semibold text-[12px] flex items-center justify-center gap-1.5 transition-colors ${
                  status === 'Con Observaciones'
                    ? 'bg-[#f59e0b] text-[#151c27] border-[#f59e0b] shadow-xs'
                    : 'bg-white border-[#c3c6d7] text-[#151c27] hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4" /> Obs. Menor
              </button>

              <button
                type="button"
                onClick={() => setStatus('Rechazada')}
                className={`py-2 px-3 rounded-lg border font-semibold text-[12px] flex items-center justify-center gap-1.5 transition-colors ${
                  status === 'Rechazada'
                    ? 'bg-[#ba1a1a] text-white border-[#ba1a1a] shadow-xs'
                    : 'bg-white border-[#c3c6d7] text-[#151c27] hover:bg-slate-50'
                }`}
              >
                <XCircle className="w-4 h-4" /> Rechazada
              </button>
            </div>
          </div>

          {/* Inspector & Notes */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block font-semibold text-[#434655] mb-1">Inspector Firmante</label>
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                className="w-full h-9 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#434655] mb-1">Observaciones / Registro de Medición</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Cumple con todas las especificaciones de plano. Listo para pintura y despacho."
                className="w-full p-2.5 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-[#e2e8f8]">
            <button
              type="button"
              onClick={() => setSelectedInspectionForQC(null)}
              className="px-4 py-2 bg-slate-100 rounded-lg font-medium text-[#151c27]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#004ac6] hover:bg-[#2563eb] text-white font-semibold rounded-lg shadow-sm"
            >
              Registrar Dictamen QC
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
