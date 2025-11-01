import React, { useMemo } from 'react';

interface ResultCardProps {
  analysis: string;
}

interface ParsedAnalysis {
  perspectiveA: { title: string; content: string };
  perspectiveB: { title: string; content: string };
}

const parseAnalysis = (text: string): ParsedAnalysis => {
  const result: ParsedAnalysis = {
    perspectiveA: { title: 'Il mondo visto da A', content: 'Analisi non disponibile.' },
    perspectiveB: { title: 'Il mondo visto da B', content: 'Analisi non disponibile.' },
  };

  const headerRegex = /(?:\d\.\s*)?\*\*(.*?)\*\*/g;
  const headers = [...text.matchAll(headerRegex)];

  if (headers.length >= 2) {
    try {
      // Section A
      const headerA = headers[0];
      const contentStartIndexA = headerA.index! + headerA[0].length;
      const contentEndIndexA = headers[1].index!;
      result.perspectiveA = {
        title: headerA[1].trim(),
        content: text.substring(contentStartIndexA, contentEndIndexA).trim(),
      };

      // Section B
      const headerB = headers[1];
      const contentStartIndexB = headerB.index! + headerB[0].length;
      result.perspectiveB = {
        title: headerB[1].trim(),
        content: text.substring(contentStartIndexB).trim(),
      };
    } catch (e) {
       console.error("Error parsing analysis subsections:", e);
    }
  } else {
     console.warn('Could not parse AI response, format unexpected:', text);
  }
  
  return result;
};


const Section: React.FC<{ title: string; content: string; icon: React.ReactElement; colorClass: string }> = ({ title, content, icon, colorClass }) => (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <div className="flex items-center mb-3">
            <div className={`mr-4 p-2 rounded-full ${colorClass}`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-200">{title}</h3>
        </div>
        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
);

const PersonIcon = ({ className = 'text-white' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);


const ResultCard: React.FC<ResultCardProps> = ({ analysis }) => {
  const parsed = useMemo(() => parseAnalysis(analysis), [analysis]);
  
  return (
    <div className="bg-slate-900/70 p-6 rounded-lg backdrop-blur-sm border border-slate-700/50 shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Analisi Empatica</h2>
        <div className="space-y-6">
            <Section 
                title={parsed.perspectiveA.title} 
                content={parsed.perspectiveA.content}
                icon={<PersonIcon className="text-cyan-300" />}
                colorClass="bg-cyan-500/30"
            />
            <Section 
                title={parsed.perspectiveB.title} 
                content={parsed.perspectiveB.content}
                icon={<PersonIcon className="text-rose-300" />}
                colorClass="bg-rose-500/30"
            />
        </div>
    </div>
  );
};

export default ResultCard;