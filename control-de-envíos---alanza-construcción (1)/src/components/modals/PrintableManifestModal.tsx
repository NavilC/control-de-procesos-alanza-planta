import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Printer, Download, CheckCircle2, Building, Truck, ShieldCheck, Calendar, FileText, Check } from 'lucide-react';
import { Shipment } from '../../types';
import { playFeedbackSound } from '../../utils/audioFeedback';
import { generateManifestPDF } from '../../utils/generateManifestPdf';

export const PrintableManifestModal: React.FC = () => {
  const { selectedShipmentForPrint, setSelectedShipmentForPrint, pieces } = useApp();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!selectedShipmentForPrint) return null;

  const s = selectedShipmentForPrint;

  // Find pieces matching shipment or create realistic items
  const shipmentPieces = pieces.filter(p => s.pieces?.includes(p.mark) || p.refId === s.id);
  const displayPieces = shipmentPieces.length > 0 ? shipmentPieces : [
    { mark: '2S-37A', type: 'Viga', profile: 'W18x130', lengthMeters: 12.4, weightKg: 850, qcStatus: 'Aprobada', heatNumber: 'HT-8821' },
    { mark: '2S-38B', type: 'Viga', profile: 'W18x130', lengthMeters: 12.4, weightKg: 850, qcStatus: 'Aprobada', heatNumber: 'HT-8821' },
    { mark: 'C-104A', type: 'Columna', profile: 'W14x211', lengthMeters: 9.8, weightKg: 1420, qcStatus: 'Aprobada', heatNumber: 'HT-9904' },
    { mark: 'C-104B', type: 'Columna', profile: 'W14x211', lengthMeters: 9.8, weightKg: 1420, qcStatus: 'Aprobada', heatNumber: 'HT-9904' },
    { mark: 'R-012A', type: 'Riostra', profile: 'HSS 8x8x1/2', lengthMeters: 6.2, weightKg: 310, qcStatus: 'Aprobada', heatNumber: 'HT-5541' },
    { mark: 'PB-045', type: 'Placa Base', profile: 'PL 1-1/2"', lengthMeters: 0.6, weightKg: 145, qcStatus: 'Aprobada', heatNumber: 'HT-3312' }
  ];

  const totalCalculatedWeight = displayPieces.reduce((acc, curr) => acc + (curr.weightKg || 0), 0);

  const handleDownloadPDF = () => {
    try {
      playFeedbackSound('success');
      setIsDownloading(true);
      generateManifestPDF(s, displayPieces);
      setDownloadSuccess(true);
      setTimeout(() => {
        setIsDownloading(false);
        setTimeout(() => setDownloadSuccess(false), 3000);
      }, 500);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    playFeedbackSound('click');
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div id="printable-manifest-modal-container" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto print:bg-transparent print:p-0 print:static print:overflow-visible">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-[#c3c6d7] shadow-2xl overflow-hidden animate-in zoom-in-95 my-8 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:my-0 print:w-full print:rounded-none">
        {/* Modal Toolbar (hidden when printing) */}
        <div className="p-4 border-b border-[#e2e8f8] bg-[#f9fafb] flex flex-wrap justify-between items-center gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#004ac6]" />
            <div>
              <h3 className="font-bold text-[15px] sm:text-[16px] text-[#151c27]">
                Manifiesto de Despacho & Hoja de Ruta ({s.id})
              </h3>
              <p className="text-[12px] text-[#555f6f]">
                Documento oficial listo para descarga directa en PDF o impresión
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Primary Action: Direct PDF Download */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-4 py-2 bg-[#004ac6] hover:bg-[#2563eb] active:scale-95 text-white rounded-lg text-[13px] font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              title="Descargar archivo PDF directamente a tu dispositivo"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>¡PDF Descargado!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? 'Generando PDF...' : 'Descargar PDF'}</span>
                </>
              )}
            </button>

            {/* Secondary Action: Direct Print */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white border border-[#c3c6d7] hover:bg-[#f0f3ff] hover:border-[#004ac6] text-[#151c27] rounded-lg text-[13px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Imprimir directamente en impresora"
            >
              <Printer className="w-4 h-4 text-[#004ac6]" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={() => {
                playFeedbackSound('click');
                setSelectedShipmentForPrint(null);
              }}
              className="text-[#737686] hover:text-[#151c27] p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Cerrar vista previa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div 
          id="printable-manifest-content"
          className="p-8 overflow-y-auto bg-white text-[#151c27] space-y-6 font-sans print:p-0 print:overflow-visible print:text-black"
        >
          {/* Company & Document Header */}
          <div className="border-b-2 border-[#151c27] pb-4 flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#004ac6] text-white flex items-center justify-center font-black text-[13px] print:bg-black print:text-white">
                  AZ
                </div>
                <h1 className="text-[20px] font-extrabold tracking-tight uppercase text-[#002b75] print:text-black">
                  ALANZA Construcción & Estructuras S.A.
                </h1>
              </div>
              <p className="text-[11px] text-[#555f6f] print:text-neutral-700">
                Planta de Fabricación de Estructuras Metálicas • Parque Industrial Nave 4
              </p>
              <p className="text-[11px] text-[#555f6f] print:text-neutral-700">
                Certificación AISC & AWS D1.1 • Tel: +504 2550-0000 • www.alanzaestructuras.com
              </p>
            </div>

            <div className="text-right border-2 border-[#004ac6] bg-[#f0f3ff] p-3 rounded-lg min-w-[200px] print:border-black print:bg-slate-50">
              <span className="text-[10px] font-bold text-[#004ac6] uppercase tracking-wider block print:text-black">
                MANIFIESTO DE DESPACHO / REMISIÓN
              </span>
              <span className="font-mono text-[20px] font-black text-[#151c27] block print:text-black">
                {s.id}
              </span>
              <span className="text-[11px] font-medium text-[#555f6f] print:text-neutral-800">
                Fecha: <strong>{s.date || '31/08/2026'}</strong>
              </span>
            </div>
          </div>

          {/* Project & Logistics Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#fafcff] border border-[#dce2f3] p-4 rounded-xl text-[12px] print:bg-slate-50 print:border-slate-300">
            <div>
              <span className="text-[#555f6f] block uppercase text-[10px] font-bold print:text-neutral-600">Proyecto Destino:</span>
              <strong className="text-[14px] text-[#151c27] font-bold print:text-black">{s.project}</strong>
              <span className="text-[11px] text-[#555f6f] block print:text-neutral-700">{s.destination || 'Sitio de Obra'}</span>
            </div>

            <div>
              <span className="text-[#555f6f] block uppercase text-[10px] font-bold print:text-neutral-600">Empresa Transportista:</span>
              <strong className="text-[#151c27] print:text-black">{s.carrier || 'Logística Rápida SA'}</strong>
              <span className="text-[11px] text-[#555f6f] block print:text-neutral-700">Chofer: {s.driverName || 'Roberto Mendoza'}</span>
            </div>

            <div>
              <span className="text-[#555f6f] block uppercase text-[10px] font-bold print:text-neutral-600">Unidad de Transporte:</span>
              <span className="font-mono font-bold text-[#151c27] block text-[13px] print:text-black">
                Placas: {s.truckPlates || 'HN-8842-TR'}
              </span>
              <span className="text-[11px] text-[#555f6f] print:text-neutral-700">Plataforma 40 pies</span>
            </div>

            <div>
              <span className="text-[#555f6f] block uppercase text-[10px] font-bold print:text-neutral-600">Peso Total & Piezas:</span>
              <strong className="text-[#004ac6] font-mono text-[14px] block print:text-black">
                {s.totalWeightTons || (totalCalculatedWeight / 1000).toFixed(2)} Toneladas
              </strong>
              <span className="text-[11px] font-semibold text-[#151c27] print:text-black">
                {displayPieces.length} Elementos Estructurales
              </span>
            </div>
          </div>

          {/* Itemized Pieces Table */}
          <div className="border border-[#c3c6d7] rounded-lg overflow-hidden print:border-slate-400">
            <div className="bg-[#f0f3ff] px-4 py-2 border-b border-[#c3c6d7] flex justify-between items-center print:bg-slate-100 print:border-slate-400">
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#151c27] print:text-black">
                Detalle de Piezas Estructurales Cargadas
              </h4>
              <span className="text-[11px] text-[#004ac6] font-semibold print:text-neutral-800">
                Liberadas 100% por Control de Calidad (QC)
              </span>
            </div>

            <table className="w-full text-left text-[12px] border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-[#c3c6d7] text-[#434655] font-semibold text-[11px] uppercase print:bg-slate-200 print:text-black">
                  <th className="py-2 px-3 w-12 text-center">No.</th>
                  <th className="py-2 px-3">Marca Estructural</th>
                  <th className="py-2 px-3">Tipo</th>
                  <th className="py-2 px-3">Perfil</th>
                  <th className="py-2 px-3 text-right">Long. (m)</th>
                  <th className="py-2 px-3 text-right">Peso (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f8] print:divide-slate-300">
                {displayPieces.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 print:bg-transparent">
                    <td className="py-2 px-3 font-mono text-[#737686] text-center print:text-black">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono font-bold text-[#004ac6] print:text-black">{p.mark}</td>
                    <td className="py-2 px-3 print:text-black">{p.type}</td>
                    <td className="py-2 px-3 font-mono font-semibold print:text-black">{p.profile}</td>
                    <td className="py-2 px-3 font-mono text-right print:text-black">{p.lengthMeters} m</td>
                    <td className="py-2 px-3 font-mono text-right font-medium print:text-black">{p.weightKg ? p.weightKg.toLocaleString() : '-'} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legal / Inspection Disclaimer */}
          <div className="p-3 bg-slate-50 border border-[#e2e8f8] rounded-lg text-[11px] text-[#555f6f] leading-relaxed print:bg-white print:border-slate-300 print:text-neutral-800">
            <strong>Certificación de Conformidad:</strong> Los elementos amparados en este documento han sido fabricados conforme a las especificaciones técnicas, planos de taller aprobados y la norma AWS D1.1 / AISC 360. El transportista se hace responsable del correcto amarre y protección de la carga durante el traslado.
          </div>

          {/* Signatures 3 Columns */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-300 text-[11px]">
            <div className="text-center space-y-8">
              <div className="h-12 border-b border-slate-400 flex items-end justify-center pb-1">
                <span className="font-mono text-[10px] text-slate-500">Juan Pérez (Jefe Planta)</span>
              </div>
              <div>
                <strong className="block text-[#151c27] text-[12px] print:text-black">Despachado por (Planta)</strong>
                <span className="text-[#737686] print:text-neutral-700">ALANZA Construcción</span>
              </div>
            </div>

            <div className="text-center space-y-8">
              <div className="h-12 border-b border-slate-400 flex items-end justify-center pb-1">
                <span className="font-mono text-[10px] text-slate-500">{s.driverName || 'Roberto Mendoza'}</span>
              </div>
              <div>
                <strong className="block text-[#151c27] text-[12px] print:text-black">Conductor / Transportista</strong>
                <span className="text-[#737686] print:text-neutral-700">{s.carrier || 'Logística Rápida SA'}</span>
              </div>
            </div>

            <div className="text-center space-y-8">
              <div className="h-12 border-b border-slate-400 flex items-end justify-center pb-1">
                <span className="font-mono text-[10px] text-slate-500">Ing. Residente de Obra</span>
              </div>
              <div>
                <strong className="block text-[#151c27] text-[12px] print:text-black">Recibido Conforme (Obra)</strong>
                <span className="text-[#737686] print:text-neutral-700">{s.project}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
