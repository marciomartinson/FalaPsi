import React from 'react';
import { RiskAlertData } from '../types/clinical';

interface RiskAlertBannerProps {
  riskData: RiskAlertData;
  onToggleEvaluated?: (evaluated: boolean) => void;
  onUpdateEvaluationNotes?: (notes: string) => void;
  interactive?: boolean; // When true (on Review Draft screen), doctor can check and type evaluation
}

export const RiskAlertBanner: React.FC<RiskAlertBannerProps> = ({
  riskData,
  onToggleEvaluated,
  onUpdateEvaluationNotes,
  interactive = false,
}) => {
  if (!riskData.hasRisk) return null;

  return (
    <div className="w-full bg-[#fef2f2] border-2 border-[#b91c1c] rounded-xl p-4 shadow-md flex flex-col gap-3 animate-fadeIn">
      {/* Top row with alert icon and literal phrase */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#fca5a5]/50 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#b91c1c] text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[20px]">warning</span>
          </div>
          <div>
            <h4 className="font-extrabold text-[#991b1b] text-[14px] flex items-center gap-2">
              <span>Menção a risco identificada. Avaliação do médico necessária.</span>
              <span className="px-2 py-0.5 bg-[#b91c1c] text-white text-[10px] font-mono rounded font-bold uppercase tracking-wider">
                Literal • Não Classificado por IA
              </span>
            </h4>
            <p className="text-[11px] text-[#7f1d1d] mt-0.5">
              O assistente nunca classifica, suaviza ou resume menções a risco. A interpretação clínica e a estratificação de conduta são indelegáveis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#ffffff] px-2.5 py-1 rounded-md border border-[#fca5a5] text-[11px] font-mono font-bold text-[#b91c1c]">
          <span className="material-symbols-outlined text-[15px]">schedule</span>
          <span>Minutagem: {riskData.timestamp}</span>
        </div>
      </div>

      {/* Literal quote excerpt */}
      <div className="bg-[#ffffff] p-3 rounded-lg border border-[#fca5a5] flex flex-col gap-1">
        <span className="text-[10px] uppercase font-mono font-bold text-[#991b1b] tracking-wide">
          Trecho Literal Identificado na Fala da Paciente:
        </span>
        <p className="text-[13px] font-semibold text-[#1c1917] italic bg-[#fef2f2]/60 p-2 rounded border-l-4 border-[#b91c1c]">
          "{riskData.literalText}"
        </p>
      </div>

      {/* Interactive area on Screen 4 (Revisão) or informational notice on Screen 3 */}
      {interactive ? (
        <div className="bg-[#fff1f2] p-3 rounded-lg border border-[#fecdd3] flex flex-col gap-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={riskData.evaluatedByDoctor}
                onChange={(e) => onToggleEvaluated?.(e.target.checked)}
                className="w-4 h-4 text-[#b91c1c] rounded border-[#b91c1c] focus:ring-[#b91c1c] cursor-pointer"
              />
              <span className="font-bold text-[13px] text-[#881337]">
                Avaliei este trecho (Requisito obrigatório para habilitar assinatura do documento)
              </span>
            </label>

            <span
              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                riskData.evaluatedByDoctor
                  ? 'bg-[#10b981]/15 text-[#065f46]'
                  : 'bg-[#b91c1c]/15 text-[#991b1b]'
              }`}
            >
              {riskData.evaluatedByDoctor ? '✓ AVALIAÇÃO MÉDICA CONFIRMADA' : 'PENDÊNCIA BLOQUEADORA'}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-[#881337]">
              Registro da Avaliação Clínica do Médico sobre o Risco (ideação, intenção, plano, rede de apoio, conduta):
            </label>
            <textarea
              value={riskData.doctorEvaluationNotes}
              onChange={(e) => onUpdateEvaluationNotes?.(e.target.value)}
              placeholder="Descreva sua avaliação clínica do risco (ex.: ideação passiva de morte sem intencionalidade ou planejamento atual; presença de fator protetor familiar; pactuado contato SOS com CAPS/CVV e suporte familiar...)"
              rows={2}
              className="w-full text-[12px] p-2.5 rounded-lg border border-[#fca5a5] bg-white text-[#1c1917] focus:outline-none focus:ring-2 focus:ring-[#b91c1c]/40 resize-none"
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-[11px] font-mono text-[#991b1b] pt-1">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">lock</span>
            Assinatura e conclusão do prontuário estarão bloqueadas na Tela de Revisão até o registro de sua avaliação.
          </span>
          <span className="font-semibold underline">Obrigatório CFM</span>
        </div>
      )}
    </div>
  );
};
