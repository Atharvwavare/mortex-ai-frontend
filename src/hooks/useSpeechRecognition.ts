import { useState, useRef, useCallback } from 'react'

export function useSpeechRecognition(onResult: (text: string) => void, onError?: (msg: string) => void) {
  const [listening, setListening] = useState(false)
  const [levels, setLevels] = useState<number[]>(new Array(20).fill(0))
  const [supported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  const recognitionRef = useRef<any>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopVisualizer = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    audioCtxRef.current?.close()
    setLevels(new Array(20).fill(0))
  }, [])

  const startVisualizer = useCallback(async () => {
    // Mobile requires user gesture, so we check if context is suspended
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume()
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream
    
    if (!audioCtxRef.current) {
      const audioCtx = new AudioContext()
      audioCtxRef.current = audioCtx
    }

    const source = audioCtxRef.current.createMediaStreamSource(stream)
    const analyser = audioCtxRef.current.createAnalyser()
    analyser.fftSize = 64
    source.connect(analyser)
    analyserRef.current = analyser

    const data = new Uint8Array(analyser.frequencyBinCount)
    const tick = () => {
      analyser.getByteFrequencyData(data)
      const bars = Array.from({ length: 20 }, (_, i) => data[i * 2] / 255)
      setLevels(bars)
      rafRef.current = requestAnimationFrame(tick)
    }
    tick()
  }, [])

  // --- FIX: Handle mobile by resuming AudioContext on user click ---
  const startFromClick = useCallback(async () => {
    if (!supported) {
      onError?.('Speech recognition is not supported in this browser.')
      return
    }

    // Resume AudioContext if it's suspended (required for mobile)
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume()
    }

    try {
      await startVisualizer()
    } catch {
      onError?.('Microphone access was blocked. Please allow mic permission and try again.')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      onResult(transcript)
    }
    recognition.onend = () => { setListening(false); stopVisualizer() }
    recognition.onerror = (event: any) => {
      setListening(false)
      stopVisualizer()
      const reason = event.error === 'not-allowed'
        ? 'Microphone permission denied.'
        : event.error === 'no-speech'
        ? 'No speech detected — try again.'
        : `Speech recognition error: ${event.error}`
      onError?.(reason)
    }

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }, [onResult, onError, supported, startVisualizer, stopVisualizer])

  // Use startFromClick instead of start in the parent component
  const start = startFromClick

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
    stopVisualizer()
  }, [stopVisualizer])

  return { listening, supported, levels, start, stop }
}