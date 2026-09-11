import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Boxes, Save } from 'lucide-react';

export const StockAdjustModal: React.FC = () => {
  const { isStockAdjustModalOpen, setIsStockAdjustModalOpen, inventory, adjustStock } = useApp();

  const [selectedSku, setSelectedSku] = useState(inventory[0]?.sku || 'COL-W12-001');
  const [newStock, setNewStock] = useState(150);
  const [reason, setReason] = useState('Conteo de inventario físico mensual');

  if (!isStockAdjustModalOpen) return null;

  const currentItem = inventory.find(i => i.sku === selectedSku);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adjustStock(selectedSku, Number(newStock), reason);
    setIsStockAdjustModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-[#c3c6d7] shadow-2xl overflow-hidden animate-in zoom-in-95 p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-[#e2e8f8] pb-3">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#004ac6]" />
            <h3 className="font-bold text-[17px] text-[#151c27]">Ajuste Manual de Inventario</h3>
          </div>
          <button
            onClick={() => setIsStockAdjustModalOpen(false)}
            className="text-[#737686] hover:text-[#151c27]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-[13px]">
          <div>
            <label className="block font-semibold text-[#434655] mb-1">Ítem / SKU</label>
            <select
              value={selectedSku}
              onChange={(e) => {
                setSelectedSku(e.target.value);
                const found = inventory.find(i => i.sku === e.target.value);
                if (found) setNewStock(found.currentStock);
              }}
              className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none"
            >
              {inventory.map(item => (
                <option key={item.sku} value={item.sku}>
                  {item.sku} - {item.description} ({item.currentStock} {item.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#434655] mb-1">Nuevo Conteo de Stock</label>
            <input
              type="number"
              value={newStock}
              onChange={(e) => setNewStock(Number(e.target.value))}
              className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none font-mono text-[16px] font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#434655] mb-1">Motivo del Ajuste</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none"
            >
              <option value="Conteo de inventario físico mensual">Conteo de inventario físico mensual</option>
              <option value="Merma por corte y habilitado">Merma por corte y habilitado</option>
              <option value="Recepción extraordinaria de acería">Recepción extraordinaria de acería</option>
              <option value="Devolución de sobrante de obra">Devolución de sobrante de obra</option>
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#e2e8f8]">
            <button
              type="button"
              onClick={() => {
                setIsStockAdjustModalOpen(false);
              }}
              className="px-4 py-2.5 bg-white border border-[#c3c6d7] hover:bg-[#f0f3ff] text-[#151c27] rounded-lg font-semibold text-[13px] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#004ac6] hover:bg-[#2563eb] text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 text-[13px] transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Ajuste</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
