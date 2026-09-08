import React, { useState } from 'react';
import { 
  Building2, 
  Shield, 
  Bell, 
  Database, 
  Sliders, 
  Check, 
  Smartphone,
  Save
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [companyName, setCompanyName] = useState('ALANZA Construcción & Estructuras');
  const [plantAddress, setPlantAddress] = useState('Parque Industrial Alianza, Nave 4, Monterrey N.L.');
  const [toleranceMm, setToleranceMm] = useState('1.5');
  const [autoNotifyDispatch, setAutoNotifyDispatch] = useState(true);
  const [requireSignatureField, setRequireSignatureField] = useState(true);
  const [qrPrefix, setQrPrefix] = useState('ALZ-2024');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[26px] md:text-[30px] font-bold text-[#151c27] tracking-tight font-['Inter']">
            Configuración del Sistema
          </h1>
          <p className="text-[14px] text-[#434655] mt-1">
            Parámetros operacionales, tolerancias de calidad y preferencias de la plataforma.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: General & Plant info */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Company Card */}
          <div className="bg-white border border-[#c3c6d7] rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-[16px] font-bold text-[#151c27] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#004ac6]" />
              Identidad de la Empresa y Planta
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
              <div>
                <label className="block font-semibold text-[#434655] mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#434655] mb-1">Prefijo Códigos QR/Marcas</label>
                <input
                  type="text"
                  value={qrPrefix}
                  onChange={(e) => setQrPrefix(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#434655] mb-1">Dirección de Planta de Fabricación</label>
                <input
                  type="text"
                  value={plantAddress}
                  onChange={(e) => setPlantAddress(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none focus:border-[#004ac6] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Quality & Tolerances Settings */}
          <div className="bg-white border border-[#c3c6d7] rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-[16px] font-bold text-[#151c27] flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#004ac6]" />
              Parámetros de Calidad e Inspección (AISC)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
              <div>
                <label className="block font-semibold text-[#434655] mb-1">Tolerancia Dimensional Máxima (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={toleranceMm}
                  onChange={(e) => setToleranceMm(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#434655] mb-1">Normativa de Soldadura Predeterminada</label>
                <select className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none">
                  <option>AWS D1.1 / D1.1M (Estructural Acero)</option>
                  <option>AWS D1.3 (Láminas Delgadas)</option>
                  <option>AISC 360-16 Especificación</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 pt-2 text-[13px]">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireSignatureField}
                  onChange={(e) => setRequireSignatureField(e.target.checked)}
                  className="w-4 h-4 text-[#004ac6] rounded"
                />
                <span className="text-[#151c27]">Exigir firma digital obligatoria en recepción de campo</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoNotifyDispatch}
                  onChange={(e) => setAutoNotifyDispatch(e.target.checked)}
                  className="w-4 h-4 text-[#004ac6] rounded"
                />
                <span className="text-[#151c27]">Notificar automáticamente por email al residente al despachar un envío</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Save */}
        <div className="space-y-6">
          <div className="bg-white border border-[#c3c6d7] rounded-xl p-5 shadow-xs space-y-4">
            <h4 className="font-bold text-[15px] text-[#151c27]">Estado de la Plataforma</h4>
            
            <div className="space-y-2.5 text-[12px]">
              <div className="flex justify-between py-1.5 border-b border-[#e2e8f8]">
                <span className="text-[#555f6f]">Versión App</span>
                <span className="font-mono font-semibold text-[#151c27]">v2.4.0-prod</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#e2e8f8]">
                <span className="text-[#555f6f]">Servidor API</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Operacional
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#e2e8f8]">
                <span className="text-[#555f6f]">Base de Datos</span>
                <span className="font-mono font-semibold text-[#151c27]">Sincronizada</span>
              </div>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[12px] flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>Configuraciones guardadas con éxito.</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#004ac6] hover:bg-[#2563eb] text-white font-semibold rounded-lg text-[13px] flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
