import React from 'react';
import { tools } from '../data/tools';
import ToolCard from '../components/ToolCard';

interface HomeProps {
  onSelectTool: (toolId: string) => void;
}

const Home: React.FC<HomeProps> = ({ onSelectTool }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 font-sans flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto text-center">
        <header className="mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Strumenti di Empatia
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-slate-400">Seleziona uno strumento per iniziare il tuo allenamento.</p>
        </header>

        <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onClick={() => onSelectTool(tool.id)}
              />
            ))}
            {/* Aggiungiamo una card disabilitata per mostrare che arriveranno altri strumenti */}
            <div className="bg-slate-800/50 border border-dashed border-slate-700 rounded-xl p-6 text-center w-full h-full flex flex-col items-center justify-center">
                <span className="text-5xl mb-4" role="img" aria-label="tools">🛠️</span>
                <h3 className="text-xl font-bold text-slate-400 mb-2">Nuovi Strumenti</h3>
                <p className="text-slate-500">In arrivo prossimamente...</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
