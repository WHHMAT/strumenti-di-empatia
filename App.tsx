import React, { useState } from 'react';
import Home from './pages/Home';
import PerspectiveSimulator from './pages/PerspectiveSimulator';
import KindnessDetector from './pages/KindnessDetector';
import SocialContentAnalyzer from './pages/SocialContentAnalyzer';

// Definiamo i tipi di pagina per una maggiore sicurezza del tipo
type Page = 'home' | 'perspective-simulator' | 'kindness-detector' | 'social-content-analyzer';

const App: React.FC = () => {
  // Lo stato tiene traccia della pagina/strumento attualmente selezionato
  const [currentPage, setCurrentPage] = useState<Page>('home');

  // Funzione per renderizzare la pagina corretta in base allo stato
  const renderPage = () => {
    switch (currentPage) {
      case 'perspective-simulator':
        return <PerspectiveSimulator onGoHome={() => setCurrentPage('home')} />;
      case 'kindness-detector':
        return <KindnessDetector onGoHome={() => setCurrentPage('home')} />;
      case 'social-content-analyzer':
        return <SocialContentAnalyzer onGoHome={() => setCurrentPage('home')} />;
      case 'home':
      default:
        // Passiamo una funzione callback a Home per permettergli di cambiare la pagina
        return <Home onSelectTool={(toolId) => setCurrentPage(toolId as Page)} />;
    }
  };

  // Renderizza la pagina corrente
  return <>{renderPage()}</>;
};

export default App;