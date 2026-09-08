import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  TabType, 
  Project, 
  Piece, 
  QCInspection, 
  Shipment, 
  ReceptionSession, 
  InventoryItem, 
  Incident, 
  UserItem, 
  SystemAuditLog,
  QCStatus,
  PieceStatus,
  IncidentSeverity,
  Contractor,
  ContractorType,
  ContractorStatus,
  AssignmentWorkStatus,
  WorkAssignmentHistoryItem,
  PieceModificationLogItem
} from '../types';
import { 
  INITIAL_PROJECTS, 
  INITIAL_PIECES, 
  INITIAL_QC_INSPECTIONS, 
  INITIAL_SHIPMENTS, 
  INITIAL_RECEPTION_SESSION, 
  INITIAL_INVENTORY, 
  INITIAL_INCIDENTS, 
  INITIAL_USERS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_CONTRACTORS
} from '../mockData';
import { playFeedbackSound } from '../utils/audioFeedback';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'error' | 'warning' | 'info' | 'success';
  read: boolean;
}

interface AppContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
  selectedProjectFilter: string;
  setSelectedProjectFilter: (p: string) => void;
  selectedTimeRangeFilter: string;
  setSelectedTimeRangeFilter: (t: string) => void;
  isFieldHighContrastMode: boolean;
  setIsFieldHighContrastMode: (b: boolean) => void;
  
  // User Role & Permissions Context
  currentUserRole: 'Administrador' | 'Producción' | 'Inspector QC';
  setCurrentUserRole: (r: 'Administrador' | 'Producción' | 'Inspector QC') => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (b: boolean) => void;
  logout: () => void;
  login: (role?: 'Administrador' | 'Producción' | 'Inspector QC') => void;

  // Data
  projects: Project[];
  pieces: Piece[];
  contractors: Contractor[];
  inspections: QCInspection[];
  shipments: Shipment[];
  receptionSession: ReceptionSession;
  inventory: InventoryItem[];
  incidents: Incident[];
  users: UserItem[];
  auditLogs: SystemAuditLog[];
  notifications: NotificationItem[];
  
  // Modals & Drawers
  selectedPieceForTraceability: Piece | null;
  setSelectedPieceForTraceability: (p: Piece | null) => void;
  selectedPieceForDetail: Piece | null;
  setSelectedPieceForDetail: (p: Piece | null) => void;
  selectedInspectionForQC: QCInspection | null;
  setSelectedInspectionForQC: (q: QCInspection | null) => void;
  selectedShipmentForPrint: Shipment | null;
  setSelectedShipmentForPrint: (s: Shipment | null) => void;
  isNewProjectModalOpen: boolean;
  setIsNewProjectModalOpen: (b: boolean) => void;
  isNewPieceModalOpen: boolean;
  setIsNewPieceModalOpen: (b: boolean) => void;
  isImportPiecesModalOpen: boolean;
  setIsImportPiecesModalOpen: (b: boolean) => void;
  isNewShipmentModalOpen: boolean;
  setIsNewShipmentModalOpen: (b: boolean) => void;
  isNewIncidentModalOpen: boolean;
  setIsNewIncidentModalOpen: (b: boolean) => void;
  isNewUserModalOpen: boolean;
  setIsNewUserModalOpen: (b: boolean) => void;
  isStockAdjustModalOpen: boolean;
  setIsStockAdjustModalOpen: (b: boolean) => void;
  isSignatureModalOpen: boolean;
  setIsSignatureModalOpen: (b: boolean) => void;
  activeReportModal: string | null;
  setActiveReportModal: (r: string | null) => void;
  activeConfigDetail: string | null;
  setActiveConfigDetail: (c: string | null) => void;
  notificationDrawerOpen: boolean;
  setNotificationDrawerOpen: (b: boolean) => void;

  // Contractor & Assignment Modals
  isNewContractorModalOpen: boolean;
  setIsNewContractorModalOpen: (b: boolean) => void;
  editingContractor: Contractor | null;
  setEditingContractor: (c: Contractor | null) => void;
  isAssignWorkModalOpen: boolean;
  setIsAssignWorkModalOpen: (b: boolean) => void;
  selectedPieceForAssignment: Piece | null;
  setSelectedPieceForAssignment: (p: Piece | null) => void;
  selectedContractorForHistory: Contractor | null;
  setSelectedContractorForHistory: (c: Contractor | null) => void;
  
  // Piece Modification Modals & Audit
  selectedPieceForEdit: Piece | null;
  setSelectedPieceForEdit: (p: Piece | null) => void;
  isEditPieceModalOpen: boolean;
  setIsEditPieceModalOpen: (b: boolean) => void;
  selectedPieceForHistoryModal: Piece | null;
  setSelectedPieceForHistoryModal: (p: Piece | null) => void;

  // Actions
  addProject: (proj: Partial<Project>) => void;
  addPiece: (piece: Partial<Piece>) => void;
  addPiecesBatch: (newPiecesData: Partial<Piece>[]) => { addedCount: number; errors: string[] };
  updatePiece: (pieceId: string, updatedFields: Partial<Piece>, modificationReason?: string) => { success: boolean; error?: string };
  deletePiece: (pieceId: string) => { success: boolean; error?: string };
  addContractor: (c: {
    name: string;
    type: ContractorType;
    phone: string;
    email: string;
    identification?: string;
    status?: ContractorStatus;
    notes?: string;
  }) => void;
  updateContractor: (id: string, updates: Partial<Contractor>) => void;
  toggleContractorStatus: (id: string) => void;
  assignWorkToPiece: (
    pieceMarkOrParams: string | {
      pieceMark: string;
      welderId?: string;
      welderName?: string;
      welderAssignedDate?: string;
      welderCompletedDate?: string;
      weldingStatus?: AssignmentWorkStatus;
      weldingNotes?: string;
      painterId?: string;
      painterName?: string;
      painterAssignedDate?: string;
      painterCompletedDate?: string;
      paintingStatus?: AssignmentWorkStatus;
      paintingNotes?: string;
      notes?: string;
    },
    maybeDetails?: any
  ) => void;
  performQCInspection: (id: string, status: QCStatus, notes: string, inspector: string) => void;
  submitQCInspection: (id: string, status: QCStatus, notes: string, inspector: string) => void;
  batchPerformQCInspection: (pieceMarksOrIds: string[], status: QCStatus, notes?: string, inspector?: string) => void;
  batchUpdatePieceStatus: (pieceMarksOrIds: string[], status: PieceStatus) => void;
  createShipment: (ship: Partial<Shipment>) => void;
  addShipment: (ship: Partial<Shipment>) => void;
  updateReceptionPieceStatus: (mark: string, status: 'Recibida' | 'Dañada' | 'Faltante', notes?: string) => void;
  completeReceptionSession: (signerName: string, signatureDataUrl?: string) => void;
  signReceptionSession: (signerName: string, signatureDataUrl?: string) => void;
  adjustStock: (sku: string, delta: number, reason?: string) => void;
  addIncident: (inc: Partial<Incident>) => void;
  resolveIncident: (id: string, solutionNotes: string) => void;
  addUser: (usr: Partial<UserItem>) => void;
  toggleUserStatus: (id: string) => void;
  markNotificationsAsRead: () => void;
  exportToCSV: (filename: string, rows: Record<string, any>[]) => void;
  addAudit: (arg1: string, arg2: string, arg3: string, arg4?: string) => void;
  playFeedbackSound: (type?: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('');
  const [selectedTimeRangeFilter, setSelectedTimeRangeFilter] = useState('Últimos 30 días');
  const [isFieldHighContrastMode, setIsFieldHighContrastMode] = useState(false);

  // User Role & Permissions Context
  const [currentUserRole, setCurrentUserRole] = useState<'Administrador' | 'Producción' | 'Inspector QC'>('Administrador');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const logout = () => {
    setIsAuthenticated(false);
    addAudit('Cierre de Sesión', 'Seguridad y Acceso', `Usuario con rol ${currentUserRole} cerró sesión de forma segura`);
  };

  const login = (role?: 'Administrador' | 'Producción' | 'Inspector QC') => {
    if (role) {
      setCurrentUserRole(role);
    }
    setIsAuthenticated(true);
    addAudit('Inicio de Sesión', 'Seguridad y Acceso', `Sesión iniciada exitosamente con perfil ${role || currentUserRole}`);
  };

  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [pieces, setPieces] = useState<Piece[]>(INITIAL_PIECES);
  const [contractors, setContractors] = useState<Contractor[]>(INITIAL_CONTRACTORS);
  const [inspections, setInspections] = useState<QCInspection[]>(INITIAL_QC_INSPECTIONS);
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [receptionSession, setReceptionSession] = useState<ReceptionSession>(INITIAL_RECEPTION_SESSION);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(INITIAL_AUDIT_LOGS);

  // Modals state
  const [selectedPieceForTraceability, setSelectedPieceForTraceability] = useState<Piece | null>(null);
  const [selectedPieceForDetail, setSelectedPieceForDetail] = useState<Piece | null>(null);
  const [selectedInspectionForQC, setSelectedInspectionForQC] = useState<QCInspection | null>(null);
  const [selectedShipmentForPrint, setSelectedShipmentForPrint] = useState<Shipment | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isNewPieceModalOpen, setIsNewPieceModalOpen] = useState(false);
  const [isImportPiecesModalOpen, setIsImportPiecesModalOpen] = useState(false);
  const [isNewShipmentModalOpen, setIsNewShipmentModalOpen] = useState(false);
  const [isNewIncidentModalOpen, setIsNewIncidentModalOpen] = useState(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [isStockAdjustModalOpen, setIsStockAdjustModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [activeReportModal, setActiveReportModal] = useState<string | null>(null);
  const [activeConfigDetail, setActiveConfigDetail] = useState<string | null>(null);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  // Contractor & Assignment Modals state
  const [isNewContractorModalOpen, setIsNewContractorModalOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);
  const [isAssignWorkModalOpen, setIsAssignWorkModalOpen] = useState(false);
  const [selectedPieceForAssignment, setSelectedPieceForAssignment] = useState<Piece | null>(null);
  const [selectedContractorForHistory, setSelectedContractorForHistory] = useState<Contractor | null>(null);

  // Piece Modification Modals & Audit state
  const [selectedPieceForEdit, setSelectedPieceForEdit] = useState<Piece | null>(null);
  const [isEditPieceModalOpen, setIsEditPieceModalOpen] = useState(false);
  const [selectedPieceForHistoryModal, setSelectedPieceForHistoryModal] = useState<Piece | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Piezas faltantes en ENV-00284',
      message: 'Se reportaron 2 vigas con daño durante la descarga en campo.',
      time: 'Hace 2 horas',
      type: 'error',
      read: false
    },
    {
      id: 'n2',
      title: '94 Inspecciones pendientes',
      message: 'Lote de fabricación L-102 requiere liberación QC para envío.',
      time: 'Hoy, 08:00 AM',
      type: 'warning',
      read: false
    },
    {
      id: 'n3',
      title: 'Envío despachado con éxito',
      message: 'ENV-00286 en tránsito con 18 piezas hacia Mhotivo.',
      time: 'Ayer, 16:30',
      type: 'success',
      read: true
    }
  ]);

  const addAudit = (arg1: string, arg2: string, arg3: string, arg4?: string) => {
    let user = 'Juan Pérez (Admin)';
    let action = arg1;
    let module = arg2;
    let details = arg3;
    if (arg4 !== undefined) {
      user = arg1;
      action = arg2;
      module = arg3;
      details = arg4;
    }
    const newLog: SystemAuditLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleString('es-ES'),
      user,
      action,
      module,
      details,
      ipAddress: '192.168.10.45'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addProject = (proj: Partial<Project>) => {
    const newP: Project = {
      id: `PRJ-${String(projects.length + 1).padStart(3, '0')}`,
      name: proj.name || 'Nuevo Proyecto',
      ov: proj.ov || `OV-2026-${String(projects.length + 20).padStart(3, '0')}`,
      op: proj.op || `OP-2026-${String(projects.length + 50).padStart(3, '0')}`,
      siteManager: proj.siteManager || {
        name: 'Ing. Carlos Mendoza',
        role: 'Residente de Obra',
        initials: 'CM'
      },
      usersCount: proj.usersCount || 3,
      piecesCount: proj.piecesCount || 150,
      status: proj.status || 'Activo',
      createdAt: 'Hoy',
      progressPercent: 0,
      description: proj.description || 'Proyecto de estructuras metálicas',
      location: proj.location || 'San Pedro Sula'
    };
    setProjects(prev => [newP, ...prev]);
    addAudit('Creación de Proyecto', 'Proyectos', `Proyecto creado: ${newP.name}`);
  };

  const addPiece = (p: Partial<Piece>) => {
    const newPiece: Piece = {
      id: `PC-${String(pieces.length + 1).padStart(3, '0')}`,
      mark: p.mark || `P-${Math.floor(100 + Math.random() * 900)}`,
      type: p.type || 'Viga',
      profile: p.profile || 'W18x50',
      lengthMeters: Number(p.lengthMeters) || 6.0,
      weightKg: Number(p.weightKg) || 350,
      project: p.project || 'Mhotivo',
      status: 'Fabricada',
      qcStatus: 'Pendiente',
      refId: '-',
      fabricationDate: 'Hoy',
      steelGrade: p.steelGrade || 'ASTM A992 Grado 50',
      camberMm: p.camberMm,
      rodLengthMm: p.rodLengthMm,
      threadLengthMm: p.threadLengthMm,
      boltLengthMm: p.boltLengthMm,
      threadLength1Mm: p.threadLength1Mm,
      threadLength2Mm: p.threadLength2Mm,
      plateWidthMm: p.plateWidthMm,
      plateHeightMm: p.plateHeightMm,
      holeDiameterMm: p.holeDiameterMm,
      traceability: [
        { step: 'Corte y Habilitado', date: new Date().toLocaleDateString('es-ES'), operator: 'Planta Alanza', location: 'Nave 1', status: 'completed' },
        { step: 'Inspección QC', date: 'Pendiente', operator: '-', location: 'Bahía QC', status: 'pending' }
      ]
    };
    setPieces(prev => [newPiece, ...prev]);
    
    // Also add to inspections
    const newInsp: QCInspection = {
      id: `QC-${String(inspections.length + 1).padStart(3, '0')}`,
      pieceMark: newPiece.mark,
      type: newPiece.type,
      profile: newPiece.profile,
      project: newPiece.project,
      fabricationDate: newPiece.fabricationDate,
      qcStatus: 'Pendiente',
      inspector: '-'
    };
    setInspections(prev => [newInsp, ...prev]);
    addAudit('Registro de Pieza', 'Piezas', `Pieza registrada: ${newPiece.mark} (${newPiece.project})`);
  };

  const addPiecesBatch = (newPiecesData: Partial<Piece>[]): { addedCount: number; errors: string[] } => {
    if (!newPiecesData || newPiecesData.length === 0) {
      return { addedCount: 0, errors: ['No se enviaron datos de piezas para importar.'] };
    }

    let count = 0;
    const createdPieces: Piece[] = [];
    const createdInspections: QCInspection[] = [];
    const projectCountIncrements: Record<string, number> = {};

    let maxIdNum = pieces.reduce((max, p) => {
      const num = parseInt(p.id.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);

    let maxInspNum = inspections.reduce((max, i) => {
      const num = parseInt(i.id.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);

    newPiecesData.forEach((p) => {
      // Preserve exact mark from Excel/JSON without forced uppercase or auto-suffixing
      let mark = (p.mark || '').trim();
      if (!mark) {
        mark = `P-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      maxIdNum++;
      maxInspNum++;

      const projName = p.project?.trim() || (projects[0]?.name || 'Torre Mítica');
      const pieceLen = Number(p.lengthMeters) > 0 ? Number(p.lengthMeters) : 6.0;
      const pieceWeight = Number(p.weightKg) > 0 ? Number(p.weightKg) : 350;
      
      // Preserve exact profile without falling back to hardcoded profiles
      const pieceProfile = (p.profile || '').trim() || (p.description || '').trim() || '-';
      const pieceDesc = (p.description || '').trim() || (pieceProfile !== '-' ? `${p.type || 'Elemento'} ${pieceProfile}` : `Elemento ${mark}`);

      const newPiece: Piece = {
        id: `PC-${String(maxIdNum).padStart(3, '0')}`,
        mark,
        description: pieceDesc,
        workOrder: p.workOrder || 'OT-2026-IMP',
        type: p.type || 'Viga',
        profile: pieceProfile,
        lengthMeters: pieceLen,
        dimensions: p.dimensions || `${pieceLen.toFixed(2)} m`,
        weightKg: pieceWeight,
        quantity: Number(p.quantity) || 1,
        project: projName,
        status: p.status || 'Fabricada',
        qcStatus: p.qcStatus || 'Pendiente',
        refId: p.refId || `IMP-${String(maxIdNum).padStart(3, '0')}`,
        fabricationDate: p.fabricationDate || 'Hoy',
        steelGrade: p.steelGrade || 'ASTM A992 Grado 50',
        inspector: p.inspector || '-',
        qcNotes: p.qcNotes || 'Pieza importada desde listado Excel/CSV/JSON',
        notes: p.notes || '',
        category: p.category,
        paintAreaM2: p.paintAreaM2,
        paintAreaTotalM2: p.paintAreaTotalM2 || (p.paintAreaM2 && p.quantity ? Number((p.paintAreaM2 * p.quantity).toFixed(2)) : undefined),
        unitWeightKgPerMeter: p.unitWeightKgPerMeter,
        totalWeightKg: p.totalWeightKg || (pieceWeight * (Number(p.quantity) || 1)),
        balance: p.balance !== undefined ? p.balance : (Number(p.quantity) || 1),
        excelRow: p.excelRow,
        camberMm: p.camberMm,
        rodLengthMm: p.rodLengthMm,
        threadLengthMm: p.threadLengthMm,
        boltLengthMm: p.boltLengthMm,
        threadLength1Mm: p.threadLength1Mm,
        threadLength2Mm: p.threadLength2Mm,
        plateWidthMm: p.plateWidthMm,
        plateHeightMm: p.plateHeightMm,
        holeDiameterMm: p.holeDiameterMm,
        traceability: [
          { 
            step: 'Corte y Habilitado', 
            date: new Date().toLocaleDateString('es-ES'), 
            operator: 'Planta Alanza', 
            location: 'Nave 1', 
            status: 'completed' 
          },
          { 
            step: 'Inspección QC', 
            date: 'Pendiente', 
            operator: '-', 
            location: 'Bahía QC', 
            status: 'pending' 
          }
        ]
      };

      createdPieces.push(newPiece);

      const newInsp: QCInspection = {
        id: `QC-${String(maxInspNum).padStart(3, '0')}`,
        pieceMark: newPiece.mark,
        type: newPiece.type,
        profile: newPiece.profile,
        project: newPiece.project,
        fabricationDate: newPiece.fabricationDate,
        qcStatus: 'Pendiente',
        inspector: '-'
      };
      createdInspections.push(newInsp);

      projectCountIncrements[projName] = (projectCountIncrements[projName] || 0) + 1;
      count++;
    });

    setPieces(prev => [...createdPieces, ...prev]);
    setInspections(prev => [...createdInspections, ...prev]);

    // Update piecesCount on related projects
    setProjects(prev => prev.map(proj => {
      const inc = projectCountIncrements[proj.name];
      if (inc) {
        return {
          ...proj,
          piecesCount: proj.piecesCount + inc
        };
      }
      return proj;
    }));

    addAudit(
      'Importación Masiva de Piezas', 
      'Piezas', 
      `Se crearon exitosamente ${count} piezas estructurales a partir de importación Excel/CSV.`
    );

    return { addedCount: count, errors: [] };
  };

  const updatePiece = (
    pieceId: string, 
    updatedFields: Partial<Piece>, 
    modificationReason?: string
  ): { success: boolean; error?: string } => {
    const existing = pieces.find(p => p.id === pieceId || p.mark === pieceId);
    if (!existing) {
      return { success: false, error: 'No se encontró la pieza en el sistema.' };
    }

    // Role check: Only Administrador or Producción can modify pieces
    if (currentUserRole !== 'Administrador' && currentUserRole !== 'Producción') {
      return { 
        success: false, 
        error: 'No cuenta con los permisos necesarios para modificar piezas. Solo Administrador o Producción pueden realizar modificaciones.' 
      };
    }

    // Mark uniqueness check if changed
    if (updatedFields.mark && updatedFields.mark.trim() !== existing.mark) {
      const newMark = updatedFields.mark.trim();
      const duplicate = pieces.find(p => p.id !== existing.id && p.mark === newMark);
      if (duplicate) {
        return { success: false, error: `Ya existe otra pieza registrada con la marca "${newMark}".` };
      }
    }

    // Field mapping to track exact changes for the audit log
    const fieldDefinitions: { key: keyof Piece; label: string; format?: (val: any) => string }[] = [
      { key: 'mark', label: 'Número o Código de Pieza' },
      { key: 'description', label: 'Descripción' },
      { key: 'project', label: 'Proyecto' },
      { key: 'workOrder', label: 'Orden de Trabajo (OT)' },
      { key: 'type', label: 'Tipo de Pieza' },
      { key: 'profile', label: 'Perfil de Acero' },
      { key: 'lengthMeters', label: 'Longitud (m)', format: (v) => `${Number(v).toFixed(2)} m` },
      { key: 'dimensions', label: 'Dimensiones' },
      { key: 'steelGrade', label: 'Material / Grado de Acero' },
      { key: 'weightKg', label: 'Peso (kg)', format: (v) => `${Number(v).toLocaleString()} kg` },
      { key: 'quantity', label: 'Cantidad', format: (v) => `${v ?? 1} und` },
      { key: 'status', label: 'Estado de la Pieza' },
      { key: 'notes', label: 'Observaciones' },
      { key: 'camberMm', label: 'Contra flecha (Joist)', format: (v) => v ? `${v} mm` : '' },
      { key: 'rodLengthMm', label: 'Longitud (Punta roscada)', format: (v) => v ? `${v} mm` : '' },
      { key: 'threadLengthMm', label: 'Longitud de rosca (Punta roscada)', format: (v) => v ? `${v} mm` : '' },
      { key: 'boltLengthMm', label: 'Longitud (Pernos)', format: (v) => v ? `${v} mm` : '' },
      { key: 'threadLength1Mm', label: 'Longitud rosca 1 (Pernos)', format: (v) => v ? `${v} mm` : '' },
      { key: 'threadLength2Mm', label: 'Longitud rosca 2 (Pernos)', format: (v) => v ? `${v} mm` : '' },
      { key: 'plateWidthMm', label: 'Ancho (Placa)', format: (v) => v ? `${v} mm` : '' },
      { key: 'plateHeightMm', label: 'Alto (Placa)', format: (v) => v ? `${v} mm` : '' },
      { key: 'holeDiameterMm', label: 'Diámetro perforación (Placa)', format: (v) => v ? `Ø ${v} mm` : '' }
    ];

    const changes: { fieldLabel: string; prev: string; next: string }[] = [];

    fieldDefinitions.forEach(({ key, label, format }) => {
      if (updatedFields[key] !== undefined) {
        const oldVal = existing[key];
        const newVal = updatedFields[key];
        
        const oldStr = format ? format(oldVal) : String(oldVal ?? '').trim();
        const newStr = format ? format(newVal) : String(newVal ?? '').trim();

        if (oldStr !== newStr && (oldVal !== newVal)) {
          changes.push({
            fieldLabel: label,
            prev: oldStr || '(Vacío)',
            next: newStr || '(Vacío)'
          });
        }
      }
    });

    if (changes.length === 0) {
      return { success: true };
    }

    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    const userName = currentUserRole === 'Administrador' ? 'Juan Pérez (Admin)' : (currentUserRole === 'Producción' ? 'Ing. Roberto M. (Producción)' : 'Inspector QC');

    const newLogItems: PieceModificationLogItem[] = changes.map(ch => ({
      id: `MOD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: dateFormatted,
      timestamp: Date.now(),
      user: userName,
      userRole: currentUserRole,
      field: ch.fieldLabel,
      previousValue: ch.prev,
      newValue: ch.next,
      reason: modificationReason || 'Modificación técnica de pieza'
    }));

    const oldMark = existing.mark;
    const newMark = updatedFields.mark ? updatedFields.mark.trim() : existing.mark;

    setPieces(prev => prev.map(p => {
      if (p.id === existing.id) {
        return {
          ...p,
          ...updatedFields,
          mark: newMark,
          // CRITICAL: Guaranteed preservation of contractor assignments and QC data:
          welderId: p.welderId,
          welderName: p.welderName,
          welderAssignedDate: p.welderAssignedDate,
          welderCompletedDate: p.welderCompletedDate,
          weldingStatus: p.weldingStatus,
          weldingNotes: p.weldingNotes,
          painterId: p.painterId,
          painterName: p.painterName,
          painterAssignedDate: p.painterAssignedDate,
          painterCompletedDate: p.painterCompletedDate,
          paintingStatus: p.paintingStatus,
          paintingNotes: p.paintingNotes,
          assignmentHistory: p.assignmentHistory,
          qcStatus: p.qcStatus,
          heatNumber: p.heatNumber,
          inspector: p.inspector,
          qcNotes: p.qcNotes,
          refId: p.refId,
          // Prepend new modification log items:
          modificationHistory: [
            ...newLogItems,
            ...(p.modificationHistory || [])
          ],
          traceabilityTimeline: [
            {
              stage: 'Modificación de Datos de Pieza',
              date: dateFormatted,
              responsible: userName,
              location: 'Oficina Técnica / Producción',
              details: `Actualización de ${changes.length} campo(s): ${changes.map(c => c.fieldLabel).join(', ')}. ${modificationReason ? `Motivo: ${modificationReason}` : ''}`
            },
            ...(p.traceabilityTimeline || [])
          ]
        };
      }
      return p;
    }));

    // If the mark changed, update the QC inspections so links stay in sync
    if (oldMark !== newMark) {
      setInspections(prev => prev.map(insp => {
        if (insp.pieceMark === oldMark) {
          return {
            ...insp,
            pieceMark: newMark,
            project: updatedFields.project || insp.project,
            type: updatedFields.type || insp.type,
            profile: updatedFields.profile || insp.profile
          };
        }
        return insp;
      }));
    }

    addAudit(
      'Modificación de Pieza', 
      'Piezas', 
      `Pieza ${newMark} modificada por ${userName} (${changes.length} campos actualizados). ${modificationReason ? `Motivo: ${modificationReason}` : ''}`
    );

    return { success: true };
  };

  const deletePiece = (pieceId: string): { success: boolean; error?: string } => {
    const pc = pieces.find(p => p.id === pieceId || p.mark === pieceId);
    if (!pc) return { success: false, error: 'Pieza no encontrada.' };

    const hasContractors = !!pc.welderId || !!pc.painterId || (pc.assignmentHistory && pc.assignmentHistory.length > 0);
    const hasQC = pc.qcStatus !== 'Pendiente' || !!pc.inspector;
    const hasShipment = pc.status === 'Enviada' || pc.status === 'Recibida';

    if (hasContractors || hasQC || hasShipment) {
      return {
        success: false,
        error: 'No está permitido eliminar físicamente una pieza que ya cuenta con procesos de soldadura/pintura, registros en QC o historial de envíos. La normativa de trazabilidad exige mantener el registro histórico inalterable.'
      };
    }

    setPieces(prev => prev.filter(p => p.id !== pc.id));
    addAudit('Eliminación de Pieza', 'Piezas', `Pieza ${pc.mark} eliminada (sin procesos previos)`);
    return { success: true };
  };

  const addContractor = (c: {
    name: string;
    type: ContractorType;
    phone: string;
    email: string;
    identification?: string;
    status?: ContractorStatus;
    notes?: string;
  }) => {
    const nextNum = contractors.length + 1;
    const newId = `CONT-${String(nextNum).padStart(3, '0')}`;
    const newCont: Contractor = {
      id: newId,
      name: c.name.trim(),
      type: c.type,
      phone: c.phone.trim(),
      email: c.email.trim(),
      identification: c.identification?.trim() || '',
      status: c.status || 'Activo',
      notes: c.notes?.trim() || '',
      createdAt: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      createdBy: currentUserRole === 'Administrador' ? 'Juan Pérez (Admin)' : `${currentUserRole}`
    };

    setContractors(prev => [...prev, newCont]);
    addAudit('Alta de Contratista', 'Contratistas', `Registrado contratista: ${newCont.name} (${newCont.type}, ${newCont.id})`);
  };

  const updateContractor = (id: string, updates: Partial<Contractor>) => {
    setContractors(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          ...updates,
          updatedAt: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
          updatedBy: currentUserRole === 'Administrador' ? 'Juan Pérez (Admin)' : `${currentUserRole}`
        };
      }
      return c;
    }));
    addAudit('Edición de Contratista', 'Contratistas', `Contratista ID ${id} actualizado`);
  };

  const toggleContractorStatus = (id: string) => {
    setContractors(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus: ContractorStatus = c.status === 'Activo' ? 'Inactivo' : 'Activo';
        addAudit('Cambio de Estado', 'Contratistas', `Contratista ${c.name} (${c.id}) cambiado a ${nextStatus}`);
        return {
          ...c,
          status: nextStatus,
          updatedAt: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
          updatedBy: currentUserRole === 'Administrador' ? 'Juan Pérez (Admin)' : `${currentUserRole}`
        };
      }
      return c;
    }));
  };

  const assignWorkToPiece = (pieceMarkOrParams: any, maybeDetails?: any) => {
    let params: any;
    if (typeof pieceMarkOrParams === 'string') {
      const mark = pieceMarkOrParams;
      const details = maybeDetails || {};
      if (details.process === 'Soldadura') {
        const cName = contractors.find(c => c.id === details.contractorId)?.name || '';
        params = {
          pieceMark: mark,
          welderId: details.contractorId,
          welderName: cName,
          weldingStatus: details.status,
          welderAssignedDate: details.assignedDate,
          welderCompletedDate: details.completedDate,
          weldingNotes: details.notes || details.reassignmentReason,
          notes: details.notes || details.reassignmentReason
        };
      } else if (details.process === 'Pintura') {
        const cName = contractors.find(c => c.id === details.contractorId)?.name || '';
        params = {
          pieceMark: mark,
          painterId: details.contractorId,
          painterName: cName,
          paintingStatus: details.status,
          painterAssignedDate: details.assignedDate,
          painterCompletedDate: details.completedDate,
          paintingNotes: details.notes || details.reassignmentReason,
          notes: details.notes || details.reassignmentReason
        };
      } else {
        params = { pieceMark: mark, ...details };
      }
    } else {
      params = pieceMarkOrParams;
    }

    const nowStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const userStr = currentUserRole === 'Administrador' ? 'Juan Pérez (Admin)' : `${currentUserRole}`;

    setPieces(prev => prev.map(piece => {
      if (piece.mark === params.pieceMark || piece.id === params.pieceMark) {
        const history: WorkAssignmentHistoryItem[] = [...(piece.assignmentHistory || [])];

        // 1. Check Welder Changes
        const isNewWelder = params.welderId !== undefined && params.welderId !== piece.welderId;
        const isWelderReassigned = isNewWelder && !!piece.welderId && !!params.welderId;
        const isWelderStatusChanged = params.weldingStatus !== undefined && params.weldingStatus !== piece.weldingStatus;

        if (isWelderReassigned) {
          history.push({
            id: `H-${Date.now()}-W1`,
            date: nowStr,
            process: 'Soldadura',
            contractorId: params.welderId,
            contractorName: params.welderName || '',
            previousContractorName: piece.welderName,
            action: `Reemplazado por ${params.welderName}`,
            status: params.weldingStatus || piece.weldingStatus || 'Asignado',
            user: userStr,
            notes: `${piece.welderName} → reemplazado por ${params.welderName}${params.notes ? ` (${params.notes})` : ''}`
          });
        } else if (isNewWelder && params.welderId) {
          history.push({
            id: `H-${Date.now()}-W2`,
            date: nowStr,
            process: 'Soldadura',
            contractorId: params.welderId,
            contractorName: params.welderName || '',
            action: 'Asignado',
            status: params.weldingStatus || 'Asignado',
            user: userStr,
            notes: params.weldingNotes || params.notes || 'Asignación de trabajo de soldadura'
          });
        } else if (isWelderStatusChanged && params.weldingStatus) {
          history.push({
            id: `H-${Date.now()}-W3`,
            date: nowStr,
            process: 'Soldadura',
            contractorId: piece.welderId,
            contractorName: piece.welderName,
            action: params.weldingStatus,
            status: params.weldingStatus,
            user: userStr,
            notes: params.weldingNotes || `Estado actualizado a ${params.weldingStatus}`
          });
        }

        // 2. Check Painter Changes
        const isNewPainter = params.painterId !== undefined && params.painterId !== piece.painterId;
        const isPainterReassigned = isNewPainter && !!piece.painterId && !!params.painterId;
        const isPainterStatusChanged = params.paintingStatus !== undefined && params.paintingStatus !== piece.paintingStatus;

        if (isPainterReassigned) {
          history.push({
            id: `H-${Date.now()}-P1`,
            date: nowStr,
            process: 'Pintura',
            contractorId: params.painterId,
            contractorName: params.painterName || '',
            previousContractorName: piece.painterName,
            action: `Reemplazado por ${params.painterName}`,
            status: params.paintingStatus || piece.paintingStatus || 'Asignado',
            user: userStr,
            notes: `${piece.painterName} → reemplazado por ${params.painterName}${params.notes ? ` (${params.notes})` : ''}`
          });
        } else if (isNewPainter && params.painterId) {
          history.push({
            id: `H-${Date.now()}-P2`,
            date: nowStr,
            process: 'Pintura',
            contractorId: params.painterId,
            contractorName: params.painterName || '',
            action: 'Asignado',
            status: params.paintingStatus || 'Asignado',
            user: userStr,
            notes: params.paintingNotes || params.notes || 'Asignación de trabajo de pintura'
          });
        } else if (isPainterStatusChanged && params.paintingStatus) {
          history.push({
            id: `H-${Date.now()}-P3`,
            date: nowStr,
            process: 'Pintura',
            contractorId: piece.painterId,
            contractorName: piece.painterName,
            action: params.paintingStatus,
            status: params.paintingStatus,
            user: userStr,
            notes: params.paintingNotes || `Estado actualizado a ${params.paintingStatus}`
          });
        }

        // 3. Update Traceability Steps
        const nextTrace = [...(piece.traceability || [])];
        const effectiveWelder = params.welderName !== undefined ? params.welderName : piece.welderName;
        const effectivePainter = params.painterName !== undefined ? params.painterName : piece.painterName;
        const effectiveWeldingStatus = params.weldingStatus !== undefined ? params.weldingStatus : piece.weldingStatus;
        const effectivePaintingStatus = params.paintingStatus !== undefined ? params.paintingStatus : piece.paintingStatus;

        if (effectiveWelder) {
          const weldStepIdx = nextTrace.findIndex(t => t.step.toLowerCase().includes('soldadura') || t.step.toLowerCase().includes('armado'));
          if (weldStepIdx >= 0) {
            nextTrace[weldStepIdx] = {
              ...nextTrace[weldStepIdx],
              operator: `${effectiveWelder} (Soldador)`,
              status: effectiveWeldingStatus === 'Completado' ? 'completed' : (effectiveWeldingStatus === 'En proceso' ? 'in_progress' : 'pending')
            };
          } else {
            nextTrace.push({
              step: 'Armado y Soldadura',
              date: params.welderAssignedDate || nowStr,
              operator: `${effectiveWelder} (Soldador)`,
              location: 'Estación de Soldadura',
              status: effectiveWeldingStatus === 'Completado' ? 'completed' : (effectiveWeldingStatus === 'En proceso' ? 'in_progress' : 'pending')
            });
          }
        }

        if (effectivePainter) {
          const paintStepIdx = nextTrace.findIndex(t => t.step.toLowerCase().includes('pintura') || t.step.toLowerCase().includes('granallado'));
          if (paintStepIdx >= 0) {
            nextTrace[paintStepIdx] = {
              ...nextTrace[paintStepIdx],
              operator: `${effectivePainter} (Pintor)`,
              status: effectivePaintingStatus === 'Completado' ? 'completed' : (effectivePaintingStatus === 'En proceso' ? 'in_progress' : 'pending')
            };
          } else {
            nextTrace.push({
              step: 'Granallado y Pintura',
              date: params.painterAssignedDate || nowStr,
              operator: `${effectivePainter} (Pintor)`,
              location: 'Cabina de Pintura',
              status: effectivePaintingStatus === 'Completado' ? 'completed' : (effectivePaintingStatus === 'En proceso' ? 'in_progress' : 'pending')
            });
          }
        }

        return {
          ...piece,
          welderId: params.welderId !== undefined ? params.welderId : piece.welderId,
          welderName: params.welderName !== undefined ? params.welderName : piece.welderName,
          welderAssignedDate: params.welderAssignedDate !== undefined ? params.welderAssignedDate : piece.welderAssignedDate,
          welderCompletedDate: params.welderCompletedDate !== undefined ? params.welderCompletedDate : piece.welderCompletedDate,
          weldingStatus: effectiveWeldingStatus,
          weldingNotes: params.weldingNotes !== undefined ? params.weldingNotes : piece.weldingNotes,

          painterId: params.painterId !== undefined ? params.painterId : piece.painterId,
          painterName: params.painterName !== undefined ? params.painterName : piece.painterName,
          painterAssignedDate: params.painterAssignedDate !== undefined ? params.painterAssignedDate : piece.painterAssignedDate,
          painterCompletedDate: params.painterCompletedDate !== undefined ? params.painterCompletedDate : piece.painterCompletedDate,
          paintingStatus: effectivePaintingStatus,
          paintingNotes: params.paintingNotes !== undefined ? params.paintingNotes : piece.paintingNotes,

          assignmentHistory: history,
          traceability: nextTrace
        };
      }
      return piece;
    }));

    addAudit('Asignación de Trabajo', 'Contratistas', `Asignación actualizada para viga/pieza: ${params.pieceMark}`);
  };

  const submitQCInspection = (id: string, status: QCStatus, notes: string, inspector: string) => {
    performQCInspection(id, status, notes, inspector);
  };

  const performQCInspection = (id: string, status: QCStatus, notes: string, inspector: string) => {
    setInspections(prev => prev.map(insp => {
      if (insp.id === id || insp.pieceMark === id) {
        return {
          ...insp,
          qcStatus: status,
          inspector: inspector || 'Juan Pérez',
          inspectionDate: 'Hoy, ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          notes
        };
      }
      return insp;
    }));

    // Update piece qcStatus
    setPieces(prev => prev.map(pc => {
      if (pc.id === id || pc.mark === id) {
        const pieceStatus: PieceStatus = status === 'Aprobada' ? 'Fabricada' : (status === 'Rechazada' ? 'Incidencia' : pc.status);
        const trace = [...(pc.traceability || [])];
        trace.push({
          step: 'Inspección QC',
          date: new Date().toLocaleString('es-ES'),
          operator: inspector || 'Juan Pérez',
          location: 'Bahía QC',
          status: status === 'Aprobada' ? 'completed' : (status === 'Rechazada' ? 'failed' : 'in_progress'),
          notes
        });
        return {
          ...pc,
          qcStatus: status,
          status: pieceStatus,
          inspector: inspector || 'Juan Pérez',
          qcNotes: notes,
          traceability: trace
        };
      }
      return pc;
    }));

    if (status === 'Rechazada') {
      // Auto-create incident
      const newInc: Incident = {
        id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
        severity: 'Alta',
        shortDescription: `Rechazo en inspección QC de pieza ${id}`,
        details: notes || 'Fallo en criterios de aceptación de control de calidad.',
        origin: `Pieza: ${id}`,
        responsible: inspector || 'Control Calidad',
        category: 'Calidad',
        status: 'Abierta',
        date: 'Hoy'
      };
      setIncidents(prev => [newInc, ...prev]);
    }

    addAudit('Inspección QC', 'Inspecciones QC', `Evaluación QC para pieza ${id}: ${status}`);
  };

  const batchPerformQCInspection = (pieceMarksOrIds: string[], status: QCStatus, notes: string = '', inspector: string = 'Juan Pérez') => {
    if (!pieceMarksOrIds || pieceMarksOrIds.length === 0) return;

    setInspections(prev => prev.map(insp => {
      if (pieceMarksOrIds.includes(insp.id) || pieceMarksOrIds.includes(insp.pieceMark)) {
        return {
          ...insp,
          qcStatus: status,
          inspector: inspector || 'Juan Pérez',
          inspectionDate: 'Hoy, ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          notes: notes || `Inspección en lote: ${status}`
        };
      }
      return insp;
    }));

    setPieces(prev => prev.map(pc => {
      if (pieceMarksOrIds.includes(pc.id) || pieceMarksOrIds.includes(pc.mark)) {
        const pieceStatus: PieceStatus = status === 'Aprobada' ? 'Fabricada' : (status === 'Rechazada' ? 'Incidencia' : pc.status);
        const trace = [...(pc.traceability || [])];
        trace.push({
          step: 'Inspección QC (Lote)',
          date: new Date().toLocaleString('es-ES'),
          operator: inspector || 'Juan Pérez',
          location: 'Bahía QC',
          status: status === 'Aprobada' ? 'completed' : (status === 'Rechazada' ? 'failed' : 'in_progress'),
          notes: notes || `Liberación en lote: ${status}`
        });
        return {
          ...pc,
          qcStatus: status,
          status: pieceStatus,
          inspector: inspector || 'Juan Pérez',
          qcNotes: notes || `Liberación en lote: ${status}`,
          traceability: trace
        };
      }
      return pc;
    }));

    addAudit('Inspección QC en Lote', 'Inspecciones QC', `Evaluación QC masiva para ${pieceMarksOrIds.length} piezas: ${status}`);
  };

  const batchUpdatePieceStatus = (pieceMarksOrIds: string[], status: PieceStatus) => {
    if (!pieceMarksOrIds || pieceMarksOrIds.length === 0) return;

    setPieces(prev => prev.map(p => {
      if (pieceMarksOrIds.includes(p.id) || pieceMarksOrIds.includes(p.mark)) {
        return { ...p, status };
      }
      return p;
    }));

    addAudit('Actualización en Lote', 'Piezas', `Cambio de estado a "${status}" para ${pieceMarksOrIds.length} piezas`);
  };

  const createShipment = (ship: Partial<Shipment>) => {
    const newShip: Shipment = {
      id: `ENV-${String(shipments.length + 288).padStart(5, '0')}`,
      project: ship.project || 'Mhotivo',
      date: 'Hoy, ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      piecesCount: ship.pieces?.length || Number(ship.piecesCount) || 12,
      totalWeightTons: Number(ship.totalWeightTons) || 8.5,
      carrier: ship.carrier || 'Logística Rápida SA',
      driverName: ship.driverName || 'Conductor Asignado',
      truckPlates: ship.truckPlates || 'HN-5541-AA',
      manager: 'Juan Pérez',
      status: 'En preparación',
      destination: ship.destination || 'Sitio de Obra',
      pieces: ship.pieces || ['2S-38B', 'V-201B']
    };
    setShipments(prev => [newShip, ...prev]);

    // Update piece status to Enviada
    if (ship.pieces && ship.pieces.length > 0) {
      setPieces(prev => prev.map(p => {
        if (ship.pieces?.includes(p.mark)) {
          return { ...p, status: 'Enviada', refId: newShip.id };
        }
        return p;
      }));
    }

    addAudit('Creación de Envío', 'Envíos', `Envío despachado: ${newShip.id} (${newShip.piecesCount} piezas)`);
  };

  const updateReceptionPieceStatus = (mark: string, status: 'Recibida' | 'Dañada' | 'Faltante', notes?: string) => {
    setReceptionSession(prev => {
      const updatedItems = prev.items.map(item => {
        if (item.mark === mark) {
          return {
            ...item,
            status,
            verifiedAt: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            notes: notes || item.notes
          };
        }
        return item;
      });

      const verifiedCount = updatedItems.filter(i => i.status === 'Recibida' || i.status === 'Dañada').length;
      const hasDmg = updatedItems.some(i => i.status === 'Dañada' || i.status === 'Faltante');

      return {
        ...prev,
        items: updatedItems,
        verifiedCount,
        hasIncidentAlert: hasDmg,
        incidentMessage: hasDmg ? `Discrepancia detectada en la pieza ${mark}. Estado marcado como ${status}.` : undefined
      };
    });

    // Also update pieces database
    setPieces(prev => prev.map(p => {
      if (p.mark === mark) {
        return {
          ...p,
          status: status === 'Recibida' ? 'Recibida' : 'Incidencia',
          refId: status === 'Recibida' ? `REC-${Math.floor(1000 + Math.random() * 9000)}` : p.refId
        };
      }
      return p;
    }));

    addAudit('Verificación en Campo', 'Recepción en Campo', `Pieza ${mark} verificada como ${status}`);
  };

  const completeReceptionSession = (signerName: string, signatureDataUrl: string) => {
    setReceptionSession(prev => ({
      ...prev,
      status: 'Completado',
      signedBy: signerName,
      signature: signatureDataUrl,
      signedAt: new Date().toLocaleString('es-ES')
    }));

    addAudit('Firma de Recepción', 'Recepción en Campo', `Manifiesto firmado por ${signerName}`);
  };

  const adjustStock = (sku: string, delta: number, reason: string) => {
    setInventory(prev => prev.map(item => {
      if (item.sku === sku) {
        const nextStock = Math.max(0, item.currentStock + delta);
        let status = item.status;
        if (nextStock <= item.minThreshold) {
          status = 'CRÍTICO';
        } else if (nextStock < item.minThreshold * 1.5) {
          status = 'REABASTECER';
        } else {
          status = 'ÓPTIMO';
        }
        return {
          ...item,
          currentStock: nextStock,
          status
        };
      }
      return item;
    }));

    addAudit('Ajuste de Inventario', 'Inventario', `Ajuste en SKU ${sku}: ${delta > 0 ? '+' : ''}${delta} unidades (${reason})`);
  };

  const addIncident = (inc: Partial<Incident>) => {
    const newInc: Incident = {
      id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      severity: inc.severity || 'Media',
      shortDescription: inc.shortDescription || 'Incidencia operativa',
      details: inc.details || '',
      origin: inc.origin || 'Planta',
      responsible: inc.responsible || 'Juan Pérez',
      category: inc.category || 'Calidad',
      status: 'Abierta',
      date: 'Hoy',
      resolutionTimeEstimate: inc.resolutionTimeEstimate || '24 hrs'
    };
    setIncidents(prev => [newInc, ...prev]);
    addAudit('Registro de Incidencia', 'Incidencias', `Incidencia registrada: ${newInc.id} (${newInc.severity})`);
  };

  const resolveIncident = (id: string, solutionNotes: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return {
          ...inc,
          status: 'Resuelta',
          solutionNotes
        };
      }
      return inc;
    }));
    addAudit('Resolución de Incidencia', 'Incidencias', `Incidencia ${id} resuelta con éxito`);
  };

  const addUser = (usr: Partial<UserItem>) => {
    const newU: UserItem = {
      id: `USR-${String(users.length + 1).padStart(2, '0')}`,
      username: usr.username || `user${users.length + 1}`,
      name: usr.name || 'Nuevo Usuario',
      email: usr.email || 'usuario@alanza.com',
      area: usr.area || 'Planta',
      role: usr.role || 'Residente de campo',
      status: 'Activo',
      lastAccess: 'Nunca'
    };
    setUsers(prev => [newU, ...prev]);
    addAudit('Creación de Usuario', 'Usuarios y Permisos', `Usuario creado: ${newU.username} (${newU.role})`);
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Activo' ? 'Inactivo' : 'Activo';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const exportToCSV = (filename: string, rows: Record<string, any>[]) => {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => headers.map(header => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        globalSearch,
        setGlobalSearch,
        selectedProjectFilter,
        setSelectedProjectFilter,
        selectedTimeRangeFilter,
        setSelectedTimeRangeFilter,
        isFieldHighContrastMode,
        setIsFieldHighContrastMode,
        currentUserRole,
        setCurrentUserRole,
        isAuthenticated,
        setIsAuthenticated,
        logout,
        login,
        projects,
        pieces,
        contractors,
        inspections,
        shipments,
        receptionSession,
        inventory,
        incidents,
        users,
        auditLogs,
        notifications,
        selectedPieceForTraceability,
        setSelectedPieceForTraceability,
        selectedPieceForDetail,
        setSelectedPieceForDetail,
        selectedInspectionForQC,
        setSelectedInspectionForQC,
        selectedShipmentForPrint,
        setSelectedShipmentForPrint,
        isNewProjectModalOpen,
        setIsNewProjectModalOpen,
        isNewPieceModalOpen,
        setIsNewPieceModalOpen,
        isImportPiecesModalOpen,
        setIsImportPiecesModalOpen,
        isNewShipmentModalOpen,
        setIsNewShipmentModalOpen,
        isNewIncidentModalOpen,
        setIsNewIncidentModalOpen,
        isNewUserModalOpen,
        setIsNewUserModalOpen,
        isStockAdjustModalOpen,
        setIsStockAdjustModalOpen,
        isSignatureModalOpen,
        setIsSignatureModalOpen,
        activeReportModal,
        setActiveReportModal,
        activeConfigDetail,
        setActiveConfigDetail,
        notificationDrawerOpen,
        setNotificationDrawerOpen,
        isNewContractorModalOpen,
        setIsNewContractorModalOpen,
        editingContractor,
        setEditingContractor,
        isAssignWorkModalOpen,
        setIsAssignWorkModalOpen,
        selectedPieceForAssignment,
        setSelectedPieceForAssignment,
        selectedContractorForHistory,
        setSelectedContractorForHistory,
        selectedPieceForEdit,
        setSelectedPieceForEdit,
        isEditPieceModalOpen,
        setIsEditPieceModalOpen,
        selectedPieceForHistoryModal,
        setSelectedPieceForHistoryModal,
        addProject,
        addPiece,
        addPiecesBatch,
        updatePiece,
        deletePiece,
        addContractor,
        updateContractor,
        toggleContractorStatus,
        assignWorkToPiece,
        performQCInspection,
        submitQCInspection,
        batchPerformQCInspection,
        batchUpdatePieceStatus,
        createShipment,
        addShipment: createShipment,
        updateReceptionPieceStatus,
        completeReceptionSession,
        signReceptionSession: completeReceptionSession,
        adjustStock,
        addIncident,
        resolveIncident,
        addUser,
        toggleUserStatus,
        markNotificationsAsRead,
        exportToCSV,
        addAudit,
        playFeedbackSound
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
