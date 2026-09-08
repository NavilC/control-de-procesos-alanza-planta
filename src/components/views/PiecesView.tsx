import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Piece } from '../../types';
import { 
  Plus, 
  Search, 
  Filter, 
  RotateCcw, 
  Eye, 
  GitCommit, 
  MoreVertical,
  Calendar,
  Layers,
  CheckSquare,
  AlertTriangle,
  Download,
  CheckCircle2,
  Truck,
  Grid,
  List,
  SlidersHorizontal,
  X,
  Edit3,
  History,
  ShieldAlert
} from 'lucide-react';
import { playFeedbackSound } from '../../utils/audioFeedback';

export const PiecesView: React.FC = () => {
  const { 
    pieces, 
    setIsNewPieceModalOpen, 
    setIsNewShipmentModalOpen,
    setSelectedPieceForTraceability,
    setSelectedPieceForDetail,
    setSelectedPieceForEdit,
    setIsEditPieceModalOpen,
    setSelectedPieceForHistoryModal,
    currentUserRole,
    selectedProjectFilter,
    globalSearch,
    exportToCSV,
    batchPerformQCInspection,
    batchUpdatePieceStatus
  } = useApp();

  const [searchFilter, setSearchFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState(selectedProjectFilter || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedPieces, setSelectedPieces] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'compact' | 'cards'>('table');
  const [batchActionSuccessMsg, setBatchActionSuccessMsg] = useState<string | null>(null);

  // Sync with global project filter when changed from top navbar
  useEffect(() => {
    if (selectedProjectFilter) {
      setProjectFilter(selectedProjectFilter);
    }
  }, [selectedProjectFilter]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    playFeedbackSound('click');
    if (e.target.checked) {
      setSelectedPieces(filteredPieces.map(p => p.id));
    } else {
      setSelectedPieces([]);
    }
  };

  const handleToggleSelectPiece = (id: string) => {
    playFeedbackSound('click');
    if (selectedPieces.includes(id)) {
      setSelectedPieces(selectedPieces.filter(pId => pId !== id));
    } else {
      setSelectedPieces([...selectedPieces, id]);
    }
  };

  const handleResetFilters = () => {
    playFeedbackSound('click');
    setSearchFilter('');
    setProjectFilter('');
    setStatusFilter('');
    setTypeFilter('');
  };

  const handleBatchQCApprove = () => {
    if (selectedPieces.length === 0) return;
    batchPerformQCInspection(selectedPieces, 'Aprobada', 'Liberación en lote desde Control de Piezas');
    playFeedbackSound('success');
    setBatchActionSuccessMsg(`¡${selectedPieces.length} piezas aprobadas en Control de Calidad!`);
    setSelectedPieces([]);
    setTimeout(() => setBatchActionSuccessMsg(null), 4000);
  };

  const handleBatchSetStatus = (status: any) => {
    if (selectedPieces.length === 0) return;
    batchUpdatePieceStatus(selectedPieces, status);
    playFeedbackSound('success');
    setBatchActionSuccessMsg(`Estado actualizado a "${status}" para ${selectedPieces.length} piezas.`);
    setSelectedPieces([]);
    setTimeout(() => setBatchActionSuccessMsg(null), 4000);
  };

  const handleBatchExport = () => {
    const selectedData = pieces.filter(p => selectedPieces.includes(p.id));
    exportToCSV('Seleccion_Piezas_Alanza', selectedData.map(p => ({
      Marca: p.mark,
      Tipo: p.type,
      Perfil: p.profile,
      Longitud_m: p.lengthMeters,
      Peso_kg: p.weightKg,
      Proyecto: p.project,
      Estado: p.status,
      Estado_QC: p.qcStatus,
      Parametros_Especiales: p.type === 'Joist' && p.camberMm ? `CF: ${p.camberMm} mm` : (p.type === 'Placa' && p.plateWidthMm ? `${p.plateWidthMm}x${p.plateHeightMm}mm (Ø${p.holeDiameterMm || ''}mm)` : (p.type === 'Punta roscada' && p.rodLengthMm ? `L:${p.rodLengthMm}mm, Rosca:${p.threadLengthMm || ''}mm` : (p.type === 'Pernos' && p.boltLengthMm ? `L:${p.boltLengthMm}mm, R1:${p.threadLength1Mm || ''}mm, R2:${p.threadLength2Mm || ''}mm` : '-'))),
      Ref: p.refId
    })));
    playFeedbackSound('success');
  };

  const filteredPieces = pieces.filter(p => {
    const term = (searchFilter || globalSearch).toLowerCase();
    const matchesSearch = 
      p.mark.toLowerCase().includes(term) ||
      p.profile.toLowerCase().includes(term) ||
      p.refId.toLowerCase().includes(term) ||
      p.project.toLowerCase().includes(term);
    const matchesProject = !projectFilter || p.project.toLowerCase() === projectFilter.toLowerCase();
    const matchesStatus = !statusFilter || p.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = !typeFilter || p.type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesProject && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-5 pb-16 animate-in fade-in duration-200 relative">
      {/* Success Notification Banner */}
      {batchActionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-emerald-800 text-[13px] font-medium shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{batchActionSuccessMsg}</span>
          </div>
          <button onClick={() => setBatchActionSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[26px] md:text-[30px] font-bold text-[#151c27] tracking-tight font-['Inter']">
              Control de Piezas
            </h1>
            {projectFilter && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#dbe1ff] text-[#002b75] border border-[#adc6ff]">
                {projectFilter}
              </span>
            )}
          </div>
          <p className="text-[14px] text-[#434655] mt-0.5">
            Gestión de fabricación, control dimensional y trazabilidad de marcas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-[#f0f3ff] p-1 rounded-lg border border-[#dce2f3] text-[12px]">
            <button
              onClick={() => { setViewMode('table'); playFeedbackSound('click'); }}
              className={`p-1.5 rounded flex items-center gap-1 transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-xs text-[#004ac6] font-bold' : 'text-[#555f6f] hover:text-[#151c27]'
              }`}
              title="Vista de tabla completa"
            >
              <List className="w-3.5 h-3.5" />
              <span>Estándar</span>
            </button>
            <button
              onClick={() => { setViewMode('compact'); playFeedbackSound('click'); }}
              className={`p-1.5 rounded flex items-center gap-1 transition-colors ${
                viewMode === 'compact' ? 'bg-white shadow-xs text-[#004ac6] font-bold' : 'text-[#555f6f] hover:text-[#151c27]'
              }`}
              title="Vista densa para taller rápido"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Densa</span>
            </button>
            <button
              onClick={() => { setViewMode('cards'); playFeedbackSound('click'); }}
              className={`p-1.5 rounded flex items-center gap-1 transition-colors ${
                viewMode === 'cards' ? 'bg-white shadow-xs text-[#004ac6] font-bold' : 'text-[#555f6f] hover:text-[#151c27]'
              }`}
              title="Vista de fichas técnicas"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Tarjetas</span>
            </button>
          </div>

          <button
            onClick={() => exportToCSV('Catalogo_Piezas_Alanza', filteredPieces.map(p => ({
              Marca: p.mark,
              Tipo: p.type,
              Perfil: p.profile,
              Longitud_m: p.lengthMeters,
              Peso_kg: p.weightKg,
              Proyecto: p.project,
              Estado: p.status,
              Estado_QC: p.qcStatus,
              Parametros_Especiales: p.type === 'Joist' && p.camberMm ? `CF: ${p.camberMm} mm` : (p.type === 'Placa' && p.plateWidthMm ? `${p.plateWidthMm}x${p.plateHeightMm}mm (Ø${p.holeDiameterMm || ''}mm)` : (p.type === 'Punta roscada' && p.rodLengthMm ? `L:${p.rodLengthMm}mm, Rosca:${p.threadLengthMm || ''}mm` : (p.type === 'Pernos' && p.boltLengthMm ? `L:${p.boltLengthMm}mm, R1:${p.threadLength1Mm || ''}mm, R2:${p.threadLength2Mm || ''}mm` : '-'))),
              Ref: p.refId
            })))}
            className="bg-white border border-[#c3c6d7] text-[#151c27] hover:bg-[#f0f3ff] text-[13px] font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-[#004ac6]" />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          <button
            id="modify-piece-top-btn"
            onClick={() => {
              playFeedbackSound('click');
              if (selectedPieces.length > 0) {
                const p = pieces.find(x => x.id === selectedPieces[0]);
                if (p) {
                  setSelectedPieceForEdit(p);
                  setIsEditPieceModalOpen(true);
                  return;
                }
              }
              if (filteredPieces.length > 0) {
                setSelectedPieceForEdit(filteredPieces[0]);
              } else if (pieces.length > 0) {
                setSelectedPieceForEdit(pieces[0]);
              }
              setIsEditPieceModalOpen(true);
            }}
            className="bg-white border border-[#004ac6] text-[#004ac6] hover:bg-[#f0f3ff] text-[13px] font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            title="Modificar los datos técnicos de una pieza"
          >
            <Edit3 className="w-4 h-4 text-[#004ac6]" />
            <span>Modificar pieza</span>
          </button>

          <button
            id="new-piece-btn"
            onClick={() => setIsNewPieceModalOpen(true)}
            className="bg-[#004ac6] text-white hover:bg-[#2563eb] text-[13px] font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Pieza</span>
          </button>
        </div>
      </div>

      {/* Batch Actions Floating Bar (when items are selected) */}
      {selectedPieces.length > 0 && (
        <div className="sticky top-20 z-20 bg-[#151c27] text-white rounded-xl p-3.5 px-4 shadow-xl border border-slate-700 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-3">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#004ac6] text-white text-[12px] font-bold flex items-center justify-center">
              {selectedPieces.length}
            </span>
            <span className="text-[13px] font-semibold text-slate-200">
              Piezas seleccionadas
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedPieces.length === 1 && (
              <button
                onClick={() => {
                  const p = pieces.find(x => x.id === selectedPieces[0]);
                  if (p) {
                    playFeedbackSound('click');
                    setSelectedPieceForEdit(p);
                    setIsEditPieceModalOpen(true);
                  }
                }}
                className="px-3 py-1.5 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                title="Modificar pieza seleccionada"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Modificar pieza</span>
              </button>
            )}

            <button
              onClick={handleBatchQCApprove}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Aprobar QC para todas las piezas marcadas"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Aprobar QC en Lote</span>
            </button>

            <button
              onClick={() => {
                setIsNewShipmentModalOpen(true);
                playFeedbackSound('click');
              }}
              className="px-3 py-1.5 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Crear remisión de carga con las piezas seleccionadas"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Asignar a Envío</span>
            </button>

            <button
              onClick={() => handleBatchSetStatus('Fabricada')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-[12px] font-medium transition-colors"
            >
              Marcar Fabricadas
            </button>

            <button
              onClick={handleBatchExport}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-[12px] font-medium flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>

            <button
              onClick={() => {
                setSelectedPieces([]);
                playFeedbackSound('click');
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
              title="Deseleccionar todas"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-xl border border-[#c3c6d7] p-3.5 sm:p-4 flex flex-wrap gap-3 items-center shadow-xs">
        {/* Search */}
        <div className="flex-1 min-w-[240px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737686] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Buscar marca (2S-37A), perfil, tipo o ID..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#f0f3ff] border border-[#c3c6d7] text-[13px] text-[#151c27] placeholder:text-[#737686] focus:border-[#004ac6] focus:bg-white outline-none transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="h-10 px-3 rounded-lg bg-white border border-[#c3c6d7] text-[13px] text-[#151c27] focus:border-[#004ac6] outline-none cursor-pointer min-w-[140px]"
          >
            <option value="">Proyecto (Todos)</option>
            <option value="Mhotivo">Mhotivo</option>
            <option value="Torre A">Torre A</option>
            <option value="Torre Mítica">Torre Mítica</option>
            <option value="Nave Industrial Alfa">Nave Industrial Alfa</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg bg-white border border-[#c3c6d7] text-[13px] text-[#151c27] focus:border-[#004ac6] outline-none cursor-pointer min-w-[130px]"
          >
            <option value="">Estado (Todos)</option>
            <option value="Fabricada">Fabricada</option>
            <option value="Enviada">Enviada</option>
            <option value="Recibida">Recibida</option>
            <option value="Incidencia">Incidencia</option>
            <option value="Pendiente">Pendiente</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 px-3 rounded-lg bg-white border border-[#c3c6d7] text-[13px] text-[#151c27] focus:border-[#004ac6] outline-none cursor-pointer min-w-[120px]"
          >
            <option value="">Tipo (Todos)</option>
            <option value="Viga">Viga</option>
            <option value="Columna">Columna</option>
            <option value="Riostra">Riostra</option>
            <option value="Placa Base">Placa Base</option>
            <option value="Tirante">Tirante</option>
          </select>

          <button
            onClick={handleResetFilters}
            className="h-10 w-10 rounded-lg bg-white flex items-center justify-center text-[#737686] hover:text-[#151c27] border border-[#c3c6d7] hover:bg-[#f0f3ff] transition-colors"
            title="Limpiar filtros"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Conditional Views */}
      {viewMode === 'cards' ? (
        /* Cards Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPieces.map((piece) => {
            const isSelected = selectedPieces.includes(piece.id);
            return (
              <div
                key={piece.id}
                onClick={() => setSelectedPieceForDetail(piece)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all shadow-xs relative ${
                  isSelected ? 'border-[#004ac6] ring-2 ring-[#004ac6]/30' : 'border-[#c3c6d7] hover:border-[#004ac6]'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => handleToggleSelectPiece(piece.id)}
                      className="rounded border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6] h-4 w-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-mono font-black text-[16px] text-[#151c27] block">
                        {piece.mark}
                      </span>
                      <span className="text-[11px] text-[#555f6f]">{piece.type}</span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    piece.status === 'Recibida' ? 'bg-emerald-100 text-emerald-800' :
                    piece.status === 'Enviada' ? 'bg-orange-100 text-orange-800' :
                    piece.status === 'Incidencia' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {piece.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-[12px] bg-[#f9fafb] p-2.5 rounded-lg border border-[#e2e8f8] mb-3">
                  <div className="flex justify-between">
                    <span className="text-[#737686]">Perfil:</span>
                    <span className="font-mono font-bold text-[#151c27]">{piece.profile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#737686]">Longitud:</span>
                    <span className="font-mono text-[#151c27]">
                      {piece.type === 'Pernos' && piece.boltLengthMm ? `${piece.boltLengthMm} mm` : `${piece.lengthMeters} m`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#737686]">Peso:</span>
                    <span className="font-mono text-[#151c27]">{piece.weightKg} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#737686]">QC:</span>
                    <span className={`font-bold ${piece.qcStatus === 'Aprobada' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {piece.qcStatus}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f8] text-[11px]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playFeedbackSound('click');
                        setSelectedPieceForEdit(piece);
                        setIsEditPieceModalOpen(true);
                      }}
                      className="text-[#004ac6] font-bold hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modificar pieza</span>
                    </button>
                    {piece.modificationHistory && piece.modificationHistory.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playFeedbackSound('click');
                          setSelectedPieceForHistoryModal(piece);
                        }}
                        className="text-amber-800 font-semibold hover:underline flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200"
                        title="Ver historial de modificaciones"
                      >
                        <History className="w-3 h-3 text-amber-700" />
                        <span>{piece.modificationHistory.length}</span>
                      </button>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPieceForTraceability(piece);
                    }}
                    className="text-[#555f6f] font-bold hover:text-[#004ac6] flex items-center gap-1"
                  >
                    <GitCommit className="w-3.5 h-3.5" />
                    <span>Línea de Vida</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table Mode (Standard & Compact) */
        <div className="bg-white border border-[#c3c6d7] rounded-xl overflow-hidden flex flex-col shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-[#f9fafb] sticky top-0 z-10 border-b border-[#c3c6d7]">
                <tr>
                  <th className={`${viewMode === 'compact' ? 'py-2 px-2.5' : 'py-3 px-3.5'} text-[11px] font-bold text-[#434655] uppercase tracking-wider w-10 text-center`}>
                    <input
                      type="checkbox"
                      checked={selectedPieces.length === filteredPieces.length && filteredPieces.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6] h-4 w-4 cursor-pointer"
                    />
                  </th>
                  <th className={`${viewMode === 'compact' ? 'py-2 px-2.5' : 'py-3 px-3.5'} text-[11px] font-bold text-[#434655] uppercase tracking-wider`}>
                    Marca
                  </th>
                  <th className={`${viewMode === 'compact' ? 'py-2 px-2.5' : 'py-3 px-3.5'} text-[11px] font-bold text-[#434655] uppercase tracking-wider`}>
                    Tipo
                  </th>
                  <th className={`${viewMode === 'compact' ? 'py-2 px-2.5' : 'py-3 px-3.5'} text-[11px] font-bold text-[#434655] uppercase tracking-wider`}>
                    Perfil
                  </th>
                  <th className={`${viewMode === 'compact' ? 'py-2 px-2.5' : 'py-3 px-3.5'} text-[11px] font-bold text-[#434655] uppercase tracking-wider`}>
                    Dimensiones
                  </th>
                  <th className={`${viewMode === 'compact' ? 'py-2 px-2.5' : 'py-3 px-3.5'} text-[11px] font-bold text-[#434655] uppercase tracking-wider`}>
                    Proyecto
                  </th>
                  <th className={`${viewMode === 'compact' ? 'py-2 px-2.5' : 'py-3 px-3.5'} text-[11px] font-bold text-[#434655] uppercase tracking-wider`}>
                    Estado
                  </th>
                  <th className={`${viewMode === 'compact' ? 'py-2 px-2.5' : 'py-3 px-3.5'} text-[11px] font-bold text-[#434655] uppercase tracking-wider`}>
                    Estado QC
                  </th>
                  <th className={`${viewMode === 'compact' ? 'py-2 px-2.5' : 'py-3 px-3.5'} text-[11px] font-bold text-[#434655] uppercase tracking-wider`}>
                    ID Ref
                  </th>
                  <th className={`${viewMode === 'compact' ? 'py-2 px-2.5' : 'py-3 px-3.5'} text-[11px] font-bold text-[#434655] uppercase tracking-wider w-56 text-right`}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-[#e2e8f8] ${viewMode === 'compact' ? 'text-[12px]' : 'text-[13px]'}`}>
                {filteredPieces.map((piece) => {
                  const isSelected = selectedPieces.includes(piece.id);
                  return (
                    <tr
                      key={piece.id}
                      className={`hover:bg-[#f3f4f6] transition-colors group cursor-pointer ${
                        isSelected ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <td className={`${viewMode === 'compact' ? 'py-1.5 px-2.5' : 'py-2.5 px-3.5'} text-center`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectPiece(piece.id)}
                          className="rounded border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6] h-4 w-4 cursor-pointer"
                        />
                      </td>
                      <td className={`${viewMode === 'compact' ? 'py-1.5 px-2.5' : 'py-2.5 px-3.5'}`}>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[#151c27]">{piece.mark}</span>
                          {piece.modificationHistory && piece.modificationHistory.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playFeedbackSound('click');
                                setSelectedPieceForHistoryModal(piece);
                              }}
                              className="px-1.5 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
                              title={`Pieza modificada (${piece.modificationHistory.length} cambios). Clic para ver historial.`}
                            >
                              <History className="w-2.5 h-2.5 text-amber-700" />
                              <span>{piece.modificationHistory.length}</span>
                            </button>
                          )}
                        </div>
                        {piece.description && (
                          <span className="text-[11px] text-[#555f6f] block truncate max-w-[190px]" title={piece.description}>
                            {piece.description}
                          </span>
                        )}
                      </td>
                      <td className={`${viewMode === 'compact' ? 'py-1.5 px-2.5' : 'py-2.5 px-3.5'} text-[#151c27]`}>
                        <span className="font-semibold">{piece.type}</span>
                        {piece.type === 'Joist' && piece.camberMm !== undefined && (
                          <span className="text-[10px] text-[#004ac6] block font-mono font-bold">CF: {piece.camberMm} mm</span>
                        )}
                        {piece.type === 'Punta roscada' && piece.rodLengthMm !== undefined && (
                          <span className="text-[10px] text-amber-800 block font-mono">L:{piece.rodLengthMm} | R:{piece.threadLengthMm || 0}mm</span>
                        )}
                        {piece.type === 'Pernos' && piece.boltLengthMm !== undefined && (
                          <span className="text-[10px] text-purple-800 block font-mono">L:{piece.boltLengthMm} (R:{piece.threadLength1Mm || 0})</span>
                        )}
                        {piece.type === 'Placa' && piece.plateWidthMm !== undefined && (
                          <span className="text-[10px] text-emerald-800 block font-mono">{piece.plateWidthMm}×{piece.plateHeightMm} mm</span>
                        )}
                      </td>
                      <td className={`${viewMode === 'compact' ? 'py-1.5 px-2.5' : 'py-2.5 px-3.5'} font-mono text-[#434655]`}>
                        {piece.profile}
                      </td>
                      <td className={`${viewMode === 'compact' ? 'py-1.5 px-2.5' : 'py-2.5 px-3.5'} font-mono text-[#555f6f]`}>
                        {piece.type === 'Pernos' && piece.boltLengthMm ? `${piece.boltLengthMm}mm` : `${piece.lengthMeters.toFixed(2)}m`} <span className="text-[#c3c6d7] mx-1">•</span> {piece.weightKg}kg
                      </td>
                      <td className={`${viewMode === 'compact' ? 'py-1.5 px-2.5' : 'py-2.5 px-3.5'} font-medium text-[#151c27]`}>
                        {piece.project}
                      </td>
                      <td className={`${viewMode === 'compact' ? 'py-1.5 px-2.5' : 'py-2.5 px-3.5'}`}>
                        {piece.status === 'Enviada' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                            Enviada
                          </span>
                        )}
                        {piece.status === 'Fabricada' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                            Fabricada
                          </span>
                        )}
                        {piece.status === 'Incidencia' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-800 border border-red-200">
                            Incidencia
                          </span>
                        )}
                        {piece.status === 'Recibida' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Recibida
                          </span>
                        )}
                        {piece.status === 'Pendiente' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className={`${viewMode === 'compact' ? 'py-1.5 px-2.5' : 'py-2.5 px-3.5'}`}>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                          piece.qcStatus === 'Aprobada' ? 'bg-emerald-50 text-emerald-700' :
                          piece.qcStatus === 'Rechazada' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {piece.qcStatus === 'Aprobada' ? '✓ ' : ''}{piece.qcStatus}
                        </span>
                      </td>
                      <td className={`${viewMode === 'compact' ? 'py-1.5 px-2.5' : 'py-2.5 px-3.5'} font-mono font-medium`}>
                        {piece.refId !== '-' ? (
                          <span 
                            onClick={() => setSelectedPieceForDetail(piece)}
                            className="text-[#004ac6] hover:underline cursor-pointer"
                          >
                            {piece.refId}
                          </span>
                        ) : (
                          <span className="text-[#737686]">-</span>
                        )}
                      </td>
                      <td className={`${viewMode === 'compact' ? 'py-1.5 px-2.5' : 'py-2 px-3.5'} text-right`}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Modificar Pieza */}
                          <button
                            id={`modify-piece-btn-${piece.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              playFeedbackSound('click');
                              setSelectedPieceForEdit(piece);
                              setIsEditPieceModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-white border border-[#004ac6] hover:bg-[#004ac6] hover:text-white text-[#004ac6] rounded-md text-[12px] font-bold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                            title="Modificar pieza"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Modificar pieza</span>
                          </button>

                          {/* Historial de Modificaciones */}
                          {piece.modificationHistory && piece.modificationHistory.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playFeedbackSound('click');
                                setSelectedPieceForHistoryModal(piece);
                              }}
                              className="px-2 py-1 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 rounded-md text-[12px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                              title={`Ver historial (${piece.modificationHistory.length} cambios)`}
                            >
                              <History className="w-3.5 h-3.5 text-amber-700" />
                              <span className="hidden 2xl:inline">Historial</span>
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playFeedbackSound('click');
                              setSelectedPieceForDetail(piece);
                            }}
                            className="px-2 py-1 bg-white border border-[#c3c6d7] hover:border-[#004ac6] hover:bg-[#f0f3ff] text-[#151c27] rounded-md text-[12px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                            title="Ver detalle técnico"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#004ac6]" />
                            <span className="hidden xl:inline">Ficha</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playFeedbackSound('click');
                              setSelectedPieceForTraceability(piece);
                            }}
                            className="px-2 py-1 bg-[#f0f3ff] border border-[#adc6ff] hover:bg-[#dbe1ff] text-[#002b75] rounded-md text-[12px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                            title="Ver trazabilidad completa (Línea de vida)"
                          >
                            <GitCommit className="w-3.5 h-3.5 text-[#004ac6]" />
                            <span className="hidden sm:inline">Trazabilidad</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="border-t border-[#c3c6d7] bg-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px]">
            <span className="text-[#555f6f]">
              Mostrando <strong className="text-[#151c27]">{filteredPieces.length}</strong> elementos estructurados
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
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#c3c6d7] bg-white hover:bg-[#f0f3ff] text-[#151c27] font-semibold text-[12px] transition-colors">
                3
              </button>
              <button className="px-3 py-1.5 border border-[#c3c6d7] bg-white hover:bg-[#f0f3ff] text-[#151c27] font-semibold rounded-lg text-[12px] transition-colors">
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

