export type TabType = 
  | 'dashboard'
  | 'proyectos'
  | 'piezas'
  | 'contratistas'
  | 'qc'
  | 'envios'
  | 'recepcion'
  | 'esquema'
  | 'inventario'
  | 'incidencias'
  | 'reportes'
  | 'usuarios'
  | 'configuracion';

export interface StructuralGridAxis {
  id: string;
  label: string;
  distanceMeters: number;
}

export interface StructuralGridLevel {
  id: string;
  name: string;
  elevationMeters: number;
}

export type StructuralMemberType = 'Columna' | 'Viga' | 'Riostra' | 'Joist';

export interface StructuralMemberLocation {
  id: string;
  pieceMark: string;
  memberType: StructuralMemberType;
  project: string;
  elevationFrame?: string; // e.g. 'Eje 1', 'Eje 2', 'Eje A', 'Eje B'
  axisFrom: string;
  axisTo?: string;
  levelFrom: string;
  levelTo?: string;
  floorLevel?: string;
  gridXFrom?: string;
  gridXTo?: string;
  gridYFrom?: string;
  gridYTo?: string;
}

export type PieceStatus = 'Fabricada' | 'Enviada' | 'Recibida' | 'Incidencia' | 'Pendiente';
export type QCStatus = 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Con Observaciones';
export type ShipmentStatus = 'En preparación' | 'En tránsito' | 'Recibido' | 'Con incidencia' | 'Programado';
export type IncidentSeverity = 'Crítica' | 'Alta' | 'Media' | 'Baja';
export type IncidentStatus = 'Abierta' | 'En Proceso' | 'Resuelta';
export type InventoryStockStatus = 'ÓPTIMO' | 'REABASTECER' | 'CRÍTICO';
export type UserRole = 
  | 'Residente de campo' 
  | 'Bodeguero' 
  | 'Inspector QC' 
  | 'Coordinador de logística' 
  | 'Gerente de logística' 
  | 'Gerente de planta'
  | 'Administrador' 
  | 'Receptor' 
  | 'Coordinador Logística' 
  | 'Jefe de Planta' 
  | 'Operador';
export type UserArea = 'Planta' | 'Campo' | 'Despacho' | 'Administración' | 'Calidad';

// Contratistas & Asignación de Trabajo
export type ContractorType = 'Soldador' | 'Pintor';
export type ContractorStatus = 'Activo' | 'Inactivo';
export type AssignmentWorkStatus = 'Pendiente' | 'Asignado' | 'En proceso' | 'Completado' | 'Cancelado';

export interface WorkAssignmentHistoryItem {
  id: string;
  date: string;
  process: 'Soldadura' | 'Pintura' | 'General';
  contractorId?: string;
  contractorName: string;
  action: string; // 'Asignado' | 'En proceso' | 'Completado' | 'Cancelado' | 'Reemplazado'
  previousContractorName?: string;
  status: AssignmentWorkStatus;
  user: string;
  notes?: string;
  timestamp?: string | number;
  reason?: string;
  changedBy?: string;
}

export interface PieceModificationLogItem {
  id: string;
  date: string; // e.g. "04/09/2026 10:15"
  timestamp: number;
  user: string;
  userRole?: string;
  field: string; // e.g. "Descripción", "Dimensión", "Proyecto", "Código de pieza", etc.
  previousValue: string;
  newValue: string;
  reason?: string;
}

export interface Contractor {
  id: string; // CONT-001
  name: string; // Nombre completo / Nombre de empresa
  type: ContractorType; // 'Soldador' | 'Pintor'
  phone: string;
  email: string;
  identification?: string; // DNI / RTN / Cédula
  status: ContractorStatus; // 'Activo' | 'Inactivo'
  notes?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  assignedPiecesCount?: number;
  completedPiecesCount?: number;
}

export interface Project {
  id: string;
  name: string;
  ov: string; // Orden de Venta
  op: string; // Orden de Producción
  siteManager: {
    name: string;
    role?: string;
    avatarUrl?: string;
    initials: string;
  };
  usersCount: number;
  piecesCount: number;
  status: 'Activo' | 'Retrasado' | 'Finalizado';
  createdAt: string;
  progressPercent?: number;
  description?: string;
  location?: string;
}

