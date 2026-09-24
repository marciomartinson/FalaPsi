import { ClinicalDecision } from '../types/clinical';

export type DiarizationMode = 'auto' | 'doctor' | 'patient';

export interface SpeakerDiarizationResult {
  role: 'doctor' | 'patient';
  speaker: string;
  confidence: number;
  reason: string;
}

/**
 * Intelligent speaker identification for psychiatric teleconsultation.
 * Analyzes lexical markers, conversational roles, clinical questions, and conducts.
 */
export function detectSpeakerRole(
  text: string,
  patientName: string,
  doctorName: string = 'Dr. Roberto Guimarães',
  lastRole?: 'doctor' | 'patient',
  forcedMode: DiarizationMode = 'auto',
  lastUtteranceText?: string
): SpeakerDiarizationResult {
  if (forcedMode === 'doctor') {
    return {
      role: 'doctor',
      speaker: doctorName,
      confidence: 1.0,
      reason: 'Modo fixado no Médico',
    };
  }

  if (forcedMode === 'patient') {
    return {
      role: 'patient',
      speaker: patientName,
      confidence: 1.0,
      reason: 'Modo fixado no Paciente',
    };
  }

  const clean = text.toLowerCase().trim();

  // 1. Direct address to Doctor -> High confidence Patient
  if (/\b(doutor|doutora|dr\.|dra\.|dr\b|dra\b)\b/i.test(clean)) {
    return {
      role: 'patient',
      speaker: patientName,
      confidence: 0.98,
      reason: 'Vocativo ao médico ("Doutor")',
    };
  }

  // 2. Doctor markers (Questions, conduct, orientation, medical terms, greetings)
  const doctorPatterns = [
    /\b(olá|bom dia|boa tarde|boa noite|como vai|tudo bem|pode sentar|sente-se|fique à vontade|bem-vindo|bem-vinda)\b/i,
    /\b(como (você|vc|está|foi|tem sido|estão|anda)|o que te traz|o que te trouxe|como você se sente|como tem passado|me (conta|diga|fale|explique))\b/i,
    /\b(você (está|tem|conseguiu|tomou|sentiu|percebeu|acha)|está tomando|tomou a medicação|esqueceu alguma|efeito adverso|teve palpitação|teve tremor|está conseguindo dormir|como está seu apetite|quantas horas de sono)\b/i,
    /\b(vamos (manter|ajustar|trocar|aumentar|reduzir|começar|iniciar|agendar|acompanhar|fazer|solicitar)|vou (manter|ajustar|prescrever|receitar|solicitar|pedir|encaminhar|orientar|aumentar|reduzir))\b/i,
    /\b(prescrição|receita|posologia|miligramas|\bmg\b|comprimido|comprimidos|gotas|retorno|daqui a|na próxima consulta|agendar retorno)\b/i,
    /\b(litemia|hemograma|tsh|exame|exames|eletrocardiograma|ecg|psicoterapia|terapia|psicólogo|psicóloga|tcc|encaminhamento|atestado|laudo|diagnóstico|transtorno|quadro|episódio)\b/i,
    /\b(algum (efeito|sintoma|pensamento|problema)|onde|quando começou|desde quando|quantas horas|dormiu bem)\b/i,
    /\b(compreendo|entendi perfeitamente|vamos acompanhar de perto|estou anotando|vamos verificar isso)\b/i,
    /\?$/, // Questions are typical doctor clinical probes
  ];

  // 3. Patient markers (Subjective complaints, emotional state, bodily symptoms, relatives, medication intake)
  const patientPatterns = [
    /\b(eu (sinto|estou|tenho|não consigo|não sei|tomei|esqueci|acordo|chorei|fico|passei|notei|percebi|estive|tive)|me sinto|me dá|tenho sentido|não durmo|acordo no meio da noite)\b/i,
    /\b(minha cabeça|meu peito|meu corpo|minha mente|minha ansiedade|meu estômago|minha memória|meu coração|minha respiração|meus pensamentos)\b/i,
    /\b(angústia|desespero|tristeza|insônia|pesadelo|cansaço|desânimo|às vezes penso|não quero mais|medo de|nervosa|nervoso|choro|pânico|aperto|coração acelerado|falta de ar|pensamento acelerado|sem vontade|crise)\b/i,
    /\b(minha mãe|meu pai|meu marido|minha esposa|meu filho|meu namorado|minha namorada|meu trabalho|meu chefe|meus colegas|em casa|na faculdade|na rua|de noite|de madrugada)\b/i,
    /\b(o remédio me deu|tomei o|estou tomando|senti uma melhora|piorou|melhorou|não adiantou nada|boca seca|enjoo|tontura|sonolência|não fez efeito|me ajudou bastante)\b/i,
    /\b(acho que|não sei se|tenho medo|tô com medo|tô sentindo|fiquei preocupado|fiquei preocupada)\b/i,
    /\b(sim\, melhorei|não\, ainda não|mais ou menos|continua igual|sinto o mesmo)\b/i,
  ];

  let doctorScore = 0;
  let patientScore = 0;

  for (const p of doctorPatterns) {
    if (p.test(clean)) doctorScore += 1.6;
  }

  for (const p of patientPatterns) {
    if (p.test(clean)) patientScore += 1.6;
  }

  // Conversational context check:
  // If previous utterance was a question from the doctor, subsequent response is almost certainly the patient!
  const lastWasDoctorQuestion =
    lastRole === 'doctor' &&
    lastUtteranceText &&
    (lastUtteranceText.trim().endsWith('?') ||
      /\b(como|qual|quando|onde|quanto|conseguiu|tomou|sentiu)\b/i.test(lastUtteranceText));

  if (lastWasDoctorQuestion) {
    patientScore += 2.2;
  } else if (lastRole === 'doctor') {
    // Speaker continuity: If doctor was speaking and didn't ask a question, continuation is the doctor!
    doctorScore += 1.4;
  } else if (lastRole === 'patient') {
    // Speaker continuity: If patient was speaking, continuation is the patient!
    patientScore += 1.4;
  }

  // Decision with margin
  if (doctorScore > patientScore + 0.4) {
    return {
      role: 'doctor',
      speaker: doctorName,
      confidence: Math.min(0.98, 0.72 + (doctorScore - patientScore) * 0.08),
      reason: 'Linguagem médica / conduta / pergunta clínica',
    };
  }

  if (patientScore > doctorScore + 0.4) {
    return {
      role: 'patient',
      speaker: patientName,
      confidence: Math.min(0.98, 0.72 + (patientScore - doctorScore) * 0.08),
      reason: lastWasDoctorQuestion ? 'Resposta à pergunta do médico' : 'Relato subjetivo / queixa do paciente',
    };
  }

  // Fallback: Preserve continuity of the current speaker instead of erratically switching
  if (lastRole === 'patient') {
    return {
      role: 'patient',
      speaker: patientName,
      confidence: 0.78,
      reason: 'Continuidade de fala do paciente',
    };
  }

  if (lastRole === 'doctor') {
    return {
      role: 'doctor',
      speaker: doctorName,
      confidence: 0.78,
      reason: 'Continuidade de fala do médico',
    };
  }

  // Initial consultation greeting fallback
  return {
    role: 'doctor',
    speaker: doctorName,
    confidence: 0.85,
    reason: 'Início do diálogo (Médico)',
  };
}

