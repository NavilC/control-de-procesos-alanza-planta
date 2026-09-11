import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Contractor, ContractorType, ContractorStatus, AssignmentWorkStatus, Piece } from '../../types';
import { 
  HardHat, 
  UserPlus, 
  Search, 
  Filter, 
  Edit2, 
  Eye, 
  Power, 
  Layers, 
  History, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Calendar, 
  Paintbrush, 
  ShieldCheck, 
  BarChart3, 
  Briefcase,
  Users,
  ChevronRight,
  Sparkles,
  ArrowUpDown,
  Download
} from 'lucide-react';
import { playFeedbackSound } from '../../utils/audioFeedback';

export const ContratistasView: React.FC = () => {
  const { 
    contractors, 
    pieces, 
    currentUserRole,
    setIsNewContractorModalOpen,
    setEditingContractor,
    setIsAssignWorkModalOpen,
    setSelectedPieceForAssignment,
    setSelectedContractorForHistory,
    setSelectedPieceForDetail,
    setSelectedPieceForTraceability,
    toggleContractorStatus,
    exportToCSV
  } = useApp();

  // Sub-tabs: 'listado' (Gestión de contratistas) | 'asignacion' (Asignación de trabajo) | 'indicadores' (Dashboard)
  const [activeSubTab, setActiveSubTab] = useState<'listado' | 'asignacion' | 'indicadores'>('listado');

  // Filters for Contratistas list
  const [contractorSearch, setContractorSearch] = useState('');
  const [contractorTypeFilter, setContractorTypeFilter] = useState<'Todos' | ContractorType>('Todos');
  const [contractorStatusFilter, setContractorStatusFilter] = useState<'Todos' | ContractorStatus>('Todos');

  // Filters for Asignación de Trabajo
  const [workSearch, setWorkSearch] = useState('');
  const [workProjectFilter, setWorkProjectFilter] = useState<string>('Todos');
  const [weldingStatusFilter, setWeldingStatusFilter] = useState<string>('Todos');
  const [paintingStatusFilter, setPaintingStatusFilter] = useState<string>('Todos');

  // Deactivate confirmation modal state
  const [contractorToToggle, setContractorToToggle] = useState<Contractor | null>(null);

  // User permissions
  const isAdmin = currentUserRole === 'Administrador';
  const isProduction = currentUserRole === 'Producción';
  const isQC = currentUserRole === 'Inspector QC';
  const canModifyContractors = isAdmin;
  const canAssignWork = isAdmin || isProduction;

  // Derived metrics
  const totalContractors = contractors.length;
  const activeContractors = contractors.filter(c => c.status === 'Activo').length;
  const totalWelders = contractors.filter(c => c.type === 'Soldador').length;
  const totalPainters = contractors.filter(c => c.type === 'Pintor').length;

  const beamsInWelding = pieces.filter(p => p.weldingStatus === 'En proceso' || p.weldingStatus === 'Asignado').length;
  const beamsWeldingDone = pieces.filter(p => p.weldingStatus === 'Completado').length;
  const beamsInPainting = pieces.filter(p => p.paintingStatus === 'En proceso' || p.paintingStatus === 'Asignado').length;
  const beamsPaintingDone = pieces.filter(p => p.paintingStatus === 'Completado').length;
  const beamsUnassigned = pieces.filter(p => !p.welderId && !p.painterId).length;

  // Filtered Contractors
  const filteredContractors = useMemo(() => {
    return contractors.filter(c => {
      const matchesSearch = !contractorSearch || 
        c.name.toLowerCase().includes(contractorSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(contractorSearch.toLowerCase()) ||
        c.phone.includes(contractorSearch) ||
        (c.identification && c.identification.includes(contractorSearch));

      const matchesType = contractorTypeFilter === 'Todos' || c.type === contractorTypeFilter;
      const matchesStatus = contractorStatusFilter === 'Todos' || c.status === contractorStatusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [contractors, contractorSearch, contractorTypeFilter, contractorStatusFilter]);

  // Unique projects from pieces
  const projectsList = useMemo(() => {
    const set = new Set<string>();
    pieces.forEach(p => set.add(p.project));
    return Array.from(set);
  }, [pieces]);

  // Filtered Pieces for Work Assignment
  const filteredPieces = useMemo(() => {
    return pieces.filter(p => {
      const matchesSearch = !workSearch ||
        p.mark.toLowerCase().includes(workSearch.toLowerCase()) ||
        p.profile.toLowerCase().includes(workSearch.toLowerCase()) ||
        (p.welderName && p.welderName.toLowerCase().includes(workSearch.toLowerCase())) ||
        (p.painterName && p.painterName.toLowerCase().includes(workSearch.toLowerCase()));

      const matchesProject = workProjectFilter === 'Todos' || p.project === workProjectFilter;
      const matchesWelding = weldingStatusFilter === 'Todos' || p.weldingStatus === weldingStatusFilter;
      const matchesPainting = paintingStatusFilter === 'Todos' || p.paintingStatus === paintingStatusFilter;

      return matchesSearch && matchesProject && matchesWelding && matchesPainting;
    });
  }, [pieces, workSearch, workProjectFilter, weldingStatusFilter, paintingStatusFilter]);

  const handleExportContractors = () => {
    playFeedbackSound('click');
    const rows = filteredContractors.map(c => ({
      ID: c.id,
      Nombre: c.name,
      Tipo: c.type,
      Telefono: c.phone,
      Correo: c.email,
      DNI: c.identification || '',
      Estado: c.status,
      VigasAsignadas: c.assignedPiecesCount,
      VigasCompletadas: c.completedPiecesCount,
      FechaRegistro: c.createdAt
    }));
    exportToCSV('Listado_Contratistas_Alanza', rows);
  };

  const handleExportAssignments = () => {
    playFeedbackSound('click');
    const rows = filteredPieces.map(p => ({
      Marca: p.mark,
      Proyecto: p.project,
      Perfil: p.profile,
      Peso_kg: p.weight,
      Soldador: p.welderName || 'Sin asignar',
      EstadoSoldadura: p.weldingStatus || 'Pendiente',
      FechaAsigSoldadura: p.weldingAssignedDate || '',
      Pintor: p.painterName || 'Sin asignar',
      EstadoPintura: p.paintingStatus || 'Pendiente',
      FechaAsigPintura: p.paintingAssignedDate || '',
      EstadoQC: p.qcStatus
    }));
    exportToCSV('Asignaciones_Trabajo_Vigas', rows);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl border border-[#c3c6d7] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-semibold text-[#004ac6] uppercase tracking-wider mb-1">
            <HardHat className="w-4 h-4" />
            <span>Módulo de Operaciones y Fabricación</span>
          </div>
          <h1 className="text-[22px] md:text-[24px] font-bold text-[#151c27] tracking-tight">
            Contratistas y Asignación de Trabajo
          </h1>
          <p className="text-[13px] text-[#555f6f] mt-0.5">
            Administración de soldadores y pintores, asignación de vigas y trazabilidad directa con Control de Calidad (QC).
          </p>
        </div>

        {/* Action Buttons based on role */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {canModifyContractors && (
            <button
              id="new-contractor-btn"
              onClick={() => {
                playFeedbackSound('click');
                setEditingContractor(null);
                setIsNewContractorModalOpen(true);
              }}
              className="px-4 py-2.5 bg-[#004ac6] hover:bg-[#003896] text-white font-semibold text-[13px] rounded-xl shadow-xs transition-all flex items-center gap-2 active:scale-98"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Nuevo Contratista</span>
            </button>
          )}

          {canAssignWork && (
            <button
              id="assign-work-btn"
              onClick={() => {
                playFeedbackSound('click');
                setSelectedPieceForAssignment(null);
                setIsAssignWorkModalOpen(true);
              }}
              className="px-4 py-2.5 bg-[#f0f3ff] hover:bg-[#e2e8f8] border border-[#004ac6] text-[#004ac6] font-semibold text-[13px] rounded-xl transition-all flex items-center gap-2 active:scale-98"
            >
              <Layers className="w-4 h-4" />
              <span>+ Asignar Trabajo</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-[#c3c6d7] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#555f6f] uppercase tracking-wider">
              Contratistas Activos
            </span>
            <Users className="w-4 h-4 text-[#004ac6]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-[#151c27]">
              {activeContractors}
            </span>
            <span className="text-[11px] text-[#737686]">
              de {totalContractors} totales
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#555f6f] flex items-center gap-2">
            <span>{totalWelders} Soldadores</span>
            <span>•</span>
            <span>{totalPainters} Pintores</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#c3c6d7] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
              Soldadura en Proceso
            </span>
            <span className="material-symbols-outlined text-[18px] text-[#004ac6]">build</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-[#004ac6]">
              {beamsInWelding}
            </span>
            <span className="text-[11px] text-[#737686]">vigas</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-semibold">
            {beamsWeldingDone} completadas
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#c3c6d7] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">
              Pintura en Proceso
            </span>
            <Paintbrush className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-purple-700">
              {beamsInPainting}
            </span>
            <span className="text-[11px] text-[#737686]">vigas</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-semibold">
            {beamsPaintingDone} completadas
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#c3c6d7] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              Vigas Sin Asignar
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-amber-700">
              {beamsUnassigned}
            </span>
            <span className="text-[11px] text-[#737686]">pendientes</span>
          </div>
          <div className="mt-2 text-[11px] text-[#737686]">
            requieren soldador o pintor
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#c3c6d7] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#555f6f] uppercase tracking-wider">
              Perfil Operativo
            </span>
            <ShieldCheck className="w-4 h-4 text-[#004ac6]" />
          </div>
          <div className="mt-2">
            <span className="text-[16px] font-bold text-[#151c27] block truncate">
              {currentUserRole}
            </span>
            <span className="text-[11px] text-[#737686]">
              {isAdmin ? 'Acceso total y reasignaciones' : isProduction ? 'Asignación de órdenes' : 'Solo lectura QC y auditoría'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Sub-Navigation Bar */}
      <div className="flex border-b border-[#c3c6d7] gap-3">
        <button
          id="tab-sub-contratistas"
          onClick={() => { playFeedbackSound('click'); setActiveSubTab('listado'); }}
          className={`pb-3 px-3.5 font-bold text-[14px] flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === 'listado'
              ? 'border-[#004ac6] text-[#004ac6]'
              : 'border-transparent text-[#555f6f] hover:text-[#151c27]'
          }`}
        >
          <HardHat className="w-4 h-4" />
          <span>Gestión de Contratistas</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#f0f3ff] text-[#004ac6] font-semibold">
            {contractors.length}
          </span>
        </button>

        <button
          id="tab-sub-asignacion"
          onClick={() => { playFeedbackSound('click'); setActiveSubTab('asignacion'); }}
          className={`pb-3 px-3.5 font-bold text-[14px] flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === 'asignacion'
              ? 'border-[#004ac6] text-[#004ac6]'
              : 'border-transparent text-[#555f6f] hover:text-[#151c27]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Asignación de Trabajo a Vigas</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-blue-100 text-blue-800 font-semibold">
            {pieces.length}
          </span>
        </button>

        <button
          id="tab-sub-indicadores"
          onClick={() => { playFeedbackSound('click'); setActiveSubTab('indicadores'); }}
          className={`pb-3 px-3.5 font-bold text-[14px] flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === 'indicadores'
              ? 'border-[#004ac6] text-[#004ac6]'
              : 'border-transparent text-[#555f6f] hover:text-[#151c27]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard y Rendimiento</span>
        </button>
      </div>

      {/* SUBTAB 1: GESTIÓN DE CONTRATISTAS */}
      {activeSubTab === 'listado' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-[#c3c6d7] flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              {/* Search input */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]" />
                <input
                  type="text"
                  placeholder="Buscar contratista por nombre, teléfono, DNI..."
                  value={contractorSearch}
                  onChange={(e) => setContractorSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 text-[13px] bg-[#f9fafb] border border-[#c3c6d7] rounded-lg text-[#151c27] focus:border-[#004ac6] focus:bg-white outline-none"
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#555f6f] uppercase">Tipo:</span>
                <select
                  value={contractorTypeFilter}
                  onChange={(e) => setContractorTypeFilter(e.target.value as any)}
                  className="h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-[13px] text-[#151c27] focus:border-[#004ac6] outline-none"
                >
                  <option value="Todos">Todos</option>
                  <option value="Soldador">Soldador</option>
                  <option value="Pintor">Pintor</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#555f6f] uppercase">Estado:</span>
                <select
                  value={contractorStatusFilter}
                  onChange={(e) => setContractorStatusFilter(e.target.value as any)}
                  className="h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-[13px] text-[#151c27] focus:border-[#004ac6] outline-none"
                >
                  <option value="Todos">Todos</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleExportContractors}
              className="h-10 px-3.5 bg-white hover:bg-slate-50 border border-[#c3c6d7] text-[#434655] font-semibold text-[12px] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-[#004ac6]" />
              <span>Exportar CSV</span>
            </button>
          </div>

          {/* Contractors Table */}
          <div className="bg-white rounded-xl border border-[#c3c6d7] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[850px] text-[13px]">
                <thead>
                  <tr className="bg-[#f9fafb] border-b border-[#c3c6d7] text-[11px] font-bold text-[#434655] uppercase tracking-wider">
                    <th className="py-3 px-4">Contratista</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Contacto</th>
                    <th className="py-3 px-4">DNI / Identificación</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Vigas Asignadas</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f8]">
                  {filteredContractors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#737686]">
                        <HardHat className="w-8 h-8 text-[#737686] mx-auto mb-2 opacity-40" />
                        <p className="font-semibold">No se encontraron contratistas con los filtros seleccionados.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredContractors.map((c) => {
                      const isWelder = c.type === 'Soldador';
                      const isActive = c.status === 'Activo';

                      return (
                        <tr key={c.id} className="hover:bg-[#f8faff] transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-[#151c27]">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-[11px] ${
                                isWelder ? 'bg-[#2563eb]' : 'bg-[#7c3aed]'
                              }`}>
                                {c.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="block leading-tight text-[13px]">{c.name}</span>
                                <span className="block text-[11px] text-[#737686] font-normal">{c.id}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isWelder ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              <span className="material-symbols-outlined text-[13px]">
                                {isWelder ? 'build' : 'format_paint'}
                              </span>
                              <span>{c.type}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-[#555f6f]">
                            <div className="leading-tight">
                              <span className="block font-medium text-[#151c27]">{c.phone}</span>
                              <span className="block text-[11px] text-[#737686]">{c.email}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-[12px] text-[#555f6f]">
                            {c.identification || '-'}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {c.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-bold text-[#151c27]">{c.assignedPiecesCount}</span>
                              <span className="text-[11px] text-[#737686]">
                                ({c.completedPiecesCount} completadas)
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Ver Historial de Vigas */}
                              <button
                                onClick={() => {
                                  playFeedbackSound('click');
                                  setSelectedContractorForHistory(c);
                                }}
                                title="Ver vigas asignadas y trazabilidad QC"
                                className="p-1.5 text-[#004ac6] hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Editar Contratista (Solo Admin) */}
                              {canModifyContractors && (
                                <button
                                  onClick={() => {
                                    playFeedbackSound('click');
                                    setEditingContractor(c);
                                    setIsNewContractorModalOpen(true);
                                  }}
                                  title="Editar contratista"
                                  className="p-1.5 text-[#555f6f] hover:text-[#151c27] hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}

                              {/* Activar / Desactivar (Solo Admin) */}
                              {canModifyContractors && (
                                <button
                                  onClick={() => {
                                    playFeedbackSound('click');
                                    setContractorToToggle(c);
                                  }}
                                  title={isActive ? 'Desactivar contratista' : 'Activar contratista'}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    isActive 
                                      ? 'text-red-600 hover:bg-red-50' 
                                      : 'text-emerald-600 hover:bg-emerald-50'
                                  }`}
                                >
                                  <Power className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: ASIGNACIÓN DE TRABAJO A VIGAS */}
      {activeSubTab === 'asignacion' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-[#c3c6d7] flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              {/* Search input */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]" />
                <input
                  type="text"
                  placeholder="Buscar viga (marca 2S-37A, perfil, soldador, pintor)..."
                  value={workSearch}
                  onChange={(e) => setWorkSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 text-[13px] bg-[#f9fafb] border border-[#c3c6d7] rounded-lg text-[#151c27] focus:border-[#004ac6] focus:bg-white outline-none"
                />
              </div>

              {/* Project Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#555f6f] uppercase">Proyecto:</span>
                <select
                  value={workProjectFilter}
                  onChange={(e) => setWorkProjectFilter(e.target.value)}
                  className="h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-[13px] text-[#151c27] focus:border-[#004ac6] outline-none"
                >
                  <option value="Todos">Todos</option>
                  {projectsList.map(proj => (
                    <option key={proj} value={proj}>{proj}</option>
                  ))}
                </select>
              </div>

              {/* Welding Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#555f6f] uppercase">Soldadura:</span>
                <select
                  value={weldingStatusFilter}
                  onChange={(e) => setWeldingStatusFilter(e.target.value)}
                  className="h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-[13px] text-[#151c27] focus:border-[#004ac6] outline-none"
                >
                  <option value="Todos">Todos</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Asignado">Asignado</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Completado">Completado</option>
                </select>
              </div>

              {/* Painting Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#555f6f] uppercase">Pintura:</span>
                <select
                  value={paintingStatusFilter}
                  onChange={(e) => setPaintingStatusFilter(e.target.value)}
                  className="h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-[13px] text-[#151c27] focus:border-[#004ac6] outline-none"
                >
                  <option value="Todos">Todos</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Asignado">Asignado</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Completado">Completado</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleExportAssignments}
              className="h-10 px-3.5 bg-white hover:bg-slate-50 border border-[#c3c6d7] text-[#434655] font-semibold text-[12px] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-[#004ac6]" />
              <span>Exportar CSV</span>
            </button>
          </div>

          {/* Work Assignment Table */}
          <div className="bg-white rounded-xl border border-[#c3c6d7] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[950px] text-[13px]">
                <thead>
                  <tr className="bg-[#f9fafb] border-b border-[#c3c6d7] text-[11px] font-bold text-[#434655] uppercase tracking-wider">
                    <th className="py-3 px-4">Marca Viga</th>
                    <th className="py-3 px-4">Proyecto</th>
                    <th className="py-3 px-4">Perfil / Peso</th>
                    <th className="py-3 px-4">Soldador Asignado</th>
                    <th className="py-3 px-4">Pintor Asignado</th>
                    <th className="py-3 px-4">Trazabilidad QC</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f8]">
                  {filteredPieces.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#737686]">
                        <Layers className="w-8 h-8 text-[#737686] mx-auto mb-2 opacity-40" />
                        <p className="font-semibold">No se encontraron vigas con los criterios de búsqueda.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPieces.map((piece) => {
                      const hasWelder = !!piece.welderId;
                      const hasPainter = !!piece.painterId;
                      const hasHistory = piece.assignmentHistory && piece.assignmentHistory.length > 0;

                      return (
                        <tr key={piece.id} className="hover:bg-[#f8faff] transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-[#151c27] block">
                              {piece.mark}
                            </span>
                            <span className="text-[11px] text-[#737686]">
                              ID: {piece.id}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-medium text-[#151c27] block">
                              {piece.project}
                            </span>
                            <span className="text-[11px] text-[#737686]">
                              Colada: {piece.heatNumber}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-mono text-[#151c27] block">
                              {piece.profile}
                            </span>
                            <span className="text-[11px] text-[#737686] font-mono">
                              {piece.weight} kg
                            </span>
                          </td>

                          {/* Soldador Asignado */}
                          <td className="py-3 px-4">
                            {hasWelder ? (
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-[#151c27]">{piece.welderName}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    piece.weldingStatus === 'Completado' 
                                      ? 'bg-emerald-100 text-emerald-800' 
                                      : piece.weldingStatus === 'En proceso' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {piece.weldingStatus || 'Asignado'}
                                  </span>
                                  <span className="text-[10px] text-[#737686] font-mono">
                                    {piece.weldingAssignedDate}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 text-amber-700 text-[11px] font-semibold">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Sin soldador
                              </span>
                            )}
                          </td>

                          {/* Pintor Asignado */}
                          <td className="py-3 px-4">
                            {hasPainter ? (
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-[#151c27]">{piece.painterName}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    piece.paintingStatus === 'Completado' 
                                      ? 'bg-emerald-100 text-emerald-800' 
                                      : piece.paintingStatus === 'En proceso' 
                                        ? 'bg-purple-100 text-purple-800' 
                                        : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {piece.paintingStatus || 'Asignado'}
                                  </span>
                                  <span className="text-[10px] text-[#737686] font-mono">
                                    {piece.paintingAssignedDate}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 text-amber-700 text-[11px] font-semibold">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Sin pintor
                              </span>
                            )}
                          </td>

                          {/* Trazabilidad QC */}
                          <td className="py-3 px-4">
                            <div>
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                piece.qcStatus === 'Aprobada'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : piece.qcStatus === 'Rechazada'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                              }`}>
                                QC: {piece.qcStatus}
                              </span>
                              {hasHistory && (
                                <span className="block text-[10px] text-[#004ac6] mt-0.5 font-semibold">
                                  {piece.assignmentHistory?.length} reasignaciones
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Acciones */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Asignar / Reasignar Trabajo */}
                              <button
                                onClick={() => {
                                  playFeedbackSound('click');
                                  setSelectedPieceForAssignment(piece);
                                  setIsAssignWorkModalOpen(true);
                                }}
                                title={isAdmin ? "Asignar o reasignar contratista" : "Asignar contratista"}
                                className="px-2.5 py-1 bg-[#004ac6] hover:bg-[#003896] text-white font-semibold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                              >
                                <span>{hasWelder || hasPainter ? 'Gestionar' : 'Asignar'}</span>
                              </button>

                              {/* Ver Trazabilidad */}
                              <button
                                onClick={() => {
                                  playFeedbackSound('click');
                                  setSelectedPieceForTraceability(piece);
                                }}
                                title="Ver trazabilidad completa de la pieza"
                                className="p-1.5 text-[#004ac6] hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <History className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: INDICADORES Y RENDIMIENTO */}
      {activeSubTab === 'indicadores' && (
        <div className="space-y-6">
          {/* Top Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Welders Performance */}
            <div className="bg-white p-5 rounded-2xl border border-[#c3c6d7] shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f8]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#004ac6] flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[18px]">build</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] text-[#151c27]">Rendimiento de Soldadores</h3>
                    <p className="text-[11px] text-[#737686]">Vigas asignadas, en proceso y completadas</p>
                  </div>
                </div>
                <span className="text-[12px] font-bold text-[#004ac6]">
                  {contractors.filter(c => c.type === 'Soldador').length} Soldadores
                </span>
              </div>

              <div className="mt-4 divide-y divide-[#e2e8f8]">
                {contractors.filter(c => c.type === 'Soldador').map((c) => {
                  const contractorPieces = pieces.filter(p => p.welderId === c.id);
                  const completed = contractorPieces.filter(p => p.weldingStatus === 'Completado').length;
                  const inProg = contractorPieces.filter(p => p.weldingStatus === 'En proceso' || p.weldingStatus === 'Asignado').length;
                  const percent = contractorPieces.length > 0 ? Math.round((completed / contractorPieces.length) * 100) : 0;

                  return (
                    <div key={c.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[13px] text-[#151c27] truncate">{c.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.status === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                        <div className="mt-1.5 w-full h-1.5 bg-[#e2e8f8] rounded-full overflow-hidden">
                          <div 
                            className="bg-[#004ac6] h-full rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-[13px] text-[#151c27] block">
                          {completed} / {contractorPieces.length} pzs
                        </span>
                        <span className="text-[11px] text-[#737686]">
                          {percent}% completado ({inProg} activas)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Painters Performance */}
            <div className="bg-white p-5 rounded-2xl border border-[#c3c6d7] shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f8]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Paintbrush className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] text-[#151c27]">Rendimiento de Pintores</h3>
                    <p className="text-[11px] text-[#737686]">Vigas asignadas, en proceso y completadas</p>
                  </div>
                </div>
                <span className="text-[12px] font-bold text-purple-700">
                  {contractors.filter(c => c.type === 'Pintor').length} Pintores
                </span>
              </div>

              <div className="mt-4 divide-y divide-[#e2e8f8]">
                {contractors.filter(c => c.type === 'Pintor').map((c) => {
                  const contractorPieces = pieces.filter(p => p.painterId === c.id);
                  const completed = contractorPieces.filter(p => p.paintingStatus === 'Completado').length;
                  const inProg = contractorPieces.filter(p => p.paintingStatus === 'En proceso' || p.paintingStatus === 'Asignado').length;
                  const percent = contractorPieces.length > 0 ? Math.round((completed / contractorPieces.length) * 100) : 0;

                  return (
                    <div key={c.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[13px] text-[#151c27] truncate">{c.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.status === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                        <div className="mt-1.5 w-full h-1.5 bg-[#e2e8f8] rounded-full overflow-hidden">
                          <div 
                            className="bg-purple-600 h-full rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-[13px] text-[#151c27] block">
                          {completed} / {contractorPieces.length} pzs
                        </span>
                        <span className="text-[11px] text-[#737686]">
                          {percent}% completado ({inProg} activas)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Audit Trail & Business Rules Summary Card */}
          <div className="bg-[#f0f3ff] p-5 rounded-2xl border border-[#dbe1ff] space-y-3">
            <h4 className="font-bold text-[14px] text-[#004ac6] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              <span>Reglas de Trazabilidad y Seguridad de Fabricación Alanza</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[12px] text-[#434655]">
              <div className="p-3 bg-white rounded-xl border border-[#e2e8f8]">
                <strong className="block text-[#151c27] mb-1">Preservación de Historial:</strong>
                Los contratistas inactivos nunca se eliminan de la base de datos para garantizar la validez legal y técnica de los certificados de calidad entregados a los clientes.
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#e2e8f8]">
                <strong className="block text-[#151c27] mb-1">Control de Reasignaciones:</strong>
                Cualquier cambio de soldador o pintor en una viga ya asignada requiere justificación obligatoria y autorización de Administración para evitar duplicidad.
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#e2e8f8]">
                <strong className="block text-[#151c27] mb-1">Auditoría QC Directa:</strong>
                Los inspectores de control de calidad auditan las piezas directamente enlazadas con los contratistas ejecutores para emisión de hojas de ruta y liberación de embarque.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deactivating Contractor */}
      {contractorToToggle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#c3c6d7] shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                contractorToToggle.status === 'Activo' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                <Power className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[16px] text-[#151c27]">
                  {contractorToToggle.status === 'Activo' ? '¿Desactivar Contratista?' : '¿Activar Contratista?'}
                </h3>
                <p className="text-[12px] text-[#555f6f]">
                  {contractorToToggle.name} ({contractorToToggle.type})
                </p>
              </div>
            </div>

            <p className="text-[13px] text-[#434655]">
              {contractorToToggle.status === 'Activo' ? (
                <>
                  El contratista pasará a estado <strong>Inactivo</strong>. No estará disponible para nuevas asignaciones, pero <strong>sus vigas y liberaciones QC históricas se mantendrán intactas</strong> en cumplimiento de las normas de trazabilidad.
                </>
              ) : (
                <>
                  El contratista volverá a estar disponible en las listas de selección para asignación de nuevos trabajos de {contractorToToggle.type.toLowerCase()}.
                </>
              )}
            </p>

            <div className="pt-3 border-t border-[#e2e8f8] flex items-center justify-end gap-2.5">
              <button
                onClick={() => setContractorToToggle(null)}
                className="px-4 py-2 bg-white border border-[#c3c6d7] text-[#434655] hover:bg-slate-100 font-semibold text-[13px] rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  toggleContractorStatus(contractorToToggle.id);
                  playFeedbackSound('click');
                  setContractorToToggle(null);
                }}
                className={`px-4 py-2 font-semibold text-[13px] rounded-lg text-white shadow-xs transition-colors ${
                  contractorToToggle.status === 'Activo' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {contractorToToggle.status === 'Activo' ? 'Confirmar Desactivación' : 'Confirmar Activación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