export interface TraceabilityStep {
  step: string;
  date: string;
  operator: string;
  location: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  notes?: string;
  certNumber?: string;
}

export type ElementType = 
  | 'Columna'
  | 'Viga'
  | 'Joist'
  | 'Tijera'
  | 'SangRods'
  | 'Punta roscada'
  | 'Pernos'
  | 'Placa'
  | 'Cajón de canaleta / Canaleta';

export interface Piece {
  id: string;
  mark: string; // e.g. 2S-37A
  description?: string; // e.g. 'Viga principal de marco sismorresistente'
  workOrder?: string; // e.g. 'OT-2026-084'
  type: ElementType | string;
  profile: string; // e.g. W18x130, W14x90
  lengthMeters: number;
  dimensions?: string; // e.g. '10.50 x 0.61 x 0.23 m'
  weightKg: number;
  quantity?: number; // default 1
  project: string;
  status: PieceStatus;
  qcStatus: QCStatus;
  refId: string; // e.g. ENV-00286, INC-0042, REC-00105
  fabricationDate: string;
  steelGrade?: string; // e.g. A36, A572-50, A992
  inspector?: string;
  qcNotes?: string;
  notes?: string; // Observaciones generales de la pieza

  // Campos de Cubicaje, Despiece & Excel (BOM)
  category?: string; // e.g. 'VIGAS PRINCIPALES', 'COLUMNAS', etc.
  paintAreaM2?: number; // m2_pintura_por_unidad
  paintAreaTotalM2?: number; // m2 totales de pintura
  unitWeightKgPerMeter?: number; // peso_unitario_kg (kg/m)
  totalWeightKg?: number; // peso_total_kg
  balance?: number; // saldo disponible
  excelRow?: number; // fila_excel de origen

  // Campos específicos por tipo de elemento:
  // Joist:
  camberMm?: number; // Contra flecha (mm)

  // Punta roscada:
  rodLengthMm?: number; // Longitud (mm)
  threadLengthMm?: number; // Longitud de rosca (mm)

  // Pernos:
  boltLengthMm?: number; // Longitud (mm)
  threadLength1Mm?: number; // Longitud de rosca 1 (mm)
  threadLength2Mm?: number; // Longitud de rosca 2 (mm)

  // Placa:
  plateWidthMm?: number; // Ancho (mm)
  plateHeightMm?: number; // Alto (mm)
  holeDiameterMm?: number; // Diámetro de perforación (mm)

  // Campo deprecado mantenido opcional para no romper mock data antiguo
  heatNumber?: string;

  // Contratistas & Trazabilidad de Fabricación y Pintura
  weight?: number; // Alias for weightKg
  welderId?: string;
  welderName?: string;
  welderAssignedDate?: string;
  welderCompletedDate?: string;
  weldingAssignedDate?: string; // Alias
  weldingCompletedDate?: string; // Alias
  weldingStatus?: AssignmentWorkStatus;
  weldingNotes?: string;

  painterId?: string;
  painterName?: string;
  painterAssignedDate?: string;
  painterCompletedDate?: string;
  paintingAssignedDate?: string; // Alias
  paintingCompletedDate?: string; // Alias
  paintingStatus?: AssignmentWorkStatus;
  paintingNotes?: string;

  assignmentHistory?: WorkAssignmentHistoryItem[];
  modificationHistory?: PieceModificationLogItem[];

  traceability?: TraceabilityStep[];
  traceabilityTimeline?: {
    stage: string;
    date: string;
    responsible: string;
    location: string;
    details: string;
  }[];

  // Datos de Inspección QC física
  nominalLengthMeters?: number;
  measuredLengthMeters?: number;
  lengthDeviationMm?: number;
  paintSamples?: (number | null)[];
  paintAverageMils?: number;
  paintUnit?: 'mils' | 'µm';

  // Pieza con corte y cortes adicionales
  hasCuts?: boolean;
  cuts?: PieceCutItem[];
  hasAdditionalCut?: boolean;
}

export interface PieceCutItem {
  id?: string;
  cutNumber: number;
  lengthMeters: number;
  unit?: 'm' | 'mm';
  notes?: string;
}

