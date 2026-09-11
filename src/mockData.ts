import { 
  Project, 
  Piece, 
  QCInspection, 
  Shipment, 
  ReceptionSession, 
  InventoryItem, 
  Incident, 
  UserItem, 
  SystemAuditLog,
  Contractor
} from './types';

export const INITIAL_CONTRACTORS: Contractor[] = [
  {
    id: 'CONT-001',
    name: 'Juan Pérez',
    type: 'Soldador',
    phone: '+504 9845-1234',
    email: 'jperez.soldaduras@metalhn.com',
    identification: '0801-1985-12044',
    status: 'Activo',
    notes: 'Soldador Calificado 6G AWS D1.1 / ASME IX vigente. Especialista en marcos rígidos.',
    createdAt: '01 Ene 2026',
    createdBy: 'Juan Pérez (Admin)'
  },
  {
    id: 'CONT-002',
    name: 'Roberto Díaz',
    type: 'Soldador',
    phone: '+504 9912-4455',
    email: 'rdiaz.estructuras@outlook.com',
    identification: '0501-1988-04921',
    status: 'Activo',
    notes: 'Soldador SMAW / FCAW calificado para perfiles pesados W y placas de conexión.',
    createdAt: '05 Ene 2026',
    createdBy: 'Juan Pérez (Admin)'
  },
  {
    id: 'CONT-003',
    name: 'Luis Soto',
    type: 'Soldador',
    phone: '+504 9760-3321',
    email: 'lsoto.talleres@gmail.com',
    identification: '0101-1992-18239',
    status: 'Activo',
    notes: 'Soldador estructural en taller nave 2. Armado de cartelas y atiezadores.',
    createdAt: '12 Ene 2026',
    createdBy: 'Juan Pérez (Admin)'
  },
  {
    id: 'CONT-004',
    name: 'Marco Tulio Flores',
    type: 'Soldador',
    phone: '+504 9540-8812',
    email: 'mflores.saw@gmail.com',
    identification: '0801-1982-01944',
    status: 'Activo',
    notes: 'Operador de arco sumergido (SAW) para vigas armadas de alma llena y cajón.',
    createdAt: '20 Ene 2026',
    createdBy: 'Juan Pérez (Admin)'
  },
  {
    id: 'CONT-005',
    name: 'Carlos Almendárez',
    type: 'Soldador',
    phone: '+504 9677-1100',
    email: 'calmendarez@gmail.com',
    identification: '0501-1979-00213',
    status: 'Inactivo',
    notes: 'Inactivo temporalmente por incapacidad médica. Conserva historial de 14 trabajos anteriores.',
    createdAt: '15 Feb 2026',
    createdBy: 'Juan Pérez (Admin)',
    updatedAt: '28 Feb 2026',
    updatedBy: 'Juan Pérez (Admin)'
  },
  {
    id: 'CONT-006',
    name: 'Carlos López',
    type: 'Pintor',
    phone: '+504 9823-7744',
    email: 'clopez.recubrimientos@gmail.com',
    identification: '0801-1990-23912',
    status: 'Activo',
    notes: 'Pintor industrial calificado SSPC / NACE Nivel 1. Aplicación airless.',
    createdAt: '03 Ene 2026',
    createdBy: 'Juan Pérez (Admin)'
  },
  {
    id: 'CONT-007',
    name: 'Pedro Martínez',
    type: 'Pintor',
    phone: '+504 9988-1122',
    email: 'pmartinez.paint@yahoo.com',
    identification: '0501-1986-09123',
    status: 'Activo',
    notes: 'Aplicador de esquemas epóxicos bicomponente y acabado en poliuretano.',
    createdAt: '10 Ene 2026',
    createdBy: 'Juan Pérez (Admin)'
  },
  {
    id: 'CONT-008',
    name: 'Miguel Ángel Ramos',
    type: 'Pintor',
    phone: '+504 9456-7890',
    email: 'mramos.industrial@gmail.com',
    identification: '0101-1994-05182',
    status: 'Activo',
    notes: 'Preparación superficial con granallado abrasivo SSPC-SP10 y primario de zinc.',
    createdAt: '18 Ene 2026',
    createdBy: 'Juan Pérez (Admin)'
  },
  {
    id: 'CONT-009',
    name: 'José Estrada',
    type: 'Pintor',
    phone: '+504 9712-6543',
    email: 'jestrada.pinturas@hotmail.com',
    identification: '0801-1991-11847',
    status: 'Activo',
    notes: 'Pintor de taller para capas anticorrosivas de secado rápido.',
    createdAt: '22 Ene 2026',
    createdBy: 'Juan Pérez (Admin)'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'PRJ-001',
    name: 'Mhotivo',
    ov: 'OV-2026-015',
    op: 'OP-2026-041',
    siteManager: {
      name: 'Juan Pérez',
      role: 'Residente de Campo',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      initials: 'JP'
    },
    usersCount: 3,
    piecesCount: 280,
    status: 'Activo',
    createdAt: '12 Oct 2023',
    progressPercent: 66.4,
    description: 'Estructura metálica para centro educativo y complejo deportivo Mhotivo.',
    location: 'Sector Norte, San Pedro Sula'
  },
  {
    id: 'PRJ-002',
    name: 'Torre Altus Sur',
    ov: 'OV-2026-018',
    op: 'OP-2026-045',
    siteManager: {
      name: 'Maria Rodriguez',
      role: 'Supervisora de Estructuras',
      initials: 'MR'
    },
    usersCount: 5,
    piecesCount: 1450,
    status: 'Activo',
    createdAt: '05 Nov 2023',
    progressPercent: 42.0,
    description: 'Edificio corporativo de 18 niveles con marco rígido sismorresistente.',
    location: 'Distrito Financiero'
  },
  {
    id: 'PRJ-003',
    name: 'Nave Industrial Zenith',
    ov: 'OV-2026-022',
    op: 'OP-2026-051',
    siteManager: {
      name: 'Carlos Gomez',
      role: 'Gerente de Sitio',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      initials: 'CG'
    },
    usersCount: 2,
    piecesCount: 890,
    status: 'Retrasado',
    createdAt: '18 Dic 2023',
    progressPercent: 28.5,
    description: 'Planta de ensamblaje con armaduras de celosía de 40m de claro libre.',
    location: 'Parque Industrial Sur'
  },
  {
    id: 'PRJ-004',
    name: 'Torre Mítica',
    ov: 'OV-2026-025',
    op: 'OP-2026-058',
    siteManager: {
      name: 'Ana Silva',
      role: 'Ingeniera Residente',
      initials: 'AS'
    },
    usersCount: 4,
    piecesCount: 3200,
    status: 'Activo',
    createdAt: '10 Ene 2024',
    progressPercent: 78.0,
    description: 'Complejo mixto residencial y comercial con vigas tipo cajón.',
    location: 'Avenida Las Palmas'
  }
];

