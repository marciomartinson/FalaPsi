import React, { useState } from 'react';
import {
  PsychiatricPatient,
  ScreenId,
  PsychiatricEvolutionDraft,
  DraftField,
  RiskAlertData,
  ClinicalDecision,
  TranscriptUtterance,
} from '../../types/clinical';
import {
  EVOLUTION_DRAFT_CARLA,
  EVOLUTION_DRAFT_ROBERTO,
  EVOLUTION_DRAFT_LUCIA,
  RISK_ALERT_LUCIA,
  DECISIONS_CARLA,
  DECISIONS_ROBERTO,
  TRANSCRIPT_CARLA,
  TRANSCRIPT_ROBERTO,
  TRANSCRIPT_LUCIA,
} from '../../data/mockClinicalData';
import { SyntheticNoticeBanner } from '../SyntheticNoticeBanner';
import { RiskAlertBanner } from '../RiskAlertBanner';

interface ScreenRevisaoRascunhoProps {
  currentPatient: PsychiatricPatient;
  onNavigate: (screenId: ScreenId) => void;
  onOpenPrintGuidesModal?: () => void;
  onSelectCase?: (caseKey: any) => void;
}

export const ScreenRevisaoRascunho: React.FC<ScreenRevisaoRascunhoProps> = ({
  currentPatient,
  onNavigate,
  onOpenPrintGuidesModal,
}) => {
  // Select baseline draft based on patient
  const getInitialDraft = (): PsychiatricEvolutionDraft => {
    switch (currentPatient.caseKey) {
      case 'roberto':
        return JSON.parse(JSON.stringify(EVOLUTION_DRAFT_ROBERTO));
      case 'lucia':
        return JSON.parse(JSON.stringify(EVOLUTION_DRAFT_LUCIA));
      case 'carla':
      default:
        return JSON.parse(JSON.stringify(EVOLUTION_DRAFT_CARLA));
    }
  };

  const getDecisions = (): ClinicalDecision[] => {
    switch (currentPatient.caseKey) {
      case 'roberto':
        return DECISIONS_ROBERTO;
      case 'carla':
        return DECISIONS_CARLA;
      default:
        return [];
    }
  };

  const getTranscript = (): TranscriptUtterance[] => {
    switch (currentPatient.caseKey) {
      case 'roberto':
        return TRANSCRIPT_ROBERTO;
      case 'lucia':
        return TRANSCRIPT_LUCIA;
      case 'carla':
      default:
        return TRANSCRIPT_CARLA;
    }
  };

  const [draft, setDraft] = useState<PsychiatricEvolutionDraft>(getInitialDraft);
  const [activeTab, setActiveTab] = useState<'evolucao' | 'exames' | 'encaminhamentos'>('evolucao');
  const [activeCitationSource, setActiveCitationSource] = useState<{
    title: string;
    text: string;
    timestamp?: string;
    date?: string;
  } | null>({
    title: 'Relato do Paciente',
    text: draft.patientReport.sourceText || '',
    timestamp: draft.patientReport.sourceTimestamp,
  });

  // Risk state for Lucia or any risk mention
  const isLuciaCase = currentPatient.caseKey === 'lucia';
  const [riskData, setRiskData] = useState<RiskAlertData>(
    isLuciaCase
      ? { ...RISK_ALERT_LUCIA }
      : {
          hasRisk: false,
          literalText: '',
          timestamp: '',
          evaluatedByDoctor: true,
          doctorEvaluationNotes: '',
        }
  );

  // Field editing state
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Contradiction resolution state (for Roberto's adherence)
  const [contradictionChoice, setContradictionChoice] = useState<'patient' | 'history' | 'custom' | null>(null);

  const decisions = getDecisions();
  const examDecisions = decisions.filter((d) => d.type === 'exame');
  const referralDecisions = decisions.filter((d) => d.type === 'encaminhamento');
  const transcript = getTranscript();

  // Helper to update a field in draft
  const updateField = (fieldKey: keyof PsychiatricEvolutionDraft, updates: Partial<DraftField>) => {
    setDraft((prev) => ({
      ...prev,
      [fieldKey]: {
        ...prev[fieldKey],
        ...updates,
      },
    }));
  };

  // Check signing requirements
  // 1. Risk must be evaluated if present
  const isRiskResolved = !riskData.hasRisk || (riskData.evaluatedByDoctor && riskData.doctorEvaluationNotes.trim().length > 3);

  // 2. Doctor-exclusive fields (EEM and HD) must have content provided by the doctor
  const isEemFilled = !!(draft.mentalStatusExam.doctorEditedValue || draft.mentalStatusExam.value);
  const isHdFilled = !!(draft.diagnosticHypothesis.doctorEditedValue || draft.diagnosticHypothesis.value);

  // 3. Contradiction must be resolved if present (Roberto)
  const isContradictionResolved =
    draft.treatmentAdherence.status !== 'contraditorio' ||
    contradictionChoice !== null ||
    draft.treatmentAdherence.actionState === 'aceito' ||
    draft.treatmentAdherence.actionState === 'editado';

  const blockingIssues: string[] = [];
  if (!isRiskResolved) {
    blockingIssues.push('Menção a risco não avaliada (Marque "Avaliei este trecho" e digite a avaliação clínica).');
  }
  if (!isEemFilled) {
    blockingIssues.push('Exame do Estado Mental vazio (Preenchimento exclusivo do médico psiquiatra pendente).');
  }
  if (!isHdFilled) {
    blockingIssues.push('Hipótese Diagnóstica vazia (Preenchimento exclusivo do médico psiquiatra pendente).');
  }
  if (!isContradictionResolved) {
    blockingIssues.push('Contradição factual na adesão pendente de confirmação pelo médico.');
  }

  const isReadyToSign = blockingIssues.length === 0;

  // Quick filler for demo testing
  const handleQuickFillDoctorFields = () => {
    updateField('mentalStatusExam', {
      value: 'Paciente vígil, lúcido e orientado globalmente. Afeto congruente e modulado. Discurso com ritmo e fluxo adequados, sem alterações no curso do pensamento ou alterações sensoperceptivas. Crítica do estado mórbido preservada.',
      doctorEditedValue: 'Paciente vígil, lúcido e orientado globalmente. Afeto congruente e modulado. Discurso com ritmo e fluxo adequados, sem alterações no curso do pensamento ou alterações sensoperceptivas. Crítica do estado mórbido preservada.',
      actionState: 'aceito',
    });
    updateField('diagnosticHypothesis', {
      value: currentPatient.caseKey === 'roberto'
        ? 'F31.0 - Transtorno afetivo bipolar, episódio atual hipomaníaco em remissão / manutenção com estabilizador do humor.'
        : currentPatient.caseKey === 'lucia'
        ? 'F32.2 - Episódio depressivo grave sem sintomas psicóticos.'
        : 'F33.0 - Transtorno depressivo recorrente, episódio atual leve em remissão.',
      doctorEditedValue: currentPatient.caseKey === 'roberto'
        ? 'F31.0 - Transtorno afetivo bipolar, episódio atual hipomaníaco em remissão / manutenção com estabilizador do humor.'
        : currentPatient.caseKey === 'lucia'
        ? 'F32.2 - Episódio depressivo grave sem sintomas psicóticos.'
        : 'F33.0 - Transtorno depressivo recorrente, episódio atual leve em remissão.',
      actionState: 'aceito',
    });

    if (currentPatient.caseKey === 'roberto') {
      setContradictionChoice('patient');
      updateField('treatmentAdherence', {
        actionState: 'aceito',
        doctorEditedValue: 'Paciente verbalizou tomada em dias alternados por conta própria no último mês. Orientado enfaticamente sobre a necessidade de uso diário do Lítio.',
      });
    }

    if (currentPatient.caseKey === 'lucia') {
      setRiskData((prev) => ({
        ...prev,
        evaluatedByDoctor: true,
        doctorEvaluationNotes: 'Ideação passiva de morte decorrente do esgotamento depressivo. Sem intencionalidade ou planejamento atual. Forte suporte protetor pelos filhos pequenos. Mantida rede de apoio e pactuado contato imediato se agravamento.',
      }));
    }
  };

  const handleSignDocument = () => {
    if (!isReadyToSign) return;
    onNavigate('auditoria');
  };

  // Render a field in the Evolution draft
  const renderFieldCard = (
    fieldKey: keyof PsychiatricEvolutionDraft,
    field: DraftField
  ) => {
    const isEditing = editingFieldId === field.id;
    const isExclusive = field.isDoctorExclusive;
    const isContradiction = field.status === 'contraditorio';
    const isBlocked = field.status === 'bloqueado';
    const isBlockedSuggestion = field.status === 'sugestao_bloqueada';
    const displayValue = field.doctorEditedValue || field.value;

    return (
      <div
        key={field.id}
        className={`p-4 rounded-2xl border transition-all ${
          isContradiction
            ? 'bg-[#fffaf0] border-[#fed7aa] shadow-xs'
            : isBlockedSuggestion
            ? 'bg-[#fef2f2]/60 border-[#fecaca]'
            : isBlocked && !displayValue
            ? 'bg-[#f8fafc] border-[#cbd5e1]'
            : 'bg-[#ffffff] border-[#e5eeff] shadow-xs hover:border-[#bae6fd]'
        }`}
      >
        {/* Field Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f1f5f9] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[14px] text-[#0f172a]">{field.title}</span>
            {field.actionState && (
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                  field.actionState === 'aceito'
                    ? 'bg-[#e0f2fe] text-[#0369a1]'
                    : field.actionState === 'editado'
                    ? 'bg-[#e0f2fe] text-[#0369a1]'
                    : 'bg-[#fee2e2] text-[#b91c1c]'
                }`}
              >
                {field.actionState}
              </span>
            )}
          </div>

          {/* Status Badge (Textual & Explicit) */}
          <div className="flex items-center gap-2">
            {isBlockedSuggestion ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fecaca] text-[#991b1b] text-[11px] font-mono font-bold">
                <span className="material-symbols-outlined text-[13px]">block</span>
                Sugestão bloqueada por falta de evidência
              </span>
            ) : isBlocked && !displayValue ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569] text-[11px] font-mono font-bold border border-[#cbd5e1]">
                <span className="material-symbols-outlined text-[13px]">lock</span>
                Bloqueado: Preenchimento exclusivo do médico
              </span>
            ) : isContradiction ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fed7aa] text-[#9a3412] text-[11px] font-mono font-bold">
                <span className="material-symbols-outlined text-[13px]">compare_arrows</span>
                Contraditório (Duas fontes divergentes)
              </span>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setActiveCitationSource({
                    title: field.title,
                    text: field.sourceText || '',
                    timestamp: field.sourceTimestamp,
                    date: field.sourceHistoryDate,
                  })
                }
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f0f9ff] text-[#0284c7] text-[11px] font-mono font-bold hover:bg-[#e0f2fe] transition-all cursor-pointer border border-[#bae6fd]"
              >
                <span className="material-symbols-outlined text-[13px]">link</span>
                Com fonte verificável
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="py-3">
          {isBlockedSuggestion && (
            <div className="p-3 rounded-xl bg-[#fee2e2]/60 border border-[#fca5a5] flex flex-col gap-1.5 mb-3">
              <span className="text-[11px] font-mono font-bold text-[#991b1b] uppercase">
                Tentativa de inferência bloqueada e riscada:
              </span>
              <p className="text-[13px] text-[#7f1d1d] line-through italic">
                "{field.blockedSuggestionText}"
              </p>
              <span className="text-[11px] text-[#991b1b]">
                <strong>Motivo do bloqueio:</strong> {field.blockedReason}
              </span>
            </div>
          )}

          {isContradiction && field.contradictionSourceA && field.contradictionSourceB && (
            <div className="p-3.5 rounded-xl bg-[#fff7ed] border border-[#fdba74] flex flex-col gap-2.5 mb-3">
              <span className="text-[11px] font-mono font-bold text-[#c2410c] uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">crisis_alert</span>
                Fontes em contradição factual direta lado a lado:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-2.5 bg-white rounded-lg border border-[#fed7aa] flex flex-col gap-1">
                  <span className="text-[10px] font-mono font-bold text-[#9a3412]">
                    Fonte 1: {field.contradictionSourceA.label}
                  </span>
                  <p className="text-[12px] text-[#0f172a] italic">
                    "{field.contradictionSourceA.text}"
                  </p>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-[#fed7aa] flex flex-col gap-1">
                  <span className="text-[10px] font-mono font-bold text-[#9a3412]">
                    Fonte 2: {field.contradictionSourceB.label}
                  </span>
                  <p className="text-[12px] text-[#0f172a] italic">
                    "{field.contradictionSourceB.text}"
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-[#9a3412]">Resolução do Médico:</span>
                <button
                  type="button"
                  onClick={() => {
                    setContradictionChoice('patient');
                    updateField(fieldKey, {
                      doctorEditedValue: 'Adesão irregular: Paciente refere uso em dias alternados por decisão própria. Orientado sobre risco de recaída e necessidade de uso diário contínuo.',
                      actionState: 'editado',
                    });
                  }}
                  className="px-2 py-1 rounded bg-[#ffffff] border border-[#fed7aa] text-[11px] font-bold text-[#9a3412] hover:bg-[#ffedd5] cursor-pointer"
                >
                  Registrar Adesão Irregular Relatada
                </button>
              </div>
            </div>
          )}

          {/* Regular Field Editing or Display */}
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl border border-[#0284c7] bg-white text-[13px] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0284c7]/30"
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingFieldId(null)}
                  className="px-3 py-1 rounded-lg border border-[#cbd5e1] text-[11px] font-bold text-[#475569] hover:bg-[#f1f5f9] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateField(fieldKey, {
                      doctorEditedValue: editValue,
                      actionState: 'editado',
                    });
                    setEditingFieldId(null);
                  }}
                  className="px-3 py-1 rounded-lg bg-[#0284c7] text-[11px] font-bold text-white hover:bg-[#0369a1] cursor-pointer"
                >
                  Salvar Edição
                </button>
              </div>
            </div>
          ) : (
            <div>
              {displayValue ? (
                <p className="text-[13px] text-[#1c1917] leading-relaxed font-normal">
                  {displayValue}
                </p>
              ) : isExclusive ? (
                <div className="p-3 rounded-xl bg-[#f8fafc] border border-dashed border-[#94a3b8] text-center flex flex-col items-center gap-1">
                  <span className="text-[12px] font-semibold text-[#475569]">
                    [Campo Vazio • Preenchimento Exclusivo do Médico]
                  </span>
                  <span className="text-[11px] text-[#64748b]">
                    {field.blockedReason}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFieldId(field.id);
                      setEditValue('');
                    }}
                    className="mt-1 px-3 py-1 bg-[#0284c7] text-white rounded-lg text-[11px] font-bold hover:bg-[#0369a1] cursor-pointer"
                  >
                    + Preencher este campo agora
                  </button>
                </div>
              ) : (
                <span className="text-[12px] text-[#94a3b8] italic">Campo sem informações</span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons Row: Aceitar, Editar, Ignorar */}
        <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {field.sourceText && (
              <button
                type="button"
                onClick={() =>
                  setActiveCitationSource({
                    title: field.title,
                    text: field.sourceText || '',
                    timestamp: field.sourceTimestamp,
                    date: field.sourceHistoryDate,
                  })
                }
                className="text-[11px] font-mono text-[#0284c7] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">visibility</span>
                <span>Ver evidência exata</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateField(fieldKey, { actionState: 'aceito' })}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                field.actionState === 'aceito'
                  ? 'bg-[#dcfce7] text-[#15803d]'
                  : 'bg-[#f8f9ff] hover:bg-[#f1f5f9] text-[#334155]'
              }`}
            >
              Aceitar
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingFieldId(field.id);
                setEditValue(displayValue || '');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                field.actionState === 'editado'
                  ? 'bg-[#e0f2fe] text-[#0369a1]'
                  : 'bg-[#f8f9ff] hover:bg-[#f1f5f9] text-[#334155]'
              }`}
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => updateField(fieldKey, { actionState: 'ignorado' })}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                field.actionState === 'ignorado'
                  ? 'bg-[#fee2e2] text-[#b91c1c]'
                  : 'bg-[#f8f9ff] hover:bg-[#f1f5f9] text-[#334155]'
              }`}
            >
              Ignorar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="w-full pt-20 pb-32 bg-[#f8f9ff] min-h-screen">
      {/* Synthetic Notice Fixed Banner */}
      <SyntheticNoticeBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
        {/* Risk Alert Component (Mandatory if Case 3 or risk detected) */}
        {riskData.hasRisk && (
          <RiskAlertBanner
            riskData={riskData}
            interactive={true}
            onToggleEvaluated={(evaluated) =>
              setRiskData((prev) => ({ ...prev, evaluatedByDoctor: evaluated }))
            }
            onUpdateEvaluationNotes={(notes) =>
              setRiskData((prev) => ({ ...prev, doctorEvaluationNotes: notes }))
            }
          />
        )}

        {/* Patient Header Card */}
        <div className="w-full bg-[#ffffff] rounded-2xl p-4 sm:p-5 border border-[#e5eeff] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#0284c7]/10 text-[#0284c7] flex items-center justify-center font-bold text-[18px] border border-[#bae6fd]">
              <span className="material-symbols-outlined text-[24px]">assignment</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-[#0284c7] text-white font-mono text-[11px] font-bold">
                  PSI
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-mono bg-[#bae6fd] text-[#0369a1] font-bold">
                  Evolução
                </span>
                <h1 className="text-[18px] font-bold text-[#0b1c30]">Revisão da Documentação Clínica</h1>
                <span className="text-[12px] text-[#76777d]">
                  {currentPatient.name} ({currentPatient.age} anos)
                </span>
                <span className="font-mono text-[11px] text-[#0284c7] bg-[#eff4ff] px-2 py-0.5 rounded">
                  {currentPatient.recordNumber}
                </span>
              </div>
              <p className="text-[12px] text-[#45464d] mt-0.5">
                Revise o rascunho de evolução campo a campo. Valide as fontes na transcrição e preencha os campos exclusivos antes de assinar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
            {/* Quick Demo Pre-filler Button for fast review */}
            <button
              type="button"
              onClick={handleQuickFillDoctorFields}
              className="px-3 py-1.5 rounded-xl bg-[#eff4ff] hover:bg-[#d8e8fe] text-[#0284c7] border border-[#d3e4fe] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
              title="Preenche campos exclusivos do médico para demonstração rápida de assinatura"
            >
              <span className="material-symbols-outlined text-[15px]">auto_fix_high</span>
              <span>Preencher Campos Médicos (Demo)</span>
            </button>
          </div>
        </div>

        {/* Document Navigation Tabs: Evolução da Consulta + Guias Secundárias Detectadas */}
        <div className="flex items-center gap-2 border-b border-[#e5eeff] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('evolucao')}
            className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'evolucao'
                ? 'bg-[#0284c7] text-white shadow-xs'
                : 'bg-white text-[#475569] hover:bg-[#eff4ff] border border-[#e5eeff]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">clinical_notes</span>
            <span>Evolução da Consulta</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/20">
              Principal
            </span>
          </button>

          {examDecisions.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('exames')}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'exames'
                  ? 'bg-[#0284c7] text-white shadow-xs'
                  : 'bg-white text-[#475569] hover:bg-[#eff4ff] border border-[#e5eeff]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">biotechnology</span>
              <span>Pedido de Exame ({examDecisions.length})</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#e0f2fe] text-[#0369a1]">
                Detectado
              </span>
            </button>
          )}

          {referralDecisions.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('encaminhamentos')}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'encaminhamentos'
                  ? 'bg-[#0284c7] text-white shadow-xs'
                  : 'bg-white text-[#475569] hover:bg-[#eff4ff] border border-[#e5eeff]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">forward</span>
              <span>Encaminhamento ({referralDecisions.length})</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#e0f2fe] text-[#0369a1]">
                Detectado
              </span>
            </button>
          )}
        </div>

        {/* MAIN BODY: Two Columns (Review fields on Left + Source Citation Inspector on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: Clinical Form (8 columns) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {activeTab === 'evolucao' && (
              <div className="flex flex-col gap-4">
                {/* 1. Relato do paciente */}
                {renderFieldCard('patientReport', draft.patientReport)}

                {/* 2. Mudanças desde a última consulta */}
                {renderFieldCard('changesSinceLastConsultation', draft.changesSinceLastConsultation)}

                {/* 3. Adesão ao tratamento relatada */}
                {renderFieldCard('treatmentAdherence', draft.treatmentAdherence)}

                {/* 4. Efeitos adversos relatados */}
                {renderFieldCard('adverseEffects', draft.adverseEffects)}

                {/* 5. Exame do estado mental (Exclusivo do médico) */}
                {renderFieldCard('mentalStatusExam', draft.mentalStatusExam)}

                {/* 6. Hipótese diagnóstica (Exclusivo do médico) */}
                {renderFieldCard('diagnosticHypothesis', draft.diagnosticHypothesis)}

                {/* 7. Plano informado pelo médico */}
                {renderFieldCard('planAnnouncedByDoctor', draft.planAnnouncedByDoctor)}
              </div>
            )}

            {activeTab === 'exames' && (
              <div className="bg-[#ffffff] p-5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-[#e5eeff] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0284c7] text-[22px]">biotechnology</span>
                    <h2 className="font-bold text-[16px] text-[#0f172a]">Pedido de Exames Complementares</h2>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#f0f9ff] text-[#0369a1] text-[11px] font-mono font-bold border border-[#bae6fd]">
                    Decisão Verbalizada
                  </span>
                </div>

                {examDecisions.map((dec) => (
                  <div key={dec.id} className="p-4 rounded-xl bg-[#f8f9ff] border border-[#d3e4fe] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-[14px] text-[#0b1c30]">{dec.title}</strong>
                      <span className="text-[11px] font-mono text-[#76777d]">{dec.timestamp}</span>
                    </div>
                    <p className="text-[12px] text-[#334155]">{dec.description}</p>
                    <div className="p-2 bg-white rounded border border-[#e2e8f0] text-[11px] font-mono text-[#0284c7]">
                      <strong>Fonte verbal do médico:</strong> {dec.doctorUtteranceSource}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'encaminhamentos' && (
              <div className="bg-[#ffffff] p-5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-[#e5eeff] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0284c7] text-[22px]">forward</span>
                    <h2 className="font-bold text-[16px] text-[#0f172a]">Guia de Encaminhamento</h2>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#f0f9ff] text-[#0369a1] text-[11px] font-mono font-bold border border-[#bae6fd]">
                    Decisão Verbalizada
                  </span>
                </div>

                {referralDecisions.map((dec) => (
                  <div key={dec.id} className="p-4 rounded-xl bg-[#f8f9ff] border border-[#d3e4fe] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-[14px] text-[#0b1c30]">{dec.title}</strong>
                      <span className="text-[11px] font-mono text-[#76777d]">{dec.timestamp}</span>
                    </div>
                    <p className="text-[12px] text-[#334155]">{dec.description}</p>
                    <div className="p-2 bg-white rounded border border-[#e2e8f0] text-[11px] font-mono text-[#0284c7]">
                      <strong>Fonte verbal do médico:</strong> {dec.doctorUtteranceSource}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Source Inspector Panel (4 columns) */}
          <aside className="lg:col-span-4 bg-[#ffffff] rounded-2xl p-4 border border-[#e5eeff] shadow-xs flex flex-col gap-4 sticky top-24">
            <div className="flex items-center justify-between border-b border-[#e5eeff] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0284c7] text-[18px]">verified</span>
                <h3 className="font-bold text-[13px] text-[#0b1c30] uppercase tracking-wide">
                  Painel de Fontes & Evidências
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#76777d]">Auditabilidade</span>
            </div>

            {activeCitationSource ? (
              <div className="flex flex-col gap-3">
                <div className="p-3.5 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#1e40af]">{activeCitationSource.title}</span>
                    {activeCitationSource.timestamp && (
                      <span className="font-mono text-[#2563eb] font-bold">
                        {activeCitationSource.timestamp}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#1e3a8a] italic bg-white p-2.5 rounded-lg border border-[#bfdbfe]">
                    "{activeCitationSource.text}"
                  </p>
                  {activeCitationSource.date && (
                    <span className="text-[10px] font-mono text-[#475569]">
                      Data no Prontuário: {activeCitationSource.date}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-[#76777d] text-[12px] italic">
                Clique em "Com fonte verificável" ou em qualquer evidência para inspecionar o trecho exato no histórico.
              </div>
            )}

            {/* Transcript Timeline Preview */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#f0f4fc]">
              <span className="text-[11px] font-mono uppercase font-bold text-[#475569]">
                Trechos da Consulta:
              </span>
              <div className="max-h-64 overflow-y-auto flex flex-col gap-2 pr-1">
                {transcript.map((utt) => (
                  <div
                    key={utt.id}
                    className={`p-2 rounded-lg text-[11px] border ${
                      utt.role === 'doctor'
                        ? 'bg-[#ffffff] border-[#e2e8f0]'
                        : 'bg-[#f0fdf4] border-[#bbf7d0]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#64748b]">
                      <span className="font-bold text-[#0f172a]">{utt.speaker}</span>
                      <span>{utt.timestamp}</span>
                    </div>
                    <p className="mt-0.5 text-[#334155]">{utt.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#ffffff] border-t border-[#e5eeff] px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('fila-do-plantao')}
              className="px-3.5 py-2 rounded-xl border border-[#d3e4fe] bg-[#ffffff] text-[#0b1c30] text-[12px] font-bold hover:bg-[#eff4ff] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Voltar à Agenda</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('atendimento')}
              className="px-3 py-2 rounded-xl border border-[#d3e4fe] bg-[#ffffff] text-[#475569] text-[12px] font-bold hover:bg-[#eff4ff] transition-all cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
              <span className="hidden sm:inline">Voltar à Consulta</span>
            </button>

            {(examDecisions.length > 0 || referralDecisions.length > 0) && onOpenPrintGuidesModal && (
              <button
                type="button"
                onClick={onOpenPrintGuidesModal}
                className="px-3 py-2 rounded-xl border border-[#d3e4fe] bg-[#eff4ff] text-[#0284c7] text-[12px] font-bold hover:bg-[#d8e8fe] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Visualizar / Emitir Guias</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* If blocked, show clear explanation */}
            {!isReadyToSign && (
              <div className="text-[11px] font-mono text-[#ba1a1a] flex items-center gap-1.5 bg-[#fef2f2] px-3 py-1.5 rounded-lg border border-[#fca5a5]">
                <span className="material-symbols-outlined text-[15px]">lock</span>
                <span>{blockingIssues.length} pendência(s) obrigatória(s) antes de assinar</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSignDocument}
              disabled={!isReadyToSign}
              className={`px-6 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                isReadyToSign
                  ? 'bg-[#0284c7] hover:bg-[#0369a1] text-white ring-2 ring-[#0284c7]/20'
                  : 'bg-[#cbd5e1] text-[#64748b] cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Assinar Documento (Médico)</span>
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
};
