import React from 'react';
import { StructuralMemberLocation, Piece } from '../../types';
import { 
  getMemberStatus, 
  STATUS_COLORS 
} from '../../utils/structuralGridData';
import { 
  X, 
  Layers, 
  QrCode, 
  Truck, 
  CheckSquare, 
  HardHat, 
  Flame, 
  Calendar, 
  ExternalLink,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MemberDetailModalProps {
  member: (StructuralMemberLocation & { piece?: Piece }) | null;
  onClose: () => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({ member, onClose }) => {
  const { 
    setSelectedPieceForDetail, 
    setSelectedPieceForQR, 
    playFeedbackSound 
  } = useApp();

  if (!member) return null;

  const piece = member.piece;
  const status = getMemberStatus(piece);
  const colorInfo = STATUS_COLORS[status];

  const handleOpenFullDetail = () => {
    if (piece) {
      if (playFeedbackSound) playFeedbackSound('click');
      setSelectedPieceForDetail(piece);
      onClose();
    }
  };

  const handleOpenQR = () => {
    if (piece) {
      if (playFeedbackSound) playFeedbackSound('click');
      setSelectedPieceForQR(piece);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full border border-[#c3c6d7] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh] sm:max-h-[85vh] text-[#151c27]">
        {/* Header (Fixed at top) */}
        <div className="p-4 sm:p-5 border-b border-[#e2e8f8] bg-[#f9fafb] flex justify-between items-start shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#004ac6]/10 text-[#004ac6] flex items-center justify-center font-bold shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-[18px] text-[#151c27]">
                  {member.pieceMark}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${colorInfo.badgeBg}`}>
                  {colorInfo.label}
                </span>
              </div>
              <p className="text-[12px] text-[#555f6f]">
                {member.memberType} estructural • Proyecto: <strong>{member.project}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#737686] hover:text-[#151c27] p-1.5 rounded-lg hover:bg-[#e2e8f8] transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          {/* Location in Building Grid */}
          <div className="bg-[#f0f3ff] rounded-xl p-3 text-[12.5px] border border-[#dbe4f9]">
            <span className="font-bold text-[#004ac6] uppercase text-[11px] block mb-1">
              Ubicación en Retícula de Ejes:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[#434655]">
              <div>
                <span>Marco / Elevación:</span>{' '}
                <strong className="text-[#151c27]">{member.elevationFrame || 'Pórtico Principal'}</strong>
              </div>
              <div>
                <span>Eje(s):</span>{' '}
                <strong className="text-[#151c27] font-mono">
                  {member.axisFrom}{member.axisTo ? ` - ${member.axisTo}` : ''}
                </strong>
              </div>
              <div>
                <span>Nivel / Losa:</span>{' '}
                <strong className="text-[#151c27] font-mono">{member.levelFrom}</strong>
              </div>
              <div>
                <span>ID Elemento:</span>{' '}
                <strong className="text-[#151c27] font-mono text-[11px]">{member.id}</strong>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="grid grid-cols-2 gap-2.5 text-[12.5px]">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block">Perfil Metal</span>
              <span className="font-bold font-mono text-[#151c27] text-[14px]">
                {piece?.profile || 'W24x76'}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block">Peso Unitario</span>
              <span className="font-bold font-mono text-[#151c27] text-[14px] flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-slate-600" />
                {piece?.weightKg || 520} kg
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block">Grado de Acero</span>
              <span className="font-semibold text-[#151c27] text-[12px] truncate block">
                {piece?.steelGrade || 'ASTM A992 Grado 50'}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block">Número de Colada</span>
              <span className="font-mono text-[#151c27] text-[12px] flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                {piece?.heatNumber || 'HT-992-8812'}
              </span>
            </div>
          </div>

          {/* Transport & QC summary */}
          <div className="space-y-2 border-t border-[#e2e8f8] pt-3 text-[12.5px]">
            <div className="flex justify-between items-center">
              <span className="text-[#555f6f] flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-600" />
                Envío / Manifiesto Asignado:
              </span>
              <span className="font-mono font-bold text-[#151c27]">
                {piece?.refId && piece.refId !== '-' ? piece.refId : 'Pendiente de asignar'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#555f6f] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Inspección Calidad (QC):
              </span>
              <span className="font-semibold text-blue-700">
                {piece?.qcStatus || 'Aprobada en Taller'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons (Fixed at bottom) */}
        <div className="p-3.5 sm:p-4 border-t border-[#e2e8f8] bg-[#f9fafb] flex justify-end gap-2 shrink-0">
          {piece && (
            <>
              <button
                type="button"
                onClick={handleOpenQR}
                className="px-3.5 py-1.5 bg-white border border-[#c3c6d7] hover:bg-[#f0f3ff] text-[#151c27] rounded-lg text-[12.5px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-[#004ac6]" />
                <span>Etiqueta QR</span>
              </button>
              <button
                type="button"
                onClick={handleOpenFullDetail}
                className="px-4 py-1.5 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-lg text-[12.5px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Ver Ficha Completa</span>
              </button>
            </>
          )}
          {!piece && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-100 text-[#151c27] rounded-lg text-[12.5px] font-medium hover:bg-slate-200 transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
