import React, { useState, useEffect, useRef } from 'react';
import {
  PsychiatricPatient,
  ScreenId,
  TranscriptUtterance,
  ClinicalDecision,
  ClinicalAttentionPoint,
  PsychiatricHistory,
  RiskAlertData,
} from '../../types/clinical';
import {
  HISTORY_CARLA,
  HISTORY_ROBERTO,
  HISTORY_LUCIA,
  HISTORY_PAULO,
  ATTENTION_POINTS_CARLA,
  ATTENTION_POINTS_ROBERTO,
  ATTENTION_POINTS_LUCIA,
  RISK_ALERT_LUCIA,
} from '../../data/mockClinicalData';
import { SyntheticNoticeBanner } from '../SyntheticNoticeBanner';
import { RiskAlertBanner } from '../RiskAlertBanner';

interface ScreenAtendimentoTranscricaoProps {
  patient: PsychiatricPatient;
  onNavigate: (screenId: ScreenId) => void;
  onSelectCase?: (caseKey: any) => void;
  liveTranscript: TranscriptUtterance[];
  setLiveTranscript: React.Dispatch<React.SetStateAction<TranscriptUtterance[]>>;
  liveDecisions: ClinicalDecision[];
  setLiveDecisions: React.Dispatch<React.SetStateAction<ClinicalDecision[]>>;
}

