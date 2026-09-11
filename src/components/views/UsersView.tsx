import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Plus, 
  Search, 
  ShieldCheck, 
  Mail, 
  Building, 
  Clock, 
  MoreVertical,
  UserCheck,
  UserX,
  Key,
  HardHat,
  Warehouse,
  Truck,
  Briefcase,
  Factory,
  Package,
  CheckCircle2,
  X,
  Info,
  Lock,
  Unlock,
  Eye,
  Ban,
  Check,
  ShieldAlert,
  FileCheck2,
  SlidersHorizontal,
  UserCog
} from 'lucide-react';

export const USER_ROLES = [
  'Administrador',
  'Residente de campo',
  'Bodeguero',
  'Inspector QC',
  'Coordinador de logística',
  'Gerente de logística',
  'Gerente de planta'
] as const;

export type UserRoleType = typeof USER_ROLES[number];

const ROLE_CONFIG: Record<UserRoleType, { 
  label: string; 
  icon: React.FC<{ className?: string }>; 
  bg: string; 
  text: string; 
  border: string; 
  desc: string 
}> = {
  'Administrador': {
    label: 'Administrador del Sistema',
    icon: ShieldCheck,
    bg: 'bg-blue-100',
    text: 'text-[#004ac6]',
    border: 'border-blue-300',
    desc: 'Control total de la plataforma: creación y gestión de usuarios, roles, seguridad, proyectos, piezas y auditoría completa'
  },
  'Residente de campo': {
    label: 'Residente de campo',
    icon: HardHat,
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    desc: 'Supervisión técnica, verificación y recepción de elementos estructurales en obra'
  },
  'Bodeguero': {
    label: 'Bodeguero',
    icon: Warehouse,
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    desc: 'Control de inventario físico, almacenamiento, insumos de soldadura y pintura'
  },
  'Inspector QC': {
    label: 'Inspector QC',
    icon: ShieldCheck,
    bg: 'bg-blue-50',
    text: 'text-[#004ac6]',
    border: 'border-blue-200',
    desc: 'Ensayos dimensionales, ensayos no destructivos (END), pintura y liberación de piezas'
  },
  'Coordinador de logística': {
    label: 'Coordinador de logística',
    icon: Truck,
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    desc: 'Planificación de embarques, cubicaje, hojas de ruta y seguimiento de despachos'
  },
  'Gerente de logística': {
    label: 'Gerente de logística',
    icon: Briefcase,
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-200',
    desc: 'Gestión estratégica de transporte, contratos con transportistas y cadena de suministro'
  },
  'Gerente de planta': {
    label: 'Gerente de planta',
    icon: Factory,
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
    desc: 'Dirección operativa de fabricación en planta, asignación de cuadrillas y avance general'
  }
};

export interface PermissionItem {
  id: string;
  module: string;
  action: string;
  level: 'full' | 'read' | 'none';
  detail: string;
}

