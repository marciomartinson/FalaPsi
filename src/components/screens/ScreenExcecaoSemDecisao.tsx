import React, { useState } from 'react';
import { PsychiatricPatient, ScreenId } from '../../types/clinical';
import { SyntheticNoticeBanner } from '../SyntheticNoticeBanner';

interface ScreenExcecaoSemDecisaoProps {
  currentPatient: PsychiatricPatient;
  onNavigate: (screenId: ScreenId) => void;
  onSelectCase?: (caseKey: any) => void;
}

export const ScreenExcecaoSemDecisao: React.FC<ScreenExcecaoSemDecisaoProps> = ({
  currentPatient,
  onNavigate,
}) => {
  // 3 Situation scenarios mandated by prompt
  const [activeSituation, setActiveSituation] = useState<'recusa' | 'sem_decisao' | 'trechos_incertos'>(
    currentPatient.caseKey === 'paulo' ? 'recusa' : 'sem_decisao'
  );

  // Form states for manual documentation
  const [manualQueixa, setManualQueixa] = useState('Ansiedade generalizada, aperto torácico e preocupação excessiva com a saúde.');
  const [manualEvolucao, setManualEvolucao] = useState('Paciente comparece à primeira consulta encaminhado pela cardiologia. Refere episódios de taquicardia situacional com exames cardiológicos normais.');
  const [manualEem, setManualEem] = useState('Lúcido, orientado no tempo e espaço. Afeto ansioso. Sem delírios ou alucinações. Crítica preservada.');
  const [manualHd, setManualHd] = useState('F41.1 - Transtorno de ansiedade generalizada.');
  const [manualConduta, setManualConduta] = useState('Psicoeducação, higiene do sono e proposta de introdução de ISRS em retorno.');
  const [isSavedManual, setIsSavedManual] = useState(false);

  return (
    <main className="w-full pt-20 pb-28 bg-[#f8f9ff] min-h-screen">
      {/* Synthetic Notice Fixed Banner */}
      <SyntheticNoticeBanner />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5eeff]">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-[#0284c7]/10 text-[#0284c7] font-mono text-[11px] font-bold">
                TELA 5 DE 6
              </span>
              <h1 className="text-[22px] font-bold text-[#0b1c30]">Exceções do Fluxo Clínico</h1>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-mono bg-[#bae6fd] text-[#0369a1] font-bold">
                Casos
              </span>
            </div>
            <p className="text-[13px] text-[#45464d] mt-0.5">
              Protocolos específicos para recusa de consentimento, ausência de condutas verbalizadas e áudio com baixa confiança
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-[#eff4ff] text-[#0284c7] border border-[#d3e4fe] rounded-lg text-[12px] font-semibold">
              {currentPatient.name} • {currentPatient.type}
            </span>
          </div>
        </div>

        {/* 3 Situations Tabs Selector */}
        <div className="bg-[#ffffff] p-2 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col sm:flex-row gap-2">
          {/* Situation A */}
          <button
            type="button"
            onClick={() => setActiveSituation('recusa')}
            className={`flex-1 p-3 rounded-xl text-left transition-all cursor-pointer flex items-center gap-3 ${
              activeSituation === 'recusa'
                ? 'bg-[#0284c7] text-white shadow-xs'
                : 'bg-[#f8f9ff] hover:bg-[#eff4ff] text-[#334155]'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {activeSituation === 'recusa' ? 'edit_note' : 'mic_off'}
            </span>
            <div className="flex flex-col min-w-0">
              <strong className="text-[13px]">a) Recusa de Consentimento</strong>
              <span className={`text-[11px] truncate ${activeSituation === 'recusa' ? 'text-white/80' : 'text-[#64748b]'}`}>
                Documentação clínica manual
              </span>
            </div>
          </button>

          {/* Situation B */}
          <button
            type="button"
            onClick={() => setActiveSituation('sem_decisao')}
            className={`flex-1 p-3 rounded-xl text-left transition-all cursor-pointer flex items-center gap-3 ${
              activeSituation === 'sem_decisao'
                ? 'bg-[#0284c7] text-white shadow-xs'
                : 'bg-[#f8f9ff] hover:bg-[#eff4ff] text-[#334155]'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {activeSituation === 'sem_decisao' ? 'verified' : 'rule'}
            </span>
            <div className="flex flex-col min-w-0">
              <strong className="text-[13px]">b) Sem Pedido ou Encaminhamento</strong>
              <span className={`text-[11px] truncate ${activeSituation === 'sem_decisao' ? 'text-white/80' : 'text-[#64748b]'}`}>
                Aviso neutro sem documento secundário
              </span>
            </div>
          </button>

          {/* Situation C */}
          <button
            type="button"
            onClick={() => setActiveSituation('trechos_incertos')}
            className={`flex-1 p-3 rounded-xl text-left transition-all cursor-pointer flex items-center gap-3 ${
              activeSituation === 'trechos_incertos'
                ? 'bg-[#0284c7] text-white shadow-xs'
                : 'bg-[#f8f9ff] hover:bg-[#eff4ff] text-[#334155]'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {activeSituation === 'trechos_incertos' ? 'warning' : 'hearing'}
            </span>
            <div className="flex flex-col min-w-0">
              <strong className="text-[13px]">c) Trechos Incertos</strong>
              <span className={`text-[11px] truncate ${activeSituation === 'trechos_incertos' ? 'text-white/80' : 'text-[#64748b]'}`}>
                Revisão prévia da transcrição
              </span>
            </div>
          </button>
        </div>

        {/* SITUATION A: Recusa de consentimento (Documentação manual) */}
        {activeSituation === 'recusa' && (
          <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#e5eeff] shadow-sm flex flex-col gap-5">
            <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#cbd5e1] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#475569] text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">mic_off</span>
                </div>
                <div>
                  <h3 className="font-bold text-[14px] text-[#0f172a]">
                    Paciente Recusou a Captação Acústica (Caso Paulo Silveira, 52 anos)
                  </h3>
                  <p className="text-[12px] text-[#475569]">
                    Nenhum microfone ativo e nenhum algoritmo de IA envolvido. Prontuário preenchido exclusivamente pelo médico psiquiatra.
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-[#e2e8f0] text-[#334155] text-[11px] font-mono font-bold shrink-0">
                Modo Estritamente Manual
              </span>
            </div>

            {/* Manual Clinical Documentation Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold text-[#0f172a]">Queixa Principal:</label>
                <input
                  type="text"
                  value={manualQueixa}
                  onChange={(e) => setManualQueixa(e.target.value)}
                  className="p-2.5 rounded-xl border border-[#d3e4fe] bg-[#f8f9ff] text-[12px] text-[#0b1c30]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold text-[#0f172a]">Hipótese Diagnóstica (CID):</label>
                <input
                  type="text"
                  value={manualHd}
                  onChange={(e) => setManualHd(e.target.value)}
                  className="p-2.5 rounded-xl border border-[#d3e4fe] bg-[#f8f9ff] text-[12px] text-[#0b1c30]"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[12px] font-bold text-[#0f172a]">Evolução Clínica e Anamnese:</label>
                <textarea
                  value={manualEvolucao}
                  onChange={(e) => setManualEvolucao(e.target.value)}
                  rows={3}
                  className="p-2.5 rounded-xl border border-[#d3e4fe] bg-[#f8f9ff] text-[12px] text-[#0b1c30] resize-none"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[12px] font-bold text-[#0f172a]">Exame do Estado Mental (EEM):</label>
                <textarea
                  value={manualEem}
                  onChange={(e) => setManualEem(e.target.value)}
                  rows={2}
                  className="p-2.5 rounded-xl border border-[#d3e4fe] bg-[#f8f9ff] text-[12px] text-[#0b1c30] resize-none"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[12px] font-bold text-[#0f172a]">Plano Terapêutico & Conduta:</label>
                <input
                  type="text"
                  value={manualConduta}
                  onChange={(e) => setManualConduta(e.target.value)}
                  className="p-2.5 rounded-xl border border-[#d3e4fe] bg-[#f8f9ff] text-[12px] text-[#0b1c30]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[#e5eeff]">
              <span className="text-[11px] text-[#64748b]">
                {isSavedManual ? '✓ Evolução manual salva no prontuário local' : 'Preenchimento direto pelo médico assistente'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSavedManual(true)}
                  className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-[12px] font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Salvar Evolução Manual
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('auditoria')}
                  className="px-4 py-2 bg-[#eff4ff] hover:bg-[#d8e8fe] text-[#0284c7] border border-[#d3e4fe] text-[12px] font-bold rounded-xl transition-all cursor-pointer"
                >
                  Concluir & Assinar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SITUATION B: Nenhum pedido ou encaminhamento verbalizado */}
        {activeSituation === 'sem_decisao' && (
          <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#e5eeff] shadow-sm flex flex-col gap-5">
            {/* Prescribed neutral notice */}
            <div className="p-6 rounded-2xl bg-[#eff4ff]/70 border border-[#d3e4fe] text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0284c7]/10 text-[#0284c7] flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">assignment_turned_in</span>
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#0b1c30]">
                  Nenhum pedido ou encaminhamento identificado
                </h3>
                <p className="text-[13px] text-[#45464d] mt-1 max-w-xl mx-auto leading-relaxed">
                  O médico psiquiatra não verbalizou expressamente a solicitação de exames laboratoriais nem encaminhamentos durante a consulta. Por conformidade com a <strong>Regra Inegociável nº 4</strong>, nenhum documento secundário foi gerado de forma especulativa.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#ffffff] text-[#0284c7] font-mono text-[11px] font-bold border border-[#d3e4fe] shadow-2xs">
                Salvaguarda Estrita CFM 2.314/2022 • Sem Alucinação de Conduta
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] flex flex-col gap-1">
                <span className="text-[11px] font-mono font-bold text-[#0284c7] uppercase">
                  O que acontece agora:
                </span>
                <p className="text-[12px] text-[#334155]">
                  O prontuário conterá apenas a <strong>Evolução da Consulta</strong>. Não haverá emissão indevida de guias nem acúmulo de abas secundárias vazias.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] flex flex-col gap-1">
                <span className="text-[11px] font-mono font-bold text-[#0284c7] uppercase">
                  Se o médico desejar solicitar um exame:
                </span>
                <p className="text-[12px] text-[#334155]">
                  Basta verbalizar a conduta na consulta (ex.: <em>"vou pedir litemia e hemograma"</em>) ou incluir manualmente na revisão do plano.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#e5eeff] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => onNavigate('rascunho')}
                className="px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-[12px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>Seguir para Revisão da Evolução</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* SITUATION C: Transcrição com muitos trechos incertos */}
        {activeSituation === 'trechos_incertos' && (
          <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#e5eeff] shadow-sm flex flex-col gap-5">
            <div className="p-4 rounded-xl bg-[#fffbeb] border border-[#fde68a] flex items-start gap-3 text-[#92400e]">
              <span className="material-symbols-outlined text-[24px] text-[#d97706] shrink-0 mt-0.5">
                warning
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-[14px]">
                  Transcrição com múltiplos trechos incertos identificados
                </h3>
                <p className="text-[12px] leading-relaxed">
                  Foram detectados trechos com baixa confiança acústica (devido a sobreposição de falas, tom baixo ou ruído ambiente). O assistente sinaliza formalmente para que o médico <strong>revise a transcrição antes de gerar o rascunho</strong>.
                </p>
              </div>
            </div>

            {/* List of uncertain snippets marked with text & underline */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-mono uppercase font-bold text-[#475569]">
                Trechos Sublinhados com Baixa Confiança (Aguardando Verificação):
              </span>

              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#0f172a]">Carla Mendes (08:34:02)</span>
                  <span className="text-[10px] font-mono text-[#d97706] font-bold">Confiança: 61% (Incerto)</span>
                </div>
                <div className="text-[13px] text-[#334155] p-2 bg-white rounded border border-[#e2e8f0]">
                  "Apenas nas duas primeiras semanas senti uma{' '}
                  <span className="border-b-2 border-dashed border-[#94a3b8] bg-[#f1f5f9] px-1 py-0.5 rounded text-[#475569] font-medium inline-flex items-center gap-1">
                    <span>leve sonolência à tarde</span>
                    <span className="text-[9px] font-mono text-[#64748b] bg-[#e2e8f0] px-1 rounded uppercase">
                      trecho incerto
                    </span>
                  </span>
                  , mas logo passou."
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#0f172a]">Roberto Alencar (09:17:18)</span>
                  <span className="text-[10px] font-mono text-[#d97706] font-bold">Confiança: 68% (Incerto)</span>
                </div>
                <div className="text-[13px] text-[#334155] p-2 bg-white rounded border border-[#e2e8f0]">
                  "Como o{' '}
                  <span className="border-b-2 border-dashed border-[#94a3b8] bg-[#f1f5f9] px-1 py-0.5 rounded text-[#475569] font-medium inline-flex items-center gap-1">
                    <span>estômago às vezes pesava</span>
                    <span className="text-[9px] font-mono text-[#64748b] bg-[#e2e8f0] px-1 rounded uppercase">
                      trecho incerto
                    </span>
                  </span>
                  , comecei a tomar em dias alternados."
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#e5eeff] flex items-center justify-between">
              <span className="text-[11px] text-[#64748b]">
                O médico pode confirmar o trecho verbalmente ou prosseguir com o rascunho.
              </span>
              <button
                type="button"
                onClick={() => onNavigate('atendimento')}
                className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-[12px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>Revisar Transcrição na Consulta</span>
                <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#ffffff] border-t border-[#e5eeff] px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onNavigate('fila-do-plantao')}
            className="px-4 py-2 rounded-xl border border-[#d3e4fe] bg-[#ffffff] text-[#0b1c30] text-[12px] font-bold hover:bg-[#eff4ff] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Voltar à Agenda</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('rascunho')}
            className="px-5 py-2 rounded-xl bg-[#0284c7] text-white text-[12px] font-bold hover:bg-[#0369a1] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <span>Avançar para Revisão do Rascunho</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </footer>
    </main>
  );
};
