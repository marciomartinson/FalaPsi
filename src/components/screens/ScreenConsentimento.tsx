import React, { useState } from 'react';
import { PsychiatricPatient, ScreenId } from '../../types/clinical';
import { SyntheticNoticeBanner } from '../SyntheticNoticeBanner';

interface ScreenConsentimentoProps {
  currentPatient: PsychiatricPatient;
  onNavigate: (screenId: ScreenId) => void;
  onSelectCase?: (caseKey: any) => void;
}

export const ScreenConsentimento: React.FC<ScreenConsentimentoProps> = ({
  currentPatient,
  onNavigate,
}) => {
  // If Paulo (Caso 4), default to pending/declined
  const isPauloCase = currentPatient.caseKey === 'paulo';
  const [consentStatus, setConsentStatus] = useState<'accepted' | 'declined'>(
    isPauloCase ? 'declined' : 'accepted'
  );

  const patientInitials = currentPatient.name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <main className="w-full pt-20 pb-28 bg-[#f8f9ff] min-h-screen">
      {/* Synthetic notice fixed banner */}
      <SyntheticNoticeBanner />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Header indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5eeff]">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-[#0284c7]/10 text-[#0284c7] font-mono text-[11px] font-bold">
                TELA 2 DE 6
              </span>
              <h1 className="text-[22px] font-bold text-[#0b1c30]">Consentimento do Paciente</h1>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-mono bg-[#bae6fd] text-[#0369a1] font-bold">
                Autonomia
              </span>
            </div>
            <p className="text-[13px] text-[#45464d] mt-0.5">
              Esclarecimento ético prévio e autonomia da pessoa em atendimento psiquiátrico ambulatorial
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-[#eff4ff] text-[#0284c7] border border-[#d3e4fe] rounded-lg text-[12px] font-semibold">
              {currentPatient.name} • {currentPatient.type}
            </span>
          </div>
        </div>

        {/* Patient Info Card */}
        <div className="w-full bg-[#ffffff] rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#eff4ff] text-[#0284c7] flex items-center justify-center font-bold text-[18px] border border-[#d3e4fe]">
              {patientInitials}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[17px] font-bold text-[#0b1c30]">{currentPatient.name}</span>
                <span className="text-[12px] text-[#76777d]">{currentPatient.age} anos</span>
                <span className="font-mono text-[11px] text-[#475569] bg-[#f1f5f9] px-2 py-0.5 rounded">
                  {currentPatient.recordNumber}
                </span>
              </div>
              <span className="text-[12px] text-[#45464d] mt-0.5">
                <strong>Quadro:</strong> {currentPatient.synopsis}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-mono text-[#0284c7] bg-[#eff4ff] px-2.5 py-1 rounded-lg border border-[#d3e4fe] flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              LGPD & Autonomia
            </span>
          </div>
        </div>

        {/* Informative Text Box for the Patient */}
        <div className="bg-[#ffffff] rounded-2xl p-6 border-2 border-[#d3e4fe] shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-2.5 border-b border-[#e5eeff] pb-3">
            <div className="w-8 h-8 rounded-lg bg-[#0284c7]/10 text-[#0284c7] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">record_voice_over</span>
            </div>
            <div>
              <h2 className="font-bold text-[15px] text-[#0b1c30]">Texto de Esclarecimento ao Paciente</h2>
              <span className="text-[11px] text-[#76777d]">O médico lê ou sintetiza estes pontos antes de iniciar a escuta:</span>
            </div>
          </div>

          {/* Prescribed text from prompt */}
          <div className="p-4 rounded-xl bg-[#eff4ff]/60 border border-[#d3e4fe] flex flex-col gap-3">
            <p className="text-[14px] text-[#0f172a] leading-relaxed font-medium">
              "A conversa será transcrita para apoiar a documentação do médico; o áudio não é armazenado; você pode recusar ou pedir para pausar a qualquer momento, sem nenhum prejuízo ao seu atendimento."
            </p>
          </div>

          {/* Three key pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#0284c7] font-bold text-[12px]">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                <span>Áudio não é gravado</span>
              </div>
              <p className="text-[11px] text-[#45464d] leading-normal">
                O áudio processado na memória volátil é descartado em tempo real. Não há salvamento em disco nem envio a terceiros.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#0284c7] font-bold text-[12px]">
                <span className="material-symbols-outlined text-[16px]">pause_circle</span>
                <span>Pausa a qualquer momento</span>
              </div>
              <p className="text-[11px] text-[#45464d] leading-normal">
                O paciente ou o médico pode pausar a transcrição a qualquer momento da consulta com um único clique.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#0284c7] font-bold text-[12px]">
                <span className="material-symbols-outlined text-[16px]">handshake</span>
                <span>Sem prejuízo ao cuidado</span>
              </div>
              <p className="text-[11px] text-[#45464d] leading-normal">
                A recusa do uso de IA não altera em nada a qualidade, dedicação ou tempo de atenção do médico psiquiatra.
              </p>
            </div>
          </div>

          {/* Decision Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#e5eeff]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setConsentStatus('accepted')}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  consentStatus === 'accepted'
                    ? 'bg-[#0284c7] text-white shadow-sm ring-2 ring-[#0284c7]/30'
                    : 'bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Paciente consentiu</span>
              </button>

              <button
                type="button"
                onClick={() => setConsentStatus('declined')}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  consentStatus === 'declined'
                    ? 'bg-[#475569] text-white shadow-sm ring-2 ring-[#475569]/30'
                    : 'bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                <span>Paciente recusou</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-[#76777d] self-center">
              Status selecionado: <strong>{consentStatus === 'accepted' ? 'Consentimento Concedido' : 'Recusa Registrada (Modo Manual)'}</strong>
            </span>
          </div>

          {/* Status feedback card */}
          {consentStatus === 'accepted' ? (
            <div className="p-3.5 rounded-xl bg-[#f0f9ff] border border-[#bae6fd] text-[#0369a1] text-[12px] flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-[#0284c7]">verified_user</span>
              <span>
                <strong>Consentimento aceito:</strong> A consulta prosseguirá com transcrição em tempo real, geração de rascunho de evolução com fontes auditáveis e salvaguardas de psiquiatria.
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#cbd5e1] text-[#334155] text-[12px] flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-[#64748b]">mic_off</span>
              <span>
                <strong>Recusa registrada (Exceção):</strong> Nenhuma captação de áudio será realizada. A documentação clínica seguirá em formulário estritamente manual pelo médico.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#ffffff] border-t border-[#e5eeff] px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onNavigate('fila-do-plantao')}
            className="px-4 py-2 rounded-xl border border-[#d3e4fe] bg-[#ffffff] text-[#0b1c30] text-[12px] font-bold hover:bg-[#eff4ff] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Voltar à Agenda</span>
          </button>

          <div className="flex items-center gap-3">
            {consentStatus === 'accepted' ? (
              <button
                type="button"
                onClick={() => onNavigate('atendimento')}
                className="px-5 py-2 rounded-xl bg-[#0284c7] text-white text-[12px] font-bold hover:bg-[#0369a1] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>Avançar para Consulta</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('excecao')}
                className="px-5 py-2 rounded-xl bg-[#475569] text-white text-[12px] font-bold hover:bg-[#334155] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>Seguir para Documentação Manual</span>
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
              </button>
            )}
          </div>
        </div>
      </footer>
    </main>
  );
};