export const ROLE_PERMISSIONS: Record<UserRoleType, PermissionItem[]> = {
  'Administrador': [
    { id: 'adm-1', module: 'Usuarios y Seguridad', action: 'Creación y Gestión de Cuentas', level: 'full', detail: 'Alta de cuentas, asignación de contraseñas, roles y revocación de acceso.' },
    { id: 'adm-2', module: 'Auditoría del Sistema', action: 'Logs de Auditoría y Trazabilidad', level: 'full', detail: 'Acceso irrestricto a los registros de modificaciones y firmas.' },
    { id: 'adm-3', module: 'Proyectos & Obras', action: 'Creación y Configuración', level: 'full', detail: 'Configuración de proyectos, presupuestos y asignación de contratistas.' },
    { id: 'adm-4', module: 'Piezas Estructurales', action: 'Gestión Completa e Importación', level: 'full', detail: 'Importación Tekla, edición de marcas, perfiles y pesos.' },
    { id: 'adm-5', module: 'Control de Calidad (QC)', action: 'Supervisión y Dictámenes', level: 'full', detail: 'Visualización y anulación de dictámenes o no conformidades.' },
    { id: 'adm-6', module: 'Logística & Despachos', action: 'Control Total de Embarques', level: 'full', detail: 'Aprobación de remisiones, asignación de transportes y pesos.' },
    { id: 'adm-7', module: 'Recepción en Campo', action: 'Supervisión de Actas', level: 'full', detail: 'Consulta y validación de recepciones y firmas en obra.' },
    { id: 'adm-8', module: 'Reportes y Analítica', action: 'Exportación y Análisis', level: 'full', detail: 'Descarga de reportes ejecutivos en CSV y analítica avanzada.' }
  ],
  'Residente de campo': [
    { id: 'rc-1', module: 'Recepción en Obra', action: 'Escanear QR y Registrar Llegada', level: 'full', detail: 'Escanear códigos QR de piezas físicas al llegar a obra y marcar recepción conforme.' },
    { id: 'rc-2', module: 'Recepción en Obra', action: 'Firma Digital de Remisiones', level: 'full', detail: 'Firmar actas de recepción de transporte digitalmente con observaciones o daños.' },
    { id: 'rc-3', module: 'Incidencias en Sitio', action: 'Apertura de Reportes RNC', level: 'full', detail: 'Registrar no conformidades ocurridas durante el traslado o montaje.' },
    { id: 'rc-4', module: 'Piezas Estructurales', action: 'Consulta de Marcas y Planos', level: 'read', detail: 'Consultar peso, perfil, longitud y planos de ensamble de piezas asignadas.' },
    { id: 'rc-5', module: 'Control de Calidad (QC)', action: 'Historial y Certificados QC', level: 'read', detail: 'Visualizar dictámenes de calidad y certificados de pintura emitidos en planta.' },
    { id: 'rc-6', module: 'Logística & Despachos', action: 'Seguimiento de Embarques', level: 'read', detail: 'Ver remisiones y fecha estimada de llegada de camiones a su obra.' },
    { id: 'rc-7', module: 'Fabricación en Taller', action: 'Modificación de Piezas', level: 'none', detail: 'No autorizado para alterar marcas, dimensiones o especificaciones de fábrica.' },
    { id: 'rc-8', module: 'Almacén & Bodega', action: 'Gestión de Insumos y Consumibles', level: 'none', detail: 'Módulo reservado exclusivamente para personal de bodega de planta.' }
  ],
  'Bodeguero': [
    { id: 'bg-1', module: 'Almacén & Bodega', action: 'Control de Insumos y Stock', level: 'full', detail: 'Registrar entradas, salidas y existencias de soldadura, pernos y pintura.' },
    { id: 'bg-2', module: 'Almacén & Bodega', action: 'Recepción de Proveedores', level: 'full', detail: 'Verificar albaranes y facturas de entrega de materia prima y consumibles.' },
    { id: 'bg-3', module: 'Logística & Despacho', action: 'Preparación de Pernos y Empaques', level: 'full', detail: 'Pesar y empacar cajas de pernería estructural y fijaciones para envío.' },
    { id: 'bg-4', module: 'Piezas Estructurales', action: 'Consulta de Perfiles y Pesos', level: 'read', detail: 'Verificar especificaciones de elementos para estiba y resguardo en patio.' },
    { id: 'bg-5', module: 'Control de Calidad (QC)', action: 'Certificados de Materia Prima', level: 'read', detail: 'Consultar certificados de colada y especificaciones ASTM/AWS de alambre.' },
    { id: 'bg-6', module: 'Contratistas & Cuadrillas', action: 'Asignación de Personal', level: 'none', detail: 'Sin atribución sobre contratos de mano de obra o cuadrillas.' },
    { id: 'bg-7', module: 'Recepción en Obra', action: 'Firmas en Destino', level: 'none', detail: 'Operación restringida exclusivamente a residentes de campo.' },
    { id: 'bg-8', module: 'Usuarios y Sistema', action: 'Administración de Cuentas', level: 'none', detail: 'No autorizado para modificar perfiles ni permisos del sistema.' }
  ],
  'Inspector QC': [
    { id: 'qc-1', module: 'Control de Calidad (QC)', action: 'Dictamen Aprobado / Rechazado', level: 'full', detail: 'Liberar piezas para pase a pintura y autorizar despacho final.' },
    { id: 'qc-2', module: 'Control de Calidad (QC)', action: 'Registro de Ensayos END y Mils', level: 'full', detail: 'Registrar ultrasonido, líquidos penetrantes, adherencia y espesores de pintura.' },
    { id: 'qc-3', module: 'Incidencias & RNC', action: 'Apertura de RNC y Retrabajos', level: 'full', detail: 'Emitir no conformidades técnicas y auditar la liberación posterior.' },
    { id: 'qc-4', module: 'Piezas Estructurales', action: 'Auditoría Dimensional AWS D1.1', level: 'read', detail: 'Revisar tolerancias dimensionales contra planos de taller aprobados.' },
    { id: 'qc-5', module: 'Contratistas & Trazabilidad', action: 'Trazabilidad de Armador/Soldador', level: 'read', detail: 'Consultar estampas de operarios asignados a cada elemento fabricado.' },
    { id: 'qc-6', module: 'Logística & Embarque', action: 'Auditoría Pre-Despacho', level: 'read', detail: 'Confirmar que no se carguen piezas con estado de calidad pendiente o rechazado.' },
    { id: 'qc-7', module: 'Ingeniería & Marcas', action: 'Modificar Diseños y Geometría', level: 'none', detail: 'Las modificaciones estructurales requieren autorización de Ingeniería.' },
    { id: 'qc-8', module: 'Finanzas & Costos', action: 'Tarifas de Contratistas', level: 'none', detail: 'Información confidencial de gerencia de planta.' }
  ],
  'Coordinador de logística': [
    { id: 'cl-1', module: 'Despacho & Transporte', action: 'Planificación de Viajes y Rutas', level: 'full', detail: 'Creación de remisiones, asignación de camiones, plataformas y choferes.' },
    { id: 'cl-2', module: 'Despacho & Transporte', action: 'Cubicaje y Balance de Cargas', level: 'full', detail: 'Distribución de peso por ejes según normativa vial de transporte pesado.' },
    { id: 'cl-3', module: 'Recepción en Obra', action: 'Monitoreo de Envíos en Tránsito', level: 'read', detail: 'Supervisar tiempos de traslado y confirmación de llegada en obra.' },
    { id: 'cl-4', module: 'Piezas Estructurales', action: 'Consulta de Marcas y Pesos', level: 'read', detail: 'Seleccionar elementos liberados listos para ser consolidados en viaje.' },
    { id: 'cl-5', module: 'Control de Calidad (QC)', action: 'Verificación de Estado QC', level: 'read', detail: 'Asegurar que todas las marcas cuenten con visto bueno de calidad antes de embarque.' },
    { id: 'cl-6', module: 'Almacén & Bodega', action: 'Solicitud de Pernos para Envío', level: 'read', detail: 'Requerir a bodega bultos y accesorios correspondientes a cada remisión.' },
    { id: 'cl-7', module: 'Control de Calidad (QC)', action: 'Dictaminar Piezas Técnicamente', level: 'none', detail: 'Solo inspectores QC certificados pueden otorgar liberación.' },
    { id: 'cl-8', module: 'Fabricación en Taller', action: 'Asignar Trabajo a Operarios', level: 'none', detail: 'Sin atribución sobre procesos de planta ni cuadrillas.' }
  ],
  'Gerente de logística': [
    { id: 'gl-1', module: 'Despacho & Transporte', action: 'Autorización y Cierre de Viajes', level: 'full', detail: 'Aprobación definitiva de manifiestos de carga y salidas de planta.' },
    { id: 'gl-2', module: 'Contratistas de Carga', action: 'Gestión de Transportistas y Tarifas', level: 'full', detail: 'Administración de convenios de flete, seguros de carga y transportistas.' },
    { id: 'gl-3', module: 'Métricas & Auditoría', action: 'Reportes de Tonelaje y Rendimiento', level: 'full', detail: 'Análisis de cumplimiento de entregas, costo/tonelada y tiempos de ciclo.' },
    { id: 'gl-4', module: 'Recepción en Obra', action: 'Auditoría de Actas y Liquidaciones', level: 'full', detail: 'Validación de entregas completas y resolución de reclamos por faltantes.' },
    { id: 'gl-5', module: 'Piezas Estructurales', action: 'Consulta Integral de Proyecto', level: 'read', detail: 'Visibilidad total del avance de despacho respecto al total del contrato.' },
    { id: 'gl-6', module: 'Control de Calidad (QC)', action: 'Reportes de Liberación General', level: 'read', detail: 'Consulta del balance de elementos aprobados y pendientes de pintura.' },
    { id: 'gl-7', module: 'Fabricación en Taller', action: 'Alterar Planos de Ingeniería', level: 'none', detail: 'Sin atribución sobre especificaciones técnicas de diseño.' },
    { id: 'gl-8', module: 'Sistemas & BD', action: 'Mantenimiento de Servidores', level: 'none', detail: 'Acceso reservado para el área de tecnologías de información.' }
  ],
  'Gerente de planta': [
    { id: 'gp-1', module: 'Fabricación & Taller', action: 'Gestión Integral de Producción', level: 'full', detail: 'Creación y modificación de piezas, órdenes de trabajo y prioridades de línea.' },
    { id: 'gp-2', module: 'Contratistas & Cuadrillas', action: 'Asignación de Trabajo y Tarifas', level: 'full', detail: 'Control de cuadrillas de armadores, soldadores y pintores en planta.' },
    { id: 'gp-3', module: 'Avance Operativo', action: 'Validación de Porcentajes de Avance', level: 'full', detail: 'Aprobación de avance físico para estimaciones de pago a contratistas.' },
    { id: 'gp-4', module: 'Control de Calidad (QC)', action: 'Supervisión de No Conformidades', level: 'full', detail: 'Resolución de retrabajos mayores y acuerdos técnicos con clientes.' },
    { id: 'gp-5', module: 'Bodega & Materia Prima', action: 'Supervisión de Abastecimiento', level: 'full', detail: 'Monitoreo de inventario crítico de perfiles de acero y consumibles.' },
    { id: 'gp-6', module: 'Despacho & Logística', action: 'Compromiso de Fechas de Salida', level: 'full', detail: 'Alineación de salida de taller con el programa de montaje del cliente.' },
    { id: 'gp-7', module: 'Recepción en Obra', action: 'Consulta de Reportes de Sitio', level: 'read', detail: 'Seguimiento de retroalimentación de montaje en campo y ensambles.' },
    { id: 'gp-8', module: 'Usuarios y Permisos', action: 'Gestión de Cuentas Operativas', level: 'full', detail: 'Alta, reasignación y auditoría de personal de planta y taller.' }
  ]
};

interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  projects: string[];
  lastActive: string;
  status: 'Activo' | 'Inactivo';
  avatar?: string;
  initials: string;
}

export const UsersView: React.FC = () => {
  const { users, addUser, updateUser, toggleUserStatus, addAudit, playFeedbackSound } = useApp();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<UserData | null>(null);
  
  // Form fields for new user
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('password123');
  const [newRole, setNewRole] = useState<UserRoleType>('Residente de campo');
  const [newProject, setNewProject] = useState('Torre Mítica');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const usersList: UserData[] = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: (u.role in ROLE_CONFIG ? u.role : (u.role === 'Administrador' ? 'Administrador' : 'Residente de campo')) as UserRoleType,
    projects: u.projects && u.projects.length > 0 ? u.projects : ['Torre Mítica'],
    lastActive: u.lastAccess || 'Hoy',
    status: u.status,
    avatar: u.avatarUrl,
    initials: u.initials || u.name.slice(0, 2).toUpperCase()
  }));

  const filteredUsers = usersList.filter(u => {
    const term = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(term) || 
      u.email.toLowerCase().includes(term);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const initials = newName
      .trim()
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const created = addUser({
      name: newName.trim(),
      email: newEmail.trim(),
      username: newUsername.trim() || newEmail.trim().split('@')[0],
      password: newPassword.trim() || 'password123',
      role: newRole as any,
      projects: [newProject],
      initials,
      status: 'Activo'
    });

    playFeedbackSound('success');

    setSuccessMessage(`Usuario "${created.name}" creado con éxito. Credenciales activas: ${created.email} (Contraseña: ${newPassword.trim() || 'password123'}). El usuario ya puede iniciar sesión en la plataforma.`);
    setTimeout(() => setSuccessMessage(null), 6000);

    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
    setNewUsername('');
    setNewPassword('password123');
    setNewRole('Residente de campo');
    setNewProject('Torre Mítica');
  };

  const handleToggleStatus = (id: string) => {
    toggleUserStatus(id);
    const target = users.find(u => u.id === id);
    const nextStatus = target?.status === 'Activo' ? 'Inactivo' : 'Activo';
    addAudit('Modificación Usuario', 'Usuarios y Roles', `Estado de ${target?.name || id} cambiado a ${nextStatus}`);
    playFeedbackSound('click');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[26px] md:text-[30px] font-bold text-[#151c27] tracking-tight font-['Inter']">
            Gestión de Usuarios y Roles
          </h1>
          <p className="text-[14px] text-[#434655] mt-1">
            Administración de cuentas con perfiles operativos de campo, bodega, calidad, logística y planta.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#004ac6] text-white hover:bg-[#2563eb] text-[13px] font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-[13px] text-emerald-900 shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button 
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-[#c3c6d7] rounded-xl shadow-xs">
          <span className="text-[11px] font-bold text-[#434655] uppercase block">Total Usuarios</span>
          <span className="text-[26px] font-bold text-[#151c27] mt-1 block">{usersList.length}</span>
          <span className="text-[11px] text-[#737686] block mt-0.5">En el sistema</span>
        </div>
        <div className="p-4 bg-white border border-[#c3c6d7] rounded-xl shadow-xs">
          <span className="text-[11px] font-bold text-[#434655] uppercase block">Inspectores QC</span>
          <span className="text-[26px] font-bold text-[#004ac6] mt-1 block">
            {usersList.filter(u => u.role === 'Inspector QC').length}
          </span>
          <span className="text-[11px] text-[#737686] block mt-0.5">Control de calidad</span>
        </div>
        <div className="p-4 bg-white border border-[#c3c6d7] rounded-xl shadow-xs">
          <span className="text-[11px] font-bold text-[#434655] uppercase block">Residentes de Campo</span>
          <span className="text-[26px] font-bold text-amber-700 mt-1 block">
            {usersList.filter(u => u.role === 'Residente de campo').length}
          </span>
          <span className="text-[11px] text-[#737686] block mt-0.5">Supervisión en obra</span>
        </div>
        <div className="p-4 bg-white border border-[#c3c6d7] rounded-xl shadow-xs">
          <span className="text-[11px] font-bold text-[#434655] uppercase block">Bodega y Logística</span>
          <span className="text-[26px] font-bold text-indigo-700 mt-1 block">
            {usersList.filter(u => u.role === 'Bodeguero' || u.role === 'Coordinador de logística' || u.role === 'Gerente de logística').length}
          </span>
          <span className="text-[11px] text-[#737686] block mt-0.5">Almacén y despacho</span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#c3c6d7] flex flex-wrap gap-3 items-center justify-between shadow-xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo corporativo..."
            className="w-full h-9 pl-9 pr-3 text-[13px] bg-[#f0f3ff] border border-transparent focus:border-[#004ac6] focus:bg-white rounded-lg outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[12px] font-semibold text-[#555f6f] hidden sm:block">Filtrar por rol:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 px-3 bg-white border border-[#c3c6d7] rounded-lg text-[13px] font-medium text-[#151c27] outline-none cursor-pointer focus:border-[#004ac6]"
          >
            <option value="">Todos los roles ({usersList.length})</option>
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role} ({usersList.filter(u => u.role === role).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-[#c3c6d7] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#f0f3ff] border-b border-[#c3c6d7]">
              <tr>
                <th className="px-4 py-3 text-[11px] font-bold text-[#434655] uppercase tracking-wider">Usuario</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#434655] uppercase tracking-wider">Rol Asignado</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#434655] uppercase tracking-wider">Proyectos Asignados</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#434655] uppercase tracking-wider">Último Acceso</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#434655] uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#434655] uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f8] text-[13px]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#737686]">
                    No se encontraron usuarios que coincidan con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const cfg = ROLE_CONFIG[user.role] || {
                    label: user.role,
                    icon: ShieldCheck,
                    bg: 'bg-slate-100',
                    text: 'text-slate-800',
                    border: 'border-slate-300',
                    desc: ''
                  };
                  const RoleIcon = cfg.icon;

                  return (
                    <tr key={user.id} className="hover:bg-[#f0f3ff] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-[#c3c6d7]" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold text-[11px]">
                              {user.initials}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-[#151c27] block">{user.name}</span>
                            <span className="text-[12px] text-[#555f6f]">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          <RoleIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>{cfg.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#555f6f]">
                        {user.projects.join(', ')}
                      </td>
                      <td className="px-4 py-3 text-[#737686] text-[12px]">
                        {user.lastActive}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          title="Click para cambiar estado"
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-opacity hover:opacity-80 ${
                            user.status === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {user.status === 'Activo' ? (
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              Activo
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              Inactivo
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => {
                            setSelectedUserForPermissions(user);
                            playFeedbackSound('click');
                          }}
                          className="px-2.5 py-1 bg-white border border-[#c3c6d7] hover:border-[#004ac6] hover:bg-[#f0f3ff] text-[#151c27] rounded-md text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-2xs ml-auto cursor-pointer group"
                          title="Ver matriz de permisos del rol"
                        >
                          <Key className="w-3.5 h-3.5 text-[#004ac6] group-hover:rotate-12 transition-transform" />
                          <span>Permisos</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#c3c6d7] p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#e2e8f8] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#004ac6] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[17px] text-[#151c27]">Crear Nuevo Usuario</h3>
                  <p className="text-[11px] text-[#555f6f]">Asigne credenciales y perfil operativo</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-[#737686] hover:text-[#151c27] p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-[13px]">
              <div>
                <label className="block font-semibold text-[#434655] mb-1">Nombre Completo *</label>
                <input
                  required
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Ing. Laura Mendoza"
                  className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#434655] mb-1">Correo Corporativo *</label>
                  <input
                    required
                    type="email"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      if (!newUsername) {
                        setNewUsername(e.target.value.split('@')[0]);
                      }
                    }}
                    placeholder="ej. laura.mendoza@alanza.com"
                    className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] focus:bg-white transition-colors text-[13px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#434655] mb-1">Nombre de Usuario (Login)</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="ej. lmendoza"
                    className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] focus:bg-white transition-colors text-[13px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#434655] mb-1">Contraseña Inicial de Acceso *</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Contraseña para iniciar sesión"
                    className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] focus:bg-white transition-colors text-[13px] font-mono"
                  />
                </div>
                <p className="text-[11px] text-[#737686] mt-1">
                  Esta contraseña será requerida para que el usuario inicie sesión desde la pantalla de login.
                </p>
              </div>

              {/* Selector de Rol Solicitado */}
              <div>
                <label className="block font-bold text-[#004ac6] mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#004ac6]" />
                  <span>Rol Operativo *</span>
                </label>
                <select
                  required
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRoleType)}
                  className="w-full h-10 px-3 bg-blue-50/50 border border-blue-200 rounded-lg outline-none font-semibold text-[#151c27] focus:border-[#004ac6] cursor-pointer"
                >
                  {USER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>

                {/* Explicación dinámica del rol seleccionado */}
                <div className="mt-2 p-2.5 rounded-lg border bg-slate-50 border-slate-200 flex items-start gap-2 text-[11px]">
                  <Info className="w-4 h-4 text-[#004ac6] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#151c27] block">Alcance del Rol ({newRole}):</span>
                    <span className="text-[#555f6f]">{ROLE_CONFIG[newRole].desc}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#434655] mb-1">Proyecto Asignado</label>
                <select
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] cursor-pointer"
                >
                  <option value="Todos los proyectos">Todos los proyectos</option>
                  <option value="Torre Mítica">Torre Mítica</option>
                  <option value="Mhotivo">Mhotivo</option>
                  <option value="Nave Industrial Alfa">Nave Industrial Alfa</option>
                  <option value="Puente San Juan">Puente San Juan</option>
                  <option value="Torre Norte">Torre Norte</option>
                  <option value="Planta Principal - Almacén Central">Planta Principal - Almacén Central</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#e2e8f8]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white border border-[#c3c6d7] hover:bg-[#f0f3ff] text-[#151c27] rounded-lg font-medium text-[13px] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#004ac6] hover:bg-[#2563eb] text-white font-semibold rounded-lg text-[13px] shadow-sm transition-colors cursor-pointer"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions & Role Privileges Modal */}
      {selectedUserForPermissions && (() => {
        const user = selectedUserForPermissions;
        const roleConfig = ROLE_CONFIG[user.role] || {
          label: user.role,
          icon: ShieldCheck,
          bg: 'bg-slate-100',
          text: 'text-slate-800',
          border: 'border-slate-300',
          desc: 'Funciones estándar del sistema.'
        };
        const RoleIcon = roleConfig.icon;
        const permissions = ROLE_PERMISSIONS[user.role] || [];
        const fullCount = permissions.filter(p => p.level === 'full').length;
        const readCount = permissions.filter(p => p.level === 'read').length;
        const noneCount = permissions.filter(p => p.level === 'none').length;

        const handleReassignRole = (newRole: UserRoleType) => {
          updateUser(user.id, { role: newRole as any });
          setSelectedUserForPermissions(prev => prev ? { ...prev, role: newRole } : null);
          addAudit('Modificación Rol Usuario', 'Usuarios y Permisos', `Rol de ${user.name} cambiado a "${newRole}"`);
          playFeedbackSound('success');
        };

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#c3c6d7] shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="p-5 border-b border-[#e2e8f8] bg-white flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#c3c6d7]" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold text-[15px] shadow-xs">
                      {user.initials}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[18px] text-[#151c27]">{user.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        user.status === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[12px] text-[#555f6f] mt-0.5">
                      <span>{user.email}</span>
                      <span>•</span>
                      <span>Proyectos: <strong className="text-[#151c27]">{user.projects.join(', ')}</strong></span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedUserForPermissions(null)}
                  className="text-[#737686] hover:text-[#151c27] p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Cerrar ventana"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Role Context & Reassignment Strip */}
              <div className="p-4 bg-[#f0f3ff] border-b border-[#e2e8f8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg border ${roleConfig.bg} ${roleConfig.border}`}>
                    <RoleIcon className={`w-5 h-5 ${roleConfig.text}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#434655] uppercase">Rol Actual:</span>
                      <span className={`font-bold text-[13px] px-2 py-0.5 rounded border ${roleConfig.bg} ${roleConfig.text} ${roleConfig.border}`}>
                        {user.role}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#555f6f] mt-0.5 max-w-md">
                      {roleConfig.desc}
                    </p>
                  </div>
                </div>

                {/* Quick Role Switcher */}
                <div className="shrink-0 flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#c3c6d7]">
                  <UserCog className="w-4 h-4 text-[#004ac6]" />
                  <div className="text-left">
                    <label className="text-[10px] text-[#737686] font-bold block uppercase">Cambiar Rol:</label>
                    <select
                      value={user.role}
                      onChange={(e) => handleReassignRole(e.target.value as UserRoleType)}
                      className="text-[12px] font-bold text-[#151c27] bg-transparent outline-none cursor-pointer"
                    >
                      {USER_ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Permissions Stats Bar */}
              <div className="px-5 py-2.5 bg-slate-50 border-b border-[#e2e8f8] flex items-center justify-between text-[12px]">
                <span className="font-semibold text-[#434655] flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#004ac6]" />
                  <span>Matriz de Privilegios Operativos ({permissions.length} módulos evaluados):</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {fullCount} Acceso Total
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[11px]">
                    <Eye className="w-3 h-3 text-blue-600" />
                    {readCount} Solo Lectura
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[11px]">
                    <Ban className="w-3 h-3 text-slate-500" />
                    {noneCount} Restringido
                  </span>
                </div>
              </div>

              {/* Scrollable Permissions List */}
              <div className="p-5 overflow-y-auto space-y-2.5 flex-1 bg-white">
                {permissions.map((p) => {
                  const isFull = p.level === 'full';
                  const isRead = p.level === 'read';

                  return (
                    <div 
                      key={p.id}
                      className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        isFull 
                          ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300' 
                          : isRead 
                            ? 'bg-blue-50/30 border-blue-200 hover:border-blue-300' 
                            : 'bg-slate-50 border-slate-200 opacity-80'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                          isFull 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : isRead 
                              ? 'bg-blue-100 text-[#004ac6]' 
                              : 'bg-slate-200 text-slate-500'
                        }`}>
                          {isFull ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : isRead ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <Ban className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686] bg-white px-2 py-0.5 rounded border border-slate-200">
                              {p.module}
                            </span>
                            <span className="font-bold text-[13px] text-[#151c27]">
                              {p.action}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#555f6f] mt-1 leading-relaxed">
                            {p.detail}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isFull && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <Check className="w-3 h-3 text-emerald-700" />
                            Acceso Total
                          </span>
                        )}
                        {isRead && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                            <Eye className="w-3 h-3 text-blue-700" />
                            Solo Lectura
                          </span>
                        )}
                        {!isFull && !isRead && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
                            <Ban className="w-3 h-3 text-slate-500" />
                            Restringido
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-[#e2e8f8] flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-[#737686]">
                  <Info className="w-4 h-4 text-[#004ac6] shrink-0" />
                  <span>Los privilegios aplican inmediatamente para este usuario en tiempo real.</span>
                </div>
                <button
                  onClick={() => setSelectedUserForPermissions(null)}
                  className="px-5 py-2 bg-[#004ac6] hover:bg-[#2563eb] text-white text-[13px] font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Entendido / Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

