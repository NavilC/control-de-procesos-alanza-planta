import { Piece, StructuralGridAxis, StructuralGridLevel, StructuralMemberLocation, StructuralMemberType } from '../types';

export interface ProjectGridConfig {
  projectName: string;
  axesX: StructuralGridAxis[]; // Letters: A, B, C, D, E...
  axesY: StructuralGridAxis[]; // Numbers: 1, 2, 3, 4...
  levels: StructuralGridLevel[];
  elevationFrames: { id: string; label: string; axisType: 'Y' | 'X'; axisRef: string }[];
}

export const DEFAULT_GRID_CONFIGS: Record<string, ProjectGridConfig> = {
  'Mhotivo': {
    projectName: 'Mhotivo',
    axesX: [
      { id: 'A', label: 'Eje A', distanceMeters: 0 },
      { id: 'B', label: 'Eje B', distanceMeters: 7.0 },
      { id: 'C', label: 'Eje C', distanceMeters: 14.0 },
      { id: 'D', label: 'Eje D', distanceMeters: 21.0 },
      { id: 'E', label: 'Eje E', distanceMeters: 28.0 }
    ],
    axesY: [
      { id: '1', label: 'Eje 1', distanceMeters: 0 },
      { id: '2', label: 'Eje 2', distanceMeters: 8.5 },
      { id: '3', label: 'Eje 3', distanceMeters: 17.0 },
      { id: '4', label: 'Eje 4', distanceMeters: 25.5 }
    ],
    levels: [
      { id: 'N0', name: 'Nivel 0.00m (Cimentación)', elevationMeters: 0 },
      { id: 'N1', name: 'Nivel +4.50m (Losa 1)', elevationMeters: 4.5 },
      { id: 'N2', name: 'Nivel +9.00m (Losa 2)', elevationMeters: 9.0 },
      { id: 'N3', name: 'Nivel +13.50m (Cubierta)', elevationMeters: 13.5 }
    ],
    elevationFrames: [
      { id: 'Eje 1', label: 'Pórtico Eje 1 (Frontal)', axisType: 'Y', axisRef: '1' },
      { id: 'Eje 2', label: 'Pórtico Eje 2 (Intermedio)', axisType: 'Y', axisRef: '2' },
      { id: 'Eje 3', label: 'Pórtico Eje 3 (Intermedio)', axisType: 'Y', axisRef: '3' },
      { id: 'Eje 4', label: 'Pórtico Eje 4 (Posterior)', axisType: 'Y', axisRef: '4' },
      { id: 'Eje A', label: 'Marco Lateral Eje A', axisType: 'X', axisRef: 'A' },
      { id: 'Eje C', label: 'Marco Central Eje C', axisType: 'X', axisRef: 'C' },
      { id: 'Eje E', label: 'Marco Lateral Eje E', axisType: 'X', axisRef: 'E' }
    ]
  },
  'Torre Mítica': {
    projectName: 'Torre Mítica',
    axesX: [
      { id: 'A', label: 'Eje A', distanceMeters: 0 },
      { id: 'B', label: 'Eje B', distanceMeters: 8.0 },
      { id: 'C', label: 'Eje C', distanceMeters: 16.0 },
      { id: 'D', label: 'Eje D', distanceMeters: 24.0 },
      { id: 'E', label: 'Eje E', distanceMeters: 32.0 }
    ],
    axesY: [
      { id: '1', label: 'Eje 1', distanceMeters: 0 },
      { id: '2', label: 'Eje 2', distanceMeters: 9.0 },
      { id: '3', label: 'Eje 3', distanceMeters: 18.0 },
      { id: '4', label: 'Eje 4', distanceMeters: 27.0 }
    ],
    levels: [
      { id: 'N0', name: 'Nivel 0.00m (Sótano / Cimiento)', elevationMeters: 0 },
      { id: 'N1', name: 'Nivel +4.20m (Planta Baja)', elevationMeters: 4.2 },
      { id: 'N2', name: 'Nivel +8.40m (Nivel 2)', elevationMeters: 8.4 },
      { id: 'N3', name: 'Nivel +12.60m (Nivel 3)', elevationMeters: 12.6 }
    ],
    elevationFrames: [
      { id: 'Eje 1', label: 'Marco Principal Eje 1', axisType: 'Y', axisRef: '1' },
      { id: 'Eje 2', label: 'Marco Sísmico Eje 2', axisType: 'Y', axisRef: '2' },
      { id: 'Eje 3', label: 'Marco Central Eje 3', axisType: 'Y', axisRef: '3' },
      { id: 'Eje 4', label: 'Marco Posterior Eje 4', axisType: 'Y', axisRef: '4' },
      { id: 'Eje A', label: 'Fachada Eje A', axisType: 'X', axisRef: 'A' },
      { id: 'Eje C', label: 'Núcleo Central Eje C', axisType: 'X', axisRef: 'C' },
      { id: 'Eje E', label: 'Fachada Eje E', axisType: 'X', axisRef: 'E' }
    ]
  }
};

