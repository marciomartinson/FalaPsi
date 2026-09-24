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
import {
  detectSpeakerRole,
  DiarizationMode,
} from '../../utils/diarizationEngine';

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
  const secondsRef = useRef(seconds);
  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  // Unified Active Listening state: single source of truth for microphone and active consultation listening
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [diarizationMode, setDiarizationMode] = useState<DiarizationMode>('auto');
  const transcriptBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Stable ref for live transcript to access last utterance without causing re-renders
  const liveTranscriptRef = useRef(liveTranscript);
  useEffect(() => {
    liveTranscriptRef.current = liveTranscript;
  }, [liveTranscript]);

  // Timer: increments every second when active listening is running
  useEffect(() => {
    let interval: any = null;
    if (isListening) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  // Format seconds to MM:SS
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Append a new utterance with automatic doctor/patient and question detection
  const handleAddUtterance = useCallback(
    (text: string, explicitRole?: 'doctor' | 'patient' | 'auto') => {
      if (!text || !text.trim()) return;
      const clean = text.trim();

      // Retrieve previous utterance for conversational turn-taking context
      const lastUtt = liveTranscriptRef.current[liveTranscriptRef.current.length - 1];
      const lastRole =
        lastUtt?.role === 'doctor' || lastUtt?.role === 'patient'
          ? lastUtt.role
          : undefined;
      const lastText = lastUtt?.text;

      const activeMode: DiarizationMode =
        explicitRole === 'doctor' || explicitRole === 'patient'
          ? explicitRole
          : diarizationMode;

      // Intelligent speaker identification: classifies Doctor vs Patient questions & statements
      const diarization = detectSpeakerRole(
        clean,
        patient.name || 'Carlos Eduardo Mendes (Paciente)',
        'Dr. Marcelo Ribeiro',
        lastRole,
        activeMode,
        lastText
      );

      const isDoc = diarization.role === 'doctor';

      const newUtt: TranscriptUtterance = {
        id: `utt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        speaker: diarization.speaker,
        role: diarization.role,
        timestamp: formatTimer(secondsRef.current),
        text: clean,
        confidence: `${Math.round(diarization.confidence * 100)}% (${diarization.reason})`,
        badge: diarization.badge,
        isQuestion: diarization.isQuestion,
        questionType: diarization.questionType,
      };

      setLiveTranscript((prev) => [...prev, newUtt]);

      // Check if doctor verbalized a clinical decision
      if (isDoc) {
        const lower = clean.toLowerCase();
        if (lower.includes('raio-x') || lower.includes('exame') || lower.includes('radiografia')) {
          setLiveDecisions((prev) => {
            const hasExam = prev.some((d) => d.title.toLowerCase().includes('raio-x'));
            if (hasExam) return prev;
            return [
              ...prev,
              {
                id: `dec-exam-${Date.now()}`,
                type: 'exame',
                title: 'Raio-X de Tornozelo Direito (AP e Perfil)',
                description: 'Regra Ottawa: Dor em maléolo lateral e incapacidade de sustentar peso.',
                doctorUtteranceSource: clean,
                timestamp: formatTimer(secondsRef.current),
                status: 'confirmado',
              },
            ];
          });
        }
        if (lower.includes('ortopedia') || lower.includes('encaminhar') || lower.includes('especialista')) {
          setLiveDecisions((prev) => {
            const hasEnc = prev.some((d) => d.title.toLowerCase().includes('ortopedia'));
            if (hasEnc) return prev;
            return [
              ...prev,
              {
                id: `dec-enc-${Date.now()}`,
                type: 'encaminhamento',
                title: 'Ortopedia e Traumatologia',
                description: 'Avaliação pós-imagem e imobilização provisória (tala gessada).',
                doctorUtteranceSource: clean,
                timestamp: formatTimer(secondsRef.current),
                status: 'confirmado',
              },
            ];
          });
        }
        if (lower.includes('dipirona') || lower.includes('receita') || lower.includes('prescrever') || lower.includes('medicamento')) {
          setLiveDecisions((prev) => {
            const hasMed = prev.some((d) => d.title.toLowerCase().includes('dipirona'));
            if (hasMed) return prev;
            return [
              ...prev,
              {
                id: `dec-med-${Date.now()}`,
                type: 'medicamento',
                title: 'Dipirona Monoidratada 1g',
                description: 'Administração VO se dor aguda. Alergias negativas checadas.',
                doctorUtteranceSource: clean,
                timestamp: formatTimer(secondsRef.current),
                status: 'confirmado',
              },
            ];
          });
        }
      }

      setTimeout(() => {
        transcriptBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    },
    [patient.name, diarizationMode, setLiveTranscript, setLiveDecisions]
  );

  // Stable ref for utterance adder so speech recognition is not restarted by re-renders
  const handleAddUtteranceRef = useRef(handleAddUtterance);
  useEffect(() => {
    handleAddUtteranceRef.current = handleAddUtterance;
  });

  // Stop active listening microphone
  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    setInterimTranscript('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }
  }, []);

  // Start active continuous listening microphone
  const startListening = useCallback(() => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      alert('Seu navegador não possui suporte ao Web Speech API. Por favor, utilize o Google Chrome ou Microsoft Edge.');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.abort();
      } catch (_) {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
        setMicError(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          const text = res[0]?.transcript || '';
          if (res.isFinal) {
            if (text.trim()) {
              handleAddUtteranceRef.current(text.trim());
              setInterimTranscript('');
            }
          } else {
            interim += text;
          }
        }
        if (interim) {
          setInterimTranscript(interim);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition erro:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          isListeningRef.current = false;
          setIsListening(false);
          setMicError('Permissão do microfone necessária no navegador. Clique no microfone para autorizar.');
        } else if (event.error === 'no-speech') {
          // Silence from user, ignore
        } else {
          setMicError(`Aviso de áudio: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // Keep listening continuously if still active
        if (isListeningRef.current) {
          setTimeout(() => {
            if (isListeningRef.current) {
              try {
                recognition.start();
              } catch (_) {
                // If restarting the same instance fails, start fresh
                startListening();
              }
            }
          }, 150);
        } else {
          setIsListening(false);
          setInterimTranscript('');
        }
      };

      recognitionRef.current = recognition;
      isListeningRef.current = true;
      setIsListening(true);
      recognition.start();
    } catch (err: any) {
      console.warn('Erro ao inicializar escuta ativa:', err);
      // Fallback: simple standard SpeechRecognition loop
      try {
        const fallback = new SpeechRecognitionClass();
        fallback.continuous = false;
        fallback.interimResults = false;
        fallback.lang = 'pt-BR';
        fallback.onstart = () => {
          isListeningRef.current = true;
          setIsListening(true);
        };
        fallback.onresult = (event: any) => {
          if (event.results && event.results[0] && event.results[0][0]) {
            const transcript = event.results[0][0].transcript;
            if (transcript && transcript.trim()) {
              handleAddUtteranceRef.current(transcript.trim());
            }
          }
        };
        fallback.onerror = () => {
          isListeningRef.current = false;
          setIsListening(false);
        };
        fallback.onend = () => {
          if (isListeningRef.current) {
            setTimeout(() => {
              if (isListeningRef.current) {
                startListening();
              }
            }, 200);
          } else {
            setIsListening(false);
          }
        };
        recognitionRef.current = fallback;
        isListeningRef.current = true;
        setIsListening(true);
        fallback.start();
      } catch (_) {
        isListeningRef.current = false;
        setIsListening(false);
      }
    }
  }, []);

  // Unified Toggle: clicking either button controls the exact same active listening mechanism
  const handleToggleMic = useCallback(() => {
    if (isListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [startListening, stopListening]);

  // Clean up recognition only on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  // Pre-fill transcript if empty
  const defaultDialogue = [
    {
      id: 'fs-1',
      speaker: 'Dr. Marcelo Ribeiro',
      role: 'doctor' as const,
      timestamp: '00:12',
      text: 'Boa tarde, Carlos. Me conte o que aconteceu com seu tornozelo.',
      badge: 'Pergunta Médica',
      avatar: 'M',
    },
    {
      id: 'fs-2',
      speaker: 'Carlos (Paciente)',
      role: 'patient' as const,
      timestamp: '00:25',
      text: 'Doutor, pisei de mau jeito numa dividida no futebol. Deu um estalo alto e na hora inchou muito. Não consigo nem colocar o pé no chão.',
      badge: 'Relato do Paciente',
      avatar: 'C',
    },
    {
      id: 'fs-3',
      speaker: 'Dr. Marcelo Ribeiro',
      role: 'doctor' as const,
      timestamp: '01:05',
      text: 'Vou palpar aqui... dói nesta proeminência do maléolo lateral?',
      badge: 'Pergunta Médica',
      avatar: 'M',
    },
    {
      id: 'fs-4',
      speaker: 'Carlos (Paciente)',
      role: 'patient' as const,
      timestamp: '01:14',
      text: 'Ai, sim! Dói demais exatamente aí.',
      badge: 'Relato do Paciente',
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
      badge: 'Pergunta Médica',
      avatar: 'M',
    },
    {
      id: 'fs-7',
      speaker: 'Carlos (Paciente)',
      role: 'patient' as const,
      timestamp: '02:40',
      text: 'Não, doutor. Que eu saiba nunca tive reação a nada.',
      badge: 'Relato do Paciente',
      avatar: 'C',
    },
    {
      id: 'fs-8',
      speaker: 'Dr. Marcelo Ribeiro',
      role: 'doctor' as const,
      timestamp: '03:15',
      text: 'Perfeito. Carlos, vou pedir um raio-X do tornozelo direito e te encaminhar para avaliação da ortopedia com imobilização provisória.',
      badge: 'Conduta Médica',
      avatar: 'M',
    },
    {
      id: 'fs-9',
      speaker: 'Carlos (Paciente)',
      role: 'patient' as const,
      timestamp: '03:22',
      text: 'Doutor, o senhor acha que vou precisar operar ou só a tala gessada resolve?',
      badge: 'Pergunta do Paciente',
      avatar: 'C',
    },
  ];

  const currentDialogue = liveTranscript.length > 0 ? liveTranscript : defaultDialogue;

  return (
    <main className="w-full pt-20 pb-28 bg-[#f8f9ff] min-h-[calc(100vh-4rem)] font-sans">
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

            {/* Top Right Mini Info (Ações movidas para o Menu Inferior) */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#eff4ff] rounded-lg border border-[#d3e4fe] text-xs font-mono text-[#006a61]">
                <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
                <span>Consulta Clínica em Andamento • Etapa 3</span>
              </div>
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
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-[#0b1c30]">{item.speaker}</span>
                              {item.badge && (
                                <span
                                  className={`px-2 py-0.5 font-mono text-[10px] rounded-md font-semibold flex items-center gap-1 ${
                                    item.badge === 'Pergunta Médica'
                                      ? 'bg-[#dbeafe] text-[#1e40af] border border-[#bfdbfe]'
                                      : item.badge === 'Pergunta do Paciente'
                                      ? 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]'
                                      : item.badge === 'Conduta Médica'
                                      ? 'bg-[#e0e7ff] text-[#4338ca] border border-[#c7d2fe]'
                                      : item.badge === 'Relato do Paciente'
                                      ? 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]'
                                      : 'bg-[#e5eeff] text-[#45464d] border border-[#d3e4fe]'
                                  }`}
                                >
                                  {item.badge === 'Pergunta Médica' && (
                                    <span className="material-symbols-outlined text-[12px]">stethoscope</span>
                                  )}
                                  {item.badge === 'Pergunta do Paciente' && (
                                    <span className="material-symbols-outlined text-[12px]">contact_support</span>
                                  )}
                                  {item.badge === 'Conduta Médica' && (
                                    <span className="material-symbols-outlined text-[12px]">clinical_notes</span>
                                  )}
                                  {item.badge === 'Relato do Paciente' && (
                                    <span className="material-symbols-outlined text-[12px]">person</span>
                                  )}
                                  <span>{item.badge}</span>
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

                  {/* Interim Realtime Transcript Feedback */}
                  {interimTranscript && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#e6f7f5] border border-[#a2dfd6] text-[#005049] text-xs animate-fadeIn">
                      <span className="material-symbols-outlined text-[16px] text-[#006a61] animate-pulse">
                        record_voice_over
                      </span>
                      <span className="font-semibold text-[#006a61] shrink-0">Ouvindo agora:</span>
                      <span className="italic text-[#0b1c30]">"{interimTranscript}..."</span>
                    </div>
                  )}

                  {/* Mic Error Notice */}
                  {micError && (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">error</span>
                        <span>{micError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={startListening}
                        className="px-2 py-1 bg-[#be123c] text-white rounded text-[11px] font-semibold hover:bg-[#9f1239] cursor-pointer"
                      >
                        Autorizar
                      </button>
                    </div>
                  )}

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 p-2 rounded bg-[#eff4ff] text-[#45464d] font-mono text-xs">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isListening ? 'bg-[#006a61] animate-pulse' : 'bg-[#94a3b8]'
                      }`}
                    />
                    <span>
                      {isListening
                        ? 'Microfone ativo: captando e transcrevendo fala em tempo real...'
                        : 'Escuta pausada. Ative pelo menu inferior para iniciar a transcrição.'}
                    </span>
                  </div>

                  <div ref={transcriptBottomRef} />
                </div>

                {/* Quick Interactive Dialogue Presets & Input Bar */}
                <div className="pt-3 border-t border-[#e5eeff] flex flex-col gap-2.5">
                  {/* Atalhos Rápidos com Pergunta do Médico e Pergunta do Paciente */}
                  <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1">
                    <span className="text-[#45464d] font-mono text-[10px] shrink-0 font-semibold">
                      Adicionar fala:
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleAddUtterance('Como está a sensibilidade nos dedos do pé?')
                      }
                      className="px-2.5 py-1 rounded bg-[#dbeafe] hover:bg-[#bfdbfe] text-[#1e40af] text-[10px] font-semibold whitespace-nowrap cursor-pointer transition-colors border border-[#bfdbfe] flex items-center gap-1"
                      title="Testar detecção automática de pergunta médica"
                    >
                      <span className="material-symbols-outlined text-[13px]">stethoscope</span>
                      <span>+ Pergunta Médica</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleAddUtterance('Doutor, vou precisar operar ou colocar gesso no tornozelo?')
                      }
                      className="px-2.5 py-1 rounded bg-[#fef3c7] hover:bg-[#fde68a] text-[#92400e] text-[10px] font-semibold whitespace-nowrap cursor-pointer transition-colors border border-[#fde68a] flex items-center gap-1"
                      title="Testar detecção automática de pergunta do paciente"
                    >
                      <span className="material-symbols-outlined text-[13px]">contact_support</span>
                      <span>+ Pergunta do Paciente</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleAddUtterance('Sinto os dedos normais, só dói mesmo o lado do tornozelo quando encosto.')
                      }
                      className="px-2.5 py-1 rounded bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#065f46] text-[10px] font-medium whitespace-nowrap cursor-pointer transition-colors border border-[#a7f3d0]"
                      title="Testar resposta do paciente"
                    >
                      + Resposta do Paciente
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleAddUtterance('Vou prescrever dipirona de horário para controle da dor e solicitar o raio-X.')
                      }
                      className="px-2.5 py-1 rounded bg-[#eff4ff] hover:bg-[#dce9ff] text-[#006a61] text-[10px] font-bold whitespace-nowrap cursor-pointer transition-colors border border-[#d3e4fe]"
                      title="Testar conduta médica com detecção de exame"
                    >
                      + Conduta Médica
                    </button>
                  </div>

                  {/* Barra de Modo de Diarização Inteligente */}
                  <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 bg-[#eff4ff] rounded-lg border border-[#d3e4fe]">
                    <div className="flex items-center gap-1.5 text-[#006a61] font-semibold">
                      <span className="material-symbols-outlined text-[15px] animate-pulse">auto_awesome</span>
                      <span>Diarização Inteligente:</span>
                      <span className="text-[#45464d] font-normal hidden md:inline">
                        Detecta automaticamente se a fala/pergunta é do Médico ou do Paciente
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setDiarizationMode('auto')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                          diarizationMode === 'auto'
                            ? 'bg-[#006a61] text-white shadow-xs'
                            : 'text-[#45464d] hover:bg-[#dce9ff]'
                        }`}
                        title="Detectar automaticamente se a pergunta é do médico ou do paciente"
                      >
                        Auto ⚡
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiarizationMode('doctor')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                          diarizationMode === 'doctor'
                            ? 'bg-[#006a61] text-white shadow-xs'
                            : 'text-[#45464d] hover:bg-[#dce9ff]'
                        }`}
                        title="Fixar fala no Médico"
                      >
                        Médico
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiarizationMode('patient')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                          diarizationMode === 'patient'
                            ? 'bg-[#006a61] text-white shadow-xs'
                            : 'text-[#45464d] hover:bg-[#dce9ff]'
                        }`}
                        title="Fixar fala no Paciente"
                      >
                        Paciente
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Botão de Microfone da Transcrição Contínua */}
                    <button
                      type="button"
                      onClick={handleToggleMic}
                      className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 px-3 border shrink-0 ${
                        isListening
                          ? 'bg-[#006a61] text-white border-[#006a61] shadow-xs animate-pulse ring-2 ring-[#006a61]/30'
                          : 'bg-[#eff4ff] text-[#006a61] hover:bg-[#dce9ff] border-[#d3e4fe]'
                      }`}
                      title={isListening ? 'Ouvindo microfone... Clique para parar' : 'Ativar microfone de transcrição contínua'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isListening ? 'mic' : 'mic_none'}
                      </span>
                      <span className="text-xs font-semibold hidden sm:inline">
                        {isListening ? 'Ouvindo...' : 'Microfone'}
                      </span>
                    </button>

                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddUtterance(inputText);
                          setInputText('');
                        }
                      }}
                      placeholder="Fale no microfone ou digite uma pergunta/fala (o sistema detecta médico ou paciente)..."
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#d3e4fe] bg-[#f8f9ff] text-[#0b1c30] focus:outline-none focus:border-[#006a61]"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        handleAddUtterance(inputText);
                        setInputText('');
                      }}
                      className="px-4 py-2 bg-[#000000] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer shrink-0 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      <span>Enviar</span>
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

      {/* ============================================================ */}
      {/* STICKY BOTTOM ACTION BAR (MENU INFERIOR - PADRÃO TELA 4)     */}
      {/* ============================================================ */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#ffffff] border-t border-[#e5eeff] px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Voltar & Status da Escuta */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => onNavigate('fila-do-plantao')}
              className="px-3.5 py-2 rounded-xl border border-[#d3e4fe] bg-[#ffffff] text-[#0b1c30] text-[12px] font-bold hover:bg-[#eff4ff] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Voltar à Agenda</span>
            </button>

            {/* Status da Escuta */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs ${
                isListening
                  ? 'bg-[#e6f7f5] text-[#006a61] border-[#006a61]'
                  : 'bg-[#fff1f2] text-[#be123c] border-[#fecdd3]'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isListening ? 'bg-[#006a61] animate-pulse ring-4 ring-[#006a61]/20' : 'bg-[#e11d48]'
                }`}
              />
              <span className="font-bold uppercase tracking-wider text-[11px]">
                {isListening ? 'Escuta Ativa' : 'Escuta Pausada'}
              </span>
              <span className="text-[#c6c6cd] opacity-60">|</span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">
                  {isListening ? 'mic' : 'mic_off'}
                </span>
                {isListening ? (
                  <div className="flex items-end gap-[2px] h-3 w-6 pb-0.5">
                    <span className="w-1 bg-[#006a61] rounded-full h-1.5 animate-pulse" />
                    <span className="w-1 bg-[#006a61] rounded-full h-3 animate-pulse" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 bg-[#006a61] rounded-full h-3.5 animate-pulse" style={{ animationDelay: '75ms' }} />
                    <span className="w-1 bg-[#006a61] rounded-full h-2 animate-pulse" style={{ animationDelay: '200ms' }} />
                    <span className="w-1 bg-[#006a61] rounded-full h-1 animate-pulse" />
                  </div>
                ) : (
                  <div className="flex items-end gap-[2px] h-3 w-6 pb-0.5 opacity-40">
                    <span className="w-1 bg-[#be123c] rounded-full h-1" />
                    <span className="w-1 bg-[#be123c] rounded-full h-1" />
                    <span className="w-1 bg-[#be123c] rounded-full h-1" />
                    <span className="w-1 bg-[#be123c] rounded-full h-1" />
                    <span className="w-1 bg-[#be123c] rounded-full h-1" />
                  </div>
                )}
                <span className="font-mono text-[11px]">{isListening ? '-14dB' : 'Mudo'}</span>
              </div>
            </div>
          </div>

          {/* Right: Botão de Escuta Ativa e Botão Encerrar & Gerar Rascunho */}
          <div className="flex items-center gap-3">
            {/* Botão de Escuta Ativa */}
            <button
              type="button"
              onClick={handleToggleMic}
              className={`px-4 py-2 rounded-xl text-[12px] font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs border ${
                isListening
                  ? 'bg-[#eff4ff] hover:bg-[#dce9ff] text-[#006a61] border-[#006a61]'
                  : 'bg-[#006a61] hover:bg-[#005049] text-white border-[#006a61] ring-2 ring-[#006a61]/20'
              }`}
              title={isListening ? 'Clique para pausar a escuta contínua' : 'Clique para ativar a escuta contínua do microfone'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isListening ? 'pause_circle' : 'mic'}
              </span>
              <span>{isListening ? 'Pausar Escuta' : 'Iniciar Escuta Ativa'}</span>
            </button>

            {/* Botão Encerrar e Gerar Rascunho */}
            <button
              type="button"
              onClick={() => onNavigate('rascunho')}
              className="px-5 py-2.5 rounded-xl bg-[#000000] hover:bg-[#1f2937] text-white text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">description</span>
              <span>Encerrar & Gerar Rascunho</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
};
