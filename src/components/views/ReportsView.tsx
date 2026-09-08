import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Truck, 
  AlertCircle, 
  BarChart3,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { exportToCSV, pieces, shipments, projects } = useApp();
  const [selectedProject, setSelectedProject] = useState('Torre Mítica');
  const [selectedPeriod, setSelectedPeriod] = useState('Últimos 30 días');
  const [reportType, setReportType] = useState('General de Avance');

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[26px] md:text-[30px] font-bold text-[#151c27] tracking-tight font-['Inter']">
            Reportes & Analítica
          </h1>
          <p className="text-[14px] text-[#434655] mt-1">
            Métricas de rendimiento operacional, avance de fabricación y despacho.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => exportToCSV('Reporte_General_Alanza', pieces.map(p => ({
              Marca: p.mark,
              Tipo: p.type,
              Perfil: p.profile,
              Proyecto: p.project,
              Estado: p.status,
              QC_Estado: p.qcStatus,
              Peso_kg: p.weightKg
            })))}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#c3c6d7] rounded-lg text-[#151c27] font-semibold text-[13px] hover:bg-[#f0f3ff] transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#004ac6]" />
            <span>Exportar CSV / Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-[#004ac6] text-white rounded-lg font-semibold text-[13px] hover:bg-[#2563eb] transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Generar Reporte PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#c3c6d7] flex flex-wrap gap-3 items-center shadow-xs">
        <div className="flex flex-col gap-1 min-w-[180px]">
          <label className="text-[11px] font-bold text-[#434655] uppercase">Proyecto</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="h-9 px-3 bg-white border border-[#c3c6d7] focus:border-[#004ac6] rounded-lg text-[13px] text-[#151c27] outline-none cursor-pointer"
          >
            <option value="Todos los proyectos">Todos los proyectos</option>
            <option value="Torre Mítica">Torre Mítica</option>
            <option value="Nave Industrial SUR">Nave Industrial SUR</option>
            <option value="Mhotivo">Mhotivo</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-[11px] font-bold text-[#434655] uppercase">Periodo</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="h-9 px-3 bg-white border border-[#c3c6d7] focus:border-[#004ac6] rounded-lg text-[13px] text-[#151c27] outline-none cursor-pointer"
          >
            <option value="Últimos 7 días">Últimos 7 días</option>
            <option value="Últimos 30 días">Últimos 30 días</option>
            <option value="Este Trimestre (Q4)">Este Trimestre (Q4)</option>
            <option value="Año en Curso (2023-2024)">Año en Curso</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[200px]">
          <label className="text-[11px] font-bold text-[#434655] uppercase">Tipo de Reporte</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="h-9 px-3 bg-white border border-[#c3c6d7] focus:border-[#004ac6] rounded-lg text-[13px] text-[#151c27] outline-none cursor-pointer"
          >
            <option value="General de Avance">General de Avance</option>
            <option value="Rendimiento QC">Rendimiento QC e Inspecciones</option>
            <option value="Cumplimiento de Envíos">Cumplimiento Logístico y Envíos</option>
            <option value="Auditoría de Trazabilidad">Auditoría de Trazabilidad</option>
          </select>
        </div>
      </div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Progress Timeline Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#c3c6d7] rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-[16px] text-[#151c27]">
                Curva de Fabricación y Despacho vs Plan
              </h3>
              <p className="text-[12px] text-[#555f6f]">
                Toneladas de acero producidas vs cronograma maestro
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span className="flex items-center gap-1.5 text-[#004ac6]">
                <span className="w-3 h-3 rounded-sm bg-[#004ac6]" /> Planificado
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-3 h-3 rounded-sm bg-emerald-500" /> Fabricado
              </span>
              <span className="flex items-center gap-1.5 text-amber-600">
                <span className="w-3 h-3 rounded-sm bg-amber-500" /> Despachado
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-[#e2e8f8]">
            {[
              { month: 'Sem 1', plan: 140, fab: 135, ship: 120 },
              { month: 'Sem 2', plan: 160, fab: 168, ship: 155 },
              { month: 'Sem 3', plan: 180, fab: 175, ship: 160 },
              { month: 'Sem 4', plan: 210, fab: 220, ship: 195 },
              { month: 'Sem 5', plan: 240, fab: 230, ship: 210 },
              { month: 'Sem 6', plan: 260, fab: 275, ship: 250 },
            ].map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 h-48">
                  {/* Plan bar */}
                  <div 
                    style={{ height: `${(d.plan / 300) * 100}%` }}
                    className="w-1/4 bg-[#e2e8f8] hover:bg-[#cdd7ee] rounded-t transition-all"
                    title={`Plan: ${d.plan} Ton`}
                  />
                  {/* Fab bar */}
                  <div 
                    style={{ height: `${(d.fab / 300) * 100}%` }}
                    className="w-1/4 bg-[#004ac6] hover:bg-[#2563eb] rounded-t transition-all"
                    title={`Fabricado: ${d.fab} Ton`}
                  />
                  {/* Ship bar */}
                  <div 
                    style={{ height: `${(d.ship / 300) * 100}%` }}
                    className="w-1/4 bg-amber-500 hover:bg-amber-600 rounded-t transition-all"
                    title={`Despachado: ${d.ship} Ton`}
                  />
                </div>
                <span className="text-[11px] font-mono font-medium text-[#555f6f]">{d.month}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-3 text-[12px] text-[#555f6f]">
            <span>Cumplimiento del Plan Maestro: <strong className="text-emerald-700 font-bold">102.4%</strong></span>
            <span>Tonelaje Total Acumulado: <strong className="text-[#151c27] font-bold">1,203 Ton</strong></span>
          </div>
        </div>

        {/* Piece Status Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#c3c6d7] rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-[16px] text-[#151c27]">
              Estado General de Piezas
            </h3>
            <p className="text-[12px] text-[#555f6f] mb-4">
              Total: 4,850 piezas registradas
            </p>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="font-medium text-[#151c27]">Fabricadas (Aprobadas QC)</span>
                  <span className="font-mono font-bold text-[#004ac6]">3,210 (66%)</span>
                </div>
                <div className="w-full h-2 bg-[#e2e8f8] rounded-full overflow-hidden">
                  <div className="h-full bg-[#004ac6]" style={{ width: '66%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="font-medium text-[#151c27]">En Tránsito hacia Obra</span>
                  <span className="font-mono font-bold text-amber-600">890 (18%)</span>
                </div>
                <div className="w-full h-2 bg-[#e2e8f8] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: '18%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="font-medium text-[#151c27]">Recibidas en Campo (Montaje)</span>
                  <span className="font-mono font-bold text-emerald-700">620 (13%)</span>
                </div>
                <div className="w-full h-2 bg-[#e2e8f8] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600" style={{ width: '13%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="font-medium text-[#151c27]">Incidencias Activas</span>
                  <span className="font-mono font-bold text-[#ba1a1a]">130 (3%)</span>
                </div>
                <div className="w-full h-2 bg-[#e2e8f8] rounded-full overflow-hidden">
                  <div className="h-full bg-[#ba1a1a]" style={{ width: '3%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#f0f3ff] rounded-lg mt-4 text-[12px] text-[#434655]">
            💡 El 97% de las piezas cumplen con el estándar AISC sin desviaciones mayores.
          </div>
        </div>
      </div>

      {/* KPI Performance Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#c3c6d7] p-5 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h4 className="font-bold text-[15px] text-[#151c27]">Indicadores de Calidad QC</h4>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-[#f0f3ff] rounded-lg">
              <span className="text-[11px] text-[#555f6f] block uppercase font-bold">1ra Pasada</span>
              <span className="text-[20px] font-bold text-emerald-700">96.4%</span>
            </div>
            <div className="p-3 bg-[#f0f3ff] rounded-lg">
              <span className="text-[11px] text-[#555f6f] block uppercase font-bold">Tiempo Insp.</span>
              <span className="text-[20px] font-bold text-[#004ac6]">14 min</span>
            </div>
            <div className="p-3 bg-[#f0f3ff] rounded-lg">
              <span className="text-[11px] text-[#555f6f] block uppercase font-bold">Rechazos</span>
              <span className="text-[20px] font-bold text-[#ba1a1a]">18</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#c3c6d7] p-5 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="w-5 h-5 text-[#004ac6]" />
            <h4 className="font-bold text-[15px] text-[#151c27]">Eficiencia de Transporte</h4>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-[#f0f3ff] rounded-lg">
              <span className="text-[11px] text-[#555f6f] block uppercase font-bold">A Tiempo</span>
              <span className="text-[20px] font-bold text-emerald-700">94.2%</span>
            </div>
            <div className="p-3 bg-[#f0f3ff] rounded-lg">
              <span className="text-[11px] text-[#555f6f] block uppercase font-bold">Carga Total</span>
              <span className="text-[20px] font-bold text-[#151c27]">1,420 T</span>
            </div>
            <div className="p-3 bg-[#f0f3ff] rounded-lg">
              <span className="text-[11px] text-[#555f6f] block uppercase font-bold">Descarga Med.</span>
              <span className="text-[20px] font-bold text-amber-700">42 min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Reports History Table */}
      <div className="bg-white border border-[#c3c6d7] rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#c3c6d7] bg-[#f9fafb] flex justify-between items-center">
          <h3 className="font-bold text-[15px] text-[#151c27]">Informes Ejecutivos Generados</h3>
          <span className="text-[12px] text-[#555f6f]">Actualizado automáticamente cada 24h</span>
        </div>
        <div className="divide-y divide-[#e2e8f8]">
          {[
            { name: 'Reporte Semanal de Avance - Torre Mítica', date: '27 Oct 2023', size: '2.4 MB', type: 'PDF' },
            { name: 'Certificados de Calidad Coladas de Acero Q4', date: '25 Oct 2023', size: '8.1 MB', type: 'ZIP' },
            { name: 'Manifiestos de Carga y Recepción en Obra Mhotivo', date: '24 Oct 2023', size: '1.2 MB', type: 'PDF' },
            { name: 'Balance Mensual de Inventarios y Merma de Planta', date: '20 Oct 2023', size: '940 KB', type: 'XLSX' },
          ].map((r, i) => (
            <div key={i} className="p-3.5 flex items-center justify-between hover:bg-[#f0f3ff] transition-colors text-[13px]">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#004ac6]" />
                <div>
                  <span className="font-medium text-[#151c27] block">{r.name}</span>
                  <span className="text-[11px] text-[#737686]">{r.date} • {r.size} • Formato {r.type}</span>
                </div>
              </div>
              <button 
                onClick={() => alert(`Descargando ${r.name}...`)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#c3c6d7] hover:border-[#004ac6] hover:bg-[#f0f3ff] rounded-lg text-[#151c27] font-semibold text-[12px] transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-[#004ac6]" />
                <span>Descargar</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
