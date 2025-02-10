import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Pause, Play, Settings, Download, Rotate3D as Rotate, X } from 'lucide-react';

interface Voice {
  name: string;
  lang: string;
  voiceURI: string;
}

function App() {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const speechSynthesis = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].voiceURI);
      }
    };

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleSpeak = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    if (text) {
      utteranceRef.current = new SpeechSynthesisUtterance(text);
      utteranceRef.current.voice = voices.find(v => v.voiceURI === selectedVoice) || null;
      utteranceRef.current.rate = rate;
      utteranceRef.current.pitch = pitch;

      utteranceRef.current.onstart = () => setIsPlaying(true);
      utteranceRef.current.onend = () => setIsPlaying(false);
      utteranceRef.current.onerror = () => setIsPlaying(false);

      speechSynthesis.speak(utteranceRef.current);
    }
  };

  const handlePause = () => {
    if (speechSynthesis.speaking) {
      if (isPlaying) {
        speechSynthesis.pause();
      } else {
        speechSynthesis.resume();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'speech-text.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Volume2 className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">Text to Speech</h1>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <Settings className="w-6 h-6 text-gray-600" />
          </button>
        </header>

        <main className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex gap-6">
            <div className="flex-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here..."
                className="w-full h-64 p-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  <button
                    onClick={handleSpeak}
                    disabled={!text || isPlaying}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Play
                  </button>
                  <button
                    onClick={handlePause}
                    disabled={!speechSynthesis.speaking}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    onClick={handleStop}
                    disabled={!speechSynthesis.speaking}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Stop
                  </button>
                </div>
                <button
                  onClick={handleDownload}
                  disabled={!text}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Text
                </button>
              </div>
            </div>

            {showSettings && (
              <div className="w-72 border-l border-gray-200 pl-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Voice
                    </label>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="w-full rounded-md border border-gray-300 py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {voices.map((voice) => (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Speed: {rate}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={rate}
                      onChange={(e) => setRate(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pitch: {pitch}
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={pitch}
                      onChange={(e) => setPitch(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;