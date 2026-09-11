import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Bell, 
  HelpCircle, 
  Menu, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ExternalLink,
  ChevronDown,
  UserCheck,
  ShieldCheck,
  Building,
  Briefcase,
  Layers,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { playFeedbackSound } from '../../utils/audioFeedback';

interface TopNavBarProps {
  onToggleSidebar?: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ onToggleSidebar }) => {
  const { 
    globalSearch, 
    setGlobalSearch, 
    selectedProjectFilter,
    setSelectedProjectFilter,
    projects,
    notifications, 
    notificationDrawerOpen, 
    setNotificationDrawerOpen,
    markNotificationsAsRead,
    setActiveTab,
    currentUserRole,
    setCurrentUserRole,
    currentUser,
    logout,
    isSidebarOpen,
    toggleSidebar
  } = useApp();

  const handleToggle = () => {
    playFeedbackSound('click');
    if (onToggleSidebar) {
      onToggleSidebar();
    } else {
      toggleSidebar();
    }
  };

  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="w-full h-16 shrink-0 bg-[#ffffff] border-b border-[#e2e8f8] flex items-center justify-between px-3 md:px-6 relative z-30 transition-all duration-200">
        {/* Left: Sidebar Toggle & Global Search */}
        <div className="flex items-center gap-2 md:gap-3 flex-1 max-w-lg">
          <button 
            onClick={handleToggle}
            id="btn-toggle-sidebar"
            className="p-2 rounded-lg text-[#434655] hover:bg-[#f0f3ff] hover:text-[#004ac6] transition-colors shrink-0 flex items-center justify-center cursor-pointer"
            title={isSidebarOpen ? "Ocultar menú lateral" : "Mostrar menú lateral"}
            aria-label={isSidebarOpen ? "Ocultar menú lateral" : "Mostrar menú lateral"}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-5 h-5 text-[#434655]" />
            ) : (
              <PanelLeftOpen className="w-5 h-5 text-[#004ac6]" />
            )}
          </button>

          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737686] text-[20px]">
              search
            </span>
            <input 
              type="text"
              id="top-search-input"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Buscar marcas (2S-37A), envíos, piezas..."
              className="w-full h-10 pl-10 pr-4 bg-[#f0f3ff] border border-transparent focus:border-[#004ac6] focus:bg-white rounded-lg text-[13px] text-[#151c27] placeholder-[#737686] outline-none transition-all"
            />
            {globalSearch && (
              <button 
                onClick={() => setGlobalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#151c27]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Global Project Switcher Pill */}
          <div className="relative">
            <button
              id="global-project-selector-btn"
              onClick={() => {
                playFeedbackSound('click');
                setShowProjectMenu(!showProjectMenu);
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#f0f3ff] hover:bg-[#e2e8f8] border border-[#dce2f3] rounded-lg text-[12px] font-medium text-[#151c27] transition-colors shadow-xs"
              title="Filtrar por proyecto activo en todo el sistema"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#004ac6] shrink-0" />
              <span className="hidden sm:inline text-[#555f6f]">Proyecto:</span>
              <span className="font-bold text-[#004ac6] max-w-[110px] sm:max-w-[150px] truncate">
                {selectedProjectFilter || 'Todos'}
              </span>
              <ChevronDown className="w-3 h-3 text-[#737686] shrink-0" />
            </button>

            {showProjectMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#c3c6d7] rounded-xl shadow-xl z-50 p-2 text-[13px] animate-in fade-in">
                <div className="px-2.5 py-1.5 border-b border-[#e2e8f8] mb-1 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#737686] uppercase tracking-wider">
                    Contexto de Proyecto
                  </span>
                  <span className="text-[10px] text-[#004ac6] font-semibold bg-[#dbe1ff] px-1.5 py-0.5 rounded">
                    {projects.length} Registrados
                  </span>
                </div>

                <div className="py-1 max-h-60 overflow-y-auto space-y-1">
                  <button
                    onClick={() => {
                      setSelectedProjectFilter('');
                      setShowProjectMenu(false);
                      playFeedbackSound('click');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[12px] flex items-center justify-between transition-colors ${
                      !selectedProjectFilter 
                        ? 'bg-[#004ac6] text-white font-bold' 
                        : 'hover:bg-[#f0f3ff] text-[#151c27]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Todos los Proyectos</span>
                    </div>
                    {!selectedProjectFilter && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  {projects.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => {
                        setSelectedProjectFilter(proj.name);
                        setShowProjectMenu(false);
                        playFeedbackSound('click');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[12px] flex items-center justify-between transition-colors ${
                        selectedProjectFilter.toLowerCase() === proj.name.toLowerCase()
                          ? 'bg-[#004ac6] text-white font-bold'
                          : 'hover:bg-[#f0f3ff] text-[#151c27]'
                      }`}
                    >
                      <div>
                        <p className="font-semibold leading-tight">{proj.name}</p>
                        <span className={`text-[10px] block ${selectedProjectFilter.toLowerCase() === proj.name.toLowerCase() ? 'text-blue-100' : 'text-[#737686]'}`}>
                          {proj.ov} • {proj.piecesCount} pzs
                        </span>
                      </div>
                      {selectedProjectFilter.toLowerCase() === proj.name.toLowerCase() && (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats Pill */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-[#f0f3ff] rounded-full border border-[#dce2f3] text-[12px] font-medium text-[#434655]">
            <Building className="w-3.5 h-3.5 text-[#004ac6]" />
            <span>ALANZA</span>
            <span className="text-[#004ac6] font-bold">Planta Central</span>
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button 
              id="notifications-btn"
              onClick={() => {
                setNotificationDrawerOpen(!notificationDrawerOpen);
                if (!notificationDrawerOpen) {
                  markNotificationsAsRead();
                }
              }}
              className="relative p-2.5 rounded-full text-[#434655] hover:bg-[#f0f3ff] transition-colors"
              title="Notificaciones"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notifications Drawer Dropdown */}
            {notificationDrawerOpen && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-[#c3c6d7] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border-b border-[#e2e8f8] bg-[#f9f9ff] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#004ac6]">campaign</span>
                    <h3 className="font-semibold text-[14px] text-[#151c27]">Alertas y Notificaciones</h3>
                  </div>
                  <button 
                    onClick={() => setNotificationDrawerOpen(false)}
                    className="text-[#737686] hover:text-[#151c27]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#e2e8f8]">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-3.5 hover:bg-[#f0f3ff] transition-colors flex gap-3 ${
                        notif.type === 'error' ? 'bg-red-50/40' : notif.type === 'warning' ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {notif.type === 'error' && <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">error</span>}
                        {notif.type === 'warning' && <span className="material-symbols-outlined text-[#f59e0b] text-[18px]">warning</span>}
                        {notif.type === 'success' && <span className="material-symbols-outlined text-[#10b981] text-[18px]">check_circle</span>}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[12px] font-semibold text-[#151c27] leading-snug">{notif.title}</p>
                        <p className="text-[11px] text-[#434655] mt-0.5">{notif.message}</p>
                        <span className="text-[10px] text-[#737686] block mt-1">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-[#f9f9ff] border-t border-[#e2e8f8] text-center">
                  <button 
                    onClick={() => {
                      setNotificationDrawerOpen(false);
                      setActiveTab('incidencias');
                    }}
                    className="text-[12px] font-semibold text-[#004ac6] hover:underline"
                  >
                    Ver todas las incidencias y alertas →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Help Button */}
          <button 
            id="help-btn"
            onClick={() => setShowHelpModal(true)}
            className="p-2.5 rounded-full text-[#434655] hover:bg-[#f0f3ff] transition-colors"
            title="Centro de Ayuda y Guía del Sistema"
          >
            <span className="material-symbols-outlined text-[22px]">help</span>
          </button>

          <div className="h-6 w-px bg-[#c3c6d7] mx-1"></div>

          {/* User Profile Pill */}
          <div className="relative">
            <button 
              id="user-profile-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-lg hover:bg-[#f0f3ff] transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-bold text-[12px] shadow-sm overflow-hidden">
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{currentUser?.initials || (currentUserRole === 'Administrador' ? 'JP' : currentUserRole === 'Producción' ? 'RM' : 'AG')}</span>
                )}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-[13px] font-semibold text-[#151c27]">
                  {currentUser?.name || (currentUserRole === 'Administrador' ? 'Juan Pérez' : currentUserRole === 'Producción' ? 'Ing. Roberto M.' : 'Ing. Ana Gómez')}
                </span>
                <span className="text-[11px] text-[#555f6f]">
                  {currentUser?.role || currentUserRole}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#737686] hidden sm:block" />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-[#c3c6d7] rounded-xl shadow-xl z-50 p-2 text-[13px] animate-in fade-in">
                <div className="p-2.5 border-b border-[#e2e8f8] mb-1">
                  <p className="font-semibold text-[#151c27]">
                    {currentUser?.name || (currentUserRole === 'Administrador' ? 'Juan Pérez' : currentUserRole === 'Producción' ? 'Ing. Roberto Mendoza' : 'Ing. Ana Gómez')}
                  </p>
                  <p className="text-[11px] text-[#737686]">
                    {currentUser?.email || (currentUserRole === 'Administrador' ? 'jperez@alanza.com' : currentUserRole === 'Producción' ? 'rmendoza@alanza.com' : 'agomez@alanza.com')}
                  </p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold bg-[#dbe1ff] text-[#00174b] rounded">
                    Rol: {currentUser?.role || currentUserRole}
                  </span>
                </div>

                <div className="py-1">
                  <p className="px-3 py-1 text-[11px] font-bold text-[#737686] uppercase tracking-wider">
                    Cambiar Perfil Operativo:
                  </p>
                  <button 
                    onClick={() => {
                      setCurrentUserRole('Administrador');
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                      currentUserRole === 'Administrador' ? 'bg-[#eef2ff] font-semibold text-[#004ac6]' : 'hover:bg-[#f0f3ff] text-[#151c27]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#004ac6]" />
                      <div>
                        <span className="block text-[12px] leading-tight font-semibold">Administrador</span>
                        <span className="block text-[10px] text-[#737686]">Control total, CRUD y reasignación</span>
                      </div>
                    </div>
                    {currentUserRole === 'Administrador' && <CheckCircle2 className="w-3.5 h-3.5 text-[#004ac6]" />}
                  </button>

                  <button 
                    onClick={() => {
                      setCurrentUserRole('Producción');
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                      currentUserRole === 'Producción' ? 'bg-[#eef2ff] font-semibold text-[#004ac6]' : 'hover:bg-[#f0f3ff] text-[#151c27]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#004ac6]" />
                      <div>
                        <span className="block text-[12px] leading-tight font-semibold">Producción</span>
                        <span className="block text-[10px] text-[#737686]">Asignar trabajo y ver reportes</span>
                      </div>
                    </div>
                    {currentUserRole === 'Producción' && <CheckCircle2 className="w-3.5 h-3.5 text-[#004ac6]" />}
                  </button>

                  <button 
                    onClick={() => {
                      setCurrentUserRole('Inspector QC');
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                      currentUserRole === 'Inspector QC' ? 'bg-[#eef2ff] font-semibold text-[#004ac6]' : 'hover:bg-[#f0f3ff] text-[#151c27]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#004ac6]" />
                      <div>
                        <span className="block text-[12px] leading-tight font-semibold">Inspector QC</span>
                        <span className="block text-[10px] text-[#737686]">Solo lectura y auditoría de trazabilidad</span>
                      </div>
                    </div>
                    {currentUserRole === 'Inspector QC' && <CheckCircle2 className="w-3.5 h-3.5 text-[#004ac6]" />}
                  </button>
                  
                  <div className="border-t border-[#e2e8f8] mt-1 pt-1 space-y-1">
                    <button 
                      onClick={() => {
                        setActiveTab('contratistas');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#f0f3ff] text-[#151c27] flex items-center gap-2 text-[12px] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#004ac6]">engineering</span>
                      <span>Ir a Módulo Contratistas</span>
                    </button>

                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowLogoutModal(true);
                        playFeedbackSound('click');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-between group transition-colors cursor-pointer border border-transparent hover:border-red-200"
                      id="btn-logout"
                      title="Cerrar sesión del sistema"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-red-600 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="font-semibold text-[12px] text-red-600">Cerrar Sesión</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                        Salir
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-[#c3c6d7] shadow-2xl p-6 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-3">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[18px] text-[#151c27]">¿Cerrar Sesión?</h3>
            <p className="text-[13px] text-[#555f6f] mt-1.5 mb-5 leading-relaxed">
              Finalizarás la sesión activa de <strong>{currentUser?.name || (currentUserRole === 'Administrador' ? 'Juan Pérez' : currentUserRole === 'Producción' ? 'Ing. Roberto Mendoza' : 'Ing. Ana Gómez')}</strong>. Podrás volver a iniciar sesión con tus credenciales asignadas en cualquier momento.
            </p>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 px-3 border border-[#c3c6d7] hover:bg-slate-100 text-[#151c27] text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                  playFeedbackSound('success');
                }}
                className="flex-1 py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white text-[13px] font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                id="btn-confirm-logout"
              >
                Sí, Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-[#c3c6d7] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-[#e2e8f8] bg-[#f9f9ff] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2563eb] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">help</span>
                </div>
                <div>
                  <h3 className="font-bold text-[16px] text-[#151c27]">Centro de Ayuda - ALANZA</h3>
                  <p className="text-[12px] text-[#555f6f]">Manual operativo de trazabilidad y control de envíos</p>
                </div>
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="text-[#737686] hover:text-[#151c27] p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-[13px] text-[#434655] max-h-[70vh] overflow-y-auto">
              <div className="p-3 bg-[#f0f3ff] rounded-lg border border-[#dce2f3]">
                <h4 className="font-bold text-[#004ac6] mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Flujo Completo de Trazabilidad
                </h4>
                <p>
                  1. <strong>Piezas:</strong> Registro de colada, dimensiones y corte en taller.<br/>
                  2. <strong>Inspección QC:</strong> Liberación dimensional, soldadura y recubrimiento.<br/>
                  3. <strong>Envíos:</strong> Remisión de carga y asignación a unidad de despacho (flota interna).<br/>
                  4. <strong>Recepción en Campo:</strong> Escaneo o cotejo de piezas y firma digital de manifiesto.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-[#e2e8f8] rounded-lg">
                  <h5 className="font-bold text-[#151c27] mb-1">Módulos Clave</h5>
                  <ul className="list-disc list-inside space-y-0.5 text-[12px] text-[#555f6f]">
                    <li>Dashboard de avance en tiempo real</li>
                    <li>Control de piezas & historial</li>
                    <li>Gestión de stock de materia prima</li>
                    <li>Registro y solución de incidencias</li>
                  </ul>
                </div>
                <div className="p-3 bg-white border border-[#e2e8f8] rounded-lg">
                  <h5 className="font-bold text-[#151c27] mb-1">Exportación y Reportes</h5>
                  <ul className="list-disc list-inside space-y-0.5 text-[12px] text-[#555f6f]">
                    <li>Generación de reportes en CSV</li>
                    <li>Auditoría end-to-end de coladas</li>
                    <li>Manifiestos de transporte firmados</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#f9f9ff] border-t border-[#e2e8f8] flex justify-end">
              <button 
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2 bg-[#004ac6] text-white rounded-lg font-semibold text-[13px] hover:bg-[#2563eb] transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
