import React, { useState, useEffect, useRef } from 'react';
import { Mic, Loader2 } from 'lucide-react';

export default function VoiceDictationButton({
  onTranscript,
  className = '',
  buttonText = 'Narrar por Voz',
  disabled = false,
}) {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [hasSpeechApi, setHasSpeechApi] = useState(true);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setHasSpeechApi(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          onTranscript?.(currentTranscript.trim());
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition warning:', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('SpeechRecognition initialization notice:', err);
      setHasSpeechApi(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, [onTranscript]);

  // Transcrever áudio via API Gemini (fallback universal de microfone)
  const sendAudioToGemini = async (audioBlob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64data = reader.result;
        try {
          const res = await fetch('/api/gemini/transcribe-audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioData: base64data,
              mimeType: audioBlob.type || 'audio/webm',
            }),
          });
          const data = await res.json();
          if (data.transcript && data.transcript.trim()) {
            onTranscript?.(data.transcript.trim());
          }
        } catch (err) {
          console.warn('Erro ao transcrever com Gemini:', err);
        } finally {
          setIsTranscribing(false);
        }
      };
    } catch (err) {
      console.warn('Erro ao processar blob de áudio:', err);
      setIsTranscribing(false);
    }
  };

  const toggleListening = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Se já estiver transcrevendo, aguarda
    if (isTranscribing) return;

    // Caso 1: Navegador possui SpeechRecognition nativo
    if (hasSpeechApi && recognitionRef.current) {
      if (isListening) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
        setIsListening(false);
      } else {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (err) {
          console.warn('SpeechRecognition start failed, falling back to MediaRecorder:', err);
          startMediaRecorderFallback();
        }
      }
      return;
    }

    // Caso 2: Fallback com MediaRecorder (Chrome/Firefox/Safari/Mobile)
    if (isListening) {
      stopMediaRecorderFallback();
    } else {
      startMediaRecorderFallback();
    }
  };

  const startMediaRecorderFallback = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('Microfone não suportado no navegador atual.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        sendAudioToGemini(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsListening(true);
    } catch (err) {
      console.warn('Acesso ao microfone recusado ou indisponível:', err);
      setIsListening(false);
    }
  };

  const stopMediaRecorderFallback = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled || isTranscribing}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all select-none ${
        isTranscribing
          ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-xs'
          : isListening
          ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30 ring-2 ring-rose-400'
          : 'bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 border border-purple-200/80 shadow-xs'
      } ${className}`}
      title={
        isTranscribing
          ? 'Transcrevendo áudio com IA...'
          : isListening
          ? 'Gravando... Clique para parar e converter em texto'
          : 'Fale pelo microfone para narrar sua estampa'
      }
    >
      {isTranscribing ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
          <span>Transcrevendo voz...</span>
        </>
      ) : isListening ? (
        <>
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <Mic className="w-3.5 h-3.5 text-white animate-bounce" />
          <span>Ouvindo sua voz...</span>
        </>
      ) : (
        <>
          <Mic className="w-3.5 h-3.5 text-purple-600" />
          <span>{buttonText}</span>
        </>
      )}
    </button>
  );
}
