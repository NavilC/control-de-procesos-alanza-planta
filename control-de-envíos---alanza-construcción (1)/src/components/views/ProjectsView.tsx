import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Project } from '../../types';
import { 
  Plus, 
  ExternalLink, 
  MoreVertical, 
  Building, 
  Users, 
  Calendar, 
  Layers, 
  Truck,
  CheckCircle,
  Clock,
  Search,
  Filter
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const { 
    projects, 
    setIsNewProjectModalOpen, 
    setActiveTab, 
    setSelectedProjectFilter,
    globalSearch 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Activo' | 'Retrasado' | 'Finalizado'>('All');
  const [selectedProjectForMenu, setSelectedProjectForMenu] = useState<string | null>(null);

  const filteredProjects = projects.filter(proj => {
    const term = (searchQuery || globalSearch).toLowerCase();
    const matchesSearch = 
      proj.name.toLowerCase().includes(term) ||
      proj.ov.toLowerCase().includes(term) ||
      proj.op.toLowerCase().includes(term) ||
      proj.siteManager.name.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'All' || proj.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#151c27] tracking-tight font-['Inter']">
            Gestión de Proyectos
          </h1>
          <p className="text-[14px] md:text-[16px] text-[#434655] mt-1">
            Administre los proyectos, órdenes, personal de campo y piezas asociadas.
          </p>
        </div>
        <button
          id="new-project-btn"
          onClick={() => setIsNewProjectModalOpen(true)}
          className="bg-[#004ac6] text-white hover:bg-[#2563eb] text-[14px] font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Proyecto</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-lg p-5 border border-[#c3c6d7] shadow-xs flex flex-col gap-1.5 relative overflow-hidden">
          <div className="absolute -right-3 -top-3 w-14 h-14 bg-[#e7eefe] rounded-full opacity-60 pointer-events-none"></div>
          <span className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
            Proyectos Activos
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[30px] md:text-[32px] font-bold text-[#004ac6]">
              {projects.filter(p => p.status === 'Activo').length || 12}
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-lg p-5 border border-[#c3c6d7] shadow-xs flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
            Proyectos Finalizados
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[30px] md:text-[32px] font-bold text-[#151c27]">
              45
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-lg p-5 border border-[#c3c6d7] shadow-xs flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
            Piezas Asociadas
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[30px] md:text-[32px] font-bold text-[#151c27]">
              14,250
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-lg p-5 border border-[#c3c6d7] shadow-xs flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
            Envíos Activos
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[30px] md:text-[32px] font-bold text-[#f59e0b]">
              8
            </span>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white rounded-lg p-5 border border-[#c3c6d7] shadow-xs flex flex-col gap-1.5 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
            Recepciones Ptes.
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[30px] md:text-[32px] font-bold text-[#bc4800]">
              3
            </span>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#c3c6d7] flex flex-wrap gap-3 items-center justify-between shadow-xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar proyectos por nombre, OV, OP o residente..."
            className="w-full h-9 pl-9 pr-3 text-[13px] bg-[#f0f3ff] border border-transparent focus:border-[#004ac6] focus:bg-white rounded-lg outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[#555f6f]">Estado:</span>
          {(['All', 'Activo', 'Retrasado', 'Finalizado'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-[12px] font-semibold rounded-lg border transition-colors ${
                statusFilter === st
                  ? 'bg-[#004ac6] border-[#004ac6] text-white shadow-xs'
                  : 'bg-white border-[#c3c6d7] text-[#151c27] hover:bg-[#f0f3ff] hover:border-[#004ac6]'
              }`}
            >
              {st === 'All' ? 'Todos' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white rounded-xl border border-[#c3c6d7] shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead className="bg-[#f0f3ff] border-b border-[#c3c6d7] sticky top-0">
              <tr>
                <th className="py-3 px-4 text-[12px] font-bold text-[#434655] uppercase tracking-wider w-[240px]">
                  Proyecto
                </th>
                <th className="py-3 px-4 text-[12px] font-bold text-[#434655] uppercase tracking-wider">
                  OV
                </th>
                <th className="py-3 px-4 text-[12px] font-bold text-[#434655] uppercase tracking-wider">
                  OP
                </th>
                <th className="py-3 px-4 text-[12px] font-bold text-[#434655] uppercase tracking-wider">
                  Residente de Campo
                </th>
                <th className="py-3 px-4 text-[12px] font-bold text-[#434655] uppercase tracking-wider text-center">
                  Usuarios
                </th>
                <th className="py-3 px-4 text-[12px] font-bold text-[#434655] uppercase tracking-wider text-right">
                  Piezas
                </th>
                <th className="py-3 px-4 text-[12px] font-bold text-[#434655] uppercase tracking-wider text-center">
                  Estado
                </th>
                <th className="py-3 px-4 text-[12px] font-bold text-[#434655] uppercase tracking-wider text-right">
                  Creación
                </th>
                <th className="py-3 px-4 text-[12px] font-bold text-[#434655] uppercase tracking-wider text-right w-[110px]">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f8] text-[13px]">
              {filteredProjects.map((proj) => (
                <tr 
                  key={proj.id}
                  className="hover:bg-[#f0f3ff]/70 transition-colors group cursor-pointer"
                >
                  <td className="py-3.5 px-4">
                    <div 
                      onClick={() => {
                        setSelectedProjectFilter(proj.name);
                        setActiveTab('piezas');
                      }}
                      className="text-[#004ac6] font-bold text-[14px] hover:underline flex items-center gap-1.5"
                    >
                      <span>{proj.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {proj.location && (
                      <span className="text-[11px] text-[#555f6f] block mt-0.5">{proj.location}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-[#151c27]">
                    {proj.ov}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-[#151c27]">
                    {proj.op}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      {proj.siteManager.avatarUrl ? (
                        <img 
                          src={proj.siteManager.avatarUrl} 
                          alt={proj.siteManager.name} 
                          className="w-6 h-6 rounded-full object-cover border border-[#c3c6d7]"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#dce3f2] text-[#434655] flex items-center justify-center text-[10px] font-bold">
                          {proj.siteManager.initials}
                        </div>
                      )}
                      <span className="text-[#151c27] font-medium">{proj.siteManager.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-[#151c27]">
                    {proj.usersCount}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#151c27]">
                    {proj.piecesCount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                      proj.status === 'Activo' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : proj.status === 'Retrasado'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {proj.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-[#555f6f] font-mono text-[12px]">
                    {proj.createdAt}
                  </td>
                  <td className="py-3.5 px-4 text-right relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProjectForMenu(selectedProjectForMenu === proj.id ? null : proj.id);
                      }}
                      className="px-2.5 py-1 bg-white border border-[#c3c6d7] hover:border-[#004ac6] hover:bg-[#f0f3ff] text-[#151c27] rounded-md text-[12px] font-semibold flex items-center gap-1 transition-colors shadow-2xs ml-auto"
                      title="Opciones de proyecto"
                    >
                      <span>Gestionar</span>
                      <MoreVertical className="w-3.5 h-3.5 text-[#555f6f]" />
                    </button>

                    {selectedProjectForMenu === proj.id && (
                      <div className="absolute right-4 top-10 bg-white border border-[#c3c6d7] rounded-lg shadow-xl z-20 py-1 w-48 text-left text-[12px] animate-in zoom-in-95">
                        <button
                          onClick={() => {
                            setSelectedProjectFilter(proj.name);
                            setActiveTab('piezas');
                            setSelectedProjectForMenu(null);
                          }}
                          className="w-full px-3 py-2 hover:bg-[#f0f3ff] text-[#151c27] text-left flex items-center gap-2 font-medium"
                        >
                          <Layers className="w-4 h-4 text-[#004ac6]" /> Ver Piezas
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProjectFilter(proj.name);
                            setActiveTab('envios');
                            setSelectedProjectForMenu(null);
                          }}
                          className="w-full px-3 py-2 hover:bg-[#f0f3ff] text-[#151c27] text-left flex items-center gap-2 font-medium"
                        >
                          <Truck className="w-4 h-4 text-[#004ac6]" /> Ver Envíos
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProjectFilter(proj.name);
                            setActiveTab('reportes');
                            setSelectedProjectForMenu(null);
                          }}
                          className="w-full px-3 py-2 hover:bg-[#f0f3ff] text-[#151c27] text-left flex items-center gap-2 font-medium"
                        >
                          <Building className="w-4 h-4 text-[#004ac6]" /> Ficha de Proyecto
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-white border-t border-[#c3c6d7] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px]">
          <span className="text-[#555f6f]">
            Mostrando <strong>1 a {filteredProjects.length}</strong> de {projects.length} proyectos
          </span>
          <div className="flex items-center gap-1.5">
            <button 
              disabled 
              className="px-3 py-1.5 border border-[#c3c6d7] rounded-lg text-[#737686] opacity-50 cursor-not-allowed text-[12px] font-semibold"
            >
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
    </div>
  );
};
