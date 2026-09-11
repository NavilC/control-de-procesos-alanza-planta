import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Download, 
  ArrowRight, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Layers, 
  Hammer, 
  ShieldAlert,
  ChevronDown,
  Calendar,
  Filter
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    projects, 
    pieces, 
    shipments, 
    incidents, 
    inspections,
    setActiveTab, 
    setSelectedPieceForTraceability,
    exportToCSV,
    selectedProjectFilter,
    setSelectedProjectFilter,
    selectedTimeRangeFilter,
    setSelectedTimeRangeFilter
  } = useApp();

  const [exportSuccess, setExportSuccess] = useState(false);

  // Dynamic calculations based on state
  const totalPieces = pieces.length > 0 ? pieces.length : 280;
  const fabricadas = pieces.filter(p => p.status === 'Fabricada' || p.status === 'Enviada' || p.status === 'Recibida').length;
  const pendingQC = inspections.filter(i => i.qcStatus === 'Pendiente').length;
  const enviadas = pieces.filter(p => p.status === 'Enviada' || p.status === 'Recibida').length;
  const activeIncidents = incidents.filter(i => i.status !== 'Resuelta').length;

  const handleExport = () => {
    exportToCSV(`Dashboard_Alanza_${selectedProjectFilter}`, [
      { Metrica: 'Piezas Totales', Valor: totalPieces },
      { Metrica: 'Fabricadas', Valor: fabricadas },
      { Metrica: 'Pendientes Inspección', Valor: pendingQC },
      { Metrica: 'Enviadas', Valor: enviadas },
      { Metrica: 'Incidencias', Valor: activeIncidents },
      { Metrica: 'Progreso Envíos', Valor: '66.4%' }
    ]);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#151c27] tracking-tight font-['Inter']">
            Dashboard
          </h1>
          <p className="text-[14px] text-[#434655] mt-1">
            Monitoreo general de producción, calidad, envíos y trazabilidad.
          </p>
        </div>

        {/* Filter Dropdowns & Export Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Project Selector */}
          <div className="relative">
            <select
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
              className="appearance-none bg-white border border-[#c3c6d7] text-[#151c27] text-[13px] font-medium rounded-lg pl-3.5 pr-9 py-2 focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] outline-none cursor-pointer shadow-xs"
            >
              <option value="Mhotivo">Proyecto: Mhotivo</option>
              <option value="Torre Norte">Proyecto: Torre Norte</option>
              <option value="Torre Mítica">Proyecto: Torre Mítica</option>
              <option value="Nave Industrial Zenith">Proyecto: Planta Industrial</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737686] pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>

          {/* Time Range Selector */}
          <div className="relative">
            <select
              value={selectedTimeRangeFilter}
              onChange={(e) => setSelectedTimeRangeFilter(e.target.value)}
              className="appearance-none bg-white border border-[#c3c6d7] text-[#151c27] text-[13px] font-medium rounded-lg pl-3.5 pr-9 py-2 focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] outline-none cursor-pointer shadow-xs"
            >
              <option value="Últimos 30 días">Últimos 30 días</option>
              <option value="Esta semana">Esta semana</option>
              <option value="Este mes">Este mes</option>
              <option value="Todo el histórico">Todo el histórico</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737686] pointer-events-none text-[18px]">
              calendar_today
            </span>
          </div>

          {/* Export Button */}
          <button
            id="export-dashboard-btn"
            onClick={handleExport}
            className="bg-[#004ac6] text-white hover:bg-[#2563eb] px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>{exportSuccess ? 'Exportado ✓' : 'Exportar'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* KPI 1: Piezas Totales */}
        <div 
          onClick={() => setActiveTab('piezas')}
          className="bg-white border border-[#c3c6d7] rounded-xl p-4 flex flex-col justify-between hover:border-[#004ac6] transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-2 mb-2 text-[#434655]">
            <span className="material-symbols-outlined text-[20px] text-[#004ac6]">category</span>
            <span className="text-[12px] font-bold tracking-wider uppercase">PIEZAS TOTALES</span>
          </div>
          <div className="text-[32px] font-bold text-[#151c27] tracking-tight">280</div>
        </div>

        {/* KPI 2: Fabricadas */}
        <div 
          onClick={() => setActiveTab('piezas')}
          className="bg-white border border-[#c3c6d7] rounded-xl p-4 flex flex-col justify-between hover:border-[#004ac6] transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-2 mb-2 text-[#434655]">
            <span className="material-symbols-outlined text-[20px] text-slate-700">construction</span>
            <span className="text-[12px] font-bold tracking-wider uppercase">FABRICADAS</span>
          </div>
          <div className="text-[32px] font-bold text-[#151c27] tracking-tight">245</div>
        </div>

        {/* KPI 3: Pendientes Inspección */}
        <div 
          onClick={() => setActiveTab('qc')}
          className="bg-white border border-[#c3c6d7] rounded-xl p-4 flex flex-col justify-between hover:border-amber-500 transition-all cursor-pointer relative overflow-hidden shadow-xs"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#f59e0b]"></div>
          <div className="flex items-center gap-2 mb-2 text-[#434655] pl-1">
            <span className="material-symbols-outlined text-[20px] text-[#d97706]">pending_actions</span>
            <span className="text-[12px] font-bold tracking-wider uppercase">PEND. INSPECCIÓN</span>
          </div>
          <div className="text-[32px] font-bold text-[#151c27] tracking-tight pl-1">94</div>
        </div>

        {/* KPI 4: Enviadas */}
        <div 
          onClick={() => setActiveTab('envios')}
          className="bg-white border border-[#c3c6d7] rounded-xl p-4 flex flex-col justify-between hover:border-[#004ac6] transition-all cursor-pointer relative overflow-hidden shadow-xs"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#004ac6]"></div>
          <div className="flex items-center gap-2 mb-2 text-[#004ac6] pl-1">
            <span className="material-symbols-outlined text-[20px]">local_shipping</span>
            <span className="text-[12px] font-bold tracking-wider uppercase">ENVIADAS</span>
          </div>
          <div className="text-[32px] font-bold text-[#004ac6] tracking-tight pl-1">186</div>
        </div>

        {/* KPI 5: Incidencias */}
        <div 
          onClick={() => setActiveTab('incidencias')}
          className="bg-[#ffdad6] border border-[#ffb4ab] rounded-xl p-4 flex flex-col justify-between hover:bg-[#ffcdd2]/80 transition-all cursor-pointer shadow-xs col-span-2 sm:col-span-1"
        >
          <div className="flex items-center gap-2 mb-2 text-[#93000a]">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            <span className="text-[12px] font-bold tracking-wider uppercase">INCIDENCIAS</span>
          </div>
          <div className="text-[32px] font-bold text-[#93000a] tracking-tight">7</div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white border border-[#c3c6d7] rounded-xl p-5 md:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
          <div>
            <h2 className="text-[18px] md:text-[20px] font-bold text-[#151c27]">
              Progreso General de Envíos
            </h2>
            <p className="text-[13px] text-[#434655] mt-0.5">
              Avance del proyecto {selectedProjectFilter}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[28px] md:text-[32px] font-bold text-[#004ac6]">66.4%</span>
            <p className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
              186 / 280 PIEZAS ENVIADAS
            </p>
          </div>
        </div>

        {/* Segmented Progress Bar */}
        <div className="w-full bg-[#e2e8f8] rounded-full h-4 overflow-hidden flex shadow-inner">
          <div 
            className="bg-[#10b981] h-4 rounded-l-full transition-all duration-500" 
            style={{ width: '60%' }} 
            title="Recibidas en campo (60% - 168 piezas)"
          />
          <div 
            className="bg-[#f59e0b] h-4 transition-all duration-500" 
            style={{ width: '6.4%' }} 
            title="En Tránsito (6.4% - 18 piezas)"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 text-[12px] font-semibold text-[#434655]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#10b981]"></span>
              <span>Recibidas (168)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span>
              <span>En Tránsito (18)</span>
            </div>
          </div>
          <div className="text-[#555f6f]">
            Meta: 280 Piezas
          </div>
        </div>
      </div>

      {/* Main Bento Grid: Table & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Section: Últimos Envíos */}
        <div className="lg:col-span-2 bg-white border border-[#c3c6d7] rounded-xl flex flex-col shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#e2e8f8] flex justify-between items-center bg-[#f9fafb]">
            <h3 className="text-[17px] font-bold text-[#151c27]">
              Últimos Envíos
            </h3>
            <button 
              onClick={() => setActiveTab('envios')}
              className="px-3 py-1.5 bg-white border border-[#c3c6d7] hover:border-[#004ac6] hover:bg-[#f0f3ff] text-[#004ac6] text-[12px] font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1"
            >
              <span>Ver todos los envíos</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="bg-[#f9fafb] border-b border-[#e2e8f8]">
                  <th className="py-2.5 px-3.5 text-[11px] font-bold text-[#434655] uppercase tracking-wider">ID ENVÍO</th>
                  <th className="py-2.5 px-3.5 text-[11px] font-bold text-[#434655] uppercase tracking-wider">PROYECTO</th>
                  <th className="py-2.5 px-3.5 text-[11px] font-bold text-[#434655] uppercase tracking-wider">FECHA</th>
                  <th className="py-2.5 px-3.5 text-[11px] font-bold text-[#434655] uppercase tracking-wider">PIEZAS</th>
                  <th className="py-2.5 px-3.5 text-[11px] font-bold text-[#434655] uppercase tracking-wider">ESTADO</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#151c27] divide-y divide-[#e2e8f8]">
                {/* Row 1: ENV-00286 */}
                <tr 
                  onClick={() => setActiveTab('recepcion')}
                  className="hover:bg-[#f3f4f6] transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-3.5 font-mono font-semibold text-[#004ac6] group-hover:underline">
                    ENV-00286
                  </td>
                  <td className="py-3 px-3.5 font-medium">Mhotivo</td>
                  <td className="py-3 px-3.5 text-[#555f6f]">24 Oct, 08:30</td>
                  <td className="py-3 px-3.5 font-mono">12</td>
                  <td className="py-3 px-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#fef3c7] text-[#d97706] border border-[#fde68a]">
                      En Tránsito
                    </span>
                  </td>
                </tr>

                {/* Row 2: ENV-00285 */}
                <tr 
                  onClick={() => setActiveTab('envios')}
                  className="hover:bg-[#f3f4f6] transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-3.5 font-mono font-semibold text-[#004ac6] group-hover:underline">
                    ENV-00285
                  </td>
                  <td className="py-3 px-3.5 font-medium">Torre Norte</td>
                  <td className="py-3 px-3.5 text-[#555f6f]">23 Oct, 14:15</td>
                  <td className="py-3 px-3.5 font-mono">8</td>
                  <td className="py-3 px-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#d1fae5] text-[#059669] border border-[#a7f3d0]">
                      Recibido
                    </span>
                  </td>
                </tr>

                {/* Row 3: ENV-00284 */}
                <tr 
                  onClick={() => setActiveTab('incidencias')}
                  className="hover:bg-[#f3f4f6] transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-3.5 font-mono font-semibold text-[#004ac6] group-hover:underline">
                    ENV-00284
                  </td>
                  <td className="py-3 px-3.5 font-medium">Mhotivo</td>
                  <td className="py-3 px-3.5 text-[#555f6f]">22 Oct, 09:00</td>
                  <td className="py-3 px-3.5 font-mono">24</td>
                  <td className="py-3 px-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#fee2e2] text-[#dc2626] border border-[#fecaca]">
                      Incidencia
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts & Incidents Panel */}
        <div className="bg-white border border-[#c3c6d7] rounded-xl flex flex-col shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#e2e8f8] bg-[#f9fafb] flex items-center justify-between">
            <h3 className="text-[17px] font-bold text-[#151c27] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#dc2626] text-[20px]">campaign</span>
              Alertas e Incidencias
            </h3>
            <span className="text-[11px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              2 Nuevas
            </span>
          </div>

          <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px]">
            {/* Alert 1 */}
            <div 
              onClick={() => setActiveTab('incidencias')}
              className="p-3 border border-[#fecaca] bg-[#fef2f2] rounded-lg hover:bg-red-100/60 transition-colors cursor-pointer"
            >
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-[#dc2626] text-[20px] mt-0.5 shrink-0">error</span>
                <div>
                  <h4 className="text-[12px] font-bold text-[#991b1b]">
                    Piezas faltantes en ENV-00284
                  </h4>
                  <p className="text-[12px] text-[#7f1d1d] mt-1 leading-relaxed">
                    Se reportaron 2 vigas con daño durante la descarga en campo.
                  </p>
                  <span className="text-[10px] font-medium text-[#991b1b] opacity-80 mt-1.5 block">
                    Hace 2 horas
                  </span>
                </div>
              </div>
            </div>

            {/* Alert 2 */}
            <div 
              onClick={() => setActiveTab('qc')}
              className="p-3 border border-[#fde68a] bg-[#fffbeb] rounded-lg hover:bg-amber-100/60 transition-colors cursor-pointer"
            >
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-[#d97706] text-[20px] mt-0.5 shrink-0">warning</span>
                <div>
                  <h4 className="text-[12px] font-bold text-[#b45309]">
                    94 Inspecciones pendientes
                  </h4>
                  <p className="text-[12px] text-[#92400e] mt-1 leading-relaxed">
                    Lote de fabricación L-102 requiere liberación QC para envío.
                  </p>
                  <span className="text-[10px] font-medium text-[#b45309] opacity-80 mt-1.5 block">
                    Hoy, 08:00 AM
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-[#e2e8f8] bg-[#f9fafb] text-center">
            <button 
              onClick={() => setActiveTab('incidencias')}
              className="px-4 py-2 bg-white border border-[#c3c6d7] hover:border-[#004ac6] hover:bg-[#f0f3ff] text-[#004ac6] text-[12px] font-bold rounded-lg transition-colors shadow-2xs inline-flex items-center justify-center gap-1 w-full"
            >
              <span>Gestionar panel de incidencias</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