export const INITIAL_PIECES: Piece[] = [
  {
    id: 'PC-125',
    mark: 'V-00125',
    description: 'Viga principal de marco sismorresistente eje 2-C',
    workOrder: 'OT-2026-084',
    type: 'Viga',
    profile: 'W24x76',
    lengthMeters: 10.500,
    dimensions: '10.50 x 0.61 x 0.23 m',
    weightKg: 798,
    quantity: 1,
    project: 'Mhotivo',
    status: 'Fabricada',
    qcStatus: 'Aprobada',
    refId: 'ENV-00286',
    fabricationDate: '03 Sep 2026',
    heatNumber: 'HT-992-8812',
    steelGrade: 'ASTM A992 Grado 50',
    inspector: 'Ing. Ana Gómez',
    qcNotes: 'Inspección de soldadura AWS D1.1 y espesor de pintura epóxica conforme.',
    notes: 'Requiere izaje con balancín de doble eslinga por claro mayor a 10 metros.',
    welderId: 'CONT-001',
    welderName: 'Juan Pérez',
    welderAssignedDate: '02/09/2026',
    welderCompletedDate: '03/09/2026',
    weldingStatus: 'Completado',
    weldingNotes: 'Cordón continuo 5/16 en patines y placas de conexión.',
    painterId: 'CONT-006',
    painterName: 'Carlos López',
    painterAssignedDate: '03/09/2026',
    painterCompletedDate: '04/09/2026',
    paintingStatus: 'Completado',
    paintingNotes: 'Primer epóxico 3.5 mils + acabado poliuretano 3.0 mils.',
    assignmentHistory: [
      { id: 'H-01', date: '02/09/2026 08:30', process: 'Soldadura', contractorId: 'CONT-001', contractorName: 'Juan Pérez', action: 'Asignado', status: 'Asignado', user: 'Juan Pérez (Admin)', notes: 'Asignación para armado de viga principal' },
      { id: 'H-02', date: '03/09/2026 14:10', process: 'Soldadura', contractorId: 'CONT-001', contractorName: 'Juan Pérez', action: 'Completado', status: 'Completado', user: 'Juan Pérez (Admin)', notes: 'Soldadura concluida y liberada preliminarmente' },
      { id: 'H-03', date: '03/09/2026 15:00', process: 'Pintura', contractorId: 'CONT-006', contractorName: 'Carlos López', action: 'Asignado', status: 'Asignado', user: 'Juan Pérez (Admin)', notes: 'Pase a cabina de granallado y pintura' },
      { id: 'H-04', date: '04/09/2026 11:20', process: 'Pintura', contractorId: 'CONT-006', contractorName: 'Carlos López', action: 'Completado', status: 'Completado', user: 'Juan Pérez (Admin)', notes: 'Curado completo verificado' }
    ],
    modificationHistory: [
      {
        id: 'MOD-001',
        date: '04/09/2026 10:15',
        timestamp: Date.now() - 3600000,
        user: 'Juan Pérez',
        userRole: 'Administrador',
        field: 'Descripción',
        previousValue: 'Viga principal',
        newValue: 'Viga principal de marco sismorresistente eje 2-C',
        reason: 'Ajuste de especificación según adenda plano DWG-E-04'
      },
      {
        id: 'MOD-002',
        date: '04/09/2026 10:18',
        timestamp: Date.now() - 3400000,
        user: 'Juan Pérez',
        userRole: 'Administrador',
        field: 'Dimensiones / Longitud',
        previousValue: '10.30 m',
        newValue: '10.50 m',
        reason: 'Recalibramiento con tolerancia milimétrica en mesa de corte CNC'
      }
    ],
    traceability: [
      { step: 'Corte y Habilitado', date: '01 Sep 2026 09:00', operator: 'M. López', location: 'Mesa CNC', status: 'completed' },
      { step: 'Armado y Soldadura', date: '03 Sep 2026 14:10', operator: 'Juan Pérez (Soldador)', location: 'Estación 1', status: 'completed' },
      { step: 'Pintura y Recubrimiento', date: '04 Sep 2026 11:20', operator: 'Carlos López (Pintor)', location: 'Cabina 2', status: 'completed' },
      { step: 'Inspección QC', date: '04 Sep 2026 16:00', operator: 'Ing. Ana Gómez', location: 'Bahía QC', status: 'completed' }
    ]
  },
  {
    id: 'PC-126',
    mark: 'V-00126',
    description: 'Viga perimetral de cubierta eje C-4',
    workOrder: 'OT-2026-084',
    type: 'Viga',
    profile: 'W21x62',
    lengthMeters: 8.400,
    dimensions: '8.40 x 0.53 x 0.21 m',
    weightKg: 520,
    quantity: 1,
    project: 'Mhotivo',
    status: 'Fabricada',
    qcStatus: 'Pendiente',
    refId: '-',
    fabricationDate: '03 Sep 2026',
    heatNumber: 'HT-992-8814',
    steelGrade: 'ASTM A992 Grado 50',
    welderId: 'CONT-001',
    welderName: 'Juan Pérez',
    welderAssignedDate: '03/09/2026',
    weldingStatus: 'En proceso',
    weldingNotes: 'En proceso de soldadura de atiezadores intermedios.',
    paintingStatus: 'Pendiente',
    assignmentHistory: [
      { id: 'H-05', date: '03/09/2026 09:00', process: 'Soldadura', contractorId: 'CONT-001', contractorName: 'Juan Pérez', action: 'Asignado', status: 'Asignado', user: 'Juan Pérez (Admin)' },
      { id: 'H-06', date: '03/09/2026 13:30', process: 'Soldadura', contractorId: 'CONT-001', contractorName: 'Juan Pérez', action: 'En proceso', status: 'En proceso', user: 'Ing. Roberto M. (Producción)' }
    ],
    modificationHistory: [
      {
        id: 'MOD-003',
        date: '04/09/2026 14:30',
        timestamp: Date.now() - 7200000,
        user: 'Ing. Roberto M. (Producción)',
        userRole: 'Producción',
        field: 'Peso (kg)',
        previousValue: '512 kg',
        newValue: '520 kg',
        reason: 'Ajuste de cubicación por adición de placas atiezadoras según plano DWG-E-05'
      }
    ]
  },
  {
    id: 'PC-127',
    mark: 'V-00127',
    type: 'Viga',
    profile: 'W18x50',
    lengthMeters: 7.200,
    weightKg: 360,
    project: 'Torre Altus Sur',
    status: 'Fabricada',
    qcStatus: 'Pendiente',
    refId: '-',
    fabricationDate: '04 Sep 2026',
    heatNumber: 'HT-992-8820',
    steelGrade: 'ASTM A992 Grado 50',
    welderId: 'CONT-002',
    welderName: 'Roberto Díaz',
    welderAssignedDate: '02/09/2026',
    welderCompletedDate: '03/09/2026',
    weldingStatus: 'Completado',
    painterId: 'CONT-007',
    painterName: 'Pedro Martínez',
    painterAssignedDate: '04/09/2026',
    paintingStatus: 'En proceso',
    paintingNotes: 'Aplicando primera capa de anticorrosivo gris.',
    assignmentHistory: [
      { id: 'H-07', date: '02/09/2026 10:00', process: 'Soldadura', contractorId: 'CONT-002', contractorName: 'Roberto Díaz', action: 'Asignado', status: 'Asignado', user: 'Juan Pérez (Admin)' },
      { id: 'H-08', date: '03/09/2026 16:00', process: 'Soldadura', contractorId: 'CONT-002', contractorName: 'Roberto Díaz', action: 'Completado', status: 'Completado', user: 'Ing. Roberto M. (Producción)' },
      { id: 'H-09', date: '04/09/2026 08:30', process: 'Pintura', contractorId: 'CONT-007', contractorName: 'Pedro Martínez', action: 'Asignado', status: 'Asignado', user: 'Juan Pérez (Admin)' },
      { id: 'H-10', date: '04/09/2026 09:15', process: 'Pintura', contractorId: 'CONT-007', contractorName: 'Pedro Martínez', action: 'En proceso', status: 'En proceso', user: 'Ing. Roberto M. (Producción)' }
    ]
  },
  {
    id: 'PC-001',
    mark: '2S-37A',
    type: 'Viga',
    profile: 'W18x130',
    lengthMeters: 12.190,
    weightKg: 850,
    project: 'Mhotivo',
    status: 'Enviada',
    qcStatus: 'Aprobada',
    refId: 'ENV-00286',
    fabricationDate: '20 Oct 2023',
    heatNumber: 'HT-992-8812',
    steelGrade: 'ASTM A992 Grado 50',
    inspector: 'Ana Gómez',
    qcNotes: 'Tolerancias dimensionales dentro de norma AISC 303.',
    welderId: 'CONT-001',
    welderName: 'Juan Pérez',
    welderAssignedDate: '16 Oct 2023',
    welderCompletedDate: '17 Oct 2023',
    weldingStatus: 'Completado',
    painterId: 'CONT-006',
    painterName: 'Carlos López',
    painterAssignedDate: '19 Oct 2023',
    painterCompletedDate: '20 Oct 2023',
    paintingStatus: 'Completado',
    assignmentHistory: [
      { id: 'H-11', date: '16 Oct 2023 09:00', process: 'Soldadura', contractorId: 'CONT-001', contractorName: 'Juan Pérez', action: 'Asignado', status: 'Asignado', user: 'Juan Pérez (Admin)' },
      { id: 'H-12', date: '17 Oct 2023 15:00', process: 'Soldadura', contractorId: 'CONT-001', contractorName: 'Juan Pérez', action: 'Completado', status: 'Completado', user: 'Juan Pérez (Admin)' },
      { id: 'H-13', date: '19 Oct 2023 10:00', process: 'Pintura', contractorId: 'CONT-006', contractorName: 'Carlos López', action: 'Asignado', status: 'Asignado', user: 'Juan Pérez (Admin)' },
      { id: 'H-14', date: '20 Oct 2023 17:00', process: 'Pintura', contractorId: 'CONT-006', contractorName: 'Carlos López', action: 'Completado', status: 'Completado', user: 'Juan Pérez (Admin)' }
    ],
    modificationHistory: [
      {
        id: 'MOD-004',
        date: '21/10/2023 11:10',
        timestamp: Date.now() - 12000000,
        user: 'Juan Pérez (Admin)',
        userRole: 'Administrador',
        field: 'Longitud (m)',
        previousValue: '12.00 m',
        newValue: '12.19 m',
        reason: 'Corrección de cota de eje en plano estructural definitivo rev. 3'
      }
    ],
    traceability: [
      { step: 'Corte y Habilitado', date: '15 Oct 2023 09:00', operator: 'M. López (Nave 1)', location: 'Mesa CNC Oxicorte', status: 'completed' },
      { step: 'Armado y Soldadura', date: '17 Oct 2023 14:30', operator: 'Juan Pérez (Soldador)', location: 'Estación Soldadura SMAW', status: 'completed' },
      { step: 'Inspección QC (Liberación)', date: '19 Oct 2023 11:15', operator: 'A. Gómez (Inspector)', location: 'Bahía QC Final', status: 'completed', certNumber: 'QC-2023-889' },
      { step: 'Granallado y Pintura', date: '20 Oct 2023 16:00', operator: 'Carlos López (Pintor)', location: 'Planta Alanza', status: 'completed' },
      { step: 'Despacho en Envío', date: '24 Oct 2023 08:30', operator: 'Carlos Gómez (Logística)', location: 'Bahía de Carga 3', status: 'completed' },
      { step: 'Recepción en Sitio', date: 'En tránsito', operator: 'Receptor en Campo', location: 'Obra Mhotivo', status: 'in_progress' }
    ]
  },
  {
    id: 'PC-002',
    mark: '2S-38B',
    type: 'Columna',
    profile: 'W14x90',
    lengthMeters: 8.500,
    weightKg: 620,
    project: 'Mhotivo',
    status: 'Fabricada',
    qcStatus: 'Aprobada',
    refId: '-',
    fabricationDate: '21 Oct 2023',
    heatNumber: 'HT-992-8815',
    steelGrade: 'ASTM A992 Grado 50',
    inspector: 'Juan Pérez',
    welderId: 'CONT-003',
    welderName: 'Luis Soto',
    welderAssignedDate: '19 Oct 2023',
    welderCompletedDate: '20 Oct 2023',
    weldingStatus: 'Completado',
    painterId: 'CONT-008',
    painterName: 'Miguel Ángel Ramos',
    painterAssignedDate: '21 Oct 2023',
    painterCompletedDate: '21 Oct 2023',
    paintingStatus: 'Completado',
    assignmentHistory: [
      { id: 'H-15', date: '19 Oct 2023 08:30', process: 'Soldadura', contractorId: 'CONT-003', contractorName: 'Luis Soto', action: 'Asignado', status: 'Asignado', user: 'Juan Pérez (Admin)' },
      { id: 'H-16', date: '20 Oct 2023 12:00', process: 'Soldadura', contractorId: 'CONT-003', contractorName: 'Luis Soto', action: 'Completado', status: 'Completado', user: 'Juan Pérez (Admin)' },
      { id: 'H-17', date: '21 Oct 2023 09:00', process: 'Pintura', contractorId: 'CONT-008', contractorName: 'Miguel Ángel Ramos', action: 'Asignado', status: 'Asignado', user: 'Juan Pérez (Admin)' },
      { id: 'H-18', date: '21 Oct 2023 15:00', process: 'Pintura', contractorId: 'CONT-008', contractorName: 'Miguel Ángel Ramos', action: 'Completado', status: 'Completado', user: 'Juan Pérez (Admin)' }
    ],
    traceability: [
      { step: 'Corte y Habilitado', date: '18 Oct 2023 08:00', operator: 'M. López', location: 'Nave 1', status: 'completed' },
      { step: 'Armado y Soldadura', date: '20 Oct 2023 10:00', operator: 'Luis Soto (Soldador)', location: 'Nave 2', status: 'completed' },
      { step: 'Inspección QC', date: '21 Oct 2023 15:30', operator: 'J. Pérez', location: 'Bahía QC', status: 'completed', certNumber: 'QC-2023-902' }
    ]
  },
  {
    id: 'PC-003',
    mark: '1A-12C',
    type: 'Viga',
    profile: 'W12x50',
    lengthMeters: 6.200,
    weightKg: 310,
    project: 'Torre Altus Sur',
    status: 'Incidencia',
    qcStatus: 'Rechazada',
    refId: 'INC-0042',
    fabricationDate: '18 Oct 2023',
    heatNumber: 'HT-572-1049',
    steelGrade: 'ASTM A572 Grado 50',
    inspector: 'Juan Pérez',
    qcNotes: 'Porosidad excesiva en cordón de soldadura de placa de conexión.',
    welderId: 'CONT-003',
    welderName: 'Luis Soto',
    welderAssignedDate: '18 Oct 2023',
    weldingStatus: 'En proceso',
    paintingStatus: 'Pendiente',
    assignmentHistory: [
      { id: 'H-19', date: '16 Oct 2023 08:00', process: 'Soldadura', contractorId: 'CONT-001', contractorName: 'Juan Pérez', action: 'Asignado', status: 'Asignado', user: 'Juan Pérez (Admin)' },
      { id: 'H-20', date: '17 Oct 2023 14:00', process: 'Soldadura', contractorId: 'CONT-001', contractorName: 'Juan Pérez', action: 'Cancelado', status: 'Cancelado', user: 'Ing. Roberto M. (Producción)', notes: 'Reasignado por ausencia justificada' },
      { id: 'H-21', date: '18 Oct 2023 09:30', process: 'Soldadura', contractorId: 'CONT-003', contractorName: 'Luis Soto', action: 'Reemplazado por Luis Soto', previousContractorName: 'Juan Pérez', status: 'En proceso', user: 'Juan Pérez (Admin)', notes: 'Juan Pérez → reemplazado por Luis Soto para corrección y retrabajo' }
    ],
    traceability: [
      { step: 'Corte y Habilitado', date: '16 Oct 2023', operator: 'M. López', location: 'Nave 1', status: 'completed' },
      { step: 'Soldadura', date: '17 Oct 2023', operator: 'Luis Soto (Soldador)', location: 'Nave 2', status: 'completed' },
      { step: 'Inspección QC', date: '18 Oct 2023', operator: 'J. Pérez', location: 'Bahía QC', status: 'failed', notes: 'Rechazado para retrabajo' }
    ]
  },
  {
    id: 'PC-004',
    mark: '3F-01A',
    type: 'Riostra',
    profile: 'L6x6x1/2',
    lengthMeters: 4.000,
    weightKg: 120,
    project: 'Mhotivo',
    status: 'Recibida',
    qcStatus: 'Aprobada',
    refId: 'REC-00105',
    fabricationDate: '15 Oct 2023',
    heatNumber: 'HT-036-9921',
    steelGrade: 'ASTM A36',
    inspector: 'Ana Gómez',
    welderId: 'CONT-002',
    welderName: 'Roberto Díaz',
    weldingStatus: 'Completado',
    painterId: 'CONT-007',
    painterName: 'Pedro Martínez',
    paintingStatus: 'Completado',
    traceability: [
      { step: 'Corte', date: '12 Oct 2023', operator: 'Nave 1', location: 'Sierra Cinta', status: 'completed' },
      { step: 'Perforado', date: '13 Oct 2023', operator: 'Nave 1', location: 'Taladro Radial', status: 'completed' },
      { step: 'Inspección QC', date: '15 Oct 2023', operator: 'A. Gómez', location: 'Bahía QC', status: 'completed' },
      { step: 'Despacho', date: '21 Oct 2023', operator: 'Logística', location: 'Bahía 1', status: 'completed' },
      { step: 'Recepción en Sitio', date: '22 Oct 2023 10:15', operator: 'J. Ramírez (Campo)', location: 'Obra Mhotivo', status: 'completed' }
    ]
  },
  {
    id: 'PC-005',
    mark: 'C-104A',
    type: 'Columna',
    profile: 'W14x283',
    lengthMeters: 14.500,
    weightKg: 1450,
    project: 'Torre Mítica',
    status: 'Pendiente',
    qcStatus: 'Pendiente',
    refId: '-',
    fabricationDate: '10 Oct 2023',
    steelGrade: 'ASTM A992 Grado 50',
    weldingStatus: 'Pendiente',
    paintingStatus: 'Pendiente'
  },
  {
    id: 'PC-006',
    mark: 'V-201B',
    type: 'Viga',
    profile: 'W24x68',
    lengthMeters: 11.800,
    weightKg: 820,
    project: 'Torre Mítica',
    status: 'Fabricada',
    qcStatus: 'Aprobada',
    refId: '-',
    fabricationDate: '09 Oct 2023',
    inspector: 'A. Gómez',
    welderId: 'CONT-002',
    welderName: 'Roberto Díaz',
    welderAssignedDate: '08 Oct 2023',
    welderCompletedDate: '09 Oct 2023',
    weldingStatus: 'Completado',
    painterId: 'CONT-007',
    painterName: 'Pedro Martínez',
    painterAssignedDate: '09 Oct 2023',
    paintingStatus: 'En proceso',
    assignmentHistory: [
      { id: 'H-22', date: '08 Oct 2023 10:00', process: 'Soldadura', contractorId: 'CONT-002', contractorName: 'Roberto Díaz', action: 'Asignado', status: 'Asignado', user: 'Juan Pérez (Admin)' },
      { id: 'H-23', date: '09 Oct 2023 14:00', process: 'Soldadura', contractorId: 'CONT-002', contractorName: 'Roberto Díaz', action: 'Completado', status: 'Completado', user: 'Juan Pérez (Admin)' },
      { id: 'H-24', date: '09 Oct 2023 16:30', process: 'Pintura', contractorId: 'CONT-007', contractorName: 'Pedro Martínez', action: 'Asignado', status: 'Asignado', user: 'Juan Pérez (Admin)' }
    ]
  },
  {
    id: 'PC-007',
    mark: 'P-045',
    type: 'Placa Base',
    profile: 'PL 2"x24"x24"',
    lengthMeters: 0.600,
    weightKg: 95,
    project: 'Nave Industrial Zenith',
    status: 'Incidencia',
    qcStatus: 'Rechazada',
    refId: 'INC-1040',
    fabricationDate: '08 Oct 2023',
    inspector: 'J. Pérez',
    qcNotes: 'Barrenos desalineados respecto a ejes de anclaje.',
    welderId: 'CONT-003',
    welderName: 'Luis Soto',
    weldingStatus: 'Completado',
    paintingStatus: 'Pendiente'
  },
  {
    id: 'PC-008',
    mark: 'C-105A',
    type: 'Columna',
    profile: 'W14x283',
    lengthMeters: 14.500,
    weightKg: 1450,
    project: 'Torre Mítica',
    status: 'Fabricada',
    qcStatus: 'Con Observaciones',
    refId: '-',
    fabricationDate: '10 Oct 2023',
    inspector: 'A. Gómez',
    qcNotes: 'Espesor de pintura bajo en patín superior (4.5 mils vs 6 mils req).',
    welderId: 'CONT-004',
    welderName: 'Marco Tulio Flores',
    weldingStatus: 'Completado',
    painterId: 'CONT-006',
    painterName: 'Carlos López',
    paintingStatus: 'En proceso'
  },
  {
    id: 'PC-009',
    mark: 'T-012',
    type: 'Tirante',
    profile: 'HSS 6x6x1/2',
    lengthMeters: 5.500,
    weightKg: 180,
    project: 'Nave Industrial Zenith',
    status: 'Pendiente',
    qcStatus: 'Pendiente',
    refId: '-',
    fabricationDate: '11 Oct 2023',
    weldingStatus: 'Pendiente',
    paintingStatus: 'Pendiente'
  }
];

