import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { RiskAlertBanner } from '../RiskAlertBanner';
import {
  detectSpeakerRole,
  detectRiskMention,
  detectClinicalDecisions,
  DiarizationMode,
  SpeakerDiarizationResult,
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
  // Consultation is active & listening starts ON by default (per user request)
  const [isRecording, setIsRecording] = useState(true);
  const [seconds, setSeconds] = useState(485); // 08:05
  const [manualUtterance, setManualUtterance] = useState('');
  const [diarizationMode, setDiarizationMode] = useState<DiarizationMode>('auto');
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Real-time microphone & Web Speech recognition state
  const [isMicCapturing, setIsMicCapturing] = useState(false);
  const [isVoiceDetected, setIsVoiceDetected] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [predictedSpeaker, setPredictedSpeaker] = useState<SpeakerDiarizationResult | null>(null);
  const [micPermissionState, setMicPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);
  const [isComputingSilence, setIsComputingSilence] = useState(false);

  const transcriptBottomRef = useRef<HTMLDivElement>(null);
  const isListeningRef = useRef(isRecording);
  const recognitionRef = useRef<any>(null);
  const isRecognizingRef = useRef(false);
  const liveTextRef = useRef<string>('');
  const silenceTimerRef = useRef<any>(null);
  const restartTimeoutRef = useRef<any>(null);
  const lastRoleRef = useRef<'doctor' | 'patient'>('doctor');
  const lastUtteranceTextRef = useRef<string>('');

  // Keep ref synchronized
  useEffect(() => {
    isListeningRef.current = isRecording;
  }, [isRecording]);

  // Keep lastRoleRef and lastUtteranceTextRef up to date based on the latest transcript entry
  useEffect(() => {
    if (liveTranscript.length > 0) {
      const last = liveTranscript[liveTranscript.length - 1];
      if (last.role === 'doctor' || last.role === 'patient') {
        lastRoleRef.current = last.role;
      }
      lastUtteranceTextRef.current = last.text;
    }
  }, [liveTranscript]);

  // Timer effect: increments each second only when listening is active
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

  // Helper: append a finalized utterance with full clinical checks
  const commitUtterance = useCallback((text: string, overrideMode?: DiarizationMode) => {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();
    const mode = overrideMode || diarizationMode;

    // Detect speaker with the intelligent diarization engine using conversational turn continuity
    const diarization = detectSpeakerRole(
      cleanText,
      patient.name,
      'Dr. Roberto Guimarães',
      lastRoleRef.current,
      mode,
      lastUtteranceTextRef.current
    );

    const isRisk = detectRiskMention(cleanText);
    const timeStampStr = formatTimer(seconds);

    const newUtt: TranscriptUtterance = {
      id: `utt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      speaker: diarization.speaker,
      role: diarization.role,
      timestamp: timeStampStr,
      text: cleanText,
      isRiskMention: isRisk,
      confidence: `${Math.round(diarization.confidence * 100)}% (${diarization.reason})`,
    };

    lastRoleRef.current = diarization.role;
    lastUtteranceTextRef.current = cleanText;

    setLiveTranscript((prev) => [...prev, newUtt]);

    // Check if clinical decisions were verbalized by doctor
    if (diarization.role === 'doctor') {
      const detectedDecs = detectClinicalDecisions(cleanText, 'doctor', timeStampStr);
      if (detectedDecs.length > 0) {
        setLiveDecisions((prev) => [...prev, ...detectedDecs]);
      }
    }

    setTimeout(() => {
      transcriptBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  }, [diarizationMode, patient.name, seconds, setLiveDecisions, setLiveTranscript]);

  // Immediately flush & commit any accumulated speech in progress
  const flushCurrentSpeech = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    const pendingText = liveTextRef.current.trim() || interimTranscript.trim();
    if (pendingText) {
      commitUtterance(pendingText);
      liveTextRef.current = '';
    }
    setInterimTranscript('');
    setPredictedSpeaker(null);
    setIsVoiceDetected(false);
    setIsComputingSilence(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
  }, [commitUtterance, interimTranscript]);

  // Clean Web Speech Recognition Setup (Built from scratch, exactly like chat speech-to-text)
  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setMicPermissionState('unsupported');
      setMicErrorMessage('O seu navegador não possui suporte nativo à Web Speech API. Utilize o Google Chrome para reconhecimento de voz em tempo real.');
      return;
    }

    // Stop existing instance if any
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isRecognizingRef.current = true;
        setIsMicCapturing(true);
        setMicErrorMessage(null);
        setMicPermissionState('granted');
      };

      recognition.onresult = (event: any) => {
        if (!isListeningRef.current) return;

        let finalPart = '';
        let interimPart = '';

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalPart += res[0].transcript + ' ';
          } else {
            interimPart += res[0].transcript;
          }
        }

        const spokenWords = (finalPart + interimPart).trim();
        if (!spokenWords) return;

        liveTextRef.current = spokenWords;
        setInterimTranscript(spokenWords);
        setIsVoiceDetected(true);
        setIsComputingSilence(true);

        // Real-time diarization prediction
        const pred = detectSpeakerRole(
          spokenWords,
          patient.name,
          'Dr. Roberto Guimarães',
          lastRoleRef.current,
          diarizationMode,
          lastUtteranceTextRef.current
        );
        setPredictedSpeaker(pred);

        // Reset 2-second silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // Exact 2 seconds of silence/pause before computing
        silenceTimerRef.current = setTimeout(() => {
          if (isListeningRef.current && liveTextRef.current.trim()) {
            commitUtterance(liveTextRef.current.trim());
            liveTextRef.current = '';
            setInterimTranscript('');
            setIsVoiceDetected(false);
            setPredictedSpeaker(null);
            setIsComputingSilence(false);

            // Clean restart of recognition so Chrome's event.results resets
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
              } catch (_) {}
            }
          }
        }, 2000);
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          return;
        }
        if (event.error === 'not-allowed') {
          isRecognizingRef.current = false;
          setIsMicCapturing(false);
          setMicPermissionState('denied');
          setMicErrorMessage('Acesso ao microfone negado. Clique em "Ativar Microfone" para autorizar no navegador.');
        } else if (event.error === 'audio-capture') {
          isRecognizingRef.current = false;
          setIsMicCapturing(false);
          setMicErrorMessage('Nenhum microfone encontrado ou está ocupado por outro aplicativo.');
        } else if (event.error === 'network') {
          console.warn('SpeechRecognition network warning');
        }
      };

      recognition.onend = () => {
        isRecognizingRef.current = false;

        // Commit any pending uncommitted speech
        if (isListeningRef.current && liveTextRef.current.trim()) {
          commitUtterance(liveTextRef.current.trim());
          liveTextRef.current = '';
          setInterimTranscript('');
          setIsVoiceDetected(false);
          setPredictedSpeaker(null);
          setIsComputingSilence(false);
        }

        // If listening is still active, restart smoothly
        if (isListeningRef.current && micPermissionState !== 'denied') {
          if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => {
            if (isListeningRef.current && !isRecognizingRef.current) {
              try {
                recognition.start();
              } catch (_) {
                startSpeechRecognition();
              }
            }
          }, 80);
        } else {
          setIsMicCapturing(false);
          setIsVoiceDetected(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('SpeechRecognition start error:', err);
      isRecognizingRef.current = false;
      setIsMicCapturing(false);
    }
  }, [commitUtterance, diarizationMode, micPermissionState, patient.name]);

  // Start recognition on mount and cleanup on unmount
  useEffect(() => {
    startSpeechRecognition();

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, [startSpeechRecognition]);

  // Explicit user activation handler (satisfies user gesture requirement)
  const handleDirectMicActivation = useCallback(() => {
    setMicErrorMessage(null);
    setIsRecording(true);
    isListeningRef.current = true;
    liveTextRef.current = '';
    setInterimTranscript('');
    startSpeechRecognition();
  }, [startSpeechRecognition]);

  // Synchronized Pause / Resume Toggle
  const handleToggleListening = useCallback(() => {
    if (isRecording) {
      // PAUSE
      setIsRecording(false);
      isListeningRef.current = false;
      setIsMicCapturing(false);
      setIsVoiceDetected(false);
      setIsComputingSilence(false);

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }

      const pending = liveTextRef.current.trim() || interimTranscript.trim();
      if (pending) {
        commitUtterance(pending);
        liveTextRef.current = '';
      }
      setInterimTranscript('');
      setPredictedSpeaker(null);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    } else {
      // RESUME
      setIsRecording(true);
      isListeningRef.current = true;
      liveTextRef.current = '';
      setInterimTranscript('');
      startSpeechRecognition();
    }
  }, [commitUtterance, interimTranscript, isRecording, startSpeechRecognition]);

  // Helper for simulated / one-click speech testing
  const handleSimulatedSpeech = (text: string, forcedRole?: DiarizationMode) => {
    if (!isRecording) {
      handleToggleListening();
    }
    // Flush any pending real speech first
    flushCurrentSpeech();

    setIsVoiceDetected(true);
    setInterimTranscript(text);

    const pred = detectSpeakerRole(
      text,
      patient.name,
      'Dr. Roberto Guimarães',
      lastRoleRef.current,
      forcedRole || diarizationMode,
      lastUtteranceTextRef.current
    );
    setPredictedSpeaker(pred);

    setTimeout(() => {
      setIsVoiceDetected(false);
      setInterimTranscript('');
      setPredictedSpeaker(null);
      commitUtterance(text, forcedRole);
    }, 1000);
  };

  // Toggle speaker role on an existing bubble in the transcript
  const handleToggleUtteranceSpeaker = (utteranceId: string) => {
    setLiveTranscript((prev) =>
      prev.map((utt) => {
        if (utt.id !== utteranceId) return utt;
        const newRole: 'doctor' | 'patient' = utt.role === 'doctor' ? 'patient' : 'doctor';
        const newSpeaker = newRole === 'doctor' ? 'Dr. Roberto Guimarães' : patient.name;

        // If changed to doctor, check if decisions were verbalized
        if (newRole === 'doctor') {
          const decs = detectClinicalDecisions(utt.text, 'doctor', utt.timestamp);
          if (decs.length > 0) {
            setLiveDecisions((existing) => [...existing, ...decs]);
          }
        }

        return {
          ...utt,
          role: newRole,
          speaker: newSpeaker,
          confidence: 'Ajustado manualmente pelo médico',
        };
      })
    );
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
        literalText:
          liveTranscript.find((t) => t.isRiskMention)?.text ||
          'às vezes penso que seria melhor não acordar',
        timestamp: formatTimer(seconds),
        evaluatedByDoctor: false,
        doctorEvaluationNotes: '',
      };

  // Add manual utterance via input box
  const handleAddManualUtterance = () => {
    if (!manualUtterance.trim()) return;
    commitUtterance(manualUtterance);
    setManualUtterance('');
  };

  const handleReanalyzeWithAi = () => {
    setIsReanalyzing(true);
    setTimeout(() => {
      setIsReanalyzing(false);
    }, 800);
  };

  return (
    <main className="w-full pt-28 pb-28 bg-[#f8f9ff] min-h-screen">
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
            {/* Listening Status Badge with Live Audio Visualizer */}
            <div className="flex items-center gap-2.5 bg-[#f8f9ff] px-3.5 py-1.5 rounded-xl border border-[#d3e4fe]">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isRecording ? 'bg-[#0284c7] animate-pulse' : 'bg-[#94a3b8]'
                }`}
              />
              <span className="text-[12px] font-mono font-bold text-[#0b1c30]">
                {isRecording ? 'Escuta Ativa' : 'Escuta Pausada'}
              </span>

              {/* Dynamic Audio Visualizer Equalizer */}
              {isRecording && (
                <div className="flex items-end gap-0.5 h-4 px-1" title={isVoiceDetected ? 'Voz ativa detectada' : 'Aguardando fala'}>
                  <span
                    className={`w-1 rounded-full transition-all duration-200 ${
                      isVoiceDetected ? 'bg-[#0284c7] h-3.5 animate-pulse' : 'bg-[#cbd5e1] h-1.5'
                    }`}
                  />
                  <span
                    className={`w-1 rounded-full transition-all duration-200 ${
                      isVoiceDetected ? 'bg-[#0284c7] h-4 animate-pulse' : 'bg-[#cbd5e1] h-2'
                    }`}
                  />
                  <span
                    className={`w-1 rounded-full transition-all duration-200 ${
                      isVoiceDetected ? 'bg-[#0284c7] h-3 animate-pulse' : 'bg-[#cbd5e1] h-1.5'
                    }`}
                  />
                  <span
                    className={`w-1 rounded-full transition-all duration-200 ${
                      isVoiceDetected ? 'bg-[#0284c7] h-3.5 animate-pulse' : 'bg-[#cbd5e1] h-2'
                    }`}
                  />
                </div>
              )}

              {/* Live Voice Detected Pill */}
              {isRecording && isVoiceDetected && (
                <span className="px-2 py-0.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] text-[10px] font-bold flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  Voz detectada
                </span>
              )}

              <span className="text-[12px] font-mono text-[#0284c7] font-bold pl-1.5 border-l border-[#d3e4fe]">
                {formatTimer(seconds)}
              </span>
            </div>

            {/* Quick Synchronized Pause/Resume Button */}
            <button
              type="button"
              onClick={handleToggleListening}
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

        {/* Microphone Activation & Permission Guidance Banner */}
        {(!isMicCapturing || micErrorMessage) && isRecording && (
          <div className="w-full bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-3.5 text-[12px] text-[#1e40af] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-[#0284c7]">mic</span>
              <div>
                <span className="font-bold text-[#0b1c30]">Captação de Áudio do Microfone: </span>
                <span>{micErrorMessage || 'Para que a transcrição capture a voz do seu computador, clique no botão ao lado para autorizar o acesso.'}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDirectMicActivation}
              className="px-3.5 py-1.5 bg-[#0284c7] text-white font-bold rounded-lg hover:bg-[#0369a1] text-[11px] cursor-pointer whitespace-nowrap shadow-xs flex items-center gap-1 shrink-0"
            >
              <span className="material-symbols-outlined text-[15px]">mic</span>
              Ativar Microfone Agora
            </button>
          </div>
        )}

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
                        <strong className="text-[#0f172a] text-[12px]">
                          {med.name} {med.dosage}
                        </strong>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#0284c7]/10 text-[#0284c7] font-bold">
                          {med.status}
                        </span>
                      </div>
                      <span className="text-[#45464d]">{med.posology}</span>
                      <span className="text-[10px] text-[#76777d] font-mono">
                        Início: {med.startedDate}
                      </span>
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
                      <span className="text-[10px] text-[#76777d]">
                        Data: {exam.date} • Ref: {exam.reference}
                      </span>
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
                        <span className="font-bold">
                          {item.resolved ? 'RESOLVIDO HOJE' : 'PENDENTE'}
                        </span>
                      </div>
                      <p>{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ============================================================ */}
          {/* COLUNA CENTRAL (5 colunas): TRANSCRIÇÃO & DIARIZAÇÃO         */}
          {/* ============================================================ */}
          <section className="lg:col-span-5 bg-[#ffffff] rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col h-[680px]">
            {/* Header da Transcrição com status de diarização e microfone */}
            <div className="p-3.5 sm:p-4 border-b border-[#e5eeff] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#ffffff] rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0284c7] text-[20px]">forum</span>
                <h2 className="font-bold text-[14px] text-[#0b1c30]">Transcrição da Consulta</h2>
              </div>

              {/* Status da Diarização */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#f0f9ff] text-[#0369a1] border border-[#bae6fd] font-semibold">
                  <span className="material-symbols-outlined text-[13px]">psychology</span>
                  Diarização Automática Ativa
                </span>
              </div>
            </div>

            {/* Conversation utterances stream */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-[#fafbff]">
              {liveTranscript.map((utt) => {
                const isDoctor = utt.role === 'doctor';
                return (
                  <div
                    key={utt.id}
                    className={`group relative flex flex-col gap-1 p-3 rounded-xl border transition-all ${
                      utt.isRiskMention
                        ? 'bg-[#fef2f2] border-2 border-[#b91c1c] text-[#7f1d1d]'
                        : isDoctor
                        ? 'bg-[#ffffff] border-[#d3e4fe] shadow-2xs'
                        : 'bg-[#f0f9ff] border-[#bae6fd] shadow-2xs'
                    }`}
                  >
                    {/* Utterance top: Speaker badge, role, timestamp & swap button */}
                    <div className="flex items-center justify-between text-[11px] flex-wrap gap-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md text-[10px] font-mono inline-flex items-center gap-1 ${
                            isDoctor
                              ? 'bg-[#0284c7] text-white'
                              : 'bg-[#0369a1] text-white'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {isDoctor ? 'stethoscope' : 'person'}
                          </span>
                          {isDoctor ? 'MÉDICO' : 'PACIENTE'}
                        </span>
                        <span className="font-semibold text-[#0f172a]">{utt.speaker}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#76777d] text-[10px]">{utt.timestamp}</span>

                        {/* Quick Speaker Reassignment button (Doctor control) */}
                        <button
                          type="button"
                          onClick={() => handleToggleUtteranceSpeaker(utt.id)}
                          className="opacity-70 group-hover:opacity-100 px-1.5 py-0.5 rounded bg-white/90 border border-[#d3e4fe] hover:bg-[#eff4ff] text-[10px] text-[#0284c7] font-semibold cursor-pointer transition-all flex items-center gap-1"
                          title="Clique para alternar quem falou entre Médico e Paciente"
                        >
                          <span className="material-symbols-outlined text-[12px]">swap_horiz</span>
                          <span>Trocar para {isDoctor ? 'Paciente' : 'Médico'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Utterance text */}
                    <div className="text-[13px] text-[#1c1917] leading-relaxed mt-0.5">
                      {utt.isUncertain ? (
                        <span
                          className="border-b-2 border-dashed border-[#94a3b8] bg-[#f1f5f9] px-1 py-0.5 rounded text-[#475569] inline-flex items-center gap-1 cursor-help"
                          title="Trecho com baixa confiança acústica. Marcado para conferência médica."
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

              {/* Interim Real-Time Speech Card (Direct live streaming like chat dictation) */}
              {interimTranscript && (
                <div className="p-3.5 rounded-xl border border-dashed border-[#0284c7] bg-[#f0f9ff] flex flex-col gap-2 shadow-xs transition-all animate-fadeIn">
                  <div className="flex items-center justify-between text-[11px] flex-wrap gap-2">
                    <span className="font-mono font-bold text-[#0284c7] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] animate-ping" />
                      {isComputingSilence ? 'Pausa detectada — computando em ~2s...' : 'Ouvindo ao vivo (ditado em tempo real)...'}
                    </span>

                    <div className="flex items-center gap-2">
                      {predictedSpeaker && (
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                            predictedSpeaker.role === 'doctor'
                              ? 'bg-white text-[#0369a1] border-[#bae6fd]'
                              : 'bg-white text-[#047857] border-[#a7f3d0]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {predictedSpeaker.role === 'doctor' ? 'medical_services' : 'person'}
                          </span>
                          Identificando: {predictedSpeaker.role === 'doctor' ? 'MÉDICO' : 'PACIENTE'} ({predictedSpeaker.reason})
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={flushCurrentSpeech}
                        className="px-2.5 py-1 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-xs"
                        title="Computar fala agora sem aguardar a pausa de 2 segundos"
                      >
                        <span>Computar Agora</span>
                        <span className="material-symbols-outlined text-[12px]">keyboard_return</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[13.5px] text-[#0f172a] font-normal leading-relaxed italic bg-white/80 p-2.5 rounded-lg border border-[#bae6fd] shadow-2xs">
                    "{interimTranscript}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[#64748b] pt-0.5">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-[#0284c7]">timer</span>
                      Modo ditado de chat: fala contínua com computação automática após 2 segundos de silêncio
                    </span>
                    <span className="font-mono font-bold text-[#0284c7]">
                      {predictedSpeaker?.confidence ? `${Math.round(predictedSpeaker.confidence * 100)}% certeza` : ''}
                    </span>
                  </div>
                </div>
              )}

              <div ref={transcriptBottomRef} />
            </div>

            {/* Quick Presets for Clinical Simulation (Easy test of Diarization) */}
            <div className="px-3 py-1.5 bg-[#f8f9ff] border-t border-[#e5eeff] flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="font-mono text-[#76777d] shrink-0 text-[10px] font-semibold">Testar Voz / Diarização:</span>
              <button
                type="button"
                onClick={() => handleSimulatedSpeech('Como você tem passado desde nossa última consulta? Sentiu alguma alteração no sono?', 'doctor')}
                className="px-2 py-1 rounded-md bg-white border border-[#d3e4fe] hover:bg-[#eff4ff] text-[#0369a1] text-[10px] font-medium whitespace-nowrap cursor-pointer transition-all flex items-center gap-1"
                title="Simula fala detectando automaticamente como Médico"
              >
                <span className="material-symbols-outlined text-[12px] text-[#0284c7]">record_voice_over</span>
                + Pergunta Médica
              </button>
              <button
                type="button"
                onClick={() => handleSimulatedSpeech('Doutor, melhorei bastante da insônia, mas sinto a boca um pouco seca pela manhã.', 'patient')}
                className="px-2 py-1 rounded-md bg-white border border-[#d3e4fe] hover:bg-[#eff4ff] text-[#0369a1] text-[10px] font-medium whitespace-nowrap cursor-pointer transition-all flex items-center gap-1"
                title="Simula fala detectando automaticamente como Paciente"
              >
                <span className="material-symbols-outlined text-[12px] text-[#0284c7]">record_voice_over</span>
                + Resposta Paciente
              </button>
              <button
                type="button"
                onClick={() => handleSimulatedSpeech('Vamos manter o escitalopram e vou solicitar uma litemia de controle para você.', 'doctor')}
                className="px-2 py-1 rounded-md bg-white border border-[#bae6fd] hover:bg-[#e0f2fe] text-[#0284c7] text-[10px] font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1"
                title="Simula conduta do Médico e gera decisão de exame"
              >
                <span className="material-symbols-outlined text-[12px] text-[#0284c7]">assignment</span>
                + Conduta Médica (Exame)
              </button>
              <button
                type="button"
                onClick={() => handleSimulatedSpeech('Às vezes sinto tanto aperto no peito que penso que seria melhor não acordar mais...', 'patient')}
                className="px-2 py-1 rounded-md bg-[#fff1f2] border border-[#fecdd3] hover:bg-[#ffe4e6] text-[#b91c1c] text-[10px] font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1"
                title="Simula fala de Paciente e gera alerta de risco psiquiátrico"
              >
                <span className="material-symbols-outlined text-[12px] text-[#b91c1c]">warning</span>
                + Queixa de Risco
              </button>
            </div>

            {/* Diarization Mode Selector & Chat-Style Input Bar */}
            <div className="p-3 border-t border-[#e5eeff] bg-[#ffffff] flex flex-col gap-2 rounded-b-2xl">
              <div className="flex items-center justify-between text-[11px] flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[#76777d] text-[10px]">Identificação da voz:</span>
                  <button
                    type="button"
                    onClick={() => setDiarizationMode('auto')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                      diarizationMode === 'auto'
                        ? 'bg-[#0284c7] text-white shadow-xs'
                        : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                    IA Automática (Médico vs Paciente)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiarizationMode('doctor')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                      diarizationMode === 'doctor'
                        ? 'bg-[#0284c7] text-white shadow-xs'
                        : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
                    }`}
                  >
                    Dr. Roberto (Médico)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiarizationMode('patient')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                      diarizationMode === 'patient'
                        ? 'bg-[#0369a1] text-white shadow-xs'
                        : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
                    }`}
                  >
                    {patient.name.split(' ')[0]} (Paciente)
                  </button>
                </div>

                {/* Mic status badge */}
                <button
                  type="button"
                  onClick={handleToggleListening}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                    isRecording && isMicCapturing
                      ? 'bg-[#f0f9ff] text-[#0284c7] border-[#bae6fd]'
                      : 'bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]'
                  }`}
                  title="Clique para pausar ou retomar a captação de áudio"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isRecording && isMicCapturing ? 'bg-[#0284c7] animate-pulse' : 'bg-[#94a3b8]'
                    }`}
                  />
                  <span>{isRecording ? 'Microfone Ativo (2s pausa)' : 'Microfone Pausado'}</span>
                </button>
              </div>

              {/* Chat-Style Unified Input Field with Mic Button */}
              <div className="flex items-center gap-2">
                {/* Dedicated inline Mic Button like standard chat apps */}
                <button
                  type="button"
                  onClick={handleToggleListening}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                    isRecording && isMicCapturing
                      ? 'bg-[#0284c7] text-white shadow-sm ring-2 ring-[#38bdf8]/40 animate-pulse'
                      : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]'
                  }`}
                  title={isRecording ? 'Microfone ouvindo (clique para pausar)' : 'Clique para ativar microfone'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isRecording ? 'mic' : 'mic_off'}
                  </span>
                </button>

                <input
                  type="text"
                  value={interimTranscript || manualUtterance}
                  onChange={(e) => {
                    if (interimTranscript) {
                      setInterimTranscript('');
                    }
                    setManualUtterance(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (interimTranscript) {
                        flushCurrentSpeech();
                      } else {
                        handleAddManualUtterance();
                      }
                    }
                  }}
                  placeholder={
                    isRecording
                      ? 'Fale ao microfone (computa após 2s de pausa) ou digite aqui...'
                      : 'Microfone pausado. Digite aqui ou clique no microfone para falar...'
                  }
                  className={`flex-1 px-3.5 py-2 text-[12.5px] rounded-xl border transition-all focus:outline-none ${
                    interimTranscript
                      ? 'border-[#0284c7] bg-[#f0f9ff] text-[#0f172a] font-medium'
                      : 'border-[#d3e4fe] bg-[#f8f9ff] text-[#0b1c30] focus:border-[#0284c7]'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => {
                    if (interimTranscript) {
                      flushCurrentSpeech();
                    } else {
                      handleAddManualUtterance();
                    }
                  }}
                  className="px-3.5 py-2 bg-[#0284c7] text-white text-[12px] font-bold rounded-xl hover:bg-[#0369a1] transition-all cursor-pointer shadow-2xs shrink-0 flex items-center gap-1"
                >
                  <span>{interimTranscript ? 'Computar' : 'Enviar'}</span>
                  <span className="material-symbols-outlined text-[14px]">send</span>
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

      {/* Sticky Bottom Action Bar */}
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

            {/* Real Microphone Status Badge */}
            <div
              className={`px-3 py-2 rounded-xl border text-[12px] font-bold flex items-center gap-2 ${
                isRecording && isMicCapturing
                  ? 'bg-[#f0f9ff] text-[#0284c7] border-[#bae6fd]'
                  : 'bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isRecording && isMicCapturing ? 'animate-pulse text-[#0284c7]' : 'text-[#94a3b8]'
                }`}
              >
                {isRecording ? (isMicCapturing ? 'mic' : 'mic_none') : 'mic_off'}
              </span>
              <span className="hidden sm:inline">
                {isRecording
                  ? isMicCapturing
                    ? isVoiceDetected
                      ? 'Captando fala... (computa em 2s de pausa)'
                      : 'Microfone Ligado e Pronto'
                    : 'Aguardando ativação do microfone'
                  : 'Microfone Pausado'}
              </span>

              {/* Mini equalizer inside footer badge */}
              {isRecording && isMicCapturing && (
                <div className="flex items-end gap-0.5 h-3.5 px-0.5">
                  <span
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isVoiceDetected ? 'bg-[#0284c7] h-3 animate-pulse' : 'bg-[#cbd5e1] h-1'
                    }`}
                  />
                  <span
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isVoiceDetected ? 'bg-[#0284c7] h-3.5 animate-pulse' : 'bg-[#cbd5e1] h-1.5'
                    }`}
                  />
                  <span
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isVoiceDetected ? 'bg-[#0284c7] h-2.5 animate-pulse' : 'bg-[#cbd5e1] h-1'
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Direct Connect button if mic is not yet capturing */}
            {isRecording && !isMicCapturing && (
              <button
                type="button"
                onClick={handleDirectMicActivation}
                className="px-3 py-2 rounded-xl bg-[#0284c7] text-white text-[12px] font-bold hover:bg-[#0369a1] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">mic</span>
                Ativar Microfone
              </button>
            )}
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

            {/* Synchronized Pause / Resume Button (Controlled both mic and timer) */}
            <button
              type="button"
              onClick={handleToggleListening}
              className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                isRecording
                  ? 'bg-[#fff1f2] text-[#ba1a1a] border border-[#fecdd3] hover:bg-[#ffe4e6]'
                  : 'bg-[#f0f9ff] text-[#0284c7] border border-[#bae6fd] hover:bg-[#e0f2fe]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
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
