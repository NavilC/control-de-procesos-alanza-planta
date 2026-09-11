import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Incident } from '../../types';
import { 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  MoreVertical,
  ShieldAlert,
  HelpCircle,
  FileCheck2,
  Eye
} from 'lucide-react';

export const IncidentsView: React.FC = () => {
  const { 
    incidents, 
    setIsNewIncidentModalOpen, 
    resolveIncident,
    globalSearch 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIncidentForDetail, setSelectedIncidentForDetail] = useState<Incident | null>(null);
  const [resolutionNoteInput, setResolutionNoteInput] = useState('');

  const filteredIncidents = incidents.filter(inc => {
    const term = (searchTerm || globalSearch).toLowerCase();
    const matchesSearch = 
      inc.id.toLowerCase().includes(term) ||
      inc.shortDescription.toLowerCase().includes(term) ||
      inc.origin.toLowerCase().includes(term) ||
      inc.responsible.toLowerCase().includes(term);
    const matchesSev = !severityFilter || inc.severity === severityFilter;
    const matchesStat = !statusFilter || inc.status === statusFilter;
    return matchesSearch && matchesSev && matchesStat;
  });

  const openCount = incidents.filter(i => i.status !== 'Resuelta').length || 42;
  const criticalCount = incidents.filter(i => i.severity === 'Crítica' && i.status !== 'Resuelta').length || 3;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-[26px] md:text-[30px] font-bold text-[#151c27] tracking-tight font-['Inter']">
            Gestión de Incidencias
          </h1>
          <p className="text-[14px] text-[#434655] mt-1">
            Monitoreo y resolución de problemas en el flujo de construcción.
          </p>
        </div>
        <button
          id="new-incident-btn"
          onClick={() => setIsNewIncidentModalOpen(true)}
          className="bg-[#004ac6] text-white hover:bg-[#2563eb] text-[13px] font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Incidencia</span>
        </button>
      </div>

      {/* KPIs Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-[#c3c6d7] p-5 rounded-xl flex flex-col justify-between h-32 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
              Total Abiertas
            </span>
            <span className="material-symbols-outlined text-[#004ac6] text-[20px]">report</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-[30px] md:text-[32px] font-bold text-[#151c27]">{openCount}</span>
            <div className="flex items-center text-[#ba1a1a] text-[12px] font-semibold">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              <span>+5%</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-[#c3c6d7] p-5 rounded-xl flex flex-col justify-between h-32 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
              Tiempo Medio Resolución
            </span>
            <span className="material-symbols-outlined text-[#004ac6] text-[20px]">schedule</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-[30px] md:text-[32px] font-bold text-[#151c27]">
              18<span className="text-[18px] text-[#555f6f] ml-1 font-medium">hrs</span>
            </span>
            <div className="flex items-center text-[#10b981] text-[12px] font-semibold">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
              <span>-2.5%</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Critical Incidents */}
        <div className="bg-white border-2 border-[#ba1a1a] p-5 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden shadow-xs">
          <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
          <div className="flex justify-between items-start relative z-10">
            <span className="text-[11px] font-bold text-[#ba1a1a] uppercase tracking-wider">
              Incidencias Críticas
            </span>
            <span className="material-symbols-outlined text-[#ba1a1a] text-[20px]">warning</span>
          </div>
          <div className="flex items-end justify-between relative z-10">
            <span className="text-[30px] md:text-[32px] font-bold text-[#ba1a1a]">{criticalCount}</span>
            <span className="text-[11px] font-bold text-[#ba1a1a] bg-[#ffdad6] px-2.5 py-0.5 rounded">
              Acción Requerida
            </span>
          </div>
        </div>

        {/* KPI 4: Category Distribution */}
        <div className="bg-white border border-[#c3c6d7] p-5 rounded-xl flex flex-col justify-between h-32 shadow-xs">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
              Distribución Categoría
            </span>
            <PieChart className="w-4 h-4 text-[#004ac6]" />
          </div>
          <div>
            <div className="w-full bg-[#e2e8f8] h-2.5 rounded-full overflow-hidden flex">
              <div className="bg-[#004ac6] h-full" style={{ width: '50%' }} title="Calidad 50%" />
              <div className="bg-[#bc4800] h-full" style={{ width: '30%' }} title="Logística 30%" />
              <div className="bg-[#555f6f] h-full" style={{ width: '20%' }} title="Diseño 20%" />
            </div>
            <div className="flex gap-3 mt-2 text-[10px] font-semibold text-[#555f6f]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#004ac6]" /> Calidad (50%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#bc4800]" /> Logíst. (30%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Data Table Area */}
      <div className="bg-white border border-[#c3c6d7] rounded-xl flex flex-col overflow-hidden shadow-xs">
        {/* Table Header/Controls */}
        <div className="px-5 py-4 border-b border-[#c3c6d7] bg-[#f9fafb] flex flex-col sm:flex-row justify-between items-center gap-3">
          <h3 className="text-[16px] font-bold text-[#151c27]">Registro Detallado</h3>
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737686] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar incidencia..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#c3c6d7] rounded-lg text-[13px] text-[#151c27] outline-none focus:border-[#004ac6] h-9"
              />
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="h-9 px-2.5 bg-white border border-[#c3c6d7] rounded-lg text-[12px] font-semibold text-[#151c27] outline-none"
            >
              <option value="">Todas las gravedades</option>
              <option value="Crítica">Crítica</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead className="bg-[#f0f3ff] sticky top-0 z-10 border-b border-[#c3c6d7]">
              <tr>
                <th className="px-4 py-3 text-[11px] font-bold text-[#434655] uppercase tracking-wider w-24">ID</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#434655] uppercase tracking-wider w-28">Gravedad</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#434655] uppercase tracking-wider">Descripción Breve</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#434655] uppercase tracking-wider w-40">Origen</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#434655] uppercase tracking-wider w-36">Responsable</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#434655] uppercase tracking-wider w-28">Estado</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#434655] uppercase tracking-wider w-28">Fecha</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#434655] uppercase tracking-wider w-16 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f8] text-[13px]">
              {filteredIncidents.map((inc) => (
                <tr
                  key={inc.id}
                  onClick={() => setSelectedIncidentForDetail(inc)}
                  className="hover:bg-[#f0f3ff] transition-colors group cursor-pointer"
                >
                  <td className="px-4 py-3 font-mono font-bold text-[#004ac6]">
                    {inc.id}
                  </td>
                  <td className="px-4 py-3">
                    {inc.severity === 'Crítica' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-[#ba1a1a] text-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        Crítica
                      </span>
                    )}
                    {inc.severity === 'Alta' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-[#bc4800] text-white">
                        Alta
                      </span>
                    )}
                    {inc.severity === 'Media' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-[#f59e0b] text-[#151c27]">
                        Media
                      </span>
                    )}
                    {inc.severity === 'Baja' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-[#2563eb] text-white">
                        Baja
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#151c27]">
                    {inc.shortDescription}
                  </td>
                  <td className="px-4 py-3 text-[#555f6f] font-mono text-[12px]">
                    {inc.origin}
                  </td>
                  <td className="px-4 py-3 text-[#151c27]">
                    {inc.responsible}
                  </td>
                  <td className="px-4 py-3">
                    {inc.status === 'Abierta' && (
                      <span className="px-2 py-0.5 bg-[#e2e8f8] rounded text-[#434655] font-semibold text-[11px]">
                        Abierta
                      </span>
                    )}
                    {inc.status === 'En Proceso' && (
                      <span className="px-2 py-0.5 bg-[#dbe1ff] text-[#00174b] rounded font-semibold text-[11px]">
                        En Proceso
                      </span>
                    )}
                    {inc.status === 'Resuelta' && (
                      <span className="px-2 py-0.5 bg-[#10b981] text-white rounded font-semibold text-[11px]">
                        Resuelta
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#737686] font-mono text-[12px]">
                    {inc.date}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => setSelectedIncidentForDetail(inc)}
                      className="px-2.5 py-1 bg-white border border-[#c3c6d7] hover:border-[#004ac6] hover:bg-[#f0f3ff] text-[#151c27] rounded-md text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-2xs ml-auto"
                      title="Ver y gestionar incidencia"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#004ac6]" />
                      <span>Gestionar</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-[#c3c6d7] bg-white flex flex-col sm:flex-row justify-between items-center gap-3 text-[13px] text-[#555f6f]">
          <span>Mostrando <strong>1 - {filteredIncidents.length}</strong> de 42 incidencias</span>
          <div className="flex items-center gap-1.5">
            <button disabled className="px-3 py-1.5 border border-[#c3c6d7] rounded-lg text-[#737686] opacity-50 cursor-not-allowed text-[12px] font-semibold">
              Anterior
            </button>
            <button className="w-8 h-8 rounded-lg bg-[#004ac6] text-white flex items-center justify-center font-bold text-[12px] shadow-xs">
              1
            </button>
            <button className="w-8 h-8 rounded-lg border border-[#c3c6d7] bg-white hover:bg-[#f0f3ff] text-[#151c27] flex items-center justify-center font-semibold text-[12px] transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 border border-[#c3c6d7] bg-white hover:bg-[#f0f3ff] text-[#151c27] font-semibold rounded-lg text-[12px] transition-colors">
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Incident Detail & Resolution Modal */}
      {selectedIncidentForDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#c3c6d7] shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-[#e2e8f8] pb-3">
              <div>
                <span className="font-mono text-[12px] font-bold text-[#004ac6]">
                  {selectedIncidentForDetail.id}
                </span>
                <h3 className="text-[17px] font-bold text-[#151c27]">
                  {selectedIncidentForDetail.shortDescription}
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-red-100 text-red-800">
                {selectedIncidentForDetail.severity}
              </span>
            </div>

            <div className="space-y-3 text-[13px]">
              <div className="p-3 bg-[#f0f3ff] rounded-lg">
                <span className="text-[11px] font-bold text-[#434655] uppercase block mb-1">
                  Detalles del Incidente:
                </span>
                <p className="text-[#151c27] leading-relaxed">
                  {selectedIncidentForDetail.details || 'Sin descripción adicional registrada.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div className="p-2.5 bg-slate-50 border rounded-lg">
                  <span className="text-[#737686] block">Elemento Origen</span>
                  <span className="font-semibold text-[#151c27]">{selectedIncidentForDetail.origin}</span>
                </div>
                <div className="p-2.5 bg-slate-50 border rounded-lg">
                  <span className="text-[#737686] block">Responsable Asignado</span>
                  <span className="font-semibold text-[#151c27]">{selectedIncidentForDetail.responsible}</span>
                </div>
              </div>

              {selectedIncidentForDetail.status !== 'Resuelta' ? (
                <div className="pt-2">
                  <label className="block text-[12px] font-bold text-[#434655] uppercase mb-1">
                    Acción Correctiva / Solución para Cerrar Incidencia:
                  </label>
                  <textarea
                    rows={3}
                    value={resolutionNoteInput}
                    onChange={(e) => setResolutionNoteInput(e.target.value)}
                    placeholder="Especifique el retrabajo, re-inspección o aprobación de ingeniería..."
                    className="w-full p-2.5 text-[13px] bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6]"
                  />
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
                  <span className="font-bold block text-[12px]">Solución Registrada:</span>
                  <p className="text-[12px] mt-0.5">{selectedIncidentForDetail.solutionNotes || 'Resuelto conforme a especificaciones.'}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#e2e8f8]">
              <button
                onClick={() => setSelectedIncidentForDetail(null)}
                className="px-4 py-2 bg-slate-100 rounded-lg text-[13px] font-medium text-[#151c27]"
              >
                Cerrar
              </button>

              {selectedIncidentForDetail.status !== 'Resuelta' && (
                <button
                  onClick={() => {
                    resolveIncident(selectedIncidentForDetail.id, resolutionNoteInput || 'Resuelto y verificado por control de calidad.');
                    setSelectedIncidentForDetail(null);
                    setResolutionNoteInput('');
                  }}
                  className="px-5 py-2 bg-[#10b981] hover:bg-emerald-600 text-white rounded-lg text-[13px] font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Marcar como Resuelta</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