export const INITIAL_QC_INSPECTIONS: QCInspection[] = [
  {
    id: 'QC-125',
    pieceMark: 'V-00125',
    type: 'Viga',
    profile: 'W24x76',
    project: 'Mhotivo',
    fabricationDate: '03 Sep 2026',
    qcStatus: 'Aprobada',
    inspector: 'Ing. Ana Gómez',
    inspectionDate: '04 Sep 2026 16:00',
    notes: 'Soldador: Juan Pérez (6G). Pintor: Carlos López (Epóxico 6.5 mils). Liberada para despacho.'
  },
  {
    id: 'QC-126',
    pieceMark: 'V-00126',
    type: 'Viga',
    profile: 'W21x62',
    project: 'Mhotivo',
    fabricationDate: '03 Sep 2026',
    qcStatus: 'Pendiente',
    inspector: '-'
  },
  {
    id: 'QC-127',
    pieceMark: 'V-00127',
    type: 'Viga',
    profile: 'W18x50',
    project: 'Torre Altus Sur',
    fabricationDate: '04 Sep 2026',
    qcStatus: 'Pendiente',
    inspector: '-'
  },
  {
    id: 'QC-001',
    pieceMark: 'C-104A',
    type: 'Columna',
    profile: 'W14x283',
    project: 'Torre Mítica',
    fabricationDate: '10 Oct 2023',
    qcStatus: 'Pendiente',
    inspector: '-'
  },
  {
    id: 'QC-002',
    pieceMark: 'V-201B',
    type: 'Viga',
    profile: 'W24x68',
    project: 'Torre Mítica',
    fabricationDate: '09 Oct 2023',
    qcStatus: 'Aprobada',
    inspector: 'A. Gómez',
    inspectionDate: '09 Oct 2023 15:40',
    notes: 'Soldadura 100% inspeccionada con partículas magnéticas. Liberada.'
  },
  {
    id: 'QC-003',
    pieceMark: 'P-045',
    type: 'Placa Base',
    profile: 'PL 2"x24"x24"',
    project: 'Nave Industrial Alfa',
    fabricationDate: '08 Oct 2023',
    qcStatus: 'Rechazada',
    inspector: 'J. Pérez',
    inspectionDate: '08 Oct 2023 11:20',
    notes: 'Desviación en distancia entre barrenos de 4mm. No cumple tolerancia AISC.'
  },
  {
    id: 'QC-004',
    pieceMark: 'C-105A',
    type: 'Columna',
    profile: 'W14x283',
    project: 'Torre Mítica',
    fabricationDate: '10 Oct 2023',
    qcStatus: 'Con Observaciones',
    inspector: 'A. Gómez',
    inspectionDate: '10 Oct 2023 16:10',
    notes: 'Requiere segunda mano de recubrimiento epóxico antes de despacho.'
  },
  {
    id: 'QC-005',
    pieceMark: 'T-012',
    type: 'Tirante',
    profile: 'HSS 6x6x1/2',
    project: 'Nave Industrial Alfa',
    fabricationDate: '11 Oct 2023',
    qcStatus: 'Pendiente',
    inspector: '-'
  }
];

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 'ENV-00287',
    project: 'Torre Mítica',
    date: '24 Oct, 2023',
    piecesCount: 45,
    totalWeightTons: 12.5,
    carrier: 'Despacho Interno - Plataforma #1 (Kenworth)',
    dispatchDepartment: 'Dpto. de Despacho ALANZA',
    dispatchUnit: 'Camión Plataforma #1 (Kenworth T680)',
    driverName: 'Roberto Mendoza',
    truckPlates: 'HN-8842-TR',
    manager: 'Carlos Gómez (Coord. Despacho)',
    status: 'En preparación',
    destination: 'Sitio Torre Mítica, San Pedro Sula',
    pieces: ['C-104A', 'V-201B', 'V-202B', '2S-38B'],
    emailNotification: {
      sentAt: '24 Oct 2023, 08:35',
      subject: '[DESPACHO ALANZA] Nuevo Envío ENV-00287 en tránsito hacia Torre Mítica - Manifiesto de Carga',
      status: 'Enviado',
      recipients: [
        { name: 'Ing. Carlos Ruiz', email: 'cruiz@alanza.com', role: 'Residente de Obra', department: 'Sitio de Obra / Campo', included: true },
        { name: 'Carlos Gómez (Coord. Despacho)', email: 'cgomez@alanza.com', role: 'Coordinador de Despacho', department: 'Dpto. de Despacho ALANZA', included: true },
        { name: 'Ing. Ana Gómez', email: 'agomez@alanza.com', role: 'Inspector QC', department: 'Control Calidad Planta', included: true },
        { name: 'Roberto Mendoza', email: 'rmendoza.chofer@alanza.com', role: 'Conductor Flota', department: 'Plataforma #1', included: true },
        { name: 'Ing. Roberto Mendoza', email: 'rmendoza@alanza.com', role: 'Gerente de Planta', department: 'Operaciones', included: true }
      ]
    }
  },
  {
    id: 'ENV-00286',
    project: 'Nave Industrial SUR',
    date: '23 Oct, 2023',
    piecesCount: 112,
    totalWeightTons: 45.2,
    carrier: 'Despacho Interno - Plataforma #2 (Freightliner)',
    dispatchDepartment: 'Dpto. de Despacho ALANZA',
    dispatchUnit: 'Camión Plataforma #2 (Freightliner M2)',
    driverName: 'Marcos Benítez',
    truckPlates: 'TN-4109-GT',
    manager: 'Ana Silva (Supervisora Despacho)',
    status: 'En tránsito',
    destination: 'Parque Industrial Sur',
    pieces: ['2S-37A', 'C-405', 'V-102', 'C-406', 'V-103'],
    emailNotification: {
      sentAt: '23 Oct 2023, 10:15',
      subject: '[DESPACHO ALANZA] Nuevo Envío ENV-00286 en tránsito hacia Nave Industrial SUR - Manifiesto de Carga',
      status: 'Enviado',
      recipients: [
        { name: 'Ing. David Torres', email: 'dtorres.obra@alanza.com', role: 'Residente de Obra', department: 'Nave Industrial SUR', included: true },
        { name: 'Ana Silva (Supervisora Despacho)', email: 'asilva@alanza.com', role: 'Coordinadora de Despacho', department: 'Dpto. de Despacho ALANZA', included: true },
        { name: 'María González', email: 'mgonzalez@alanza.com', role: 'Inspector QC', department: 'Control Calidad Planta', included: true },
        { name: 'Marcos Benítez', email: 'mbenitez.chofer@alanza.com', role: 'Conductor Flota', department: 'Plataforma #2', included: true }
      ]
    }
  },
  {
    id: 'ENV-00285',
    project: 'Puente San Juan',
    date: '21 Oct, 2023',
    piecesCount: 18,
    totalWeightTons: 8.4,
    carrier: 'Despacho Interno - Cama Baja #3 (International)',
    dispatchDepartment: 'Dpto. de Despacho ALANZA',
    dispatchUnit: 'Trailer Cama Baja #3 (International WorkStar)',
    driverName: 'Juan Morales',
    truckPlates: 'LR-1092-AA',
    manager: 'Luis Martínez (Coord. Despacho)',
    status: 'Recibido',
    destination: 'Sitio Puente San Juan',
    pieces: ['3F-01A', '3F-02A', '3F-03A'],
    emailNotification: {
      sentAt: '21 Oct 2023, 07:45',
      subject: '[DESPACHO ALANZA] Nuevo Envío ENV-00285 en tránsito hacia Puente San Juan - Manifiesto de Carga',
      status: 'Enviado',
      recipients: [
        { name: 'Arq. Elena Ruiz', email: 'eruiz@alanza.com', role: 'Residente de Obra', department: 'Puente San Juan', included: true },
        { name: 'Luis Martínez (Coord. Despacho)', email: 'lmartinez@alanza.com', role: 'Coordinador de Despacho', department: 'Dpto. de Despacho ALANZA', included: true },
        { name: 'Ing. Ana Gómez', email: 'agomez@alanza.com', role: 'Inspector QC', department: 'Control Calidad', included: true },
        { name: 'Juan Morales', email: 'jmorales.chofer@alanza.com', role: 'Conductor Flota', department: 'Cama Baja #3', included: true }
      ]
    }
  },
  {
    id: 'ENV-00284',
    project: 'Torre Mítica',
    date: '20 Oct, 2023',
    piecesCount: 32,
    totalWeightTons: 14.1,
    carrier: 'Despacho Interno - Torton #4 (Hino)',
    dispatchDepartment: 'Dpto. de Despacho ALANZA',
    dispatchUnit: 'Camión Torton #4 (Hino 500)',
    driverName: 'José Luis Fuentes',
    truckPlates: 'CP-9011-HN',
    manager: 'Laura Méndez (Logística Despacho)',
    status: 'Con incidencia',
    destination: 'Sitio Torre Mítica',
    pieces: ['1A-12C', 'P-045'],
    emailNotification: {
      sentAt: '20 Oct 2023, 14:20',
      subject: '[DESPACHO ALANZA] Nuevo Envío ENV-00284 en tránsito hacia Torre Mítica - Manifiesto de Carga',
      status: 'Enviado',
      recipients: [
        { name: 'Ing. Carlos Ruiz', email: 'cruiz@alanza.com', role: 'Residente de Obra', department: 'Sitio Torre Mítica', included: true },
        { name: 'Laura Méndez (Logística Despacho)', email: 'lmendez@alanza.com', role: 'Coordinadora de Despacho', department: 'Dpto. de Despacho ALANZA', included: true },
        { name: 'José Luis Fuentes', email: 'jfuentes.chofer@alanza.com', role: 'Conductor Flota', department: 'Torton #4', included: true }
      ]
    }
  }
];

