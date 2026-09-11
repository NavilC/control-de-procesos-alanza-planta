import { Shipment, ShipmentRecipient, ShipmentEmailNotification, Project, UserItem, Piece } from '../types';

/**
 * Returns the default involved persons (stakeholders) for a given shipment
 */
export function getInvolvedRecipientsForShipment(params: {
  projectName: string;
  coordinatorName?: string;
  driverName?: string;
  carrier?: string;
  projects?: Project[];
  users?: UserItem[];
  pieces?: string[];
}): ShipmentRecipient[] {
  const { projectName, coordinatorName, driverName, carrier, projects, users } = params;

  const recipients: ShipmentRecipient[] = [];

  // 1. Residente de Obra / Administrador del Proyecto de destino
  let siteManagerName = 'Ing. Carlos Ruiz';
  let siteManagerEmail = 'cruiz@alanza.com';
  let siteManagerRole = 'Residente de Obra';

  if (projectName === 'Mhotivo') {
    siteManagerName = 'Jorge Ramírez';
    siteManagerEmail = 'jramirez@alanza.com';
    siteManagerRole = 'Residente de Obra';
  } else if (projectName === 'Puente San Juan') {
    siteManagerName = 'Arq. Elena Ruiz';
    siteManagerEmail = 'eruiz@alanza.com';
    siteManagerRole = 'Residente de Obra';
  } else if (projectName === 'Nave Industrial SUR') {
    siteManagerName = 'Ing. David Torres';
    siteManagerEmail = 'dtorres.obra@alanza.com';
    siteManagerRole = 'Residente de Obra';
  } else if (projects) {
    const matchedProj = projects.find(p => p.name.toLowerCase() === projectName.toLowerCase());
    if (matchedProj?.siteManager?.name) {
      siteManagerName = matchedProj.siteManager.name;
      siteManagerRole = matchedProj.siteManager.role || 'Residente de Obra';
      siteManagerEmail = `${siteManagerName.toLowerCase().replace(/[^a-z]/g, '')}@alanza.com`;
    }
  }

  // Check if user exists in users table
  if (users) {
    const matchedUser = users.find(u => 
      u.role.toLowerCase().includes('residente') && 
      (u.projects?.some(p => p.toLowerCase().includes(projectName.toLowerCase())) || false)
    );
    if (matchedUser) {
      siteManagerName = matchedUser.name;
      siteManagerEmail = matchedUser.email;
      siteManagerRole = matchedUser.role;
    }
  }

  recipients.push({
    id: 'rec-site-manager',
    name: siteManagerName,
    email: siteManagerEmail,
    role: siteManagerRole,
    department: 'Sitio de Obra / Campo',
    included: true
  });

  // 2. Coordinador / Responsable de Despacho
  const coord = coordinatorName || 'Carlos Gómez (Coord. Despacho)';
  let coordEmail = 'despacho.coordinacion@alanza.com';
  if (coord.toLowerCase().includes('carlos')) coordEmail = 'cgomez@alanza.com';
  else if (coord.toLowerCase().includes('luis')) coordEmail = 'lmartinez@alanza.com';
  else if (coord.toLowerCase().includes('ana')) coordEmail = 'asilva@alanza.com';
  else if (coord.toLowerCase().includes('laura')) coordEmail = 'lmendez@alanza.com';

  recipients.push({
    id: 'rec-dispatch-manager',
    name: coord,
    email: coordEmail,
    role: 'Coordinador de Despacho',
    department: 'Dpto. de Despacho ALANZA',
    included: true
  });

  // 3. Inspector / Aseguramiento de Calidad (QC) de Planta
  recipients.push({
    id: 'rec-qc-inspector',
    name: 'Ing. Ana Gómez',
    email: 'agomez@alanza.com',
    role: 'Inspector Aseguramiento QC',
    department: 'Control de Calidad en Planta',
    included: true
  });

  // 4. Conductor / Operador de la Unidad
  const driver = driverName || 'Roberto Mendoza';
  let driverEmail = 'transporte.despacho@alanza.com';
  if (driver.toLowerCase().includes('roberto')) driverEmail = 'rmendoza.chofer@alanza.com';
  else if (driver.toLowerCase().includes('marcos')) driverEmail = 'mbenitez.chofer@alanza.com';
  else if (driver.toLowerCase().includes('juan')) driverEmail = 'jmorales.chofer@alanza.com';
  else if (driver.toLowerCase().includes('josé')) driverEmail = 'jfuentes.chofer@alanza.com';

  recipients.push({
    id: 'rec-driver',
    name: driver,
    email: driverEmail,
    role: 'Operador / Conductor de Flota',
    department: carrier || 'Dpto. de Despacho',
    included: true
  });

  // 5. Gerente de Planta / Producción
  recipients.push({
    id: 'rec-plant-manager',
    name: 'Ing. Roberto Mendoza',
    email: 'rmendoza@alanza.com',
    role: 'Gerente de Planta',
    department: 'Operaciones & Fabricación',
    included: true
  });

  return recipients;
}

/**
 * Builds the subject line for the shipment notification email
 */
export function buildShipmentEmailSubject(shipmentId: string, projectName: string): string {
  return `[DESPACHO ALANZA] Nuevo Envío ${shipmentId} en tránsito hacia ${projectName} - Manifiesto de Carga y Trazabilidad`;
}

/**
 * Generates an executive HTML simulation of the dispatched email
 */
export function generateShipmentEmailContent(params: {
  shipment: Shipment;
  recipients: ShipmentRecipient[];
  piecesDetails?: Partial<Piece>[];
}) {
  const { shipment, recipients, piecesDetails } = params;

  const piecesList = piecesDetails && piecesDetails.length > 0 
    ? piecesDetails 
    : (shipment.pieces || []).map(mark => ({
        mark,
        type: mark.startsWith('C') ? 'Columna' : mark.startsWith('V') ? 'Viga' : 'Perfil Estructural',
        profile: mark.startsWith('C') ? 'W14x132' : 'W24x76',
        weightKg: 520,
        qcStatus: 'Aprobada'
      }));

  const subject = buildShipmentEmailSubject(shipment.id, shipment.project);

  return {
    subject,
    dateStr: shipment.date || new Date().toLocaleString('es-ES'),
    sender: 'Departamento de Despacho ALANZA <despacho@alanza.com>',
    recipients,
    piecesCount: shipment.piecesCount || piecesList.length,
    totalWeightTons: shipment.totalWeightTons || (piecesList.length * 0.75).toFixed(1),
    summary: `Se ha emitido y despachado el manifiesto ${shipment.id} con ${shipment.piecesCount || piecesList.length} piezas estructurales liberadas con destino al proyecto ${shipment.project}.`,
    piecesList
  };
}
