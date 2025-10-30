import React, { useState, useEffect, useRef } from 'react';
import { analyzeKindness, KindnessResult } from '../services/geminiService';
import Spinner from '../components/Spinner';

// Fix for TypeScript: Add missing types for the Web Speech API
// These types are not included in the default TS DOM library
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  serviceURI: string;
  abort(): void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly confidence: number;
  readonly transcript: string;
}

interface SpeechGrammar {
  src: string;
  weight: number;
}

interface SpeechGrammarList {
  readonly length: number;
  addFromString(string: string, weight?: number): void;
  addFromURI(src: string, weight?: number): void;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

interface KindnessDetectorProps {
  onGoHome: () => void;
}

type Tab = 'write' | 'speak';
type ResultType = 'safe' | 'harmful' | 'empty' | 'error';

// === COMPONENTI ICONA ===
const WriteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17.707 3.293a1 1 0 010 1.414l-11 11a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L6 13.586l10.293-10.293a1 1 0 011.414 0z" clipRule="evenodd" /><path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L13 7.414l-1.293 1.293a1 1 0 01-1.414-1.414l2-2z" /></svg>;
const SpeakIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const MicIcon = () => <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>;


const KindnessDetector: React.FC<KindnessDetectorProps> = ({ onGoHome }) => {
  const [activeTab, setActiveTab] = useState<Tab>('write');
  const [textInput, setTextInput] = useState<string>('');
  const [result, setResult] = useState<KindnessResult | null>(null);
  const [resultType, setResultType] = useState<ResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [micStatus, setMicStatus] = useState('Tocca per parlare');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicStatus('Riconoscimento vocale non supportato.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'it-IT';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        setMicStatus('Ti sto ascoltando...');
    };

    recognition.onend = () => {
        setMicStatus('Tocca per parlare');
    };

    recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setTextInput(speechResult);
        setActiveTab('write');
        setResult(null);
        setResultType(null);
    };

    recognition.onerror = (event) => {
        let errorMsg = 'Errore, non ho capito bene.';
        if (event.error === 'no-speech') errorMsg = 'Non ho sentito nulla. Riprova.';
        if (event.error === 'audio-capture') errorMsg = 'Non riesco ad accedere al microfono.';
        if (event.error === 'not-allowed') errorMsg = 'Permesso per il microfono negato.';
        setMicStatus(errorMsg);
        setTimeout(() => setMicStatus('Tocca per parlare'), 3000);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleAnalyze = async () => {
    if (!textInput.trim()) {
      setResultType('empty');
      setResult(null);
      return;
    }

    setIsLoading(true);
    setResult(null);
    setResultType(null);
    setError(null);

    try {
      const aiResult = await analyzeKindness(textInput);
      setResult(aiResult);
      setResultType(aiResult.isHarmful ? 'harmful' : 'safe');
    } catch (err) {
      setError('Si è verificato un errore durante la comunicazione con l\'IA. Riprova.');
      setResultType('error');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (recognitionRef.current) {
        try {
            recognitionRef.current.start();
        } catch (e) {
            console.error("Speech recognition could not be started: ", e);
        }
    }
  };
  
  const ResultDisplay = () => {
    if (!resultType) return null;

    let bgColor = '';
    let textColor = '';
    let title = '';
    let message = '';
    
    switch (resultType) {
        case 'safe':
            bgColor = 'bg-green-500/10 border border-green-500/30';
            textColor = 'text-green-300';
            title = '✅ Ottimo!';
            message = result?.reason ?? '';
            break;
        case 'harmful':
            bgColor = 'bg-yellow-500/10 border border-yellow-500/30';
            textColor = 'text-yellow-300';
            title = '🤔 Attenzione...';
            message = result?.reason ?? '';
            break;
        case 'empty':
            bgColor = 'bg-slate-700/50 border border-slate-600';
            textColor = 'text-slate-300';
            title = 'Aspetta!';
            message = 'Devi prima scrivere o dire qualcosa da analizzare.';
            break;
        case 'error':
            bgColor = 'bg-red-500/10 border border-red-500/30';
            textColor = 'text-red-300';
            title = 'Spiacente, c\'è un errore';
            message = error ?? 'Errore sconosciuto.';
            break;
    }

    return (
        <div className={`mt-6 p-4 rounded-lg text-center ${bgColor} ${textColor}`}>
            <h3 className="text-xl font-bold mb-2 text-slate-100">{title}</h3>
            <p className="text-base">{message}</p>
            {result?.isHarmful && result.suggestion && (
                <p className="text-base mt-3 font-medium bg-slate-800/50 p-3 rounded-md text-slate-300">
                    Forse potresti dire: <span className="italic">"{result.suggestion}"</span>
                </p>
            )}
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8 relative">
          <button
            onClick={onGoHome}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-2 group"
            aria-label="Torna alla selezione degli strumenti"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Strumenti</span>
          </button>
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
            Rilevatore di Gentilezza
          </h1>
          <p className="mt-2 text-lg text-slate-400">Analisi con AI per un linguaggio rispettoso.</p>
        </header>

        <main className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 sm:p-8 shadow-2xl">
            {/* Selettore Schede */}
            <div className="flex gap-2 mb-4 p-1 bg-slate-900/50 rounded-lg">
                <button onClick={() => setActiveTab('write')} className={`w-1/2 py-2 px-4 rounded-md transition-all flex items-center justify-center gap-2 font-semibold ${activeTab === 'write' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                    Scrivi ✍️
                </button>
                <button onClick={() => setActiveTab('speak')} className={`w-1/2 py-2 px-4 rounded-md transition-all flex items-center justify-center gap-2 font-semibold ${activeTab === 'speak' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                    Parla 🎙️
                </button>
            </div>
            
            {/* Contenuto Schede */}
            <div>
                {activeTab === 'write' ? (
                    <div>
                        <textarea
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            className="w-full h-32 p-3 bg-slate-800 border border-slate-600 rounded-lg text-lg text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                            placeholder="Scrivi o incolla qui il tuo commento..."
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-32 bg-slate-800 border border-slate-600 rounded-lg">
                        <button onClick={handleMicClick} disabled={!recognitionRef.current || micStatus === 'Ti sto ascoltando...'} className="bg-blue-500 text-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg transition-transform duration-200 ease-out hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100">
                           <MicIcon />
                        </button>
                        <p className="text-slate-400 mt-3 text-sm h-5">{micStatus}</p>
                    </div>
                )}
            </div>
            
            {/* Pulsante Analizza */}
            {activeTab === 'write' && (
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading || !textInput}
                    className="w-full bg-green-600 text-white text-lg font-bold py-3 mt-4 rounded-lg shadow-md hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Spinner />
                            <span>Analizzando...</span>
                        </>
                    ) : (
                        'Analizza Ora'
                    )}
                </button>
            )}
            
            <ResultDisplay />
        </main>
        
        <p className="text-xs text-slate-500 text-center mt-6">
            Analisi potenziata da AI. Richiede una connessione internet.
        </p>
      </div>
    </div>
  );
};

export default KindnessDetector;