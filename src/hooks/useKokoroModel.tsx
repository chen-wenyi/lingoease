import { KokoroTTS } from 'kokoro-js';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export function useKokoroModel() {
  const [model, setModel] = useState<KokoroTTS | null>(null);
  const isMountedRef = useRef(false);
  const modelRef = useRef<KokoroTTS | null>(null);
  const loadPromiseRef = useRef<Promise<KokoroTTS> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    // If already available, sync state
    if (modelRef.current) {
      setModel(modelRef.current);
      return () => {
        isMountedRef.current = false;
      };
    }

    // Start loading once; reuse in-flight promise on re-runs (e.g., StrictMode)
    if (!loadPromiseRef.current) {
      const model_id = 'onnx-community/Kokoro-82M-v1.0-ONNX';
      const startTime = Date.now();
      console.log('Loading model...');
      loadPromiseRef.current = KokoroTTS.from_pretrained(model_id, {
        dtype: 'fp32',
        device: 'webgpu',
      })
        .then((tts) => {
          const endTime = Date.now();
          console.log(
            `Model loaded in ${(endTime - startTime) / 1000} seconds`
          );
          modelRef.current = tts;
          if (isMountedRef.current) setModel(tts);
          return tts;
        })
        .catch((err) => {
          console.error('Failed to load Kokoro model:', err);
          toast.error('Failed to load Kokoro model. See console for details.');
          loadPromiseRef.current = null; // allow retry
          throw err;
        });
    } else {
      loadPromiseRef.current
        .then((tts) => {
          if (isMountedRef.current) setModel(tts);
        })
        .catch(() => {
          // already logged above
        });
    }

    return () => {
      isMountedRef.current = false;
    };
  }, []);
  return model;
}
