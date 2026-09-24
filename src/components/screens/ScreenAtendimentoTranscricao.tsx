import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PsychiatricPatient,
  ScreenId,
  TranscriptUtterance,
  ClinicalDecision,
} from '../../types/clinical';
import {
  TRANSCRIPT_CARLA,
  DECISIONS_CARLA,
} from '../../data/mockClinicalData';

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
  // Timer starting at 03:45 (225 seconds) exactly as in Fala Saúde original
  const [seconds, setSeconds] = useState(225);
  const [isPaused, setIsPaused] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isListeningMic, setIsListeningMic] = useState(false);
  const transcriptBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Timer: increments every second when not paused
  useEffect(() => {
    let interval: any = null;
    if (!isPaused) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  // Format seconds to MM:SS
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Toggle Pause / Resume
  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
    if (isListeningMic && !isPaused) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setIsListeningMic(false);
    }
  };

  // Append a new utterance to the transcript
  const handleAddUtterance = (text: string, role: 'doctor' | 'patient' = 'doctor') => {
    if (!text || !text.trim()) return;
    const clean = text.trim();
    const isDoc = role === 'doctor';
    const speakerName = isDoc ? 'Dr. Marcelo Ribeiro' : (patient.name || 'Carlos (Paciente)');

    const newUtt: TranscriptUtterance = {
      id: `utt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      speaker: speakerName,
      role: role,
      timestamp: formatTimer(seconds),
      text: clean,
      confidence: '100% (Verbalizado)',
    };

    setLiveTranscript((prev) => [...prev, newUtt]);

    // Check if doctor verbalized a clinical decision
    if (isDoc) {
      const lower = clean.toLowerCase();
      if (lower.includes('raio-x') || lower.includes('exame') || lower.includes('radiografia')) {
        const hasExam = liveDecisions.some((d) => d.title.toLowerCase().includes('raio-x'));
        if (!hasExam) {
          setLiveDecisions((prev) => [
            ...prev,
            {
              id: `dec-exam-${Date.now()}`,
              type: 'exame',
              title: 'Raio-X de Tornozelo Direito (AP e Perfil)',
              description: 'Regra Ottawa: Dor em maléolo lateral e incapacidade de sustentar peso.',
              doctorUtteranceSource: clean,
              timestamp: formatTimer(seconds),
              status: 'confirmado',
            },
          ]);
        }
      }
      if (lower.includes('ortopedia') || lower.includes('encaminhar') || lower.includes('especialista')) {
        const hasEnc = liveDecisions.some((d) => d.title.toLowerCase().includes('ortopedia'));
        if (!hasEnc) {
          setLiveDecisions((prev) => [
            ...prev,
            {
              id: `dec-enc-${Date.now()}`,
              type: 'encaminhamento',
              title: 'Ortopedia e Traumatologia',
              description: 'Avaliação pós-imagem e imobilização provisória (tala gessada).',
              doctorUtteranceSource: clean,
              timestamp: formatTimer(seconds),
              status: 'confirmado',
            },
          ]);
        }
      }
    }

    setTimeout(() => {
      transcriptBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  // Optional seamless microphone dictation (without any error banners)
  const handleToggleMic = () => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      return;
    }

    if (isListeningMic) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setIsListeningMic(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';

      recognition.onstart = () => {
        setIsListeningMic(true);
      };

      recognition.onresult = (event: any) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            handleAddUtterance(transcript, 'doctor');
          }
        }
      };

      recognition.onerror = () => {
        setIsListeningMic(false);
      };

      recognition.onend = () => {
        setIsListeningMic(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (_) {
      setIsListeningMic(false);
    }
  };

  // Pre-fill transcript if empty
  const defaultDialogue = [
    {
      id: 'fs-1',
      speaker: 'Dr. Marcelo Ribeiro',
      role: 'doctor' as const,
      timestamp: '00:12',
      text: 'Boa tarde, Carlos. Me conte o que aconteceu com seu tornozelo.',
      avatar: 'M',
    },
    {
      id: 'fs-2',
      speaker: 'Carlos (Paciente)',
      role: 'patient' as const,
      timestamp: '00:25',
      text: 'Doutor, pisei de mau jeito numa dividida no futebol. Deu um estalo alto e na hora inchou muito. Não consigo nem colocar o pé no chão.',
      avatar: 'C',
    },
    {
      id: 'fs-3',
      speaker: 'Dr. Marcelo Ribeiro',
      role: 'doctor' as const,
      timestamp: '01:05',
      text: 'Vou palpar aqui... dói nesta proeminência do maléolo lateral?',
      avatar: 'M',
    },
    {
      id: 'fs-4',
      speaker: 'Carlos (Paciente)',
      role: 'patient' as const,
      timestamp: '01:14',
      text: 'Ai, sim! Dói demais exatamente aí.',
      avatar: 'C',
    },
    {
      id: 'fs-5',
      speaker: 'Carlos (Paciente)',
      role: 'patient' as const,
      timestamp: '01:42',
      text: '...então eu caí de lado e senti um no ligamento...',
      isUncertain: true,
      badge: 'Ruído atenuado',
      avatar: 'C',
    },
    {
      id: 'fs-6',
      speaker: 'Dr. Marcelo Ribeiro',
      role: 'doctor' as const,
      timestamp: '02:30',
      text: 'Você tem alguma alergia a medicamentos, como analgésicos ou anti-inflamatórios?',
      avatar: 'M',
    },
    {
      id: 'fs-7',
      speaker: 'Carlos (Paciente)',
      role: 'patient' as const,
      timestamp: '02:40',
      text: 'Não, doutor. Que eu saiba nunca tive reação a nada.',
      avatar: 'C',
    },
    {
      id: 'fs-8',
      speaker: 'Dr. Marcelo Ribeiro',
      role: 'doctor' as const,
      timestamp: '03:15',
      text: 'Perfeito. Carlos, vou pedir um raio-X do tornozelo direito e te encaminhar para avaliação da ortopedia com imobilização provisória.',
      avatar: 'M',
    },
  ];

  const currentDialogue = liveTranscript.length > 0 ? liveTranscript : defaultDialogue;

  return (
    <main className="w-full pt-20 bg-[#f8f9ff] min-h-[calc(100vh-4rem)] font-sans">
      <div className="flex flex-col w-full">
        {/* ============================================================ */}
        {/* TOP PATIENT BAR (FALA SAÚDE ORIGINAL)                        */}
        {/* ============================================================ */}
        <div className="w-full px-6 lg:px-10 py-3 bg-white flex flex-col gap-2 border-b border-[#e5eeff]">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="w-12 h-12 rounded-xl bg-[#dce9ff] text-[#006a61] flex items-center justify-center font-bold text-lg">
                CM
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-[#0b1c30]">Carlos Eduardo Mendes</h1>
                  <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#45464d] text-xs">
                    34 anos (22/08/1990)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#006a61] text-xs font-semibold">
                    Prontuário #492.019
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[#45464d] text-xs font-mono mt-1">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#006a61]">schedule</span>
                    Início: 14:22:10
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#0b1c30] font-semibold">
                    <span className="material-symbols-outlined text-[15px] text-[#006a61]">timer</span>
                    Duração: <span className="font-mono">{formatTimer(seconds)}</span>
                  </span>
                  <span>•</span>
                  <span className="hidden sm:inline">Ortopedia Geral • Box 04</span>
                </div>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto justify-end">
              {/* Escuta Ativa Badge with Equalizer */}
              <div className="flex items-center gap-3 px-3.5 py-1.5 bg-[#eff4ff] rounded-full border border-[#d3e4fe]">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      !isPaused ? 'bg-[#006a61] animate-pulse' : 'bg-[#94a3b8]'
                    }`}
                  />
                  <span className="text-xs text-[#006a61] font-bold uppercase tracking-wider">
                    {!isPaused ? 'Escuta Ativa' : 'Escuta Pausada'}
                  </span>
                </div>
                <div className="h-3 w-px bg-[#c6c6cd] opacity-60" />
                <div className="flex items-center gap-1.5" title="Microfone Direcional">
                  <span className="material-symbols-outlined text-[#006a61] text-[16px]">mic</span>
                  <div className="flex items-end gap-[2px] h-3.5 w-8 pb-0.5">
                    <span
                      className={`w-1 bg-[#006a61] rounded-full transition-all duration-200 ${
                        !isPaused ? 'h-2 animate-pulse' : 'h-1'
                      }`}
                    />
                    <span
                      className={`w-1 bg-[#006a61] rounded-full transition-all duration-200 ${
                        !isPaused ? 'h-3.5 animate-pulse' : 'h-1.5'
                      }`}
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className={`w-1 bg-[#006a61] rounded-full transition-all duration-200 ${
                        !isPaused ? 'h-4 animate-pulse' : 'h-1'
                      }`}
                      style={{ animationDelay: '75ms' }}
                    />
                    <span
                      className={`w-1 bg-[#006a61] rounded-full transition-all duration-200 ${
                        !isPaused ? 'h-2.5 animate-pulse' : 'h-1.5'
                      }`}
                      style={{ animationDelay: '200ms' }}
                    />
                    <span
                      className={`w-1 bg-[#006a61] rounded-full transition-all duration-200 ${
                        !isPaused ? 'h-1.5 animate-pulse' : 'h-1'
                      }`}
                    />
                  </div>
                  <span className="font-mono text-xs text-[#45464d]">-14dB</span>
                </div>
              </div>

              {/* Pause / Resume Button */}
              <button
                type="button"
                onClick={handleTogglePause}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                  isPaused
                    ? 'bg-[#86f2e4] text-[#006f66] border-[#006a61]'
                    : 'bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] border-[#d3e4fe]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isPaused ? 'play_arrow' : 'pause'}
                </span>
                <span>{isPaused ? 'Retomar' : 'Pausar'}</span>
              </button>

              {/* End and Generate Draft */}
              <button
                type="button"
                onClick={() => onNavigate('rascunho')}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#000000] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>Encerrar & Gerar Rascunho</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MAIN 3-COLUMN CLINICAL WORKSPACE                             */}
        {/* ============================================================ */}
        <div className="w-full px-6 lg:px-10 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* ------------------------------------------------------------ */}
            {/* COLUNA 1 (3 colunas): TRIAGEM & SINAIS VITAIS               */}
            {/* ------------------------------------------------------------ */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="bg-white rounded-xl p-4 border border-[#e5eeff] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#006a61] text-[18px]">assignment</span>
                    <h2 className="text-base font-bold text-[#0b1c30]">Triagem</h2>
                  </div>
                  <span className="px-2 py-0.5 bg-[#dce9ff] text-[#0b1c30] font-mono text-xs rounded font-semibold">
                    AMARELO (50 min)
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[#45464d]">Queixa Principal</span>
                  <p className="text-xs text-[#0b1c30] bg-[#eff4ff] p-2.5 rounded-lg leading-relaxed">
                    "Queda ao jogar futebol há 2 horas, dor aguda e edema em tornozelo direito, incapacidade de apoio plantar."
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-[#45464d]">Sinais Vitais • 13:58</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#eff4ff] p-2 rounded-lg flex flex-col">
                      <span className="text-[11px] text-[#45464d]">PA Sentado</span>
                      <span className="text-sm text-[#0b1c30] font-bold">
                        125/82 <span className="text-xs text-[#45464d] font-normal">mmHg</span>
                      </span>
                    </div>
                    <div className="bg-[#eff4ff] p-2 rounded-lg flex flex-col">
                      <span className="text-[11px] text-[#45464d]">Freq. Cardíaca</span>
                      <span className="text-sm text-[#0b1c30] font-bold">
                        78 <span className="text-xs text-[#45464d] font-normal">bpm</span>
                      </span>
                    </div>
                    <div className="bg-[#eff4ff] p-2 rounded-lg flex flex-col">
                      <span className="text-[11px] text-[#45464d]">SpO2</span>
                      <span className="text-sm text-[#0b1c30] font-bold">
                        98 <span className="text-xs text-[#45464d] font-normal">%</span>
                      </span>
                    </div>
                    <div className="bg-[#eff4ff] p-2 rounded-lg flex flex-col">
                      <span className="text-[11px] text-[#45464d]">Temp. Axilar</span>
                      <span className="text-sm text-[#0b1c30] font-bold">
                        36.4 <span className="text-xs text-[#45464d] font-normal">°C</span>
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#eff4ff] p-2 rounded-lg flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-[#45464d]">Escala de Dor (EVA)</span>
                      <span className="text-sm text-[#ba1a1a] font-bold">
                        7 / 10 <span className="text-xs text-[#45464d] font-normal">(Intensa)</span>
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[20px] text-[#ba1a1a]">
                      sentiment_dissatisfied
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[#45464d]">Alergias Prévias</span>
                  <div className="p-2.5 rounded-lg bg-[#eff4ff] flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-[#006a61] text-[16px] shrink-0 mt-0.5">
                      verified_user
                    </span>
                    <span className="text-xs text-[#0b1c30]">Nenhuma alergia relatada no acolhimento.</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[#45464d]">Histórico Clínico</span>
                  <div className="p-2.5 rounded-lg bg-[#eff4ff] flex flex-col gap-1 text-xs text-[#0b1c30]">
                    <div>• Nega HAS e Diabetes</div>
                    <div>• Sem histórico cirúrgico em MMII</div>
                  </div>
                </div>

                <div className="mt-1 p-2 rounded bg-[#eff4ff] flex items-center justify-between text-[#45464d] font-mono text-[11px]">
                  <span>Enf. Beatriz Novaes</span>
                  <span>COREN-SP 412.809</span>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* COLUNA 2 (5 colunas): TRANSCRIÇÃO CONTÍNUA                  */}
            {/* ------------------------------------------------------------ */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-white rounded-xl p-4 border border-[#e5eeff] flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-[#e5eeff]">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#006a61] text-[18px]">graphic_eq</span>
                    <h2 className="text-base font-bold text-[#0b1c30]">Transcrição Contínua</h2>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#eff4ff] px-2 py-0.5 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006a61]" />
                    <span className="font-mono text-xs text-[#45464d]">Latência: 220ms</span>
                  </div>
                </div>

                {/* Utterances List */}
                <div className="flex flex-col gap-3 max-h-[580px] overflow-y-auto pr-1 py-3">
                  {currentDialogue.map((item: any, idx: number) => {
                    const isDoc = item.role === 'doctor';
                    const avatarLetter = item.avatar || (isDoc ? 'M' : 'C');
                    return (
                      <div key={item.id || idx} className="flex items-start gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                            isDoc
                              ? 'bg-[#dce9ff] text-[#0b1c30]'
                              : 'bg-white border border-[#006a61] text-[#006a61]'
                          }`}
                        >
                          {avatarLetter}
                        </div>

                        <div
                          className={`flex flex-col p-3 rounded-xl w-full ${
                            isDoc
                              ? 'bg-[#eff4ff]'
                              : 'bg-white border border-[#e5eeff]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[#0b1c30]">{item.speaker}</span>
                              {item.badge && (
                                <span className="px-1.5 py-0.5 bg-[#e5eeff] text-[#45464d] font-mono text-[10px] rounded">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-xs text-[#45464d] opacity-75">
                              {item.timestamp}
                            </span>
                          </div>

                          <p className="text-xs text-[#0b1c30] leading-relaxed">
                            {item.isUncertain ? (
                              <>
                                "...então eu caí de lado e senti um{' '}
                                <span className="bg-[#e5eeff] px-1 rounded text-[#45464d] font-mono">
                                  [trecho incerto]
                                </span>{' '}
                                no ligamento..."
                              </>
                            ) : (
                              `"${item.text.replace(/^"|"$/g, '')}"`
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 p-2 rounded bg-[#eff4ff] text-[#45464d] font-mono text-xs">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        !isPaused ? 'bg-[#006a61] animate-pulse' : 'bg-[#94a3b8]'
                      }`}
                    />
                    <span>
                      {!isPaused ? 'Captando fala em tempo real...' : 'Escuta em pausa'}
                    </span>
                  </div>

                  <div ref={transcriptBottomRef} />
                </div>

                {/* Quick Interactive Dialogue Presets & Input Bar */}
                <div className="pt-3 border-t border-[#e5eeff] flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1">
                    <span className="text-[#45464d] font-mono text-[10px] shrink-0 font-semibold">
                      Adicionar fala:
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleAddUtterance('Como está a sensibilidade nos dedos do pé?', 'doctor')
                      }
                      className="px-2 py-1 rounded bg-[#eff4ff] hover:bg-[#dce9ff] text-[#006a61] text-[10px] font-medium whitespace-nowrap cursor-pointer transition-colors"
                    >
                      + Pergunta Médica
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleAddUtterance('Sinto os dedos normais, só dói mesmo o lado do tornozelo.', 'patient')
                      }
                      className="px-2 py-1 rounded bg-[#eff4ff] hover:bg-[#dce9ff] text-[#006a61] text-[10px] font-medium whitespace-nowrap cursor-pointer transition-colors"
                    >
                      + Resposta Paciente
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleAddUtterance('Vou prescrever dipirona de horário para controle da dor e solicitar o raio-X.', 'doctor')
                      }
                      className="px-2 py-1 rounded bg-[#eff4ff] hover:bg-[#dce9ff] text-[#006a61] text-[10px] font-bold whitespace-nowrap cursor-pointer transition-colors"
                    >
                      + Conduta Médica
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleMic}
                      className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
                        isListeningMic
                          ? 'bg-[#006a61] text-white animate-pulse'
                          : 'bg-[#eff4ff] text-[#006a61] hover:bg-[#dce9ff]'
                      }`}
                      title={isListeningMic ? 'Ouvindo microfone...' : 'Ativar microfone'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isListeningMic ? 'mic' : 'mic_none'}
                      </span>
                    </button>

                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddUtterance(inputText, 'doctor');
                          setInputText('');
                        }
                      }}
                      placeholder="Digite uma fala da consulta ou clique em um atalho acima..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#d3e4fe] bg-[#f8f9ff] text-[#0b1c30] focus:outline-none focus:border-[#006a61]"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        handleAddUtterance(inputText, 'doctor');
                        setInputText('');
                      }}
                      className="px-3 py-1.5 bg-[#000000] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* COLUNA 3 (4 colunas): DECISÕES DETECTADAS & PRINCÍPIO ÉTICO */}
            {/* ------------------------------------------------------------ */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-white rounded-xl p-4 border border-[#e5eeff] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#006a61] text-[18px]">smart_toy</span>
                    <h2 className="text-base font-bold text-[#0b1c30]">Decisões Detectadas</h2>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#006a61] font-mono text-xs font-semibold">
                    3 eventos
                  </span>
                </div>

                <div className="px-3 py-2 rounded bg-[#eff4ff] flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#006a61] text-[15px] shrink-0 mt-0.5">
                    info
                  </span>
                  <span className="text-xs text-[#45464d]">
                    Condutas enunciadas verbalmente pelo médico.
                  </span>
                </div>

                {/* Event 1 */}
                <div className="bg-white p-3 rounded-lg flex flex-col gap-1 border border-[#e5eeff]">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#0b1c30] text-xs font-semibold">
                      Solicitação de Exame
                    </span>
                    <span className="font-mono text-xs text-[#45464d]">03:15</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#0b1c30] mt-1">
                    Raio-X de Tornozelo Direito (AP e Perfil)
                  </h3>
                  <p className="text-xs text-[#45464d] leading-relaxed">
                    Regra Ottawa: Dor em maléolo lateral e incapacidade de sustentar peso.
                  </p>
                  <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-[#45464d] border-t border-[#f0f4fc]">
                    <span className="flex items-center gap-1 text-[#006a61] font-semibold">
                      <span className="material-symbols-outlined text-[14px]">record_voice_over</span>
                      Verbalizado pelo Dr. Marcelo
                    </span>
                    <span>Confiança: 99%</span>
                  </div>
                </div>

                {/* Event 2 */}
                <div className="bg-white p-3 rounded-lg flex flex-col gap-1 border border-[#e5eeff]">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#0b1c30] text-xs font-semibold">
                      Encaminhamento
                    </span>
                    <span className="font-mono text-xs text-[#45464d]">03:18</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#0b1c30] mt-1">
                    Ortopedia e Traumatologia
                  </h3>
                  <p className="text-xs text-[#45464d] leading-relaxed">
                    Avaliação pós-imagem e imobilização provisória (tala gessada).
                  </p>
                  <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-[#45464d] border-t border-[#f0f4fc]">
                    <span className="flex items-center gap-1 text-[#006a61] font-semibold">
                      <span className="material-symbols-outlined text-[14px]">record_voice_over</span>
                      Verbalizado pelo Dr. Marcelo
                    </span>
                    <span>Confiança: 98%</span>
                  </div>
                </div>

                {/* Event 3 */}
                <div className="bg-white p-3 rounded-lg flex flex-col gap-1 border border-[#e5eeff]">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#006a61] text-xs font-semibold">
                      Confirmação
                    </span>
                    <span className="font-mono text-xs text-[#45464d]">02:40</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#0b1c30] mt-1">
                    Alergias Negativas
                  </h3>
                  <p className="text-xs text-[#45464d] leading-relaxed">
                    Ausência de alergia a analgésicos e anti-inflamatórios.
                  </p>
                  <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-[#45464d] border-t border-[#f0f4fc]">
                    <span className="flex items-center gap-1 text-[#45464d]">
                      Confirmado pelo paciente
                    </span>
                    <span className="text-[#006a61] font-semibold">Validado</span>
                  </div>
                </div>

                {/* Princípio Ético Fala Saúde Card */}
                <div className="p-3 bg-[#eff4ff] rounded-lg flex flex-col gap-1 mt-1 border border-[#d3e4fe]">
                  <div className="flex items-center gap-1.5 text-[#0b1c30] text-xs font-bold">
                    <span className="material-symbols-outlined text-[16px] text-[#006a61]">verified</span>
                    Princípio Ético Fala Saúde
                  </div>
                  <p className="text-xs text-[#45464d] leading-relaxed">
                    Captura apenas condutas expressamente verbalizadas pelo médico, garantindo soberania clínica e prevenindo alucinações.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
