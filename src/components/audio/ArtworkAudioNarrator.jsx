import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, Sparkles, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import VoiceDictationButton from './VoiceDictationButton';

export default function ArtworkAudioNarrator({
  narration = '',
  onNarrationChange,
  isEditable = false,
  title = '',
  description = '',
  prompt = '',
  category = '',
  artistName = '',
  className = '',
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [currentText, setCurrentText] = useState(narration);
  const utteranceRef = useRef(null);

  useEffect(() => {
    setCurrentText(narration);
  }, [narration]);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlayAudio = () => {
    const textToSpeak = currentText.trim() || description.trim() || title.trim();
    if (!textToSpeak || !window.speechSynthesis) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.95; // Slightly slower, more expressive and poetic
    utterance.pitch = 1.0;

    // Try finding a natural Portuguese voice if available
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.includes('pt-BR') || v.lang.includes('pt_BR') || v.lang.includes('pt'));
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleGenerateStory = async () => {
    if (isGeneratingStory) return;
    setIsGeneratingStory(true);
    try {
      const res = await fetch('/api/gemini/generate-narration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || currentText,
          prompt,
          category,
          artist_name: artistName
        })
      });
      const data = await res.json();
      if (data.narration) {
        setCurrentText(data.narration);
        onNarrationChange?.(data.narration);
      }
    } catch (err) {
      console.warn('Falha ao gerar narração:', err);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleVoiceTranscript = (newTranscript) => {
    const updated = currentText ? `${currentText} ${newTranscript}` : newTranscript;
    setCurrentText(updated);
    onNarrationChange?.(updated);
  };

  return (
    <div className={`rounded-2xl border border-purple-200/80 bg-gradient-to-br from-purple-50/60 via-white to-indigo-50/40 p-4 sm:p-5 shadow-xs ${className}`}>
      {/* Header com título e controle de áudio */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600/10 text-purple-700 flex items-center justify-center shrink-0">
            <Volume2 className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>Narração Autoral da Estampa</span>
              {isPlaying && (
                <span className="flex items-center gap-0.5 ml-2">
                  <span className="w-1 h-3 bg-purple-600 rounded-full animate-pulse" />
                  <span className="w-1 h-4 bg-purple-600 rounded-full animate-pulse delay-75" />
                  <span className="w-1 h-2 bg-purple-600 rounded-full animate-pulse delay-150" />
                </span>
              )}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              A história narrada em voz sobre a inspiração desta arte
            </p>
          </div>
        </div>

        {/* Botão Play / Parar Narração */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePlayAudio}
            disabled={!currentText.trim() && !description.trim() && !title.trim()}
            className={`h-9 px-3.5 rounded-xl font-bold text-xs transition-all shadow-xs ${
              isPlaying
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                : 'bg-white hover:bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-300'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 mr-1.5 fill-current" />
                Pausar Áudio
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 mr-1.5 fill-current text-purple-600" />
                Ouvir Narração
              </>
            )}
          </Button>

          {isEditable && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateStory}
              disabled={isGeneratingStory}
              className="h-9 px-3 rounded-xl bg-white hover:bg-purple-50 border-purple-200 text-purple-700 text-xs font-semibold"
              title="Gerar uma narrativa poética com IA a partir da sua arte"
            >
              {isGeneratingStory ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-purple-600" />
                  Criando...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />
                  Criar com IA
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Conteúdo da Narração (Texto ou Área de Edição) */}
      {isEditable ? (
        <div className="space-y-2 mt-2">
          <div className="relative">
            <Textarea
              rows={3}
              value={currentText}
              onChange={(e) => {
                setCurrentText(e.target.value);
                onNarrationChange?.(e.target.value);
              }}
              placeholder="Descreva a história ou o sentimento por trás desta estampa para as pessoas ouvirem..."
              className="rounded-xl bg-white border-slate-200 text-slate-800 text-xs leading-relaxed resize-none pr-28 shadow-xs"
            />
            <div className="absolute right-2.5 bottom-2.5">
              <VoiceDictationButton
                onTranscript={handleVoiceTranscript}
                buttonText="Ditar Voz"
                className="scale-90"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Dite pelo microfone ou clique em "Criar com IA" para gerar a história.</span>
            {currentText && (
              <button
                type="button"
                onClick={() => {
                  setCurrentText('');
                  onNarrationChange?.('');
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Limpar
              </button>
            )}
          </p>
        </div>
      ) : (
        <div className="bg-white/80 rounded-xl p-3 border border-purple-100/80 text-xs text-slate-700 leading-relaxed italic">
          "{currentText || description || 'Uma criação autoral exclusiva da Céu Criativa.'}"
        </div>
      )}
    </div>
  );
}