export const INITIAL_RECEPTION_SESSION: ReceptionSession = {
  shipmentId: 'ENV-00286',
  projectName: 'Nave Industrial SUR',
  carrier: 'Despacho Interno - Plataforma #2 (Freightliner)',
  driverName: 'Marcos Benítez',
  manager: 'Ana Silva (Supervisora Despacho)',
  totalPieces: 18,
  verifiedCount: 4,
  status: 'En progreso',
  hasIncidentAlert: true,
  incidentMessage: 'Se reportó la pieza V-102 como dañada durante la descarga. Requiere revisión de calidad.',
  items: [
    { mark: 'C-405', type: 'Columna', profileAndWeight: 'Columna W12x50 - 450kg', status: 'Recibida', verifiedAt: '08:45 AM' },
    { mark: 'V-102', type: 'Viga', profileAndWeight: 'Viga IPE 300 - 320kg', status: 'Dañada', verifiedAt: '08:52 AM', notes: 'Alabeo en patín inferior por impacto de eslinga' },
    { mark: 'C-406', type: 'Columna', profileAndWeight: 'Columna W12x50 - 450kg', status: 'En espera' },
    { mark: 'V-103', type: 'Viga', profileAndWeight: 'Viga IPE 300 - 320kg', status: 'En espera' },
    { mark: 'R-201', type: 'Riostra', profileAndWeight: 'Riostra L4x4x3/8 - 95kg', status: 'En espera' },
    { mark: 'R-202', type: 'Riostra', profileAndWeight: 'Riostra L4x4x3/8 - 95kg', status: 'En espera' }
  ]
};

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    sku: 'COL-W12-001',
    description: 'Columna W12x40 6m',
    category: 'Estructural Principal',
    currentStock: 145,
    unit: 'piezas',
    location: 'Almacén A-1',
    status: 'ÓPTIMO',
    minThreshold: 30,
    unitPriceEstimate: 420
  },
  {
    sku: 'VIG-IPE-200',
    description: 'Viga IPE 200 12m',
    category: 'Estructural Secundaria',
    currentStock: 42,
    unit: 'piezas',
    location: 'Patio Exterior B',
    status: 'REABASTECER',
    minThreshold: 50,
    unitPriceEstimate: 310
  },
  {
    sku: 'PLA-10MM-A36',
    description: 'Placa Acero A36 10mm',
    category: 'Materia Prima',
    currentStock: 5,
    unit: 'placas',
    location: 'Nave C-2',
    status: 'CRÍTICO',
    minThreshold: 20,
    unitPriceEstimate: 680
  },
  {
    sku: 'TORN-A325-1/2',
    description: 'Tornillo A325 1/2"x2"',
    category: 'Fijación',
    currentStock: 10500,
    unit: 'unidades',
    location: 'Almacén Central',
    status: 'ÓPTIMO',
    minThreshold: 2000,
    unitPriceEstimate: 1.25
  },
  {
    sku: 'VIG-W18-130',
    description: 'Perfil W18x130 A992 12m',
    category: 'Estructural Principal',
    currentStock: 38,
    unit: 'piezas',
    location: 'Patio Principal A',
    status: 'ÓPTIMO',
    minThreshold: 15,
    unitPriceEstimate: 1150
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-1042',
    severity: 'Crítica',
    shortDescription: 'Fallo de soldadura en viga principal A4',
    details: 'Discontinuidad interna detectada por ultrasonido en soldadura de penetración completa en unión viga-columna.',
    origin: 'Pieza: VIG-A4-001',
    responsible: 'Carlos Mendoza',
    category: 'Calidad',
    status: 'Abierta',
    date: '12 Oct 2023',
    resolutionTimeEstimate: '24 hrs'
  },
  {
    id: 'INC-1041',
    severity: 'Alta',
    shortDescription: 'Retraso en aduana de material rodante',
    details: 'Contenedor con perfiles laminados pesados retenido por verificación de manifiesto arancelario.',
    origin: 'Envío: SHP-8821',
    responsible: 'Logística Int.',
    category: 'Logística',
    status: 'En Proceso',
    date: '11 Oct 2023',
    resolutionTimeEstimate: '48 hrs'
  },
  {
    id: 'INC-1040',
    severity: 'Media',
    shortDescription: 'Discrepancia en planos de montaje N3',
    details: 'Conflicto entre eje 4 y paso de ducto electromecánico en plano DWG rev 4.',
    origin: 'Proyecto: Torre Norte',
    responsible: 'Arq. Elena Ruiz',
    category: 'Diseño',
    status: 'En Proceso',
    date: '10 Oct 2023',
    resolutionTimeEstimate: '16 hrs'
  },
  {
    id: 'INC-1039',
    severity: 'Baja',
    shortDescription: 'Pintura rayada en transporte local',
    details: 'Abrasión superficial por fricción con estacas del camión. Requiere retoque en campo.',
    origin: 'Pieza: COL-B2-014',
    responsible: 'Control Calidad',
    category: 'Calidad',
    status: 'Resuelta',
    date: '09 Oct 2023',
    solutionNotes: 'Se aplicó primer epóxico de zinc y esmalte poliuretano en sitio.'
  }
];

