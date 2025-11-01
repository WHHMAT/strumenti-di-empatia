import React, { useState } from 'react';
import { analyzeSocialContent, SocialAnalysisResult } from '../services/geminiService';
import Spinner from '../components/Spinner';

interface SocialContentAnalyzerProps {
  onGoHome: () => void;
}

// Mappa delle definizioni dei parametri
const parameterDefinitions: { [key in keyof SocialAnalysisResult]: string } = {
  "Tossicità": "Commento rude, irrispettoso o irragionevole che potrebbe spingere qualcuno ad abbandonare una discussione.",
  "Tossicità Grave": "Un commento particolarmente aggressivo o odioso.",
  "Attacco all'Identità": "Commento negativo che prende di mira qualcuno sulla base della sua identità (etnia, religione, orientamento sessuale, ecc.).",
  "Insulto": "Commento offensivo o denigratorio rivolto a una persona o a un gruppo.",
  "Volgarità": "Presenza di parolacce e linguaggio osceno.",
  "Minaccia": "Riferimento a una minaccia di violenza fisica.",
};

// Funzione per ottenere il colore della barra in base al punteggio
const getBarColor = (score: number) => {
  if (score > 0.7) return 'bg-red-500';
  if (score > 0.4) return 'bg-yellow-500';
  return 'bg-green-500';
};

const SocialContentAnalyzer: React.FC<SocialContentAnalyzerProps> = ({ onGoHome }) => {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<SocialAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Inserisci un testo da analizzare.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeSocialContent(text);
      setAnalysis(result);
    } catch (err) {
      setError("Si è verificato un errore durante l'analisi. Riprova.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl mx-auto">
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
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
              Analizzatore di Contenuti Social
            </h1>
            <p className="mt-2 text-lg text-slate-400">Valuta il potenziale impatto emotivo e la tossicità del tuo testo.</p>
          </div>
          <div></div>
        </header>

        <main className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 sm:p-8 shadow-2xl">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Incolla qui il testo del tuo post o messaggio..."
            className="w-full h-40 p-3 bg-slate-800 border border-slate-600 rounded-lg text-lg text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          />
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !text}
            className="w-full bg-blue-600 text-white text-lg font-bold py-3 mt-4 rounded-lg shadow-md hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Spinner />
                <span>Analizzando...</span>
              </>
            ) : (
              'Analizza Testo'
            )}
          </button>

          {error && (
            <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
              {error}
            </div>
          )}

          {analysis && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-slate-200 text-center mb-4">Risultati dell'Analisi</h2>
              <div className="space-y-3">
                {Object.entries(analysis).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1 text-slate-300">
                      <span>{key}</span>
                      {/* Fix: The value from Object.entries is 'unknown', so it must be cast to 'number' for arithmetic operations. */}
                      <span className="font-semibold text-slate-100">{((value as number) * 100).toFixed(2)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                      <div
                        // Fix: The value from Object.entries is 'unknown', so it must be cast to 'number' before passing to getBarColor.
                        className={`${getBarColor(value as number)} h-2.5 rounded-full transition-all duration-500`}
                        // Fix: The value from Object.entries is 'unknown', so it must be cast to 'number' for arithmetic operations.
                        style={{ width: `${(value as number) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
        
        <section className="mt-10 bg-slate-800/50 border border-slate-700 rounded-xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-200 text-center mb-6">Definizione dei Parametri</h2>
            <div className="space-y-4">
                {Object.entries(parameterDefinitions).map(([key, value]) => (
                    <div key={key}>
                        <h3 className="font-bold text-slate-200">{key}</h3>
                        <p className="text-slate-400">{value}</p>
                    </div>
                ))}
            </div>
            <p className="text-xs text-slate-500 text-center mt-6">
              Nota: Questa è una valutazione automatica basata su modelli di AI. Usa sempre il tuo giudizio.
            </p>
        </section>

      </div>
    </div>
  );
};

export default SocialContentAnalyzer;
