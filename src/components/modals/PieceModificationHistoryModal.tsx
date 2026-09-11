import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  History, 
  Download, 
  Search, 
  Filter, 
  Edit3, 
  Clock, 
  FileText, 
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { playFeedbackSound } from '../../utils/audioFeedback';

export const PieceModificationHistoryModal: React.FC = () => {
  const { 
    selectedPieceForHistoryModal, 
    setSelectedPieceForHistoryModal,
    setSelectedPieceForEdit,
    exportToCSV 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [fieldFilter, setFieldFilter] = useState('');

  if (!selectedPieceForHistoryModal) return null;

  const p = selectedPieceForHistoryModal;
  const history = p.modificationHistory || [];

  const filteredHistory = history.filter(item => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      item.user.toLowerCase().includes(term) ||
      item.field.toLowerCase().includes(term) ||
      item.previousValue.toLowerCase().includes(term) ||
      item.newValue.toLowerCase().includes(term) ||
      (item.reason && item.reason.toLowerCase().includes(term));

    const matchesField = !fieldFilter || item.field === fieldFilter;

    return matchesSearch && matchesField;
  });

  const uniqueFields = Array.from(new Set(history.map(h => h.field)));

  const handleExport = () => {
    playFeedbackSound('click');
    exportToCSV(`Historial_Modificaciones_${p.mark}`, history.map(h => ({
      Fecha_Hora: h.date,
      Usuario: h.user,
      Rol: h.userRole || 'Admin',
      Campo_Modificado: h.field,
      Valor_Anterior: h.previousValue,
      Valor_Nuevo: h.newValue,
      Motivo: h.reason || '-'
    })));
  };

  return (
    <div id="piece-history-modal-container" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-[#c3c6d7] shadow-2xl overflow-hidden animate-in zoom-in-95 my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#e2e8f8] bg-[#f9fafb] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#004ac6]/10 border border-[#004ac6]/20 flex items-center justify-center text-[#004ac6]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[17px] sm:text-[18px] text-[#151c27]">
                  Historial de Modificaciones: <span className="font-mono text-[#004ac6]">{p.mark}</span>
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#f0f3ff] text-[#004ac6] border border-[#adc6ff]">
                  {p.type} • {p.profile}
                </span>
              </div>
              <p className="text-[12px] text-[#555f6f]">
                Registro cronológico inmutable de cambios de especificaciones, dimensiones y datos técnicos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={history.length === 0}
              className="px-3 py-1.5 bg-white border border-[#c3c6d7] hover:border-[#004ac6] hover:bg-[#f0f3ff] text-[#151c27] rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
              title="Descargar historial en CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#004ac6]" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={() => {
                const target = p;
                setSelectedPieceForHistoryModal(null);
                setSelectedPieceForEdit(target);
              }}
              className="px-3 py-1.5 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-lg text-[12px] font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modificar Pieza</span>
            </button>

            <button
              onClick={() => setSelectedPieceForHistoryModal(null)}
              className="p-1.5 text-[#737686] hover:text-[#151c27] rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Piece Overview Bar */}
        <div className="bg-[#fafcff] border-b border-[#e2e8f8] px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
          <div>
            <span className="text-[#555f6f] block uppercase text-[10px] font-bold">Proyecto:</span>
            <strong className="text-[#151c27]">{p.project}</strong>
          </div>
          <div>
            <span className="text-[#555f6f] block uppercase text-[10px] font-bold">Orden de Trabajo (OT):</span>
            <span className="font-mono font-semibold text-[#151c27]">{p.workOrder || 'OT-2026-084'}</span>
          </div>
          <div>
            <span className="text-[#555f6f] block uppercase text-[10px] font-bold">Estado Actual:</span>
            <span className="font-semibold text-[#004ac6]">{p.status}</span>
          </div>
          <div>
            <span className="text-[#555f6f] block uppercase text-[10px] font-bold">Total Cambios:</span>
            <strong className="text-emerald-700 font-mono">{history.length} eventos registrados</strong>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-4 border-b border-[#e2e8f8] bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#737686] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por usuario, campo, valor o motivo..."
                className="w-full h-9 pl-9 pr-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg text-[13px] outline-none focus:border-[#004ac6]"
              />
            </div>

            {uniqueFields.length > 0 && (
              <select
                value={fieldFilter}
                onChange={(e) => setFieldFilter(e.target.value)}
                className="h-9 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg text-[12px] text-[#151c27] outline-none focus:border-[#004ac6] cursor-pointer min-w-[140px]"
              >
                <option value="">Todos los campos</option>
                {uniqueFields.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            )}

            {(searchTerm || fieldFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFieldFilter('');
                }}
                className="h-9 w-9 rounded-lg bg-white flex items-center justify-center text-[#737686] hover:text-[#151c27] border border-[#c3c6d7] hover:bg-[#f0f3ff] transition-colors shrink-0"
                title="Limpiar filtros"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto flex-1 p-4">
          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-[#737686] space-y-2">
              <Clock className="w-10 h-10 mx-auto text-[#adc6ff]" />
              <p className="font-semibold text-[#151c27]">No se registran modificaciones para esta pieza</p>
              <p className="text-[12px] text-[#555f6f]">
                {history.length === 0 
                  ? 'La información se mantiene con sus especificaciones iniciales de fabricación.'
                  : 'Ningún cambio coincide con los filtros aplicados.'}
              </p>
            </div>
          ) : (
            <div className="border border-[#c3c6d7] rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="bg-[#f9fafb] border-b border-[#c3c6d7] text-[#434655] font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3.5 w-36">Fecha y Hora</th>
                    <th className="py-3 px-3.5 w-36">Usuario</th>
                    <th className="py-3 px-3.5 w-44">Campo</th>
                    <th className="py-3 px-3.5">Valor Anterior</th>
                    <th className="py-3 px-3.5">Valor Nuevo</th>
                    <th className="py-3 px-3.5">Motivo / Justificación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f8]">
                  {filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono text-[#555f6f] whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span className="font-semibold text-[#151c27] block">{item.user}</span>
                        {item.userRole && (
                          <span className="text-[10px] text-[#737686] font-mono">{item.userRole}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-[#004ac6]">
                        {item.field}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-red-600 bg-red-50/50">
                        <span className="line-through">{item.previousValue}</span>
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-bold text-emerald-800 bg-emerald-50/50">
                        {item.newValue}
                      </td>
                      <td className="py-2.5 px-3.5 text-[#434655] italic">
                        {item.reason || 'Actualización de datos'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e2e8f8] bg-[#f9fafb] flex items-center justify-between text-[12px]">
          <span className="text-[#555f6f]">
            Mostrando <strong>{filteredHistory.length}</strong> de <strong>{history.length}</strong> cambios
          </span>
          <button
            onClick={() => setSelectedPieceForHistoryModal(null)}
            className="px-4 py-2 bg-white border border-[#c3c6d7] text-[#151c27] rounded-lg font-semibold hover:bg-slate-100"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
