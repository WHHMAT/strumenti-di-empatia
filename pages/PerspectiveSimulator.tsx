import React, { useState, useCallback } from 'react';
import { getBridgeAnalysis, evaluateReframedStatement, EvaluationResult } from '../services/geminiService';
import Spinner from '../components/Spinner';
import ResultCard from '../components/ResultCard';

interface PerspectiveSimulatorProps {
  onGoHome: () => void;
}

const FeedbackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.97l-2.714 4.224a2 2 0 00-.516 1.056v5.172e6M7 20h2.886c.163 0 .326.02.485.06l3.63 1.542a2 2 0 002.324-1.423l3.5-7A2 2 0 0018.764 12H14" />
    </svg>
);
const SuggestionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);


const PerspectiveSimulator: React.FC<PerspectiveSimulatorProps> = ({ onGoHome }) => {
  const [perspectiveA, setPerspectiveA] = useState<string>('');
  const [perspectiveB, setPerspectiveB] = useState<string>('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [reframedStatement, setReframedStatement] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  const handleFindBridge = useCallback(async () => {
    if (!perspectiveA || !perspectiveB) {
      setError('Entrambi i punti di vista sono necessari.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setReframedStatement('');
    setEvaluation(null);
    setEvaluationError(null);

    try {
      const result = await getBridgeAnalysis(perspectiveA, perspectiveB);
      setAnalysis(result);
    } catch (err) {
      setError('Si è verificato un errore durante la comunicazione con l\'IA. Riprova.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [perspectiveA, perspectiveB]);

  const handleEvaluateStatement = async () => {
    if (!reframedStatement) return;
    setIsEvaluating(true);
    setEvaluation(null);
    setEvaluationError(null);

    try {
        const result = await evaluateReframedStatement(perspectiveA, perspectiveB, reframedStatement);
        setEvaluation(result);
    } catch (err) {
        setEvaluationError('Non è stato possibile ottenere una valutazione. Riprova.');
        console.error(err);
    } finally {
        setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setPerspectiveA('');
    setPerspectiveB('');
    setAnalysis(null);
    setError(null);
    setReframedStatement('');
    setEvaluation(null);
    setEvaluationError(null);
  };

  const showResetButton = perspectiveA || perspectiveB || analysis || error;

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <header className="grid grid-cols-[1fr,auto,1fr] items-center gap-4 mb-8">
          <div className="justify-self-start">
            <button 
              onClick={onGoHome} 
              className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-2 group"
              aria-label="Torna alla selezione degli strumenti"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Strumenti</span>
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              Simulatore di Prospettive
            </h1>
            <p className="mt-2 text-lg text-slate-400">L'Allenatore di Empatia</p>
          </div>
          <div></div>
        </header>

        <main className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col">
              <label htmlFor="perspectiveA" className="mb-2 font-semibold text-slate-300">Punto di Vista A</label>
              <textarea
                id="perspectiveA"
                value={perspectiveA}
                onChange={(e) => setPerspectiveA(e.target.value)}
                placeholder="Cosa pensa o vuole la prima persona?"
                className="flex-grow p-4 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200 resize-none min-h-[150px]"
                aria-label="Punto di Vista A"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="perspectiveB" className="mb-2 font-semibold text-slate-300">Punto di Vista B</label>
              <textarea
                id="perspectiveB"
                value={perspectiveB}
                onChange={(e) => setPerspectiveB(e.target.value)}
                placeholder="Cosa pensa o vuole la seconda persona?"
                className="flex-grow p-4 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200 resize-none min-h-[150px]"
                aria-label="Punto di Vista B"
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleFindBridge}
              disabled={isLoading || !perspectiveA || !perspectiveB}
              className="px-8 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  <span className="ml-2">Analizzando...</span>
                </>
              ) : (
                'Trova un Ponte Empatico'
              )}
            </button>
            {showResetButton && (
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-slate-700 text-white font-bold rounded-lg shadow-lg hover:bg-slate-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-slate-500/50"
              >
                Nuova Prova
              </button>
            )}
          </div>

          <div className="mt-8">
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
                {error}
              </div>
            )}
            {analysis && <ResultCard analysis={analysis} />}
          </div>

          {analysis && !isLoading && (
            <div className="mt-8 bg-slate-800/50 p-6 rounded-xl border border-slate-700 animate-fade-in">
              <h3 className="text-2xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Ora prova tu!
              </h3>
              <p className="text-slate-400 text-center mb-4">
                Dopo aver letto il punto di vista di B, come riformuleresti il tuo messaggio iniziale per essere più empatico?
              </p>
              <textarea
                value={reframedStatement}
                onChange={(e) => setReframedStatement(e.target.value)}
                placeholder="Scrivi qui la tua nuova frase..."
                className="w-full p-4 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-yellow-500 transition-shadow duration-200 resize-none min-h-[100px]"
                aria-label="Riformula la tua frase"
              />
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleEvaluateStatement}
                  disabled={isEvaluating || !reframedStatement}
                  className="px-8 py-3 bg-yellow-600 text-white font-bold rounded-lg shadow-lg hover:bg-yellow-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-500/50 flex items-center justify-center"
                >
                  {isEvaluating ? (
                    <>
                      <Spinner />
                      <span className="ml-2">Valutando...</span>
                    </>
                  ) : (
                    'Ricevi un feedback'
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="mt-8">
            {evaluationError && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
                {evaluationError}
              </div>
            )}
            {evaluation && (
                <div className="bg-slate-900/70 p-6 rounded-lg backdrop-blur-sm border border-slate-700/50 shadow-2xl">
                    <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">Feedback del Coach</h2>
                    <div className="space-y-6">
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                            <div className="flex items-center mb-3">
                                <div className="mr-4 p-2 rounded-full bg-green-500/30">
                                   <FeedbackIcon />
                                </div>
                                <h3 className="text-xl font-bold text-slate-200">La mia valutazione</h3>
                            </div>
                            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{evaluation.evaluation}</p>
                        </div>
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                            <div className="flex items-center mb-3">
                                <div className="mr-4 p-2 rounded-full bg-cyan-500/30">
                                   <SuggestionIcon />
                                </div>
                                <h3 className="text-xl font-bold text-slate-200">Un piccolo suggerimento</h3>
                            </div>
                            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap italic">"{evaluation.suggestion}"</p>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PerspectiveSimulator;