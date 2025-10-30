import React from 'react';
import { Tool } from '../data/tools';

interface ToolCardProps {
  tool: Tool;
  onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  const Icon = tool.icon;
  return (
    <button
      onClick={onClick}
      className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-left w-full h-full flex flex-col items-center text-center hover:bg-slate-700/50 hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
      aria-label={`Seleziona lo strumento ${tool.name}`}
    >
      <div className="mb-4">
        <Icon />
      </div>
      <h3 className="text-xl font-bold text-slate-100 mb-2">{tool.name}</h3>
      <p className="text-slate-400 flex-grow">{tool.description}</p>
    </button>
  );
};

export default ToolCard;