export const INITIAL_USERS: UserItem[] = [
  {
    id: 'USR-01',
    username: 'jperez',
    name: 'Juan Pérez',
    email: 'jperez@alanza.com',
    password: 'password123',
    area: 'Administración',
    role: 'Administrador',
    status: 'Activo',
    lastAccess: 'Hoy 09:40',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    initials: 'JP',
    projects: ['Torre Mítica', 'Todos los proyectos']
  },
  {
    id: 'USR-02',
    username: 'rmendoza',
    name: 'Ing. Roberto Mendoza',
    email: 'rmendoza@alanza.com',
    password: 'password123',
    area: 'Planta',
    role: 'Gerente de planta',
    status: 'Activo',
    lastAccess: 'Hoy 08:15',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    initials: 'RM',
    projects: ['Torre Mítica', 'Torre Norte']
  },
  {
    id: 'USR-03',
    username: 'agomez',
    name: 'Ing. Ana Gómez',
    email: 'agomez@alanza.com',
    password: 'password123',
    area: 'Calidad',
    role: 'Inspector QC',
    status: 'Activo',
    lastAccess: 'Hace 20 min',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    initials: 'AG',
    projects: ['Torre Mítica', 'Nave Industrial Alfa']
  },
  {
    id: 'USR-04',
    username: 'mgonzalez',
    name: 'María González',
    email: 'mgonzalez@alanza.com',
    password: 'password123',
    area: 'Planta',
    role: 'Inspector QC',
    status: 'Activo',
    lastAccess: '24/10/2023 08:30',
    initials: 'MG',
    projects: ['Torre Mítica']
  },
  {
    id: 'USR-05',
    username: 'jramirez',
    name: 'Jorge Ramírez',
    email: 'jramirez@alanza.com',
    password: 'password123',
    area: 'Campo',
    role: 'Residente de campo',
    status: 'Activo',
    lastAccess: '23/10/2023 15:45',
    initials: 'JR',
    projects: ['Mhotivo']
  },
  {
    id: 'USR-06',
    username: 'mhernandez',
    name: 'Manuel Hernández',
    email: 'mhernandez@alanza.com',
    password: 'password123',
    area: 'Planta',
    role: 'Bodeguero',
    status: 'Activo',
    lastAccess: 'Hoy 08:00',
    initials: 'MH',
    projects: ['Planta Principal - Almacén Central']
  },
  {
    id: 'USR-07',
    username: 'lmartinez',
    name: 'Luis Martínez',
    email: 'lmartinez@alanza.com',
    password: 'password123',
    area: 'Despacho',
    role: 'Coordinador de logística',
    status: 'Activo',
    lastAccess: 'Hoy 09:30',
    initials: 'LM',
    projects: ['Torre Norte', 'Torre Mítica']
  },
  {
    id: 'USR-08',
    username: 'cruiz',
    name: 'Ing. Carlos Ruiz',
    email: 'cruiz@alanza.com',
    password: 'password123',
    area: 'Campo',
    role: 'Residente de campo',
    status: 'Activo',
    lastAccess: 'Hoy 10:20',
    initials: 'CR',
    projects: ['Torre Mítica']
  },
  {
    id: 'USR-09',
    username: 'eruiz',
    name: 'Arq. Elena Ruiz',
    email: 'eruiz@alanza.com',
    password: 'password123',
    area: 'Campo',
    role: 'Residente de campo',
    status: 'Activo',
    lastAccess: 'Ayer 16:30',
    initials: 'ER',
    projects: ['Puente San Juan']
  }
];

export const INITIAL_AUDIT_LOGS: SystemAuditLog[] = [
  {
    id: 'LOG-1094',
    timestamp: '27/08/2026 09:41:20',
    user: 'Juan Pérez (Admin)',
    action: 'Actualización Parámetros',
    module: 'Configuración',
    details: 'Se actualizó la tolerancia máxima de espesor de pintura a 8 mils.',
    ipAddress: '192.168.10.45'
  },
  {
    id: 'LOG-1093',
    timestamp: '27/08/2026 08:30:12',
    user: 'María González (QC)',
    action: 'Aprobación QC',
    module: 'Inspecciones QC',
    details: 'Liberación de pieza 2S-37A para despacho con certificado QC-2023-889.',
    ipAddress: '192.168.10.88'
  },
  {
    id: 'LOG-1092',
    timestamp: '26/08/2026 17:15:00',
    user: 'Carlos Gómez (Logística)',
    action: 'Despacho Envío',
    module: 'Envíos',
    details: 'Creación de remisión y despacho de transporte ENV-00286 hacia Nave Industrial SUR.',
    ipAddress: '192.168.10.22'
  }
];
