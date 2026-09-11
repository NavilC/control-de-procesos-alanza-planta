import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  buildProjectStructuralMembers, 
  getProjectGridConfig, 
  STATUS_COLORS,
  MemberStatusType 
} from '../../utils/structuralGridData';
import { StructuralMemberLocation, Piece } from '../../types';
import { StructuralGridCanvas } from '../assembly/StructuralGridCanvas';
import { MemberDetailModal } from '../assembly/MemberDetailModal';
import { 
  Layers, 
  Building2, 
  Grid3X3, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Printer, 
  Download,
  Filter,
  Eye,
  Scale,
  Sparkles
} from 'lucide-react';

export const AssemblyGridView: React.FC = () => {
  const { pieces, projects, shipments, showToast, playFeedbackSound } = useApp();

  const [selectedProjectName, setSelectedProjectName] = useState<string>(
    projects[0]?.name || 'Mhotivo'
  );
  const [viewMode, setViewMode] = useState<'elevation' | 'floor'>('elevation');
  const [selectedElevationFrame, setSelectedElevationFrame] = useState<string>('Eje 1');
  const [selectedFloorLevel, setSelectedFloorLevel] = useState<string>('N1');
  const [selectedShipmentFilter, setSelectedShipmentFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<(StructuralMemberLocation & { piece?: Piece }) | null>(null);

  // Load grid configuration and compute structural members
  const gridConfig = useMemo(() => {
    return getProjectGridConfig(selectedProjectName);
  }, [selectedProjectName]);

  const { members, summary } = useMemo(() => {
    return buildProjectStructuralMembers(selectedProjectName, pieces);
  }, [selectedProjectName, pieces]);

  // Project shipments for the highlight filter
  const projectShipments = useMemo(() => {
    return shipments.filter(s => 
      s.project?.toLowerCase() === selectedProjectName.toLowerCase()
    );
  }, [shipments, selectedProjectName]);

  // Stats calculation for current view
  const currentViewMembers = useMemo(() => {
    if (viewMode === 'elevation') {
      return members.filter(m => m.elevationFrame === selectedElevationFrame);
    }
    return members.filter(m => m.floorLevel === selectedFloorLevel);
  }, [members, viewMode, selectedElevationFrame, selectedFloorLevel]);

  const viewReceivedCount = currentViewMembers.filter(m => m.piece?.status === 'Recibida').length;
  const viewPercentReceived = Math.round((viewReceivedCount / (currentViewMembers.length || 1)) * 100);

  const handlePrint = () => {
    if (playFeedbackSound) playFeedbackSound('click');
    showToast('Preparando vista de montaje para impresión/exportación...', 'info');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#c3c6d7] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#004ac6] font-bold text-[12px] uppercase tracking-wider mb-1">
            <Grid3X3 className="w-4 h-4" />
            <span>Ingeniería y Montaje Espacial</span>
          </div>
          <h1 className="text-2xl font-black text-[#151c27] tracking-tight flex items-center gap-2.5">
            Esquema Gráfico de Montaje (Ejes Estructurales)
          </h1>
          <p className="text-[13px] text-[#555f6f] mt-0.5">
            Visualizador vectorial de retícula de columnas, vigas y riostras georreferenciadas con trazabilidad de despacho y recepción en obra.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-white border border-[#c3c6d7] hover:bg-[#f0f3ff] text-[#151c27] rounded-xl text-[13px] font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#004ac6]" />
            <span>Imprimir Esquema</span>
          </button>
        </div>
      </div>

      {/* Control Bar & Filter Configuration */}
      <div className="bg-white rounded-2xl p-4 border border-[#c3c6d7] shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[13px]">
          {/* Project Selector */}
          <div>
            <label className="block text-[11px] font-bold text-[#434655] uppercase mb-1">
              Proyecto Estructural:
            </label>
            <div className="relative">
              <select
                value={selectedProjectName}
                onChange={(e) => {
                  setSelectedProjectName(e.target.value);
                  if (playFeedbackSound) playFeedbackSound('click');
                }}
                className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] focus:border-[#004ac6] rounded-xl font-medium outline-none cursor-pointer"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.ov})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* View Mode Toggle: Elevation vs Floor */}
          <div>
            <label className="block text-[11px] font-bold text-[#434655] uppercase mb-1">
              Modalidad de Visualización:
            </label>
            <div className="flex bg-[#f0f3ff] p-1 rounded-xl border border-[#c3c6d7]">
              <button
                type="button"
                onClick={() => {
                  setViewMode('elevation');
                  if (playFeedbackSound) playFeedbackSound('click');
                }}
                className={`flex-1 py-1.5 rounded-lg font-semibold text-[12px] transition-all cursor-pointer ${
                  viewMode === 'elevation'
                    ? 'bg-[#004ac6] text-white shadow-xs'
                    : 'text-[#555f6f] hover:text-[#151c27]'
                }`}
              >
                Elevación (Pórticos)
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('floor');
                  if (playFeedbackSound) playFeedbackSound('click');
                }}
                className={`flex-1 py-1.5 rounded-lg font-semibold text-[12px] transition-all cursor-pointer ${
                  viewMode === 'floor'
                    ? 'bg-[#004ac6] text-white shadow-xs'
                    : 'text-[#555f6f] hover:text-[#151c27]'
                }`}
              >
                Planta (Niveles)
              </button>
            </div>
          </div>

          {/* Sub-Selection: Frame or Level */}
          <div>
            <label className="block text-[11px] font-bold text-[#434655] uppercase mb-1">
              {viewMode === 'elevation' ? 'Pórtico / Marco Eje:' : 'Nivel de Losa:'}
            </label>
            {viewMode === 'elevation' ? (
              <select
                value={selectedElevationFrame}
                onChange={(e) => {
                  setSelectedElevationFrame(e.target.value);
                  if (playFeedbackSound) playFeedbackSound('click');
                }}
                className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] focus:border-[#004ac6] rounded-xl font-medium outline-none cursor-pointer"
              >
                {gridConfig.elevationFrames.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={selectedFloorLevel}
                onChange={(e) => {
                  setSelectedFloorLevel(e.target.value);
                  if (playFeedbackSound) playFeedbackSound('click');
                }}
                className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] focus:border-[#004ac6] rounded-xl font-medium outline-none cursor-pointer"
              >
                {gridConfig.levels.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Shipment Highlight Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#434655] uppercase mb-1">
              Iluminar Piezas por Envío / Camión:
            </label>
            <select
              value={selectedShipmentFilter}
              onChange={(e) => {
                setSelectedShipmentFilter(e.target.value);
                if (playFeedbackSound) playFeedbackSound('click');
                if (e.target.value !== 'all') {
                  showToast(`Iluminando elementos del envío ${e.target.value}`, 'info');
                }
              }}
              className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] focus:border-[#004ac6] rounded-xl font-medium outline-none cursor-pointer"
            >
              <option value="all">Todos los envíos (Sin atenuar)</option>
              {projectShipments.map(s => (
                <option key={s.id} value={s.code || s.id}>
                  {s.code || s.id} — {s.carrier || s.dispatchUnit || 'Flota Interna'} ({s.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Legend Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#e2e8f8] text-[11.5px]">
          <span className="font-bold text-[#434655] uppercase text-[11px]">
            Código de Color Trazabilidad:
          </span>
          <div className="flex flex-wrap items-center gap-3">
            {(Object.keys(STATUS_COLORS) as MemberStatusType[]).map((stKey) => {
              const info = STATUS_COLORS[stKey];
              return (
                <div key={stKey} className="flex items-center gap-1.5">
                  <span 
                    className="w-3.5 h-3.5 rounded-full inline-block border" 
                    style={{ backgroundColor: info.fill, borderColor: info.stroke }} 
                  />
                  <span className="text-[#151c27] font-medium">{info.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary KPI Cards for Active View */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px]">
        <div className="bg-white p-3.5 rounded-xl border border-[#c3c6d7] shadow-xs">
          <span className="text-[11px] text-[#555f6f] font-semibold block">Elementos en este Marco</span>
          <span className="text-xl font-black text-[#151c27] font-mono">
            {currentViewMembers.length} <span className="text-[12px] font-normal text-slate-500">piezas</span>
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-[#c3c6d7] shadow-xs">
          <span className="text-[11px] text-[#555f6f] font-semibold block">Recibidas en Obra</span>
          <span className="text-xl font-black text-emerald-600 font-mono">
            {viewReceivedCount} <span className="text-[12px] font-normal text-slate-500">({viewPercentReceived}%)</span>
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-[#c3c6d7] shadow-xs">
          <span className="text-[11px] text-[#555f6f] font-semibold block">En Tránsito (Flota Despacho)</span>
          <span className="text-xl font-black text-amber-600 font-mono">
            {currentViewMembers.filter(m => m.piece?.status === 'Enviada').length}
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-[#c3c6d7] shadow-xs">
          <span className="text-[11px] text-[#555f6f] font-semibold block">Peso Total Estructural</span>
          <span className="text-xl font-black text-[#004ac6] font-mono">
            {summary.totalWeightTons} <span className="text-[12px] font-normal text-slate-500">ton</span>
          </span>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <StructuralGridCanvas
        config={gridConfig}
        members={members}
        viewMode={viewMode}
        selectedElevationFrame={selectedElevationFrame}
        selectedFloorLevel={selectedFloorLevel}
        selectedShipmentFilter={selectedShipmentFilter}
        selectedMemberId={selectedMember?.id || null}
        onSelectMember={(member) => {
          setSelectedMember(member);
          if (playFeedbackSound) playFeedbackSound('click');
        }}
      />

      {/* Popover / Detail Modal for Selected Structural Member */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
};