/**
 * Checks for explicit psychiatric risk expressions in transcribed text.
 * Rule: never summarized or softened; triggers top alert with literal quotation.
 */
export function detectRiskMention(text: string): boolean {
  const clean = text.toLowerCase();
  return (
    clean.includes('não acordar') ||
    clean.includes('desaparecer') ||
    clean.includes('morrer') ||
    clean.includes('suicíd') ||
    clean.includes('me matar') ||
    clean.includes('acabar com tudo') ||
    clean.includes('tirar minha vida') ||
    clean.includes('não aguento mais viver') ||
    clean.includes('autoles') ||
    clean.includes('me cortar')
  );
}

/**
 * Extracts formal clinical decisions (exams and referrals) only if spoken by the doctor.
 */
export function detectClinicalDecisions(
  text: string,
  speakerRole: 'doctor' | 'patient',
  timestamp: string
): ClinicalDecision[] {
  if (speakerRole !== 'doctor') return [];

  const clean = text.toLowerCase();
  const decisions: ClinicalDecision[] = [];

  // Exams
  if (
    clean.includes('litemia') ||
    clean.includes('lítio') ||
    (clean.includes('exame') && (clean.includes('sangue') || clean.includes('dosagem')))
  ) {
    decisions.push({
      id: `dec-${Date.now()}-exame`,
      type: 'exame',
      title: 'Pedido de Exame: Dosagem Sérica de Lítio (Litemia)',
      description: 'Monitoramento terapêutico solicitado pelo médico na teleconsulta.',
      doctorUtteranceSource: `Dr. Roberto: "${text}"`,
      timestamp,
      status: 'confirmado',
    });
  } else if (clean.includes('hemograma') || clean.includes('tsh') || (clean.includes('pedir') && clean.includes('exame'))) {
    decisions.push({
      id: `dec-${Date.now()}-exame-geral`,
      type: 'exame',
      title: 'Pedido de Exames Laboratoriais de Rotina',
      description: 'Solicitação laboratorial de controle clínico verbalizada pelo médico.',
      doctorUtteranceSource: `Dr. Roberto: "${text}"`,
      timestamp,
      status: 'confirmado',
    });
  }

  // Referrals
  if (clean.includes('psicoterapia') || clean.includes('terapia') || clean.includes('encaminhar')) {
    decisions.push({
      id: `dec-${Date.now()}-encaminhamento`,
      type: 'encaminhamento',
      title: 'Encaminhamento para Psicoterapia',
      description: 'Acompanhamento psicoterápico complementar acordado em consulta.',
      doctorUtteranceSource: `Dr. Roberto: "${text}"`,
      timestamp,
      status: 'confirmado',
    });
  }

  return decisions;
}
