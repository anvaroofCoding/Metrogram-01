import { useCallback, useEffect, useRef, useState } from "react";

export interface VoiceRecordingResult {
  blob: Blob;
  duration: number;
  waveform: number[];
  url: string;
}

const WAVEFORM_BARS = 28;

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [waveform, setWaveform] = useState<number[]>(() =>
    Array.from({ length: WAVEFORM_BARS }, () => 0.15),
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const cleanupAudio = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    analyserRef.current = null;
    void audioContextRef.current?.close();
    audioContextRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      cleanupAudio();
      stopTracks();
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, [cleanupAudio, stopTracks]);

  const sampleWaveform = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    const step = Math.floor(data.length / WAVEFORM_BARS);
    const next = Array.from({ length: WAVEFORM_BARS }, (_, i) => {
      const slice = data.slice(i * step, (i + 1) * step);
      const avg = slice.reduce((sum, v) => sum + v, 0) / slice.length;
      return Math.max(0.12, Math.min(1, avg / 180));
    });

    setWaveform(next);
    rafRef.current = requestAnimationFrame(sampleWaveform);
  }, []);

  const startRecording = useCallback(async () => {
    if (isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(100);
      startTimeRef.current = Date.now();
      setDuration(0);
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 250);

      rafRef.current = requestAnimationFrame(sampleWaveform);
    } catch {
      stopTracks();
      cleanupAudio();
    }
  }, [cleanupAudio, isRecording, sampleWaveform, stopTracks]);

  const stopRecording = useCallback((): Promise<VoiceRecordingResult | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        setIsRecording(false);
        cleanupAudio();
        stopTracks();
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const elapsed = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        const url = URL.createObjectURL(blob);
        const result: VoiceRecordingResult = {
          blob,
          duration: elapsed,
          waveform: [...waveform],
          url,
        };

        setIsRecording(false);
        setDuration(0);
        setWaveform(Array.from({ length: WAVEFORM_BARS }, () => 0.15));
        cleanupAudio();
        stopTracks();
        mediaRecorderRef.current = null;
        resolve(result);
      };

      recorder.stop();
    });
  }, [cleanupAudio, stopTracks, waveform]);

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.onstop = null;
      recorder.stop();
    }
    chunksRef.current = [];
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setDuration(0);
    setWaveform(Array.from({ length: WAVEFORM_BARS }, () => 0.15));
    cleanupAudio();
    stopTracks();
  }, [cleanupAudio, stopTracks]);

  return {
    isRecording,
    duration,
    durationLabel: formatDuration(duration),
    waveform,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
