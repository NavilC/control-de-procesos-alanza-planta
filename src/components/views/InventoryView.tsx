import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InventoryItem } from '../../types';
import { 
  ArrowLeftRight, 
  Search, 
  Filter, 
  Download, 
  MapPin, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle,
  Boxes,
  Plus,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Package,
  Layers,
  Sparkles,
  X,
  Check,
  RotateCcw,
  Edit3
} from 'lucide-react';
import { playFeedbackSound } from '../../utils/audioFeedback';

export const InventoryView: React.FC = () => {
  const { 
    inventory, 
    setIsStockAdjustModalOpen, 
    adjustStock,
    globalSearch, 
    exportToCSV 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedItemForMove, setSelectedItemForMove] = useState<InventoryItem | null>(null);
  const [targetLocation, setTargetLocation] = useState('Patio Exterior B');
  const [moveQuantity, setMoveQuantity] = useState(10);
  const [moveSuccessBanner, setMoveSuccessBanner] = useState<string | null>(null);

  const filteredInventory = inventory.filter(item => {
    const term = (searchTerm || globalSearch).toLowerCase();
    const matchesSearch = 
      item.sku.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.location.toLowerCase().includes(term);
    const matchesCat = !categoryFilter || item.category === categoryFilter;
    const matchesStat = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesCat && matchesStat;
  });

  const totalItems = inventory.reduce((acc, curr) => acc + curr.currentStock, 0) || 12450;
  const criticalCount = inventory.filter(i => i.status === 'CRÍTICO').length || 14;
  const replenishCount = inventory.filter(i => i.status === 'REABASTECER').length || 28;
  const optimalCount = inventory.filter(i => i.status === 'ÓPTIMO').length || 162;

  const handleOpenTransferModal = (item?: InventoryItem) => {
    playFeedbackSound('click');
    setSelectedItemForMove(item || inventory[0] || null);
    setShowMoveModal(true);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForMove) return;
    playFeedbackSound('success');
    setMoveSuccessBanner(`Transferencia confirmada: ${moveQuantity} ${selectedItemForMove.unit} de ${selectedItemForMove.sku} trasladadas a "${targetLocation}".`);
    setShowMoveModal(false);
    setTimeout(() => {
      setMoveSuccessBanner(null);
    }, 5000);
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] md:text-[30px] font-bold text-[#151c27] tracking-tight font-['Inter']">
              Dashboard de Inventario
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#dbe1ff] text-[#002b75] border border-[#adc6ff]">
              Stock en Planta
            </span>
          </div>
          <p className="text-[14px] text-[#434655] mt-1">
            Control de existencias, perfiles de acero, ubicaciones físicas y reabastecimiento.
          </p>
        </div>

        {/* Primary Header Action Buttons with High Contrast */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            id="move-stock-btn"
            onClick={() => handleOpenTransferModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#c3c6d7] hover:border-[#004ac6] hover:bg-[#f0f3ff] rounded-lg text-[#151c27] font-semibold text-[13px] shadow-xs transition-all min-h-[42px]"
          >
            <ArrowLeftRight className="w-4 h-4 text-[#004ac6]" />
            <span>Movimiento entre Almacenes</span>
          </button>

          <button
            id="adjust-stock-btn"
            onClick={() => {
              playFeedbackSound('click');
              setIsStockAdjustModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-lg font-semibold text-[13px] transition-colors shadow-sm min-h-[42px]"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Registrar Ajuste de Stock</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {moveSuccessBanner && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-[13px] font-medium flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
            <span>{moveSuccessBanner}</span>
          </div>
          <button 
            onClick={() => setMoveSuccessBanner(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid (Clickable to Filter by Status) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Piezas */}
        <div 
          onClick={() => { playFeedbackSound('click'); setStatusFilter(''); }}
          className={`bg-white rounded-xl p-5 border flex flex-col justify-between shadow-xs cursor-pointer transition-all ${
            statusFilter === '' ? 'border-[#004ac6] ring-2 ring-[#004ac6]/20' : 'border-[#c3c6d7] hover:border-[#004ac6]'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
              Total Piezas en Planta
            </span>
            <div className="p-2 bg-[#dbe1ff] rounded-lg text-[#004ac6]">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-[30px] md:text-[32px] font-bold text-[#151c27]">
              {totalItems.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1 text-emerald-700 font-semibold text-[12px]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+4.2% vs mes anterior</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Óptimo */}
        <div 
          onClick={() => {
            playFeedbackSound('click');
            setStatusFilter(prev => prev === 'ÓPTIMO' ? '' : 'ÓPTIMO');
          }}
          className={`bg-white rounded-xl p-5 border flex flex-col justify-between shadow-xs cursor-pointer transition-all ${
            statusFilter === 'ÓPTIMO' ? 'border-emerald-600 ring-2 ring-emerald-500/30 bg-emerald-50/20' : 'border-[#c3c6d7] hover:border-emerald-600'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
              Stock Óptimo
            </span>
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-[30px] md:text-[32px] font-bold text-[#151c27]">
              {optimalCount} ítems
            </div>
            <div className="flex items-center gap-1 mt-1 text-emerald-700 text-[12px] font-semibold">
              <span>Nivel adecuado de reserva</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Reabastecer */}
        <div 
          onClick={() => {
            playFeedbackSound('click');
            setStatusFilter(prev => prev === 'REABASTECER' ? '' : 'REABASTECER');
          }}
          className={`bg-white rounded-xl p-5 border flex flex-col justify-between shadow-xs cursor-pointer transition-all ${
            statusFilter === 'REABASTECER' ? 'border-amber-600 ring-2 ring-amber-500/30 bg-amber-50/20' : 'border-[#c3c6d7] hover:border-amber-600'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold text-[#434655] uppercase tracking-wider">
              Próximo a Mínimo
            </span>
            <div className="p-2 bg-amber-100 rounded-lg text-amber-800">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-[30px] md:text-[32px] font-bold text-[#151c27]">
              {replenishCount} ítems
            </div>
            <div className="flex items-center gap-1 mt-1 text-amber-800 text-[12px] font-semibold">
              <span>Programar pedido de acería</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Crítico */}
        <div 
          onClick={() => {
            playFeedbackSound('click');
            setStatusFilter(prev => prev === 'CRÍTICO' ? '' : 'CRÍTICO');
          }}
          className={`bg-[#ffdad6] rounded-xl p-5 border border-red-300 flex flex-col justify-between relative overflow-hidden shadow-xs cursor-pointer transition-all ${
            statusFilter === 'CRÍTICO' ? 'ring-2 ring-red-600' : 'hover:border-red-500'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold text-[#93000a] uppercase tracking-wider">
              Alertas Stock Crítico
            </span>
            <div className="p-2 bg-[#ba1a1a] text-white rounded-lg shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-[30px] md:text-[32px] font-bold text-[#93000a]">
              {criticalCount} ítems
            </div>
            <div className="flex items-center gap-1 mt-1 text-[#93000a] text-[12px] font-semibold">
              <span>Requiere atención inmediata</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Quick Chips Bar */}
      <div className="bg-white border border-[#c3c6d7] rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555f6f]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por SKU (Ej: COL-W12-001), descripción o ubicación..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#c3c6d7] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 rounded-lg text-[13px] text-[#151c27] outline-none h-10 shadow-xs"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#151c27]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Select Category */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 px-3.5 bg-white border border-[#c3c6d7] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 rounded-lg text-[#151c27] text-[13px] font-medium outline-none shadow-xs cursor-pointer"
            >
              <option value="">Todas las categorías</option>
              <option value="Estructural Principal">Estructural Principal</option>
              <option value="Estructural Secundaria">Estructural Secundaria</option>
              <option value="Materia Prima">Materia Prima</option>
              <option value="Fijación">Fijación</option>
            </select>

            {/* Select Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3.5 bg-white border border-[#c3c6d7] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 rounded-lg text-[#151c27] text-[13px] font-medium outline-none shadow-xs cursor-pointer"
            >
              <option value="">Todos los estados</option>
              <option value="ÓPTIMO">Óptimo</option>
              <option value="REABASTECER">Reabastecer</option>
              <option value="CRÍTICO">Crítico</option>
            </select>

            {/* Export Button with High Contrast & Clear Icon */}
            <button
              onClick={() => {
                playFeedbackSound('click');
                exportToCSV('Inventario_Planta_Alanza', filteredInventory.map(i => ({
                  SKU: i.sku,
                  Descripcion: i.description,
                  Categoria: i.category,
                  Stock_Actual: i.currentStock,
                  Unidad: i.unit,
                  Ubicacion: i.location,
                  Estado: i.status,
                  Minimo_Requerido: i.minThreshold
                })));
              }}
              className="h-10 px-4 bg-white border border-[#c3c6d7] hover:bg-[#f0f3ff] hover:border-[#004ac6] rounded-lg text-[#151c27] text-[13px] font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#004ac6]" />
              <span>Exportar CSV</span>
            </button>

            {(searchTerm || categoryFilter || statusFilter) && (
              <button
                onClick={() => {
                  playFeedbackSound('click');
                  setSearchTerm('');
                  setCategoryFilter('');
                  setStatusFilter('');
                }}
                className="h-10 px-3 bg-[#f0f3ff] hover:bg-[#e2e8f8] text-[#151c27] rounded-lg text-[12px] font-semibold flex items-center gap-1 transition-colors"
                title="Limpiar todos los filtros"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Status Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#e2e8f8] text-[12px]">
          <span className="text-[#555f6f] font-semibold mr-1">Filtrar por estado:</span>
          
          <button
            onClick={() => { playFeedbackSound('click'); setStatusFilter(''); }}
            className={`px-3 py-1 rounded-full font-semibold transition-colors ${
              statusFilter === '' 
                ? 'bg-[#004ac6] text-white shadow-xs' 
                : 'bg-white text-[#434655] border border-[#c3c6d7] hover:bg-[#f0f3ff]'
            }`}
          >
            Todos ({inventory.length})
          </button>

          <button
            onClick={() => { playFeedbackSound('click'); setStatusFilter('CRÍTICO'); }}
            className={`px-3 py-1 rounded-full font-semibold transition-colors flex items-center gap-1.5 ${
              statusFilter === 'CRÍTICO' 
                ? 'bg-[#ba1a1a] text-white shadow-xs ring-1 ring-red-600' 
                : 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>Crítico ({criticalCount})</span>
          </button>

          <button
            onClick={() => { playFeedbackSound('click'); setStatusFilter('REABASTECER'); }}
            className={`px-3 py-1 rounded-full font-semibold transition-colors flex items-center gap-1.5 ${
              statusFilter === 'REABASTECER' 
                ? 'bg-amber-600 text-white shadow-xs ring-1 ring-amber-600' 
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Reabastecer ({replenishCount})</span>
          </button>

          <button
            onClick={() => { playFeedbackSound('click'); setStatusFilter('ÓPTIMO'); }}
            className={`px-3 py-1 rounded-full font-semibold transition-colors flex items-center gap-1.5 ${
              statusFilter === 'ÓPTIMO' 
                ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-600' 
                : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>Óptimo ({optimalCount})</span>
          </button>
        </div>
      </div>

      {/* Inventory Table Container */}
      <div className="bg-white border border-[#c3c6d7] rounded-xl overflow-hidden shadow-xs flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[880px]">
            <thead>
              <tr className="bg-[#f9fafb] border-b border-[#c3c6d7]">
                <th className="px-4 py-3.5 text-[11px] font-bold text-[#434655] uppercase tracking-wider">
                  SKU / Identificador
                </th>
                <th className="px-4 py-3.5 text-[11px] font-bold text-[#434655] uppercase tracking-wider">
                  Descripción del Material
                </th>
                <th className="px-4 py-3.5 text-[11px] font-bold text-[#434655] uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-4 py-3.5 text-[11px] font-bold text-[#434655] uppercase tracking-wider text-right">
                  Stock Disponible
                </th>
                <th className="px-4 py-3.5 text-[11px] font-bold text-[#434655] uppercase tracking-wider">
                  Ubicación en Planta
                </th>
                <th className="px-4 py-3.5 text-[11px] font-bold text-[#434655] uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3.5 text-[11px] font-bold text-[#434655] uppercase tracking-wider text-right">
                  Acciones Rápidas
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f8] text-[13px]">
              {filteredInventory.map((item) => (
                <tr
                  key={item.sku}
                  className={`hover:bg-[#f3f4f6] transition-colors group ${
                    item.status === 'CRÍTICO' ? 'bg-red-50/40' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-mono font-bold text-[#004ac6]">
                    {item.sku}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#151c27]">
                    <div>{item.description}</div>
                    <span className="text-[11px] text-[#737686] font-mono">Mínimo: {item.minThreshold} {item.unit}</span>
                  </td>
                  <td className="px-4 py-3 text-[#555f6f]">
                    {item.category}
                  </td>
                  <td className={`px-4 py-3 font-mono font-bold text-right ${
                    item.status === 'CRÍTICO' ? 'text-[#ba1a1a]' : 'text-[#151c27]'
                  }`}>
                    <span className="text-[15px]">{item.currentStock.toLocaleString()}</span>{' '}
                    <span className="text-[11px] font-normal text-[#555f6f]">{item.unit}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-[#151c27]">
                      <MapPin className="w-3.5 h-3.5 text-[#004ac6] shrink-0" />
                      <span className="font-medium text-[12px]">{item.location}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {item.status === 'ÓPTIMO' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold">
                        ÓPTIMO
                      </span>
                    )}
                    {item.status === 'REABASTECER' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
                        REABASTECER
                      </span>
                    )}
                    {item.status === 'CRÍTICO' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#ba1a1a] text-white border border-red-700 text-[11px] font-bold shadow-xs">
                        CRÍTICO
                      </span>
                    )}
                  </td>

                  {/* Highly Visible Action Buttons */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenTransferModal(item)}
                        className="px-2.5 py-1.5 bg-white border border-[#c3c6d7] hover:border-[#004ac6] hover:bg-[#f0f3ff] text-[#151c27] text-[12px] font-semibold rounded-md inline-flex items-center gap-1 shadow-xs transition-colors"
                        title="Trasladar entre ubicaciones"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5 text-[#004ac6]" />
                        <span className="hidden sm:inline">Mover</span>
                      </button>

                      <button
                        onClick={() => {
                          playFeedbackSound('click');
                          setIsStockAdjustModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-[#004ac6] hover:bg-[#2563eb] text-white text-[12px] font-semibold rounded-md inline-flex items-center gap-1 shadow-xs transition-colors"
                        title="Ajustar conteo de stock físico"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Ajustar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[#737686]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Boxes className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-[#151c27]">No se encontraron ítems de inventario</p>
                      <p className="text-[12px]">Prueba con otros términos de búsqueda o limpiando los filtros seleccionados.</p>
                      <button
                        onClick={() => { setSearchTerm(''); setCategoryFilter(''); setStatusFilter(''); }}
                        className="mt-2 px-3.5 py-1.5 bg-[#004ac6] text-white rounded-lg text-[12px] font-semibold"
                      >
                        Restablecer Filtros
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Clear and Accessible Pagination Footer */}
        <div className="p-3.5 border-t border-[#c3c6d7] bg-[#f9fafb] flex flex-col sm:flex-row justify-between items-center gap-3 text-[13px]">
          <span className="text-[#555f6f]">
            Mostrando <span className="font-bold text-[#151c27]">{filteredInventory.length}</span> de <span className="font-bold text-[#151c27]">{inventory.length}</span> ítems registrados
          </span>
          <div className="flex items-center gap-1.5">
            <button 
              disabled 
              className="h-8 px-2.5 border border-[#c3c6d7] bg-white rounded-lg text-[#737686] opacity-50 cursor-not-allowed flex items-center gap-1 text-[12px] font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
            <button className="h-8 w-8 rounded-lg bg-[#004ac6] text-white font-bold text-[12px] flex items-center justify-center shadow-xs">
              1
            </button>
            <button className="h-8 w-8 rounded-lg bg-white border border-[#c3c6d7] hover:bg-[#f0f3ff] text-[#151c27] font-semibold text-[12px] flex items-center justify-center">
              2
            </button>
            <button className="h-8 px-2.5 border border-[#c3c6d7] bg-white hover:bg-[#f0f3ff] rounded-lg text-[#151c27] flex items-center gap-1 text-[12px] font-medium transition-colors">
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Warehouse Transfer Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#c3c6d7] p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-[#e2e8f8] pb-3">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-[#004ac6]" />
                <h3 className="font-bold text-[17px] text-[#151c27]">
                  Movimiento entre Almacenes
                </h3>
              </div>
              <button 
                onClick={() => setShowMoveModal(false)}
                className="text-[#737686] hover:text-[#151c27] p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-3.5 text-[13px]">
              <div>
                <label className="block font-bold text-[#434655] uppercase text-[11px] mb-1">
                  Ítem a Trasladar
                </label>
                <select 
                  value={selectedItemForMove?.sku || ''}
                  onChange={(e) => {
                    const item = inventory.find(i => i.sku === e.target.value);
                    if (item) setSelectedItemForMove(item);
                  }}
                  className="w-full h-11 px-3 bg-[#f0f3ff] border border-[#c3c6d7] focus:border-[#004ac6] focus:bg-white rounded-lg text-[#151c27] font-medium outline-none"
                >
                  {inventory.map(i => (
                    <option key={i.sku} value={i.sku}>
                      {i.sku} - {i.description} (Stock: {i.currentStock} {i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#434655] uppercase text-[11px] mb-1">
                    Ubicación Origen
                  </label>
                  <input 
                    readOnly 
                    value={selectedItemForMove?.location || 'Almacén A-1'} 
                    className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium outline-none text-[12px]" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#434655] uppercase text-[11px] mb-1">
                    Ubicación Destino
                  </label>
                  <select 
                    value={targetLocation}
                    onChange={(e) => setTargetLocation(e.target.value)}
                    className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] focus:border-[#004ac6] focus:bg-white rounded-lg text-[#151c27] font-medium outline-none text-[12px]"
                  >
                    <option value="Patio Exterior B">Patio Exterior B</option>
                    <option value="Nave Industrial C-2">Nave Industrial C-2</option>
                    <option value="Almacén Central A-1">Almacén Central A-1</option>
                    <option value="Bahía de Despacho 1">Bahía de Despacho 1</option>
                    <option value="Área de Pintura y Acabado">Área de Pintura y Acabado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#434655] uppercase text-[11px] mb-1">
                  Cantidad a Mover ({selectedItemForMove?.unit || 'unidades'})
                </label>
                <input 
                  type="number" 
                  min={1}
                  max={selectedItemForMove?.currentStock || 9999}
                  value={moveQuantity}
                  onChange={(e) => setMoveQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full h-11 px-3 bg-[#f0f3ff] border border-[#c3c6d7] focus:border-[#004ac6] focus:bg-white rounded-lg text-[#151c27] font-mono text-[16px] font-bold outline-none" 
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#e2e8f8]">
                <button
                  type="button"
                  onClick={() => setShowMoveModal(false)}
                  className="px-4 py-2.5 bg-white border border-[#c3c6d7] text-[#151c27] hover:bg-[#f0f3ff] rounded-lg font-semibold text-[13px] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-lg font-semibold text-[13px] transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Confirmar Traslado</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
