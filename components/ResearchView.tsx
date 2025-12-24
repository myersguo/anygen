
import React, { useState } from 'react';
import { Send, Loader2, Globe, ExternalLink, Clipboard } from 'lucide-react';
import { researchWeb } from '../services/geminiService';
import { ResearchResult } from '../types';

const ResearchView: React.FC = () => {
  const [prompt, setPrompt] = useState(`Please read the following page carefully and systematically analyze the engineering positions Google is currently hiring for and their skill requirements:

Target URL:

https://www.google.com/about/careers/applications/jobs/results`);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);

  const handleResearch = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const data = await researchWeb(prompt);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Globe className="text-indigo-400" /> Web Researcher
        </h2>
        <p className="text-gray-400">Deep analysis of web content, careers, and live information.</p>
      </div>

      <div className="glass rounded-[32px] p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider ml-2">Research Goal & URL</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-black/40 border border-white/5 p-6 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all h-64 text-gray-200 resize-none"
            placeholder="Enter your research prompt and URLs..."
          />
        </div>
        <button
          onClick={handleResearch}
          disabled={loading || !prompt}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 transition-all"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          Start Systematic Research
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center py-20 space-y-4 animate-pulse">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-gray-400 text-lg">Gathering data and analyzing pages... This may take a moment.</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="glass p-10 rounded-[40px] border-indigo-500/10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">Research Findings</h3>
              <button 
                onClick={() => navigator.clipboard.writeText(result.text)}
                className="p-2 hover:bg-white/5 rounded-lg text-gray-400 transition-all"
              >
                <Clipboard className="w-5 h-5" />
              </button>
            </div>
            <div className="prose prose-invert max-w-none whitespace-pre-wrap text-gray-300 leading-relaxed text-lg">
              {result.text}
            </div>
          </div>

          {result.sources.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center gap-2 px-2">
                <ExternalLink className="w-4 h-4 text-indigo-400" /> Grounding Sources
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.sources.map((source, i) => (
                  <a
                    key={i}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass p-4 rounded-xl flex items-center justify-between hover:bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all group"
                  >
                    <span className="text-sm font-medium text-gray-400 truncate mr-4">{source.title}</span>
                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResearchView;
