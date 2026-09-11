import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, PenTool, RotateCcw, CheckCircle2, Stamp, ShieldCheck } from 'lucide-react';

export const DigitalSignatureModal: React.FC = () => {
  const { 
    isSignatureModalOpen, 
    setIsSignatureModalOpen, 
    signReceptionSession, 
    receptionSession, 
    currentUser, 
    playFeedbackSound,
    showToast 
  } = useApp();
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [signerRole, setSignerRole] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isSignatureModalOpen) {
      if (currentUser?.name) {
        setSignerName(currentUser.name);
        setSignerRole(currentUser.role || 'Residente de Obra');
      } else {
        setSignerName('Ing. Juan Pérez');
        setSignerRole('Residente de Obra');
      }
      setHasDrawn(false);
      setValidationError(null);

      setTimeout(() => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.strokeStyle = '#002b75';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      }, 50);
    }
  }, [isSignatureModalOpen, currentUser]);

  if (!isSignatureModalOpen) return null;

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }
    setIsDrawing(true);
    setHasDrawn(true);
    setValidationError(null);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
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

  const generateDigitalStamp = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background tint
    ctx.fillStyle = '#f0f5ff';
    ctx.fillRect(10, 10, canvas.width - 20, 120);

    // Decorative border
    ctx.strokeStyle = '#004ac6';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, 120);
    ctx.lineWidth = 1;
    ctx.strokeRect(14, 14, canvas.width - 28, 112);

    // Seal text
    ctx.fillStyle = '#002b75';
    ctx.font = 'bold 14px "Inter", sans-serif';
    ctx.fillText('CERTIFICADO DIGITAL DE RECEPCIÓN EN OBRA', 24, 38);

    ctx.font = '12px "Inter", sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`Receptor: ${signerName.trim() || 'Residente de Obra'}`, 24, 62);
    ctx.fillText(`Puesto: ${signerRole.trim() || 'Residente'} | Envío: ${receptionSession.shipmentId}`, 24, 82);

    ctx.font = '10px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Fecha: ${new Date().toLocaleString('es-ES')} | HASH: ALZ-${Math.floor(100000 + Math.random() * 900000)}`, 24, 106);

    setHasDrawn(true);
    setValidationError(null);
    playFeedbackSound('click');
    showToast('Sello electrónico de obra generado correctamente', 'info');
  };

  const handleConfirmSignature = () => {
    if (!signerName.trim()) {
      setValidationError('Por favor ingrese el nombre del receptor en obra.');
      showToast('Nombre de receptor requerido', 'warning');
      playFeedbackSound('error');
      return;
    }

    if (!hasDrawn) {
      setValidationError('Por favor realice un trazo de firma o genere un sello electrónico.');
      showToast('Firma o sello requerido para certificar', 'warning');
      playFeedbackSound('error');
      return;
    }

    const dataUrl = canvasRef.current?.toDataURL('image/png') || '';
    signReceptionSession(signerName.trim(), dataUrl);
    playFeedbackSound('success');
    showToast(`Recepción de ${receptionSession.shipmentId} certificada con éxito`, 'success');
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
            className="text-[#737686] hover:text-[#151c27] p-1 rounded-md cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[13px] text-[#555f6f] leading-relaxed">
          Al firmar, el receptor en obra certifica la recepción y cotejo de las piezas del manifiesto{' '}
          <strong className="text-[#151c27]">{receptionSession.shipmentId}</strong> para el proyecto{' '}
          <strong className="text-[#151c27]">{receptionSession.projectName}</strong>.
        </p>

        {validationError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[12.5px] font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3 text-[13px]">
          <div>
            <label className="block font-semibold text-[#434655] mb-1">Nombre del Receptor</label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => {
                setSignerName(e.target.value);
                if (validationError) setValidationError(null);
              }}
              className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] focus:border-[#004ac6] focus:bg-white rounded-lg outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#434655] mb-1">Cargo / Puesto</label>
            <input
              type="text"
              value={signerRole}
              onChange={(e) => setSignerRole(e.target.value)}
              className="w-full h-10 px-3 bg-[#f0f3ff] border border-[#c3c6d7] focus:border-[#004ac6] focus:bg-white rounded-lg outline-none"
            />
          </div>
        </div>

        {/* Signature Pad */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap justify-between items-center text-[12px] gap-2">
            <span className="font-bold text-[#434655] uppercase">Trazo de Firma Digital:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={generateDigitalStamp}
                className="text-[#004ac6] hover:bg-blue-50 px-2 py-1 rounded transition-colors flex items-center gap-1 font-semibold cursor-pointer"
                title="Generar sello oficial con fecha y nombre"
              >
                <Stamp className="w-3.5 h-3.5" /> Sello Electrónico
              </button>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-[#737686] hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Limpiar
              </button>
            </div>
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
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-[#737686] text-[13px] gap-1">
                <span>Firme aquí con el dedo o puntero</span>
                <span className="text-[11px] text-[#94a3b8]">O use el botón "Sello Electrónico" superior</span>
              </div>
            )}
            <div className="absolute bottom-2 left-4 right-4 border-b border-slate-300 pointer-events-none"></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e8f8]">
          <button
            type="button"
            onClick={() => setIsSignatureModalOpen(false)}
            className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-[13px] font-medium text-[#151c27] cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmSignature}
            className="min-h-[44px] px-5 py-2 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-lg text-[13px] font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            <CheckCircle2 className="w-4.5 h-4.5" />
            <span>Certificar y Concluir Manifiesto</span>
          </button>
        </div>
      </div>
    </div>
  );
};
