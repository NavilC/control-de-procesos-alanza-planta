import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, PenTool, RotateCcw, Check, CheckCircle2 } from 'lucide-react';

export const DigitalSignatureModal: React.FC = () => {
  const { isSignatureModalOpen, setIsSignatureModalOpen, signReceptionSession, receptionSession } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signerName, setSignerName] = useState('Ing. Juan Pérez');
  const [signerRole, setSignerRole] = useState('Residente de Obra');

  useEffect(() => {
    if (isSignatureModalOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#002b75';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isSignatureModalOpen]);

  if (!isSignatureModalOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(clientX - rect.left, clientY - rect.top);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(clientX - rect.left, clientY - rect.top);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

  const handleConfirmSignature = () => {
    const dataUrl = canvasRef.current?.toDataURL('image/png') || '';
    signReceptionSession(signerName, dataUrl);
    setIsSignatureModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#c3c6d7] shadow-2xl overflow-hidden animate-in zoom-in-95 space-y-4 p-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#e2e8f8] pb-3">
          <div className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-[#004ac6]" />
            <h3 className="font-bold text-[17px] text-[#151c27]">
              Firma Digital de Recepción: {receptionSession.shipmentId}
            </h3>
          </div>
          <button
            onClick={() => setIsSignatureModalOpen(false)}
            className="text-[#737686] hover:text-[#151c27]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[13px] text-[#555f6f]">
          Al firmar, el receptor en obra certifica la recepción y conteo de las piezas del manifiesto{' '}
          <strong className="text-[#151c27]">{receptionSession.shipmentId}</strong> para el proyecto{' '}
          <strong className="text-[#151c27]">{receptionSession.projectName}</strong>.
        </p>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3 text-[13px]">
          <div>
            <label className="block font-semibold text-[#434655] mb-1">Nombre del Receptor</label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              className="w-full h-9 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#434655] mb-1">Cargo / Puesto</label>
            <input
              type="text"
              value={signerRole}
              onChange={(e) => setSignerRole(e.target.value)}
              className="w-full h-9 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg outline-none"
            />
          </div>
        </div>

        {/* Signature Pad */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[12px]">
            <span className="font-bold text-[#434655] uppercase">Trazo de Firma Digital:</span>
            <button
              type="button"
              onClick={clearCanvas}
              className="text-[#004ac6] hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Limpiar trazo
            </button>
          </div>

          <div className="border-2 border-dashed border-[#c3c6d7] rounded-xl bg-[#fafcff] relative overflow-hidden h-36">
            <canvas
              ref={canvasRef}
              width={460}
              height={144}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full cursor-crosshair touch-none"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-[#737686] text-[13px]">
                Firme aquí con el dedo o puntero del mouse
              </div>
            )}
            <div className="absolute bottom-2 left-4 right-4 border-b border-slate-300 pointer-events-none"></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e8f8]">
          <button
            onClick={() => setIsSignatureModalOpen(false)}
            className="px-4 py-2 bg-slate-100 rounded-lg text-[13px] font-medium text-[#151c27]"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmSignature}
            className="px-5 py-2 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-lg text-[13px] font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Certificar y Concluir Manifiesto</span>
          </button>
        </div>
      </div>
    </div>
  );
};