// Fallback config for any other project
export const getProjectGridConfig = (projectName: string): ProjectGridConfig => {
  if (DEFAULT_GRID_CONFIGS[projectName]) {
    return DEFAULT_GRID_CONFIGS[projectName];
  }
  // Generic responsive template
  return {
    projectName,
    axesX: [
      { id: 'A', label: 'Eje A', distanceMeters: 0 },
      { id: 'B', label: 'Eje B', distanceMeters: 6.5 },
      { id: 'C', label: 'Eje C', distanceMeters: 13.0 },
      { id: 'D', label: 'Eje D', distanceMeters: 19.5 },
      { id: 'E', label: 'Eje E', distanceMeters: 26.0 }
    ],
    axesY: [
      { id: '1', label: 'Eje 1', distanceMeters: 0 },
      { id: '2', label: 'Eje 2', distanceMeters: 7.5 },
      { id: '3', label: 'Eje 3', distanceMeters: 15.0 },
      { id: '4', label: 'Eje 4', distanceMeters: 22.5 }
    ],
    levels: [
      { id: 'N0', name: 'Nivel 0.00m (Cimentación)', elevationMeters: 0 },
      { id: 'N1', name: 'Nivel +4.00m (Nivel 1)', elevationMeters: 4.0 },
      { id: 'N2', name: 'Nivel +8.00m (Nivel 2)', elevationMeters: 8.0 },
      { id: 'N3', name: 'Nivel +12.00m (Cubierta)', elevationMeters: 12.0 }
    ],
    elevationFrames: [
      { id: 'Eje 1', label: 'Pórtico Eje 1', axisType: 'Y', axisRef: '1' },
      { id: 'Eje 2', label: 'Pórtico Eje 2', axisType: 'Y', axisRef: '2' },
      { id: 'Eje 3', label: 'Pórtico Eje 3', axisType: 'Y', axisRef: '3' },
      { id: 'Eje 4', label: 'Pórtico Eje 4', axisType: 'Y', axisRef: '4' },
      { id: 'Eje A', label: 'Marco Eje A', axisType: 'X', axisRef: 'A' },
      { id: 'Eje C', label: 'Marco Eje C', axisType: 'X', axisRef: 'C' },
      { id: 'Eje E', label: 'Marco Eje E', axisType: 'X', axisRef: 'E' }
    ]
  };
};

/**
 * Builds the structural member coordinate graph for a project,
 * associating real Piece objects to their respective physical grid coordinates.
 */
export const buildProjectStructuralMembers = (
  projectName: string,
  pieces: Piece[]
): {
  members: (StructuralMemberLocation & { piece?: Piece })[];
  summary: {
    total: number;
    received: number;
    inTransit: number;
    qcApproved: number;
    fabricating: number;
    incidents: number;
    totalWeightTons: number;
  };
} => {
  const config = getProjectGridConfig(projectName);
  const projectPieces = pieces.filter(p => p.project.toLowerCase() === projectName.toLowerCase());

  // Piece map for lookup by mark
  const pieceMap = new Map<string, Piece>();
  projectPieces.forEach(p => pieceMap.set(p.mark.toUpperCase(), p));

  // Available pieces queue to map if specific mark isn't hardcoded
  const unassignedColumns = projectPieces.filter(p => p.type === 'Columna' || p.mark.toUpperCase().startsWith('C-'));
  const unassignedBeams = projectPieces.filter(p => p.type === 'Viga' || p.mark.toUpperCase().startsWith('V-') || p.mark.toUpperCase().startsWith('2S-'));
  const unassignedBraces = projectPieces.filter(p => p.type === 'Riostra' || p.type === 'Contraventeo' || p.mark.toUpperCase().startsWith('R-') || p.mark.toUpperCase().startsWith('K-'));
  const unassignedJoists = projectPieces.filter(p => p.type === 'Joist' || p.mark.toUpperCase().startsWith('J-'));

  let colIdx = 0;
  let beamIdx = 0;
  let braceIdx = 0;
  let joistIdx = 0;

  const getNextPiece = (type: StructuralMemberType, preferredMark?: string): { mark: string; piece?: Piece } => {
    if (preferredMark && pieceMap.has(preferredMark.toUpperCase())) {
      return { mark: preferredMark, piece: pieceMap.get(preferredMark.toUpperCase()) };
    }

    if (type === 'Columna') {
      if (colIdx < unassignedColumns.length) {
        const p = unassignedColumns[colIdx++];
        return { mark: p.mark, piece: p };
      }
      return { mark: `C-${100 + (colIdx++)}` };
    }

    if (type === 'Viga') {
      if (beamIdx < unassignedBeams.length) {
        const p = unassignedBeams[beamIdx++];
        return { mark: p.mark, piece: p };
      }
      return { mark: `V-${200 + (beamIdx++)}` };
    }

    if (type === 'Riostra') {
      if (braceIdx < unassignedBraces.length) {
        const p = unassignedBraces[braceIdx++];
        return { mark: p.mark, piece: p };
      }
      return { mark: `R-${300 + (braceIdx++)}` };
    }

    if (joistIdx < unassignedJoists.length) {
      const p = unassignedJoists[joistIdx++];
      return { mark: p.mark, piece: p };
    }
    return { mark: `J-${400 + (joistIdx++)}` };
  };

  const members: (StructuralMemberLocation & { piece?: Piece })[] = [];

  // 1. Generate columns across all grid intersections (X, Y) spanning levels
  config.axesX.forEach((axX) => {
    config.axesY.forEach((axY) => {
      for (let l = 0; l < config.levels.length - 1; l++) {
        const lFrom = config.levels[l].id;
        const lTo = config.levels[l + 1].id;
        const prefMark = `C-${axX.id}${axY.id}-${l + 1}`;
        const { mark, piece } = getNextPiece('Columna', prefMark);

        members.push({
          id: `COL-${axX.id}-${axY.id}-${lFrom}-${lTo}`,
          pieceMark: mark,
          memberType: 'Columna',
          project: projectName,
          elevationFrame: `Eje ${axY.id}`,
          axisFrom: axX.id,
          levelFrom: lFrom,
          levelTo: lTo,
          floorLevel: lTo,
          gridXFrom: axX.id,
          gridYFrom: axY.id,
          piece
        });
      }
    });
  });

  // 2. Generate longitudinal beams (along X axis, across Y frames) at each level
  config.axesY.forEach((axY) => {
    for (let l = 1; l < config.levels.length; l++) {
      const lvl = config.levels[l].id;
      for (let i = 0; i < config.axesX.length - 1; i++) {
        const fromX = config.axesX[i].id;
        const toX = config.axesX[i + 1].id;
        const prefMark = `V-${fromX}${toX}-${axY.id}-${l}`;
        const { mark, piece } = getNextPiece('Viga', prefMark);

        members.push({
          id: `BEAM-X-${fromX}-${toX}-${axY.id}-${lvl}`,
          pieceMark: mark,
          memberType: 'Viga',
          project: projectName,
          elevationFrame: `Eje ${axY.id}`,
          axisFrom: fromX,
          axisTo: toX,
          levelFrom: lvl,
          floorLevel: lvl,
          gridXFrom: fromX,
          gridXTo: toX,
          gridYFrom: axY.id,
          gridYTo: axY.id,
          piece
        });
      }
    }
  });

  // 3. Generate transverse beams (along Y axis, across X frames) at each level
  config.axesX.forEach((axX) => {
    for (let l = 1; l < config.levels.length; l++) {
      const lvl = config.levels[l].id;
      for (let j = 0; j < config.axesY.length - 1; j++) {
        const fromY = config.axesY[j].id;
        const toY = config.axesY[j + 1].id;
        const prefMark = `VT-${axX.id}-${fromY}${toY}-${l}`;
        const { mark, piece } = getNextPiece('Viga', prefMark);

        members.push({
          id: `BEAM-Y-${axX.id}-${fromY}-${toY}-${lvl}`,
          pieceMark: mark,
          memberType: 'Viga',
          project: projectName,
          elevationFrame: `Eje ${axX.id}`,
          axisFrom: fromY,
          axisTo: toY,
          levelFrom: lvl,
          floorLevel: lvl,
          gridXFrom: axX.id,
          gridXTo: axX.id,
          gridYFrom: fromY,
          gridYTo: toY,
          piece
        });
      }
    }
  });

  // 4. Generate bracing (Riostras) in specific bays for seismic/wind stability
  // Bays between A-B and D-E on Eje 1 and Eje 4
  ['1', '4'].forEach(yAxis => {
    for (let l = 0; l < config.levels.length - 1; l++) {
      const lFrom = config.levels[l].id;
      const lTo = config.levels[l + 1].id;

      // Diagonal 1: A to B
      const { mark: m1, piece: p1 } = getNextPiece('Riostra', `R-AB-${yAxis}-${l + 1}A`);
      members.push({
        id: `BRACE-AB1-${yAxis}-${lFrom}-${lTo}`,
        pieceMark: m1,
        memberType: 'Riostra',
        project: projectName,
        elevationFrame: `Eje ${yAxis}`,
        axisFrom: 'A',
        axisTo: 'B',
        levelFrom: lFrom,
        levelTo: lTo,
        floorLevel: lTo,
        piece: p1
      });

      // Diagonal 2: D to E
      const { mark: m2, piece: p2 } = getNextPiece('Riostra', `R-DE-${yAxis}-${l + 1}A`);
      members.push({
        id: `BRACE-DE1-${yAxis}-${lFrom}-${lTo}`,
        pieceMark: m2,
        memberType: 'Riostra',
        project: projectName,
        elevationFrame: `Eje ${yAxis}`,
        axisFrom: 'E',
        axisTo: 'D',
        levelFrom: lFrom,
        levelTo: lTo,
        floorLevel: lTo,
        piece: p2
      });
    }
  });

  // Calculate summary
  let received = 0;
  let inTransit = 0;
  let qcApproved = 0;
  let fabricating = 0;
  let incidents = 0;
  let totalWeightKg = 0;

  members.forEach(m => {
    const p = m.piece;
    if (p) {
      totalWeightKg += p.weightKg || 450;
      if (p.status === 'Recibida') received++;
      else if (p.status === 'Enviada') inTransit++;
      else if (p.status === 'Incidencia') incidents++;
      else if (p.qcStatus === 'Aprobada') qcApproved++;
      else fabricating++;
    } else {
      totalWeightKg += 400;
      fabricating++;
    }
  });

  return {
    members,
    summary: {
      total: members.length,
      received,
      inTransit,
      qcApproved,
      fabricating,
      incidents,
      totalWeightTons: Number((totalWeightKg / 1000).toFixed(1))
    }
  };
};

