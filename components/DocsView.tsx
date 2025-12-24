
import React, { useState } from 'react';
import { Send, Loader2, Clipboard, Check } from 'lucide-react';
import { generateDoc } from '../services/geminiService';

const DocsView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [doc, setDoc] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const content = await generateDoc(prompt);
      setDoc(content);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(doc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Document Writer</h2>
        <p className="text-gray-400">Generate professional reports, creative pieces, and more.</p>
      </div>

      <div className="flex-1 flex flex-col glass rounded-[40px] overflow-hidden">
        <div className="flex-1 p-8 overflow-y-auto whitespace-pre-wrap text-lg text-gray-300">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
              <p className="animate-pulse">Gemini is writing your document...</p>
            </div>
          ) : doc ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {doc}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
              <Clipboard className="w-16 h-16 mb-4" />
              <p>Your generated content will appear here.</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-black/40 border-t border-white/5 space-y-4">
          {doc && (
            <div className="flex justify-end">
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-all"
              >
                {copied ? <><Check className="w-4 h-4 text-emerald-400" /> Copied!</> : <><Clipboard className="w-4 h-4" /> Copy Text</>}
              </button>
            </div>
          )}
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What should I write for you today?"
              className="w-full bg-white/5 p-6 pr-32 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none h-24"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt}
              className="absolute right-3 bottom-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl flex items-center gap-2 transition-all font-bold shadow-lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsView;
