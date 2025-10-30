import React, { useState, useCallback } from 'react';
import { getBridgeAnalysis } from '../services/geminiService';
import Spinner from '../components/Spinner';
import ResultCard from '../components/ResultCard';

interface PerspectiveSimulatorProps {
  onGoHome: () => void;
}

const PerspectiveSimulator: React.FC<PerspectiveSimulatorProps> = ({ onGoHome }) => {
  const [perspectiveA, setPerspectiveA] = useState<string>('');
  const [perspectiveB, setPerspectiveB] = useState<string>('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFindBridge = useCallback(async () => {
    if (!perspectiveA || !perspectiveB) {
      setError('Entrambi i punti di vista sono necessari.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

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

  const handleReset = () => {
    setPerspectiveA('');
    setPerspectiveB('');
    setAnalysis(null);
    setError(null);
  };

  const showResetButton = perspectiveA || perspectiveB || analysis || error;

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto">
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
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Simulatore di Prospettive
          </h1>
          <p className="mt-2 text-lg text-slate-400">L'Allenatore di Empatia</p>
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
        </main>
      </div>
    </div>
  );
};

export default PerspectiveSimulator;