export type MemberStatusType = 'Recibida' | 'Enviada' | 'Aprobada' | 'Fabricada' | 'Incidencia' | 'Montada';

export const getMemberStatus = (piece?: Piece): MemberStatusType => {
  if (!piece) return 'Fabricada';
  if (piece.status === 'Incidencia' || piece.qcStatus === 'Rechazada') return 'Incidencia';
  if (piece.status === 'Recibida') return 'Recibida';
  if (piece.status === 'Enviada') return 'Enviada';
  if (piece.qcStatus === 'Aprobada') return 'Aprobada';
  return 'Fabricada';
};

export const STATUS_COLORS: Record<MemberStatusType, { stroke: string; fill: string; badgeBg: string; text: string; label: string }> = {
  'Recibida': {
    stroke: '#059669',
    fill: '#10b981',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    text: 'text-emerald-600',
    label: 'Recibida en Obra'
  },
  'Enviada': {
    stroke: '#d97706',
    fill: '#f59e0b',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    text: 'text-amber-600',
    label: 'En Tránsito (Despacho)'
  },
  'Aprobada': {
    stroke: '#004ac6',
    fill: '#2563eb',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
    text: 'text-blue-600',
    label: 'Liberada QC (Patio Planta)'
  },
  'Fabricada': {
    stroke: '#64748b',
    fill: '#94a3b8',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
    text: 'text-slate-500',
    label: 'En Taller / Fabricación'
  },
  'Incidencia': {
    stroke: '#dc2626',
    fill: '#ef4444',
    badgeBg: 'bg-red-100 text-red-800 border-red-300',
    text: 'text-red-600',
    label: 'Con Incidencia / Dañada'
  },
  'Montada': {
    stroke: '#4f46e5',
    fill: '#6366f1',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    text: 'text-indigo-600',
    label: 'Montada en Posición'
  }
};
