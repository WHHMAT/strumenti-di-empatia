import React from 'react';

// Un componente icona semplice per il nostro strumento
const HandshakeIcon = () => (
    React.createElement('span', { className: "text-5xl", role: "img", "aria-label": "handshake" }, '🤝')
);

// Icona per il Rilevatore di Gentilezza
const KindnessIcon = () => (
    React.createElement('span', { className: "text-5xl", role: "img", "aria-label": "cuore scintillante" }, '💖')
);

// Icona per l'Analizzatore Social
const SocialIcon = () => (
    React.createElement('span', { className: "text-5xl", role: "img", "aria-label": "grafico a barre" }, '📊')
);


export interface Tool {
  id: 'perspective-simulator' | 'kindness-detector' | 'social-content-analyzer';
  name: string;
  description: string;
  icon: React.FC;
}

export const tools: Tool[] = [
  {
    id: 'perspective-simulator',
    name: 'Simulatore di Prospettive',
    description: 'Analizza due punti di vista per trovare un terreno comune e una comunicazione efficace.',
    icon: HandshakeIcon,
  },
  {
    id: 'kindness-detector',
    name: 'Rilevatore di Gentilezza',
    description: 'Analizza un testo per promuovere un linguaggio rispettoso e gentile.',
    icon: KindnessIcon,
  },
  {
    id: 'social-content-analyzer',
    name: 'Analizzatore di Contenuti Social',
    description: 'Valuta l\'impatto emotivo e la potenziale tossicità di un testo o post social.',
    icon: SocialIcon,
  },
  // Possiamo aggiungere altri strumenti qui in futuro
];