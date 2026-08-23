/**
 * useMediaPermissions — shared hook for camera & microphone permission requests.
 *
 * Returns:
 *   cameraStream / micStream — active MediaStream (or null)
 *   cameraStatus / micStatus — 'idle' | 'requesting' | 'granted' | 'denied' | 'error'
 *   requestCamera() / requestMic() — functions to trigger permission prompts
 *   stopCamera() / stopMic() — cleanup functions
 */
import { useState, useRef, useCallback } from 'react';

export function useCamera() {
  const [stream, setStream]  = useState(null);
  const [status, setStatus]  = useState('idle');   // idle | requesting | granted | denied | error
  const [error, setError]    = useState(null);
  const streamRef = useRef(null);

  const request = useCallback(async (constraints = { video: { facingMode: 'user', width: 640, height: 480 }, audio: false }) => {
    if (streamRef.current) return streamRef.current;

    setStatus('requesting');
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = s;
      setStream(s);
      setStatus('granted');
      return s;
    } catch (err) {
      console.error('[Camera] Permission error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setStatus('denied');
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setStatus('error');
        setError('No camera found. Please connect a camera and try again.');
      } else {
        setStatus('error');
        setError(err.message || 'Could not access camera.');
      }
      return null;
    }
  }, []);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setStream(null);
      setStatus('idle');
    }
  }, []);

  return { stream, status, error, request, stop };
}

export function useMicrophone() {
  const [stream, setStream]  = useState(null);
  const [status, setStatus]  = useState('idle');
  const [error, setError]    = useState(null);
  const streamRef = useRef(null);

  const request = useCallback(async () => {
    if (streamRef.current) return streamRef.current;

    setStatus('requesting');
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = s;
      setStream(s);
      setStatus('granted');
      return s;
    } catch (err) {
      console.error('[Microphone] Permission error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setStatus('denied');
        setError('Microphone permission denied. Please allow mic access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setStatus('error');
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setStatus('error');
        setError(err.message || 'Could not access microphone.');
      }
      return null;
    }
  }, []);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setStream(null);
      setStatus('idle');
    }
  }, []);

  return { stream, status, error, request, stop };
}
