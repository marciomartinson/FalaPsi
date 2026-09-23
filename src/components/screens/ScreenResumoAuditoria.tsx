import React, { useState } from 'react';
import { PsychiatricPatient, ScreenId } from '../../types/clinical';
import { SyntheticNoticeBanner } from '../SyntheticNoticeBanner';

interface ScreenResumoAuditoriaProps {
  currentPatient: PsychiatricPatient;
  onNavigate: (screenId: ScreenId) => void;
  onOpenQrModal?: () => void;
}

export const ScreenResumoAuditoria: React.FC<ScreenResumoAuditoriaProps> = ({
  currentPatient,
  onNavigate,
  onOpenQrModal,
}) => {
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleSyncPEP = () => {
    setSyncFeedback('Evolução psiquiátrica sincronizada com sucesso no Prontuário Eletrônico (ID TX-PSI-99410).');
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Metrics calculation
  const metrics = {
    fontesVerificaveis: currentPatient.caseKey === 'carla' ? 5 : currentPatient.caseKey === 'roberto' ? 4 : 4,
    editados: currentPatient.caseKey === 'roberto' ? 1 : 0,
    ignorados: 0,
    bloqueiosResolvidos: 2, // EEM e HD preenchidos exclusivamente pelo médico
    alertasAvaliados: currentPatient.caseKey === 'lucia' ? 1 : 0,
  };

  return (
    <main className="w-full pt-20 pb-32 bg-[#f8f9ff] min-h-screen">
      {/* Fixed Synthetic Notice Banner */}
      <SyntheticNoticeBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#e5eeff]">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-[#0284c7]/10 text-[#0284c7] font-mono text-[11px] font-bold">
                TELA 6 DE 6
              </span>
              <h1 className="text-[22px] font-bold text-[#0b1c30]">
                Evolução Psiquiátrica Homologada & Auditoria
              </h1>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-mono bg-[#bae6fd] text-[#0369a1] font-bold">
                CFM
              </span>
            </div>
            <p className="text-[13px] text-[#45464d] mt-0.5">
              Prontuário ambulatorial assinado digitalmente • Trilha forense e contagem auditável de fontes e decisões
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-[#f0f9ff] border border-[#bae6fd] text-[#0369a1] text-[11px] font-mono font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              Assinatura Médica ICP-Brasil • CFM 2.314/2022
            </span>
          </div>
        </div>

        {syncFeedback && (
          <div className="p-3.5 bg-[#f0f9ff] border border-[#bae6fd] rounded-xl text-[#0369a1] text-[12px] flex items-center gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-[20px] text-[#0284c7]">check_circle</span>
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* 1. Banner de Sucesso de Assinatura Médica */}
        <div className="w-full bg-[#ffffff] rounded-2xl p-5 sm:p-6 border border-[#bae6fd] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0284c7]/10 text-[#0284c7] flex items-center justify-center shrink-0 border border-[#bae6fd]">
              <span className="material-symbols-outlined text-[26px]">verified</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[17px] font-bold text-[#0b1c30]">
                  Evolução Psiquiátrica Assinada Digitalmente
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#f0f9ff] text-[#0369a1] text-[11px] font-mono font-semibold flex items-center gap-1 border border-[#bae6fd]">
                  <span className="material-symbols-outlined text-[13px]">lock</span>
                  CFM 2.314/2022 • Rastreabilidade Integral
                </span>
              </div>
              <p className="text-[12px] text-[#45464d] mt-1 leading-relaxed">
                Autenticado por <strong className="text-[#0b1c30]">Dr. Roberto Guimarães</strong> (CRM/SP 148.920 • RQE 82.119 - Psiquiatria) •
                Carimbo do Tempo: <span className="font-mono text-[#0284c7] font-semibold">23/09/2026 às 14:48:12 BRT</span> •
                Consultório 03 • Ambulatório de Psiquiatria
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#f8f9ff] px-4 py-2 rounded-xl border border-[#d3e4fe] shrink-0 self-start lg:self-auto">
            <div className="flex flex-col items-start lg:items-end">
              <span className="text-[10px] font-mono uppercase text-[#76777d]">Certificado Médico</span>
              <span className="text-[11px] font-semibold text-[#0b1c30]">ICP-Brasil A3 Token</span>
            </div>
            <div className="h-6 w-px bg-[#c6c6cd]"></div>
            <div className="flex items-center gap-1 text-[#0284c7] text-[12px] font-bold">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Válido</span>
            </div>
          </div>
        </div>

        {/* 2. Painel de Métricas e Auditoria Requisitadas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Métrica 1: Campos com fonte */}
          <div className="p-3.5 bg-white rounded-xl border border-[#e5eeff] flex flex-col gap-1 shadow-2xs">
            <span className="text-[10px] font-mono uppercase font-bold text-[#64748b]">
              Com Fonte Verificável
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#0284c7]">{metrics.fontesVerificaveis}</span>
              <span className="text-[10px] text-[#64748b]">campos</span>
            </div>
            <span className="text-[10px] text-[#059669]">100% citados</span>
          </div>

          {/* Métrica 2: Editados */}
          <div className="p-3.5 bg-white rounded-xl border border-[#e5eeff] flex flex-col gap-1 shadow-2xs">
            <span className="text-[10px] font-mono uppercase font-bold text-[#64748b]">
              Campos Editados
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#0284c7]">{metrics.editados}</span>
              <span className="text-[10px] text-[#64748b]">campos</span>
            </div>
            <span className="text-[10px] text-[#0284c7]">Ajustes do médico</span>
          </div>

          {/* Métrica 3: Ignorados */}
          <div className="p-3.5 bg-white rounded-xl border border-[#e5eeff] flex flex-col gap-1 shadow-2xs">
            <span className="text-[10px] font-mono uppercase font-bold text-[#64748b]">
              Campos Ignorados
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#64748b]">{metrics.ignorados}</span>
              <span className="text-[10px] text-[#64748b]">campos</span>
            </div>
            <span className="text-[10px] text-[#64748b]">Descartados</span>
          </div>

          {/* Métrica 4: Bloqueios Resolvidos */}
          <div className="p-3.5 bg-white rounded-xl border border-[#e5eeff] flex flex-col gap-1 shadow-2xs">
            <span className="text-[10px] font-mono uppercase font-bold text-[#64748b]">
              Bloqueios Resolvidos
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#059669]">{metrics.bloqueiosResolvidos}</span>
              <span className="text-[10px] text-[#64748b]">resolvidos</span>
            </div>
            <span className="text-[10px] text-[#059669]">EEM & HD preenchidos</span>
          </div>

          {/* Métrica 5: Alertas Avaliados */}
          <div className="p-3.5 bg-white rounded-xl border border-[#e5eeff] flex flex-col gap-1 shadow-2xs">
            <span className="text-[10px] font-mono uppercase font-bold text-[#64748b]">
              Alertas de Risco Avaliados
            </span>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${metrics.alertasAvaliados > 0 ? 'text-[#b91c1c]' : 'text-[#64748b]'}`}>
                {metrics.alertasAvaliados}
              </span>
              <span className="text-[10px] text-[#64748b]">avaliados</span>
            </div>
            <span className="text-[10px] text-[#64748b]">
              {metrics.alertasAvaliados > 0 ? 'Protocolo cumprido' : 'Sem menção a risco'}
            </span>
          </div>
        </div>

        {/* 3. Documento Final Homologado (Prontuário Psiquiátrico) */}
        <div className="bg-[#ffffff] rounded-2xl p-6 sm:p-8 border border-[#e5eeff] shadow-sm flex flex-col gap-5 print:border-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#e5eeff] pb-4">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#76777d]">
                Hospital Santa Helena • Ambulatório de Psiquiatria
              </span>
              <h2 className="text-xl font-bold text-[#0f172a] mt-0.5">
                Evolução Clínica de Retorno Ambulatorial
              </h2>
            </div>
            <div className="text-left sm:text-right mt-2 sm:mt-0 font-mono text-[11px] text-[#475569]">
              <div>Paciente: <strong>{currentPatient.name}</strong> ({currentPatient.age} anos)</div>
              <div>Prontuário: <strong>{currentPatient.recordNumber}</strong></div>
              <div>Data: <strong>23/09/2026</strong></div>
            </div>
          </div>

          {/* Campos Estruturados da Evolução */}
          <div className="flex flex-col gap-4 text-[13px] text-[#1e293b] leading-relaxed">
            <div>
              <strong className="text-[#0f172a] block text-[12px] uppercase font-mono text-[#0284c7]">
                1. Relato do Paciente:
              </strong>
              <p className="mt-1">
                {currentPatient.caseKey === 'carla'
                  ? 'Paciente refere melhora substancial do quadro clínico geral nos últimos 60 dias. Relata que o sono se regularizou (dormindo 7 a 8 horas contínuas, sem despertares precoces) e que houve retomada espontânea de atividades físicas e sociais. Nega novos picos de angústia.'
                  : currentPatient.caseKey === 'roberto'
                  ? 'Paciente em acompanhamento para Transtorno Afetivo Bipolar comparece para reavaliação. Refere estabilidade relativa do humor, sem crises agudas recentes. Queixa-se de tremor distal leve em membros superiores.'
                  : 'Paciente relata persistência de humor deprimido, fadiga intensa e anedonia. Verbalizou desânimo existencial aos 14:22: "às vezes penso que seria melhor não acordar". Nega planejamento ou intencionalidade suicida.'}
              </p>
            </div>

            <div>
              <strong className="text-[#0f172a] block text-[12px] uppercase font-mono text-[#0284c7]">
                2. Mudanças Desde a Última Consulta:
              </strong>
              <p className="mt-1">
                {currentPatient.caseKey === 'carla'
                  ? 'Evolução favorável comparada a 24/07/2026. Remissão dos despertares noturnos e recuperação dos níveis de energia e foco no trabalho.'
                  : currentPatient.caseKey === 'roberto'
                  ? 'Relata introdução não orientada de esquema em dias alternados no último mês. Não realizou os exames solicitados na consulta de 15/05/2026.'
                  : 'Quadro sem melhora expressiva em relação à consulta de 10/08/2026. Mantém padrão de sono fragmentado e hiporexia.'}
              </p>
            </div>

            <div>
              <strong className="text-[#0f172a] block text-[12px] uppercase font-mono text-[#0284c7]">
                3. Adesão ao Tratamento:
              </strong>
              <p className="mt-1">
                {currentPatient.caseKey === 'roberto'
                  ? 'Adesão irregular: Tomada em dias alternados por decisão própria. Paciente orientado enfaticamente sobre a necessidade estrita de tomada diária contínua para manutenção do nível sérico terapêutico.'
                  : 'Adesão integral referida. Nega esquecimentos ou descontinuidade posológica.'}
              </p>
            </div>

            <div>
              <strong className="text-[#0f172a] block text-[12px] uppercase font-mono text-[#0284c7]">
                4. Efeitos Adversos Relatados:
              </strong>
              <p className="mt-1">
                {currentPatient.caseKey === 'roberto'
                  ? 'Tremor fino intermitente em extremidades superiores e peso gástrico leve eventual.'
                  : 'Nega náuseas, alterações digestivas ou disfunção sexual atual.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#cbd5e1]">
              <strong className="text-[#0f172a] block text-[12px] uppercase font-mono text-[#475569]">
                5. Exame do Estado Mental (Preenchimento Exclusivo do Médico):
              </strong>
              <p className="mt-1 font-medium">
                Vigil, lúcido e orientado no tempo e espaço. Atenção e memória preservadas. Discurso coerente e articulado. Afeto congruente e modulado. Ausência de delírios, alucinações ou alterações sensoperceptivas. Crítica do estado mórbido preservada.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#cbd5e1]">
              <strong className="text-[#0f172a] block text-[12px] uppercase font-mono text-[#475569]">
                6. Hipótese Diagnóstica (Preenchimento Exclusivo do Médico):
              </strong>
              <p className="mt-1 font-medium">
                {currentPatient.caseKey === 'roberto'
                  ? 'F31.0 - Transtorno afetivo bipolar, episódio atual hipomaníaco em remissão / manutenção com Lítio.'
                  : currentPatient.caseKey === 'lucia'
                  ? 'F32.2 - Episódio depressivo grave sem sintomas psicóticos.'
                  : 'F33.0 - Transtorno depressivo recorrente, episódio atual leve em remissão.'}
              </p>
            </div>

            {currentPatient.caseKey === 'lucia' && (
              <div className="p-3.5 rounded-xl bg-[#fff1f2] border border-[#fecdd3] text-[#881337]">
                <strong className="block text-[12px] uppercase font-mono font-bold">
                  Avaliação Médica de Risco Obrigatória (Minutagem 14:22):
                </strong>
                <p className="mt-1 text-[12px]">
                  Trecho avaliado: "às vezes penso que seria melhor não acordar". Avaliação clínica: ideação passiva de morte decorrente do esgotamento depressivo. Sem intencionalidade ou planejamento atual. Forte suporte protetor pelos filhos pequenos. Mantida rede de apoio e pactuado contato imediato se agravamento.
                </p>
              </div>
            )}

            <div>
              <strong className="text-[#0f172a] block text-[12px] uppercase font-mono text-[#0284c7]">
                7. Plano Informado pelo Médico:
              </strong>
              <p className="mt-1">
                {currentPatient.caseKey === 'carla'
                  ? 'Manutenção de Escitalopram 15mg/dia. Encaminhamento formal para Psicoterapia Cognitivo-Comportamental. Retorno em 60 dias.'
                  : currentPatient.caseKey === 'roberto'
                  ? 'Reforço de tomada diária contínua de Carbonato de Lítio 600mg/dia. Solicitada Litemia Sérica + TSH e T4 Livre. Retorno em 30 dias com exames.'
                  : 'Ajuste posológico, psicoterapia de apoio e reforço da rede de proteção familiar.'}
              </p>
            </div>
          </div>

          {/* Assinatura Médica Final */}
          <div className="pt-6 border-t border-[#e5eeff] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="font-bold text-[#0f172a] text-[14px]">Dr. Roberto Guimarães</span>
              <span className="text-[12px] text-[#475569]">CRM/SP 148.920 • RQE 82.119 (Psiquiatria)</span>
              <span className="text-[10px] font-mono text-[#64748b]">Assinatura digital ICP-Brasil validada</span>
            </div>

            <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] flex items-center gap-3">
              <span className="material-symbols-outlined text-[24px] text-[#0284c7]">qr_code_2</span>
              <div className="flex flex-col text-[10px] font-mono">
                <span className="font-bold text-[#0f172a]">HASH: 8F12A-99B7C-PSI-2026</span>
                <span className="text-[#64748b]">Conferência CFM 2.314/2022</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#ffffff] border-t border-[#e5eeff] px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* QR code de validação */}
            {onOpenQrModal && (
              <button
                type="button"
                onClick={onOpenQrModal}
                className="px-3 py-2 rounded-xl border border-[#d3e4fe] bg-[#eff4ff] text-[#0284c7] text-[12px] font-bold hover:bg-[#d8e8fe] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                <span>QR Code de Validação</span>
              </button>
            )}

            {/* Sincronizar PEP */}
            <button
              type="button"
              onClick={handleSyncPEP}
              className="px-3 py-2 rounded-xl border border-[#d3e4fe] bg-[#ffffff] text-[#0284c7] text-[12px] font-bold hover:bg-[#eff4ff] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              <span>Sincronizar PEP</span>
            </button>

            {/* Exportar Laudo PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl border border-[#d3e4fe] bg-[#ffffff] text-[#475569] text-[12px] font-bold hover:bg-[#eff4ff] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              <span>Exportar PDF</span>
            </button>
          </div>

          {/* Botão Finalizar e Voltar para a Agenda (Principal na direita embaixo) */}
          <button
            type="button"
            onClick={() => onNavigate('fila-do-plantao')}
            className="px-6 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-[13px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">done_all</span>
            <span>Finalizar e voltar para a agenda</span>
          </button>
        </div>
      </footer>
    </main>
  );
};