export interface QCInspection {
  id: string;
  pieceMark: string;
  type: string;
  profile: string;
  project: string;
  fabricationDate: string;
  qcStatus: QCStatus;
  inspector: string;
  inspectionDate?: string;
  checklist?: {
    visualWelding: boolean;
    dimensionalCheck: boolean;
    coatingThickness: boolean;
    drillingAccuracy?: boolean;
    identificationStamp?: boolean;
  };
  notes?: string;

  // Medición física de longitud y control dimensional
  nominalLengthMeters?: number; // Longitud teórica de plano en metros
  measuredLengthMeters?: number; // Longitud física detectada/medida en metros
  lengthDeviationMm?: number; // Desviación en milímetros (físico - nominal) * 1000

  // Pieza con corte y cortes adicionales
  hasCuts?: boolean;
  cuts?: PieceCutItem[];
  hasAdditionalCut?: boolean;

  // 4 Muestras de espesor de recubrimiento / pintura (SSPC-PA 2 / ASTM D7091)
  paintSamples?: (number | null)[]; // 4 lecturas de espesor
  paintAverageMils?: number; // Promedio de las 4 muestras
  paintUnit?: 'mils' | 'µm'; // Unidad de medición (mils o µm)
}

export interface ShipmentRecipient {
  id?: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  included?: boolean;
}

export interface ShipmentEmailNotification {
  sentAt: string;
  subject: string;
  recipients: ShipmentRecipient[];
  status: 'Enviado' | 'Pendiente' | 'Fallido';
  bodySummary?: string;
  sentBy?: string;
}

export interface Shipment {
  id: string; // ENV-00287
  code?: string; // Alias for id
  project: string;
  date: string;
  piecesCount: number;
  totalWeightTons: number;
  carrier: string; // Unidad o flota del Dpto. de Despacho (Flota Interna)
  dispatchDepartment?: string; // Departamento de Despacho de la empresa
  dispatchUnit?: string; // Unidad / Camión de despacho
  driverName?: string; // Operador / Conductor de la empresa
  truckPlates?: string;
  manager: string; // Coordinador / Despachador responsable
  status: ShipmentStatus;
  destination: string;
  pieces: string[]; // piece marks
  estimatedArrival?: string;
  emailNotification?: ShipmentEmailNotification;
}

export interface ReceptionPieceItem {
  mark: string;
  type: string;
  profileAndWeight: string;
  status: 'Recibida' | 'Dañada' | 'Faltante' | 'En espera';
  verifiedAt?: string;
  notes?: string;
}

export interface ReceptionSession {
  shipmentId: string;
  projectName: string;
  carrier: string; // Unidad del Dpto. de Despacho
  driverName?: string;
  manager?: string;
  totalPieces: number;
  verifiedCount: number;
  status: 'En progreso' | 'Completado' | 'Con Incidencia';
  hasIncidentAlert?: boolean;
  incidentMessage?: string;
  items: ReceptionPieceItem[];
  signature?: string;
  signedBy?: string;
  signedAt?: string;
}

export interface InventoryItem {
  sku: string; // COL-W12-001
  description: string;
  category: 'Estructural Principal' | 'Estructural Secundaria' | 'Materia Prima' | 'Fijación' | 'Accesorios';
  currentStock: number;
  unit: string;
  location: string; // Almacén A-1, Patio Exterior B
  status: InventoryStockStatus;
  minThreshold: number;
  unitPriceEstimate: number;
}

export interface Incident {
  id: string; // INC-1042
  severity: IncidentSeverity;
  shortDescription: string;
  details?: string;
  origin: string; // Pieza: VIG-A4-001, Envío: SHP-8821
  responsible: string;
  category: 'Calidad' | 'Logística' | 'Diseño' | 'Seguridad' | 'Operación';
  status: IncidentStatus;
  date: string;
  resolutionTimeEstimate?: string;
  solutionNotes?: string;
}

export interface UserItem {
  id: string;
  username: string; // mgonzalez
  name: string;
  email: string;
  password?: string;
  area: UserArea;
  role: UserRole;
  status: 'Activo' | 'Inactivo';
  lastAccess: string;
  avatarUrl?: string;
  projects?: string[];
  initials?: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp?: number;
}