export const ScreenAtendimentoTranscricao: React.FC<ScreenAtendimentoTranscricaoProps> = ({
  patient,
  onNavigate,
  liveTranscript,
  setLiveTranscript,
  liveDecisions,
  setLiveDecisions,
}) => {
  const [isRecording, setIsRecording] = useState(true);
  const [seconds, setSeconds] = useState(485); // 08:05
  const [isMicListening, setIsMicListening] = useState(false);
  const [manualUtterance, setManualUtterance] = useState('');
  const [activeSpeaker, setActiveSpeaker] = useState<'doctor' | 'patient'>('doctor');
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const transcriptBottomRef = useRef<HTMLDivElement>(null);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Select patient's history & attention points based on caseKey
  const getPatientHistory = (): PsychiatricHistory => {
    switch (patient.caseKey) {
      case 'roberto':
        return HISTORY_ROBERTO;
      case 'lucia':
        return HISTORY_LUCIA;
      case 'paulo':
        return HISTORY_PAULO;
      case 'carla':
      default:
        return HISTORY_CARLA;
    }
  };

  const getAttentionPoints = (): ClinicalAttentionPoint[] => {
    switch (patient.caseKey) {
      case 'roberto':
        return ATTENTION_POINTS_ROBERTO;
      case 'lucia':
        return ATTENTION_POINTS_LUCIA;
      case 'carla':
      default:
        return ATTENTION_POINTS_CARLA;
    }
  };

  const history = getPatientHistory();
  const attentionPoints = getAttentionPoints();

  // Check if risk alert should be shown (Case 3 Lucia or explicit risk transcript)
  const isLuciaCase = patient.caseKey === 'lucia';
  const hasRiskMention = isLuciaCase || liveTranscript.some((t) => t.isRiskMention);

  const riskData: RiskAlertData = isLuciaCase
    ? RISK_ALERT_LUCIA
    : {
        hasRisk: hasRiskMention,
        literalText: 'às vezes penso que seria melhor não acordar',
        timestamp: '14:22',
        evaluatedByDoctor: false,
        doctorEvaluationNotes: '',
      };

  // Add a verbal utterance
  const handleAddUtterance = () => {
    if (!manualUtterance.trim()) return;
    const newUtt: TranscriptUtterance = {
      id: `utt-${Date.now()}`,
      speaker: activeSpeaker === 'doctor' ? 'Dr. Roberto Guimarães' : patient.name,
      role: activeSpeaker,
      timestamp: formatTimer(seconds),
      text: manualUtterance.trim(),
    };

    setLiveTranscript((prev) => [...prev, newUtt]);
    setManualUtterance('');

    // Check if doctor verbalized an exam or referral in the input
    const lower = newUtt.text.toLowerCase();
    if (activeSpeaker === 'doctor') {
      if (lower.includes('pedir litemia') || lower.includes('exame')) {
        const newDecision: ClinicalDecision = {
          id: `dec-${Date.now()}`,
          type: 'exame',
          title: 'Pedido de Exame: Dosagem Sérica de Lítio',
          description: 'Monitoramento terapêutico solicitado pelo médico na consulta.',
          doctorUtteranceSource: `Dr. Roberto: "${newUtt.text}"`,
          timestamp: newUtt.timestamp,
          status: 'confirmado',
        };
        setLiveDecisions((prev) => [...prev, newDecision]);
      } else if (lower.includes('psicoterapia') || lower.includes('encaminhar')) {
        const newDecision: ClinicalDecision = {
          id: `dec-${Date.now()}`,
          type: 'encaminhamento',
          title: 'Encaminhamento para Psicoterapia',
          description: 'Acompanhamento psicoterápico complementar acordado.',
          doctorUtteranceSource: `Dr. Roberto: "${newUtt.text}"`,
          timestamp: newUtt.timestamp,
          status: 'confirmado',
        };
        setLiveDecisions((prev) => [...prev, newDecision]);
      }
    }

    setTimeout(() => {
      transcriptBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Real Web Speech API microphone toggle
  const toggleRealMic = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Navegador sem suporte direto à Web Speech API.');
      return;
    }

    if (isMicListening) {
      setIsMicListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsMicListening(true);
      };

      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const transcriptText = lastResult[0].transcript;
          const newUtt: TranscriptUtterance = {
            id: `mic-${Date.now()}`,
            speaker: activeSpeaker === 'doctor' ? 'Dr. Roberto Guimarães' : patient.name,
            role: activeSpeaker,
            timestamp: formatTimer(seconds),
            text: transcriptText,
          };
          setLiveTranscript((prev) => [...prev, newUtt]);
        }
      };

      recognition.onerror = () => {
        setIsMicListening(false);
      };

      recognition.onend = () => {
        setIsMicListening(false);
      };

      recognition.start();
    } catch (_) {
      setIsMicListening(false);
    }
  };

  const handleReanalyzeWithAi = () => {
    setIsReanalyzing(true);
    setTimeout(() => {
      setIsReanalyzing(false);
    }, 800);
  };

  return (
    <main className="w-full pt-20 pb-28 bg-[#f8f9ff] min-h-screen">
      {/* Fixed synthetic notice banner at top */}
      <SyntheticNoticeBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
        {/* Risk Alert Banner if Case 3 or risk mentioned */}
        {hasRiskMention && <RiskAlertBanner riskData={riskData} interactive={false} />}

        {/* Screen Header & Top Status Bar */}
        <div className="w-full bg-[#ffffff] rounded-2xl p-4 sm:p-5 border border-[#e5eeff] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#0284c7]/10 text-[#0284c7] flex items-center justify-center font-bold text-[18px] border border-[#bae6fd]">
              <span className="material-symbols-outlined text-[24px]">psychology</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[18px] font-bold text-[#0b1c30]">{patient.name}</h1>
                <span className="text-[12px] text-[#76777d]">{patient.age} anos</span>
                <span className="px-2 py-0.5 rounded-md bg-[#eff4ff] text-[#0284c7] font-mono text-[11px] font-bold">
                  {patient.type} • {patient.recordNumber}
                </span>
                <span className="text-[12px] text-[#45464d] hidden sm:inline">
                  • Última consulta: {patient.lastConsultationDate}
                </span>
              </div>
              <p className="text-[12px] text-[#45464d] mt-0.5">
                <strong>Hipótese de Acompanhamento:</strong> {patient.synopsis}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Listening Status Badge */}
            <div className="flex items-center gap-2 bg-[#f8f9ff] px-3.5 py-1.5 rounded-xl border border-[#d3e4fe]">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isRecording ? 'bg-[#10b981] animate-pulse' : 'bg-[#94a3b8]'
                }`}
              />
              <span className="text-[12px] font-mono font-bold text-[#0b1c30]">
                {isRecording ? 'Escuta Ativa' : 'Escuta Pausada'}
              </span>
              <span className="text-[12px] font-mono text-[#0284c7] font-bold pl-1 border-l border-[#d3e4fe]">
                {formatTimer(seconds)}
              </span>
            </div>

            {/* Quick Pause Button (Always visible) */}
            <button
              type="button"
              onClick={() => setIsRecording(!isRecording)}
              className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                isRecording
                  ? 'bg-[#ffffff] text-[#ba1a1a] border border-[#fca5a5] hover:bg-[#fef2f2]'
                  : 'bg-[#0284c7] text-white hover:bg-[#0369a1]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isRecording ? 'pause_circle' : 'play_circle'}
              </span>
              <span>{isRecording ? 'Pausar escuta' : 'Retomar escuta'}</span>
            </button>
          </div>
        </div>

        {/* 3 COLUMNS CLINICAL INTERFACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ============================================================ */}
          {/* COLUNA ESQUERDA (3 colunas): HISTÓRICO PSIQUIÁTRICO          */}
          {/* ============================================================ */}
          <section className="lg:col-span-3 bg-[#ffffff] rounded-2xl p-4 border border-[#e5eeff] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#e5eeff] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0284c7] text-[18px]">history_edu</span>
                <h2 className="font-bold text-[13px] text-[#0b1c30] uppercase tracking-wide">
                  Histórico do Prontuário
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#76777d]">Base Factual</span>
            </div>

            {/* 1. Medicações Registradas */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-mono uppercase font-bold text-[#475569] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">medication</span>
                Medicações Registradas
              </span>
              {history.medications.length === 0 ? (
                <span className="text-[11px] text-[#94a3b8] italic">Sem medicações cadastradas</span>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {history.medications.map((med, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#f8f9ff] border border-[#e5eeff] flex flex-col gap-0.5 text-[11px]"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-[#0f172a] text-[12px]">{med.name} {med.dosage}</strong>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#0284c7]/10 text-[#0284c7] font-bold">
                          {med.status}
                        </span>
                      </div>
                      <span className="text-[#45464d]">{med.posology}</span>
                      <span className="text-[10px] text-[#76777d] font-mono">Início: {med.startedDate}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Exames Anteriores com Data */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#f0f4fc]">
              <span className="text-[11px] font-mono uppercase font-bold text-[#475569] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">biotechnology</span>
                Exames Anteriores
              </span>
              {history.labExams.length === 0 ? (
                <span className="text-[11px] text-[#94a3b8] italic">Nenhum exame cadastrado</span>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {history.labExams.map((exam, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border flex flex-col gap-0.5 text-[11px] ${
                        exam.isOutdated
                          ? 'bg-[#fff7ed] border-[#fed7aa] text-[#9a3412]'
                          : 'bg-[#f8f9ff] border-[#e5eeff] text-[#0f172a]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{exam.name}</span>
                        {exam.isOutdated && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#fed7aa] text-[#7c2d12]">
                            DEFASADO (9 MESES)
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono">{exam.result}</span>
                      <span className="text-[10px] text-[#76777d]">Data: {exam.date} • Ref: {exam.reference}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Resumo das Últimas Consultas */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#f0f4fc]">
              <span className="text-[11px] font-mono uppercase font-bold text-[#475569] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">event_note</span>
                Evoluções Prévias
              </span>
              {history.consultations.length === 0 ? (
                <span className="text-[11px] text-[#94a3b8] italic">Primeira consulta no serviço</span>
              ) : (
                <div className="flex flex-col gap-2">
                  {history.consultations.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#f8f9ff] border border-[#e5eeff] flex flex-col gap-1 text-[11px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-mono text-[#0284c7]">{c.date}</span>
                        <span className="text-[10px] text-[#76777d]">{c.doctor}</span>
                      </div>
                      <p className="text-[#334155] leading-relaxed">{c.summary}</p>
                      <div className="text-[10px] text-[#0f172a] bg-[#ffffff] p-1.5 rounded border border-[#e2e8f0]">
                        <strong>Conduta:</strong> {c.conduct}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Pendências Registradas */}
            {history.pendingItems.length > 0 && (
              <div className="flex flex-col gap-2 pt-2 border-t border-[#f0f4fc]">
                <span className="text-[11px] font-mono uppercase font-bold text-[#475569] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">assignment_late</span>
                  Pendências do Médico
                </span>
                <div className="flex flex-col gap-1.5">
                  {history.pendingItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2 rounded-lg border text-[11px] flex flex-col gap-1 ${
                        item.resolved
                          ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0369a1]'
                          : 'bg-[#fffbeb] border-[#fde68a] text-[#92400e]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span>{item.date}</span>
                        <span className="font-bold">{item.resolved ? 'RESOLVIDO HOJE' : 'PENDENTE'}</span>
                      </div>
                      <p>{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ============================================================ */}
          {/* COLUNA CENTRAL (5 colunas): TRANSCRIÇÃO EM TEMPO REAL        */}
          {/* ============================================================ */}
          <section className="lg:col-span-5 bg-[#ffffff] rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col h-[640px]">
            {/* Header da Transcrição */}
            <div className="p-4 border-b border-[#e5eeff] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0284c7] text-[20px]">forum</span>
                <h2 className="font-bold text-[14px] text-[#0b1c30]">Transcrição da Consulta</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-[#eff4ff] text-[#0284c7] px-2 py-0.5 rounded font-semibold">
                  Diarização Automática
                </span>
              </div>
            </div>

            {/* Conversation utterances stream */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5 bg-[#fafbff]">
              {liveTranscript.map((utt) => {
                const isDoctor = utt.role === 'doctor';
                return (
                  <div
                    key={utt.id}
                    className={`flex flex-col gap-1 p-3 rounded-xl border transition-all ${
                      utt.isRiskMention
                        ? 'bg-[#fef2f2] border-2 border-[#b91c1c] text-[#7f1d1d]'
                        : isDoctor
                        ? 'bg-[#ffffff] border-[#d3e4fe] shadow-2xs'
                        : 'bg-[#f0f9ff] border-[#bae6fd] shadow-2xs'
                    }`}
                  >
                    {/* Utterance top: Speaker & timestamp */}
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] font-mono ${
                            isDoctor
                              ? 'bg-[#0284c7] text-white'
                              : 'bg-[#0369a1] text-white'
                          }`}
                        >
                          {isDoctor ? 'MÉDICO' : 'PACIENTE'}
                        </span>
                        <span className="font-semibold text-[#0f172a]">{utt.speaker}</span>
                      </div>
                      <span className="font-mono text-[#76777d] text-[10px]">{utt.timestamp}</span>
                    </div>

                    {/* Utterance text */}
                    <div className="text-[13px] text-[#1c1917] leading-relaxed mt-1">
                      {utt.isUncertain ? (
                        <span
                          className="border-b-2 border-dashed border-[#94a3b8] bg-[#f1f5f9] px-1 py-0.5 rounded text-[#475569] inline-flex items-center gap-1 cursor-help"
                          title="Trecho com baixa confiança acústica. Marcado para conferência."
                        >
                          <span>{utt.text}</span>
                          <span className="text-[9px] font-mono text-[#64748b] bg-[#e2e8f0] px-1 rounded uppercase">
                            trecho incerto
                          </span>
                        </span>
                      ) : utt.isRiskMention ? (
                        <span className="font-bold text-[#991b1b] bg-[#fee2e2] px-1.5 py-0.5 rounded border-l-2 border-[#b91c1c]">
                          "{utt.text}"
                        </span>
                      ) : (
                        utt.text
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={transcriptBottomRef} />
            </div>

            {/* Quick manual speech input / doctor addition */}
            <div className="p-3 border-t border-[#e5eeff] bg-[#ffffff] flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[#76777d]">Locutor ativo:</span>
                  <button
                    type="button"
                    onClick={() => setActiveSpeaker('doctor')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                      activeSpeaker === 'doctor'
                        ? 'bg-[#0284c7] text-white'
                        : 'bg-[#f1f5f9] text-[#475569]'
                    }`}
                  >
                    Dr. Roberto (Médico)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSpeaker('patient')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                      activeSpeaker === 'patient'
                        ? 'bg-[#0369a1] text-white'
                        : 'bg-[#f1f5f9] text-[#475569]'
                    }`}
                  >
                    {patient.name.split(' ')[0]} (Paciente)
                  </button>
                </div>

                {isMicListening && (
                  <span className="flex items-center gap-1 text-[10px] text-[#ba1a1a] font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
                    Captando microfone
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={manualUtterance}
                  onChange={(e) => setManualUtterance(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddUtterance()}
                  placeholder={
                    activeSpeaker === 'doctor'
                      ? 'Ex.: "vou te encaminhar para psicoterapia" ou "vou pedir litemia"...'
                      : 'Digite ou use o microfone para adicionar fala do paciente...'
                  }
                  className="flex-1 px-3 py-2 text-[12px] rounded-xl border border-[#d3e4fe] bg-[#f8f9ff] text-[#0b1c30] focus:outline-none focus:border-[#0284c7]"
                />
                <button
                  type="button"
                  onClick={handleAddUtterance}
                  className="px-3 py-2 bg-[#0284c7] text-white text-[12px] font-bold rounded-xl hover:bg-[#0369a1] transition-all cursor-pointer shadow-2xs"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* COLUNA DIREITA (4 colunas): PONTOS DE ATENÇÃO & DECISÕES     */}
          {/* ============================================================ */}
          <section className="lg:col-span-4 flex flex-col gap-4">
            {/* 1. Pontos de Atenção (Factuais e comparados com histórico) */}
            <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e5eeff] shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#e5eeff] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0284c7] text-[18px]">find_in_page</span>
                  <h2 className="font-bold text-[13px] text-[#0b1c30] uppercase tracking-wide">
                    Pontos de Atenção
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-[#76777d]">Comparação Factual</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {attentionPoints.map((point) => (
                  <div
                    key={point.id}
                    className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-all ${
                      point.isContradiction
                        ? 'bg-[#fff7ed] border-[#fed7aa] text-[#9a3412]'
                        : 'bg-[#eff6ff] border-[#bfdbfe] text-[#1e40af]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">
                          {point.isContradiction ? 'crisis_alert' : 'info'}
                        </span>
                        {point.isContradiction ? 'CONTRADIÇÃO IDENTIFICADA' : 'COMPARAÇÃO COM HISTÓRICO'}
                      </span>
                    </div>

                    <p className="text-[12px] font-medium leading-relaxed">
                      {point.text}
                    </p>

                    {/* Sources Badge */}
                    <div className="pt-1.5 border-t border-black/5 flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                      {point.sourceTranscription && (
                        <span className="px-1.5 py-0.2 rounded bg-white/80 border border-black/10 text-[#475569]">
                          Fonte: {point.sourceTranscription}
                        </span>
                      )}
                      {point.sourceHistory && (
                        <span className="px-1.5 py-0.2 rounded bg-white/80 border border-black/10 text-[#475569]">
                          {point.sourceHistory}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Decisões Detectadas (Apenas verbalizadas pelo médico) */}
            <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e5eeff] shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#e5eeff] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0284c7] text-[18px]">verified</span>
                  <h2 className="font-bold text-[13px] text-[#0b1c30] uppercase tracking-wide">
                    Decisões Detectadas
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-[#0284c7] bg-[#bae6fd]/30 px-1.5 py-0.5 rounded font-bold">
                  Verbalização Estrita
                </span>
              </div>

              {liveDecisions.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] text-center text-[#76777d] flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-[24px] text-[#cbd5e1]">description</span>
                  <span className="text-[12px] font-medium">Nenhum pedido ou encaminhamento identificado</span>
                  <span className="text-[10px] text-[#94a3b8]">
                    A IA só gera guias quando o médico verbaliza expressamente a decisão.
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {liveDecisions.map((dec) => (
                    <div
                      key={dec.id}
                      className="p-3 rounded-xl bg-[#f0f9ff] border border-[#bae6fd] flex flex-col gap-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[12px] text-[#0369a1] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            {dec.type === 'exame' ? 'biotechnology' : 'forward'}
                          </span>
                          {dec.title}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#bae6fd] text-[#0369a1]">
                          {dec.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#0369a1]">{dec.description}</p>
                      <div className="text-[10px] font-mono text-[#0284c7] bg-white/90 p-1.5 rounded border border-[#bae6fd]">
                        <strong>Fonte verbal do médico:</strong> {dec.doctorUtteranceSource}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Sticky Bottom Action Bar (conforme solicitado pelo usuário) */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#ffffff] border-t border-[#e5eeff] px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('fila-do-plantao')}
              className="px-4 py-2 rounded-xl border border-[#d3e4fe] bg-[#ffffff] text-[#0b1c30] text-[12px] font-bold hover:bg-[#eff4ff] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span className="hidden sm:inline">Voltar à Agenda</span>
              <span className="sm:hidden">Agenda</span>
            </button>

            {/* Real Microphone button */}
            <button
              type="button"
              onClick={toggleRealMic}
              className={`px-3 py-2 rounded-xl border text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isMicListening
                  ? 'bg-[#fee2e2] text-[#ba1a1a] border-[#fca5a5] shadow-xs'
                  : 'bg-[#ffffff] text-[#475569] border-[#d3e4fe] hover:bg-[#eff4ff]'
              }`}
              title="Ativar reconhecimento de voz do microfone no navegador"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isMicListening ? 'mic' : 'mic_none'}
              </span>
              <span className="hidden md:inline">
                {isMicListening ? 'Desligar Microfone Real' : 'Ligar Microfone Real'}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Reanalyze with AI */}
            <button
              type="button"
              onClick={handleReanalyzeWithAi}
              disabled={isReanalyzing}
              className="px-3.5 py-2 rounded-xl border border-[#d3e4fe] bg-[#ffffff] text-[#0284c7] text-[12px] font-bold hover:bg-[#eff4ff] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className={`material-symbols-outlined text-[16px] ${isReanalyzing ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span className="hidden sm:inline">
                {isReanalyzing ? 'Reanalisando...' : 'Reanalisar com IA'}
              </span>
            </button>

            {/* Pause / Resume Button */}
            <button
              type="button"
              onClick={() => setIsRecording(!isRecording)}
              className={`px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isRecording
                  ? 'bg-[#fff1f2] text-[#ba1a1a] border border-[#fecdd3] hover:bg-[#ffe4e6]'
                  : 'bg-[#f0f9ff] text-[#0284c7] border border-[#bae6fd] hover:bg-[#e0f2fe]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isRecording ? 'pause' : 'play_arrow'}
              </span>
              <span>{isRecording ? 'Pausar escuta' : 'Retomar escuta'}</span>
            </button>

            {/* End and Generate Draft */}
            <button
              type="button"
              onClick={() => onNavigate('rascunho')}
              className="px-5 py-2 rounded-xl bg-[#0284c7] text-white text-[12px] font-bold hover:bg-[#0369a1] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span>Encerrar e gerar rascunho</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
};
