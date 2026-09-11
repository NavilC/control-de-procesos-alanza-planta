import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ProjectGridConfig, 
  STATUS_COLORS, 
  getMemberStatus, 
  MemberStatusType 
} from '../../utils/structuralGridData';
import { StructuralMemberLocation, Piece } from '../../types';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Info, 
  Truck, 
  CheckCircle2, 
  AlertTriangle,
  Move
} from 'lucide-react';

interface StructuralGridCanvasProps {
  config: ProjectGridConfig;
  members: (StructuralMemberLocation & { piece?: Piece })[];
  viewMode: 'elevation' | 'floor';
  selectedElevationFrame: string;
  selectedFloorLevel: string;
  selectedShipmentFilter: string;
  selectedMemberId: string | null;
  onSelectMember: (member: StructuralMemberLocation & { piece?: Piece }) => void;
}

export const StructuralGridCanvas: React.FC<StructuralGridCanvasProps> = ({
  config,
  members,
  viewMode,
  selectedElevationFrame,
  selectedFloorLevel,
  selectedShipmentFilter,
  selectedMemberId,
  onSelectMember
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [hoveredMember, setHoveredMember] = useState<(StructuralMemberLocation & { piece?: Piece }) | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reset pan/zoom when switching view mode or frame
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setHoveredMember(null);
  }, [viewMode, selectedElevationFrame, selectedFloorLevel]);

  // Handle Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    if (e.deltaY < 0) {
      setZoom(z => Math.min(2.5, z * zoomFactor));
    } else {
      setZoom(z => Math.max(0.6, z / zoomFactor));
    }
  };

  // Pan interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only primary button
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Dimensions & Grid Coordinates Setup
  // Elevation Dimensions
  const elevSvgWidth = 960;
  const elevSvgHeight = 520;
  const elevMarginLeft = 110;
  const elevMarginRight = 70;
  const elevMarginTop = 80;
  const elevMarginBottom = 80;

  // Filter members for active frame in elevation mode
  const currentElevationFrameObj = config.elevationFrames.find(f => f.id === selectedElevationFrame) || config.elevationFrames[0];
  const isElevXAxis = currentElevationFrameObj.axisType === 'X';
  const activeAxes = isElevXAxis ? config.axesY : config.axesX;

  const elevGraphWidth = elevSvgWidth - elevMarginLeft - elevMarginRight;
  const elevGraphHeight = elevSvgHeight - elevMarginTop - elevMarginBottom;

  const maxDist = activeAxes[activeAxes.length - 1]?.distanceMeters || 25;
  const maxElev = config.levels[config.levels.length - 1]?.elevationMeters || 12;

  const getElevX = (axisId: string) => {
    const ax = activeAxes.find(a => a.id === axisId);
    if (!ax) return elevMarginLeft;
    return elevMarginLeft + (ax.distanceMeters / (maxDist || 1)) * elevGraphWidth;
  };

  const getElevY = (levelId: string) => {
    const lvl = config.levels.find(l => l.id === levelId);
    if (!lvl) return elevSvgHeight - elevMarginBottom;
    const norm = lvl.elevationMeters / (maxElev || 1);
    return (elevSvgHeight - elevMarginBottom) - (norm * elevGraphHeight);
  };

  // Floor Plan Dimensions
  const floorSvgWidth = 960;
  const floorSvgHeight = 560;
  const floorMarginLeft = 90;
  const floorMarginRight = 60;
  const floorMarginTop = 80;
  const floorMarginBottom = 60;

  const floorGraphWidth = floorSvgWidth - floorMarginLeft - floorMarginRight;
  const floorGraphHeight = floorSvgHeight - floorMarginTop - floorMarginBottom;

  const maxXDist = config.axesX[config.axesX.length - 1]?.distanceMeters || 28;
  const maxYDist = config.axesY[config.axesY.length - 1]?.distanceMeters || 24;

  const getFloorX = (axisXId: string) => {
    const ax = config.axesX.find(a => a.id === axisXId);
    if (!ax) return floorMarginLeft;
    return floorMarginLeft + (ax.distanceMeters / (maxXDist || 1)) * floorGraphWidth;
  };

  const getFloorY = (axisYId: string) => {
    const ay = config.axesY.find(a => a.id === axisYId);
    if (!ay) return floorMarginTop;
    return floorMarginTop + (ay.distanceMeters / (maxYDist || 1)) * floorGraphHeight;
  };

  // Filtered members for current display
  const activeFrameMembers = useMemo(() => {
    if (viewMode === 'elevation') {
      return members.filter(m => m.elevationFrame === selectedElevationFrame);
    } else {
      return members.filter(m => m.floorLevel === selectedFloorLevel);
    }
  }, [members, viewMode, selectedElevationFrame, selectedFloorLevel]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full bg-[#0d1525] rounded-2xl border border-[#23314e] shadow-xl overflow-hidden select-none transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[580px]'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
    >
      {/* Grid Canvas Canvas Header Overlay */}
      <div className="absolute top-3 left-4 z-10 flex flex-wrap items-center gap-2 bg-[#121c32]/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#2b3a5a] text-white text-[12px]">
        <span className="font-bold tracking-wide text-blue-400 uppercase flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          {viewMode === 'elevation' ? `Elevación: ${currentElevationFrameObj.label}` : `Planta: ${config.levels.find(l => l.id === selectedFloorLevel)?.name || selectedFloorLevel}`}
        </span>
        <span className="text-slate-500">|</span>
        <span className="text-slate-300">
          Elementos en vista: <strong className="text-white font-mono">{activeFrameMembers.length}</strong>
        </span>
        {selectedShipmentFilter !== 'all' && (
          <>
            <span className="text-slate-500">|</span>
            <span className="text-amber-400 flex items-center gap-1 font-semibold">
              <Truck className="w-3.5 h-3.5" />
              Filtrado: {selectedShipmentFilter}
            </span>
          </>
        )}
      </div>

      {/* Floating Canvas Navigation Toolbar */}
      <div className="absolute top-3 right-4 z-10 flex items-center gap-1 bg-[#121c32]/85 backdrop-blur-md p-1.5 rounded-xl border border-[#2b3a5a] text-white">
        <button
          type="button"
          onClick={() => setZoom(z => Math.min(2.5, z * 1.15))}
          title="Acercar (Zoom In)"
          className="p-1.5 hover:bg-[#202d4b] rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom(z => Math.max(0.6, z / 1.15))}
          title="Alejar (Zoom Out)"
          className="p-1.5 hover:bg-[#202d4b] rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleResetView}
          title="Centrar y resetear zoom"
          className="p-1.5 hover:bg-[#202d4b] rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />
        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          className="p-1.5 hover:bg-[#202d4b] rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Main SVG Render Engine */}
      <svg 
        className="w-full h-full"
        viewBox={`0 0 ${viewMode === 'elevation' ? elevSvgWidth : floorSvgWidth} ${viewMode === 'elevation' ? elevSvgHeight : floorSvgHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Concrete Footing Hatch */}
          <pattern id="concreteHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#1f2c47" strokeWidth="1" />
          </pattern>
          {/* Glowing Shadow for Selected Element */}
          <filter id="selectionGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* ==================================================== */}
          {/* ELEVATION VIEW MODE                                  */}
          {/* ==================================================== */}
          {viewMode === 'elevation' && (
            <>
              {/* Foundation Ground Line */}
              <line 
                x1={elevMarginLeft - 40} 
                y1={elevSvgHeight - elevMarginBottom} 
                x2={elevSvgWidth - elevMarginRight + 40} 
                y2={elevSvgHeight - elevMarginBottom} 
                stroke="#3b4b6e" 
                strokeWidth="2.5" 
                strokeDasharray="6 3"
              />
              <text 
                x={elevMarginLeft - 50} 
                y={elevSvgHeight - elevMarginBottom + 4} 
                fill="#64748b" 
                fontSize="10" 
                textAnchor="end" 
                fontFamily="monospace"
              >
                ±0.00m
              </text>

              {/* Foundation Concrete Footings / Zapatas under each column axis */}
              {activeAxes.map(axis => {
                const x = getElevX(axis.id);
                const groundY = elevSvgHeight - elevMarginBottom;
                return (
                  <g key={`footing-${axis.id}`}>
                    <rect 
                      x={x - 22} 
                      y={groundY} 
                      width="44" 
                      height="20" 
                      fill="url(#concreteHatch)" 
                      stroke="#2c3a57" 
                      strokeWidth="1.5" 
                      rx="2"
                    />
                    <line x1={x - 14} y1={groundY + 2} x2={x + 14} y2={groundY + 2} stroke="#475569" strokeWidth="1" />
                  </g>
                );
              })}

              {/* Horizontal Level Reference Lines */}
              {config.levels.map(level => {
                const y = getElevY(level.id);
                return (
                  <g key={`lvl-line-${level.id}`}>
                    <line 
                      x1={elevMarginLeft - 20} 
                      y1={y} 
                      x2={elevSvgWidth - elevMarginRight + 20} 
                      y2={y} 
                      stroke="#1e2a44" 
                      strokeWidth="1" 
                      strokeDasharray="4 4"
                    />
                    {/* Elevation Target Symbol & Label */}
                    <g transform={`translate(${elevMarginLeft - 25}, ${y})`}>
                      <circle cx="0" cy="0" r="11" fill="#152238" stroke="#3b4b6e" strokeWidth="1" />
                      <path d="M -11 0 L 11 0 M 0 -11 L 0 11" stroke="#3b4b6e" strokeWidth="0.8" />
                      <text x="-16" y="3" fill="#94a3b8" fontSize="10.5" textAnchor="end" fontWeight="600">
                        {level.name}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Vertical Grid Axis Lines & Bubbles */}
              {activeAxes.map(axis => {
                const x = getElevX(axis.id);
                return (
                  <g key={`axis-line-${axis.id}`}>
                    <line 
                      x1={x} 
                      y1={elevMarginTop - 25} 
                      x2={x} 
                      y2={elevSvgHeight - elevMarginBottom + 25} 
                      stroke="#1a253c" 
                      strokeWidth="1" 
                      strokeDasharray="5 5"
                    />
                    {/* Axis Bubble at Top */}
                    <g transform={`translate(${x}, ${elevMarginTop - 35})`}>
                      <circle cx="0" cy="0" r="14" fill="#121e35" stroke="#3b82f6" strokeWidth="1.5" />
                      <text x="0" y="4" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">
                        {axis.id}
                      </text>
                    </g>
                    {/* Distance Dimension Indicator below ground */}
                    <text x={x} y={elevSvgHeight - elevMarginBottom + 38} fill="#64748b" fontSize="10" textAnchor="middle" fontFamily="monospace">
                      {axis.distanceMeters.toFixed(1)}m
                    </text>
                  </g>
                );
              })}

              {/* Diagonal Riostras / Braces in frame */}
              {activeFrameMembers.filter(m => m.memberType === 'Riostra').map(member => {
                const x1 = getElevX(member.axisFrom);
                const x2 = getElevX(member.axisTo || member.axisFrom);
                const y1 = getElevY(member.levelFrom);
                const y2 = getElevY(member.levelTo || member.levelFrom);

                const status = getMemberStatus(member.piece);
                const colorInfo = STATUS_COLORS[status];
                const isSelected = selectedMemberId === member.id;
                const isShipmentTarget = selectedShipmentFilter !== 'all' && member.piece?.refId === selectedShipmentFilter;
                const isDimmed = selectedShipmentFilter !== 'all' && !isShipmentTarget;

                return (
                  <g 
                    key={member.id}
                    onClick={() => onSelectMember(member)}
                    onMouseEnter={() => setHoveredMember(member)}
                    onMouseLeave={() => setHoveredMember(null)}
                    className="cursor-pointer transition-opacity"
                    opacity={isDimmed ? 0.2 : 1}
                  >
                    <line 
                      x1={x1} 
                      y1={y1} 
                      x2={x2} 
                      y2={y2} 
                      stroke={isSelected ? '#38bdf8' : colorInfo.stroke} 
                      strokeWidth={isSelected ? "5" : "3.5"}
                      strokeDasharray="6 2"
                      strokeLinecap="round"
                    />
                    {/* Connection Gusset Plate Circles */}
                    <circle cx={x1} cy={y1} r="4" fill="#334155" stroke="#64748b" />
                    <circle cx={x2} cy={y2} r="4" fill="#334155" stroke="#64748b" />
                    {/* Center Mark Label */}
                    <g transform={`translate(${(x1 + x2) / 2}, ${(y1 + y2) / 2})`}>
                      <rect x="-24" y="-8" width="48" height="16" rx="4" fill="#0d1525" stroke={colorInfo.stroke} strokeWidth="1" />
                      <text x="0" y="3" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                        {member.pieceMark}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Columns in Elevation Frame */}
              {activeFrameMembers.filter(m => m.memberType === 'Columna').map(member => {
                const x = getElevX(member.axisFrom);
                const yTop = getElevY(member.levelTo || member.levelFrom);
                const yBottom = getElevY(member.levelFrom);
                const height = Math.abs(yBottom - yTop);

                const status = getMemberStatus(member.piece);
                const colorInfo = STATUS_COLORS[status];
                const isSelected = selectedMemberId === member.id;
                const isShipmentTarget = selectedShipmentFilter !== 'all' && member.piece?.refId === selectedShipmentFilter;
                const isDimmed = selectedShipmentFilter !== 'all' && !isShipmentTarget;

                const colWidth = 14;

                return (
                  <g 
                    key={member.id}
                    onClick={() => onSelectMember(member)}
                    onMouseEnter={() => setHoveredMember(member)}
                    onMouseLeave={() => setHoveredMember(null)}
                    className="cursor-pointer transition-all duration-200"
                    opacity={isDimmed ? 0.22 : 1}
                  >
                    {/* Main Column Body */}
                    <rect 
                      x={x - colWidth / 2} 
                      y={yTop} 
                      width={colWidth} 
                      height={height} 
                      fill={colorInfo.fill} 
                      stroke={isSelected ? '#38bdf8' : colorInfo.stroke} 
                      strokeWidth={isSelected ? '2.5' : '1.5'} 
                      rx="2"
                      filter={isSelected || isShipmentTarget ? 'url(#selectionGlow)' : undefined}
                    />
                    {/* Structural Profile Web Indication */}
                    <line 
                      x1={x} 
                      y1={yTop + 4} 
                      x2={x} 
                      y2={yTop + height - 4} 
                      stroke="#ffffff" 
                      strokeWidth="1.2" 
                      opacity="0.6" 
                    />
                    {/* Piece Mark Badge */}
                    <g transform={`translate(${x}, ${yTop + height / 2})`}>
                      <rect 
                        x="-26" 
                        y="-8" 
                        width="52" 
                        height="16" 
                        rx="4" 
                        fill="#0b1120" 
                        stroke={isSelected ? '#38bdf8' : colorInfo.stroke} 
                        strokeWidth="1" 
                      />
                      <text 
                        x="0" 
                        y="3.5" 
                        fill="#ffffff" 
                        fontSize="9.5" 
                        fontWeight="bold" 
                        textAnchor="middle" 
                        fontFamily="monospace"
                      >
                        {member.pieceMark}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Horizontal Beams in Elevation Frame */}
              {activeFrameMembers.filter(m => m.memberType === 'Viga').map(member => {
                const x1 = getElevX(member.axisFrom);
                const x2 = getElevX(member.axisTo || member.axisFrom);
                const y = getElevY(member.levelFrom);
                const width = Math.abs(x2 - x1);
                const beamDepth = 12;

                const status = getMemberStatus(member.piece);
                const colorInfo = STATUS_COLORS[status];
                const isSelected = selectedMemberId === member.id;
                const isShipmentTarget = selectedShipmentFilter !== 'all' && member.piece?.refId === selectedShipmentFilter;
                const isDimmed = selectedShipmentFilter !== 'all' && !isShipmentTarget;

                return (
                  <g 
                    key={member.id}
                    onClick={() => onSelectMember(member)}
                    onMouseEnter={() => setHoveredMember(member)}
                    onMouseLeave={() => setHoveredMember(null)}
                    className="cursor-pointer transition-all duration-200"
                    opacity={isDimmed ? 0.22 : 1}
                  >
                    {/* Beam Flange Body */}
                    <rect 
                      x={Math.min(x1, x2) + 6} 
                      y={y - beamDepth / 2} 
                      width={width - 12} 
                      height={beamDepth} 
                      fill={colorInfo.fill} 
                      stroke={isSelected ? '#38bdf8' : colorInfo.stroke} 
                      strokeWidth={isSelected ? '2.5' : '1.5'} 
                      rx="2"
                      filter={isSelected || isShipmentTarget ? 'url(#selectionGlow)' : undefined}
                    />
                    {/* Connection End-Plate Rivets/Bolts visual indicator */}
                    <circle cx={Math.min(x1, x2) + 8} cy={y - 2.5} r="1.5" fill="#ffffff" opacity="0.8" />
                    <circle cx={Math.min(x1, x2) + 8} cy={y + 2.5} r="1.5" fill="#ffffff" opacity="0.8" />
                    <circle cx={Math.max(x1, x2) - 8} cy={y - 2.5} r="1.5" fill="#ffffff" opacity="0.8" />
                    <circle cx={Math.max(x1, x2) - 8} cy={y + 2.5} r="1.5" fill="#ffffff" opacity="0.8" />

                    {/* Central Mark Tag */}
                    <g transform={`translate(${(x1 + x2) / 2}, ${y - 12})`}>
                      <rect 
                        x="-26" 
                        y="-7" 
                        width="52" 
                        height="14" 
                        rx="3" 
                        fill="#0b1120" 
                        stroke={isSelected ? '#38bdf8' : colorInfo.stroke} 
                        strokeWidth="1" 
                      />
                      <text 
                        x="0" 
                        y="3" 
                        fill="#f1f5f9" 
                        fontSize="9" 
                        fontWeight="bold" 
                        textAnchor="middle" 
                        fontFamily="monospace"
                      >
                        {member.pieceMark}
                      </text>
                    </g>
                  </g>
                );
              })}
            </>
          )}

          {/* ==================================================== */}
          {/* FLOOR PLAN VIEW MODE (VISTA EN PLANTA)               */}
          {/* ==================================================== */}
          {viewMode === 'floor' && (
            <>
              {/* Grid Lines in X and Y */}
              {config.axesX.map(axX => {
                const x = getFloorX(axX.id);
                return (
                  <g key={`fl-axX-${axX.id}`}>
                    <line 
                      x1={x} 
                      y1={floorMarginTop - 15} 
                      x2={x} 
                      y2={floorSvgHeight - floorMarginBottom + 15} 
                      stroke="#1e2a44" 
                      strokeWidth="1" 
                      strokeDasharray="4 4"
                    />
                    {/* Top Axis Bubble */}
                    <g transform={`translate(${x}, ${floorMarginTop - 25})`}>
                      <circle cx="0" cy="0" r="13" fill="#121e35" stroke="#3b82f6" strokeWidth="1.5" />
                      <text x="0" y="4" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                        {axX.id}
                      </text>
                    </g>
                  </g>
                );
              })}

              {config.axesY.map(axY => {
                const y = getFloorY(axY.id);
                return (
                  <g key={`fl-axY-${axY.id}`}>
                    <line 
                      x1={floorMarginLeft - 15} 
                      y1={y} 
                      x2={floorSvgWidth - floorMarginRight + 15} 
                      y2={y} 
                      stroke="#1e2a44" 
                      strokeWidth="1" 
                      strokeDasharray="4 4"
                    />
                    {/* Left Axis Bubble */}
                    <g transform={`translate(${floorMarginLeft - 25}, ${y})`}>
                      <circle cx="0" cy="0" r="13" fill="#121e35" stroke="#3b82f6" strokeWidth="1.5" />
                      <text x="0" y="4" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                        {axY.id}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Horizontal Floor Beams (Along X) */}
              {activeFrameMembers.filter(m => m.gridYFrom && m.gridXTo).map(member => {
                const x1 = getFloorX(member.gridXFrom || 'A');
                const x2 = getFloorX(member.gridXTo || 'B');
                const y = getFloorY(member.gridYFrom || '1');
                const width = Math.abs(x2 - x1);

                const status = getMemberStatus(member.piece);
                const colorInfo = STATUS_COLORS[status];
                const isSelected = selectedMemberId === member.id;
                const isShipmentTarget = selectedShipmentFilter !== 'all' && member.piece?.refId === selectedShipmentFilter;
                const isDimmed = selectedShipmentFilter !== 'all' && !isShipmentTarget;

                return (
                  <g 
                    key={member.id}
                    onClick={() => onSelectMember(member)}
                    onMouseEnter={() => setHoveredMember(member)}
                    onMouseLeave={() => setHoveredMember(null)}
                    className="cursor-pointer transition-opacity"
                    opacity={isDimmed ? 0.22 : 1}
                  >
                    <rect 
                      x={Math.min(x1, x2) + 7} 
                      y={y - 4} 
                      width={width - 14} 
                      height="8" 
                      fill={colorInfo.fill} 
                      stroke={isSelected ? '#38bdf8' : colorInfo.stroke} 
                      strokeWidth={isSelected ? '2' : '1'} 
                      rx="2"
                      filter={isSelected || isShipmentTarget ? 'url(#selectionGlow)' : undefined}
                    />
                    <text 
                      x={(x1 + x2) / 2} 
                      y={y - 8} 
                      fill="#cbd5e1" 
                      fontSize="8.5" 
                      fontWeight="bold" 
                      textAnchor="middle" 
                      fontFamily="monospace"
                    >
                      {member.pieceMark}
                    </text>
                  </g>
                );
              })}

              {/* Transverse Floor Beams (Along Y) */}
              {activeFrameMembers.filter(m => m.gridXFrom && m.gridYTo).map(member => {
                const x = getFloorX(member.gridXFrom || 'A');
                const y1 = getFloorY(member.gridYFrom || '1');
                const y2 = getFloorY(member.gridYTo || '2');
                const height = Math.abs(y2 - y1);

                const status = getMemberStatus(member.piece);
                const colorInfo = STATUS_COLORS[status];
                const isSelected = selectedMemberId === member.id;
                const isShipmentTarget = selectedShipmentFilter !== 'all' && member.piece?.refId === selectedShipmentFilter;
                const isDimmed = selectedShipmentFilter !== 'all' && !isShipmentTarget;

                return (
                  <g 
                    key={member.id}
                    onClick={() => onSelectMember(member)}
                    onMouseEnter={() => setHoveredMember(member)}
                    onMouseLeave={() => setHoveredMember(null)}
                    className="cursor-pointer transition-opacity"
                    opacity={isDimmed ? 0.22 : 1}
                  >
                    <rect 
                      x={x - 4} 
                      y={Math.min(y1, y2) + 7} 
                      width="8" 
                      height={height - 14} 
                      fill={colorInfo.fill} 
                      stroke={isSelected ? '#38bdf8' : colorInfo.stroke} 
                      strokeWidth={isSelected ? '2' : '1'} 
                      rx="2"
                      filter={isSelected || isShipmentTarget ? 'url(#selectionGlow)' : undefined}
                    />
                    <text 
                      x={x + 10} 
                      y={(y1 + y2) / 2 + 3} 
                      fill="#cbd5e1" 
                      fontSize="8" 
                      fontWeight="bold" 
                      fontFamily="monospace"
                    >
                      {member.pieceMark}
                    </text>
                  </g>
                );
              })}

              {/* Column Cross-Sections at Intersections */}
              {config.axesX.map(axX => 
                config.axesY.map(axY => {
                  const x = getFloorX(axX.id);
                  const y = getFloorY(axY.id);
                  return (
                    <g key={`col-cross-${axX.id}-${axY.id}`} transform={`translate(${x}, ${y})`}>
                      {/* Column Base / Cap Plate */}
                      <rect x="-8" y="-8" width="16" height="16" fill="#1e293b" stroke="#475569" strokeWidth="1" rx="2" />
                      {/* I-Shape Flanges representation */}
                      <line x1="-5" y1="-5" x2="5" y2="-5" stroke="#38bdf8" strokeWidth="2" />
                      <line x1="-5" y1="5" x2="5" y2="5" stroke="#38bdf8" strokeWidth="2" />
                      <line x1="0" y1="-5" x2="0" y2="5" stroke="#38bdf8" strokeWidth="1.5" />
                    </g>
                  );
                })
              )}
            </>
          )}
        </g>
      </svg>

      {/* Interactive Tooltip on Hover */}
      {hoveredMember && (
        <div 
          className="absolute pointer-events-none z-30 bg-[#0f172a]/95 backdrop-blur-md border border-[#334155] rounded-xl p-3 shadow-2xl text-white text-[12px] min-w-[210px] animate-in fade-in zoom-in-95"
          style={{
            left: Math.min(mousePos.x + 15, (containerRef.current?.clientWidth || 800) - 230),
            top: Math.max(mousePos.y - 80, 20)
          }}
        >
          <div className="flex justify-between items-start gap-2 border-b border-slate-700/60 pb-1.5 mb-1.5">
            <div>
              <span className="font-mono font-bold text-[14px] text-blue-400 block">
                {hoveredMember.pieceMark}
              </span>
              <span className="text-[11px] text-slate-400">
                {hoveredMember.memberType} ({hoveredMember.piece?.profile || 'W24x76'})
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_COLORS[getMemberStatus(hoveredMember.piece)].badgeBg}`}>
              {STATUS_COLORS[getMemberStatus(hoveredMember.piece)].label}
            </span>
          </div>

          <div className="space-y-1 text-[11px] text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Longitud:</span>
              <span className="font-mono">{hoveredMember.piece?.lengthMeters ? `${hoveredMember.piece.lengthMeters.toFixed(2)} m` : '8.50 m'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Peso est.:</span>
              <span className="font-mono font-bold text-slate-100">{hoveredMember.piece?.weightKg || 520} kg</span>
            </div>
            {hoveredMember.piece?.refId && (
              <div className="flex justify-between items-center text-amber-400 pt-0.5">
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3" /> Manifiesto:
                </span>
                <span className="font-mono font-bold">{hoveredMember.piece.refId}</span>
              </div>
            )}
          </div>
          <div className="mt-2 text-[10px] text-center text-slate-500 italic">
            Haga clic para ver ficha técnica completa
          </div>
        </div>
      )}

      {/* Floating Instructions Bar at Bottom */}
      <div className="absolute bottom-3 left-4 right-4 z-10 flex flex-wrap items-center justify-between pointer-events-none text-[11px] text-slate-400">
        <div className="bg-[#0f172a]/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#23314e] flex items-center gap-2 pointer-events-auto">
          <Move className="w-3.5 h-3.5 text-slate-400" />
          <span>Arrastre para desplazar • Rueda para zoom • Clic en pieza para inspeccionar</span>
        </div>
      </div>
    </div>
  );
};
