
import React, { useState, useRef } from 'react';
import { Mic2, Square, Loader2, Play, FileAudio, Upload } from 'lucide-react';
import { summarizeAudio } from '../services/geminiService';

const AudioView: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Convert to base64 for Gemini
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64data = (reader.result as string).split(',')[1];
          setLoading(true);
          try {
            const result = await summarizeAudio(base64data, 'audio/webm');
            setSummary(result);
          } catch (error) {
            console.error(error);
          } finally {
            setLoading(false);
          }
        };
      };

      mediaRecorder.current.start();
      setRecording(true);
      setSummary('');
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setSummary('');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64data = (reader.result as string).split(',')[1];
      setLoading(true);
      try {
        const result = await summarizeAudio(base64data, file.type);
        setSummary(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Audio Summarizer</h2>
        <p className="text-gray-400">Record a note or upload a file for an instant summary.</p>
      </div>

      <div className="flex flex-col items-center gap-8 py-10">
        <div className="flex items-center gap-6">
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              recording 
                ? 'bg-rose-500 animate-pulse scale-110 shadow-lg shadow-rose-500/50' 
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30'
            }`}
          >
            {recording ? <Square className="text-white w-10 h-10" /> : <Mic2 className="text-white w-10 h-10" />}
          </button>

          <label className="w-24 h-24 rounded-full glass border-white/10 border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-indigo-500/50 hover:bg-white/5 transition-all">
            <Upload className="text-gray-400 w-8 h-8" />
            <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        {recording && (
          <div className="flex items-center gap-2 text-rose-500 font-bold">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            Recording...
          </div>
        )}

        {audioUrl && !recording && (
          <div className="w-full glass p-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
              <FileAudio className="text-indigo-400 w-5 h-5" />
            </div>
            <audio src={audioUrl} controls className="flex-1 h-10" />
          </div>
        )}
      </div>

      <div className="glass rounded-[40px] p-10 min-h-[300px]">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          Summary Result
        </h3>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-gray-400 animate-pulse text-lg">Gemini is listening and summarizing...</p>
          </div>
        ) : summary ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 text-gray-300 text-xl leading-relaxed">
            {summary}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
            <Mic2 className="w-16 h-16 mb-4" />
            <p className="text-lg italic">Start recording or upload a file to see the summary.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioView;
