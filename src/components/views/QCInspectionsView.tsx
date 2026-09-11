import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { QCInspection } from '../../types';
import { 
  CheckSquare, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Eye, 
  RotateCcw,
  Calendar,
  User,
  Building,
  CheckCircle2,
  AlertCircle,
  FileEdit,
  Scissors
} from 'lucide-react';
import { playFeedbackSound } from '../../utils/audioFeedback';

export const QCInspectionsView: React.FC = () => {
  const { 
    inspections, 
    setSelectedInspectionForQC,
    setSelectedPieceForTraceability,
    setSelectedContractorForHistory,
    selectedProjectFilter,
    pieces,
    contractors,
    globalSearch
  } = useApp();

  const [projectFilter, setProjectFilter] = useState(selectedProjectFilter || '');
  const [qcStatusFilter, setQcStatusFilter] = useState('');
  const [inspectorFilter, setInspectorFilter] = useState('');
  const [contractorFilter, setContractorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Sync with global project filter
  useEffect(() => {
    if (selectedProjectFilter) {
      setProjectFilter(selectedProjectFilter);
    }
  }, [selectedProjectFilter]);

  const filteredInspections = inspections.filter(insp => {
    const term = globalSearch.toLowerCase();
    const relatedPiece = pieces.find(p => p.mark === insp.pieceMark);

    const matchesGlobal = 
      insp.pieceMark.toLowerCase().includes(term) ||
      insp.project.toLowerCase().includes(term) ||
      insp.profile.toLowerCase().includes(term) ||
      (relatedPiece?.welderName && relatedPiece.welderName.toLowerCase().includes(term)) ||
      (relatedPiece?.painterName && relatedPiece.painterName.toLowerCase().includes(term));

    const matchesProj = !projectFilter || insp.project === projectFilter;
    const matchesStatus = !qcStatusFilter || insp.qcStatus === qcStatusFilter;
    const matchesInspector = !inspectorFilter || insp.inspector === inspectorFilter;

    const matchesContractor = !contractorFilter || 
      relatedPiece?.welderId === contractorFilter || 
      relatedPiece?.painterId === contractorFilter;

    return matchesGlobal && matchesProj && matchesStatus && matchesInspector && matchesContractor;
  });

  const pendingCount = inspections.filter(i => i.qcStatus === 'Pendiente').length || 42;
  const inspectedCount = inspections.filter(i => i.qcStatus !== 'Pendiente').length + 1200;
  const approvedCount = inspections.filter(i => i.qcStatus === 'Aprobada').length + 1148;
  const rejectedCount = inspections.filter(i => i.qcStatus === 'Rechazada').length + 11;
  const observedCount = inspections.filter(i => i.qcStatus === 'Con Observaciones').length + 41;

  const handleKpiFilter = (status: string) => {
    playFeedbackSound('click');
    setQcStatusFilter(prev => prev === status ? '' : status);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-[26px] md:text-[30px] font-bold text-[#151c27] tracking-tight font-['Inter']">
            Inspecciones QC
          </h1>
          {projectFilter && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#dbe1ff] text-[#002b75] border border-[#adc6ff]">
              {projectFilter}
            </span>
          )}
        </div>
        <p className="text-[14px] text-[#434655] mt-0.5">
          Aseguramiento de calidad, ensayos no destructivos (NDT) y trazabilidad técnica.
        </p>
      </div>

      {/* KPI Cards Grid (Clickable to Filter) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* KPI 1: Pendientes */}
        <div 
          onClick={() => handleKpiFilter('Pendiente')}
          className={`bg-white p-4 rounded-xl border flex flex-col justify-between shadow-xs cursor-pointer transition-all ${
            qcStatusFilter === 'Pendiente' ? 'border-[#004ac6] ring-2 ring-[#004ac6]/30 bg-blue-50/20' : 'border-[#c3c6d7] hover:border-[#004ac6]'
          }`}
        >
          <span className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
            Pendientes
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[30px] md:text-[32px] font-bold text-[#151c27]">
              {pendingCount}
            </span>
          </div>
          <div className="mt-3 w-full h-1.5 bg-[#e2e8f8] rounded-full overflow-hidden">
            <div className="bg-slate-500 h-full w-1/3"></div>
          </div>
        </div>

        {/* KPI 2: Inspeccionadas */}
        <div 
          onClick={() => { playFeedbackSound('click'); setQcStatusFilter(''); }}
          className={`bg-white p-4 rounded-xl border flex flex-col justify-between shadow-xs cursor-pointer transition-all ${
            qcStatusFilter === '' ? 'border-[#004ac6] ring-1 ring-[#004ac6]/20' : 'border-[#c3c6d7] hover:border-[#004ac6]'
          }`}
        >
          <span className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
            Inspeccionadas
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[30px] md:text-[32px] font-bold text-[#151c27]">
              {inspectedCount.toLocaleString()}
            </span>
          </div>
          <div className="mt-3 w-full h-1.5 bg-[#e2e8f8] rounded-full overflow-hidden">
            <div className="bg-[#004ac6] h-full w-[85%]"></div>
          </div>
        </div>

        {/* KPI 3: Aprobadas */}
        <div 
          onClick={() => handleKpiFilter('Aprobada')}
          className={`bg-white p-4 rounded-xl border flex flex-col justify-between border-l-4 border-l-[#10b981] shadow-xs cursor-pointer transition-all ${
            qcStatusFilter === 'Aprobada' ? 'border-[#10b981] ring-2 ring-[#10b981]/30 bg-emerald-50/20' : 'border-[#c3c6d7] hover:border-[#10b981]'
          }`}
        >
          <span className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
            Aprobadas
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[30px] md:text-[32px] font-bold text-[#151c27]">
              {approvedCount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-[#10b981] font-semibold text-[12px]">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>95% Conformes</span>
          </div>
        </div>

        {/* KPI 4: Rechazadas */}
        <div 
          onClick={() => handleKpiFilter('Rechazada')}
          className={`bg-white p-4 rounded-xl border flex flex-col justify-between border-l-4 border-l-[#ba1a1a] shadow-xs cursor-pointer transition-all ${
            qcStatusFilter === 'Rechazada' ? 'border-[#ba1a1a] ring-2 ring-[#ba1a1a]/30 bg-red-50/20' : 'border-[#c3c6d7] hover:border-[#ba1a1a]'
          }`}
        >
          <span className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
            Rechazadas
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[30px] md:text-[32px] font-bold text-[#151c27]">
              {rejectedCount}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-[#ba1a1a] font-semibold text-[12px]">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>1%</span>
          </div>
        </div>

        {/* KPI 5: Con Observaciones */}
        <div 
          onClick={() => handleKpiFilter('Con Observaciones')}
          className={`bg-white p-4 rounded-xl border flex flex-col justify-between border-l-4 border-l-[#f59e0b] shadow-xs col-span-2 sm:col-span-1 cursor-pointer transition-all ${
            qcStatusFilter === 'Con Observaciones' ? 'border-[#f59e0b] ring-2 ring-[#f59e0b]/30 bg-amber-50/20' : 'border-[#c3c6d7] hover:border-[#f59e0b]'
          }`}
        >
          <span className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
            Con Observaciones
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[30px] md:text-[32px] font-bold text-[#151c27]">
              {observedCount}
            </span>
          </div>
          <div className="mt-3 w-full h-1.5 bg-[#e2e8f8] rounded-full overflow-hidden">
            <div className="bg-[#f59e0b] h-full w-[15%]"></div>
          </div>
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-white p-4 rounded-xl border border-[#c3c6d7] flex flex-wrap gap-4 items-end shadow-xs">
        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <label className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
            Proyecto
          </label>
          <select 
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="h-10 border border-[#c3c6d7] rounded-lg bg-white px-3 text-[13px] text-[#151c27] focus:ring-2 focus:ring-[#004ac6] outline-none"
          >
            <option value="">Todos los proyectos</option>
            <option value="Torre Mítica">Torre Mítica</option>
            <option value="Nave Industrial Alfa">Nave Industrial Alfa</option>
            <option value="Mhotivo">Mhotivo</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <label className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
            Estado QC
          </label>
          <select 
            value={qcStatusFilter}
            onChange={(e) => setQcStatusFilter(e.target.value)}
            className="h-10 border border-[#c3c6d7] rounded-lg bg-white px-3 text-[13px] text-[#151c27] focus:ring-2 focus:ring-[#004ac6] outline-none"
          >
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Aprobada">Aprobada</option>
            <option value="Rechazada">Rechazada</option>
            <option value="Con Observaciones">Con Observaciones</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <label className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
            Inspector
          </label>
          <select 
            value={inspectorFilter}
            onChange={(e) => setInspectorFilter(e.target.value)}
            className="h-10 border border-[#c3c6d7] rounded-lg bg-white px-3 text-[13px] text-[#151c27] focus:ring-2 focus:ring-[#004ac6] outline-none"
          >
            <option value="">Todos los inspectores</option>
            <option value="Juan Pérez">Juan Pérez</option>
            <option value="A. Gómez">A. Gómez</option>
            <option value="J. Pérez">J. Pérez</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[170px]">
          <label className="text-[11px] font-bold text-[#004ac6] uppercase tracking-wider">
            Contratista / Fabricador
          </label>
          <select 
            value={contractorFilter}
            onChange={(e) => setContractorFilter(e.target.value)}
            className="h-10 border border-[#c3c6d7] rounded-lg bg-white px-3 text-[13px] text-[#151c27] focus:ring-2 focus:ring-[#004ac6] outline-none"
          >
            <option value="">Todos los contratistas</option>
            {contractors.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
          <label className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
            Fecha
          </label>
          <input 
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-10 border border-[#c3c6d7] rounded-lg bg-white px-3 text-[13px] text-[#151c27] focus:ring-2 focus:ring-[#004ac6] outline-none"
          />
        </div>

        <button 
          onClick={() => {
            playFeedbackSound('click');
            setProjectFilter('');
            setQcStatusFilter('');
            setInspectorFilter('');
            setContractorFilter('');
            setDateFilter('');
          }}
          className="h-10 px-4 bg-white border border-[#c3c6d7] text-[#151c27] hover:bg-[#f0f3ff] hover:border-[#004ac6] font-semibold text-[13px] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Filter className="w-4 h-4 text-[#004ac6]" />
          <span>Limpiar Filtros</span>
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-[#c3c6d7] overflow-hidden shadow-xs flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[950px]">
            <thead>
              <tr className="bg-[#f9fafb] border-b border-[#c3c6d7]">
                <th className="py-3 px-3.5 text-[11px] font-bold text-[#434655] uppercase tracking-wider">
                  Marca
                </th>
                <th className="py-3 px-3.5 text-[11px] font-bold text-[#434655] uppercase tracking-wider">
                  Tipo
                </th>
                <th className="py-3 px-3.5 text-[11px] font-bold text-[#434655] uppercase tracking-wider">
                  Perfil
                </th>
                <th className="py-3 px-3.5 text-[11px] font-bold text-[#434655] uppercase tracking-wider">
                  Proyecto
                </th>
                <th className="py-3 px-3.5 text-[11px] font-bold text-[#004ac6] uppercase tracking-wider">
                  Contratistas (Soldador / Pintor)
                </th>
                <th className="py-3 px-3.5 text-[11px] font-bold text-[#434655] uppercase tracking-wider">
                  Estado QC
                </th>
                <th className="py-3 px-3.5 text-[11px] font-bold text-[#434655] uppercase tracking-wider">
                  Inspector
                </th>
                <th className="py-3 px-3.5 text-[11px] font-bold text-[#434655] uppercase tracking-wider text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f8] text-[13px]">
              {filteredInspections.map((insp) => {
                const relPiece = pieces.find(p => p.mark === insp.pieceMark);

                return (
                  <tr 
                    key={insp.id}
                    className="hover:bg-[#f3f4f6] transition-colors group cursor-pointer"
                  >
                    <td className="py-2.5 px-3.5 font-mono font-bold text-[#151c27]">
                      <div>{insp.pieceMark}</div>
                      <div className="flex flex-wrap items-center gap-1 mt-0.5">
                        {(insp.measuredLengthMeters !== undefined || relPiece?.measuredLengthMeters !== undefined) && (
                          <span className="text-[10px] font-mono font-normal text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded inline-block">
                            L. Fís: {Number(insp.measuredLengthMeters ?? relPiece?.measuredLengthMeters).toFixed(3)}m
                          </span>
                        )}
                        {(insp.hasCuts || relPiece?.hasCuts) && (
                          <span className="text-[10px] font-sans font-medium text-amber-800 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded inline-flex items-center gap-1">
                            <Scissors className="w-2.5 h-2.5 text-amber-700" />
                            <span>
                              {((insp.cuts && insp.cuts.length > 0) || (relPiece?.cuts && relPiece.cuts.length > 0))
                                ? `${(insp.cuts?.length ?? relPiece?.cuts?.length)} corte(s)`
                                : 'Con corte'}
                            </span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 text-[#151c27]">
                      {insp.type}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-[#434655]">
                      <div>{insp.profile}</div>
                      {(insp.paintAverageMils !== undefined || relPiece?.paintAverageMils !== undefined) && (
                        <div className="text-[10px] font-sans font-normal text-purple-800 bg-purple-50 border border-purple-200/60 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                          Pint: {Number(insp.paintAverageMils ?? relPiece?.paintAverageMils).toFixed(2)} {insp.paintUnit || relPiece?.paintUnit || 'mils'}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 font-medium text-[#151c27]">
                      {insp.project}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <div className="text-[11px] space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#004ac6] font-bold">S:</span>
                          <span className="font-semibold text-[#151c27] truncate max-w-[120px]">
                            {relPiece?.welderName || 'Sin asignar'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-purple-700 font-bold">P:</span>
                          <span className="font-semibold text-[#151c27] truncate max-w-[120px]">
                            {relPiece?.painterName || 'Sin asignar'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5">
                      {insp.qcStatus === 'Pendiente' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#e2e8f8] text-[#434655] border border-[#c3c6d7]">
                          Pendiente
                        </span>
                      )}
                      {insp.qcStatus === 'Aprobada' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#10b981]/15 text-[#065f46] border border-[#10b981]/30">
                          Aprobada
                        </span>
                      )}
                      {insp.qcStatus === 'Rechazada' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#ba1a1a]/15 text-[#ba1a1a] border border-[#ba1a1a]/30">
                          Rechazada
                        </span>
                      )}
                      {insp.qcStatus === 'Con Observaciones' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#f59e0b]/15 text-[#b45309] border border-[#f59e0b]/30">
                          Con Observaciones
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-[#434655]">
                      {insp.inspector}
                    </td>
                  <td className="py-2.5 px-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {insp.qcStatus === 'Pendiente' ? (
                        <button
                          onClick={() => {
                            playFeedbackSound('click');
                            setSelectedInspectionForQC(insp);
                          }}
                          className="bg-[#004ac6] text-white px-3.5 py-1.5 rounded-lg text-[12px] font-bold hover:bg-[#2563eb] transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Inspeccionar</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              playFeedbackSound('click');
                              setSelectedInspectionForQC(insp);
                            }}
                            className="px-2.5 py-1.5 bg-[#f0f3ff] text-[#004ac6] border border-[#c3c6d7] hover:bg-[#004ac6] hover:text-white rounded-lg text-[12px] font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                            title="Modificar hoja de inspección QC (longitud y pintura)"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                            <span>Modificar</span>
                          </button>
                          <button
                            onClick={() => {
                              playFeedbackSound('click');
                              const pc = pieces.find(p => p.mark === insp.pieceMark);
                              if (pc) setSelectedPieceForTraceability(pc);
                            }}
                            className="p-1.5 bg-white border border-[#c3c6d7] text-[#434655] hover:bg-slate-100 rounded-lg text-[12px] transition-colors cursor-pointer"
                            title="Ver trazabilidad completa"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#555f6f]" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 border-t border-[#c3c6d7] flex items-center justify-between text-[13px]">
          <p className="text-[#555f6f]">
            Mostrando <span className="font-semibold text-[#151c27]">1</span> a <span className="font-semibold text-[#151c27]">{filteredInspections.length}</span> de <span className="font-semibold text-[#151c27]">1,246</span> resultados
          </p>
          <div className="flex items-center gap-1.5">
            <button disabled className="px-3 py-1.5 border border-[#c3c6d7] rounded-lg text-[#737686] opacity-50 cursor-not-allowed text-[12px] font-semibold flex items-center gap-1">
              <span>Anterior</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#004ac6] text-white font-bold text-[12px] shadow-xs">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#c3c6d7] bg-white hover:bg-[#f0f3ff] text-[#151c27] font-semibold text-[12px] transition-colors">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#c3c6d7] bg-white hover:bg-[#f0f3ff] text-[#151c27] font-semibold text-[12px] transition-colors">
              3
            </button>
            <button className="px-3 py-1.5 border border-[#c3c6d7] bg-white hover:bg-[#f0f3ff] text-[#151c27] font-semibold rounded-lg text-[12px] transition-colors">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
