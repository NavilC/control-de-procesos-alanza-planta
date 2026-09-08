import React from 'react';
import { useApp } from '../../context/AppContext';
import { TabType } from '../../types';
import { 
  LayoutDashboard, 
  Building2, 
  Layers, 
  CheckSquare, 
  Truck, 
  QrCode, 
  Boxes, 
  AlertTriangle, 
  BarChart3, 
  Users, 
  Settings,
  HardHat,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  id: TabType;
  label: string;
  iconName: string;
  LucideIcon: React.ElementType;
  badge?: number;
}

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, incidents, inspections, shipments } = useApp();

  const openIncidentsCount = incidents.filter(i => i.status !== 'Resuelta').length;
  const pendingQcCount = inspections.filter(i => i.qcStatus === 'Pendiente').length;
  const activeShipmentsCount = shipments.filter(s => s.status === 'En tránsito').length;

  const NAV_ITEMS: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', iconName: 'dashboard', LucideIcon: LayoutDashboard },
    { id: 'proyectos', label: 'Proyectos', iconName: 'architecture', LucideIcon: Building2 },
    { id: 'piezas', label: 'Piezas', iconName: 'precision_manufacturing', LucideIcon: Layers },
    { id: 'contratistas', label: 'Contratistas', iconName: 'engineering', LucideIcon: HardHat },
    { id: 'qc', label: 'Inspecciones QC', iconName: 'fact_check', LucideIcon: CheckSquare, badge: pendingQcCount },
    { id: 'envios', label: 'Envíos', iconName: 'local_shipping', LucideIcon: Truck, badge: activeShipmentsCount },
    { id: 'recepcion', label: 'Recepción en Campo', iconName: 'forklift', LucideIcon: QrCode },
    { id: 'inventario', label: 'Inventario', iconName: 'inventory_2', LucideIcon: Boxes },
    { id: 'incidencias', label: 'Incidencias', iconName: 'report_problem', LucideIcon: AlertTriangle, badge: openIncidentsCount },
    { id: 'reportes', label: 'Reportes', iconName: 'analytics', LucideIcon: BarChart3 },
    { id: 'usuarios', label: 'Usuarios y Permisos', iconName: 'group', LucideIcon: Users },
    { id: 'configuracion', label: 'Configuración', iconName: 'settings', LucideIcon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside 
        className={`fixed left-0 top-0 h-full w-[260px] bg-[#2a313d] text-[#ebf1ff] border-r border-[#3d4756] flex flex-col py-4 z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        id="sidebar"
      >
        {/* Brand Header */}
        <div className="px-5 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2563eb] rounded-lg flex items-center justify-center shrink-0 shadow-md">
            <span className="material-symbols-outlined text-white text-[22px]">domain</span>
          </div>
          <div className="overflow-hidden">
            <h1 className="text-[15px] font-bold text-white tracking-tight leading-tight uppercase font-['Inter']">
              CONTROL DE ENVÍOS
            </h1>
            <p className="text-[11px] text-[#b4c5ff] font-semibold tracking-wider uppercase mt-0.5 opacity-90">
              ALANZA CONSTRUCCION
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-[#2563eb] text-white shadow-sm font-semibold'
                    : 'text-[#dce2f3] hover:text-white hover:bg-[#3d4756]/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px] shrink-0">
                    {item.iconName}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive 
                      ? 'bg-white text-[#2563eb]' 
                      : item.id === 'incidencias' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-[#3d4756] text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Footer info */}
        <div className="px-4 pt-3 border-t border-[#3d4756]/80 text-[#94a3b8] text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Sistema En Línea</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">v2.6.4</span>
        </div>
      </aside>
    </>
  );
};
