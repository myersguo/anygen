
import React, { useState } from 'react';
import { Home, Presentation, FileText, BookOpen, BarChart3, Mic2, Menu, X, Sparkles, Search, Bot } from 'lucide-react';
import { AppView } from './types';
import HomeView from './components/HomeView';
import SlidesView from './components/SlidesView';
import DocsView from './components/DocsView';
import StoryView from './components/StoryView';
import DataView from './components/DataView';
import AudioView from './components/AudioView';
import ResearchView from './components/ResearchView';
import AgentView from './components/AgentView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pendingAgentInput, setPendingAgentInput] = useState<string | null>(null);

  const handleStartAgent = (prompt: string) => {
    setPendingAgentInput(prompt);
    setCurrentView('agent');
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'agent', label: 'AI Agent (Autonomous)', icon: Bot },
    { id: 'research', label: 'Web Researcher', icon: Search },
    { id: 'slides', label: 'Slides Generator', icon: Presentation },
    { id: 'docs', label: 'Doc Writer', icon: FileText },
    { id: 'stories', label: 'Picture Book', icon: BookOpen },
    { id: 'data', label: 'Data Analyst', icon: BarChart3 },
    { id: 'audio', label: 'Audio Summarizer', icon: Mic2 },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'home': return <HomeView onNavigate={setCurrentView} onStartAgent={handleStartAgent} />;
      case 'agent': return <AgentView initialInput={pendingAgentInput} onClearInitialInput={() => setPendingAgentInput(null)} />;
      case 'research': return <ResearchView />;
      case 'slides': return <SlidesView />;
      case 'docs': return <DocsView />;
      case 'stories': return <StoryView />;
      case 'data': return <DataView />;
      case 'audio': return <AudioView />;
      default: return <HomeView onNavigate={setCurrentView} onStartAgent={handleStartAgent} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`glass transition-all duration-300 z-50 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          {isSidebarOpen && <span className="font-bold text-xl tracking-tight">GenAI Nexus</span>}
        </div>

        <nav className="flex-1 mt-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id !== 'agent') setPendingAgentInput(null);
                setCurrentView(item.id as AppView);
              }}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
                currentView === item.id 
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[#030712]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto p-8 h-full">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
