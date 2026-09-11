import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Truck, 
  AlertCircle, 
  BarChart3,
  Layers,
  ArrowUpRight,
  History,
  Edit3,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Clock,
  RotateCcw,
  QrCode,
  Eye,
  ExternalLink,
  Printer
} from 'lucide-react';
import { findShipmentForPiece } from '../../utils/qrCodeHelper';
import { Piece } from '../../types';

interface FlattenedPieceModification {
  pieceId: string;
  pieceMark: string;
  pieceProfile: string;
  pieceType: string;
  pieceProject: string;
  pieceRefId: string;
  piece: Piece;
  modId: string;
  date: string;
  timestamp: number;
  user: string;
  userRole?: string;
  field: string;
  previousValue: string;
  newValue: string;
  reason?: string;
}

export const ReportsView: React.FC = () => {
  const { 
    exportToCSV, 
    pieces, 
    shipments, 
    projects,
    setSelectedPieceForDetail,
    setSelectedPieceForHistoryModal,
    setSelectedPieceForQR,
    playFeedbackSound,
    showToast
  } = useApp();

  const [selectedProject, setSelectedProject] = useState('Todos los proyectos');
  const [selectedPeriod, setSelectedPeriod] = useState('Últimos 30 días');
  const [reportType, setReportType] = useState('General de Avance');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'modifications' | 'documents'>('overview');

  // Specific filters for the modifications table
  const [modSearchTerm, setModSearchTerm] = useState('');
  const [modFieldFilter, setModFieldFilter] = useState('Todos los campos');

  const handleExportPDF = () => {
    if (playFeedbackSound) playFeedbackSound('click');
    window.print();
  };

  // Compile all piece modifications across all pieces
  const allModifications = useMemo(() => {
    const list: FlattenedPieceModification[] = [];
    pieces.forEach(p => {
      if (p.modificationHistory && p.modificationHistory.length > 0) {
        p.modificationHistory.forEach(m => {
          list.push({
            pieceId: p.id,
            pieceMark: p.mark,
            pieceProfile: p.profile,
            pieceType: p.type,
            pieceProject: p.project,
            pieceRefId: p.refId,
            piece: p,
            modId: m.id,
            date: m.date,
            timestamp: m.timestamp || 0,
            user: m.user,
            userRole: m.userRole,
            field: m.field,
            previousValue: m.previousValue,
            newValue: m.newValue,
            reason: m.reason
          });
        });
      }
    });
    // Sort descending by timestamp or date
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [pieces]);

  // Unique fields in modification history for filter dropdown
  const uniqueModifiedFields = useMemo(() => {
    const fields = new Set<string>();
    allModifications.forEach(m => {
      if (m.field) fields.add(m.field);
    });
    return Array.from(fields);
  }, [allModifications]);

  // Filtered modifications based on active filters
  const filteredModifications = useMemo(() => {
    return allModifications.filter(m => {
      // Project filter
      if (selectedProject !== 'Todos los proyectos' && m.pieceProject !== selectedProject) {
        return false;
      }

      // Field filter
      if (modFieldFilter !== 'Todos los campos' && m.field !== modFieldFilter) {
        return false;
      }

      // Search term
      if (modSearchTerm.trim()) {
        const query = modSearchTerm.toLowerCase();
        const matchesMark = m.pieceMark.toLowerCase().includes(query);
        const matchesProfile = m.pieceProfile.toLowerCase().includes(query);
        const matchesUser = m.user.toLowerCase().includes(query);
        const matchesField = m.field.toLowerCase().includes(query);
        const matchesReason = (m.reason || '').toLowerCase().includes(query);
        const matchesPrev = m.previousValue.toLowerCase().includes(query);
        const matchesNew = m.newValue.toLowerCase().includes(query);

        if (!matchesMark && !matchesProfile && !matchesUser && !matchesField && !matchesReason && !matchesPrev && !matchesNew) {
          return false;
        }
      }

      return true;
    });
  }, [allModifications, selectedProject, modFieldFilter, modSearchTerm]);

  // Metrics for modifications
  const piecesWithModificationsCount = useMemo(() => {
    const set = new Set<string>();
    allModifications.forEach(m => set.add(m.pieceId));
    return set.size;
  }, [allModifications]);

  const mostModifiedField = useMemo(() => {
    if (allModifications.length === 0) return 'Ninguno';
    const counts: Record<string, number> = {};
    allModifications.forEach(m => {
      counts[m.field] = (counts[m.field] || 0) + 1;
    });
    let topField = '';
    let topCount = 0;
    Object.entries(counts).forEach(([field, count]) => {
      if (count > topCount) {
        topCount = count;
        topField = field;
      }
    });
    return topField || 'Varios';
  }, [allModifications]);

  // Export modifications to CSV
  const handleExportModificationsCSV = () => {
    if (playFeedbackSound) playFeedbackSound('click');
    exportToCSV(`Reporte_Modificaciones_Piezas_${selectedProject.replace(/\s+/g, '_')}`, filteredModifications.map(m => ({
      Fecha_Hora: m.date,
      Pieza_Marca: m.pieceMark,
      Perfil: m.pieceProfile,
      Tipo_Elemento: m.pieceType,
      Proyecto: m.pieceProject,
      Pase_Salida: m.pieceRefId !== '-' ? m.pieceRefId : 'En Planta',
      Campo_Modificado: m.field,
      Valor_Anterior: m.previousValue,
      Valor_Nuevo: m.newValue,
      Usuario_Responsable: m.user,
      Rol: m.userRole || 'Admin / Producción',
      Justificacion_Motivo: m.reason || 'Sin justificación especificada'
    })));
  };

  const isShowingModifications = reportType === 'Modificaciones de Piezas' || activeSubTab === 'modifications';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[26px] md:text-[30px] font-bold text-[#151c27] tracking-tight font-['Inter'] flex items-center gap-2.5">
            <span>Reportes & Analítica</span>
            {allModifications.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-blue-50 text-[#004ac6] border border-blue-200">
                <History className="w-3.5 h-3.5" />
                {allModifications.length} cambios registrados
              </span>
            )}
          </h1>
          <p className="text-[14px] text-[#434655] mt-1">
            Métricas operacionales, trazabilidad, control de calidad y auditoría de modificaciones de piezas.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {isShowingModifications ? (
            <button
              onClick={handleExportModificationsCSV}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#c3c6d7] rounded-lg text-[#151c27] font-semibold text-[13px] hover:bg-[#f0f3ff] transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#004ac6]" />
              <span>Exportar Bitácora Modificaciones (CSV)</span>
            </button>
          ) : (
            <button
              onClick={() => exportToCSV('Reporte_General_Alanza', pieces.map(p => ({
                Marca: p.mark,
                Tipo: p.type,
                Perfil: p.profile,
                Proyecto: p.project,
                Estado: p.status,
                QC_Estado: p.qcStatus,
                Peso_kg: p.weightKg
              })))}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#c3c6d7] rounded-lg text-[#151c27] font-semibold text-[13px] hover:bg-[#f0f3ff] transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#004ac6]" />
              <span>Exportar CSV / Excel</span>
            </button>
          )}

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-[#004ac6] text-white rounded-lg font-semibold text-[13px] hover:bg-[#2563eb] transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-[#c3c6d7] gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            setActiveSubTab('overview');
            if (reportType === 'Modificaciones de Piezas') {
              setReportType('General de Avance');
            }
          }}
          className={`flex items-center gap-2 py-2.5 px-4 text-[13px] font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === 'overview' && reportType !== 'Modificaciones de Piezas'
              ? 'border-[#004ac6] text-[#004ac6]'
              : 'border-transparent text-[#555f6f] hover:text-[#151c27]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Curva de Avance & KPIs</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('modifications');
            setReportType('Modificaciones de Piezas');
          }}
          className={`flex items-center gap-2 py-2.5 px-4 text-[13px] font-semibold border-b-2 transition-all whitespace-nowrap ${
            isShowingModifications
              ? 'border-[#004ac6] text-[#004ac6]'
              : 'border-transparent text-[#555f6f] hover:text-[#151c27]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Reporte de Modificaciones de Piezas</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
            isShowingModifications ? 'bg-[#004ac6] text-white' : 'bg-[#e2e8f8] text-[#555f6f]'
          }`}>
            {allModifications.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('documents');
            if (reportType === 'Modificaciones de Piezas') {
              setReportType('General de Avance');
            }
          }}
          className={`flex items-center gap-2 py-2.5 px-4 text-[13px] font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === 'documents' && reportType !== 'Modificaciones de Piezas'
              ? 'border-[#004ac6] text-[#004ac6]'
              : 'border-transparent text-[#555f6f] hover:text-[#151c27]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Informes Ejecutivos & Archivos</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#c3c6d7] flex flex-wrap gap-3 items-center justify-between shadow-xs">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-[11px] font-bold text-[#434655] uppercase">Proyecto</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="h-9 px-3 bg-white border border-[#c3c6d7] focus:border-[#004ac6] rounded-lg text-[13px] text-[#151c27] outline-none cursor-pointer"
            >
              <option value="Todos los proyectos">Todos los proyectos</option>
              {projects.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-[11px] font-bold text-[#434655] uppercase">Periodo</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="h-9 px-3 bg-white border border-[#c3c6d7] focus:border-[#004ac6] rounded-lg text-[13px] text-[#151c27] outline-none cursor-pointer"
            >
              <option value="Últimos 7 días">Últimos 7 días</option>
              <option value="Últimos 30 días">Últimos 30 días</option>
              <option value="Este Trimestre (Q4)">Este Trimestre (Q4)</option>
              <option value="Año en Curso (2023-2024)">Año en Curso</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[220px]">
            <label className="text-[11px] font-bold text-[#434655] uppercase">Tipo de Reporte</label>
            <select
              value={reportType}
              onChange={(e) => {
                const val = e.target.value;
                setReportType(val);
                if (val === 'Modificaciones de Piezas') {
                  setActiveSubTab('modifications');
                } else {
                  setActiveSubTab('overview');
                }
              }}
              className="h-9 px-3 bg-white border border-[#c3c6d7] focus:border-[#004ac6] rounded-lg text-[13px] text-[#151c27] outline-none cursor-pointer font-medium"
            >
              <option value="General de Avance">General de Avance</option>
              <option value="Modificaciones de Piezas">Modificaciones de Piezas (Bitácora de Cambios)</option>
              <option value="Rendimiento QC">Rendimiento QC e Inspecciones</option>
              <option value="Cumplimiento de Envíos">Cumplimiento Logístico y Envíos</option>
              <option value="Auditoría de Trazabilidad">Auditoría de Trazabilidad</option>
            </select>
          </div>
        </div>

        {/* Quick info tag */}
        <div className="text-right hidden md:block">
          <span className="text-[11px] text-[#737686] block">Total piezas registradas</span>
          <span className="text-[15px] font-mono font-bold text-[#151c27]">{pieces.length} piezas</span>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 1. DEDICATED REPORT: MODIFICACIONES DE PIEZAS (BITÁCORA DE CAMBIOS)    */}
      {/* ======================================================================= */}
      {isShowingModifications && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Modification Metrics Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#c3c6d7] rounded-xl p-4.5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#555f6f] uppercase">Piezas Modificadas</span>
                <span className="p-2 rounded-lg bg-blue-50 text-[#004ac6]">
                  <Edit3 className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[26px] font-bold text-[#151c27] font-mono">{piecesWithModificationsCount}</span>
                <span className="text-[12px] text-[#555f6f]">
                  de {pieces.length} ({pieces.length > 0 ? ((piecesWithModificationsCount / pieces.length) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <p className="text-[11px] text-[#737686] mt-1">Con cambios registrados en bitácora</p>
            </div>

            <div className="bg-white border border-[#c3c6d7] rounded-xl p-4.5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#555f6f] uppercase">Total de Eventos</span>
                <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <History className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[26px] font-bold text-indigo-700 font-mono">{allModifications.length}</span>
                <span className="text-[12px] text-emerald-600 font-medium">100% auditados</span>
              </div>
              <p className="text-[11px] text-[#737686] mt-1">Modificaciones en marcas, planos y cotas</p>
            </div>

            <div className="bg-white border border-[#c3c6d7] rounded-xl p-4.5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#555f6f] uppercase">Parámetro Más Modificado</span>
                <span className="p-2 rounded-lg bg-amber-50 text-amber-700">
                  <Layers className="w-4 h-4" />
                </span>
              </div>
              <div className="text-[18px] font-bold text-[#151c27] truncate">
                {mostModifiedField}
              </div>
              <p className="text-[11px] text-[#737686] mt-1">Mayor frecuencia en revisiones de ingeniería</p>
            </div>

            <div className="bg-white border border-[#c3c6d7] rounded-xl p-4.5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#555f6f] uppercase">Último Cambio</span>
                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="text-[14px] font-bold text-[#151c27] truncate">
                {allModifications[0]?.date || 'Sin registros'}
              </div>
              <p className="text-[11px] text-[#737686] mt-1 truncate">
                Por: {allModifications[0]?.user || '-'}
              </p>
            </div>
          </div>

          {/* Modifications Table Card */}
          <div className="bg-white border border-[#c3c6d7] rounded-xl overflow-hidden shadow-xs">
            {/* Table Header & Search Filter */}
            <div className="p-4 border-b border-[#c3c6d7] bg-[#f9fafb] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h3 className="font-bold text-[16px] text-[#151c27] flex items-center gap-2">
                  <History className="w-4 h-4 text-[#004ac6]" />
                  <span>Bitácora Oficial de Modificaciones Técnicas</span>
                </h3>
                <p className="text-[12px] text-[#555f6f]">
                  Mostrando {filteredModifications.length} de {allModifications.length} modificaciones registradas
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                {/* Search Box */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]" />
                  <input
                    type="text"
                    value={modSearchTerm}
                    onChange={(e) => setModSearchTerm(e.target.value)}
                    placeholder="Buscar pieza, usuario o motivo..."
                    className="w-full h-8 pl-8 pr-3 bg-white border border-[#c3c6d7] focus:border-[#004ac6] rounded-lg text-[12px] text-[#151c27] outline-none"
                  />
                  {modSearchTerm && (
                    <button 
                      onClick={() => setModSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#737686] hover:text-[#151c27]"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter by modified field */}
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#555f6f]" />
                  <select
                    value={modFieldFilter}
                    onChange={(e) => setModFieldFilter(e.target.value)}
                    className="h-8 px-2.5 bg-white border border-[#c3c6d7] focus:border-[#004ac6] rounded-lg text-[12px] text-[#151c27] outline-none cursor-pointer"
                  >
                    <option value="Todos los campos">Todos los campos</option>
                    {uniqueModifiedFields.map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleExportModificationsCSV}
                  className="flex items-center gap-1.5 px-3 h-8 bg-white border border-[#c3c6d7] hover:border-[#004ac6] hover:bg-[#f0f3ff] rounded-lg text-[#151c27] font-semibold text-[12px] transition-colors"
                  title="Exportar a CSV"
                >
                  <Download className="w-3.5 h-3.5 text-[#004ac6]" />
                  <span className="hidden sm:inline">Exportar</span>
                </button>
              </div>
            </div>

            {/* Table Content */}
            {filteredModifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-[#f0f3ff] text-[#004ac6] mx-auto flex items-center justify-center mb-3">
                  <History className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-[15px] text-[#151c27]">No se encontraron modificaciones</h4>
                <p className="text-[13px] text-[#555f6f] mt-1 max-w-md mx-auto">
                  {modSearchTerm || modFieldFilter !== 'Todos los campos' || selectedProject !== 'Todos los proyectos'
                    ? 'No hay registros que coincidan con los filtros seleccionados. Intenta restablecer los filtros de búsqueda.'
                    : 'Aún no se han registrado modificaciones en las piezas. Cuando un operador o administrador edite una pieza, los cambios aparecerán aquí automáticamente.'}
                </p>
                {(modSearchTerm || modFieldFilter !== 'Todos los campos' || selectedProject !== 'Todos los proyectos') && (
                  <button
                    onClick={() => {
                      setModSearchTerm('');
                      setModFieldFilter('Todos los campos');
                      setSelectedProject('Todos los proyectos');
                    }}
                    className="mt-4 px-3.5 py-1.5 bg-[#f0f3ff] text-[#004ac6] border border-blue-200 rounded-lg text-[12px] font-semibold hover:bg-blue-100 transition-colors inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restablecer Filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="bg-[#f0f3ff] text-[#434655] text-[11px] font-bold uppercase tracking-wider border-b border-[#c3c6d7]">
                      <th className="py-3 px-4">Fecha / Hora</th>
                      <th className="py-3 px-4">Pieza / Marca</th>
                      <th className="py-3 px-4">Campo Modificado</th>
                      <th className="py-3 px-4 min-w-[240px]">Valor Anterior → Valor Nuevo</th>
                      <th className="py-3 px-4">Usuario / Rol</th>
                      <th className="py-3 px-4 min-w-[200px]">Motivo / Justificación</th>
                      <th className="py-3 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f8]">
                    {filteredModifications.map((m) => {
                      const shipment = findShipmentForPiece(m.piece, shipments);
                      const hasPass = Boolean(shipment || (m.pieceRefId && m.pieceRefId !== '-' && m.pieceRefId.startsWith('ENV-')));

                      return (
                        <tr key={m.modId} className="hover:bg-[#f8faff] transition-colors">
                          {/* Date */}
                          <td className="py-3.5 px-4 font-mono text-[12px] text-[#555f6f] whitespace-nowrap">
                            <span className="font-semibold text-[#151c27] block">{m.date}</span>
                            <span className="text-[10px] text-[#737686]">Auditoría #{m.modId.slice(-6)}</span>
                          </td>

                          {/* Piece */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#004ac6] font-mono text-[13px] hover:underline cursor-pointer"
                                  onClick={() => setSelectedPieceForDetail(m.piece)}
                                >
                                  {m.pieceMark}
                                </span>
                                {hasPass && (
                                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200" title={`Pase: ${m.pieceRefId}`}>
                                    Pase
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-[#555f6f]">{m.pieceProfile} • {m.pieceType}</span>
                              <span className="text-[10px] text-[#737686]">{m.pieceProject}</span>
                            </div>
                          </td>

                          {/* Field */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#eef2ff] text-[#3730a3] border border-indigo-100">
                              <Edit3 className="w-3 h-3 text-indigo-500" />
                              {m.field}
                            </span>
                          </td>

                          {/* Diff */}
                          <td className="py-3.5 px-4 font-mono text-[12px]">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 line-through border border-rose-200 text-[11px]" title="Valor anterior">
                                {m.previousValue}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-[#737686] shrink-0" />
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]" title="Valor nuevo">
                                {m.newValue}
                              </span>
                            </div>
                          </td>

                          {/* User & Role */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-100 text-[#004ac6] flex items-center justify-center font-bold text-[11px]">
                                {m.user.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-medium text-[#151c27] block text-[12px]">{m.user}</span>
                                <span className="text-[10px] text-[#737686]">{m.userRole || 'Operador'}</span>
                              </div>
                            </div>
                          </td>

                          {/* Reason */}
                          <td className="py-3.5 px-4">
                            <p className="text-[12px] text-[#434655] italic">
                              "{m.reason || 'Sin justificación técnica especificada'}"
                            </p>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedPieceForDetail(m.piece)}
                                className="p-1.5 hover:bg-[#eef2ff] text-[#555f6f] hover:text-[#004ac6] rounded-md transition-colors"
                                title="Ver Ficha Técnica de la Pieza"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSelectedPieceForHistoryModal(m.piece)}
                                className="p-1.5 hover:bg-[#eef2ff] text-[#555f6f] hover:text-[#004ac6] rounded-md transition-colors"
                                title="Historial Completo de esta Pieza"
                              >
                                <History className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSelectedPieceForQR(m.piece)}
                                className="p-1.5 hover:bg-[#eef2ff] text-[#555f6f] hover:text-[#004ac6] rounded-md transition-colors"
                                title="Ver Código QR"
                              >
                                <QrCode className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer with summary */}
            <div className="p-3.5 border-t border-[#c3c6d7] bg-[#f9fafb] flex flex-col sm:flex-row justify-between items-center text-[12px] text-[#555f6f] gap-2">
              <span>
                Auditoría certificada bajo protocolo de control interno AISC / Alanza Metalhn.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportModificationsCSV}
                  className="text-[#004ac6] font-semibold hover:underline flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Descargar bitácora completa en Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 2. OVERVIEW & ADVANCED ANALYTICS (CURVA DE AVANCE & KPIS)              */}
      {/* ======================================================================= */}
      {activeSubTab === 'overview' && reportType !== 'Modificaciones de Piezas' && (
        <div className="space-y-6">
          {/* Analytics Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Progress Timeline Chart (8 cols) */}
            <div className="lg:col-span-8 bg-white border border-[#c3c6d7] rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-[16px] text-[#151c27]">
                    Curva de Fabricación y Despacho vs Plan
                  </h3>
                  <p className="text-[12px] text-[#555f6f]">
                    Toneladas de acero producidas vs cronograma maestro
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-semibold">
                  <span className="flex items-center gap-1.5 text-[#004ac6]">
                    <span className="w-3 h-3 rounded-sm bg-[#004ac6]" /> Planificado
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <span className="w-3 h-3 rounded-sm bg-emerald-500" /> Fabricado
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-600">
                    <span className="w-3 h-3 rounded-sm bg-amber-500" /> Despachado
                  </span>
                </div>
              </div>

              {/* Bar Chart Visualization */}
              <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-[#e2e8f8]">
                {[
                  { month: 'Sem 1', plan: 140, fab: 135, ship: 120 },
                  { month: 'Sem 2', plan: 160, fab: 168, ship: 155 },
                  { month: 'Sem 3', plan: 180, fab: 175, ship: 160 },
                  { month: 'Sem 4', plan: 210, fab: 220, ship: 195 },
                  { month: 'Sem 5', plan: 240, fab: 230, ship: 210 },
                  { month: 'Sem 6', plan: 260, fab: 275, ship: 250 },
                ].map((d) => (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1 h-48">
                      {/* Plan bar */}
                      <div 
                        style={{ height: `${(d.plan / 300) * 100}%` }}
                        className="w-1/4 bg-[#e2e8f8] hover:bg-[#cdd7ee] rounded-t transition-all"
                        title={`Plan: ${d.plan} Ton`}
                      />
                      {/* Fab bar */}
                      <div 
                        style={{ height: `${(d.fab / 300) * 100}%` }}
                        className="w-1/4 bg-[#004ac6] hover:bg-[#2563eb] rounded-t transition-all"
                        title={`Fabricado: ${d.fab} Ton`}
                      />
                      {/* Ship bar */}
                      <div 
                        style={{ height: `${(d.ship / 300) * 100}%` }}
                        className="w-1/4 bg-amber-500 hover:bg-amber-600 rounded-t transition-all"
                        title={`Despachado: ${d.ship} Ton`}
                      />
                    </div>
                    <span className="text-[11px] font-mono font-medium text-[#555f6f]">{d.month}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-3 text-[12px] text-[#555f6f]">
                <span>Cumplimiento del Plan Maestro: <strong className="text-emerald-700 font-bold">102.4%</strong></span>
                <span>Tonelaje Total Acumulado: <strong className="text-[#151c27] font-bold">1,203 Ton</strong></span>
              </div>
            </div>

            {/* Piece Status Breakdown (4 cols) */}
            <div className="lg:col-span-4 bg-white border border-[#c3c6d7] rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-[16px] text-[#151c27]">
                  Estado General de Piezas
                </h3>
                <p className="text-[12px] text-[#555f6f] mb-4">
                  Total: {pieces.length} piezas en catálogo
                </p>

                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-[12px] mb-1">
                      <span className="font-medium text-[#151c27]">Fabricadas (Aprobadas QC)</span>
                      <span className="font-mono font-bold text-[#004ac6]">
                        {pieces.filter(p => p.status === 'Fabricada').length} (
                        {pieces.length > 0 ? Math.round((pieces.filter(p => p.status === 'Fabricada').length / pieces.length) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#e2e8f8] rounded-full overflow-hidden">
                      <div className="h-full bg-[#004ac6]" style={{ width: `${pieces.length > 0 ? (pieces.filter(p => p.status === 'Fabricada').length / pieces.length) * 100 : 0}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[12px] mb-1">
                      <span className="font-medium text-[#151c27]">En Tránsito / Despachadas</span>
                      <span className="font-mono font-bold text-amber-600">
                        {pieces.filter(p => p.status === 'Enviada').length} (
                        {pieces.length > 0 ? Math.round((pieces.filter(p => p.status === 'Enviada').length / pieces.length) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#e2e8f8] rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${pieces.length > 0 ? (pieces.filter(p => p.status === 'Enviada').length / pieces.length) * 100 : 0}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[12px] mb-1">
                      <span className="font-medium text-[#151c27]">Recibidas en Campo (Montaje)</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {pieces.filter(p => p.status === 'Recibida').length} (
                        {pieces.length > 0 ? Math.round((pieces.filter(p => p.status === 'Recibida').length / pieces.length) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#e2e8f8] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600" style={{ width: `${pieces.length > 0 ? (pieces.filter(p => p.status === 'Recibida').length / pieces.length) * 100 : 0}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[12px] mb-1">
                      <span className="font-medium text-[#151c27]">Con Modificaciones Registradas</span>
                      <span className="font-mono font-bold text-indigo-700">
                        {piecesWithModificationsCount} (
                        {pieces.length > 0 ? Math.round((piecesWithModificationsCount / pieces.length) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#e2e8f8] rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600" style={{ width: `${pieces.length > 0 ? (piecesWithModificationsCount / pieces.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#f0f3ff] rounded-lg mt-4 text-[12px] text-[#434655]">
                💡 El 97% de las piezas cumplen con el estándar AISC sin desviaciones mayores.
              </div>
            </div>
          </div>

          {/* Quick Preview Card: Piece Modifications Widget */}
          <div className="bg-white border border-[#c3c6d7] rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-3 border-b border-[#e2e8f8]">
              <div>
                <h4 className="font-bold text-[16px] text-[#151c27] flex items-center gap-2">
                  <History className="w-4 h-4 text-[#004ac6]" />
                  <span>Actividad Reciente: Modificaciones de Piezas</span>
                </h4>
                <p className="text-[12px] text-[#555f6f]">
                  Últimos cambios técnicos realizados en marcas, dimensiones, planos y especificaciones.
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveSubTab('modifications');
                  setReportType('Modificaciones de Piezas');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f0f3ff] hover:bg-[#e0e7ff] text-[#004ac6] rounded-lg font-semibold text-[12px] transition-colors"
              >
                <span>Ver Reporte Completo ({allModifications.length})</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {allModifications.length === 0 ? (
              <p className="text-[13px] text-[#555f6f] py-4 text-center">
                No hay modificaciones registradas recientemente.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allModifications.slice(0, 4).map((m) => (
                  <div 
                    key={m.modId} 
                    className="p-3.5 bg-[#fbfcfe] border border-[#e2e8f8] hover:border-blue-300 rounded-lg transition-colors flex flex-col justify-between gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedPieceForDetail(m.piece)}
                            className="font-bold text-[#004ac6] font-mono text-[13px] hover:underline"
                          >
                            {m.pieceMark}
                          </button>
                          <span className="text-[11px] text-[#555f6f] font-medium">{m.pieceProject}</span>
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {m.field}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#737686] font-mono">{m.date}</span>
                    </div>

                    <div className="text-[12px] font-mono flex items-center gap-1.5 flex-wrap">
                      <span className="line-through text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded text-[11px]">
                        {m.previousValue}
                      </span>
                      <ArrowRight className="w-3 h-3 text-[#737686]" />
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                        {m.newValue}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] pt-1 text-[#737686] border-t border-[#f0f3ff]">
                      <span className="truncate max-w-[200px]">Por: {m.user}</span>
                      <button
                        onClick={() => setSelectedPieceForHistoryModal(m.piece)}
                        className="text-[#004ac6] font-semibold hover:underline flex items-center gap-1"
                      >
                        Historial <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* KPI Performance Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-[#c3c6d7] p-5 rounded-xl shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-[15px] text-[#151c27]">Indicadores de Calidad QC</h4>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-[#f0f3ff] rounded-lg">
                  <span className="text-[11px] text-[#555f6f] block uppercase font-bold">1ra Pasada</span>
                  <span className="text-[20px] font-bold text-emerald-700">96.4%</span>
                </div>
                <div className="p-3 bg-[#f0f3ff] rounded-lg">
                  <span className="text-[11px] text-[#555f6f] block uppercase font-bold">Tiempo Insp.</span>
                  <span className="text-[20px] font-bold text-[#004ac6]">14 min</span>
                </div>
                <div className="p-3 bg-[#f0f3ff] rounded-lg">
                  <span className="text-[11px] text-[#555f6f] block uppercase font-bold">Rechazos</span>
                  <span className="text-[20px] font-bold text-[#ba1a1a]">18</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#c3c6d7] p-5 rounded-xl shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-5 h-5 text-[#004ac6]" />
                <h4 className="font-bold text-[15px] text-[#151c27]">Eficiencia de Transporte</h4>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-[#f0f3ff] rounded-lg">
                  <span className="text-[11px] text-[#555f6f] block uppercase font-bold">A Tiempo</span>
                  <span className="text-[20px] font-bold text-emerald-700">94.2%</span>
                </div>
                <div className="p-3 bg-[#f0f3ff] rounded-lg">
                  <span className="text-[11px] text-[#555f6f] block uppercase font-bold">Carga Total</span>
                  <span className="text-[20px] font-bold text-[#151c27]">1,420 T</span>
                </div>
                <div className="p-3 bg-[#f0f3ff] rounded-lg">
                  <span className="text-[11px] text-[#555f6f] block uppercase font-bold">Descarga Med.</span>
                  <span className="text-[20px] font-bold text-amber-700">42 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 3. GENERATED REPORTS & EXECUTIVE ARCHIVES                               */}
      {/* ======================================================================= */}
      {(activeSubTab === 'documents' || activeSubTab === 'overview') && (
        <div className="bg-white border border-[#c3c6d7] rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#c3c6d7] bg-[#f9fafb] flex justify-between items-center">
            <h3 className="font-bold text-[15px] text-[#151c27] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#004ac6]" />
              <span>Informes Ejecutivos & Bitácoras Generadas</span>
            </h3>
            <span className="text-[12px] text-[#555f6f]">Actualizado automáticamente cada 24h</span>
          </div>
          <div className="divide-y divide-[#e2e8f8]">
            {[
              { 
                name: 'Bitácora Oficial de Modificaciones Técnicas de Piezas', 
                date: 'Hoy', 
                size: `${Math.max(1, Number((allModifications.length * 0.15).toFixed(1)))} MB`, 
                type: 'CSV / Excel',
                action: handleExportModificationsCSV 
              },
              { 
                name: 'Reporte Semanal de Avance - Torre Mítica', 
                date: '27 Oct 2023', 
                size: '2.4 MB', 
                type: 'PDF',
                action: () => {
                  showToast('Generando Reporte Semanal de Avance (PDF)...', 'info');
                  if (playFeedbackSound) playFeedbackSound('click');
                }
              },
              { 
                name: 'Certificados de Calidad Coladas de Acero Q4', 
                date: '25 Oct 2023', 
                size: '8.1 MB', 
                type: 'ZIP',
                action: () => {
                  showToast('Comprimiendo Certificados de Calidad Coladas Q4 (ZIP)...', 'info');
                  if (playFeedbackSound) playFeedbackSound('click');
                }
              },
              { 
                name: 'Manifiestos de Carga y Recepción en Obra Mhotivo', 
                date: '24 Oct 2023', 
                size: '1.2 MB', 
                type: 'PDF',
                action: () => {
                  showToast('Exportando Manifiestos de Carga y Recepción en Obra...', 'info');
                  if (playFeedbackSound) playFeedbackSound('click');
                }
              },
              { 
                name: 'Balance Mensual de Inventarios y Merma de Planta', 
                date: '20 Oct 2023', 
                size: '940 KB', 
                type: 'XLSX',
                action: () => {
                  showToast('Calculando Balance Mensual de Inventarios y Merma...', 'info');
                  if (playFeedbackSound) playFeedbackSound('click');
                }
              },
            ].map((r, i) => (
              <div key={i} className="p-3.5 flex items-center justify-between hover:bg-[#f0f3ff] transition-colors text-[13px]">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#004ac6]" />
                  <div>
                    <span className="font-medium text-[#151c27] block">{r.name}</span>
                    <span className="text-[11px] text-[#737686]">{r.date} • {r.size} • Formato {r.type}</span>
                  </div>
                </div>
                <button 
                  onClick={r.action}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#c3c6d7] hover:border-[#004ac6] hover:bg-[#f0f3ff] rounded-lg text-[#151c27] font-semibold text-[12px] transition-colors shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#004ac6]" />
                  <span>Descargar</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
